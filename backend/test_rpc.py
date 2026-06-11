import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv("backend/.env")
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

try:
    # Intentar ejecutar SELECT 1 usando un RPC genérico como exec_sql
    res = supabase.rpc("exec_sql", {"query": "SELECT 1"}).execute()
    print("¡Existe exec_sql! Res:", res.data)
except Exception as e:
    print("Error llamando a exec_sql:", str(e))
