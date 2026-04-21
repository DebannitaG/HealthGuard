import json, requests
from config import Config

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """
You are a medical triage AI. Analyze symptoms and return ONLY
valid JSON with this exact structure — no extra text:
{
  "conditions": ["string"],
  "severity": "LOW | MEDIUM | HIGH",
  "doctor": "string (specialist type)",
  "advice": ["string"],
  "reasoning": "string"
}
"""

def analyze_symptoms(symptoms: list, age: int) -> dict:
    """Call Groq LLM and return structured triage output."""
    user_prompt = (
        f"Patient age: {age}\n"
        f"Symptoms: {', '.join(symptoms)}\n"
        "Provide triage analysis as JSON."
    )

    headers = {
        "Authorization": f"Bearer {Config.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": Config.MODEL_NAME,
        "max_tokens": Config.MAX_TOKENS,
        "temperature": 0.3,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
    }

    try:
        print(f"[LLM] Sending request for symptoms: {symptoms}")
        response = requests.post(
            GROQ_URL, headers=headers,
            json=payload, timeout=30
        )
        response.raise_for_status()
        data = response.json()

        raw = data["choices"][0]["message"]["content"].strip()
        print(f"[LLM] Raw response: {raw}")

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        result = json.loads(raw)

        # Validate required keys exist
        required = ["conditions","severity","doctor","advice","reasoning"]
        for k in required:
            result.setdefault(k, "Unknown" if k != "advice"
                               and k != "conditions" else [])
        return result

    except requests.exceptions.Timeout:
        print("[LLM] Request timed out")
        return _fallback_response("LLM request timed out.")
    except requests.exceptions.HTTPError as e:
        print(f"[LLM] HTTP error: {e}")
        return _fallback_response(f"API error: {str(e)}")
    except json.JSONDecodeError:
        print("[LLM] Failed to parse JSON from LLM")
        return _fallback_response("Could not parse AI response.")
    except Exception as e:
        print(f"[LLM] Unexpected error: {e}")
        return _fallback_response(str(e))

def _fallback_response(reason: str) -> dict:
    return {
        "conditions": ["Unable to determine"],
        "severity":   "UNKNOWN",
        "doctor":     "General Practitioner",
        "advice":     ["Please consult a doctor in person."],
        "reasoning":  f"Analysis unavailable: {reason}",
        "error":      reason,
    }