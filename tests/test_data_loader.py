"""
tests/test_data_loader.py
--------------------------
Unit tests for verifying data loading, missing value handling, date parsing,
and schema validation in src/modules/data_loader.py.
"""

import os
import unittest
import pandas as pd
from src.modules.data_loader import DataLoader, load_sales_data, REQUIRED_COLUMNS


class TestDataLoader(unittest.TestCase):
    """Test suite for DataLoader class."""

    def setUp(self):
        self.csv_path = "data/sales.csv"

    def test_file_existence(self):
        """Verify that data/sales.csv file exists."""
        self.assertTrue(os.path.exists(self.csv_path), "data/sales.csv should exist!")

    def test_load_sales_data_structure(self):
        """Verify cleaned dataframe shape, columns, and data types."""
        df, audit = load_sales_data(self.csv_path)

        # Check return types
        self.assertIsInstance(df, pd.DataFrame)
        self.assertIsInstance(audit, dict)

        # Check non-empty
        self.assertFalse(df.empty, "Cleaned dataframe should not be empty")
        self.assertGreater(len(df), 0)

        # Check required columns
        for col in REQUIRED_COLUMNS:
            self.assertIn(col, df.columns, f"Column '{col}' missing from cleaned dataframe!")

    def test_missing_values_imputed(self):
        """Verify that no missing values remain in essential columns."""
        df, audit = load_sales_data(self.csv_path)

        self.assertEqual(df["Customer_Name"].isnull().sum(), 0, "Missing Customer_Name should be imputed!")
        self.assertEqual(df["Discount"].isnull().sum(), 0, "Missing Discount should be imputed!")
        self.assertEqual(df["Sales"].isnull().sum(), 0, "Missing Sales should be imputed!")
        self.assertEqual(df["Profit"].isnull().sum(), 0, "Missing Profit should be imputed!")

    def test_datetime_conversion(self):
        """Verify Order_Date column is converted to datetime64[ns]."""
        df, _ = load_sales_data(self.csv_path)

        self.assertTrue(
            pd.api.types.is_datetime64_any_dtype(df["Order_Date"]),
            "Order_Date must be parsed into pandas datetime type!"
        )

    def test_summary_statistics_calculated(self):
        """Verify audit dictionary contains correct summary metrics."""
        _, audit = load_sales_data(self.csv_path)

        self.assertIn("summary_stats", audit)
        stats = audit["summary_stats"]

        self.assertGreater(stats["total_sales"], 0)
        self.assertGreater(stats["total_orders"], 0)
        self.assertGreater(stats["unique_customers"], 0)


if __name__ == "__main__":
    unittest.main()
