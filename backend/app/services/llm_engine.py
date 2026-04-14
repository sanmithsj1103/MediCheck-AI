import json
import uuid
import typing
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import ollama

from app.services.memory import get_session_history
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

def get_or_create_session(session_id: Optional[str]) -> tuple[str, Any]:
    sid = session_id or str(uuid.uuid4())
    memory = get_session_history(sid)
    
    # If starting a new session, inject system prompt automatically
    if len(memory.messages) == 0:
        memory.add_message(SystemMessage(content=SYSTEM_PROMPT))
        
    return sid, memory

# ── System prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are MediCheck AI, an expert medical diagnostic assistant.
Your goal is to triage the user's symptoms. Ask follow-up questions if you need more information to diagnose the condition accurately.
If you have enough information to confidently diagnose the top 1-3 conditions, provide the final triage result. 
Always look for high-urgency red flags (like chest pain, severe bleeding, sudden numbness) and escalate them to 'high' urgency.

You MUST always reply with exactly ONE JSON object matching this schema:
{
  "done": boolean, // false if you are asking a follow-up question. true if you have reached a final conclusion.
  "reply": string, // Your conversational response to the user. E.g. "Do you have a fever?" or "Based on your symptoms..."
  "detectedSymptoms": [string], // List of canonical symptom names you have detected so far.
  "triageResult": { // Include this object ONLY if "done" is true. Otherwise null.
    "conditions": [
      {
        "name": string, // Name of the disease/condition
        "confidence": integer // 0-100 score
      }
    ],
    "urgency": string, // Must be "low", "medium", or "high"
    "recommendations": [string], // Actionable advice
    "specialist": string // Recommended doctor type e.g. "Cardiologist", "General Physician"
  }
}
Return ONLY valid JSON.
"""

def build_response(
    message: str,
    session_id: Optional[str],
    history: List[Dict],
    existing_symptoms: List[str],
    language: str = "en",
) -> Dict[str, Any]:
    
    sid, memory = get_or_create_session(session_id)
    
    # Append user's new message to memory
    memory.add_message(HumanMessage(content=message))
    
    # Convert Langchain history types to raw Dict arrays for local Ollama API
    ollama_messages = []
    for m in memory.messages:
        role = "user"
        if isinstance(m, AIMessage):
            role = "assistant"
        elif isinstance(m, SystemMessage):
            role = "system"
        ollama_messages.append({"role": role, "content": m.content})
    
    try:
        # Call Local Ollama Model
        response = ollama.chat(
            model='medicheck-ai:latest',
            messages=ollama_messages,
            format="json" 
        )
        
        reply_content = response['message']['content']
        # Append assistant's response to memory permanently
        memory.add_message(AIMessage(content=reply_content))
        
        # Parse output JSON
        output_data = json.loads(reply_content)
        
        # Ensure we always return the structure expected by the frontend
        return {
            "reply": output_data.get("reply", "I'm having trouble processing that."),
            "sessionId": sid,
            "detectedSymptoms": output_data.get("detectedSymptoms", existing_symptoms),
            "done": output_data.get("done", False),
            "triageResult": output_data.get("triageResult", None),
        }
        
    except Exception as e:
        print(f"Ollama Error: {e}")
        return {
            "reply": "I'm sorry, my AI engine is currently unavailable. Please try again or seek medical attention if this is an emergency.",
            "sessionId": sid,
            "detectedSymptoms": existing_symptoms,
            "done": False,
            "triageResult": None
        }

def score_conditions(symptoms: List[str]) -> List[Dict]:
    """
    For the Quick Select API which just sends a list of symptoms.
    We synthesize a prompt instructing the LLM to output a triage result immediately.
    """
    if not symptoms:
        return []
        
    sys_prompt = SYSTEM_PROMPT + "\n\nCRITICAL RULE: The user has provided a final list of symptoms. You MUST set done=true and provide the triageResult immediately. Do not ask follow ups."
    user_msg = f"My symptoms are: {', '.join(symptoms)}."
    
    try:
        response = ollama.chat(
            model='medicheck-ai:latest',
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_msg}
            ],
            format="json"
        )
        
        data = json.loads(response['message']['content'])
        triage = data.get("triageResult", {})
        return triage.get("conditions", [])
    except Exception as e:
        print("Scoring error via Ollama:", e)
        return []

def classify_urgency(symptoms: List[str], conditions: List[Dict]) -> str:
    # Just ask Ollama or rely on the triageResult from QuickSelect
    sys_prompt = SYSTEM_PROMPT + "\n\nCRITICAL RULE: You MUST set done=true and provide the triageResult immediately."
    user_msg = f"Symptoms: {', '.join(symptoms)}."    
    try:
        response = ollama.chat(
            model='medicheck-ai:latest',
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_msg}
            ],
            format="json"
        )
        data = json.loads(response['message']['content'])
        triage = data.get("triageResult") or {}
        return triage.get("urgency", "low")
    except:
        return "medium"

def extract_symptoms(text: str) -> list[str]:
    # Placeholder if we need it
    return []
