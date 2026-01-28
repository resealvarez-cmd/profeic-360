import google.generativeai as genai
from app.core.config import settings
import re

genai.configure(api_key=settings.GOOGLE_API_KEY)
generation_config = {"temperature": 0.4, "response_mime_type": "application/json"}
model = genai.GenerativeModel("gemini-1.5-flash", generation_config=generation_config)

def clean_json(text):
    return re.sub(r'^```json\s*|\s*```$', '', text, flags=re.MULTILINE).strip()
