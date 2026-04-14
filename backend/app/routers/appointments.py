from fastapi import APIRouter, Depends, HTTPException, status
from app.middleware import verify_firebase_token
from app.models.schemas import AppointmentBookRequest, OTPVerifyRequest
from app.services.firebase_service import get_firestore_client
from google.cloud.firestore_v1.base_query import FieldFilter
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/book")
async def book_appointment(request: AppointmentBookRequest, user=Depends(verify_firebase_token)):
    """Book an appointment (creates a pending OTP request)."""
    db = get_firestore_client()
    appointment_id = str(uuid.uuid4())
    
    appointment_data = {
        "userId": user["uid"],
        "assessmentId": request.assessment_id,
        "hospitalName": request.hospital_name,
        "hospitalAddress": request.hospital_address,
        "hospitalPlaceId": request.hospital_place_id,
        "specialistType": request.specialist_type,
        "doctorName": request.doctor_name,
        "appointmentDate": request.appointment_date,
        "timeSlot": request.time_slot,
        "status": "pending_otp",
        "otpVerified": False,
        "createdAt": datetime.utcnow()
    }
    
    db.collection("appointments").document(appointment_id).set(appointment_data)
    
    # In a real app we would integrate Twilio or Firebase Phone Auth to send the SMS here.
    return {
        "message": "Appointment created. Pending OTP verification.", 
        "appointment_id": appointment_id,
        "action_required": "verify_otp"
    }


@router.post("/verify-otp")
async def verify_otp(request: OTPVerifyRequest, user=Depends(verify_firebase_token)):
    """Verify OTP for appointment. 123456 is the mock OTP for development."""
    db = get_firestore_client()
    doc_ref = db.collection("appointments").document(request.appointment_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    data = doc.to_dict()
    if data.get("userId") != user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this appointment")
        
    if request.otp == "123456":
        doc_ref.update({
            "status": "confirmed",
            "otpVerified": True,
            "updatedAt": datetime.utcnow()
        })
        return {"message": "Appointment confirmed successfully", "status": "confirmed"}
    else:
        raise HTTPException(status_code=400, detail="Invalid OTP entered")


@router.get("/{user_id}")
async def get_appointments(user_id: str, user=Depends(verify_firebase_token)):
    """Get user's appointments."""
    if user_id != user["uid"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    db = get_firestore_client()
    docs = db.collection("appointments").where(filter=FieldFilter("userId", "==", user_id)).get()
    
    appointments = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        appointments.append(data)
        
    return {"appointments": appointments}
