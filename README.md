# DATAPULSE — Business Data Intelligence & Prediction Platform

An impressive, full-stack B.Tech Computer Science & Engineering (CSE) final-year portfolio project demonstrating data engineering pipelines, data quality scoring, relational 3NF database architecture, business intelligence analytics, machine learning, and explainable decision support.

---

## 📌 Project Overview

**DataPulse** transforms raw business transaction data through a structured 5-stage ETL pipeline into actionable business intelligence and machine learning predictions:

```text
RAW DATA (CSV / Excel)
    │
    ▼
DATA INGESTION (Extract Engine)
    │
    ▼
DATA VALIDATION & QUALITY ENGINE (Quality Score 0-100)
    │
    ▼
DATA CLEANING & TRANSFORMATION (Deduplication, Imputation, Parsing)
    │
    ▼
RELATIONAL DATABASE ENGINE (3NF Normalized Schema + Lineage Metadata)
    │
    ▼
ANALYTICS & ML PREDICTION ENGINE (K-Means, Model Comparison, Forecasting)
    │
    ▼
EXPLAINABLE INSIGHTS & BUSINESS DECISION SUPPORT (Health Score & Recommendations)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (Vite SPA) | Single Page Application frontend |
| **Styling** | Tailwind CSS | Clean light-themed design system |
| **Data Visualization** | Recharts (SVG) | Interactive trend lines, bar charts, and DAG topology |
| **Backend Framework** | FastAPI (Python) | High-performance asynchronous REST API server |
| **Relational Database** | MySQL & SQLite | 3NF normalized schema (`customers`, `products`, `orders`) |
| **Data Engineering** | Pandas & NumPy | 5-stage ETL pipeline, Quality Engine (0-100), and aggregations |
| **Machine Learning** | Scikit-Learn (1.8.0) | K-Means, Logistic Regression, Random Forest, Linear Trend |
| **Testing** | `unittest` | Automated unit testing suite (`36/36 tests passing`) |

---

## 🚀 Key Features

1. ⚡ **5-Stage Modular ETL Pipeline**:
   - `Extract`: Native CSV and Excel ingestion.
   - `Validate`: Schema column & type verification.
   - `Clean`: Deduplication, ISO date parsing, and missing cell imputation.
   - `Transform`: Profit margin calculation & feature engineering.
   - `Load`: Relational 3NF SQL migration.
2. 🏆 **Data Quality Engine (0–100 Score)**:
   - Transparent Data Quality Score formula evaluating missing cells %, duplicate rows, invalid dates, and numeric outliers.
   - Transformation audit log detailing every data cleansing operation applied.
3. 🌿 **Data Lineage Topology**:
   - Visual DAG graph tracking data flow from raw files to database storage and ML predictions.
4. 🩺 **Pipeline Status Monitor**:
   - Real-time stage health monitor tracking stage statuses (`Completed`, `Running`, `Failed`, `Warning`), processed record counts, and latency in milliseconds.
5. 📊 **Executive Data Pulse Dashboard**:
   - Transparent **Business Health Score (0–100)** formula combining Revenue Growth (30%), Profitability (30%), Customer Retention (20%), and Catalog Consistency (20%).
   - Dynamic **Business Alerts** (sales decline warnings, churn risk alerts, growth opportunities).
   - $2 \times 2$ **Profitability Matrix** (Stars, Volume Drivers, Niche Growth, Underperformers).
6. 🤖 **ML Model Comparison & SHAP-style Explainability**:
   - Side-by-side model comparison table (**Logistic Regression** vs **Random Forest Classifier**) using Accuracy, Precision, Recall, and F1-Score.
   - Feature contribution explainability breakdown ("Why did the model predict 78% churn probability?").
7. 👥 **Customer 360 & Actionable Business Recommendations**:
   - Interactive Customer 360 profile combining transactions, segment, churn risk score, and purchase history.
   - Rule-based business recommendation engine suggesting specific retention and cross-selling campaigns.

---

## 💻 How to Install and Run Locally

### Prerequisites
- Python 3.9+ installed
- Node.js v18+ and npm installed

### Step 1: Install Python Dependencies
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

Open your browser at **`http://localhost:3000`** to interact with **DataPulse**!
