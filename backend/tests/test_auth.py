import pytest
from fastapi import status


def test_auth_missing_header_rejected(unauthenticated_client):
    """Requests without secret or token should be rejected with 401."""
    response = unauthenticated_client.post(
        "/api/interview/generate",
        json={"role": "Dev", "level": "Mid", "techstack": "Node", "type": "Tech", "amount": 3},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_auth_invalid_header_rejected(unauthenticated_client):
    """Requests with incorrect secret should be rejected with 401."""
    response = unauthenticated_client.post(
        "/api/interview/generate",
        headers={"x-internal-secret": "wrong-secret"},
        json={"role": "Dev", "level": "Mid", "techstack": "Node", "type": "Tech", "amount": 3},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_auth_valid_bearer_token(unauthenticated_client):
    """Requests with Bearer matching secret should be accepted."""
    response = unauthenticated_client.post(
        "/api/interview/generate",
        headers={"Authorization": "Bearer test-secret-key"},
        json={"role": "Dev", "level": "Mid", "techstack": "Node", "type": "Tech", "amount": 3},
    )
    # Passed auth (may be 200 or processed downstream)
    assert response.status_code != status.HTTP_401_UNAUTHORIZED
