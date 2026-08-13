"""
tests/test_analytics.py
------------------------
Unit test suite verifying correctness of the 12 business analytics functions
in src/modules/analytics.py.
"""

import unittest
import pandas as pd
from src.modules.data_loader import load_sales_data
from src.modules.analytics import (
    get_total_sales,
    get_total_profit,
    get_total_orders,
    get_customer_count,
    get_average_order_value,
    get_sales_by_month,
    get_sales_by_product,
    get_sales_by_category,
    get_sales_by_region,
    get_profit_by_product,
    get_profit_by_region,
    get_top_customers,
)


class TestAnalytics(unittest.TestCase):
    """Test suite for analytics calculations."""

    @classmethod
    def setUpClass(cls):
        cls.df, _ = load_sales_data("data/sales.csv")

    def test_total_sales(self):
        sales = get_total_sales(self.df)
        self.assertIsInstance(sales, float)
        self.assertGreater(sales, 0)
        self.assertAlmostEqual(sales, self.df["Sales"].sum(), places=2)

    def test_total_profit(self):
        profit = get_total_profit(self.df)
        self.assertIsInstance(profit, float)
        self.assertGreater(profit, 0)
        self.assertAlmostEqual(profit, self.df["Profit"].sum(), places=2)

    def test_total_orders(self):
        orders = get_total_orders(self.df)
        self.assertIsInstance(orders, int)
        self.assertEqual(orders, self.df["Order_ID"].nunique())

    def test_customer_count(self):
        cust_count = get_customer_count(self.df)
        self.assertIsInstance(cust_count, int)
        self.assertEqual(cust_count, self.df["Customer_ID"].nunique())

    def test_average_order_value(self):
        aov = get_average_order_value(self.df)
        self.assertIsInstance(aov, float)
        expected_aov = round(self.df["Sales"].sum() / self.df["Order_ID"].nunique(), 2)
        self.assertEqual(aov, expected_aov)

    def test_sales_by_month(self):
        monthly = get_sales_by_month(self.df)
        self.assertIsInstance(monthly, pd.DataFrame)
        self.assertIn("YearMonth", monthly.columns)
        self.assertIn("Sales", monthly.columns)
        self.assertGreater(len(monthly), 0)

    def test_sales_by_product(self):
        prod = get_sales_by_product(self.df, top_n=5)
        self.assertIsInstance(prod, pd.DataFrame)
        self.assertLessEqual(len(prod), 5)
        self.assertIn("Product", prod.columns)

    def test_sales_by_category(self):
        cat = get_sales_by_category(self.df)
        self.assertIsInstance(cat, pd.DataFrame)
        self.assertIn("Category", cat.columns)
        self.assertIn("Profit_Margin_%", cat.columns)

    def test_sales_by_region(self):
        reg = get_sales_by_region(self.df)
        self.assertIsInstance(reg, pd.DataFrame)
        self.assertIn("Region", reg.columns)
        self.assertIn("Sales_Share_%", reg.columns)

    def test_profit_by_product(self):
        prod_profit = get_profit_by_product(self.df)
        self.assertIsInstance(prod_profit, pd.DataFrame)
        self.assertIn("Profit", prod_profit.columns)

    def test_profit_by_region(self):
        reg_profit = get_profit_by_region(self.df)
        self.assertIsInstance(reg_profit, pd.DataFrame)
        self.assertIn("Profit_Margin_%", reg_profit.columns)

    def test_top_customers(self):
        top_cust = get_top_customers(self.df, n=10)
        self.assertIsInstance(top_cust, pd.DataFrame)
        self.assertLessEqual(len(top_cust), 10)
        self.assertIn("Customer_Name", top_cust.columns)
        self.assertIn("Total_Sales", top_cust.columns)


if __name__ == "__main__":
    unittest.main()
