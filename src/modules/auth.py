"""
src/modules/auth.py
-------------------
Authentication & Role-Based Access Control (RBAC) Module for DataPulse.
Handles password hashing, JWT token generation/validation, user authentication,
and database persistence for ADMIN and ANALYST user roles.
"""

import hashlib
import os
import hmac
import json
import base64
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from src.modules.db_connector import get_db_connector, DatabaseConnector

# Secret key for signing JWT tokens (in production, loaded from environment variables)
JWT_SECRET = os.getenv("DATAPULSE_JWT_SECRET", "datapulse-secret-key-cse-final-year-2026")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24


# -----------------------------------------------------------------------------
# 1. PASSWORD HASHING & VERIFICATION (PBKDF2 SHA256)
# -----------------------------------------------------------------------------
def hash_password(password: str) -> str:
    """Hashes a plain-text password using PBKDF2 with SHA-256 and salt."""
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return base64.b64encode(salt + pwd_hash).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain-text password against a PBKDF2 hashed password string."""
    try:
        decoded = base64.b64decode(hashed_password.encode("utf-8"))
        salt = decoded[:16]
        stored_hash = decoded[16:]
        computed_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return hmac.compare_digest(stored_hash, computed_hash)
    except Exception:
        return False


# -----------------------------------------------------------------------------
# 2. JWT TOKEN GENERATION & DECODING
# -----------------------------------------------------------------------------
def create_jwt_token(payload: dict, expires_hours: int = TOKEN_EXPIRE_HOURS) -> str:
    """Generates a signed JWT token string containing user claims and expiration."""
    exp = int(time.time()) + (expires_hours * 3600)
    token_payload = {**payload, "exp": exp, "iat": int(time.time())}

    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode("utf-8")).decode("utf-8").rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(token_payload).encode("utf-8")).decode("utf-8").rstrip("=")

    signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signature_input, hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_jwt_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT token string. Returns payload if valid, else None."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None

        header_b64, payload_b64, signature_b64 = parts

        # Verify Signature
        signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_signature = hmac.new(JWT_SECRET.encode("utf-8"), signature_input, hashlib.sha256).digest()
        
        # Pad base64 if needed
        sig_padding = "=" * (-len(signature_b64) % 4)
        actual_signature = base64.urlsafe_b64decode(signature_b64 + sig_padding)

        if not hmac.compare_digest(expected_signature, actual_signature):
            return None

        payload_padding = "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + payload_padding).decode("utf-8"))

        if payload.get("exp") and time.time() > payload["exp"]:
            return None  # Expired token

        return payload
    except Exception:
        return None


# -----------------------------------------------------------------------------
# 3. DATABASE USERS SEEDING & AUTHENTICATION
# -----------------------------------------------------------------------------
def init_users_table(db: DatabaseConnector = None):
    """Creates users table and seeds initial ADMIN and ANALYST user accounts."""
    if not db:
        db = get_db_connector()

    conn = db.get_connection()
    cursor = conn.cursor()

    try:
        create_query = """
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(50) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """ if db.db_type == "sqlite" else """
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                password_hash TEXT NOT NULL,
                role VARCHAR(50) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
        cursor.execute(create_query)

        # Seed Users if table is empty
        cursor.execute("SELECT COUNT(*) FROM users;")
        count = cursor.fetchall()[0][0]

        if count == 0:
            admin_hash = hash_password("admin123")
            analyst_hash = hash_password("analyst123")

            seed_query = """
                INSERT INTO users (email, name, password_hash, role)
                VALUES (%s, %s, %s, %s);
            """ if db.db_type == "mysql" else """
                INSERT INTO users (email, name, password_hash, role)
                VALUES (?, ?, ?, ?);
            """

            cursor.execute(seed_query, ("admin@datapulse.com", "Abhijeet Admin", admin_hash, "ADMIN"))
            cursor.execute(seed_query, ("analyst@datapulse.com", "Priya Analyst", analyst_hash, "ANALYST"))
            conn.commit()

    finally:
        cursor.close()
        conn.close()


def authenticate_user(email: str, password: str, db: DatabaseConnector = None) -> Optional[dict]:
    """Authenticates email & password against users database."""
    if not db:
        db = get_db_connector()

    # Ensure table is initialized
    init_users_table(db)

    conn = db.get_connection()
    cursor = conn.cursor()

    try:
        query = "SELECT user_id, email, name, password_hash, role FROM users WHERE email = %s;" if db.db_type == "mysql" else "SELECT user_id, email, name, password_hash, role FROM users WHERE email = ?;"
        cursor.execute(query, (email.lower().strip(),))
        row = cursor.fetchone()

        if not row:
            # Fallback for default seed accounts if db not persisted
            if email == "admin@datapulse.com" and password == "admin123":
                return {"user_id": 1, "email": email, "name": "Abhijeet Admin", "role": "ADMIN"}
            elif email == "analyst@datapulse.com" and password == "analyst123":
                return {"user_id": 2, "email": email, "name": "Priya Analyst", "role": "ANALYST"}
            return None

        user_id, user_email, name, pwd_hash, role = row
        if verify_password(password, pwd_hash):
            return {"user_id": user_id, "email": user_email, "name": name, "role": role}

        return None
    finally:
        cursor.close()
        conn.close()
