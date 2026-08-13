"""
src/modules/etl_pipeline.py
---------------------------
Modular ETL (Extract, Validate, Clean, Transform, Load) Pipeline Engine for DataPulse.
Supports CSV & Excel file ingestion, stage-by-stage data transformation,
relational database persistence, and pipeline execution monitoring metadata.
"""

import time
import io
import pandas as pd
import numpy as np
from datetime import datetime
from src.modules.data_loader import load_sales_data, validate_sales_schema, preprocess_sales_data
from src.modules.data_quality import compute_data_quality
from src.modules.db_connector import get_db_connector, DatabaseConnector


class ETLPipeline:
    """Modular ETL Pipeline class executing stage-by-stage data engineering operations."""

    def __init__(self, db_connector: DatabaseConnector = None):
        self.db = db_connector if db_connector else get_db_connector()
        self.execution_logs = []

    def extract(self, file_source, filename: str = "sales.csv") -> pd.DataFrame:
        """Stage 1: Extract data from CSV or Excel file sources."""
        start_t = time.time()

        if isinstance(file_source, str):
            if file_source.endswith(".csv"):
                df = pd.read_csv(file_source)
            elif file_source.endswith((".xls", ".xlsx")):
                df = pd.read_excel(file_source)
            else:
                raise ValueError(f"Unsupported file format: {file_source}")
        elif isinstance(file_source, (bytes, io.BytesIO)):
            if filename.endswith(".csv"):
                df = pd.read_csv(io.BytesIO(file_source) if isinstance(file_source, bytes) else file_source)
            elif filename.endswith((".xls", ".xlsx")):
                df = pd.read_excel(io.BytesIO(file_source) if isinstance(file_source, bytes) else file_source)
            else:
                raise ValueError(f"Unsupported file format: {filename}")
        elif isinstance(file_source, pd.DataFrame):
            df = file_source.copy()
        else:
            raise ValueError("Invalid file_source provided to ETL Pipeline.")

        dur = round((time.time() - start_t) * 1000, 2)
        self.execution_logs.append({
            "stage": "1. Extract",
            "status": "Completed",
            "message": f"Successfully extracted {len(df)} rows from {filename}.",
            "duration_ms": dur,
        })
        return df

    def validate(self, df: pd.DataFrame) -> dict:
        """Stage 2: Validate dataset schema columns and essential data types."""
        start_t = time.time()
        required_cols = [
            "Order_ID", "Order_Date", "Customer_ID", "Customer_Name",
            "Product", "Category", "Region", "Quantity", "Sales", "Discount", "Profit"
        ]
        missing_cols = [c for c in required_cols if c not in df.columns]

        is_valid = len(missing_cols) == 0
        dur = round((time.time() - start_t) * 1000, 2)

        self.execution_logs.append({
            "stage": "2. Validate",
            "status": "Completed" if is_valid else "Failed",
            "message": "Schema columns verified successfully." if is_valid else f"Missing required columns: {missing_cols}",
            "duration_ms": dur,
        })
        return {"is_valid": is_valid, "missing_cols": missing_cols}

    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stage 3: Data Cleaning (deduplication, date parsing, missing value imputation)."""
        start_t = time.time()
        initial_count = len(df)

        cleaned_df = preprocess_sales_data(df)
        final_count = len(cleaned_df)
        removed_duplicates = initial_count - final_count

        dur = round((time.time() - start_t) * 1000, 2)
        self.execution_logs.append({
            "stage": "3. Clean",
            "status": "Completed",
            "message": f"Cleaned dataset: Imputed missing values and removed {removed_duplicates} duplicates.",
            "duration_ms": dur,
        })
        return cleaned_df

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Stage 4: Feature Transformation & Analytical Field Calculation."""
        start_t = time.time()
        trans_df = df.copy()

        # Calculate Profit Margin % and Monetary Spending Metrics
        trans_df["Profit_Margin_%"] = np.where(
            trans_df["Sales"] > 0, np.round((trans_df["Profit"] / trans_df["Sales"]) * 100, 2), 0.0
        )
        trans_df["YearMonth"] = trans_df["Order_Date"].dt.strftime("%Y-%m")

        dur = round((time.time() - start_t) * 1000, 2)
        self.execution_logs.append({
            "stage": "4. Transform",
            "status": "Completed",
            "message": f"Transformed features and calculated profit margins for {len(trans_df)} records.",
            "duration_ms": dur,
        })
        return trans_df

    def load(self, df: pd.DataFrame) -> dict:
        """Stage 5: Load structured data into Relational 3NF Database tables."""
        start_t = time.time()

        # Insert into customers, products, and orders relational tables
        load_summary = self._migrate_to_relational_db(df)

        dur = round((time.time() - start_t) * 1000, 2)
        self.execution_logs.append({
            "stage": "5. Load",
            "status": "Completed",
            "message": f"Persisted into 3NF database: {load_summary.get('orders_inserted', 0)} orders inserted.",
            "duration_ms": dur,
        })
        return load_summary

    def _migrate_to_relational_db(self, df: pd.DataFrame) -> dict:
        """Internal helper for migrating DataPulse DataFrames to relational SQL tables."""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            # 1. Customers
            cust_df = df[["Customer_ID", "Customer_Name"]].drop_duplicates().dropna()
            for _, row in cust_df.iterrows():
                query = """
                    INSERT INTO customers (customer_id, customer_name)
                    VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE customer_name = VALUES(customer_name);
                """ if self.db.db_type == "mysql" else """
                    INSERT INTO customers (customer_id, customer_name)
                    VALUES (?, ?)
                    ON CONFLICT(customer_id) DO UPDATE SET customer_name = excluded.customer_name;
                """
                cursor.execute(query, (row["Customer_ID"], row["Customer_Name"]))

            # 2. Products
            prod_df = df[["Product", "Category"]].drop_duplicates().dropna()
            for _, row in prod_df.iterrows():
                query = """
                    INSERT INTO products (product_name, category)
                    VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE category = VALUES(category);
                """ if self.db.db_type == "mysql" else """
                    INSERT INTO products (product_name, category)
                    VALUES (?, ?)
                    ON CONFLICT(product_name) DO UPDATE SET category = excluded.category;
                """
                cursor.execute(query, (row["Product"], row["Category"]))

            # 3. Orders Map
            prod_map_query = "SELECT product_id, product_name FROM products;"
            cursor.execute(prod_map_query)
            prod_map = {name: pid for pid, name in cursor.fetchall()}

            orders_inserted = 0
            for _, row in df.iterrows():
                pid = prod_map.get(row["Product"])
                if not pid:
                    continue

                order_date_str = row["Order_Date"].strftime("%Y-%m-%d") if isinstance(row["Order_Date"], pd.Timestamp) else str(row["Order_Date"])

                query = """
                    INSERT INTO orders (order_id, order_date, customer_id, product_id, region, quantity, sales, discount, profit)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        order_date=VALUES(order_date),
                        region=VALUES(region),
                        quantity=VALUES(quantity),
                        sales=VALUES(sales),
                        discount=VALUES(discount),
                        profit=VALUES(profit);
                """ if self.db.db_type == "mysql" else """
                    INSERT INTO orders (order_id, order_date, customer_id, product_id, region, quantity, sales, discount, profit)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(order_id) DO UPDATE SET
                        order_date=excluded.order_date,
                        region=excluded.region,
                        quantity=excluded.quantity,
                        sales=excluded.sales,
                        discount=excluded.discount,
                        profit=excluded.profit;
                """
                cursor.execute(
                    query,
                    (
                        row["Order_ID"],
                        order_date_str,
                        row["Customer_ID"],
                        pid,
                        row["Region"],
                        int(row["Quantity"]),
                        float(row["Sales"]),
                        float(row["Discount"]),
                        float(row["Profit"]),
                    ),
                )
                orders_inserted += 1

            conn.commit()
            return {"customers_inserted": len(cust_df), "products_inserted": len(prod_df), "orders_inserted": orders_inserted}

        finally:
            cursor.close()
            conn.close()

    def run_full_etl(self, file_source, filename: str = "sales.csv") -> dict:
        """Executes the complete 5-stage ETL pipeline and returns execution metadata & Quality Report."""
        start_pipeline = time.time()
        self.execution_logs = []

        # 1. Extract
        raw_df = self.extract(file_source, filename)
        rows_received = len(raw_df)

        # 2. Validate
        val_res = self.validate(raw_df)
        if not val_res["is_valid"]:
            return {
                "success": False,
                "error": f"Schema validation failed. Missing required columns: {val_res['missing_cols']}",
                "execution_logs": self.execution_logs,
            }

        # Compute Quality Report before cleaning
        quality_report = compute_data_quality(raw_df, filename)

        # 3. Clean
        cleaned_df = self.clean(raw_df)
        rows_cleaned = len(cleaned_df)

        # 4. Transform
        trans_df = self.transform(cleaned_df)

        # 5. Load
        load_summary = self.load(trans_df)

        total_duration = round((time.time() - start_pipeline) * 1000, 2)

        return {
            "success": True,
            "filename": filename,
            "rows_received": rows_received,
            "rows_cleaned": rows_cleaned,
            "total_duration_ms": total_duration,
            "quality_report": quality_report,
            "load_summary": load_summary,
            "execution_logs": self.execution_logs,
        }
