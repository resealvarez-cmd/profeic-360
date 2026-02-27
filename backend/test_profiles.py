from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
profiles = supabase.table('profiles').select('id, email, full_name, role').execute()
print("Total profiles:", len(profiles.data))
for p in profiles.data[:5]:
    print(p.get('email'), p.get('id'))
