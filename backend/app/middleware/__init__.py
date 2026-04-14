from fastapi import Request, HTTPException, Depends
from firebase_admin import auth as firebase_auth
from app.services.firebase_service import get_firebase_app


async def verify_firebase_token(request: Request):
    """Verify Firebase ID token from Authorization header."""
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header"
        )

    token = auth_header.split("Bearer ")[1]

    try:
        # Ensure Firebase app is initialized
        get_firebase_app()
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except firebase_auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")
