# System Architecture & Engineering Documentation: BusinessIQ

**BusinessIQ** is a full-stack, 3-tier Business Analytics and Customer Insights Platform engineered as a final-year Computer Science & Engineering (CSE) portfolio project.

---

## 🏛️ 1. Overall System Architecture

```text
                     +-----------------------------------+
                     |    React 18 + Tailwind CSS SPA    |
                     |  (Recharts, Lucide Icons, Vite)   |
                     +-----------------+-----------------+
                                       |
                                       | HTTP REST API (JSON)
                                       v
                     +-----------------------------------+
                     |      FastAPI Python Server        |
                     |      (Uvicorn / Port 8000)        |
                     +-----------------+-----------------+
                                       |
           +---------------------------+---------------------------+
           |                           |                           |
           v                           v                           v
+--------------------+   +--------------------+   +--------------------+
|  Python ML Engine  |   |  SQL Analytics DB  |   | Pandas Data Engine |
| (Scikit-Learn ML)  |   | (db_analytics.py)  |   |  (data_loader.py)  |
+--------------------+   +---------+----------+   +--------------------+
                                   |
                                   v
                      +--------------------------+
                      | MySQL / SQLite Database  |
                      | [customers, products,    |
                      |        orders]           |
                      +--------------------------+
```

### Layer Breakdown:
1. **Presentation Layer (Frontend)**: Single Page Application (SPA) built with React 18, Tailwind CSS, Recharts SVG charting library, and Lucide Icons. Communicates asynchronously with the backend via Axios REST API services.
2. **Application / API Layer (Backend)**: Asynchronous REST API server built using Python FastAPI and Uvicorn. Exposes structured JSON endpoints with CORS security middleware.
3. **Business & Machine Learning Engine**: Scikit-Learn (K-Means, Logistic Regression, Linear Regression), Pandas, and NumPy modules for feature extraction, model fitting, and metrics calculation.
4. **Data Persistence Layer (Database)**: 3NF Normalized Relational Database (`customers`, `products`, `orders`) supporting MySQL Server and SQLite embedded fallbacks.

---

## 🗄️ 2. Relational Database Design (3NF Normalization)

```text
               +-------------------+
               |     CUSTOMERS     |
               +-------------------+
               | customer_id (PK)  |
               | customer_name     |
               | created_at        |
               +---------+---------+
                         | 1
                         |
                         | N
               +---------v---------+          +-------------------+
               |      ORDERS       |          |     PRODUCTS      |
               +-------------------+          +-------------------+
               | order_id (PK)     |<---------| product_id (PK)   |
               | order_date        | N      1 | product_name (UK) |
               | customer_id (FK)  |          | category          |
               | product_id (FK)   |          +-------------------+
               | region            |
               | quantity          |
               | sales             |
               | discount          |
               | profit            |
               +-------------------+
```

### Database Normalization Principles (3NF):
- **1NF**: Every cell contains atomic values.
- **2NF**: All non-key attributes (`customer_name`, `product_name`, `category`) are fully functionally dependent on their table's Primary Key.
- **3NF**: Removed transitive dependencies. Customer names are not repeated in the `orders` table; instead, `orders.customer_id` references `customers.customer_id` via a Foreign Key constraint.

---

## 🤖 3. Machine Learning Components

### A. Customer Behavioral Segmentation (K-Means Clustering)
- **Algorithm**: Unsupervised $K$-Means Clustering (`sklearn.cluster.KMeans`).
- **Features Used**: `Total_Spending` (Monetary), `Order_Count` (Frequency), `Avg_Order_Value` (AOV), `Recency_Days` (Recency).
- **Preprocessing**: `StandardScaler` standardizes features to zero mean and unit variance, preventing monetary Rupee amounts (₹) from dominating Euclidean distance metrics over recency days.
- **Cluster Profiles ($K=3$)**:
  1. **⭐ High-Value Champions**: High spending, high order frequency, recent activity.
  2. **🔵 Regular Loyal Customers**: Moderate spending, consistent order frequency.
  3. **⚠️ At-Risk / Low Engagement**: Low spending, low frequency, high recency days.

### B. Customer Churn Prediction (Logistic Regression)
- **Algorithm**: Supervised Logistic Regression Classifier (`sklearn.linear_model.LogisticRegression`).
- **Target Label**: `Churn = 1` if `Recency_Days > 90` days, else `0`.
- **Outputs**: Churn Probability % ($P(\text{Churn})$) mapped to Risk Levels:
  - **🟢 Low Risk**: $P(\text{Churn}) < 35\%$
  - **🟡 Medium Risk**: $35\% \le P(\text{Churn}) \le 65\%$
  - **🔴 High Risk**: $P(\text{Churn}) > 65\%$
- **Evaluation Metrics**: Accuracy, Precision, Recall, F1-Score, Confusion Matrix Heatmap.

### C. Time-Series Sales Forecasting (Linear Trend Regression)
- **Algorithm**: Linear Trend Regression ($y = m \cdot t + c$) where $t$ is the month index ($1, 2, \dots, N$) and $y$ is monthly revenue (₹).
- **Evaluation Metrics**: MAE (Mean Absolute Error), RMSE (Root Mean Squared Error), and $R^2$ Score.

---

## 🎓 4. Placement Interview Questions & Answers

### Q1: Why did you separate the frontend and backend into React and FastAPI instead of building everything in Streamlit?
**Answer**: Streamlit is excellent for rapid prototyping, but real-world engineering applications require a decoupled client-server architecture. Using React with Tailwind CSS gives complete control over UI components, layout, state management, and responsiveness. FastAPI provides high-performance, asynchronous REST APIs, separating presentation logic from data computation.

### Q2: Why did you use `StandardScaler` before running K-Means clustering?
**Answer**: K-Means calculates Euclidean distance between data points: $d(x, y) = \sqrt{\sum (x_i - y_i)^2}$. If features have vastly different scales—for example, `Total_Spending` ($1,000 to $20,000) versus `Recency_Days` (0 to 90 days)—the spending feature will completely dominate the distance calculation. `StandardScaler` standardizes each feature to have a mean of 0 and a standard deviation of 1.

### Q3: How do you prevent SQL Injection vulnerabilities in your database queries?
**Answer**: All database queries in `src/modules/db_analytics.py` use parameterized SQL statements with placeholder bindings (`?` or `%s`). User inputs (such as selected regions, categories, or date bounds) are passed as tuples to the database engine driver, preventing malicious SQL command execution.

### Q4: What are the limitations of your churn prediction model?
**Answer**: Historical transaction data lacks qualitative signals like customer satisfaction scores, support ticket history, or competitor price changes. Additionally, defining churn solely based on an inactivity threshold (e.g. 90 days) can introduce definition bias when recency is also used as a predictor.
