"""
tests/test_datapulse.py
------------------------
Unit test suite for DataPulse platform additions:
- ETL Pipeline (Extract, Validate, Clean, Transform, Load)
- Data Quality Engine (0-100 score & audit trail)
- Data Lineage & Pipeline Status Monitoring
- Business Health Score calculation
- Business Alerts anomaly detection
- Profitability Matrix (2x2)
- Churn Model Comparison
- Customer 360 View & Actionable Business Recommendations
"""

import unittest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from src.modules.data_quality import compute_data_quality
from src.modules.etl_pipeline import ETLPipeline
from src.modules.pipeline_monitor import get_data_lineage, get_pipeline_status
from src.modules.analytics import calculate_business_health_score, generate_business_alerts, get_profitability_matrix
from src.modules.churn_prediction import compare_churn_models, get_customer_360_view


class TestDataPulsePlatform(unittest.TestCase):

    def setUp(self):
        """Build sample DataFrame for testing."""
        dates = [datetime(2025, 1, 1) + timedelta(days=i * 10) for i in range(9)] + [datetime(2024, 1, 1)]
        self.sample_df = pd.DataFrame({
            "Order_ID": [f"ORD-{100+i}" for i in range(10)],
            "Order_Date": dates,
            "Customer_ID": ["CUST-001", "CUST-002", "CUST-003", "CUST-001", "CUST-002", "CUST-003", "CUST-001", "CUST-002", "CUST-003", "CUST-004"],
            "Customer_Name": ["Customer 1", "Customer 2", "Customer 3", "Customer 1", "Customer 2", "Customer 3", "Customer 1", "Customer 2", "Customer 3", "Customer 4"],
            "Product": ["Laptop Pro 15", "Standing Desk", "Executive Sofa", "Cabinet", "4K Monitor"] * 2,
            "Category": ["Technology", "Furniture", "Furniture", "Furniture", "Technology"] * 2,
            "Region": ["North", "West", "South", "East", "North"] * 2,
            "Quantity": [1, 2, 1, 3, 2, 1, 2, 1, 3, 2],
            "Sales": [85000.0, 28000.0, 45000.0, 15000.0, 24000.0, 85000.0, 28000.0, 45000.0, 15000.0, 24000.0],
            "Discount": [0.0, 0.05, 0.0, 0.1, 0.0] * 2,
            "Profit": [20000.0, 7000.0, 9000.0, 3000.0, 5000.0, 20000.0, 7000.0, 9000.0, 3000.0, 5000.0],
        })

    def test_data_quality_computation(self):
        """Test Data Quality score formula (0-100) and audit generation."""
        res = compute_data_quality(self.sample_df, filename="test_sales.csv")
        self.assertIn("quality_score", res)
        self.assertGreaterEqual(res["quality_score"], 0)
        self.assertLessEqual(res["quality_score"], 100)
        self.assertEqual(res["total_rows"], 10)
        self.assertIsInstance(res["transformations_applied"], list)

    def test_etl_pipeline_flow(self):
        """Test full 5-stage ETL Pipeline execution."""
        pipeline = ETLPipeline()
        res = pipeline.run_full_etl(self.sample_df, filename="test_run.csv")
        self.assertTrue(res["success"])
        self.assertEqual(res["rows_received"], 10)
        self.assertIn("quality_report", res)
        self.assertIn("execution_logs", res)
        self.assertEqual(len(res["execution_logs"]), 5)  # 5 stages

    def test_pipeline_monitor(self):
        """Test pipeline status and lineage topology graph."""
        status = get_pipeline_status()
        self.assertEqual(status["overall_status"], "Healthy")
        self.assertEqual(len(status["stages"]), 6)

        lineage = get_data_lineage("test_sales.csv")
        self.assertIn("nodes", lineage)
        self.assertIn("edges", lineage)
        self.assertIn("metadata", lineage)

    def test_business_health_score(self):
        """Test Business Health Score formula calculation."""
        res = calculate_business_health_score(self.sample_df)
        self.assertIn("health_score", res)
        self.assertGreaterEqual(res["health_score"], 0)
        self.assertLessEqual(res["health_score"], 100)
        self.assertIn(res["status"], ["Healthy", "Moderate", "At Risk", "Critical"])

    def test_business_alerts(self):
        """Test business anomaly alert generation."""
        alerts = generate_business_alerts(self.sample_df)
        self.assertIsInstance(alerts, list)
        if len(alerts) > 0:
            self.assertIn("type", alerts[0])
            self.assertIn("message", alerts[0])

    def test_profitability_matrix(self):
        """Test 2x2 Profitability Matrix categorization."""
        matrix = get_profitability_matrix(self.sample_df)
        self.assertIn("quadrants", matrix)
        self.assertIn("stars", matrix["quadrants"])
        self.assertIn("volume_drivers", matrix["quadrants"])
        self.assertIn("niche_growth", matrix["quadrants"])
        self.assertIn("underperformers", matrix["quadrants"])

    def test_churn_model_comparison(self):
        """Test side-by-side ML churn model comparison."""
        comp = compare_churn_models(self.sample_df)
        self.assertIn("comparison_table", comp)
        self.assertEqual(len(comp["comparison_table"]), 2)
        self.assertIn("selected_model", comp)

    def test_customer_360_view(self):
        """Test Customer 360 profile aggregation & recommendation rules."""
        c360 = get_customer_360_view("CUST-001", self.sample_df)
        self.assertEqual(c360["customer_id"], "CUST-001")
        self.assertIn("segment", c360)
        self.assertIn("risk_level", c360)
        self.assertIn("recommended_business_action", c360)
        self.assertIn("explainability_factors", c360)

    def test_authentication_and_jwt(self):
        """Test password hashing, verification, JWT creation & decoding."""
        from src.modules.auth import hash_password, verify_password, create_jwt_token, decode_jwt_token, authenticate_user

        raw_pwd = "my-secret-password-123"
        hashed = hash_password(raw_pwd)
        self.assertTrue(verify_password(raw_pwd, hashed))
        self.assertFalse(verify_password("wrong-password", hashed))

        payload = {"user_id": 1, "email": "user@datapulse.com", "name": "DataPulse User"}
        token = create_jwt_token(payload)
        decoded = decode_jwt_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["email"], "user@datapulse.com")

        # Test Standard Seed User Account
        acc = authenticate_user("user@datapulse.com", "datapulse123")
        self.assertIsNotNone(acc)
        self.assertEqual(acc["email"], "user@datapulse.com")
        self.assertEqual(acc["name"], "DataPulse User")


if __name__ == "__main__":
    unittest.main()


