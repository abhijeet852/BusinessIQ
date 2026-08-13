/**
 * frontend/src/utils/formatters.js
 * --------------------------------
 * Centralized Indian Rupee (INR - ₹) formatting utilities.
 * Enforces Indian Numbering System formatting (Lakhs & Crores).
 */

export const formatCurrency = (val, compact = false) => {
  if (val === null || val === undefined || isNaN(val)) {
    return '₹0';
  }

  const num = Number(val);
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  // Compact Indian notation for large dashboard metrics or chart axes
  if (compact) {
    if (absNum >= 10000000) {
      // 1 Crore = 1,00,00,000
      return `${sign}₹${(absNum / 10000000).toFixed(2)} Cr`;
    } else if (absNum >= 100000) {
      // 1 Lakh = 1,00,000
      return `${sign}₹${(absNum / 100000).toFixed(2)} L`;
    } else if (absNum >= 1000) {
      return `${sign}₹${(absNum / 1000).toFixed(1)} K`;
    }
  }

  // Standard Indian locale formatting (en-IN)
  try {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(absNum);
    return num < 0 ? `-${formatted}` : formatted;
  } catch (e) {
    return `${sign}₹${absNum.toLocaleString('en-IN')}`;
  }
};

export const formatCompactCurrency = (val) => {
  return formatCurrency(val, true);
};
