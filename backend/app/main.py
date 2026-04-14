from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routers import symptoms, appointments, users, assessments

load_dotenv()

app = FastAPI(
    title="MediCheck AI API",
    description="AI-powered symptom checker and triage bot backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(symptoms.router, prefix="/api/symptoms", tags=["Symptoms"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(assessments.router, prefix="/api/assessments", tags=["Assessments"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "MediCheck AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
