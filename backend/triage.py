HIGH_SEVERITY_RULES = [
    (["chest pain", "chest tightness"],  "Possible cardiac event"),
    (["difficulty breathing", "shortness of breath",
      "breathing difficulty"],             "Respiratory distress"),
    (["severe headache", "vomiting"],       "Possible neurological emergency"),
    (["unconscious", "unresponsive"],      "Immediate emergency"),
    (["stroke", "facial drooping"],        "Possible stroke"),
]

MEDIUM_ESCALATION_RULES = [
    (["fever"], 60, "Elderly patient with fever — monitor closely"),
    (["chest pain"], 50, "Cardiac risk elevated with age"),
]

def _symptoms_contain_any(symptoms: list, keywords: list) -> bool:
    """Check if any symptom matches any keyword (case-insensitive)."""
    s_lower = [s.lower() for s in symptoms]
    return any(
        any(kw in s for s in s_lower)
        for kw in keywords
    )

def apply_safety_rules(symptoms: list, age: int, ai_result: dict) -> dict:
    """
    Override AI severity when rule-based triggers fire.
    HIGH always wins. MEDIUM upgrades only if AI said LOW.
    """
    override_reason = None

    # Check HIGH severity rules first (any single match is enough)
    for keywords, reason in HIGH_SEVERITY_RULES:
        if _symptoms_contain_any(symptoms, keywords):
            override_reason = reason
            ai_result["severity"] = "HIGH"
            print(f"[SAFETY] HIGH override: {reason}")
            break  # One HIGH rule is enough

    # Check MEDIUM escalation rules (only if not already HIGH)
    if ai_result["severity"] != "HIGH":
        for keywords, age_threshold, reason in MEDIUM_ESCALATION_RULES:
            if (_symptoms_contain_any(symptoms, keywords)
                    and age >= age_threshold
                    and ai_result["severity"] == "LOW"):
                ai_result["severity"] = "MEDIUM"
                override_reason = reason
                print(f"[SAFETY] MEDIUM override: {reason}")

    if override_reason:
        ai_result["safety_override"] = True
        ai_result["override_reason"] = override_reason
    else:
        ai_result["safety_override"] = False

    return ai_result