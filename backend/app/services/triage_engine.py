"""
MediCheck AI — Triage Engine v2
Hybrid engine: uses the trained ML model when available,
falls back to the rule-based knowledge base if not.
"""

import re
import uuid
import os
from typing import Optional

import joblib
import numpy as np

from .symptom_data import (
    DISEASE_SYMPTOM_MAP,
    HIGH_URGENCY_RED_FLAGS,
    FOLLOW_UP_QUESTIONS,
    SYMPTOM_ALIASES,
)

# ── Load ML model if trained ─────────────────────────────────────────────────
_clf            = None
_label_encoder  = None
_feature_cols   = None
_model_metadata = None

def _load_model():
    global _clf, _label_encoder, _feature_cols, _model_metadata
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    paths = {
        "clf":      os.path.join(model_dir, "symptom_classifier.joblib"),
        "le":       os.path.join(model_dir, "label_encoder.joblib"),
        "features": os.path.join(model_dir, "feature_columns.joblib"),
        "meta":     os.path.join(model_dir, "model_metadata.joblib"),
    }
    if all(os.path.exists(p) for p in paths.values()):
        try:
            _clf            = joblib.load(paths["clf"])
            _label_encoder  = joblib.load(paths["le"])
            _feature_cols   = joblib.load(paths["features"])
            _model_metadata = joblib.load(paths["meta"])
            print(f"ML model loaded: {_model_metadata.get('n_diseases')} diseases, "
                  f"accuracy={_model_metadata.get('accuracy')}")
        except Exception as e:
            print(f"Could not load ML model: {e} - using rule-based engine")

_load_model()

ML_AVAILABLE = _clf is not None


# ── Session store ─────────────────────────────────────────────────────────────
_sessions: dict[str, dict] = {}

def get_or_create_session(session_id: Optional[str]) -> tuple[str, dict]:
    if session_id and session_id in _sessions:
        return session_id, _sessions[session_id]
    sid = session_id or str(uuid.uuid4())
    _sessions[sid] = {
        "turn":                0,
        "collected_symptoms":  [],
        "asked_followups":     set(),
        "pending_followup":    None,
    }
    return sid, _sessions[sid]


# ── Flat symptom lookup ───────────────────────────────────────────────────────
_ALL_SYMPTOMS: dict[str, str] = {}
for _disease, _info in DISEASE_SYMPTOM_MAP.items():
    for _s in _info["symptoms"]:
        _ALL_SYMPTOMS[_s.lower()] = _s
# Add aliases
for alias, canonical in SYMPTOM_ALIASES.items():
    _ALL_SYMPTOMS[alias.lower()] = canonical


def extract_symptoms(text: str) -> list[str]:
    """Return canonical symptom names found in free text (handles aliases).
    Deduplicates overlapping symptoms — keeps the most specific match."""
    text_lower = text.lower()
    found = []
    # Sort by length descending so longer phrases match first
    for keyword in sorted(_ALL_SYMPTOMS.keys(), key=len, reverse=True):
        if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
            canonical = _ALL_SYMPTOMS[keyword]
            if canonical not in found:
                found.append(canonical)

    # Deduplicate: if symptom A is a substring of symptom B already found, drop A
    deduplicated = []
    found_lower = [s.lower() for s in found]
    for i, sym in enumerate(found):
        is_redundant = any(
            sym.lower() != other and sym.lower() in other
            for j, other in enumerate(found_lower) if j != i
        )
        if not is_redundant:
            deduplicated.append(sym)
    return deduplicated


# ── ML-based scoring ──────────────────────────────────────────────────────────
def _ml_score(symptoms: list[str]) -> list[dict]:
    """Use trained RandomForest to predict disease probabilities."""
    if not ML_AVAILABLE:
        return []

    # Build feature vector
    feat = {col: 0 for col in _feature_cols}
    for s in symptoms:
        key = s.lower()
        if key in feat:
            feat[key] = 1

    import pandas as pd
    X = pd.DataFrame([feat])[_feature_cols]
    proba = _clf.predict_proba(X)[0]

    results = []
    for idx, prob in enumerate(proba):
        if prob < 0.03:  # skip very unlikely
            continue
        disease_name = _label_encoder.classes_[idx]
        confidence   = round(min(prob * 100, 95))
        if confidence < 8:
            continue
        # Look up metadata from knowledge base
        kb_info = DISEASE_SYMPTOM_MAP.get(disease_name, {})
        results.append({
            "name":            disease_name,
            "confidence":      confidence,
            "urgency":         kb_info.get("urgency", "medium"),
            "specialist":      kb_info.get("specialist", "General Physician"),
            "recommendations": kb_info.get("recommendations", [
                "Rest and monitor your symptoms.",
                "Consult a doctor if symptoms worsen or persist.",
            ]),
        })

    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results[:5]


# ── Rule-based scoring ────────────────────────────────────────────────────────
def _rule_score(symptoms: list[str]) -> list[dict]:
    """Overlap-based scoring from the knowledge base."""
    sym_set = {s.lower() for s in symptoms}
    results = []

    for disease, info in DISEASE_SYMPTOM_MAP.items():
        disease_syms = {s.lower() for s in info["symptoms"]}
        overlap = sym_set & disease_syms
        if not overlap:
            continue
        recall    = len(overlap) / len(disease_syms)
        precision = len(overlap) / max(len(sym_set), 1)
        score     = round((recall * 0.6 + precision * 0.4) * 100)
        if score < 10:
            continue
        results.append({
            "name":            disease,
            "confidence":      min(score, 95),
            "urgency":         info["urgency"],
            "specialist":      info["specialist"],
            "recommendations": info["recommendations"],
        })

    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results[:5]


def score_conditions(symptoms: list[str]) -> list[dict]:
    """Score conditions using ML model if available, otherwise rule-based."""
    if not symptoms:
        return []
    if ML_AVAILABLE:
        results = _ml_score(symptoms)
        if results:
            return results
    return _rule_score(symptoms)


# ── Urgency classification ────────────────────────────────────────────────────
def classify_urgency(symptoms: list[str], conditions: list[dict]) -> str:
    sym_lower = [s.lower() for s in symptoms]

    # Red-flag override — explicit dangerous combos
    for flag_combo in HIGH_URGENCY_RED_FLAGS:
        if all(any(flag in s for s in sym_lower) for flag in flag_combo):
            return "high"

    if not conditions:
        return "low"

    urgency_rank = {"low": 0, "medium": 1, "high": 2}
    top = conditions[0]

    # If top condition is dominant (>50% confidence) and low/medium, trust it
    # Don't let a minor second condition escalate urgency
    if top["confidence"] >= 50:
        return top.get("urgency", "low")

    # Otherwise take the most severe among top 3 conditions with weight >= 15%
    weighted = [c for c in conditions[:3] if c["confidence"] >= 15]
    if not weighted:
        return top.get("urgency", "low")
    worst = max(weighted, key=lambda c: urgency_rank.get(c.get("urgency", "low"), 0))
    return worst.get("urgency", "low")


# ── Follow-up picker ──────────────────────────────────────────────────────────
def pick_followup(symptoms: list[str], session: dict) -> Optional[str]:
    for symptom in symptoms:
        for key, questions in FOLLOW_UP_QUESTIONS.items():
            if key in symptom.lower() and key not in session["asked_followups"]:
                session["asked_followups"].add(key)
                unanswered = [q for q in questions if q not in session.get("asked_questions_full", set())]
                if unanswered:
                    q = unanswered[0]
                    session.setdefault("asked_questions_full", set()).add(q)
                    return q
    return None


# ── Urgency messages ──────────────────────────────────────────────────────────
URGENCY_MESSAGES = {
    "low": (
        "Based on your symptoms, this appears to be a low urgency situation. "
        "You can rest at home and monitor. Visit a clinic if symptoms persist beyond 48 hours or worsen."
    ),
    "medium": (
        "Your symptoms suggest a medium urgency situation. "
        "I'd recommend visiting a clinic or GP within the next 24 hours. "
        "Do not delay if any symptoms become significantly worse."
    ),
    "high": (
        "⚠️ Your symptoms indicate a HIGH URGENCY situation. "
        "Please seek medical attention immediately, or call emergency services at 108."
    ),
}


# ── Main conversation builder ─────────────────────────────────────────────────
def build_response(
    message: str,
    session_id: Optional[str],
    history: list[dict],
    existing_symptoms: list[str],
    language: str = "en",
) -> dict:
    sid, session = get_or_create_session(session_id)
    session["turn"] += 1
    turn = session["turn"]

    # Extract and accumulate symptoms
    new_symptoms  = extract_symptoms(message)
    all_symptoms  = list(dict.fromkeys(
        existing_symptoms + session["collected_symptoms"] + new_symptoms
    ))
    session["collected_symptoms"] = all_symptoms

    conditions = score_conditions(all_symptoms)

    # Check for explicit red-flag symptom combos → immediate conclusion
    sym_lower = [s.lower() for s in all_symptoms]
    red_flag_triggered = any(
        all(any(flag in s for s in sym_lower) for flag in combo)
        for combo in HIGH_URGENCY_RED_FLAGS
    )

    # Decide: follow-up or conclude
    should_conclude = (
        red_flag_triggered
        or turn >= 4
        or (turn >= 2 and len(all_symptoms) >= 5)
        or (turn >= 3 and len(conditions) >= 2)
        or (turn == 1 and len(all_symptoms) >= 7)
    )

    if should_conclude:
        # ── Final result ──────────────────────────────────────────────────
        urgency     = classify_urgency(all_symptoms, conditions)
        urgency_msg = URGENCY_MESSAGES[urgency]

        if conditions:
            top         = conditions[0]
            recs        = top["recommendations"]
            specialist  = top["specialist"]
            engine_note = "(ML model)" if ML_AVAILABLE else "(rule-based)"
            cond_text   = (
                f"The symptoms you've described are most consistent with "
                f"**{top['name']}** (confidence: {top['confidence']}% {engine_note})."
            )
        else:
            cond_text  = "I wasn't able to match your symptoms to a specific condition with enough confidence."
            recs       = [
                "Rest and stay well hydrated.",
                "Monitor your symptoms closely.",
                "Visit a doctor if symptoms persist or worsen.",
            ]
            specialist = "General Physician"

        reply = (
            f"{cond_text}\n\n"
            f"{urgency_msg}\n\n"
            f"**Recommended specialist:** {specialist}\n\n"
            "**What to do:**\n" + "\n".join(f"• {r}" for r in recs[:3])
        )

        return {
            "reply":           reply,
            "sessionId":       sid,
            "detectedSymptoms": new_symptoms,
            "done":            True,
            "triageResult": {
                "urgency":         urgency,
                "conditions":      conditions[:4],
                "recommendations": recs,
                "specialist":      specialist,
            },
        }

    else:
        # ── Follow-up question ────────────────────────────────────────────
        followup = pick_followup(all_symptoms, session)

        if turn == 1:
            sym_list = new_symptoms[:3]
            ack = (f"I understand you're experiencing {', '.join(sym_list)}."
                   if sym_list else "Thank you for sharing that.")
            followup = followup or "Can you tell me how long you've been feeling this way?"
            reply = f"{ack} {followup}"
        elif followup:
            reply = followup
        else:
            reply = (
                "Are there any other symptoms you're experiencing? "
                "For example: fever, nausea, fatigue, or any pain elsewhere? "
                "Any additional details will help me give a more accurate assessment."
            )

        return {
            "reply":            reply,
            "sessionId":        sid,
            "detectedSymptoms": new_symptoms,
            "done":             False,
            "triageResult":     None,
        }
