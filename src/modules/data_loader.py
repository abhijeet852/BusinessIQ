"""
src/modules/data_loader.py
--------------------------
Data Loading & Preprocessing Module for Business Analytics Platform.

This module is responsible for:
1. Loading raw CSV sales dataset using Pandas.
2. Validating schema (ensuring all expected columns exist).
3. Data Cleaning & Missing Value Imputation:
   - Filling missing Customer Names with 'Unknown Customer'
   - Imputing missing numeric fields (e.g. Discount) with default/median values.
4. DateTime conversion:
   - Converting 'Order_Date' strings to pandas datetime64 format.
5. Computing basic summary statistics and generating a preprocessing audit report.
"""

import os
from typing import Tuple, Dict, Any
import pandas as pd
import numpy as np

REQUIRED_COLUMNS = [
    "Order_ID",
    "Order_Date",
    "Customer_ID",
    "Customer_Name",
    "Product",
    "Category",
    "Region",
    "Quantity",
    "Sales",
    "Discount",
    "Profit",
]


class DataLoader:
    """
    Handles robust loading, validation, and preprocessing of sales dataset.
    """

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.raw_df: pd.DataFrame = pd.DataFrame()
        self.cleaned_df: pd.DataFrame = pd.DataFrame()
        self.preprocessing_audit: Dict[str, Any] = {}

    def load_and_preprocess(self) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Executes the full data loading and cleaning pipeline.

        Returns:
            Tuple[pd.DataFrame, Dict[str, Any]]:
                - cleaned_df: Sanitized Pandas DataFrame ready for analysis.
                - audit: Summary report of raw vs cleaned shapes, missing values, and KPIs.
        """
        # Step 1: File Existence & Basic Read
        if not os.path.exists(self.filepath):
            raise FileNotFoundError(f"Dataset not found at filepath: {self.filepath}")

        self.raw_df = pd.read_csv(self.filepath)

        if self.raw_df.empty:
            raise ValueError(f"The dataset at {self.filepath} is empty!")

        # Step 2: Validate Schema (Required Columns)
        missing_cols = [col for col in REQUIRED_COLUMNS if col not in self.raw_df.columns]
        if missing_cols:
            raise KeyError(f"Missing required columns in dataset: {missing_cols}")

        df = self.raw_df.copy()
        audit_log = {
            "initial_rows": len(df),
            "initial_cols": len(df.columns),
            "missing_before": df.isnull().sum().to_dict(),
        }

        # Step 3: Handle Missing Values
        # Categorical columns: fill missing Customer_Name with 'Unknown Customer'
        if df["Customer_Name"].isnull().sum() > 0:
            df["Customer_Name"] = df["Customer_Name"].fillna("Unknown Customer")

        # Numerical columns: fill missing Discount with 0.0
        if df["Discount"].isnull().sum() > 0:
            df["Discount"] = df["Discount"].fillna(0.0)

        # Quantity, Sales, Profit: ensure numeric types and handle any unexpected NaN
        for col in ["Quantity", "Sales", "Discount", "Profit"]:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # Fill any remaining NaNs in Sales/Profit with 0.0 or column median
        if df["Sales"].isnull().sum() > 0:
            df["Sales"] = df["Sales"].fillna(df["Sales"].median())
        if df["Profit"].isnull().sum() > 0:
            df["Profit"] = df["Profit"].fillna(df["Profit"].median())
        if df["Quantity"].isnull().sum() > 0:
            df["Quantity"] = df["Quantity"].fillna(1).astype(int)

        # Step 4: Convert Order_Date to pandas datetime64
        # Using pd.to_datetime with errors='coerce' to safely parse multiple date formats
        df["Order_Date"] = pd.to_datetime(df["Order_Date"], errors="coerce")

        # Drop rows where Order_Date could not be parsed (invalid dates)
        invalid_dates = df["Order_Date"].isnull().sum()
        if invalid_dates > 0:
            df = df.dropna(subset=["Order_Date"])

        # Sort chronologically by Order_Date
        df = df.sort_values("Order_Date").reset_index(drop=True)

        # Step 5: Compute Derived Analytics Metrics
        # Net Sales / Profit Margin (%)
        df["Profit_Margin_%"] = np.where(
            df["Sales"] > 0, np.round((df["Profit"] / df["Sales"]) * 100, 2), 0.0
        )

        self.cleaned_df = df

        # Step 6: Generate Summary Audit Report
        audit_log.update({
            "cleaned_rows": len(df),
            "cleaned_cols": len(df.columns),
            "missing_after": df.isnull().sum().to_dict(),
            "invalid_dates_dropped": int(invalid_dates),
            "date_range": {
                "start": df["Order_Date"].min().strftime("%Y-%m-%d"),
                "end": df["Order_Date"].max().strftime("%Y-%m-%d"),
            },
            "summary_stats": {
                "total_sales": float(df["Sales"].sum()),
                "total_profit": float(df["Profit"].sum()),
                "total_orders": int(len(df)),
                "unique_customers": int(df["Customer_ID"].nunique()),
                "avg_order_value": float(df["Sales"].mean()),
                "avg_profit_margin": float(df["Profit_Margin_%"].mean()),
            },
        })

        self.preprocessing_audit = audit_log
        return self.cleaned_df, self.preprocessing_audit


def load_sales_data(filepath: str = "data/sales.csv") -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Convenience helper function to instantiate DataLoader and process sales dataset.
    """
    loader = DataLoader(filepath=filepath)
    return loader.load_and_preprocess()


def validate_sales_schema(df: pd.DataFrame) -> dict:
    """Validates presence of REQUIRED_COLUMNS."""
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    return {"is_valid": len(missing_cols) == 0, "missing_cols": missing_cols}


def preprocess_sales_data(df: pd.DataFrame) -> pd.DataFrame:
    """Preprocesses and cleans a sales DataFrame in-memory."""
    if df.empty:
        return pd.DataFrame(columns=REQUIRED_COLUMNS)

    clean_df = df.copy()

    # Drop exact duplicate rows
    clean_df = clean_df.drop_duplicates().reset_index(drop=True)

    if "Customer_Name" in clean_df.columns:
        clean_df["Customer_Name"] = clean_df["Customer_Name"].fillna("Unknown Customer")

    if "Discount" in clean_df.columns:
        clean_df["Discount"] = pd.to_numeric(clean_df["Discount"], errors="coerce").fillna(0.0)

    for col in ["Quantity", "Sales", "Profit"]:
        if col in clean_df.columns:
            clean_df[col] = pd.to_numeric(clean_df[col], errors="coerce")

    if "Sales" in clean_df.columns:
        clean_df["Sales"] = clean_df["Sales"].fillna(clean_df["Sales"].median())
    if "Profit" in clean_df.columns:
        clean_df["Profit"] = clean_df["Profit"].fillna(clean_df["Profit"].median())
    if "Quantity" in clean_df.columns:
        clean_df["Quantity"] = clean_df["Quantity"].fillna(1).astype(int)

    if "Order_Date" in clean_df.columns:
        clean_df["Order_Date"] = pd.to_datetime(clean_df["Order_Date"], errors="coerce")
        clean_df = clean_df.dropna(subset=["Order_Date"])
        clean_df = clean_df.sort_values("Order_Date").reset_index(drop=True)

    return clean_df

