import requests
import json

base_url = "http://localhost:8000/lectura-inteligente"

oa_text = "Analizar las narraciones leídas para enriquecer su comprensión, considerando, cuando sea pertinente: el o los conflictos de la historia, los personajes, su evolución en el relato y su relación con otros personajes."

print("1. Generando texto...")
res_texto = requests.post(f"{base_url}/generar-texto", json={
    "nivel": "1° Medio",
    "asignatura": "Lengua y Literatura",
    "oa": oa_text,
    "tipo_texto": "Informativo",
    "extension_texto": "Media (300-500 palabras)"
})

if not res_texto.ok:
    print("Error generando texto:", res_texto.text)
    exit(1)

texto = res_texto.json()['texto']
print(f"Texto generado ({len(texto)} chars).")

print("2. Generando 20 preguntas...")
res_preg = requests.post(f"{base_url}/generar-preguntas", json={
    "nivel": "1° Medio",
    "asignatura": "Lengua y Literatura",
    "oa": oa_text,
    "texto": texto,
    "num_preguntas": 20
})

if not res_preg.ok:
    print("Error generando preguntas:", res_preg.text)
else:
    print("Éxito! Generadas", len(res_preg.json()['preguntas']), "preguntas")
