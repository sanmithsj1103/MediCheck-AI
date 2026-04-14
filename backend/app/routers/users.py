from fastapi import APIRouter, Depends, HTTPException, Body
from app.middleware import verify_firebase_token
from app.services.firebase_service import get_firestore_client
from datetime import datetime

router = APIRouter()

@router.get("/profile")
async def get_user_profile(user=Depends(verify_firebase_token)):
    """Get current user's profile and medical data."""
    db = get_firestore_client()
    doc_ref = db.collection("medicalProfiles").document(user["uid"])
    doc = doc_ref.get()
    
    if not doc.exists:
        # Return a blank profile format if it doesn't exist yet
        return {
            "profile": {
                "bloodGroup": "",
                "height": "",
                "weight": "",
                "allergies": [],
                "chronicConditions": [],
                "currentMedications": [],
                "pastSurgeries": [],
                "familyHistory": [],
                "lifestyle": {"smoking": "No", "alcohol": "No", "exercise": "None"},
                "emergencyContact": {"name": "", "phone": "", "relation": ""}
            }
        }
        
    return {"profile": doc.to_dict()}


@router.put("/profile")
async def update_user_profile(
    profile_data: dict = Body(...), 
    user=Depends(verify_firebase_token)
):
    """Update user's medical profile."""
    db = get_firestore_client()
    doc_ref = db.collection("medicalProfiles").document(user["uid"])
    
    profile_data["updatedAt"] = datetime.utcnow()
    
    # Use set with merge=True to act as an upsert
    doc_ref.set(profile_data, merge=True)
    
    return {"message": "Profile updated successfully"}
