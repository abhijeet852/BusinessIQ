"""
tests/test_churn_prediction.py
-------------------------------
Unit test suite for Machine Learning Customer Churn Prediction module.
"""

import unittest
import pandas as pd
from src.modules.data_loader import load_sales_data
from src.modules.churn_prediction import (
    build_churn_features,
    train_churn_model,
)


class TestChurnPrediction(unittest.TestCase):
    """Test suite for Logistic Regression Customer Churn Prediction."""

    @classmethod
    def setUpClass(cls):
        cls.df, _ = load_sales_data("data/sales.csv")

    def test_build_churn_features(self):
        """Verify feature extraction and target binary label creation."""
        churn_df = build_churn_features(self.df, recency_threshold_days=90)

        self.assertIsInstance(churn_df, pd.DataFrame)
        self.assertFalse(churn_df.empty)

        expected_cols = [
            "Customer_ID",
            "Customer_Name",
            "Recency_Days",
            "Order_Count",
            "Total_Spending",
            "Avg_Order_Value",
            "Avg_Profit_Margin",
            "Churn",
        ]
        for col in expected_cols:
            self.assertIn(col, churn_df.columns)

        # Churn should be binary (0 or 1)
        self.assertTrue(set(churn_df["Churn"].unique()).issubset({0, 1}))

    def test_train_churn_model(self):
        """Verify Logistic Regression training, probability prediction, and metrics calculation."""
        churn_results, metrics = train_churn_model(self.df, recency_threshold_days=90)

        self.assertIsInstance(churn_results, pd.DataFrame)
        self.assertIn("Churn_Probability", churn_results.columns)
        self.assertIn("Risk_Level", churn_results.columns)

        # Check risk level labels
        allowed_risks = {"🟢 Low Risk", "🟡 Medium Risk", "🔴 High Risk"}
        self.assertTrue(set(churn_results["Risk_Level"].unique()).issubset(allowed_risks))

        # Check metrics dict
        self.assertIn("accuracy", metrics)
        self.assertIn("precision", metrics)
        self.assertIn("recall", metrics)
        self.assertIn("f1_score", metrics)
        self.assertIn("confusion_matrix", metrics)

        self.assertGreaterEqual(metrics["accuracy"], 0.0)
        self.assertLessEqual(metrics["accuracy"], 1.0)


if __name__ == "__main__":
    unittest.main()
