"""
tests/test_customer_segmentation.py
-----------------------------------
Unit test suite for Machine Learning Customer Segmentation module.
"""

import unittest
import pandas as pd
from src.modules.data_loader import load_sales_data
from src.modules.customer_segmentation import (
    build_customer_features,
    fit_kmeans_segmentation,
)


class TestCustomerSegmentation(unittest.TestCase):
    """Test suite for K-Means Customer Segmentation."""

    @classmethod
    def setUpClass(cls):
        cls.df, _ = load_sales_data("data/sales.csv")

    def test_build_customer_features(self):
        """Verify feature matrix extraction."""
        cust_features = build_customer_features(self.df)
        self.assertIsInstance(cust_features, pd.DataFrame)
        self.assertFalse(cust_features.empty)
        
        expected_cols = [
            "Customer_ID",
            "Customer_Name",
            "Total_Spending",
            "Total_Profit",
            "Order_Count",
            "Avg_Order_Value",
            "Recency_Days",
        ]
        for col in expected_cols:
            self.assertIn(col, cust_features.columns)

    def test_fit_kmeans_segmentation(self):
        """Verify K-Means clustering model training & segment assignment."""
        segmented_df, metrics = fit_kmeans_segmentation(self.df, n_clusters=3)

        self.assertIsInstance(segmented_df, pd.DataFrame)
        self.assertIn("Segment", segmented_df.columns)
        self.assertIn("Raw_Cluster", segmented_df.columns)

        self.assertIn("n_clusters", metrics)
        self.assertEqual(metrics["n_clusters"], 3)
        self.assertIn("silhouette_score", metrics)
        self.assertGreaterEqual(metrics["silhouette_score"], -1.0)
        self.assertLessEqual(metrics["silhouette_score"], 1.0)

        # Check unique assigned segments
        unique_segments = segmented_df["Segment"].nunique()
        self.assertLessEqual(unique_segments, 3)


if __name__ == "__main__":
    unittest.main()
