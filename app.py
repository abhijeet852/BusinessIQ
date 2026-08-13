"""
app.py
------
Main Entry Point for the Business Analytics & Customer Insights Platform.

Streamlit multi-engine dashboard supporting:
1. Pandas CSV Data Engine (`src/modules/analytics.py`).
2. Relational Database SQL Engine (`src/modules/db_analytics.py`).
3. Machine Learning Customer Segmentation (`src/modules/customer_segmentation.py`).
4. Machine Learning Customer Churn Prediction (`src/modules/churn_prediction.py`).
5. Machine Learning Sales Forecasting Engine (`src/modules/sales_forecasting.py`).
6. Dynamic multi-filters (Date, Region, Category, Product).
7. Responsive KPI metrics & Plotly interactive visual charts (`src/components/ui.py`).
"""

from datetime import datetime
import streamlit as st
import pandas as pd

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
    get_top_customers,
)
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
from src.modules.customer_segmentation import fit_kmeans_segmentation
from src.modules.churn_prediction import train_churn_model
from src.modules.sales_forecasting import fit_sales_forecast
from src.components.ui import (
    render_header,
    render_kpi_cards,
    render_monthly_sales_trend_chart,
    render_sales_by_product_chart,
    render_sales_by_region_chart,
    render_profit_by_category_chart,
    render_top_customers_chart,
    render_segmentation_3d_scatter,
    render_segmentation_distribution_pie,
    render_confusion_matrix_heatmap,
    render_churn_risk_pie,
    render_sales_forecast_chart,
)
from src.utils.helpers import get_system_status

# 1. Page Configuration
st.set_page_config(
    page_title="Business Analytics & Customer Insights Platform",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded",
)


# 2. Cached Data Loading Pipeline (CSV Data)
@st.cache_data
def get_cleaned_csv_data():
    return load_sales_data("data/sales.csv")


try:
    csv_df, audit_log = get_cleaned_csv_data()
    csv_loaded = True
except Exception as e:
    csv_loaded = False
    error_msg = str(e)

if not csv_loaded:
    st.error(f"Failed to load dataset: {error_msg}")
    st.stop()


# 3. Main Header Banner
render_header()

# 4. Sidebar Controls & Data Engine Switcher
st.sidebar.title("⚙️ Data Engine & Controls")

data_engine = st.sidebar.radio(
    "Select Data Engine Source:",
    [
        "📁 Pandas CSV Engine",
        "🗄️ Relational SQL DB Engine",
    ],
    help="Switch between standard Pandas CSV processing and Relational SQL Database queries.",
)

st.sidebar.markdown("---")
st.sidebar.title("📌 Views & Filters")

nav_view = st.sidebar.radio(
    "Choose View:",
    [
        "📊 Business Analytics Dashboard",
        "📈 Sales Forecasting (ML)",
        "🔮 Customer Churn Prediction (ML)",
        "🤖 Customer Segmentation (ML)",
        "📁 Dataset Explorer & Audit",
        "🗄️ Database Schema & Relational Info",
        "⚙️ System Status & Tech Stack",
    ],
)

st.sidebar.markdown("---")
st.sidebar.subheader("🔍 Dynamic Filters")

# --- FILTER 1: Date Range Filter ---
min_date = csv_df["Order_Date"].min().date()
max_date = csv_df["Order_Date"].max().date()

date_range = st.sidebar.date_input(
    "Filter by Date Range:",
    value=(min_date, max_date),
    min_value=min_date,
    max_value=max_date,
)

if isinstance(date_range, tuple) and len(date_range) == 2:
    start_date, end_date = date_range
else:
    start_date, end_date = min_date, max_date

# --- FILTER 2: Region Filter ---
available_regions = sorted(list(csv_df["Region"].unique()))
selected_regions = st.sidebar.multiselect(
    "Filter by Region:",
    options=available_regions,
    default=available_regions,
)

# --- FILTER 3: Category Filter ---
available_categories = sorted(list(csv_df["Category"].unique()))
selected_categories = st.sidebar.multiselect(
    "Filter by Category:",
    options=available_categories,
    default=available_categories,
)

# --- FILTER 4: Product Filter ---
valid_products_df = csv_df[csv_df["Category"].isin(selected_categories)]
available_products = sorted(list(valid_products_df["Product"].unique()))
selected_products = st.sidebar.multiselect(
    "Filter by Product:",
    options=available_products,
    default=available_products,
)

# Filtered Pandas DataFrame for CSV mode
filtered_df = csv_df[
    (csv_df["Order_Date"].dt.date >= start_date)
    & (csv_df["Order_Date"].dt.date <= end_date)
    & (csv_df["Region"].isin(selected_regions))
    & (csv_df["Category"].isin(selected_categories))
    & (csv_df["Product"].isin(selected_products))
]

st.sidebar.markdown("---")
st.sidebar.info(f"Engine: **{data_engine}**\nActive Records: **{len(filtered_df):,}**")


# -----------------------------------------------------------------------------
# VIEW 1: BUSINESS ANALYTICS DASHBOARD
# -----------------------------------------------------------------------------
if nav_view == "📊 Business Analytics Dashboard":

    if filtered_df.empty:
        st.warning("⚠️ No data matches your filter criteria! Please adjust sidebar filters.")
        st.stop()

    if data_engine == "🗄️ Relational SQL DB Engine":
        st.caption("⚡ Executing Parameterized SQL Queries on `customers`, `products`, and `orders` tables.")

        db_mgr = get_db_connector(db_type="sqlite")
        conn = db_mgr.get_connection()

        total_sales = get_db_total_sales(
            conn,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        total_profit = get_db_total_profit(
            conn,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        total_orders = get_db_total_orders(
            conn,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        total_customers = get_db_customer_count(
            conn,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        avg_order_val = get_db_average_order_value(
            conn,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )

        monthly_df = get_db_sales_by_month(
            conn,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        cat_df = get_db_sales_by_category(
            conn,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        reg_df = get_db_sales_by_region(
            conn,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        prod_df = get_db_sales_by_product(
            conn,
            top_n=10,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        top_cust_df = get_db_top_customers(
            conn,
            n=10,
            start_date=start_date,
            end_date=end_date,
            regions=selected_regions,
            categories=selected_categories,
            products=selected_products,
        )
        conn.close()

    else:
        st.caption("⚡ Executing Vectorized Pandas Calculations on CSV Data.")
        total_sales = get_total_sales(filtered_df)
        total_profit = get_total_profit(filtered_df)
        total_orders = get_total_orders(filtered_df)
        total_customers = get_customer_count(filtered_df)
        avg_order_val = get_average_order_value(filtered_df)

        monthly_df = get_sales_by_month(filtered_df)
        cat_df = get_sales_by_category(filtered_df)
        reg_df = get_sales_by_region(filtered_df)
        prod_df = get_sales_by_product(filtered_df, top_n=10)
        top_cust_df = get_top_customers(filtered_df, n=10)

    render_kpi_cards(
        total_sales=total_sales,
        total_profit=total_profit,
        total_orders=total_orders,
        total_customers=total_customers,
        avg_order_value=avg_order_val,
    )

    st.markdown("<br>", unsafe_allow_html=True)

    col_left, col_right = st.columns(2)

    with col_left:
        render_monthly_sales_trend_chart(monthly_df)
        render_profit_by_category_chart(cat_df)

    with col_right:
        render_sales_by_region_chart(reg_df)
        render_sales_by_product_chart(prod_df)

    st.markdown("---")

    st.subheader("👥 Top 10 Customers Analysis")
    cust_col1, cust_col2 = st.columns([1.2, 1])

    with cust_col1:
        render_top_customers_chart(top_cust_df)

    with cust_col2:
        st.write("#### 🏆 Top Customer Ranking Table")
        display_cust = top_cust_df.copy()
        display_cust["Total_Sales"] = display_cust["Total_Sales"].apply(format_currency)
        display_cust["Total_Profit"] = display_cust["Total_Profit"].apply(format_currency)
        display_cust.columns = [
            "Customer ID",
            "Customer Name",
            "Total Sales (₹)",
            "Total Profit (₹)",
            "Orders",
        ]
        st.dataframe(display_cust, use_container_width=True, hide_index=True)


# -----------------------------------------------------------------------------
# VIEW 2: SALES FORECASTING (MACHINE LEARNING ANALYTICS)
# -----------------------------------------------------------------------------
elif nav_view == "📈 Sales Forecasting (ML)":
    st.subheader("📈 Sales Forecasting (Linear Trend Machine Learning)")

    if filtered_df.empty:
        st.warning("⚠️ No data available to perform sales forecasting. Adjust filters.")
        st.stop()

    st.markdown(
        """
        Sales Forecasting fits a **Linear Trend Regression model** ($y = m \cdot t + c$) on historical monthly revenue $y$ 
        over month index $t$. This provides a transparent, explainable baseline for future revenue estimation.
        """
    )

    col_f, col_blank = st.columns([1, 2])
    with col_f:
        forecast_horizon = st.slider(
            "Select Forecast Horizon (Months Ahead):",
            min_value=1,
            max_value=12,
            value=3,
            step=1,
        )

    # Train Sales Forecasting Model
    combined_forecast_df, metrics = fit_sales_forecast(filtered_df, forecast_months=forecast_horizon)

    if metrics:
        f1, f2, f3, f4 = st.columns(4)
        f1.metric("MAE (Mean Abs Error)", format_currency(metrics['mae']))
        f2.metric("RMSE (Root Mean Sq Error)", format_currency(metrics['rmse']))
        f3.metric("Model R² Score", f"{metrics['r2_score']:.3f}")
        growth_prefix = "+" if metrics["monthly_growth_rate"] >= 0 else ""
        f4.metric("Monthly Growth Rate", f"{growth_prefix}{format_currency(metrics['monthly_growth_rate'])}/mo")

    st.markdown("---")

    # Render Interactive Plotly Forecast Line Chart
    render_sales_forecast_chart(combined_forecast_df)

    st.markdown("---")

    # Forecast Comparison Table
    st.subheader("📄 Historical Actuals vs. Projected Future Forecast Table")
    display_forecast = combined_forecast_df[
        ["YearMonth", "Type", "Actual_Sales", "Fitted_Sales", "Forecast_Sales"]
    ].copy()

    display_forecast["Actual_Sales"] = display_forecast["Actual_Sales"].apply(
        lambda x: format_currency(x) if pd.notnull(x) else "-"
    )
    display_forecast["Fitted_Sales"] = display_forecast["Fitted_Sales"].apply(
        lambda x: format_currency(x) if pd.notnull(x) else "-"
    )
    display_forecast["Forecast_Sales"] = display_forecast["Forecast_Sales"].apply(
        lambda x: format_currency(x) if pd.notnull(x) else "-"
    )

    display_forecast.columns = [
        "Year-Month",
        "Data Type",
        "Actual Sales (₹)",
        "In-Sample Fitted Trend (₹)",
        "Future Forecast (₹)",
    ]

    st.dataframe(display_forecast, use_container_width=True, hide_index=True)

    st.markdown("---")

    # Forecasting Limitations Section
    with st.expander("⚠️ Key Limitations of Linear Trend Sales Forecasting"):
        st.markdown(
            """
            1. **Linearity Constraint**: Linear Regression assumes sales grow or decline at a constant rate ($m$). It does not capture complex non-linear S-curves or sudden market saturation.
            2. **Absence of Multi-Year Seasonality**: Short historical datasets (1-2 years) lack sufficient annual cycles to capture Q4 holiday sales surges or summer slowdowns.
            3. **Uncaptured Macroeconomic Shifts**: The model cannot predict external shocks such as inflation spikes, competitor price cuts, or supply chain bottlenecks.
            4. **Forecast Horizon Uncertainty**: Prediction variance widens significantly as the forecast horizon extends beyond 3 to 6 months into the future.
            """
        )


# -----------------------------------------------------------------------------
# VIEW 3: CUSTOMER CHURN PREDICTION (MACHINE LEARNING ANALYTICS)
# -----------------------------------------------------------------------------
elif nav_view == "🔮 Customer Churn Prediction (ML)":
    st.subheader("🔮 Customer Churn Prediction (Logistic Regression Baseline)")

    if filtered_df.empty:
        st.warning("⚠️ No data available to perform churn prediction. Adjust filters.")
        st.stop()

    col_t, col_blank = st.columns([1, 2])
    with col_t:
        threshold_days = st.slider(
            "Define Inactivity Churn Threshold (Days):",
            min_value=30,
            max_value=180,
            value=90,
            step=10,
            help="Customers inactive past this number of days are labeled as Churned.",
        )

    churn_results, metrics = train_churn_model(filtered_df, recency_threshold_days=threshold_days)

    if metrics:
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("Model Accuracy", f"{metrics['accuracy'] * 100:.1f}%")
        m2.metric("Precision", f"{metrics['precision'] * 100:.1f}%")
        m3.metric("Recall", f"{metrics['recall'] * 100:.1f}%")
        m4.metric("F1-Score", f"{metrics['f1_score']:.3f}")

    st.markdown("---")

    grid_c1, grid_c2 = st.columns(2)

    with grid_c1:
        if "confusion_matrix" in metrics:
            render_confusion_matrix_heatmap(metrics["confusion_matrix"])

    with grid_c2:
        render_churn_risk_pie(churn_results)

    st.markdown("---")

    st.subheader("📋 Customer Churn Risk Level Assessment Table")
    display_churn_table = churn_results[
        [
            "Customer_ID",
            "Customer_Name",
            "Churn_Probability",
            "Risk_Level",
            "Recency_Days",
            "Total_Spending",
            "Order_Count",
        ]
    ].copy()

    display_churn_table["Churn_Probability"] = display_churn_table["Churn_Probability"].apply(
        lambda x: f"{x:.1f}%"
    )
    display_churn_table["Total_Spending"] = display_churn_table["Total_Spending"].apply(format_currency)

    display_churn_table.columns = [
        "Customer ID",
        "Customer Name",
        "Churn Probability",
        "Risk Level",
        "Recency (Days)",
        "Total Spending (₹)",
        "Order Count",
    ]

    st.dataframe(display_churn_table, use_container_width=True, hide_index=True)

    st.markdown("---")

    with st.expander("⚠️ Important Limitations of Predicting Churn from Historical Transaction Data"):
        st.markdown(
            """
            1. **Absence of Qualitative Feedback**: Transactional history does not record customer sentiment, product defects, or customer support ticket escalation.
            2. **Target Label Definition Bias**: Defining churn solely based on inactivity days (e.g. 90 days) can create circular target definitions when recency is also used as an input feature.
            3. **Reactive vs. Proactive**: Recency metrics detect churn *after* the customer has already stopped placing orders, rather than anticipating loss ahead of time.
            4. **Small Sample Size & Seasonality**: In short transactional windows, B2B purchasing cycles may appear as churn when they are simply normal periodic buying behavior.
            """
        )


# -----------------------------------------------------------------------------
# VIEW 4: CUSTOMER SEGMENTATION (MACHINE LEARNING ANALYTICS)
# -----------------------------------------------------------------------------
elif nav_view == "🤖 Customer Segmentation (ML)":
    st.subheader("🤖 Customer Behavioral Segmentation (K-Means Machine Learning)")

    if filtered_df.empty:
        st.warning("⚠️ No data available to perform machine learning segmentation. Adjust filters.")
        st.stop()

    st.markdown(
        """
        Customer Segmentation uses an **unsupervised K-Means Machine Learning model** combined with **StandardScaler feature normalization** 
        to group customers based on their **Recency, Frequency, Monetary (RFM)** purchasing patterns.
        """
    )

    col_k, col_info = st.columns([1, 2])
    with col_k:
        n_clusters = st.slider("Select Number of Clusters (K):", min_value=2, max_value=5, value=3)

    segmented_df, metrics = fit_kmeans_segmentation(filtered_df, n_clusters=n_clusters)

    with col_info:
        if metrics:
            m1, m2, m3 = st.columns(3)
            m1.metric("Segmented Accounts", metrics["total_customers_segmented"])
            m2.metric("Silhouette Score", f"{metrics['silhouette_score']:.3f}")
            m3.metric("Model Inertia", f"{metrics['inertia']:.1f}")

    st.markdown("---")

    with st.expander("📖 Why these 4 features are used for Machine Learning Segmentation"):
        st.markdown(
            """
            - **Total Spending (Monetary)**: Cumulative monetary value generated by each customer account in Indian Rupees (₹).
            - **Order Count (Frequency)**: Number of separate purchase transactions placed.
            - **Average Order Value (AOV)**: Average revenue generated per order ($\text{Total Spending} / \text{Order Count}$).
            - **Recency Days (Recency)**: Days elapsed since the customer's last purchase. Lower recency indicates active engagement.
            - **Feature Standardization (`StandardScaler`)**: Ensures monetary Rupee amounts (₹1,00,000s) do not overshadow recency days (1-30 days) during Euclidean distance calculations.
            """
        )

    st.markdown("---")

    grid_col1, grid_col2 = st.columns([1.5, 1])

    with grid_col1:
        render_segmentation_3d_scatter(segmented_df)

    with grid_col2:
        render_segmentation_distribution_pie(segmented_df)

    st.markdown("---")

    tab_profile, tab_customers = st.tabs(["📊 Cluster Segment Summaries", "👥 Customer Cluster Assignments"])

    with tab_profile:
        st.write("### 📊 Average Behavioral Profile per Cluster")
        if "segment_summary" in metrics:
            summary_table = metrics["segment_summary"].copy()
            summary_table["Avg_Total_Spending"] = summary_table["Avg_Total_Spending"].apply(format_currency)
            summary_table["Avg_Order_Value"] = summary_table["Avg_Order_Value"].apply(format_currency)
            summary_table["Avg_Order_Count"] = summary_table["Avg_Order_Count"].apply(lambda x: f"{x:.1f}")
            summary_table["Avg_Recency_Days"] = summary_table["Avg_Recency_Days"].apply(lambda x: f"{x:.1f} days")
            summary_table.columns = [
                "Segment Label",
                "Customer Count",
                "Avg Total Spend (₹)",
                "Avg Order Count",
                "Avg Order Value (₹)",
                "Avg Recency",
            ]
            st.dataframe(summary_table, use_container_width=True, hide_index=True)

    with tab_customers:
        st.write("### 👥 Assigned Customer Segment Table")
        display_seg = segmented_df[
            ["Customer_ID", "Customer_Name", "Segment", "Total_Spending", "Order_Count", "Avg_Order_Value", "Recency_Days"]
        ].copy()
        display_seg["Total_Spending"] = display_seg["Total_Spending"].apply(format_currency)
        display_seg["Avg_Order_Value"] = display_seg["Avg_Order_Value"].apply(format_currency)
        display_seg.columns = [
            "Customer ID",
            "Customer Name",
            "Segment",
            "Total Spending (₹)",
            "Order Count",
            "Avg Order Value (₹)",
            "Recency (Days)",
        ]
        st.dataframe(display_seg, use_container_width=True, hide_index=True)


# -----------------------------------------------------------------------------
# VIEW 5: DATASET EXPLORER & AUDIT
# -----------------------------------------------------------------------------
elif nav_view == "📁 Dataset Explorer & Audit":
    st.subheader("📁 Preprocessing & Data Quality Audit")

    col_a, col_b = st.columns(2)
    with col_a:
        st.info(
            f"**Initial Raw Rows**: `{audit_log['initial_rows']}` | **Initial Columns**: `{audit_log['initial_cols']}`"
        )
        st.write("**Missing Values (Before Cleaning):**")
        st.json(audit_log["missing_before"])

    with col_b:
        st.success(
            f"**Cleaned Rows**: `{audit_log['cleaned_rows']}` | **Cleaned Columns**: `{audit_log['cleaned_cols']}`"
        )
        st.write("**Missing Values (After Cleaning):**")
        st.json(audit_log["missing_after"])

    st.markdown("---")
    st.subheader("📄 Interactive Data Table (Filtered)")
    st.dataframe(filtered_df, use_container_width=True)

    st.markdown("---")
    st.subheader("📊 Summary Statistics (`df.describe()`)")
    st.dataframe(filtered_df.describe(), use_container_width=True)


# -----------------------------------------------------------------------------
# VIEW 6: DATABASE SCHEMA & RELATIONAL INFO
# -----------------------------------------------------------------------------
elif nav_view == "🗄️ Database Schema & Relational Info":
    st.subheader("🗄️ Relational Database Architecture (3NF Schema)")

    db_mgr = get_db_connector(db_type="sqlite")
    conn = db_mgr.get_connection()

    tab1, tab2, tab3 = st.tabs(["customers Table", "products Table", "orders Table"])

    with tab1:
        st.write("### 👥 `customers` Parent Table")
        cust_db = pd.read_sql_query("SELECT * FROM customers;", conn)
        st.dataframe(cust_db, use_container_width=True)

    with tab2:
        st.write("### 📦 `products` Parent Table")
        prod_db = pd.read_sql_query("SELECT * FROM products;", conn)
        st.dataframe(prod_db, use_container_width=True)

    with tab3:
        st.write("### 🛒 `orders` Transactional Child Table (with Foreign Keys)")
        orders_db = pd.read_sql_query("SELECT * FROM orders LIMIT 50;", conn)
        st.dataframe(orders_db, use_container_width=True)

    conn.close()


# -----------------------------------------------------------------------------
# VIEW 7: SYSTEM STATUS & TECH STACK
# -----------------------------------------------------------------------------
elif nav_view == "⚙️ System Status & Tech Stack":
    st.subheader("⚙️ System Environment & Portfolio Architecture")

    status = get_system_status()
    st.json(status)

    st.markdown(
        """
        ### 🛠️ Technology Stack Breakdown
        - **Python 3.13**: Core programming language.
        - **Scikit-Learn (1.8.0)**: Linear Regression (Sales Forecasting & Churn baseline) and K-Means Clustering (Customer Segmentation).
        - **MySQL & SQLite**: Relational database engine with 3NF normalized schema (`customers`, `products`, `orders`).
        - **Pandas & NumPy**: Data loading, missing value imputation, datetime parsing & aggregation.
        - **Plotly Express & Graph Objects**: Dynamic dark-themed 3D/2D interactive visualizations, forecast trend lines & heatmaps.
        - **Streamlit**: Web analytical user interface framework.
        """
    )
