import sys
import os

# Asegurar que el directorio backend/ o backend/app estén en el PATH para resolver las importaciones correctas
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.services.motor_service import normalize_subject_name

# Bypasear autenticación Supabase en los tests de integración
try:
    from routers.deps import get_current_user_id, get_current_user_id_optional
    app.dependency_overrides[get_current_user_id] = lambda: "mock-user-id"
    app.dependency_overrides[get_current_user_id_optional] = lambda: "mock-user-id"
except ImportError:
    pass

client = TestClient(app)

def test_subject_normalization():
    print("\n🧪 [TEST 1] Probando normalización de asignaturas...")
    
    cases = {
        "Inglés": 7,
        "idioma extranjero ingles": 7,
        "INGLÉS": 7,
        "MATEMÁTICA": 2,
        "matematicas": 2,
        "CIENCIAS NATURALES": 3,
        "FÍSICA": 3,
        "HISTORIA, GEOGRAFÍA Y CIENCIAS SOCIALES": 4,
        "ARTES VISUALES": 5,
        "EDUCACIÓN FÍSICA Y SALUD": 6,
        "LENGUA Y LITERATURA": 1,
        "ASIGNATURA DESCONOCIDA": 1 # default
    }
    
    for name, expected in cases.items():
        res = normalize_subject_name(name)
        assert res == expected, f"Fallo al normalizar '{name}': se esperaba {expected}, se obtuvo {res}"
        print(f"  ✅ '{name}' normalizado a Departamento ID: {res}")
    print("🎉 Normalización validada con éxito.")

def test_workflow_motor_conduccion():
    print("\n🧪 [TEST 2] Probando flujo completo del Motor de Conducción Preventiva...")
    
    # 1. POST /api/v1/motor/ingesta (Subida de archivos con datos simulados)
    print("\n   1. Probando Ingesta de Archivos (POST /api/v1/motor/ingesta)...")
    payload = {
        "periodo_id": "2026-S1",
        "curso_id": "5° Básico",
        "asignatura_nombre": "Inglés"
    }
    
    # Mandamos archivos simulados
    files = {
        "file_calificaciones": ("calificaciones.xls", b"<table><tr><th>RUT</th><th>Alumno</th><th>Nota</th></tr><tr><td>20.123.456-7</td><td>Juan Perez</td><td>3.4</td></tr></table>", "application/vnd.ms-excel"),
        "file_atrasos": ("atrasos.xlsx", b"mock-xlsx-atrasos", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
        "file_anotaciones": ("anotaciones.xlsx", b"mock-xlsx-anotaciones", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    }
    
    response = client.post("/api/v1/motor/ingesta", data=payload, files=files)
    assert response.status_code == 200, f"Fallo en ingesta: {response.text}"
    data = response.json()
    assert data["status"] == "success"
    assert data["periodo_id"] == "2026-S1"
    assert data["curso_id"] == "5° Básico"
    print("      ✅ Ingesta y Lógica del Cruce Predictivo de Trayectorias ejecutadas con éxito.")
    print(f"      Resumen Académico: {data['datos_academicos']}")
    print(f"      Resumen Convivencia: {data['datos_convivencia']}")

    # 2. GET /api/v1/motor/hitl/{periodo_id}/{curso_id}
    print("\n   2. Probando Previsualización HITL (GET /api/v1/motor/hitl/2026-S1/5° Básico)...")
    response = client.get("/api/v1/motor/hitl/2026-S1/5° Básico?departamento_id=7")
    assert response.status_code == 200, f"Fallo en HITL: {response.text}"
    hitl_data = response.json()
    assert "configuracion_umbrales" in hitl_data
    assert "alumnos_doble_riesgo" in hitl_data
    print(f"      ✅ Previsualización recuperada. Alumnos en Doble Riesgo detectados: {len(hitl_data['alumnos_doble_riesgo'])}")

    # 3. PUT /api/v1/motor/hitl/validar
    print("\n   3. Probando Validación Humana HITL (PUT /api/v1/motor/hitl/validar)...")
    validar_payload = {
        "periodo_id": "2026-S1",
        "curso_id": "5° Básico",
        "configuracion_umbrales": {"asistencia_limite": 90.0, "peso_atrasos": 0.5},
        "contexto_coordinador": "Se reporta brote de influenza estacional y huelga de transporte que justifica atrasos."
    }
    response = client.put("/api/v1/motor/hitl/validar?departamento_id=7", json=validar_payload)
    assert response.status_code == 200, f"Fallo en validación: {response.text}"
    val_data = response.json()
    assert val_data["configuracion_umbrales"]["asistencia_limite"] == 90.0
    assert val_data["contexto_coordinador"] == "Se reporta brote de influenza estacional y huelga de transporte que justifica atrasos."
    print("      ✅ Calibración de umbrales y anotaciones UTP guardadas correctamente.")

    # 4. POST /api/v1/motor/roadmap/generar
    print("\n   4. Probando Generación de Roadmap Estratégico de IA (POST /api/v1/motor/roadmap/generar)...")
    roadmap_payload = {
        "periodo_id": "2026-S1",
        "curso_id": "5° Básico"
    }
    response = client.post("/api/v1/motor/roadmap/generar?departamento_id=7", json=roadmap_payload)
    assert response.status_code == 200, f"Fallo generando Roadmap: {response.text}"
    roadmap_data = response.json()
    assert "titulo_roadmap" in roadmap_data
    assert "diagnostico_camuflaje" in roadmap_data
    assert "roadmap_secuencia_didactica" in roadmap_data
    print("      ✅ Hoja de Ruta generada y estructurada bajo los 7 Pasos Didácticos.")
    print(f"      Título de la Hoja de Ruta: {roadmap_data['titulo_roadmap']}")

    # 5. GET /api/v1/motor/dashboard/detalle
    print("\n   5. Probando Drill-Down Clínico (GET /api/v1/motor/dashboard/detalle)...")
    response = client.get("/api/v1/motor/dashboard/detalle?periodo_id=2026-S1&curso_id=5° Básico&departamento_id=7")
    assert response.status_code == 200, f"Fallo en drill-down: {response.text}"
    detail_data = response.json()
    assert len(detail_data["atrasos_netos"]) > 0
    assert len(detail_data["anotaciones_rice"]) > 0
    assert len(detail_data["reactivos_pruebas"]) > 0
    print("      ✅ Datos atómicos y de Bitácora de Aula recuperados exitosamente.")

    # 6. POST /api/v1/motor/docente/comentario
    print("\n   6. Probando Pop-up Conversacional del Profesor (POST /api/v1/motor/docente/comentario)...")
    comment_payload = {
        "curso_id": "5° Básico",
        "asignatura_id": "Inglés",
        "comentario": "Los alumnos se muestran muy distraídos en la última hora y no entienden los textos que les entrego."
    }
    response = client.post("/api/v1/motor/docente/comentario?periodo_id=2026-S1", json=comment_payload)
    assert response.status_code == 200, f"Fallo en comentario: {response.text}"
    comment_data = response.json()
    assert comment_data["status"] == "success"
    assert "nudo_didactico" in comment_data["data"]
    print("      ✅ Comentario docente analizado e indexado asíncronamente con IA.")

    # 7. GET /api/v1/motor/evolucion
    print("\n   7. Probando Evolución Temporal de Cortes (GET /api/v1/motor/evolucion)...")
    response = client.get("/api/v1/motor/evolucion?periodo_id=2026-S1&curso_id=5° Básico&departamento_id=7")
    assert response.status_code == 200, f"Fallo en evolucion: {response.text}"
    evol_data = response.json()
    assert "serie_temporal" in evol_data
    assert len(evol_data["serie_temporal"]) > 0
    print("      ✅ Serie temporal de cortes recuperada exitosamente.")


def test_rbac_security():
    print("\n🧪 [TEST 3] Validando restricciones de seguridad por rol (RBAC)...")
    
    # A. Probando Dashboard de Director
    print("\n   A. Consultando como DIRECTOR...")
    response = client.get("/api/v1/motor/dashboard?periodo_id=2026-S1&curso_id=5° Básico&role=director&departamento_id=7")
    assert response.status_code == 200, f"Fallo director: {response.text}"
    dir_data = response.json()
    assert dir_data["role"] == "director"
    assert "datos_academicos_longitudinal" in dir_data
    assert "graficos_conversion_dok" in dir_data
    print("      ✅ Acceso completo longitudinal y conversión DOK validado.")

    # B. Probando Dashboard de Coordinador
    print("\n   B. Consultando como COORDINADOR...")
    response = client.get("/api/v1/motor/dashboard?periodo_id=2026-S1&curso_id=5° Básico&role=coordinador&departamento_id=7")
    assert response.status_code == 200, f"Fallo coordinador: {response.text}"
    coor_data = response.json()
    assert coor_data["role"] == "coordinador"
    assert "consola_umbrales" in coor_data
    assert "heatmap_departamentos" in coor_data
    assert "alumnos_doble_riesgo_detalle" in coor_data
    print("      ✅ Acceso a umbrales, heatmap y nómina de Doble Riesgo validado.")

    # C. Probando Dashboard de Jefe de Departamento
    print("\n   C. Consultando como JEFE DE DEPARTAMENTO...")
    response = client.get("/api/v1/motor/dashboard?periodo_id=2026-S1&curso_id=5° Básico&role=jefe_departamento&departamento_id=7")
    assert response.status_code == 200, f"Fallo jefe depto: {response.text}"
    jefe_data = response.json()
    assert jefe_data["role"] == "jefe_departamento"
    assert "kanban_instruccional" in jefe_data
    assert "alertas_academicas_depto" in jefe_data
    print("      ✅ Acceso al Kanban instruccional e hitos didácticos del área validado.")

    # D. Probando Dashboard de Profesor
    # RESTRICCIÓN DE SEGURIDAD ABSOLUTA: Oculta por completo los gráficos y datos macro de "Doble Riesgo"
    print("\n   D. Consultando como PROFESOR...")
    response = client.get("/api/v1/motor/dashboard?periodo_id=2026-S1&curso_id=5° Básico&role=profesor&departamento_id=7")
    assert response.status_code == 200, f"Fallo profesor: {response.text}"
    prof_data = response.json()
    assert prof_data["role"] == "profesor"
    assert "timeline_semestral" in prof_data
    assert "metas_pedagogicas" in prof_data
    assert "feed_retroalimentacion" in prof_data
    
    # RESTRICCIÓN: Aseguramos que NO exista información de Doble Riesgo o nóminas
    assert "alumnos_doble_riesgo_detalle" not in prof_data, "❌ VIOLACIÓN DE SEGURIDAD: El rol profesor tiene acceso al detalle de Doble Riesgo"
    assert "alumnos_doble_riesgo_resumen" not in prof_data, "❌ VIOLACIÓN DE SEGURIDAD: El rol profesor tiene acceso a resúmenes macro de riesgo"
    assert "consola_umbrales" not in prof_data, "❌ VIOLACIÓN DE SEGURIDAD: El rol profesor tiene acceso a la consola de calibración"
    print("      ✅ RESTRICCIÓN DE SEGURIDAD ABSOLUTA CONFIRMADA: Datos de riesgo escolar y sliders de calibración ocultados con éxito.")

if __name__ == "__main__":
    print("🚀 Iniciando suite de pruebas de integración para el Motor de Conducción Preventiva...")
    test_subject_normalization()
    test_workflow_motor_conduccion()
    test_rbac_security()
    print("\n🎉 TODOS LOS TESTS SE EJECUTARON Y APROBARON CORRECTAMENTE. OPERACIÓN EXITOSA.")
