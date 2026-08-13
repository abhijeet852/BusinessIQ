# BusinessIQ: Business Analytics & Customer Insights Platform

An impressive, full-stack B.Tech Computer Science & Engineering (CSE) final-year portfolio project demonstrating production-grade software engineering, relational database design, data analytics, and machine learning.

---

## 📌 Project Overview

**BusinessIQ** is an interactive, 3-tier Business Analytics and Customer Insights Platform engineered with **React 18**, **Tailwind CSS**, **FastAPI**, **MySQL / SQLite**, **Pandas**, and **Scikit-Learn**.

The system enables business leaders to analyze historical sales metrics, evaluate product performance, track customer accounts, predict customer churn risks, perform ML customer segmentation, and forecast future revenue trends.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (Vite SPA) | Single Page Application frontend |
| **Styling** | Tailwind CSS | Clean, modern light-themed design system |
| **Data Visualization** | Recharts (SVG) | Interactive charts (Line trends, Bar charts, Donut charts) |
| **Backend Framework** | FastAPI (Python) | High-performance asynchronous REST API server |
| **Relational Database** | MySQL & SQLite | 3NF normalized schema (`customers`, `products`, `orders`) |
| **Data Engineering** | Pandas & NumPy | Ingestion pipeline, missing value imputation & aggregations |
| **Machine Learning** | Scikit-Learn (1.8.0) | K-Means Clustering, Logistic Regression, Linear Trend Regression |
| **Testing** | `unittest` | Automated unit testing suite (`28/28 tests passing`) |

---

## 🚀 Key Features

1. 📊 **Executive Dashboard**: High-level KPI summary cards (Revenue, Profit, Orders, Customers), period-over-period trend badges, Monthly Revenue line chart, Sales by Category bar chart, Sales by Region donut chart, and Top Products summary table.
2. 💰 **Sales Analytics**: Detailed sales transactions table with pagination, category performance, regional breakdown, and multi-dimensional date/category/region filtering.
3. 👥 **Customer Analytics**: Customer account rankings, total spending, order frequency, and customer metrics.
4. 📦 **Product Analytics**: Product catalog performance table, revenue, units sold, net profit, and profit margins.
5. 🌐 **Regional Analysis**: Regional sales and profit comparison charts and market share distribution table.
6. 🤖 **Customer Behavioral Segmentation (K-Means ML)**: Unsupervised $K$-Means clustering ($K=3$) using normalized RFM features (Total Spending, Order Count, AOV, Recency Days).
7. 🔮 **Customer Churn Risk Prediction (Logistic Regression ML)**: Supervised classification model estimating churn probabilities $P(\text{Churn})$, risk levels (Low, Medium, High), and model evaluation metrics (Accuracy, Precision, Recall, F1-Score, Confusion Matrix).
8. 📈 **Sales Forecasting (Linear Trend ML)**: Time-series revenue forecasting ($y = m \cdot t + c$) for $3$, $6$, or $12$ months ahead with in-sample MAE, RMSE, and $R^2$ accuracy evaluation.
9. 📁 **Data Upload & Validation**: CSV and Excel dataset upload dropzone with row/column audit, schema validation, missing value count, and import confirmation.
10. 📄 **Reports Exporter**: Downloadable CSV report generator reflecting active UI filter selections.

---

## 💻 How to Install and Run Locally

### Prerequisites
- Python 3.9+ installed
- Node.js v18+ and npm installed

### Step 1: Clone Repository & Install Python Backend Dependencies
```powershell
cd d:\BusinessAnalyticsPlatform
pip install -r requirements.txt
```

### Step 2: Initialize Database & Run Unit Tests
```powershell
python scripts/migrate_csv_to_db.py
python -m unittest discover -s tests
```

### Step 3: Launch FastAPI REST API Server
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 4: Install Frontend Dependencies & Launch React Application
In a new terminal window:
```powershell
cd d:\BusinessAnalyticsPlatform\frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:3000`** to view and interact with **BusinessIQ**!
