"""
Firebase Admin SDK Configuration
برای verify کردن Firebase ID tokens در backend
"""

import firebase_admin
from firebase_admin import credentials, auth
import logging

logger = logging.getLogger(__name__)

# Firebase configuration (same as frontend for consistency)
firebase_config = {
    "apiKey": "AIzaSyBqWEmIIngkoEjiAUKAcT3rvQGtsvCj3qc",
    "authDomain": "snabb-82415.firebaseapp.com",
    "projectId": "snabb-82415",
    "storageBucket": "snabb-82415.firebasestorage.app",
    "messagingSenderId": "1006448447805",
    "appId": "1:1006448447805:web:c58b45899bcd67aa5d7554",
}


def initialize_firebase_admin():
    """
    Initialize Firebase Admin SDK
    Note: For production, use service account credentials JSON file
    """
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            # Initialize with project ID only (no service account needed for ID token verification)
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": firebase_config["projectId"],
                # For basic ID token verification, we don't need the full service account
                # In production, add the service account JSON file
            })
            
            # For now, initialize without credentials for ID token verification
            firebase_admin.initialize_app(options={
                'projectId': firebase_config["projectId"],
            })
            
            logger.info("✅ Firebase Admin SDK initialized successfully")
        return True
    except Exception as e:
        logger.warning(f"⚠️ Firebase Admin SDK initialization warning: {e}")
        logger.info("💡 ID token verification will use project ID only")
        return False


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify Firebase ID token
    
    Args:
        id_token: Firebase ID token from client
        
    Returns:
        dict: Decoded token with user info (uid, phone, etc.)
        
    Raises:
        Exception: If token is invalid
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"❌ Firebase token verification failed: {e}")
        raise Exception("توکن Firebase نامعتبر است")


def get_user_by_phone(phone_number: str) -> dict:
    """
    Get user by phone number from Firebase
    
    Args:
        phone_number: Phone number in E.164 format (e.g., +93799123456)
        
    Returns:
        dict: User record from Firebase
    """
    try:
        user = auth.get_user_by_phone_number(phone_number)
        return {
            "uid": user.uid,
            "phone": user.phone_number,
            "email": user.email,
            "display_name": user.display_name,
            "created_at": user.user_metadata.creation_timestamp,
        }
    except Exception as e:
        logger.error(f"❌ Error fetching user by phone: {e}")
        return None
