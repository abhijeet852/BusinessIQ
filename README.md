# DATAPULSE — Business Data Intelligence & Prediction Platform

An impressive, full-stack B.Tech Computer Science & Engineering (CSE) final-year portfolio project demonstrating data engineering pipelines, data quality scoring, relational 3NF database architecture, security authentication, business intelligence analytics, machine learning, and explainable decision support.

---

## 📌 Project Overview

**DataPulse** transforms raw business transaction data into trusted, explainable, and actionable business intelligence through a structured end-to-end data pipeline:

```text
RAW BUSINESS DATA (CSV / Excel)
    │
    ▼
AUTHENTICATION & RBAC (Admin / Analyst Roles)
    │
    ▼
DATA INGESTION & VALIDATION (Extract Engine)
    │
    ▼
DATA QUALITY ENGINE (Transparent Score 0-100 & Audit Log)
    │
    ▼
DATA CLEANING & TRANSFORMATION (Deduplication, Imputation, Parsing)
    │
    ▼
RELATIONAL DATABASE ENGINE (3NF Normalized Schema + Lineage Metadata)
    │
    ▼
ANALYTICS & ML PREDICTION ENGINE (K-Means, Churn Model Comparison, Forecasting)
    │
    ▼
EXPLAINABLE INSIGHTS & BUSINESS DECISION SUPPORT (Health Score & Recommendations)
```

---

## 🔑 Demo Login Credentials (Viva & Evaluation)

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@datapulse.com` | `admin123` | Full access: Upload, Clean, Import datasets, Settings, Analytics & ML |
| **`ANALYST`** | `analyst@datapulse.com` | `analyst123` | View access: Dashboard, Analytics, Predictions, View Quality, Export Reports |

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (Vite SPA) | Single Page Application frontend |
| **Styling** | Tailwind CSS | Clean light-themed design system |
| **Data Visualization** | Recharts (SVG) | Interactive trend lines, bar charts, and DAG topology |
| **Security & Auth** | JWT Tokens + PBKDF2 | Session security & role-based route authorization |
| **Backend Framework** | FastAPI (Python) | High-performance asynchronous REST API server |
| **Relational Database** | MySQL & SQLite | 3NF normalized schema (`customers`, `products`, `orders`, `users`) |
| **Data Engineering** | Pandas & NumPy | 5-stage ETL pipeline, Quality Engine (0-100), and aggregations |
| **Machine Learning** | Scikit-Learn (1.8.0) | K-Means, Logistic Regression, Random Forest, Linear Trend |
| **Testing** | `unittest` | Automated unit testing suite (`37/37 tests passing`) |

---

## 🚀 Key Features

1. 🔒 **Authentication & Role-Based Access Control (RBAC)**:
   - Password hashing (PBKDF2/SHA256) and JWT Bearer token authentication.
   - Enforced permissions in FastAPI backend and React frontend for **ADMIN** and **ANALYST** roles.
2. ⚡ **Unified Data Management Hub**:
   - Single workflow: `Upload` $\rightarrow$ `Preview` $\rightarrow$ `Validate` $\rightarrow$ `Data Quality (0–100)` $\rightarrow$ `Clean` $\rightarrow$ `Confirm Import` $\rightarrow$ `Processing History & Lineage`.
3. 🏆 **Data Quality Engine (0–100 Score)**:
   - Transparent Data Quality Score formula evaluating missing cells %, duplicate rows, invalid dates, and numeric outliers with an audit trail log.
4. 📊 **Shared Executive Dashboard**:
   - Transparent **Business Health Score (0–100)** formula combining Revenue Growth (30%), Profitability (30%), Customer Retention (20%), and Catalog Consistency (20%).
   - Dynamic **Business Alerts** and $2 \times 2$ **Profitability Matrix** (Stars, Volume Drivers, Niche Growth, Underperformers).
5. 🤖 **ML Model Comparison & SHAP-style Explainability**:
   - Side-by-side model comparison table (**Logistic Regression** vs **Random Forest Classifier**) using Accuracy, Precision, Recall, and F1-Score.
   - Feature contribution explainability breakdown ("Why did the model predict 78% churn probability?").
6. 👥 **Customer 360 & Actionable Business Recommendations**:
   - Interactive Customer 360 profile combining transactions, segment, churn risk score, and purchase history.
   - Transparent rule-based business recommendation engine suggesting specific retention and cross-selling campaigns.

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
