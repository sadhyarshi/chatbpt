import google.generativeai as genai
from app.config import settings
from app.models.chat_history import ChatHistory  # Import the ChatHistory model

genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_response(prompt: str):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return response.text