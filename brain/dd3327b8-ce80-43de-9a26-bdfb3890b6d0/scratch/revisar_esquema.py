import os
from dotenv import load_dotenv
from supabase import create_client

# Cargar del path absoluto del backend para evitar problemas de contexto de directorio
load_dotenv("/Users/renealvarezpinones/Downloads/PROFEIC_GITHUB_01_2/backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    print("❌ Error: No se encontraron las claves en el archivo .env")
    exit()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("--- DIAGNÓSTICO DE ASIGNATURAS Y NIVELES ---")

# 1. Obtener de departamentos
try:
    res_depto = supabase.table('departamentos').select('*').execute()
    print(f"\n🏢 Departamentos en public.departamentos ({len(res_depto.data)}):")
    for d in res_depto.data:
        print(f"   ID: {d.get('id')} - Nombre: {d.get('nombre')}")
except Exception as e:
    print(f"\n❌ Error consultando 'departamentos': {e}")

# 2. Obtener asignaturas únicas de curriculum
try:
    res_curr = supabase.table('curriculum').select('asignatura').limit(2000).execute()
    asigs = sorted(list({x['asignatura'] for x in res_curr.data if x.get('asignatura')}))
    print(f"\n📚 Asignaturas en public.curriculum (primeros 2000 registros, {len(asigs)} únicas):")
    for a in asigs:
        print(f"   - {a}")
except Exception as e:
    print(f"\n❌ Error consultando asignaturas de 'curriculum': {e}")

# 3. Obtener niveles únicos de curriculum
try:
    res_curr_niv = supabase.table('curriculum').select('nivel').limit(2000).execute()
    niveles = sorted(list({x['nivel'] for x in res_curr_niv.data if x.get('nivel')}))
    print(f"\n🏫 Niveles/Cursos en public.curriculum (primeros 2000 registros, {len(niveles)} únicos):")
    for n in niveles:
        print(f"   - {n}")
except Exception as e:
    print(f"\n❌ Error consultando niveles de 'curriculum': {e}")
