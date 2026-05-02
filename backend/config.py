# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MODEL_NAME   = "llama-3.3-70b-versatile"
    MAX_TOKENS   = 1024
    DATABASE_URL = os.getenv("DATABASE_URL")
    JWT_SECRET   = os.getenv("JWT_SECRET", "healthguard_secret_key")

    if not GROQ_API_KEY:
        raise EnvironmentError("GROQ_API_KEY missing.")
    if not DATABASE_URL:
        raise EnvironmentError("DATABASE_URL missing.")