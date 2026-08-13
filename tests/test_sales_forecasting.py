"""
tests/test_sales_forecasting.py
--------------------------------
Unit test suite for Sales Forecasting module.
"""

import unittest
import pandas as pd
from src.modules.data_loader import load_sales_data
from src.modules.sales_forecasting import (
    aggregate_monthly_sales,
    fit_sales_forecast,
)


class TestSalesForecasting(unittest.TestCase):
    """Test suite for Linear Regression Sales Forecasting."""

    @classmethod
    def setUpClass(cls):
        cls.df, _ = load_sales_data("data/sales.csv")

    def test_aggregate_monthly_sales(self):
        """Verify monthly aggregation time series."""
        monthly_df = aggregate_monthly_sales(self.df)

        self.assertIsInstance(monthly_df, pd.DataFrame)
        self.assertFalse(monthly_df.empty)

        expected_cols = ["YearMonth", "Month_Index", "Actual_Sales", "Actual_Profit"]
        for col in expected_cols:
            self.assertIn(col, monthly_df.columns)

        # Month indices should be 1, 2, ..., N
        self.assertEqual(list(monthly_df["Month_Index"]), list(range(1, len(monthly_df) + 1)))

    def test_fit_sales_forecast(self):
        """Verify Linear Regression trend model training & future projections."""
        combined_df, metrics = fit_sales_forecast(self.df, forecast_months=3)

        self.assertIsInstance(combined_df, pd.DataFrame)
        self.assertIn("Forecast_Sales", combined_df.columns)
        self.assertIn("Type", combined_df.columns)

        # Check metrics dict
        self.assertIn("mae", metrics)
        self.assertIn("rmse", metrics)
        self.assertIn("r2_score", metrics)
        self.assertIn("monthly_growth_rate", metrics)

        self.assertGreaterEqual(metrics["mae"], 0.0)
        self.assertGreaterEqual(metrics["rmse"], 0.0)

        # Check future forecast rows count
        forecast_rows = combined_df[combined_df["Type"] == "Forecast"]
        self.assertEqual(len(forecast_rows), 3)


if __name__ == "__main__":
    unittest.main()
