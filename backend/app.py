# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_engine import analyze_symptoms
from triage import apply_safety_rules
from database import save_report, get_reports, init_db

app = Flask(__name__)
CORS(app)

# Create table when app starts
init_db()

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "ok",
        "message": "HealthGuard API is running"
    })

@app.route("/analyze", methods=["POST"])
def analyze():
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

        # Step 1: Get AI analysis
        result = analyze_symptoms(symptoms, int(age))

        # Step 2: Apply safety rules
        result = apply_safety_rules(symptoms, int(age), result)

        # Step 3: Add disclaimer
        result["disclaimer"] = (
            "This is NOT a medical diagnosis. "
            "Always consult a qualified healthcare professional."
        )

        # Step 4: Save to PostgreSQL
        save_report(symptoms, int(age), result)

        return jsonify(result), 200

    except Exception as e:
        print(f"[API] Unhandled error: {e}")
        return jsonify({
            "error": "Internal server error",
            "detail": str(e)
        }), 500

@app.route("/history", methods=["GET"])
def history():
    """Returns all saved reports."""
    try:
        reports = get_reports()
        return jsonify(reports), 200
    except Exception as e:
        print(f"[API] History error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)