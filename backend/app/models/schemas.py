from pydantic import BaseModel, Field


class SymptomAnalysisRequest(BaseModel):
    symptoms: list[str] = Field(..., min_length=1, description="List of reported symptoms")
    input_method: str = Field(default="text", description="Input method: text, voice, or quick-select")
    language: str = Field(default="en", description="Language code: en or hi")


class ConditionPrediction(BaseModel):
    name: str
    confidence: float


class SymptomAnalysisResponse(BaseModel):
    predicted_conditions: list[ConditionPrediction]
    urgency_level: str
    recommendations: list[str]
    specialist_recommended: str
    follow_up_questions: list[str]
    assessment_id: str | None = None


class FollowUpRequest(BaseModel):
    symptoms: list[str] = Field(..., min_length=1)


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: str = Field(default="")
    input_method: str = Field(default="text")
    language: str = Field(default="en")


class ChatMessageResponse(BaseModel):
    reply: str
    is_complete: bool = False
    symptoms_detected: list[str] = []
    analysis: SymptomAnalysisResponse | None = None
    assessment_id: str | None = None


class AppointmentBookRequest(BaseModel):
    assessment_id: str
    hospital_name: str
    hospital_address: str
    hospital_place_id: str = ""
    specialist_type: str
    doctor_name: str = ""
    appointment_date: str
    time_slot: str


class OTPVerifyRequest(BaseModel):
    appointment_id: str
    otp: str
