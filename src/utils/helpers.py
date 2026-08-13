"""
src/utils/helpers.py
---------------------
Centralized utility functions for Indian Rupee (INR - ₹) formatting,
Indian compact number notations (Lakhs / Crores), status checks, and data display helpers.
"""

from datetime import datetime
import pandas as pd
import numpy as np


def format_currency(value: float, compact: bool = False) -> str:
    """Formats numeric values as Indian Rupee (INR - ₹) using Indian number system.

    Examples:
        format_currency(1500) -> "₹1,500"
        format_currency(25000) -> "₹25,000"
        format_currency(125000) -> "₹1,25,000"
        format_currency(1250000) -> "₹12,50,000"
        format_currency(125000, compact=True) -> "₹1.25 L"
        format_currency(12500000, compact=True) -> "₹1.25 Cr"
    """
    if pd.isna(value) or value is None:
        return "₹0"

    val_float = float(value)
    abs_val = abs(val_float)
    sign = "-" if val_float < 0 else ""

    if compact:
        if abs_val >= 10_000_000:  # 1 Crore = 10,000,000 (10^7)
            return f"{sign}₹{abs_val / 10_000_000:.2f} Cr"
        elif abs_val >= 100_000:  # 1 Lakh = 100,000 (10^5)
            return f"{sign}₹{abs_val / 100_000:.2f} L"
        elif abs_val >= 1_000:
            return f"{sign}₹{abs_val / 1_000:.1f} K"

    # Indian Number System Comma Formatting
    s = f"{abs_val:,.2f}".split('.')
    integer_part = s[0].replace(',', '')
    decimal_part = f".{s[1]}" if float(f"0.{s[1]}") > 0 else ""

    if len(integer_part) <= 3:
        formatted_int = integer_part
    else:
        last3 = integer_part[-3:]
        remaining = integer_part[:-3]
        groups = []
        while len(remaining) > 2:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.insert(0, remaining)
        formatted_int = ",".join(groups) + "," + last3

    return f"{sign}₹{formatted_int}{decimal_part}"


def format_percentage(value: float) -> str:
    """Format float values as percentage (e.g. 15.5%)."""
    if pd.isna(value) or value is None:
        return "0.0%"
    return f"{value:.1f}%"


def get_system_status() -> dict:
    """Check health and timestamp of the application."""
    return {
        "status": "Operational",
        "currency": "INR (₹)",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "pandas_version": pd.__version__,
        "numpy_version": np.__version__,
    }
