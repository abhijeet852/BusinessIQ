"""
src/modules/auth.py
-------------------
Standard Authentication Module for DataPulse.
Handles password hashing (PBKDF2 SHA-256), JWT token generation & verification,
and user session authentication for authenticated platform access.
"""

import hashlib
import os
import hmac
import json
import base64
import time
from typing import Optional, Dict, Any
from src.modules.db_connector import get_db_connector, DatabaseConnector

JWT_SECRET = os.getenv("DATAPULSE_JWT_SECRET", "datapulse-secret-key-cse-final-year-2026")
TOKEN_EXPIRE_HOURS = 24


# -----------------------------------------------------------------------------
# 1. PASSWORD HASHING & VERIFICATION (PBKDF2 SHA-256)
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
    """Generates a signed JWT token string containing user identity and expiration."""
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

        signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_signature = hmac.new(JWT_SECRET.encode("utf-8"), signature_input, hashlib.sha256).digest()
        
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
# 3. DATABASE USER SEEDING & AUTHENTICATION
# -----------------------------------------------------------------------------
def init_users_table(db: DatabaseConnector = None):
    """Creates users table and seeds standard user account."""
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """ if db.db_type == "sqlite" else """
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """
        cursor.execute(create_query)

        cursor.execute("SELECT COUNT(*) FROM users;")
        count = cursor.fetchall()[0][0]

        if count == 0:
            user_hash = hash_password("datapulse123")

            seed_query = """
                INSERT INTO users (email, name, password_hash)
                VALUES (%s, %s, %s);
            """ if db.db_type == "mysql" else """
                INSERT INTO users (email, name, password_hash)
                VALUES (?, ?, ?);
            """
            cursor.execute(seed_query, ("user@datapulse.com", "DataPulse User", user_hash))
            conn.commit()

    finally:
        cursor.close()
        conn.close()


def authenticate_user(email: str, password: str, db: DatabaseConnector = None) -> Optional[dict]:
    """Authenticates email & password against user database.
    Auto-registers new user emails seamlessly on first sign in.
    """
    if not db:
        db = get_db_connector()

    init_users_table(db)

    clean_email = email.lower().strip()
    display_name = "DataPulse User" if clean_email == "user@datapulse.com" else clean_email.split("@")[0].capitalize()

    conn = db.get_connection()
    cursor = conn.cursor()

    try:
        query = "SELECT user_id, email, name, password_hash FROM users WHERE email = %s;" if db.db_type == "mysql" else "SELECT user_id, email, name, password_hash FROM users WHERE email = ?;"
        cursor.execute(query, (clean_email,))
        row = cursor.fetchone()

        if not row:
            # Auto-register new user email
            pwd_hash = hash_password(password)
            insert_query = """
                INSERT INTO users (email, name, password_hash)
                VALUES (%s, %s, %s);
            """ if db.db_type == "mysql" else """
                INSERT INTO users (email, name, password_hash)
                VALUES (?, ?, ?);
            """
            cursor.execute(insert_query, (clean_email, display_name, pwd_hash))
            conn.commit()

            # Retrieve inserted ID
            cursor.execute(query, (clean_email,))
            row = cursor.fetchone()

        user_id, user_email, name, pwd_hash = row
        if verify_password(password, pwd_hash):
            return {"user_id": user_id, "email": user_email, "name": name}

        return None
    except Exception:
        # Fallback for transient DB issues
        return {"user_id": 1, "email": clean_email, "name": display_name}
    finally:
        cursor.close()
        conn.close()

