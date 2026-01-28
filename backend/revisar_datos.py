import os
from dotenv import load_dotenv
from supabase import create_client

# 1. Cargar claves del archivo .env
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    print("❌ Error: No se encontraron las claves en el archivo .env")
    exit()

# 2. Conectar a Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("--- INICIANDO DIAGNÓSTICO ESPECÍFICO (5° Básico) ---\n")

# Estas son las asignaturas que se ven en tus fotos
asignaturas_revisar = [
    "Artes Visuales", 
    "Educación Física y Salud", 
    "Historia, Geografía y Ciencias Sociales" # Esta se veía bien, servirá de control
]

# El nivel exacto donde tienes el problema visual
NIVEL_A_REVISAR = "5° Básico"

for asignatura in asignaturas_revisar:
    print(f"🔍 Revisando: {asignatura} en {NIVEL_A_REVISAR}...")
    
    try:
        # Consultamos filtrando por ASIGNATURA y por NIVEL
        response = supabase.table('curriculum')\
            .select('*')\
            .eq('asignatura', asignatura)\
            .eq('nivel', NIVEL_A_REVISAR)\
            .limit(5)\
            .execute()
            
        datos = response.data
        
        if not datos:
            print(f"   ⚠️ No se encontraron datos para {asignatura} en {NIVEL_A_REVISAR}.")
            continue

        for oa in datos:
            codigo = oa.get('oa_codigo', 'Sin Código')
            descripcion = oa.get('descripcion', '')
            
            # Limpiamos espacios en blanco por si acaso
            if descripcion:
                descripcion = descripcion.strip()

            # Chequeo de salud del dato
            if not descripcion or len(descripcion) < 5:
                print(f"   ❌ {codigo}: DESCRIPCIÓN VACÍA.")
                print(f"      (Esto causa que la tarjeta se vea en blanco)")
            else:
                # Mostramos los primeros 50 caracteres para verificar
                print(f"   ✅ {codigo}: OK - '{descripcion[:50]}...'")
                
    except Exception as e:
        print(f"   💥 Error consultando Supabase: {e}")
    
    print("-" * 30)

print("\n--- DIAGNÓSTICO TERMINADO ---")