"""
backend/main.py
---------------
FastAPI REST API Server for BusinessIQ: Business Analytics & Customer Insights Platform.

Exposes endpoints for:
- Summary Dashboard KPIs & Charts
- Sales Analytics, Category & Regional Breakdown
- Customer Analytics & Top Rankings
- Product Performance & Margins
- Regional Analytics
- Machine Learning Customer Segmentation (K-Means)
- Machine Learning Churn Prediction (Logistic Regression)
- Machine Learning Sales Forecasting (Linear Trend)
- File Upload Validation (CSV/Excel)
- Downloadable Reports Export (CSV)
"""

import sys
import os
import io
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Query, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
import numpy as np

# Add parent directory to sys.path to import src package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.modules.data_loader import load_sales_data
from src.modules.db_connector import get_db_connector
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
from src.modules.customer_segmentation import fit_kmeans_segmentation
from src.modules.churn_prediction import train_churn_model
from src.modules.sales_forecasting import fit_sales_forecast
from src.utils.helpers import get_system_status

app = FastAPI(
    title="BusinessIQ REST API",
    description="Business Analytics & Customer Insights Platform API Server",
    version="2.0.0",
)

# Configure CORS Middleware for Frontend SPA (React Vite / Next)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local dev server connections
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global dataset state
DATA_FILEPATH = "data/sales.csv"


def get_base_df() -> pd.DataFrame:
    """Helper to load and clean raw sales CSV dataset."""
    df, _ = load_sales_data(DATA_FILEPATH)
    return df


def filter_df(
    df: pd.DataFrame,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
    product: Optional[str] = None,
) -> pd.DataFrame:
    """Filters dataset dynamically based on API query parameters."""
    filtered = df.copy()

    if start_date:
        filtered = filtered[filtered["Order_Date"] >= pd.to_datetime(start_date)]
    if end_date:
        filtered = filtered[filtered["Order_Date"] <= pd.to_datetime(end_date)]
    if region and region != "All":
        filtered = filtered[filtered["Region"] == region]
    if category and category != "All":
        filtered = filtered[filtered["Category"] == category]
    if product and product != "All":
        filtered = filtered[filtered["Product"] == product]

    return filtered


# -----------------------------------------------------------------------------
# 1. SYSTEM HEALTH & FILTER METADATA
# -----------------------------------------------------------------------------
@app.get("/api/health")
def api_health():
    """System health check and package version status."""
    return get_system_status()


@app.get("/api/filters")
def api_filters():
    """Returns available categories, regions, products, and date bounds for UI dropdowns."""
    df = get_base_df()
    min_date = df["Order_Date"].min().strftime("%Y-%m-%d")
    max_date = df["Order_Date"].max().strftime("%Y-%m-%d")

    categories = ["All"] + sorted(list(df["Category"].unique()))
    regions = ["All"] + sorted(list(df["Region"].unique()))
    products = ["All"] + sorted(list(df["Product"].unique()))

    return {
        "min_date": min_date,
        "max_date": max_date,
        "categories": categories,
        "regions": regions,
        "products": products,
    }


# -----------------------------------------------------------------------------
# 2. DASHBOARD OVERVIEW ENDPOINT
# -----------------------------------------------------------------------------
@app.get("/api/dashboard")
def api_dashboard(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
    product: Optional[str] = None,
    date_preset: Optional[str] = None,
):
    """Main Executive Dashboard metrics, KPI summary cards, and overview charts."""
    df = get_base_df()

    # Handle date presets (e.g. 30d, 3m, 6m, 1y)
    if date_preset and date_preset != "all":
        max_date = df["Order_Date"].max()
        if date_preset == "30d":
            start_date = (max_date - pd.Timedelta(days=30)).strftime("%Y-%m-%d")
        elif date_preset == "3m":
            start_date = (max_date - pd.Timedelta(days=90)).strftime("%Y-%m-%d")
        elif date_preset == "6m":
            start_date = (max_date - pd.Timedelta(days=180)).strftime("%Y-%m-%d")
        elif date_preset == "1y":
            start_date = (max_date - pd.Timedelta(days=365)).strftime("%Y-%m-%d")

    f_df = filter_df(df, start_date, end_date, region, category, product)

    total_sales = get_total_sales(f_df)
    total_profit = get_total_profit(f_df)
    total_orders = get_total_orders(f_df)
    total_customers = get_customer_count(f_df)
    avg_order_val = get_average_order_value(f_df)

    monthly_df = get_sales_by_month(f_df)
    category_df = get_sales_by_category(f_df)
    region_df = get_sales_by_region(f_df)
    top_prod_df = (
        f_df.groupby(["Product", "Category"])
        .agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"), Quantity=("Quantity", "sum"))
        .reset_index()
        .sort_values(by="Sales", ascending=False)
        .head(5)
    )
    if not top_prod_df.empty:
        top_prod_df["Profit_Margin_%"] = np.where(
            top_prod_df["Sales"] > 0, np.round((top_prod_df["Profit"] / top_prod_df["Sales"]) * 100, 1), 0.0
        )

    # Calculate Quarterly Trend
    if not f_df.empty:
        q_temp = f_df.copy()
        q_temp["Quarter"] = q_temp["Order_Date"].dt.to_period("Q").astype(str)
        quarterly_df = (
            q_temp.groupby("Quarter")
            .agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"))
            .reset_index()
        )
        quarterly_df["Month_Name"] = quarterly_df["Quarter"]
    else:
        quarterly_df = pd.DataFrame(columns=["Quarter", "Month_Name", "Sales", "Profit"])

    # Calculate Customer Insights Metrics
    if not f_df.empty:
        cust_summary = f_df.groupby(["Customer_ID", "Customer_Name"]).agg(
            Total_Spend=("Sales", "sum"),
            Order_Count=("Order_ID", "nunique"),
            Last_Date=("Order_Date", "max"),
        ).reset_index()

        max_order_date = df["Order_Date"].max()
        cust_summary["Recency_Days"] = (max_order_date - cust_summary["Last_Date"]).dt.days
        repeat_pct = round((cust_summary["Order_Count"] > 1).mean() * 100, 1) if len(cust_summary) > 0 else 0.0
        high_churn_count = int((cust_summary["Recency_Days"] > 90).sum())
        avg_cust_value = round(total_sales / total_customers, 2) if total_customers > 0 else 0.0

        def assign_segment(row):
            if row["Total_Spend"] >= 1000000 and row["Order_Count"] >= 8:
                return "High Value"
            elif row["Total_Spend"] >= 500000:
                return "Regular"
            elif row["Recency_Days"] > 120:
                return "At Risk"
            else:
                return "Low Value"

        cust_summary["Segment"] = cust_summary.apply(assign_segment, axis=1)
        seg_counts = cust_summary["Segment"].value_counts().to_dict()
    else:
        repeat_pct = 0.0
        high_churn_count = 0
        avg_cust_value = 0.0
        seg_counts = {"High Value": 0, "Regular": 0, "Low Value": 0, "At Risk": 0}

    # Generate Dynamic Business Highlights
    highlights = []
    if not category_df.empty:
        top_cat = category_df.iloc[0]
        cat_pct = round((top_cat["Sales"] / total_sales) * 100, 1) if total_sales > 0 else 0
        from src.utils.helpers import format_currency
        highlights.append(f"{top_cat['Category']} generated the highest revenue share at {format_currency(top_cat['Sales'], compact=True)} ({cat_pct}% of total).")

    if not region_df.empty:
        top_reg = region_df.iloc[0]
        from src.utils.helpers import format_currency
        highlights.append(f"{top_reg['Region']} territory recorded the strongest regional sales at {format_currency(top_reg['Sales'], compact=True)}.")

    if high_churn_count > 0:
        highlights.append(f"{high_churn_count} customer account{'s are' if high_churn_count > 1 else ' is'} currently classified at High Churn Risk (inactive > 90 days).")
    else:
        highlights.append("All customer accounts demonstrate active purchasing engagement.")

    if not top_prod_df.empty:
        top_p = top_prod_df.iloc[0]
        from src.utils.helpers import format_currency
        highlights.append(f"{top_p['Product']} is the top-performing product with revenue of {format_currency(top_p['Sales'], compact=True)}.")

    return {
        "kpis": {
            "total_sales": total_sales,
            "total_profit": total_profit,
            "total_orders": total_orders,
            "total_customers": total_customers,
            "avg_order_value": avg_order_val,
        },
        "monthly_trend": monthly_df.to_dict(orient="records"),
        "quarterly_trend": quarterly_df.to_dict(orient="records"),
        "sales_by_category": category_df.to_dict(orient="records"),
        "sales_by_region": region_df.to_dict(orient="records"),
        "top_products": top_prod_df.to_dict(orient="records"),
        "customer_insights": {
            "total_customers": total_customers,
            "avg_customer_value": avg_cust_value,
            "repeat_customer_pct": repeat_pct,
            "high_churn_risk_count": high_churn_count,
            "segments": {
                "High Value": seg_counts.get("High Value", 0),
                "Regular": seg_counts.get("Regular", 0),
                "Low Value": seg_counts.get("Low Value", 0),
                "At Risk": seg_counts.get("At Risk", 0),
            },
        },
        "business_highlights": highlights,
    }


# -----------------------------------------------------------------------------
# 3. DEDICATED SALES ENDPOINT
# -----------------------------------------------------------------------------
@app.get("/api/sales")
def api_sales(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
    product: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
):
    """Sales Analytics Page endpoint with summary KPIs and paginated transactions."""
    df = get_base_df()
    f_df = filter_df(df, start_date, end_date, region, category, product)

    total_sales = get_total_sales(f_df)
    total_orders = get_total_orders(f_df)
    avg_order_val = get_average_order_value(f_df)

    monthly_df = get_sales_by_month(f_df)
    cat_df = get_sales_by_category(f_df)
    reg_df = get_sales_by_region(f_df)

    # Convert Order_Date to string for JSON serialization
    table_df = f_df.copy()
    table_df["Order_Date"] = table_df["Order_Date"].dt.strftime("%Y-%m-%d")

    # Pagination
    total_records = len(table_df)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_orders = table_df.iloc[start_idx:end_idx].to_dict(orient="records")

    return {
        "kpis": {
            "total_sales": total_sales,
            "total_orders": total_orders,
            "avg_order_value": avg_order_val,
        },
        "monthly_trend": monthly_df.to_dict(orient="records"),
        "category_performance": cat_df.to_dict(orient="records"),
        "regional_performance": reg_df.to_dict(orient="records"),
        "orders_table": {
            "total_records": total_records,
            "page": page,
            "limit": limit,
            "total_pages": int(np.ceil(total_records / limit)) if limit > 0 else 1,
            "data": paginated_orders,
        },
    }


# -----------------------------------------------------------------------------
# 4. DEDICATED CUSTOMERS ENDPOINT
# -----------------------------------------------------------------------------
@app.get("/api/customers")
def api_customers(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
):
    """Customer Analytics page endpoint."""
    df = get_base_df()
    f_df = filter_df(df, start_date, end_date, region)

    total_cust = get_customer_count(f_df)
    total_sales = get_total_sales(f_df)
    avg_spend = round(total_sales / total_cust, 2) if total_cust > 0 else 0.0

    top_cust = get_top_customers(f_df, n=50)

    return {
        "kpis": {
            "total_customers": total_cust,
            "avg_customer_spending": avg_spend,
        },
        "top_customers": top_cust.to_dict(orient="records"),
    }


# -----------------------------------------------------------------------------
# 5. DEDICATED PRODUCTS ENDPOINT
# -----------------------------------------------------------------------------
@app.get("/api/products")
def api_products(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
):
    """Product Analytics page endpoint."""
    df = get_base_df()
    f_df = filter_df(df, start_date, end_date, region, category)

    prod_df = (
        f_df.groupby(["Category", "Product"])[["Sales", "Profit", "Quantity"]]
        .sum()
        .reset_index()
    )
    prod_df["Profit_Margin_%"] = np.where(
        prod_df["Sales"] > 0, np.round((prod_df["Profit"] / prod_df["Sales"]) * 100, 2), 0.0
    )
    prod_df = prod_df.sort_values(by="Sales", ascending=False).reset_index(drop=True)

    return {
        "total_products": len(prod_df),
        "products": prod_df.to_dict(orient="records"),
    }


# -----------------------------------------------------------------------------
# 6. DEDICATED REGIONS ENDPOINT
# -----------------------------------------------------------------------------
@app.get("/api/regions")
def api_regions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
):
    """Regional Analytics page endpoint."""
    df = get_base_df()
    f_df = filter_df(df, start_date, end_date, category=category)

    reg_df = (
        f_df.groupby("Region")
        .agg(
            Sales=("Sales", "sum"),
            Profit=("Profit", "sum"),
            Order_Count=("Order_ID", "nunique"),
        )
        .reset_index()
    )
    total_sales = reg_df["Sales"].sum()
    reg_df["Sales_Share_%"] = np.where(
        total_sales > 0, np.round((reg_df["Sales"] / total_sales) * 100, 2), 0.0
    )
    reg_df["Profit_Margin_%"] = np.where(
        reg_df["Sales"] > 0, np.round((reg_df["Profit"] / reg_df["Sales"]) * 100, 2), 0.0
    )
    reg_df = reg_df.sort_values(by="Sales", ascending=False).reset_index(drop=True)

    return {
        "regions": reg_df.to_dict(orient="records"),
    }


# -----------------------------------------------------------------------------
# 7. MACHINE LEARNING: CUSTOMER SEGMENTATION (K-MEANS)
# -----------------------------------------------------------------------------
@app.get("/api/ml/segmentation")
def api_ml_segmentation(
    n_clusters: int = Query(3, ge=2, le=5),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """K-Means Unsupervised Customer Segmentation ML Endpoint."""
    df = get_base_df()
    f_df = filter_df(df, start_date, end_date)

    segmented_df, metrics = fit_kmeans_segmentation(f_df, n_clusters=n_clusters)

    if segmented_df.empty:
        return {"error": "Insufficient data to perform segmentation."}

    summary_df = metrics.get("segment_summary", pd.DataFrame())

    return {
        "metrics": {
            "n_clusters": metrics["n_clusters"],
            "silhouette_score": metrics["silhouette_score"],
            "inertia": metrics["inertia"],
            "total_customers_segmented": metrics["total_customers_segmented"],
        },
        "segment_summaries": summary_df.to_dict(orient="records"),
        "segmented_customers": segmented_df[
            [
                "Customer_ID",
                "Customer_Name",
                "Segment",
                "Total_Spending",
                "Order_Count",
                "Avg_Order_Value",
                "Recency_Days",
            ]
        ].to_dict(orient="records"),
    }


# -----------------------------------------------------------------------------
# 8. MACHINE LEARNING: CUSTOMER CHURN PREDICTION (LOGISTIC REGRESSION)
# -----------------------------------------------------------------------------
@app.get("/api/ml/churn")
def api_ml_churn(
    recency_threshold: int = Query(90, ge=30, le=180),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Logistic Regression Churn Prediction Endpoint."""
    df = get_base_df()
    f_df = filter_df(df, start_date, end_date)

    churn_df, metrics = train_churn_model(f_df, recency_threshold_days=recency_threshold)

    if churn_df.empty:
        return {"error": "Insufficient data to perform churn prediction."}

    return {
        "metrics": {
            "recency_threshold_days": metrics["recency_threshold_days"],
            "accuracy": metrics["accuracy"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1_score": metrics["f1_score"],
            "confusion_matrix": metrics["confusion_matrix"],
            "feature_importance": metrics["feature_importance"],
        },
        "customers": churn_df[
            [
                "Customer_ID",
                "Customer_Name",
                "Churn_Probability",
                "Risk_Level",
                "Recency_Days",
                "Total_Spending",
                "Order_Count",
            ]
        ].to_dict(orient="records"),
    }


# -----------------------------------------------------------------------------
# 9. MACHINE LEARNING: SALES FORECASTING (LINEAR TREND)
# -----------------------------------------------------------------------------
@app.get("/api/ml/forecast")
def api_ml_forecast(
    horizon: int = Query(3, ge=1, le=12),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Linear Trend Sales Forecasting Endpoint."""
    df = get_base_df()
    f_df = filter_df(df, start_date, end_date)

    forecast_df, metrics = fit_sales_forecast(f_df, forecast_months=horizon)

    if forecast_df.empty:
        return {"error": "Insufficient data for forecasting."}

    # Replace NaNs with None for clean JSON serialization
    clean_records = forecast_df.replace({np.nan: None}).to_dict(orient="records")

    return {
        "metrics": {
            "forecast_months": metrics["forecast_months"],
            "historical_months_count": metrics["historical_months_count"],
            "mae": metrics["mae"],
            "rmse": metrics["rmse"],
            "r2_score": metrics["r2_score"],
            "monthly_growth_rate": metrics["monthly_growth_rate"],
        },
        "forecast_data": clean_records,
    }


# -----------------------------------------------------------------------------
# 10. DATA UPLOAD & VALIDATION ENDPOINTS
# -----------------------------------------------------------------------------
@app.post("/api/upload")
async def api_upload_file(file: UploadFile = File(...)):
    """Validates uploaded CSV or Excel file and returns row/column quality audit."""
    contents = await file.read()
    filename = file.filename.lower()

    try:
        if filename.endswith(".csv"):
            upload_df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xls", ".xlsx")):
            upload_df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format! Please upload a .csv or .xlsx file.")

        if upload_df.empty:
            raise HTTPException(status_code=400, detail="Uploaded file is empty!")

        required_cols = [
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
        missing_cols = [c for c in required_cols if c not in upload_df.columns]

        missing_values_count = int(upload_df.isnull().sum().sum())
        duplicate_rows_count = int(upload_df.duplicated().sum())

        sample_preview = upload_df.head(5).to_dict(orient="records")

        return {
            "filename": file.filename,
            "total_rows": len(upload_df),
            "total_columns": len(upload_df.columns),
            "missing_cols": missing_cols,
            "is_schema_valid": len(missing_cols) == 0,
            "missing_values_count": missing_values_count,
            "duplicate_rows_count": duplicate_rows_count,
            "sample_preview": sample_preview,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process uploaded file: {str(e)}")


# -----------------------------------------------------------------------------
# 11. REPORTS CSV EXPORT ENDPOINT
# -----------------------------------------------------------------------------
@app.get("/api/reports/export")
def api_export_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
):
    """Exports filtered transactional dataset as a downloadable CSV report."""
    df = get_base_df()
    f_df = filter_df(df, start_date, end_date, region, category)

    csv_buffer = io.StringIO()
    f_df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)

    filename = f"BusinessIQ_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        io.BytesIO(csv_buffer.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
