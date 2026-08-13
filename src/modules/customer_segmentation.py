"""
src/modules/customer_segmentation.py
-----------------------------------
Machine Learning Customer Segmentation Module using K-Means Clustering & RFM Analysis.

This module is responsible for:
1. Extracting customer-level behavioral features:
   - Total_Spending (Monetary)
   - Order_Count (Frequency)
   - Avg_Order_Value (AOV)
   - Recency_Days (Recency since last purchase)
2. Normalizing feature scales using StandardScaler.
3. Training K-Means Unsupervised Clustering model.
4. Mapping numeric clusters to meaningful, human-readable business segment profiles.
"""

from typing import Tuple, Dict, Any
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score


def build_customer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts customer-level behavioral metrics from transaction data.

    Returns:
        pd.DataFrame with columns:
        ['Customer_ID', 'Customer_Name', 'Total_Spending', 'Total_Profit',
         'Order_Count', 'Avg_Order_Value', 'Recency_Days', 'Last_Order_Date']
    """
    if df.empty or "Customer_ID" not in df.columns:
        return pd.DataFrame()

    max_order_date = df["Order_Date"].max()

    cust_df = (
        df.groupby(["Customer_ID", "Customer_Name"])
        .agg(
            Total_Spending=("Sales", "sum"),
            Total_Profit=("Profit", "sum"),
            Order_Count=("Order_ID", "nunique"),
            Last_Order_Date=("Order_Date", "max"),
        )
        .reset_index()
    )

    # Compute Recency (days elapsed since customer's last order relative to dataset max date)
    cust_df["Recency_Days"] = (max_order_date - cust_df["Last_Order_Date"]).dt.days

    # Compute Average Order Value (AOV)
    cust_df["Avg_Order_Value"] = np.round(
        cust_df["Total_Spending"] / cust_df["Order_Count"], 2
    )

    return cust_df


def fit_kmeans_segmentation(
    df: pd.DataFrame, n_clusters: int = 3
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Executes K-Means Machine Learning Clustering on customer features.

    Args:
        df: Input transactional DataFrame.
        n_clusters: Number of clusters (default = 3).

    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]:
            - segmented_df: Customer DataFrame enriched with Cluster IDs and Segment Labels.
            - model_metrics: Dictionary containing inertia, silhouette score, and cluster profiles.
    """
    cust_features = build_customer_features(df)
    if cust_features.empty or len(cust_features) < n_clusters:
        return cust_features, {}

    feature_cols = ["Total_Spending", "Order_Count", "Avg_Order_Value", "Recency_Days"]
    X = cust_features[feature_cols].copy()

    # 1. Feature Scaling using StandardScaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 2. Train K-Means Unsupervised Model
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    raw_clusters = kmeans.fit_predict(X_scaled)

    cust_features["Raw_Cluster"] = raw_clusters

    # 3. Calculate Silhouette Score for evaluation
    try:
        sil_score = float(silhouette_score(X_scaled, raw_clusters))
    except Exception:
        sil_score = 0.0

    # 4. Map raw cluster IDs to human-readable business segment labels based on mean Total_Spending
    cluster_means = cust_features.groupby("Raw_Cluster")["Total_Spending"].mean().sort_values(ascending=False)
    sorted_cluster_ids = list(cluster_means.index)

    # Default labels for K=3
    label_names = ["⭐ High-Value Champions", "🔵 Regular Loyal Customers", "⚠️ At-Risk / Low Engagement"]

    label_mapping = {}
    for idx, raw_id in enumerate(sorted_cluster_ids):
        if idx < len(label_names):
            label_mapping[raw_id] = label_names[idx]
        else:
            label_mapping[raw_id] = f"Segment {idx + 1}"

    cust_features["Segment"] = cust_features["Raw_Cluster"].map(label_mapping)

    # 5. Build Cluster Profiles Summary
    segment_summary = (
        cust_features.groupby("Segment")
        .agg(
            Customer_Count=("Customer_ID", "count"),
            Avg_Total_Spending=("Total_Spending", "mean"),
            Avg_Order_Count=("Order_Count", "mean"),
            Avg_Order_Value=("Avg_Order_Value", "mean"),
            Avg_Recency_Days=("Recency_Days", "mean"),
        )
        .reset_index()
        .sort_values(by="Avg_Total_Spending", ascending=False)
    )

    model_metrics = {
        "n_clusters": n_clusters,
        "inertia": float(kmeans.inertia_),
        "silhouette_score": round(sil_score, 3),
        "total_customers_segmented": len(cust_features),
        "segment_summary": segment_summary,
        "scaler": scaler,
        "model": kmeans,
    }

    return cust_features, model_metrics
