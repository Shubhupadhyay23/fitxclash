from fastapi import HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings
import logging
import json
import os

logger = logging.getLogger(__name__)

# Initialize Firebase Admin (if credentials provided)
firebase_app = None
if settings.firebase_credentials:
    try:
        # Handle both file path and JSON string from environment variable
        cred_value = settings.firebase_credentials
        
        # Check if it's a JSON string (starts with {) or a file path
        if cred_value.strip().startswith('{'):
            # It's a JSON string - parse it
            cred_dict = json.loads(cred_value)
            cred = credentials.Certificate(cred_dict)
        elif os.path.isfile(cred_value):
            # It's a file path
            cred = credentials.Certificate(cred_value)
        else:
            # Try parsing as JSON string anyway
            cred_dict = json.loads(cred_value)
            cred = credentials.Certificate(cred_dict)
        
        firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized successfully")
    except json.JSONDecodeError as e:
        logger.error(f"Firebase credentials JSON parsing failed: {e}")
        logger.warning("Firebase Admin initialization failed - invalid JSON format")
    except Exception as e:
        logger.warning(f"Firebase Admin initialization failed: {e}")
elif settings.environment == "development":
    # For development, allow bypassing auth if Firebase not configured
    logger.warning("Firebase credentials not configured - auth will be bypassed in development")

security = HTTPBearer(auto_error=False)


async def verify_firebase_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    authorization: Optional[str] = Header(None),
) -> Optional[dict]:
    """
    Verify Firebase ID token and return decoded token.
    Returns None if auth is disabled (development mode without Firebase).
    """
    # If Firebase not configured, check if we allow bypass (useful for demos/local testing)
    if not firebase_app and (settings.environment.lower() == "development" or settings.allow_auth_bypass):
        logger.debug(f"Firebase not configured - bypassing auth (Environment: {settings.environment}, Bypass: {settings.allow_auth_bypass})")
        return None
    
    if not firebase_app:
        logger.error(f"❌ Authentication service not configured (Environment: {settings.environment})")
        raise HTTPException(
            status_code=503,
            detail=f"Authentication service not configured (Environment: {settings.environment})"
        )
    
    # Get token from Authorization header or Bearer token
    token = None
    if credentials:
        token = credentials.credentials
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1]
    
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")


async def get_current_user(
    token_data: Optional[dict] = Depends(verify_firebase_token),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """
    Get current user from Firebase token.
    Returns user data or a unique mock user if auth is bypassed.
    """
    if token_data is None:
        # Auth is bypassed - generate a mock UID based on the token provided (even if it's not a real JWT)
        # This allows multiple "fake" users to have unique IDs for matchmaking
        mock_uid = "dev_user_123"
        mock_email = "dev@example.com"
        
        if credentials and credentials.credentials:
            # Use a hash of the token as the UID so different sessions get different IDs
            import hashlib
            token_hash = hashlib.md5(credentials.credentials.encode()).hexdigest()[:12]
            mock_uid = f"mock_{token_hash}"
            mock_email = f"{mock_uid}@example.com"
            logger.info(f"Generated mock UID from token: {mock_uid}")
        
        return {
            "uid": mock_uid,
            "email": mock_email,
        }
    
    return {
        "uid": token_data.get("uid"),
        "email": token_data.get("email"),
        "name": token_data.get("name"),
    }


async def require_auth(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency that requires authentication.
    Raises 401 if user is not authenticated.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user

