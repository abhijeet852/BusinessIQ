"""
scripts/migrate_csv_to_db.py
----------------------------
ETL CSV-to-Database Migration Script for Business Analytics Platform.

1. Reads raw/cleaned sales CSV dataset using data_loader module.
2. Initializes normalized 3NF schema tables (customers, products, orders).
3. Migrates records using parameterized SQL statements into relational database.
"""

import sys
import os

# Add root directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.modules.data_loader import load_sales_data
from src.modules.db_connector import get_db_connector


def migrate_csv_to_database(csv_path: str = "data/sales.csv", db_type: str = "sqlite") -> dict:
    """
    Executes full ETL migration from CSV into relational database tables.
    """
    print(f"[ETL] Step 1: Loading & cleaning CSV data from {csv_path}...")
    df, audit = load_sales_data(csv_path)

    print(f"[ETL] Step 2: Initializing {db_type.upper()} database schema...")
    db_mgr = get_db_connector(db_type=db_type)
    db_mgr.create_tables()

    conn = db_mgr.get_connection()
    cursor = conn.cursor()

    # Determine query parameter placeholder style (? for sqlite, %s for mysql)
    placeholder = "%s" if db_type == "mysql" and hasattr(conn, "cmd_query") else "?"

    # 1. Populate `customers` table
    print("[ETL] Step 3: Migrating Customers...")
    unique_cust = df[["Customer_ID", "Customer_Name"]].drop_duplicates(subset=["Customer_ID"])
    cust_records = [(row["Customer_ID"], row["Customer_Name"]) for _, row in unique_cust.iterrows()]

    cust_sql = f"""
    INSERT INTO customers (customer_id, customer_name)
    VALUES ({placeholder}, {placeholder})
    ON CONFLICT(customer_id) DO UPDATE SET customer_name=EXCLUDED.customer_name;
    """ if db_type == "sqlite" else f"""
    INSERT INTO customers (customer_id, customer_name)
    VALUES ({placeholder}, {placeholder})
    ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name);
    """

    cursor.executemany(cust_sql, cust_records)
    conn.commit()

    # 2. Populate `products` table
    print("[ETL] Step 4: Migrating Products...")
    unique_prod = df[["Product", "Category"]].drop_duplicates(subset=["Product"])
    prod_records = [(row["Product"], row["Category"]) for _, row in unique_prod.iterrows()]

    prod_sql = f"""
    INSERT INTO products (product_name, category)
    VALUES ({placeholder}, {placeholder})
    ON CONFLICT(product_name) DO UPDATE SET category=EXCLUDED.category;
    """ if db_type == "sqlite" else f"""
    INSERT INTO products (product_name, category)
    VALUES ({placeholder}, {placeholder})
    ON DUPLICATE KEY UPDATE category=VALUES(category);
    """

    cursor.executemany(prod_sql, prod_records)
    conn.commit()

    # Create in-memory product_name -> product_id lookup dictionary
    cursor.execute("SELECT product_name, product_id FROM products;")
    prod_lookup = {row[0]: row[1] for row in cursor.fetchall()}

    # 3. Populate `orders` table
    print("[ETL] Step 5: Migrating Orders with Foreign Key mapping...")
    order_records = []
    for _, row in df.iterrows():
        order_date_str = row["Order_Date"].strftime("%Y-%m-%d")
        product_id = prod_lookup[row["Product"]]
        order_records.append(
            (
                row["Order_ID"],
                order_date_str,
                row["Customer_ID"],
                product_id,
                row["Region"],
                int(row["Quantity"]),
                float(row["Sales"]),
                float(row["Discount"]),
                float(row["Profit"]),
            )
        )

    orders_sql = f"""
    INSERT INTO orders (order_id, order_date, customer_id, product_id, region, quantity, sales, discount, profit)
    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
    ON CONFLICT(order_id) DO UPDATE SET
        order_date=EXCLUDED.order_date,
        customer_id=EXCLUDED.customer_id,
        product_id=EXCLUDED.product_id,
        region=EXCLUDED.region,
        quantity=EXCLUDED.quantity,
        sales=EXCLUDED.sales,
        discount=EXCLUDED.discount,
        profit=EXCLUDED.profit;
    """ if db_type == "sqlite" else f"""
    INSERT INTO orders (order_id, order_date, customer_id, product_id, region, quantity, sales, discount, profit)
    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
    ON DUPLICATE KEY UPDATE
        order_date=VALUES(order_date),
        customer_id=VALUES(customer_id),
        product_id=VALUES(product_id),
        region=VALUES(region),
        quantity=VALUES(quantity),
        sales=VALUES(sales),
        discount=VALUES(discount),
        profit=VALUES(profit);
    """

    cursor.executemany(orders_sql, order_records)
    conn.commit()
    conn.close()

    summary = {
        "customers_inserted": len(cust_records),
        "products_inserted": len(prod_records),
        "orders_inserted": len(order_records),
    }

    print(f"[ETL Success] Migration completed! {summary}")
    return summary


if __name__ == "__main__":
    migrate_csv_to_database()
