from flask import Flask, request, jsonify
from flask_cors import CORS
from llm_engine import analyze_symptoms
from triage import apply_safety_rules

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

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
            return jsonify({"error":"No JSON body sent"}), 400

        symptoms = data.get("symptoms", [])
        age      = data.get("age", 0)

        if not symptoms:
            return jsonify({"error":"symptoms list is required"}), 422

        if not isinstance(age, (int, float)) or age < 0:
            return jsonify({"error":"age must be a positive number"}), 422

        print(f"[API] Received: symptoms={symptoms}, age={age}")

        # Step 1: Get AI analysis
        result = analyze_symptoms(symptoms, int(age))

        # Step 2: Apply safety rules (may override severity)
        result = apply_safety_rules(symptoms, int(age), result)

        result["disclaimer"] = (
            "This is NOT a medical diagnosis. "
            "Always consult a qualified healthcare professional."
        )
        return jsonify(result), 200

    except Exception as e:
        print(f"[API] Unhandled error: {e}")
        return jsonify({"error": "Internal server error",
                        "detail": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)