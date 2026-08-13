"""
src/components/ui.py
--------------------
Reusable Streamlit UI Components (Headers, Metric Cards, Plotly Charts, ML Visualizations)
configured for Indian Rupee (INR - ₹) currency formatting.
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from src.utils.helpers import format_currency, format_percentage


def render_header():
    """Renders the main platform banner header."""
    st.markdown(
        """
        <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); 
                    padding: 22px 28px; border-radius: 12px; margin-bottom: 24px; 
                    border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #F8FAFC; margin: 0; font-size: 1.8rem; font-weight: 700; display: flex; align-items: center; gap: 12px;">
                📈 Business Analytics & Customer Insights Dashboard (INR)
            </h1>
            <p style="color: #94A3B8; margin-top: 6px; font-size: 0.95rem; margin-bottom: 0;">
                Production-grade Indian Business Analytics Platform with dynamic multi-dimensional filters, relational SQL engine & ML analytics.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_kpi_cards(
    total_sales: float,
    total_profit: float,
    total_orders: int,
    total_customers: int,
    avg_order_value: float,
):
    """Renders top summary metric cards in responsive columns."""
    col1, col2, col3, col4, col5 = st.columns(5)

    with col1:
        st.metric("Total Sales", format_currency(total_sales, compact=True))
    with col2:
        st.metric("Total Profit", format_currency(total_profit, compact=True))
    with col3:
        st.metric("Total Orders", f"{total_orders:,}")
    with col4:
        st.metric("Total Customers", f"{total_customers:,}")
    with col5:
        st.metric("Avg Order Value", format_currency(avg_order_value))


def render_monthly_sales_trend_chart(monthly_df: pd.DataFrame):
    """Generates an interactive Plotly line chart of Monthly Sales & Profit trends."""
    if monthly_df.empty:
        st.info("No data available for Monthly Sales Trend.")
        return

    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=monthly_df["Month_Name"],
            y=monthly_df["Sales"],
            mode="lines+markers",
            name="Sales (₹)",
            line=dict(color="#38BDF8", width=3),
            marker=dict(size=6),
            hovertemplate="<b>%{x}</b><br>Sales: ₹%{y:,.2f}<extra></extra>",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=monthly_df["Month_Name"],
            y=monthly_df["Profit"],
            mode="lines+markers",
            name="Profit (₹)",
            line=dict(color="#4ADE80", width=3),
            marker=dict(size=6),
            hovertemplate="<b>%{x}</b><br>Profit: ₹%{y:,.2f}<extra></extra>",
        )
    )

    fig.update_layout(
        title="<b>Monthly Sales & Profit Trend (INR)</b>",
        xaxis_title="Month",
        yaxis_title="Amount (₹)",
        template="plotly_dark",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        height=380,
        margin=dict(l=20, r=20, t=50, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_sales_by_product_chart(prod_df: pd.DataFrame):
    """Generates an interactive horizontal bar chart for Sales by Product."""
    if prod_df.empty:
        st.info("No data available for Sales by Product.")
        return

    fig = px.bar(
        prod_df.sort_values("Sales", ascending=True),
        x="Sales",
        y="Product",
        orientation="h",
        title="<b>Sales by Product (INR)</b>",
        labels={"Sales": "Sales (₹)", "Product": "Product Name"},
        color="Sales",
        color_continuous_scale="Viridis",
    )
    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        height=400,
        margin=dict(l=20, r=20, t=50, b=20),
        coloraxis_showscale=False,
    )
    st.plotly_chart(fig, use_container_width=True)


def render_sales_by_region_chart(reg_df: pd.DataFrame):
    """Generates an interactive donut pie chart for Sales by Region."""
    if reg_df.empty:
        st.info("No data available for Sales by Region.")
        return

    fig = px.pie(
        reg_df,
        values="Sales",
        names="Region",
        hole=0.45,
        title="<b>Sales by Region (INR)</b>",
        color_discrete_sequence=px.colors.qualitative.Dark24,
    )
    fig.update_traces(
        textposition="inside",
        textinfo="percent+label",
        hovertemplate="<b>%{label}</b><br>Sales: ₹%{value:,.2f}<br>Share: %{percent}<extra></extra>",
    )
    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        height=380,
        margin=dict(l=20, r=20, t=50, b=20),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_profit_by_category_chart(cat_df: pd.DataFrame):
    """Generates an interactive column bar chart for Profit by Category."""
    if cat_df.empty:
        st.info("No data available for Profit by Category.")
        return

    fig = px.bar(
        cat_df,
        x="Category",
        y="Profit",
        color="Category",
        title="<b>Profit by Category (INR)</b>",
        labels={"Profit": "Net Profit (₹)", "Category": "Product Category"},
        color_discrete_sequence=px.colors.qualitative.Plotly,
    )
    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        height=380,
        margin=dict(l=20, r=20, t=50, b=20),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_top_customers_chart(top_cust_df: pd.DataFrame):
    """Generates an interactive bar chart and formatted table for Top 10 Customers."""
    if top_cust_df.empty:
        st.info("No customer data available.")
        return

    fig = px.bar(
        top_cust_df.sort_values("Total_Sales", ascending=True),
        x="Total_Sales",
        y="Customer_Name",
        orientation="h",
        title="<b>Top 10 Customers by Total Spend (INR)</b>",
        labels={"Total_Sales": "Total Sales (₹)", "Customer_Name": "Customer Name"},
        color="Total_Sales",
        color_continuous_scale="Tealgrn",
    )
    fig.update_layout(
        template="plotly_dark",
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        height=400,
        margin=dict(l=20, r=20, t=50, b=20),
        coloraxis_showscale=False,
    )
    st.plotly_chart(fig, use_container_width=True)


# -----------------------------------------------------------------------------
# MACHINE LEARNING UI COMPONENTS
# -----------------------------------------------------------------------------
def render_segmentation_3d_scatter(segmented_df: pd.DataFrame):
    """Generates an interactive 3D Plotly Scatter plot of Customer Clusters."""
    if segmented_df.empty:
        st.info("No customer data available for 3D Segmentation plot.")
        return

    fig = px.scatter_3d(
        segmented_df,
        x="Recency_Days",
        y="Order_Count",
        z="Total_Spending",
        color="Segment",
        hover_name="Customer_Name",
        hover_data=["Customer_ID", "Avg_Order_Value"],
        title="<b>3D Customer Segmentation Cluster Visualization (INR)</b>",
        labels={
            "Recency_Days": "Recency (Days)",
            "Order_Count": "Order Frequency",
            "Total_Spending": "Total Monetary Spending (₹)",
        },
        color_discrete_sequence=px.colors.qualitative.Bold,
    )
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        height=550,
        margin=dict(l=10, r=10, t=40, b=10),
        scene=dict(
            xaxis_title="Recency (Days)",
            yaxis_title="Order Frequency",
            zaxis_title="Total Spending (₹)",
        ),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_segmentation_distribution_pie(segmented_df: pd.DataFrame):
    """Generates a donut chart displaying the percentage distribution of customer clusters."""
    if segmented_df.empty:
        st.info("No data available.")
        return

    seg_counts = segmented_df["Segment"].value_counts().reset_index()
    seg_counts.columns = ["Segment", "Count"]

    fig = px.pie(
        seg_counts,
        values="Count",
        names="Segment",
        hole=0.45,
        title="<b>Customer Cluster Share Distribution</b>",
        color_discrete_sequence=px.colors.qualitative.Bold,
    )
    fig.update_traces(textposition="inside", textinfo="percent+label")
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        height=380,
        margin=dict(l=20, r=20, t=50, b=20),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_confusion_matrix_heatmap(cm_list: list):
    """Renders an interactive Plotly Heatmap for Logistic Regression Confusion Matrix."""
    if not cm_list or len(cm_list) != 2:
        st.info("No Confusion Matrix available.")
        return

    labels = [["True Active (TN)", "False Churn (FP)"], ["False Active (FN)", "True Churn (TP)"]]
    x_tags = ["Predicted Active (0)", "Predicted Churned (1)"]
    y_tags = ["Actual Active (0)", "Actual Churned (1)"]

    z_values = cm_list

    fig = px.imshow(
        z_values,
        x=x_tags,
        y=y_tags,
        text_auto=True,
        color_continuous_scale="Blues",
        title="<b>Logistic Regression Confusion Matrix Heatmap</b>",
    )
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        height=350,
        margin=dict(l=20, r=20, t=50, b=20),
        coloraxis_showscale=False,
    )
    st.plotly_chart(fig, use_container_width=True)


def render_churn_risk_pie(churn_df: pd.DataFrame):
    """Renders donut pie chart showing distribution of Low, Medium, and High Risk customer accounts."""
    if churn_df.empty:
        st.info("No churn data available.")
        return

    risk_counts = churn_df["Risk_Level"].value_counts().reset_index()
    risk_counts.columns = ["Risk_Level", "Count"]

    color_map = {
        "🟢 Low Risk": "#4ADE80",
        "🟡 Medium Risk": "#FBBF24",
        "🔴 High Risk": "#F87171",
    }

    fig = px.pie(
        risk_counts,
        values="Count",
        names="Risk_Level",
        hole=0.45,
        title="<b>Customer Churn Risk Level Distribution</b>",
        color="Risk_Level",
        color_discrete_map=color_map,
    )
    fig.update_traces(textposition="inside", textinfo="percent+label")
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        height=350,
        margin=dict(l=20, r=20, t=50, b=20),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_sales_forecast_chart(combined_df: pd.DataFrame):
    """Renders an interactive Plotly line chart comparing Historical Actual Sales vs Fitted Trend vs Forecast."""
    if combined_df.empty:
        st.info("No data available for Sales Forecasting.")
        return

    hist_df = combined_df[combined_df["Type"] == "Historical"]
    forecast_df = combined_df[combined_df["Type"] == "Forecast"]

    if not hist_df.empty and not forecast_df.empty:
        last_hist_row = hist_df.iloc[-1:].copy()
        last_hist_row["Forecast_Sales"] = last_hist_row["Actual_Sales"]
        connect_forecast_df = pd.concat([last_hist_row, forecast_df], ignore_index=True)
    else:
        connect_forecast_df = forecast_df

    fig = go.Figure()

    # 1. Historical Actual Sales Line
    fig.add_trace(
        go.Scatter(
            x=hist_df["YearMonth"],
            y=hist_df["Actual_Sales"],
            mode="lines+markers",
            name="Historical Actual Sales (₹)",
            line=dict(color="#38BDF8", width=3),
            marker=dict(size=6),
            hovertemplate="<b>%{x}</b><br>Actual Sales: ₹%{y:,.2f}<extra></extra>",
        )
    )

    # 2. In-Sample Fitted Trend Line
    fig.add_trace(
        go.Scatter(
            x=hist_df["YearMonth"],
            y=hist_df["Fitted_Sales"],
            mode="lines",
            name="In-Sample Trend Line (₹)",
            line=dict(color="#94A3B8", width=2, dash="dash"),
            hovertemplate="<b>%{x}</b><br>Fitted Trend: ₹%{y:,.2f}<extra></extra>",
        )
    )

    # 3. Projected Future Forecast Line
    fig.add_trace(
        go.Scatter(
            x=connect_forecast_df["YearMonth"],
            y=connect_forecast_df["Forecast_Sales"],
            mode="lines+markers",
            name="Projected Forecast (₹)",
            line=dict(color="#F59E0B", width=3, dash="dot"),
            marker=dict(size=8, symbol="diamond"),
            hovertemplate="<b>%{x}</b><br>Forecast: ₹%{y:,.2f}<extra></extra>",
        )
    )

    fig.update_layout(
        title="<b>Monthly Sales Forecast & Linear Trend Model (INR)</b>",
        xaxis_title="Year-Month",
        yaxis_title="Monthly Sales Revenue (₹)",
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        height=420,
        margin=dict(l=20, r=20, t=50, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    )
    st.plotly_chart(fig, use_container_width=True)
