# backend/database.py
import psycopg2
import psycopg2.extras
import json
from config import Config
from datetime import datetime

def get_connection():
    return psycopg2.connect(Config.DATABASE_URL)

def init_db():
    """Create all tables if they don't exist."""
    try:
        conn = get_connection()
        cur  = conn.cursor()

        # Users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id           SERIAL PRIMARY KEY,
                email        VARCHAR(255) UNIQUE NOT NULL,
                password     VARCHAR(255) NOT NULL,
                full_name    VARCHAR(255),
                gender       VARCHAR(50),
                age          INTEGER,
                blood_group  VARCHAR(10),
                conditions   TEXT,
                created_at   TIMESTAMP DEFAULT NOW()
            )
        """)

        # Reports table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id         SERIAL PRIMARY KEY,
                user_id    INTEGER REFERENCES users(id),
                symptoms   TEXT[],
                age        INTEGER,
                result     JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        conn.commit()
        cur.close()
        conn.close()
        print("[DB] Tables ready")
    except Exception as e:
        print(f"[DB] Init failed: {e}")

# ─── USER FUNCTIONS ───────────────────────────────────────

def create_user(email: str, password: str) -> dict:
    """Create a new user."""
    try:
        conn = get_connection()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING id, email",
            (email, password)
        )
        user = dict(cur.fetchone())
        conn.commit()
        cur.close()
        conn.close()
        print(f"[DB] User created: {email}")
        return user
    except psycopg2.errors.UniqueViolation:
        print(f"[DB] Email already exists: {email}")
        return None
    except Exception as e:
        print(f"[DB] Create user failed: {e}")
        return None

def get_user_by_email(email: str) -> dict:
    """Fetch user by email."""
    try:
        conn = get_connection()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        return dict(user) if user else None
    except Exception as e:
        print(f"[DB] Get user failed: {e}")
        return None

def get_user_by_id(user_id: int) -> dict:
    """Fetch user by ID."""
    try:
        conn = get_connection()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "SELECT id, email, full_name, gender, age, blood_group, conditions FROM users WHERE id = %s",
            (user_id,)
        )
        user = cur.fetchone()
        cur.close()
        conn.close()
        return dict(user) if user else None
    except Exception as e:
        print(f"[DB] Get user by id failed: {e}")
        return None

def update_profile(user_id: int, full_name: str, gender: str,
                   age: int, blood_group: str, conditions: str) -> bool:
    """Update user profile."""
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute("""
            UPDATE users
            SET full_name=%s, gender=%s, age=%s,
                blood_group=%s, conditions=%s
            WHERE id=%s
        """, (full_name, gender, age, blood_group, conditions, user_id))
        conn.commit()
        cur.close()
        conn.close()
        print(f"[DB] Profile updated for user {user_id}")
        return True
    except Exception as e:
        print(f"[DB] Profile update failed: {e}")
        return False

# ─── REPORT FUNCTIONS ─────────────────────────────────────

def save_report(user_id: int, symptoms: list,
                age: int, result: dict) -> bool:
    """Save a triage report."""
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO reports (user_id, symptoms, age, result) VALUES (%s, %s, %s, %s)",
            (user_id, symptoms, age, json.dumps(result))
        )
        conn.commit()
        cur.close()
        conn.close()
        print("[DB] Report saved successfully")
        return True
    except Exception as e:
        print(f"[DB] Save failed: {e}")
        return False

def get_reports(user_id: int) -> list:
    """Fetch reports for a specific user."""
    try:
        conn = get_connection()
        cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT symptoms, age, result, created_at
            FROM reports
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 20
        """, (user_id,))
        rows = cur.fetchall()
        cur.close()
        conn.close()

        reports = []
        for row in rows:
            reports.append({
                "symptoms":   list(row["symptoms"]),
                "age":        row["age"],
                "result":     row["result"],
                "created_at": row["created_at"].isoformat(),
            })
        return reports
    except Exception as e:
        print(f"[DB] Fetch failed: {e}")
        return []