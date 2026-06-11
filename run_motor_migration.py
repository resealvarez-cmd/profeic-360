import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv("backend/.env")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Leer archivo de migración
with open("supabase/migrations/20260530_corte_temporal_motor.sql", "r", encoding="utf-8") as f:
    sql = f.read()

try:
    res = supabase.rpc("exec_sql", {"query": sql}).execute()
    print("Migración aplicada exitosamente mediante RPC:", res)
except Exception as e:
    print("Error ejecutando RPC:", str(e))

