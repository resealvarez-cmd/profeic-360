import os
import sys
from dotenv import load_dotenv

print("--- DIAGNÓSTICO DE BACKEND ---")

# 1. Check Imports
print("[1] Verificando dependencias...")
try:
    import pypdf
    print("✅ pypdf instalado")
except ImportError:
    print("❌ ERROR: pypdf no instalado. Ejecuta 'pip install pypdf'")

try:
    from supabase import create_client
    print("✅ supabase instalado")
except ImportError:
    print("❌ ERROR: supabase no instalado. Ejecuta 'pip install supabase'")

# 2. Check Environment
print("\n[2] Verificando variables de entorno...")
load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if url and key:
    print(f"✅ Credenciales encontradas: URL={url[:15]}...")
else:
    print("❌ ERROR: Faltan variables SUPABASE_URL o SUPABASE_KEY en .env")
    sys.exit(1)

# 3. Check Supabase Connection & Bucket
print("\n[3] Verificando conexión a Supabase y Bucket...")
try:
    client = create_client(url, key)
    # Intentar listar buckets
    buckets = client.storage.list_buckets()
    print("✅ Conexión exitosa a Supabase")
    
    bucket_name = "biblioteca_contexto"
    found = False
    for b in buckets:
        if b.name == bucket_name:
            found = True
            break
            
    if found:
        print(f"✅ Bucket '{bucket_name}' ENCONTRADO.")
    else:
        print(f"❌ ERROR: Bucket '{bucket_name}' NO ENCONTRADO.")
        print("   -> Debes crear un bucket público llamado 'biblioteca_contexto' en tu proyecto Supabase.")

except Exception as e:
    print(f"❌ Error conectando a Supabase: {e}")

print("\n--- FIN DEL DIAGNÓSTICO ---")
