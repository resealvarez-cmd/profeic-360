"""
simce_blueprint_parser.py
─────────────────────────
Módulo utilitario para calcular la distribución exacta de preguntas de un
instrumento SIMCE a partir del archivo tablas_especificaciones_simce.json.

Uso básico:
    from simce_blueprint_parser import calculate_question_distribution
    result = calculate_question_distribution("tablas_especificaciones_simce.json",
                                             "Lenguaje y Comunicación - Lectura",
                                             "8° Básico", 35)
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

# ─── Data-classes de resultado ────────────────────────────────────────────────


@dataclass
class AxisDistribution:
    """Representa la distribución de preguntas para un eje/habilidad/dominio."""

    nombre: str
    descripcion: str
    porcentaje: int          # porcentaje original (0-100)
    preguntas: int           # número exacto de ítems asignados


@dataclass
class ThematicDistribution:
    """Distribución temática (ejes de contenido), presente en Matemática y Ciencias."""

    eje: str
    descripcion: str
    porcentaje: int
    preguntas: int


@dataclass
class BlueprintResult:
    """Resultado completo del cálculo del blueprint."""

    asignatura: str
    nivel: str
    total_preguntas: int
    tipo_eje: Literal["habilidades", "dominios_cognitivos"]   # discriminador de columna

    # Distribución principal (habilidades o dominios cognitivos)
    distribucion_principal: list[AxisDistribution] = field(default_factory=list)

    # Distribución temática (solo si existe en el JSON)
    distribucion_tematica: list[ThematicDistribution] = field(default_factory=list)

    notas: str = ""

    def __str__(self) -> str:
        lines: list[str] = [
            "=" * 60,
            f"  BLUEPRINT SIMCE — {self.asignatura} — {self.nivel}",
            f"  Total de preguntas: {self.total_preguntas}",
            "=" * 60,
            "",
            f"  [{self.tipo_eje.upper()}]",
        ]
        for ax in self.distribucion_principal:
            lines.append(
                f"    • {ax.nombre:<38} {ax.porcentaje:>3}%  →  {ax.preguntas:>2} preguntas"
            )
        lines.append(f"  {'Suma':.<44} {sum(a.preguntas for a in self.distribucion_principal):>2} preguntas")

        if self.distribucion_tematica:
            lines += ["", "  [EJES TEMÁTICOS]"]
            for te in self.distribucion_tematica:
                lines.append(
                    f"    • {te.eje:<38} {te.porcentaje:>3}%  →  {te.preguntas:>2} preguntas"
                )
            lines.append(
                f"  {'Suma':.<44} {sum(t.preguntas for t in self.distribucion_tematica):>2} preguntas"
            )

        if self.notas:
            lines += ["", f"  Notas: {self.notas}"]

        lines.append("=" * 60)
        return "\n".join(lines)


# ─── Función principal ────────────────────────────────────────────────────────


def _distribute_questions(items_pct: list[dict], total: int) -> list[int]:
    """
    Recibe una lista de dicts con clave 'porcentaje' y el total de preguntas.
    Devuelve una lista de enteros con la distribución exacta usando el método
    del mayor residuo (Largest Remainder), garantizando que la suma == total.

    Este método es más preciso que redondear individualmente y luego ajustar
    el mayor porcentaje, porque respeta al máximo la proporcionalidad.
    """
    exact: list[float] = [item["porcentaje"] / 100 * total for item in items_pct]
    floors: list[int] = [int(v) for v in exact]
    remainders: list[float] = [e - f for e, f in zip(exact, floors)]

    deficit: int = total - sum(floors)

    # Ordenar por residuo descendente para repartir los ítems sobrantes
    ranked: list[int] = sorted(range(len(remainders)), key=lambda i: remainders[i], reverse=True)
    for i in range(deficit):
        floors[ranked[i]] += 1

    return floors


def calculate_question_distribution(
    json_path: str | Path,
    asignatura: str,
    nivel: str,
    total_preguntas: int,
) -> BlueprintResult:
    """
    Calcula la distribución exacta de ítems por habilidad/dominio para un
    instrumento SIMCE.

    Parámetros
    ----------
    json_path : str | Path
        Ruta al archivo tablas_especificaciones_simce.json.
    asignatura : str
        Nombre de la asignatura tal cual aparece en el JSON.
        Ej: "Lenguaje y Comunicación - Lectura", "Matemática".
    nivel : str
        Nivel educativo, ej: "4° Básico", "8° Básico", "II Medio".
    total_preguntas : int
        Número total de ítems del instrumento (entre 20 y 45 para SIMCE).

    Retorna
    -------
    BlueprintResult
        Objeto con la distribución completa lista para enviar al generador IA.

    Excepciones
    -----------
    FileNotFoundError
        Si el archivo JSON no existe.
    ValueError
        Si la asignatura o el nivel no se encuentran en el JSON.
    """
    path = Path(json_path)
    if not path.exists():
        raise FileNotFoundError(f"No se encontró el archivo: {path}")

    with path.open(encoding="utf-8") as fh:
        data: list[dict] = json.load(fh)

    # ── 1. Buscar asignatura ────────────────────────────────────────────────
    asignatura_entry: dict | None = None
    for entry in data:
        if entry["asignatura"].strip().lower() == asignatura.strip().lower():
            asignatura_entry = entry
            break

    if asignatura_entry is None:
        available = [e["asignatura"] for e in data]
        raise ValueError(
            f"Asignatura '{asignatura}' no encontrada.\n"
            f"Disponibles: {available}"
        )

    # ── 2. Buscar nivel ─────────────────────────────────────────────────────
    nivel_entry: dict | None = None
    for nv in asignatura_entry["niveles"]:
        if nv["nivel"].strip().lower() == nivel.strip().lower():
            nivel_entry = nv
            break

    if nivel_entry is None:
        available_niveles = [nv["nivel"] for nv in asignatura_entry["niveles"]]
        raise ValueError(
            f"Nivel '{nivel}' no encontrado en '{asignatura}'.\n"
            f"Disponibles: {available_niveles}"
        )

    # ── 3. Determinar tipo de eje principal ─────────────────────────────────
    has_habilidades = "ejes_habilidades" in nivel_entry
    has_dominios = "dominios_cognitivos" in nivel_entry

    if has_habilidades:
        raw_principal = nivel_entry["ejes_habilidades"]
        tipo_eje: Literal["habilidades", "dominios_cognitivos"] = "habilidades"
    elif has_dominios:
        raw_principal = nivel_entry["dominios_cognitivos"]
        tipo_eje = "dominios_cognitivos"
    else:
        raise ValueError(
            f"El nivel '{nivel}' de '{asignatura}' no tiene "
            f"'ejes_habilidades' ni 'dominios_cognitivos'."
        )

    # ── 4. Calcular distribución principal (Largest Remainder) ──────────────
    preguntas_principal = _distribute_questions(raw_principal, total_preguntas)

    distribucion_principal: list[AxisDistribution] = []
    for item, qty in zip(raw_principal, preguntas_principal):
        # Compatibilidad con ambas claves (habilidad / dominio)
        nombre = item.get("habilidad") or item.get("dominio") or "—"
        distribucion_principal.append(
            AxisDistribution(
                nombre=nombre,
                descripcion=item.get("descripcion", ""),
                porcentaje=item["porcentaje"],
                preguntas=qty,
            )
        )

    # ── 5. Calcular distribución temática (si existe) ───────────────────────
    distribucion_tematica: list[ThematicDistribution] = []
    raw_tematicos: list[dict] = nivel_entry.get("ejes_tematicos", [])

    if raw_tematicos:
        preguntas_tematicos = _distribute_questions(raw_tematicos, total_preguntas)
        for item, qty in zip(raw_tematicos, preguntas_tematicos):
            distribucion_tematica.append(
                ThematicDistribution(
                    eje=item.get("eje", "—"),
                    descripcion=item.get("descripcion", ""),
                    porcentaje=item["porcentaje"],
                    preguntas=qty,
                )
            )

    return BlueprintResult(
        asignatura=asignatura_entry["asignatura"],
        nivel=nivel_entry["nivel"],
        total_preguntas=total_preguntas,
        tipo_eje=tipo_eje,
        distribucion_principal=distribucion_principal,
        distribucion_tematica=distribucion_tematica,
        notas=nivel_entry.get("notas", ""),
    )


# ─── Prueba de escritorio ─────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    # Ruta al JSON asumiendo que el script vive en backend/ y el JSON en la raíz del proyecto
    json_file = Path(__file__).parent.parent / "tablas_especificaciones_simce.json"

    # ── Test 1: Lenguaje 8° Básico 35 preguntas ──────────────────────────────
    print("\n[Test 1] Lenguaje y Comunicación - Lectura | 8° Básico | 35 preguntas")
    result1 = calculate_question_distribution(
        json_path=json_file,
        asignatura="Lenguaje y Comunicación - Lectura",
        nivel="8° Básico",
        total_preguntas=35,
    )
    print(result1)

    # ── Test 2: Matemática 4° Básico 40 preguntas (verifica ajuste de redondeo) ──
    print("\n[Test 2] Matemática | 4° Básico | 40 preguntas")
    result2 = calculate_question_distribution(
        json_path=json_file,
        asignatura="Matemática",
        nivel="4° Básico",
        total_preguntas=40,
    )
    print(result2)

    # ── Test 3: Historia 8° Básico 45 preguntas (verifica ejes temáticos) ────
    print("\n[Test 3] Historia, Geografía y Ciencias Sociales | 8° Básico | 45 preguntas")
    result3 = calculate_question_distribution(
        json_path=json_file,
        asignatura="Historia, Geografía y Ciencias Sociales",
        nivel="8° Básico",
        total_preguntas=45,
    )
    print(result3)

    # ── Verificación de suma exacta ───────────────────────────────────────────
    print("\n[Verificaciones de suma exacta]")
    for r in [result1, result2, result3]:
        suma_p = sum(a.preguntas for a in r.distribucion_principal)
        ok_p = "✓" if suma_p == r.total_preguntas else f"✗ ({suma_p})"
        print(f"  {r.asignatura} — {r.nivel}: suma principal = {suma_p}/{r.total_preguntas} {ok_p}")
        if r.distribucion_tematica:
            suma_t = sum(t.preguntas for t in r.distribucion_tematica)
            ok_t = "✓" if suma_t == r.total_preguntas else f"✗ ({suma_t})"
            print(f"    temáticos: suma = {suma_t}/{r.total_preguntas} {ok_t}")

    sys.exit(0)
