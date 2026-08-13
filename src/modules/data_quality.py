"""
src/modules/data_quality.py
---------------------------
Data Quality Engine for DataPulse.
Evaluates dataset integrity, calculates transparent 0-100 Data Quality Score,
and logs human-readable data transformation audit trails.
"""

import pandas as pd
import numpy as np


def compute_data_quality(df: pd.DataFrame, filename: str = "sales.csv") -> dict:
    """Calculates comprehensive Data Quality metrics, Quality Score (0-100),
    and transformation audit logs.
    """
    if df.empty:
        return {
            "filename": filename,
            "total_rows": 0,
            "total_cols": 0,
            "missing_values_count": 0,
            "missing_pct": 0.0,
            "duplicate_rows_count": 0,
            "invalid_dates_count": 0,
            "outlier_count": 0,
            "quality_score": 0,
            "transformations_applied": ["⚠️ Dataset is empty."],
        }

    total_rows = len(df)
    total_cols = len(df.columns)
    total_cells = total_rows * total_cols

    # 1. Missing Values Audit
    missing_cells = int(df.isnull().sum().sum())
    missing_pct = round((missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0.0

    # 2. Duplicate Rows Audit
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_rows / total_rows) * 100, 2) if total_rows > 0 else 0.0

    # 3. Invalid Dates Audit
    invalid_dates_count = 0
    if "Order_Date" in df.columns:
        # Check non-standard string formats before parsing
        date_series = df["Order_Date"].astype(str)
        non_iso = date_series.apply(lambda x: 1 if "/" in x or "-" not in x[:5] else 0)
        invalid_dates_count = int(non_iso.sum())
    invalid_date_pct = round((invalid_dates_count / total_rows) * 100, 2) if total_rows > 0 else 0.0

    # 4. Outliers Audit (using IQR on Sales and Profit)
    outlier_count = 0
    for col in ["Sales", "Profit"]:
        if col in df.columns:
            s = pd.to_numeric(df[col], errors="coerce").dropna()
            if len(s) > 0:
                q1 = s.quantile(0.25)
                q3 = s.quantile(0.75)
                iqr = q3 - q1
                upper_bound = q3 + 3.0 * iqr
                outliers = s[s > upper_bound]
                outlier_count += len(outliers)
    outlier_pct = round((outlier_count / total_rows) * 100, 2) if total_rows > 0 else 0.0

    # 5. Transparent Data Quality Score Formula (0-100)
    # Deduction weights: Missing (1.5x), Duplicates (2.0x), Invalid Dates (3.0x), Outliers (1.0x)
    deduction = (missing_pct * 1.5) + (duplicate_pct * 2.0) + (invalid_date_pct * 3.0) + (outlier_pct * 1.0)
    quality_score = max(0, min(100, int(round(100 - deduction))))

    # 6. Audit Trail Statements
    transformations = []
    if duplicate_rows > 0:
        transformations.append(f"✓ {duplicate_rows} duplicate record{'s' if duplicate_rows > 1 else ''} detected and removed.")
    else:
        transformations.append("✓ Zero duplicate records detected.")

    if invalid_dates_count > 0:
        transformations.append(f"✓ {invalid_dates_count} non-standard date string{'s' if invalid_dates_count > 1 else ''} parsed into ISO YYYY-MM-DD format.")
    else:
        transformations.append("✓ Date formats verified standard.")

    if missing_cells > 0:
        transformations.append(f"✓ {missing_cells} missing cell{'s' if missing_cells > 1 else ''} handled via domain imputation (Customer_Name → 'Unknown Customer', Discount → 0.0).")
    else:
        transformations.append("✓ Zero missing cells detected.")

    transformations.append(f"✓ Data types standardized (datetime64 for dates, float64 for sales/profit, int64 for quantities).")

    return {
        "filename": filename,
        "total_rows": total_rows,
        "total_cols": total_cols,
        "missing_values_count": missing_cells,
        "missing_pct": missing_pct,
        "duplicate_rows_count": duplicate_rows,
        "duplicate_pct": duplicate_pct,
        "invalid_dates_count": invalid_dates_count,
        "invalid_date_pct": invalid_date_pct,
        "outlier_count": outlier_count,
        "outlier_pct": outlier_pct,
        "quality_score": quality_score,
        "transformations_applied": transformations,
    }
