import os
from dotenv import load_dotenv
load_dotenv()
from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")

supabase = create_client(url, key)
res = supabase.table("motor_conduccion_preventiva").select("periodo_id, curso_id, asignatura, corte_temporal").limit(10).execute()
print(res.data)
