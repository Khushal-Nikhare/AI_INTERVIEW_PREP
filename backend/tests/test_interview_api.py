import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import status


def test_interview_generate_endpoint(client):
    """POST /api/interview/generate calls AI service and returns questions."""
    mock_questions = ["Explain event loop in Node.js", "What is an index in MongoDB?"]

    # Patch both AI generation AND firebase db write so no real I/O occurs
    with patch("app.api.interview.ai_service.generate_questions", new_callable=AsyncMock) as mock_gen, \
         patch("app.api.interview.firebase_service._db") as mock_db:
        mock_gen.return_value = mock_questions
        mock_ref = MagicMock()
        mock_ref.id = "interview-123"
        mock_db.collection.return_value.document.return_value = mock_ref

        response = client.post(
            "/api/interview/generate",
            json={
                "role": "Backend Engineer",
                "level": "Mid",
                "techstack": "Node.js, MongoDB",
                "type": "Technical",
                "amount": 2,
                "user_id": "user-test-123",   # required field per schema
            },
        )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert data["questions"] == mock_questions


def test_interview_feedback_success(client):
    """POST /api/interview/feedback returns 200 with mocked AI + Firestore."""
    from unittest.mock import MagicMock

    mock_feedback = MagicMock()
    mock_feedback.total_score = 85
    mock_feedback.communication_skills = MagicMock(name="Communication", score=80, comment="Good")
    mock_feedback.technical_knowledge = MagicMock(name="Technical", score=90, comment="Strong")
    mock_feedback.problem_solving = MagicMock(name="Problem Solving", score=85, comment="Solid")
    mock_feedback.cultural_fit = MagicMock(name="Cultural Fit", score=80, comment="Fits well")
    mock_feedback.confidence_and_clarity = MagicMock(name="Clarity", score=82, comment="Clear")
    mock_feedback.strengths = "Strong technical skills"
    mock_feedback.areas_for_improvement = "Work on verbal communication"
    mock_feedback.final_assessment = "Strong candidate overall"

    with patch("app.api.interview.ai_service.generate_feedback", new_callable=AsyncMock) as mock_gen, \
         patch("app.api.interview.firebase_service._db") as mock_db:
        mock_gen.return_value = mock_feedback
        mock_ref = MagicMock()
        mock_ref.id = "feedback-456"
        mock_db.collection.return_value.document.return_value = mock_ref

        response = client.post(
            "/api/interview/feedback",
            json={
                "interview_id": "int-123",
                "user_id": "usr-123",
                "transcript": [
                    {"role": "assistant", "content": "Tell me about yourself."},
                    {"role": "user", "content": "I am a backend developer with 3 years experience."},
                ],
            },
        )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["success"] is True
    assert "feedback_id" in data


def test_interview_feedback_empty_transcript(client):
    """POST /api/interview/feedback with empty transcript still calls AI (no schema validation error)."""
    # The route schema accepts empty transcript (List[TranscriptMessage] with no min_length).
    # This documents the current behaviour: 200 with success=False when AI has no content to work with.
    with patch("app.api.interview.ai_service.generate_feedback", new_callable=AsyncMock) as mock_gen:
        mock_gen.side_effect = ValueError("Cannot generate feedback from empty transcript")

        response = client.post(
            "/api/interview/feedback",
            json={"interview_id": "int-123", "user_id": "usr-123", "transcript": []},
        )

    # Route catches all exceptions and returns success=False with 200
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["success"] is False
