from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
res = supabase.table('authorized_users').select('*').eq('role', 'teacher').execute()
print("Authorized teachers:", len(res.data))
emails = [a['email'] for a in res.data]
profiles_res = supabase.table('profiles').select('id, email').in_('email', emails).execute()
print("Registered profiles:", len(profiles_res.data))
