# backend/database.py
import psycopg2
import psycopg2.extras
import json
from config import Config
from datetime import datetime

def get_connection():
    """Create a new database connection."""
    return psycopg2.connect(Config.DATABASE_URL)

def init_db():
    """Create reports table if it doesn't exist."""
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id         SERIAL PRIMARY KEY,
                symptoms   TEXT[],
                age        INTEGER,
                result     JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("[DB] Table ready")
    except Exception as e:
        print(f"[DB] Init failed: {e}")

def save_report(symptoms: list, age: int, result: dict) -> bool:
    """Save a triage report to PostgreSQL."""
    try:
        conn = get_connection()
        cur  = conn.cursor()
        cur.execute(
            """
            INSERT INTO reports (symptoms, age, result)
            VALUES (%s, %s, %s)
            """,
            (symptoms, age, json.dumps(result))
        )
        conn.commit()
        cur.close()
        conn.close()
        print("[DB] Report saved successfully")
        return True
    except Exception as e:
        print(f"[DB] Save failed: {e}")
        return False

def get_reports() -> list:
    """Fetch all reports newest first."""
    try:
        conn = get_connection()
        cur  = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cur.execute("""
            SELECT symptoms, age, result, created_at
            FROM reports
            ORDER BY created_at DESC
            LIMIT 20
        """)
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
        print(f"[DB] Fetched {len(reports)} reports")
        return reports

    except Exception as e:
        print(f"[DB] Fetch failed: {e}")
        return []