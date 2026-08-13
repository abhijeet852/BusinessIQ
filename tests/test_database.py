"""
tests/test_database.py
-----------------------
Unit test suite for Database Connector, Migration Script, and SQL Analytics module.
"""

import os
import unittest
import sqlite3
import pandas as pd

from src.modules.db_connector import get_db_connector
from scripts.migrate_csv_to_db import migrate_csv_to_database
from src.modules.db_analytics import (
    get_db_total_sales,
    get_db_total_profit,
    get_db_total_orders,
    get_db_customer_count,
    get_db_average_order_value,
    get_db_sales_by_month,
    get_db_sales_by_product,
    get_db_sales_by_category,
    get_db_sales_by_region,
    get_db_top_customers,
)


class TestDatabaseModule(unittest.TestCase):
    """Test suite for Relational Database & SQL Analytics."""

    @classmethod
    def setUpClass(cls):
        cls.db_path = "data/business_analytics.db"
        # Run migration to populate test database
        cls.summary = migrate_csv_to_database(csv_path="data/sales.csv", db_type="sqlite")
        cls.db_mgr = get_db_connector(db_type="sqlite")

    def test_database_file_created(self):
        """Verify that relational database file exists."""
        self.assertTrue(os.path.exists(self.db_path), "Database file should exist!")

    def test_tables_populated(self):
        """Verify customers, products, and orders tables are populated."""
        conn = self.db_mgr.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM customers;")
        cust_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM products;")
        prod_count = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM orders;")
        order_count = cursor.fetchone()[0]

        conn.close()

        self.assertGreater(cust_count, 0)
        self.assertGreater(prod_count, 0)
        self.assertGreater(order_count, 0)

    def test_sql_analytics_total_sales(self):
        """Test SQL parameterized total sales query."""
        conn = self.db_mgr.get_connection()
        total_sales = get_db_total_sales(conn)
        conn.close()

        self.assertIsInstance(total_sales, float)
        self.assertGreater(total_sales, 0)

    def test_sql_analytics_top_customers(self):
        """Test SQL parameterized top customers JOIN query."""
        conn = self.db_mgr.get_connection()
        top_cust = get_db_top_customers(conn, n=5)
        conn.close()

        self.assertIsInstance(top_cust, pd.DataFrame)
        self.assertLessEqual(len(top_cust), 5)
        self.assertIn("Customer_Name", top_cust.columns)
        self.assertIn("Total_Sales", top_cust.columns)

    def test_sql_analytics_sales_by_month(self):
        """Test SQL parameterized monthly trend query."""
        conn = self.db_mgr.get_connection()
        monthly = get_db_sales_by_month(conn)
        conn.close()

        self.assertIsInstance(monthly, pd.DataFrame)
        self.assertIn("YearMonth", monthly.columns)
        self.assertIn("Sales", monthly.columns)


if __name__ == "__main__":
    unittest.main()
