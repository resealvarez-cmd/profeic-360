from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
res = supabase.table('authorized_users').select('role').execute()
roles = set([r.get('role') for r in res.data])
print("Available roles:", roles)
