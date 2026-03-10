import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client
import json

load_dotenv("backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def extract_oas(contenido):
    oas_a_registrar = set()
    if not isinstance(contenido, dict):
        return oas_a_registrar

    # 1. Extraer oas de oaId o oaDescripcion (Rúbricas, etc)
    if "oaId" in contenido and contenido["oaId"] and str(contenido["oaId"]).lower() != "manual":
        oas_a_registrar.add(str(contenido["oaId"]))
    elif "oaDescripcion" in contenido and contenido["oaDescripcion"]:
        oas_a_registrar.add(str(contenido["oaDescripcion"])[:255])
        
    # 2. Extraer de oaTexts (usado en Evaluaciones)
    if "oaTexts" in contenido and isinstance(contenido["oaTexts"], list):
        for oa in contenido["oaTexts"]:
            if oa: oas_a_registrar.add(str(oa)[:255])
            
    # 3. Extraer de customOa
    if "customOa" in contenido and contenido["customOa"]:
        oas_a_registrar.add(str(contenido["customOa"])[:255])

    # 4. Planificador / Otros que envían su propio array
    if "oas_asociados" in contenido and isinstance(contenido["oas_asociados"], list):
        for oa in contenido["oas_asociados"]:
            if oa: oas_a_registrar.add(str(oa)[:255])
            
    # Mochila del planificador
    if "mochila" in contenido and isinstance(contenido["mochila"], list):
        for oa_item in contenido["mochila"]:
            if isinstance(oa_item, dict) and "descripcion" in oa_item:
                oas_a_registrar.add(str(oa_item["descripcion"])[:255])

    return list(oas_a_registrar)

async def backfill():
    print("Fetching all existing resources from biblioteca_recursos...")
    # Fetch all records (paginated if > 1000, but let's try direct first)
    response = supabase.table("biblioteca_recursos").select("*").execute()
    recursos = response.data
    
    if not recursos:
        print("No resources found.")
        return

    print(f"Found {len(recursos)} resources to process.")
    
    new_records = []
    
    for r in recursos:
        # Skip garbage
        if not r.get('asignatura') or r.get('asignatura').lower() in ["", "general", "manual"]:
            continue
        if not r.get('nivel') or r.get('nivel').lower() in ["", "general", "manual"]:
            continue
            
        contenido = r.get('contenido', {})
        if isinstance(contenido, str):
            try:
                contenido = json.loads(contenido)
            except:
                continue
                
        oas = extract_oas(contenido)
        for oa in oas:
            new_records.append({
                "user_id": r.get("user_id"),
                "nivel": r.get("nivel"),
                "asignatura": r.get("asignatura"),
                "oa_id": str(oa),
                "recurso_id": r.get("id"),
                "tipo_recurso": r.get("tipo"),
                "fecha": r.get("created_at")
            })
            
    print(f"Extracted {len(new_records)} OA coverage records to insert.")
    if new_records:
        # Insert in chunks of 100 to avoid request limits
        chunk_size = 100
        for i in range(0, len(new_records), chunk_size):
            chunk = new_records[i:i + chunk_size]
            res = supabase.table("cobertura_curricular").insert(chunk).execute()
            print(f"Inserted chunk {i//chunk_size + 1}: {len(res.data)} records")
            
    print("Backfill complete!")

if __name__ == "__main__":
    asyncio.run(backfill())
