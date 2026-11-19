import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import status


def test_aptitude_generate_endpoint(client):
    """POST /api/aptitude/generate generates MCQs for category."""
    mock_questions = [
        {
            "id": "q1",
            "question": "What is 15% of 200?",
            "options": ["A. 20", "B. 30", "C. 40", "D. 50"],
            "correct_answer": "B",
            "explanation": "15% of 200 = 30",
            "difficulty": "medium",
        }
    ]

    with patch("app.api.aptitude.ai_service.generate_aptitude_questions", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_questions

        response = client.post(
            "/api/aptitude/generate",
            json={
                "category": "quantitative",
                "amount": 5,   # schema enforces ge=5; 1 would return 422
                "difficulty": "medium",
                "user_id": "user-test",
            },
        )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["questions"]) == 1
    assert data["questions"][0]["correct_answer"] == "B"


def test_aptitude_get_results_endpoint(client):
    """GET /api/aptitude/results/{user_id} fetches results from Firestore."""
    mock_doc = MagicMock()
    mock_doc.id = "res-1"
    mock_doc.to_dict.return_value = {
        "userId": "user-abc",
        "category": "quantitative",
        "score": 8,
        "totalQuestions": 10,
        "percentage": 80.0,
        "answers": [],
        "createdAt": "2024-03-20T10:00:00Z",
    }

    mock_db = MagicMock()
    (mock_db.collection.return_value
        .where.return_value
        .order_by.return_value
        .limit.return_value
        .get.return_value) = [mock_doc]

    # Patch the private _db attribute — the `db` @property reads from _db.
    # Using patch.object on the singleton instance avoids the read-only property error.
    from app.services.firebase_service import firebase_service
    with patch.object(type(firebase_service), "db", new_callable=lambda: property(lambda self: mock_db)):
        response = client.get("/api/aptitude/results/user-abc")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert len(data["results"]) == 1
    assert data["results"][0]["score"] == 8
