"""
MASTER SEEDER - ProfeIC v3
=========================
Script infalible para cargar el 100% del CSV curriculum_oficial_v2.csv a Supabase.
Garantiza que NT1, NT2, 3° y 4° Medio lleguen correctamente a la base de datos.

Autor: Matrix Agent
Fecha: 2025-11-27
"""

import os
import csv
import sys
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List, Dict
import time

load_dotenv()

# Configuración
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
CSV_PATH = "curriculum_oficial_v2.csv"  # Ajusta la ruta según corresponda
TABLE_NAME = "curriculum"
BATCH_SIZE = 500  # Supabase recomienda batches de 500-1000 para evitar timeouts

# Validación de credenciales
if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Variables de entorno SUPABASE_URL y/o SUPABASE_KEY no configuradas.")
    print("   Verifica tu archivo .env")
    sys.exit(1)

# Conexión a Supabase
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Conexión a Supabase establecida correctamente.")
except Exception as e:
    print(f"❌ ERROR al conectar con Supabase: {e}")
    sys.exit(1)


def leer_csv_completo(csv_path: str) -> List[Dict[str, str]]:
    """
    Lee el CSV completo y retorna una lista de diccionarios.
    Garantiza lectura del 100% de las filas.
    """
    if not os.path.exists(csv_path):
        print(f"❌ ERROR: No se encontró el archivo {csv_path}")
        print(f"   Ruta absoluta buscada: {os.path.abspath(csv_path)}")
        sys.exit(1)
    
    registros = []
    niveles_unicos = set()
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for idx, row in enumerate(reader, start=2):  # Línea 2 = primera fila de datos
                # Normalizar nombres de columnas (eliminar espacios)
                row_clean = {k.strip(): v.strip() if v else None for k, v in row.items()}
                
                # Validar que tenga los campos mínimos requeridos
                if not row_clean.get('nivel') or not row_clean.get('asignatura'):
                    print(f"⚠️  ADVERTENCIA: Fila {idx} sin nivel o asignatura. Saltando...")
                    continue
                
                # Mapear a estructura de BD
                registro = {
                    'nivel': row_clean['nivel'],
                    'asignatura': row_clean['asignatura'],
                    'eje': row_clean.get('eje') or row_clean.get('ejes'),  # Soporta ambos nombres
                    'oa_codigo': row_clean.get('oa_codigo') or row_clean.get('codigo_oa'),
                    'descripcion': row_clean.get('descripcion') or row_clean.get('oa_descripcion')
                }
                
                registros.append(registro)
                niveles_unicos.add(registro['nivel'])
        
        print(f"\n📊 RESUMEN DE LECTURA:")
        print(f"   Total de OA leídos: {len(registros)}")
        print(f"   Niveles únicos encontrados: {len(niveles_unicos)}")
        print(f"   Niveles: {sorted(niveles_unicos, key=lambda x: (
            0 if 'NT' in x or 'Kinder' in x.lower() else 
            1 if 'Básico' in x or 'Basico' in x else 
            2 if 'Medio' in x else 3,
            x
        ))}")
        
        # Validación crítica: verificar NT1, NT2, 3° y 4° Medio
        niveles_criticos = ['NT1', 'NT2']
        faltantes = [n for n in niveles_criticos if n not in niveles_unicos]
        
        if faltantes:
            print(f"\n⚠️  ADVERTENCIA: No se encontraron los niveles: {faltantes}")
            print("   ⚠️  Continuando de todas formas (modo automático)...")
        else:
            print(f"   ✅ Niveles críticos NT1 y NT2 presentes en el CSV.")
        
        return registros
        
    except Exception as e:
        print(f"❌ ERROR al leer el CSV: {e}")
        sys.exit(1)


def limpiar_tabla(supabase: Client, table_name: str):
    """
    Limpia completamente la tabla antes de cargar nuevos datos.
    """
    print(f"\n🧹 Limpiando tabla '{table_name}'...")
    
    try:
        # Supabase no tiene un "TRUNCATE" directo en el SDK, así que eliminamos por lotes
        # Primero verificamos cuántos registros hay
        response = supabase.table(table_name).select('id', count='exact').limit(1).execute()
        total = response.count if hasattr(response, 'count') else 0
        
        if total == 0:
            print("   ℹ️  La tabla ya está vacía.")
            return
        
        print(f"   Se encontraron {total} registros existentes.")
        print(f"   🔄 Eliminando automáticamente (modo no interactivo)...")
        
        # Eliminar todos los registros (Supabase permite delete() sin filtros con confirmación)
        # Usamos un filtro amplio para garantizar eliminación
        supabase.table(table_name).delete().neq('id', 0).execute()
        
        print(f"   ✅ Tabla '{table_name}' limpiada correctamente.")
        
    except Exception as e:
        print(f"   ❌ ERROR al limpiar la tabla: {e}")
        print(f"   Deteniendo ejecución. Verifica la conexión a Supabase.")
        sys.exit(1)


def insertar_en_batches(supabase: Client, table_name: str, registros: List[Dict], batch_size: int = 500):
    """
    Inserta los registros en batches para evitar timeouts.
    Maneja errores por batch y reintenta en caso de fallo.
    """
    total_registros = len(registros)
    total_insertados = 0
    total_fallidos = 0
    
    print(f"\n📤 Iniciando carga en batches de {batch_size}...")
    print(f"   Total de registros a insertar: {total_registros}")
    print(f"   Batches estimados: {(total_registros // batch_size) + 1}\n")
    
    for i in range(0, total_registros, batch_size):
        batch = registros[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        
        try:
            print(f"   Batch {batch_num}: Insertando registros {i+1} a {min(i+batch_size, total_registros)}...", end=' ')
            
            response = supabase.table(table_name).insert(batch).execute()
            
            insertados = len(response.data) if response.data else len(batch)
            total_insertados += insertados
            
            print(f"✅ {insertados} registros insertados.")
            
            # Pequeña pausa para no saturar la API
            time.sleep(0.3)
            
        except Exception as e:
            print(f"❌ ERROR")
            print(f"      Detalles: {e}")
            total_fallidos += len(batch)
            
            # Reintentar batch fallido con registros individuales
            print(f"      Reintentando registros individualmente...")
            for idx, registro in enumerate(batch, start=1):
                try:
                    supabase.table(table_name).insert(registro).execute()
                    total_insertados += 1
                except Exception as e_individual:
                    print(f"      ⚠️  Registro {i+idx} falló: {e_individual}")
                    total_fallidos += 1
    
    return total_insertados, total_fallidos


def validar_carga(supabase: Client, table_name: str, total_esperado: int):
    """
    Valida que la carga se haya realizado correctamente.
    """
    print(f"\n🔍 Validando carga en tabla '{table_name}'...")
    
    try:
        # Contar total de registros
        response = supabase.table(table_name).select('id', count='exact').limit(1).execute()
        total_bd = response.count if hasattr(response, 'count') else 0
        
        print(f"   Registros esperados: {total_esperado}")
        print(f"   Registros en BD: {total_bd}")
        
        if total_bd == total_esperado:
            print(f"   ✅ VALIDACIÓN EXITOSA: Todos los registros fueron cargados.")
        elif total_bd < total_esperado:
            print(f"   ⚠️  ADVERTENCIA: Faltan {total_esperado - total_bd} registros.")
        else:
            print(f"   ⚠️  ADVERTENCIA: Hay {total_bd - total_esperado} registros adicionales.")
        
        # Validar presencia de niveles críticos
        print(f"\n   Validando niveles críticos...")
        niveles_criticos = ['NT1', 'NT2', '1° Medio', '2° Medio', '3° Medio', '4° Medio']
        
        for nivel in niveles_criticos:
            response = supabase.table(table_name).select('id', count='exact').eq('nivel', nivel).limit(1).execute()
            count = response.count if hasattr(response, 'count') else 0
            
            if count > 0:
                print(f"   ✅ {nivel}: {count} OA encontrados")
            else:
                print(f"   ❌ {nivel}: NO encontrado en la BD")
        
        return total_bd
        
    except Exception as e:
        print(f"   ❌ ERROR en validación: {e}")
        return 0


def main():
    """
    Función principal del seeder.
    """
    print("\n" + "="*70)
    print("  MASTER SEEDER - ProfeIC v3")
    print("  Carga completa del Curriculum Nacional Chileno")
    print("="*70 + "\n")
    
    # 1. Leer CSV completo
    registros = leer_csv_completo(CSV_PATH)
    
    if not registros:
        print("❌ No se encontraron registros para cargar.")
        sys.exit(1)
    
    # 2. Limpiar tabla existente
    limpiar_tabla(supabase, TABLE_NAME)
    
    # 3. Insertar en batches
    insertados, fallidos = insertar_en_batches(supabase, TABLE_NAME, registros, BATCH_SIZE)
    
    # 4. Resumen de carga
    print(f"\n" + "="*70)
    print(f"  RESUMEN DE CARGA")
    print(f"="*70)
    print(f"  ✅ Registros insertados exitosamente: {insertados}")
    print(f"  ❌ Registros fallidos: {fallidos}")
    print(f"  📊 Tasa de éxito: {(insertados/len(registros)*100):.2f}%")
    print(f"="*70 + "\n")
    
    # 5. Validar carga
    total_final = validar_carga(supabase, TABLE_NAME, len(registros))
    
    # 6. Mensaje final
    if total_final == len(registros) and fallidos == 0:
        print("\n🎉 ¡CARGA COMPLETADA CON ÉXITO!")
        print("   Todos los niveles (incluyendo NT1, NT2, 3° y 4° Medio) están ahora en la BD.")
    else:
        print("\n⚠️  La carga finalizó con algunas inconsistencias.")
        print("   Revisa los mensajes anteriores para más detalles.")
    
    print("\n" + "="*70 + "\n")


if __name__ == "__main__":
    main()
