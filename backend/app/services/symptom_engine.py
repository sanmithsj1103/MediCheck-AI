"""Placeholder symptom analysis engine. Will be replaced by custom AI model later."""


# Rule-based symptom-to-condition mapping
SYMPTOM_CONDITIONS = {
    "headache": [
        {"name": "Tension Headache", "confidence": 0.7},
        {"name": "Migraine", "confidence": 0.5},
        {"name": "Sinusitis", "confidence": 0.3},
    ],
    "fever": [
        {"name": "Common Cold", "confidence": 0.6},
        {"name": "Influenza (Flu)", "confidence": 0.5},
        {"name": "Viral Infection", "confidence": 0.7},
    ],
    "cough": [
        {"name": "Common Cold", "confidence": 0.6},
        {"name": "Bronchitis", "confidence": 0.4},
        {"name": "Allergic Rhinitis", "confidence": 0.3},
    ],
    "stomach pain": [
        {"name": "Gastritis", "confidence": 0.6},
        {"name": "Acid Reflux (GERD)", "confidence": 0.5},
        {"name": "Food Poisoning", "confidence": 0.4},
    ],
    "chest pain": [
        {"name": "Costochondritis", "confidence": 0.4},
        {"name": "Anxiety / Panic Attack", "confidence": 0.3},
        {"name": "Cardiac Issue", "confidence": 0.3},
    ],
    "sore throat": [
        {"name": "Pharyngitis", "confidence": 0.7},
        {"name": "Tonsillitis", "confidence": 0.5},
        {"name": "Common Cold", "confidence": 0.4},
    ],
    "body ache": [
        {"name": "Influenza (Flu)", "confidence": 0.6},
        {"name": "Viral Infection", "confidence": 0.5},
        {"name": "Fibromyalgia", "confidence": 0.2},
    ],
    "fatigue": [
        {"name": "Anemia", "confidence": 0.4},
        {"name": "Vitamin Deficiency", "confidence": 0.4},
        {"name": "Thyroid Disorder", "confidence": 0.3},
    ],
    "nausea": [
        {"name": "Gastroenteritis", "confidence": 0.5},
        {"name": "Food Poisoning", "confidence": 0.5},
        {"name": "Motion Sickness", "confidence": 0.3},
    ],
    "dizziness": [
        {"name": "Vertigo (BPPV)", "confidence": 0.5},
        {"name": "Low Blood Pressure", "confidence": 0.4},
        {"name": "Dehydration", "confidence": 0.4},
    ],
}

# Follow-up questions per symptom
FOLLOW_UP_QUESTIONS = {
    "headache": [
        "How long have you had this headache?",
        "Is the pain on one side or both sides?",
        "Do you feel sensitivity to light or sound?",
    ],
    "fever": [
        "What is your temperature?",
        "How many days have you had the fever?",
        "Do you have any other symptoms like chills or sweating?",
    ],
    "cough": [
        "Is it a dry cough or are you coughing up mucus?",
        "How long have you been coughing?",
        "Does it get worse at night?",
    ],
    "chest pain": [
        "Does the pain radiate to your arm or jaw?",
        "Do you feel shortness of breath?",
        "Does the pain worsen with physical activity?",
    ],
    "default": [
        "How long have you been experiencing this?",
        "On a scale of 1-10, how severe is it?",
        "Have you taken any medication for this?",
    ],
}

# Urgency rules
HIGH_URGENCY_SYMPTOMS = {"chest pain", "difficulty breathing", "severe bleeding", "loss of consciousness", "seizure"}
MEDIUM_URGENCY_SYMPTOMS = {"fever", "persistent vomiting", "severe headache", "severe pain"}


def analyze_symptoms(symptoms: list[str]) -> dict:
    """Analyze symptoms and return predicted conditions, urgency, and recommendations."""

    # Normalize
    normalized = [s.lower().strip() for s in symptoms]

    # Determine urgency
    urgency = "low"
    for s in normalized:
        if any(high in s for high in HIGH_URGENCY_SYMPTOMS):
            urgency = "high"
            break
        if any(med in s for med in MEDIUM_URGENCY_SYMPTOMS):
            urgency = "medium"

    # Collect conditions
    all_conditions = {}
    for symptom in normalized:
        conditions = SYMPTOM_CONDITIONS.get(symptom, [])
        for cond in conditions:
            name = cond["name"]
            if name in all_conditions:
                # Boost confidence for matching multiple symptoms
                all_conditions[name] = min(all_conditions[name] + 0.15, 0.95)
            else:
                all_conditions[name] = cond["confidence"]

    # If no known symptoms matched, provide generic
    if not all_conditions:
        all_conditions = {"General Consultation Needed": 0.5}

    # Sort by confidence
    sorted_conditions = sorted(all_conditions.items(), key=lambda x: x[1], reverse=True)
    predicted = [{"name": name, "confidence": round(conf, 2)} for name, conf in sorted_conditions[:5]]

    # Generate recommendations
    recommendations = _get_recommendations(urgency, predicted)
    specialist = _get_specialist(normalized)

    return {
        "predictedConditions": predicted,
        "urgencyLevel": urgency,
        "recommendations": recommendations,
        "specialistRecommended": specialist,
    }


def get_follow_up_questions(symptoms: list[str]) -> list[str]:
    """Get follow-up questions based on symptoms."""
    questions = []
    for symptom in symptoms:
        s = symptom.lower().strip()
        qs = FOLLOW_UP_QUESTIONS.get(s, FOLLOW_UP_QUESTIONS["default"])
        for q in qs:
            if q not in questions:
                questions.append(q)
    return questions[:5]


def _get_recommendations(urgency: str, conditions: list[dict]) -> list[str]:
    """Generate recommendations based on urgency and conditions."""
    recs = []
    if urgency == "high":
        recs.append("⚠️ Please seek immediate medical attention or visit the nearest emergency room.")
        recs.append("Call emergency services if symptoms are severe or worsening.")
    elif urgency == "medium":
        recs.append("Schedule a doctor's appointment within the next 24-48 hours.")
        recs.append("Monitor your symptoms closely. Visit ER if they worsen.")
    else:
        recs.append("Your symptoms appear manageable. Rest and stay hydrated.")
        recs.append("If symptoms persist for more than 3-5 days, consult a doctor.")

    recs.append("This is an AI-assisted assessment and not a substitute for professional medical advice.")
    return recs


def _get_specialist(symptoms: list[str]) -> str:
    """Suggest specialist type based on symptoms."""
    for s in symptoms:
        if any(w in s for w in ["chest", "heart", "palpitation"]):
            return "Cardiologist"
        if any(w in s for w in ["stomach", "nausea", "vomiting", "diarrhea"]):
            return "Gastroenterologist"
        if any(w in s for w in ["headache", "dizziness", "seizure", "numbness"]):
            return "Neurologist"
        if any(w in s for w in ["rash", "skin", "itching"]):
            return "Dermatologist"
        if any(w in s for w in ["joint", "bone", "back pain"]):
            return "Orthopedist"
        if any(w in s for w in ["cough", "breathing", "asthma"]):
            return "Pulmonologist"
        if any(w in s for w in ["throat", "ear", "nose", "sinus"]):
            return "ENT Specialist"

    return "General Physician"
