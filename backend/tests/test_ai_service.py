import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from google.api_core.exceptions import ResourceExhausted
from app.services.ai_service import GeminiKeyManager, AIService


@pytest.mark.asyncio
async def test_key_manager_single_key_success():
    """Single key generates content without rotation."""
    manager = GeminiKeyManager(["key-1"])
    mock_model = MagicMock()
    mock_model.generate_content_async = AsyncMock(return_value=MagicMock(text="test output"))

    with patch.object(manager, "build_model", return_value=mock_model):
        result = await manager.generate_with_fallback("hello")

    assert result == "test output"
    assert mock_model.generate_content_async.call_count == 1


@pytest.mark.asyncio
async def test_key_manager_rotation_on_rate_limit():
    """Key #1 rate limits -> Key #2 succeeds."""
    manager = GeminiKeyManager(["key-1", "key-2"])
    call_count = 0

    def mock_build_model(model_name="gemini-2.5-flash"):
        nonlocal call_count
        call_count += 1
        m = MagicMock()
        if call_count == 1:
            m.generate_content_async = AsyncMock(side_effect=ResourceExhausted("Rate limit exceeded"))
        else:
            m.generate_content_async = AsyncMock(return_value=MagicMock(text="success on key-2"))
        return m

    with patch.object(manager, "build_model", side_effect=mock_build_model):
        result = await manager.generate_with_fallback("hello")

    assert result == "success on key-2"
    assert call_count == 2
    assert manager.current_key == "key-2"


@pytest.mark.asyncio
async def test_key_manager_all_keys_exhausted():
    """All keys fail with ResourceExhausted -> raises ResourceExhausted."""
    manager = GeminiKeyManager(["key-1", "key-2"])

    def mock_build_model(model_name="gemini-2.5-flash"):
        m = MagicMock()
        m.generate_content_async = AsyncMock(side_effect=ResourceExhausted("Rate limit exceeded"))
        return m

    with patch.object(manager, "build_model", side_effect=mock_build_model):
        with pytest.raises(ResourceExhausted):
            await manager.generate_with_fallback("hello")


@pytest.mark.asyncio
async def test_ai_service_generate_questions():
    """AIService generates list of questions parsed from JSON."""
    service = AIService()
    mock_response = '["What is React?", "Explain closures in JS."]'

    with patch.object(service._key_manager, "generate_with_fallback", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_response
        questions = await service.generate_questions("Frontend", "Junior", "React", "Technical", 2)

    assert len(questions) == 2
    assert "What is React?" in questions
