import json
import os
from pathlib import Path
from typing import Dict

def calcular_distribucion(asignatura: str, nivel: str, total_preguntas: int) -> Dict[str, int]:
    """
    Calcula la distribución exacta de preguntas por habilidad usando el método
    del 'Mayor Residuo' (Largest Remainder Method).
    
    Busca en tablas_especificaciones_simce.json la asignatura y nivel indicados.
    """
    # 1. Cargar el JSON
    json_path = Path(__file__).resolve().parent / "assets" / "tablas_especificaciones_simce.json"
    
    if not json_path.exists():
        # Intento 2: si está en la raíz del backend (legacy)
        json_path = Path(__file__).resolve().parent / "tablas_especificaciones_simce.json"

    if not json_path.exists():
        raise FileNotFoundError(f"No se encontró el archivo de tablas en: {json_path}")
        
    def canonical(s: str) -> str:
        if not s: return ""
        s = s.lower().strip()
        s = s.replace("°", "").replace("º", "").replace(".", "").replace(" ", "").replace("-", "")
        s = s.replace("iv", "4").replace("iii", "3").replace("ii", "2").replace("i", "1")
        return s

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # 2. Buscar asignatura y nivel con normalización canónica
    norm_asig = canonical(asignatura)
    norm_nivel = canonical(nivel)

    asignatura_data = next((a for a in data if canonical(a["asignatura"]) == norm_asig), None)
    if not asignatura_data:
        # Intento de búsqueda parcial (ej. "Lengua" in "Lenguaje")
        asignatura_data = next((a for a in data if norm_asig in canonical(a["asignatura"]) or canonical(a["asignatura"]) in norm_asig), None)
        
    if not asignatura_data:
        raise ValueError(f"Asignatura '{asignatura}' no encontrada en el JSON de especificaciones.")
        
    nivel_data = next((n for n in asignatura_data["niveles"] if canonical(n["nivel"]) == norm_nivel), None)
    if not nivel_data:
        raise ValueError(f"Nivel '{nivel}' no encontrado para la asignatura '{asignatura}'.")
        
    # Extraer habilidades (pueden venir como ejes_habilidades o dominios_cognitivos)
    habilidades_raw = nivel_data.get("ejes_habilidades") or nivel_data.get("dominios_cognitivos")
    if not habilidades_raw:
        raise ValueError(f"No se encontraron habilidades o dominios para {asignatura} - {nivel}.")
        
    # 3. Método del Mayor Residuo (Largest Remainder Method)
    # exact_counts = [ (porcentaje / 100) * total_preguntas ]
    # floor_counts = parte entera
    # remainders = parte decimal
    
    exact_counts = []
    for h in habilidades_raw:
        nombre = h.get("habilidad") or h.get("dominio")
        pct = h["porcentaje"]
        exact = (pct / 100) * total_preguntas
        exact_counts.append({
            "nombre": nombre,
            "exact": exact,
            "floor": int(exact),
            "remainder": exact - int(exact)
        })
        
    # Sumar las partes enteras
    suma_actual = sum(item["floor"] for item in exact_counts)
    faltantes = total_preguntas - suma_actual
    
    # Ordenar por el residuo (mayor a menor) para repartir los faltantes
    exact_counts.sort(key=lambda x: x["remainder"], reverse=True)
    
    # Repartir 1 unidad a los que tengan mayor residuo hasta completar el total
    for i in range(faltantes):
        exact_counts[i]["floor"] += 1
        
    # 4. Construir el diccionario final
    # Lo devolvemos en el orden original si es posible, o simplemente el dict solicitado
    resultado = {item["nombre"]: item["floor"] for item in exact_counts}
    
    return resultado

if __name__ == "__main__":
    # Prueba rápida
    try:
        dist = calcular_distribucion("Matemática", "4° Básico", 35)
        print(f"Distribución calculada: {dist}")
        print(f"Total: {sum(dist.values())}")
    except Exception as e:
        print(f"Error: {e}")
