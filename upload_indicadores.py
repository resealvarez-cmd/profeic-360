import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Cargar variables de entorno desde backend/.env
# Asumiendo que el script se ejecuta desde la raíz del proyecto
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL o SUPABASE_KEY no configurados en el archivo .env")
    exit(1)

# Inicializar cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_indicadores():
    json_path = 'indicadores_curriculum_mineduc-2.json'
    
    if not os.path.exists(json_path):
        print(f"Error: No se encontró el archivo {json_path}")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error al leer el archivo JSON: {e}")
        return

    records_to_insert = []
    
    for entry in data:
        nivel = entry.get('nivel')
        asignatura = entry.get('asignatura')
        oa_codigo = entry.get('oa_codigo')
        indicadores = entry.get('indicadores', [])
        
        for indicador in indicadores:
            records_to_insert.append({
                "nivel": nivel,
                "asignatura": asignatura,
                "oa_codigo": oa_codigo,
                "indicador": indicador
            })

    if not records_to_insert:
        print("No hay datos para insertar.")
        return

    print(f"Preparados {len(records_to_insert)} registros para insertar...")

    # Dividir en lotes para evitar límites de tamaño de solicitud si es necesario
    # Supabase/PostgREST maneja bien inserciones masivas, pero por si acaso usamos lotes
    batch_size = 1000
    total_inserted = 0
    
    for i in range(0, len(records_to_insert), batch_size):
        batch = records_to_insert[i:i + batch_size]
        try:
            response = supabase.table("curriculum_indicadores").insert(batch).execute()
            total_inserted += len(batch)
            print(f"Insertados {total_inserted}/{len(records_to_insert)} registros...")
        except Exception as e:
            print(f"Error al insertar lote {i//batch_size + 1}: {e}")

    print(f"\nTarea finalizada.")
    print(f"Total de registros insertados: {total_inserted}")

if __name__ == "__main__":
    upload_indicadores()
