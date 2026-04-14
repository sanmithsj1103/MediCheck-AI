from fastapi import APIRouter, Depends
from app.models.schemas import (
    SymptomAnalysisRequest,
    SymptomAnalysisResponse,
    FollowUpRequest,
    ChatMessageRequest,
    ChatMessageResponse,
    ConditionPrediction,
)
from app.middleware import verify_firebase_token
import uuid
from datetime import datetime
from app.services.llm_engine import (
    build_response,
    score_conditions,
    classify_urgency
)

router = APIRouter()

@router.post("/analyze", response_model=SymptomAnalysisResponse)
async def analyze(
    request: SymptomAnalysisRequest,
    user=Depends(verify_firebase_token),
):
    """Analyze symptoms and return predicted conditions, urgency, and recommendations."""
    
    conditions = score_conditions(request.symptoms)
    urgency = classify_urgency(request.symptoms, conditions)
    
    if conditions:
        top = conditions[0]
        recs = top.get("recommendations", [])
        specialist = top.get("specialist", "General Physician")
    else:
        recs = ["Rest and monitor symptoms.", "Seek medical help if conditions worsen."]
        specialist = "General Physician"

    # Save to Firestore so user can see it in history and book appointments
    from app.services.firebase_service import get_firestore_client
    db = get_firestore_client()
    assessment_id = str(uuid.uuid4())
    
    assessment_data = {
        "userId": user["uid"],
        "symptoms": request.symptoms,
        "conversationLog": [],
        "followUpQA": [],
        "inputMethod": request.input_method,
        "language": request.language,
        "predictedConditions": conditions[:4],
        "urgencyLevel": urgency,
        "recommendations": recs,
        "specialistRecommended": specialist,
        "createdAt": datetime.utcnow()
    }
    db.collection("assessments").document(assessment_id).set(assessment_data)

    return SymptomAnalysisResponse(
        predicted_conditions=[ConditionPrediction(name=c["name"], confidence=c["confidence"]) for c in conditions[:4]],
        urgency_level=urgency,
        recommendations=recs,
        specialist_recommended=specialist,
        follow_up_questions=[],
        assessment_id=assessment_id,
    )


@router.post("/follow-up")
async def follow_up(
    request: FollowUpRequest,
    user=Depends(verify_firebase_token),
):
    """Get follow-up questions for given symptoms."""
    # Custom ML app delegates this to conversational chat instead
    return {"questions": []}


@router.post("/chat", response_model=ChatMessageResponse)
async def chat_message(
    request: ChatMessageRequest,
    user=Depends(verify_firebase_token),
):
    """Process a chat message using the AI model build_response."""
    from app.services.llm_engine import build_response
    
    # We pass the message and sessionId into the new AI build_response engine
    result = build_response(
        message=request.message,
        session_id=request.session_id if request.session_id else None,
        history=[],
        existing_symptoms=[],
        language=request.language
    )

    is_done = result.get("done", False)

    if is_done and result.get("triageResult"):
        tr = result["triageResult"]
        
        # Get full accumulated symptoms from session
        all_symptoms = result.get("detectedSymptoms", [])
            
        # Save to Assessment History in Firestore
        from app.services.firebase_service import get_firestore_client
        db = get_firestore_client()
        assessment_id = str(uuid.uuid4())
        
        assessment_data = {
            "userId": user["uid"],
            "symptoms": all_symptoms,
            "conversationLog": [],
            "followUpQA": [],
            "inputMethod": request.input_method,
            "language": request.language,
            "predictedConditions": tr.get("conditions", []),
            "urgencyLevel": tr.get("urgency", "low"),
            "recommendations": tr.get("recommendations", []),
            "specialistRecommended": tr.get("specialist", "General Physician"),
            "createdAt": datetime.utcnow()
        }
        
        db.collection("assessments").document(assessment_id).set(assessment_data)

        analysis_response = SymptomAnalysisResponse(
            predicted_conditions=[ConditionPrediction(name=c["name"], confidence=c["confidence"]) for c in tr.get("conditions", [])],
            urgency_level=tr.get("urgency", "low"),
            recommendations=tr.get("recommendations", []),
            specialist_recommended=tr.get("specialist", "General Physician"),
            follow_up_questions=[],
            assessment_id=assessment_id
        )

        return ChatMessageResponse(
            reply=result["reply"],
            is_complete=True,
            symptoms_detected=result.get("detectedSymptoms", []),
            analysis=analysis_response,
            assessment_id=assessment_id
        )
    else:
        return ChatMessageResponse(
            reply=result["reply"],
            is_complete=False,
            symptoms_detected=result.get("detectedSymptoms", []),
            analysis=None,
            assessment_id=None
        )
