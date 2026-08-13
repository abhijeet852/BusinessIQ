"""
src/modules/db_analytics.py
---------------------------
Relational Database SQL Analytics Engine.

Calculates key business intelligence metrics and relational breakdowns directly
from the `customers`, `products`, and `orders` database tables using parameterized SQL queries.
"""

from typing import List, Tuple, Optional
import pandas as pd


def _build_sql_where_clause(
    start_date=None,
    end_date=None,
    regions: Optional[List[str]] = None,
    categories: Optional[List[str]] = None,
    products: Optional[List[str]] = None,
    placeholder: str = "?",
) -> Tuple[str, list]:
    """
    Constructs a safe, parameterized SQL WHERE clause to prevent SQL Injection attacks.
    """
    conditions = []
    params = []

    if start_date:
        conditions.append(f"o.order_date >= {placeholder}")
        params.append(str(start_date))

    if end_date:
        conditions.append(f"o.order_date <= {placeholder}")
        params.append(str(end_date))

    if regions:
        placeholders = ", ".join([placeholder] * len(regions))
        conditions.append(f"o.region IN ({placeholders})")
        params.extend(regions)

    if categories:
        placeholders = ", ".join([placeholder] * len(categories))
        conditions.append(f"p.category IN ({placeholders})")
        params.extend(categories)

    if products:
        placeholders = ", ".join([placeholder] * len(products))
        conditions.append(f"p.product_name IN ({placeholders})")
        params.extend(products)

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    return where_clause, params


def get_db_total_sales(conn, **kwargs) -> float:
    """Calculates total sales from SQL database using parameterized query."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    sql = f"""
    SELECT COALESCE(SUM(o.sales), 0.0)
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    {where_clause};
    """
    df = pd.read_sql_query(sql, conn, params=params)
    return float(df.iloc[0, 0]) if not df.empty else 0.0


def get_db_total_profit(conn, **kwargs) -> float:
    """Calculates total net profit from SQL database."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    sql = f"""
    SELECT COALESCE(SUM(o.profit), 0.0)
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    {where_clause};
    """
    df = pd.read_sql_query(sql, conn, params=params)
    return float(df.iloc[0, 0]) if not df.empty else 0.0


def get_db_total_orders(conn, **kwargs) -> int:
    """Counts total unique order transactions in database."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    sql = f"""
    SELECT COUNT(DISTINCT o.order_id)
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    {where_clause};
    """
    df = pd.read_sql_query(sql, conn, params=params)
    return int(df.iloc[0, 0]) if not df.empty else 0


def get_db_customer_count(conn, **kwargs) -> int:
    """Counts total unique active customer accounts in database."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    sql = f"""
    SELECT COUNT(DISTINCT o.customer_id)
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    {where_clause};
    """
    df = pd.read_sql_query(sql, conn, params=params)
    return int(df.iloc[0, 0]) if not df.empty else 0


def get_db_average_order_value(conn, **kwargs) -> float:
    """Calculates Average Order Value (AOV) via SQL aggregation."""
    sales = get_db_total_sales(conn, **kwargs)
    orders = get_db_total_orders(conn, **kwargs)
    if orders == 0:
        return 0.0
    return round(sales / orders, 2)


def get_db_sales_by_month(conn, **kwargs) -> pd.DataFrame:
    """Aggregates monthly revenue & profit trends via SQL strftime/DATE_FORMAT."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    sql = f"""
    SELECT 
        strftime('%Y-%m', o.order_date) AS YearMonth,
        strftime('%b %Y', o.order_date) AS Month_Name,
        SUM(o.sales) AS Sales,
        SUM(o.profit) AS Profit
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    {where_clause}
    GROUP BY YearMonth, Month_Name
    ORDER BY YearMonth ASC;
    """
    return pd.read_sql_query(sql, conn, params=params)


def get_db_sales_by_product(conn, top_n: Optional[int] = None, **kwargs) -> pd.DataFrame:
    """Aggregates sales by product using INNER JOIN with products table."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    limit_clause = f" LIMIT {top_n}" if top_n else ""
    sql = f"""
    SELECT 
        p.product_name AS Product,
        SUM(o.sales) AS Sales,
        SUM(o.quantity) AS Quantity,
        SUM(o.profit) AS Profit
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    {where_clause}
    GROUP BY p.product_name
    ORDER BY Sales DESC
    {limit_clause};
    """
    return pd.read_sql_query(sql, conn, params=params)


def get_db_sales_by_category(conn, **kwargs) -> pd.DataFrame:
    """Aggregates sales and profit margins by product category."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    sql = f"""
    SELECT 
        p.category AS Category,
        SUM(o.sales) AS Sales,
        SUM(o.profit) AS Profit,
        ROUND((SUM(o.profit) / NULLIF(SUM(o.sales), 0)) * 100, 2) AS `Profit_Margin_%`
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    {where_clause}
    GROUP BY p.category
    ORDER BY Sales DESC;
    """
    df = pd.read_sql_query(sql, conn, params=params)
    if "Profit_Margin_%" in df.columns:
        df["Profit_Margin_%"] = df["Profit_Margin_%"].fillna(0.0)
    return df


def get_db_sales_by_region(conn, **kwargs) -> pd.DataFrame:
    """Aggregates sales by region and calculates regional percentage share."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    sql = f"""
    SELECT 
        o.region AS Region,
        SUM(o.sales) AS Sales,
        SUM(o.profit) AS Profit
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    {where_clause}
    GROUP BY o.region
    ORDER BY Sales DESC;
    """
    df = pd.read_sql_query(sql, conn, params=params)
    total_sales = df["Sales"].sum() if not df.empty else 0
    if total_sales > 0:
        df["Sales_Share_%"] = (df["Sales"] / total_sales * 100).round(2)
    else:
        df["Sales_Share_%"] = 0.0
    return df


def get_db_top_customers(conn, n: int = 10, **kwargs) -> pd.DataFrame:
    """Ranks top N customers by joining orders and customers tables."""
    where_clause, params = _build_sql_where_clause(**kwargs)
    sql = f"""
    SELECT 
        c.customer_id AS Customer_ID,
        c.customer_name AS Customer_Name,
        SUM(o.sales) AS Total_Sales,
        SUM(o.profit) AS Total_Profit,
        COUNT(DISTINCT o.order_id) AS Order_Count
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN products p ON o.product_id = p.product_id
    {where_clause}
    GROUP BY c.customer_id, c.customer_name
    ORDER BY Total_Sales DESC
    LIMIT {int(n)};
    """
    return pd.read_sql_query(sql, conn, params=params)
