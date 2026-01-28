from supabase import create_client, Client
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if api_key:
    genai.configure(api_key=api_key)

supabase: Client = create_client(supabase_url, supabase_key)

def test_rag():
    print("🧪 PROBANDO SISTEMA RAG (CORREGIDO)...")
    
    # 1. Verificar documentos
    count = supabase.table("documentos_institucionales").select("count", count="exact").execute()
    print(f"📄 Documentos en base de datos: {count.count}")
    
    # 2. Probar búsqueda
    query = "evaluación" 
    print(f"🔍 Buscando: '{query}'...")
    
    # Generar embedding (CORREGIDO: Sin title)
    embedding = genai.embed_content(
        model="models/text-embedding-004",
        content=query,
        task_type="retrieval_query"
        # ELIMINADO: title="Test" (Esto causaba el error)
    )['embedding']
    
    # Ejecutar búsqueda RPC
    try:
        matches = supabase.rpc(
            "match_documents", 
            {
                "query_embedding": embedding,
                "match_threshold": 0.5, 
                "match_count": 3
            }
        ).execute()
        
        if matches.data:
            print("✅ ¡BÚSQUEDA EXITOSA! El sistema encontró esto en tus reglamentos:")
            for m in matches.data:
                print(f"   --- (Similitud: {m['similarity']:.4f}) ---")
                print(f"   {m['content'][:150]}...") # Muestra los primeros 150 caracteres
                print("   ------------------------------------------")
        else:
            print("⚠️ No se encontraron coincidencias exactas con 'evaluación', intenta bajar el umbral.")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_rag()