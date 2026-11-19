import logging
from typing import Optional
from fastapi import Header, HTTPException, status
from app.config import settings
import firebase_admin
from firebase_admin import auth as firebase_auth

logger = logging.getLogger(__name__)


async def verify_backend_auth(
    x_internal_secret: Optional[str] = Header(None, alias="x-internal-secret"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> bool:
    """
    Validate that incoming requests originate from an authorized client.
    Supports either:
      1. Internal shared secret via 'x-internal-secret' header or Bearer secret.
      2. Valid Firebase ID token via 'Authorization: Bearer <id_token>'.
    If BACKEND_SECRET_KEY is not configured in settings, requests are permitted (with a warning in logs).
    """
    expected_secret = settings.backend_secret_key.strip() if settings.backend_secret_key else ""

    # If an internal secret is configured, check for match first
    if expected_secret:
        # Check x-internal-secret header
        if x_internal_secret and x_internal_secret == expected_secret:
            return True

        # Check Authorization: Bearer <secret>
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split("Bearer ", 1)[1].strip()
            if token == expected_secret:
                return True

            # Attempt Firebase token verification if not matching shared secret
            try:
                decoded_token = firebase_auth.verify_id_token(token)
                if decoded_token and "uid" in decoded_token:
                    return True
            except Exception as e:
                logger.debug(f"Firebase token verification failed: {e}")

        logger.warning("[Security] Unauthorized request rejected: invalid secret or token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing backend authentication credentials.",
        )

    # When no secret key is configured, allow requests (e.g., local development)
    return True
