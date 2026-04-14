import firebase_admin
from firebase_admin import credentials, firestore
from app.config import get_settings
import os

_firebase_app = None


def get_firebase_app():
    """Initialize Firebase Admin SDK (singleton)."""
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    settings = get_settings()
    key_path = settings.firebase_service_account_key_path

    if os.path.exists(key_path):
        cred = credentials.Certificate(key_path)
        _firebase_app = firebase_admin.initialize_app(cred)
    else:
        # Fall back to default credentials (for Cloud environments)
        _firebase_app = firebase_admin.initialize_app()

    return _firebase_app


def get_firestore_client():
    """Get Firestore client."""
    get_firebase_app()
    return firestore.client()
