import os
import sys
import pytest
from unittest.mock import MagicMock, patch

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set test environment variables before importing app
os.environ["GOOGLE_API_KEY"] = "test-google-api-key"
os.environ["GOOGLE_API_KEYS"] = "test-google-api-key-2,test-google-api-key-3"
os.environ["FIREBASE_PROJECT_ID"] = "test-project-id"
os.environ["FIREBASE_PRIVATE_KEY_ID"] = "test-key-id"
os.environ["FIREBASE_PRIVATE_KEY"] = "test-private-key"
os.environ["FIREBASE_CLIENT_EMAIL"] = "test@test-project-id.iam.gserviceaccount.com"
os.environ["FIREBASE_CLIENT_ID"] = "123456789"
os.environ["BACKEND_SECRET_KEY"] = "test-secret-key"

# ── Mock firebase_admin BEFORE any app module imports ─────────────────────────
# FirebaseService initialises as a singleton at module-load time and calls
# credentials.Certificate(), which validates the private key.  We stub the
# entire firebase_admin namespace so no real key material is required.

_mock_firestore_client = MagicMock()
_mock_firebase_admin = MagicMock()
_mock_firebase_admin.credentials.Certificate.return_value = MagicMock()
_mock_firebase_admin.initialize_app.return_value = MagicMock()
_mock_firebase_admin.firestore.client.return_value = _mock_firestore_client

sys.modules["firebase_admin"] = _mock_firebase_admin
sys.modules["firebase_admin.credentials"] = _mock_firebase_admin.credentials
sys.modules["firebase_admin.firestore"] = _mock_firebase_admin.firestore
sys.modules["firebase_admin.auth"] = _mock_firebase_admin.auth

# Now it's safe to import the FastAPI app
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings


@pytest.fixture
def client():
    """FastAPI TestClient with default internal secret header."""
    return TestClient(app, headers={"x-internal-secret": settings.backend_secret_key})


@pytest.fixture
def unauthenticated_client():
    """FastAPI TestClient with no auth headers."""
    return TestClient(app)
