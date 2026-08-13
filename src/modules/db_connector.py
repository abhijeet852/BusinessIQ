"""
src/modules/db_connector.py
----------------------------
Relational Database Connector & Schema Manager Module.

Supports:
1. Connecting to MySQL Server (using mysql.connector / PyMySQL).
2. Embedded Relational SQL database fallback (SQLite) for offline verification.
3. Automated table DDL creation for `customers`, `products`, and `orders`.
"""

import os
import sqlite3
from typing import Dict, Any, Tuple, Optional
import pandas as pd

# Check if MySQL connector libraries are available
try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False


class DatabaseConnector:
    """
    Manages database connections, schema DDL initialization, and query execution.
    """

    def __init__(
        self,
        db_type: str = "sqlite",
        host: str = "localhost",
        user: str = "root",
        password: str = "",
        database: str = "business_analytics_db",
        port: int = 3306,
        sqlite_file: str = "data/business_analytics.db",
    ):
        self.db_type = db_type.lower()
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.port = port
        self.sqlite_file = sqlite_file

    def get_connection(self):
        """
        Establishes and returns an active database connection.
        """
        if self.db_type == "mysql" and MYSQL_AVAILABLE:
            try:
                conn = mysql.connector.connect(
                    host=self.host,
                    user=self.user,
                    password=self.password,
                    database=self.database,
                    port=self.port,
                )
                return conn
            except Exception as e:
                # If MySQL connection fails, log warning and fallback to SQLite
                print(f"[Warning] MySQL connection failed ({e}). Using embedded SQLite database fallback.")

        # Default SQLite connection
        os.makedirs(os.path.dirname(self.sqlite_file), exist_ok=True)
        conn = sqlite3.connect(self.sqlite_file)
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def create_tables(self) -> None:
        """
        Creates normalized 3NF tables (`customers`, `products`, `orders`)
        with Primary Keys, Foreign Keys, and Constraints.
        """
        conn = self.get_connection()
        cursor = conn.cursor()

        if self.db_type == "mysql" and MYSQL_AVAILABLE and isinstance(conn, mysql.connector.connection.MySQLConnection):
            # MySQL DDL Schema Definitions
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS customers (
                    customer_id VARCHAR(50) PRIMARY KEY,
                    customer_name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS products (
                    product_id INT AUTO_INCREMENT PRIMARY KEY,
                    product_name VARCHAR(150) UNIQUE NOT NULL,
                    category VARCHAR(50) NOT NULL
                );
                """
            )

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS orders (
                    order_id VARCHAR(50) PRIMARY KEY,
                    order_date DATE NOT NULL,
                    customer_id VARCHAR(50) NOT NULL,
                    product_id INT NOT NULL,
                    region VARCHAR(50) NOT NULL,
                    quantity INT NOT NULL,
                    sales DECIMAL(10, 2) NOT NULL,
                    discount DECIMAL(5, 2) DEFAULT 0.00,
                    profit DECIMAL(10, 2) NOT NULL,
                    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
                );
                """
            )
        else:
            # SQLite Compatible DDL Schema Definitions
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS customers (
                    customer_id TEXT PRIMARY KEY,
                    customer_name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS products (
                    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_name TEXT UNIQUE NOT NULL,
                    category TEXT NOT NULL
                );
                """
            )

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS orders (
                    order_id TEXT PRIMARY KEY,
                    order_date DATE NOT NULL,
                    customer_id TEXT NOT NULL,
                    product_id INTEGER NOT NULL,
                    region TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    sales REAL NOT NULL,
                    discount REAL DEFAULT 0.0,
                    profit REAL NOT NULL,
                    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
                    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
                );
                """
            )

        conn.commit()
        conn.close()
        print("[Database] Schema tables (customers, products, orders) initialized successfully.")


def get_db_connector(db_type: str = "sqlite") -> DatabaseConnector:
    """Helper factory function to get DatabaseConnector instance."""
    return DatabaseConnector(db_type=db_type)
