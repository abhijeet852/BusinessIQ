"""
src/modules/sales_forecasting.py
--------------------------------
Sales Forecasting Engine using Linear Trend Regression.

This module is responsible for:
1. Aggregating historical transactions into monthly sales time series.
2. Training an explainable Linear Trend Regression model (y = m * t + c).
3. Calculating in-sample model evaluation metrics (MAE, RMSE, R² Score).
4. Projecting future monthly sales for user-selected forecast horizons (3, 6, 12 months).
"""

from typing import Tuple, Dict, Any
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def aggregate_monthly_sales(df: pd.DataFrame) -> pd.DataFrame:
    """
    Groups transaction data into a chronological monthly time series with month index 't'.

    Returns:
        pd.DataFrame with columns ['YearMonth', 'Month_Index', 'Actual_Sales', 'Actual_Profit']
    """
    if df.empty or "Order_Date" not in df.columns:
        return pd.DataFrame()

    temp_df = df.copy()
    temp_df["YearMonth"] = temp_df["Order_Date"].dt.to_period("M").astype(str)

    monthly_df = (
        temp_df.groupby("YearMonth")[["Sales", "Profit"]]
        .sum()
        .reset_index()
        .sort_values(by="YearMonth")
    )
    monthly_df.rename(columns={"Sales": "Actual_Sales", "Profit": "Actual_Profit"}, inplace=True)
    monthly_df["Month_Index"] = np.arange(1, len(monthly_df) + 1)

    return monthly_df


def fit_sales_forecast(
    df: pd.DataFrame, forecast_months: int = 3
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Fits Linear Trend model on monthly historical sales and projects future revenue.

    Args:
        df: Input transactional DataFrame.
        forecast_months: Number of future months to predict (default = 3).

    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]:
            - combined_df: Unified DataFrame containing Historical Actuals, Fitted Values, and Forecast Projections.
            - metrics: Dictionary containing MAE, RMSE, R² Score, and Monthly Growth Rate.
    """
    monthly_df = aggregate_monthly_sales(df)

    if monthly_df.empty or len(monthly_df) < 3:
        return monthly_df, {}

    # Historical feature X and target y
    X_hist = monthly_df[["Month_Index"]].values
    y_hist = monthly_df["Actual_Sales"].values

    # 1. Fit Linear Regression Model
    model = LinearRegression()
    model.fit(X_hist, y_hist)

    # 2. In-sample predictions & Evaluation Metrics
    y_fitted = model.predict(X_hist)
    monthly_df["Fitted_Sales"] = np.round(y_fitted, 2)
    monthly_df["Forecast_Sales"] = np.nan
    monthly_df["Type"] = "Historical"

    mae = float(mean_absolute_error(y_hist, y_fitted))
    rmse = float(np.sqrt(mean_squared_error(y_hist, y_fitted)))
    r2 = float(r2_score(y_hist, y_fitted))
    monthly_slope = float(model.coef_[0])

    # 3. Project Future Forecast Months
    last_month_str = monthly_df["YearMonth"].max()
    last_period = pd.Period(last_month_str, freq="M")
    last_index = len(monthly_df)

    future_records = []
    for step in range(1, forecast_months + 1):
        future_index = last_index + step
        future_period = (last_period + step).strftime("%Y-%m")
        pred_sales = max(0.0, float(model.predict([[future_index]])[0]))

        future_records.append(
            {
                "YearMonth": future_period,
                "Actual_Sales": np.nan,
                "Actual_Profit": np.nan,
                "Month_Index": future_index,
                "Fitted_Sales": np.nan,
                "Forecast_Sales": round(pred_sales, 2),
                "Type": "Forecast",
            }
        )

    future_df = pd.DataFrame(future_records)
    combined_df = pd.concat([monthly_df, future_df], ignore_index=True)

    metrics = {
        "forecast_months": forecast_months,
        "historical_months_count": len(monthly_df),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2_score": round(r2, 3),
        "monthly_growth_rate": round(monthly_slope, 2),
        "total_historical_sales": float(y_hist.sum()),
        "total_forecasted_sales": float(future_df["Forecast_Sales"].sum()),
        "model": model,
    }

    return combined_df, metrics
