import os
import random
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Clear existing test data
supabase.table("motor_conduccion_preventiva").delete().neq("id", 0).execute()

# Generate realistic data for 4 courses across 4 temporal cuts
cursos = ["1° Medio", "2° Medio", "3° Medio", "4° Medio"]
cortes = ["Abril - Sem 1", "Abril - Sem 2", "Mayo - Sem 1", "Mayo - Sem 2"]

for idx_c, corte in enumerate(cortes):
    for curso in cursos:
        # Base stats that improve over time
        base_promedio = 4.2 + (idx_c * 0.3) + random.uniform(-0.2, 0.4)
        base_promedio = round(min(7.0, base_promedio), 1)
        
        aprobacion = 60.0 + (idx_c * 8.0) + random.uniform(-5.0, 5.0)
        aprobacion = round(min(100.0, aprobacion), 1)
        
        atrasos = max(0, 300 - (idx_c * 60) + random.randint(-40, 40))
        riesgo = max(0, 15 - (idx_c * 3) + random.randint(-2, 2))
        
        # Insert
        record = {
            "periodo_id": "2026-S1",
            "curso_id": curso,
            "asignatura": "Todos",
            "corte_temporal": corte,
            "datos_academicos": {
                "promedio_general": base_promedio,
                "porcentaje_aprobacion": aprobacion,
                "frecuencias": {
                    "reprobados": max(0, 40 - int(aprobacion * 0.4)),
                    "4_0_4_9": 10,
                    "5_0_5_9": 15,
                    "6_0_7_0": int(aprobacion * 0.2)
                },
                "brecha_sinceramiento": 5.0,
                "indice_camuflaje_promedio": 0.3
            },
            "datos_convivencia": {
                "alumnos_doble_riesgo": [f"rut_{i}" for i in range(riesgo)],
                "alumnos_doble_riesgo_detalle": [{"rut": f"rut_{i}", "atraso_minutos": 120} for i in range(riesgo)],
                "minutos_atraso_acumulados": atrasos,
                "heatmap_anotaciones_RICE": {"Leve": atrasos // 10, "Grave": riesgo, "Gravísima": max(0, riesgo - 5)},
                "metricas_idps": {"autoestima_academica": 70, "clima_convivencia": 60, "participacion_ciudadana": 80, "habitos_vida_saludable": 75}
            }
        }
        supabase.table("motor_conduccion_preventiva").insert(record).execute()

print("Motor seed completed!")
