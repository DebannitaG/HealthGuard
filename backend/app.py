# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from llm_engine import analyze_symptoms
from triage import apply_safety_rules
from database import (
    init_db, create_user, get_user_by_email,
    get_user_by_id, update_profile,
    save_report, get_reports
)
from auth import generate_token, token_required

app    = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Create tables when app starts
init_db()

# ─── PUBLIC ROUTES ────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "ok",
        "message": "HealthGuard API is running"
    })

@app.route("/register", methods=["POST"])
def register():
    """Register a new user."""
    try:
        data     = request.get_json()
        email    = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 422
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 422

        # Hash the password
        hashed = bcrypt.generate_password_hash(password).decode("utf-8")

        # Create user
        user = create_user(email, hashed)
        if not user:
            return jsonify({"error": "Email already registered"}), 409

        # Generate token
        token = generate_token(user["id"])
        return jsonify({
            "token":   token,
            "user_id": user["id"],
            "email":   user["email"],
            "message": "Registration successful"
        }), 201

    except Exception as e:
        print(f"[API] Register error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    """Login existing user."""
    try:
        data     = request.get_json()
        email    = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"error": "Email and password required"}), 422

        # Find user
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        # Check password
        if not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        # Generate token
        token = generate_token(user["id"])

        # Check if profile is complete
        profile_complete = bool(user.get("full_name"))

        return jsonify({
            "token":            token,
            "user_id":          user["id"],
            "email":            user["email"],
            "profile_complete": profile_complete,
            "full_name":        user.get("full_name"),
            "message":          "Login successful"
        }), 200

    except Exception as e:
        print(f"[API] Login error: {e}")
        return jsonify({"error": str(e)}), 500

# ─── PROTECTED ROUTES ─────────────────────────────────────

@app.route("/profile", methods=["GET"])
@token_required
def get_profile():
    """Get user profile."""
    try:
        user = get_user_by_id(request.user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/profile", methods=["POST"])
@token_required
def save_profile():
    """Save user profile."""
    try:
        data       = request.get_json()
        full_name  = data.get("full_name", "")
        gender     = data.get("gender", "")
        age        = data.get("age", 0)
        blood_group = data.get("blood_group", "")
        conditions = data.get("conditions", "")

        success = update_profile(
            request.user_id,
            full_name, gender,
            age, blood_group, conditions
        )
        if success:
            return jsonify({"message": "Profile saved"}), 200
        return jsonify({"error": "Failed to save profile"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze", methods=["POST"])
@token_required
def analyze():
    """Analyze symptoms."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body sent"}), 400

        symptoms = data.get("symptoms", [])
        age      = data.get("age", 0)

        if not symptoms:
            return jsonify({"error": "symptoms list is required"}), 422
        if not isinstance(age, (int, float)) or age < 0:
            return jsonify({"error": "age must be a positive number"}), 422

        print(f"[API] Received: symptoms={symptoms}, age={age}")

        result = analyze_symptoms(symptoms, int(age))
        result = apply_safety_rules(symptoms, int(age), result)
        result["disclaimer"] = (
            "This is NOT a medical diagnosis. "
            "Always consult a qualified healthcare professional."
        )

        save_report(request.user_id, symptoms, int(age), result)
        return jsonify(result), 200

    except Exception as e:
        print(f"[API] Unhandled error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/history", methods=["GET"])
@token_required
def history():
    """Get user's report history."""
    try:
        reports = get_reports(request.user_id)
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)