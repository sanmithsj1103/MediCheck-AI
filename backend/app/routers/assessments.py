from fastapi import APIRouter, Depends, HTTPException
from app.middleware import verify_firebase_token
from app.services.firebase_service import get_firestore_client
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter()

@router.get("/user/{user_id}")
async def get_user_assessments(user_id: str, user=Depends(verify_firebase_token)):
    """Get all assessments for a specific user."""
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    db = get_firestore_client()
    docs = db.collection("assessments").where(filter=FieldFilter("userId", "==", user_id)).get()
    
    assessments = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        assessments.append(data)
        
    # Sort chronologically descending
    assessments.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return {"assessments": assessments}


@router.get("/{assessment_id}")
async def get_assessment(assessment_id: str, user=Depends(verify_firebase_token)):
    """Get a specific assessment by ID."""
    db = get_firestore_client()
    doc_ref = db.collection("assessments").document(assessment_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    data = doc.to_dict()
    if data.get("userId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this assessment")
        
    data["id"] = doc.id
    return {"assessment": data}
