import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print(f"API Key present: {'Yes' if api_key else 'No'}")

# Testing model gemini-2.5-flash (as user insists)
model_name = "gemini-2.5-flash"
print(f"Testing model: {model_name}")

try:
    model = genai.GenerativeModel(
        model_name,
        generation_config={"response_mime_type": "application/json"}
    )
    
    test_data = [{"id": "1", "title": "Meta Test", "implementation_phases": []}]
    
    sys_prompt = """Retorna JSON: { "status": "ok" }"""
    prompt = f"{sys_prompt}\n\n[DATOS]: {json.dumps(test_data)}"
    
    response = model.generate_content(prompt)
    print("Response text:", response.text)
except Exception as e:
    print(f"FAILED with {model_name}: {e}")

# Also testing gemini-1.5-flash as fallback 
model_name_fallback = "gemini-1.5-flash"
print(f"Testing fallback model: {model_name_fallback}")
try:
    model_fb = genai.GenerativeModel(
        model_name_fallback,
        generation_config={"response_mime_type": "application/json"}
    )
    response_fb = model_fb.generate_content("Hola, dime 'ok' en JSON")
    print("Fallback Response text:", response_fb.text)
except Exception as e:
    print(f"FAILED with {model_name_fallback}: {e}")
