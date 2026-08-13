"""
src/modules/churn_prediction.py
-------------------------------
Machine Learning Customer Churn Prediction Module using Logistic Regression.

This module is responsible for:
1. Building customer-level behavioral feature matrix:
   - Recency_Days
   - Order_Count (Frequency)
   - Total_Spending (Monetary)
   - Avg_Order_Value (AOV)
   - Avg_Profit_Margin
2. Defining ground-truth target label `Churn` based on inactivity threshold (default = 90 days).
3. Normalizing features with StandardScaler.
4. Training a Logistic Regression baseline classification model.
5. Computing predicted churn probabilities and assigning Risk Levels (Low, Medium, High).
6. Calculating evaluation metrics (Accuracy, Precision, Recall, F1-Score, Confusion Matrix).
"""

from typing import Tuple, Dict, Any
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)


def build_churn_features(df: pd.DataFrame, recency_threshold_days: int = 90) -> pd.DataFrame:
    """
    Extracts customer-level feature matrix and defines target `Churn` binary label.

    Returns:
        pd.DataFrame with customer features and column 'Churn' (1 = Churned, 0 = Active).
    """
    if df.empty or "Customer_ID" not in df.columns:
        return pd.DataFrame()

    max_date = df["Order_Date"].max()

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

    cust_df["Recency_Days"] = (max_date - cust_df["Last_Order_Date"]).dt.days
    cust_df["Avg_Order_Value"] = np.round(
        cust_df["Total_Spending"] / cust_df["Order_Count"], 2
    )
    cust_df["Avg_Profit_Margin"] = np.where(
        cust_df["Total_Spending"] > 0,
        np.round((cust_df["Total_Profit"] / cust_df["Total_Spending"]) * 100, 2),
        0.0,
    )

    # Ground Truth Label: 1 if customer has been inactive past recency_threshold_days, else 0
    cust_df["Churn"] = (cust_df["Recency_Days"] > recency_threshold_days).astype(int)

    return cust_df


def train_churn_model(
    df: pd.DataFrame, recency_threshold_days: int = 90
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Trains Logistic Regression churn prediction model and computes evaluation metrics.

    Args:
        df: Input transactional DataFrame.
        recency_threshold_days: Days threshold for labeling churn (default = 90).

    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]:
            - customer_churn_df: Customer DataFrame enriched with Churn Probability and Risk Level.
            - metrics: Dictionary containing Accuracy, Precision, Recall, F1, and Confusion Matrix.
    """
    churn_data = build_churn_features(df, recency_threshold_days=recency_threshold_days)
    if churn_data.empty or len(churn_data) < 4:
        return churn_data, {}

    feature_cols = [
        "Recency_Days",
        "Order_Count",
        "Total_Spending",
        "Avg_Order_Value",
        "Avg_Profit_Margin",
    ]

    X = churn_data[feature_cols].copy()
    y = churn_data["Churn"].copy()

    # 1. Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 2. Train Logistic Regression Model
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X_scaled, y)

    # 3. Predict Probabilities & Labels
    probabilities = model.predict_proba(X_scaled)[:, 1]
    y_pred = model.predict(X_scaled)

    churn_data["Churn_Probability"] = np.round(probabilities * 100, 2)

    # 4. Assign Risk Levels
    def assign_risk(prob: float) -> str:
        if prob < 35.0:
            return "🟢 Low Risk"
        elif prob <= 65.0:
            return "🟡 Medium Risk"
        else:
            return "🔴 High Risk"

    churn_data["Risk_Level"] = churn_data["Churn_Probability"].apply(assign_risk)

    # 5. Compute Model Evaluation Metrics
    # Handle zero division safely for small test sets
    acc = accuracy_score(y, y_pred)
    prec = precision_score(y, y_pred, zero_division=0)
    rec = recall_score(y, y_pred, zero_division=0)
    f1 = f1_score(y, y_pred, zero_division=0)
    cm = confusion_matrix(y, y_pred)

    metrics = {
        "recency_threshold_days": recency_threshold_days,
        "total_customers": len(churn_data),
        "actual_churners": int(y.sum()),
        "accuracy": round(float(acc), 3),
        "precision": round(float(prec), 3),
        "recall": round(float(rec), 3),
        "f1_score": round(float(f1), 3),
        "confusion_matrix": cm.tolist(),  # [[TN, FP], [FN, TP]]
        "feature_importance": dict(zip(feature_cols, model.coef_[0].round(3))),
        "scaler": scaler,
        "model": model,
    }

    return churn_data.sort_values(by="Churn_Probability", ascending=False).reset_index(drop=True), metrics
