import matplotlib.pyplot as plt
import os
from typing import Dict, List, Any

def generar_grafico(datos_grafico: Dict[str, Any], nombre_archivo: str = "temp_grafico.png") -> str:
    """
    Genera un gráfico (barras, líneas o torta) basado en el diccionario de datos.
    Estilo minimalista y académico en escala de grises para impresión SIMCE.
    """
    tipo = datos_grafico.get("tipo", "barras")
    titulo = datos_grafico.get("titulo", "")
    etiquetas = datos_grafico.get("etiquetas", [])
    valores = datos_grafico.get("valores", [])
    etiqueta_x = datos_grafico.get("etiqueta_x", "")
    etiqueta_y = datos_grafico.get("etiqueta_y", "")

    # Configuración de estilo minimalista/académico
    plt.rcParams.update({
        'font.family': 'sans-serif',
        'font.size': 10,
        'axes.edgecolor': '#333333',
        'axes.linewidth': 0.8,
        'xtick.color': '#333333',
        'ytick.color': '#333333',
    })

    fig, ax = plt.subplots(figsize=(6, 4))

    # Paleta de grises de alto contraste para impresión
    colores_gris = ['#333333', '#666666', '#999999', '#cccccc']

    if tipo == "barras":
        ax.bar(etiquetas, valores, color='#4d4d4d', edgecolor='black', linewidth=0.7)
        ax.set_xlabel(etiqueta_x)
        ax.set_ylabel(etiqueta_y)
    elif tipo == "lineas":
        ax.plot(etiquetas, valores, marker='o', color='black', linewidth=1.5, markersize=6)
        ax.set_xlabel(etiqueta_x)
        ax.set_ylabel(etiqueta_y)
        ax.grid(True, linestyle='--', alpha=0.5)
    elif tipo == "torta":
        ax.pie(valores, labels=etiquetas, autopct='%1.1f%%', 
               colors=colores_gris, startangle=140, 
               wedgeprops={'edgecolor': 'black', 'linewidth': 0.7})
    
    ax.set_title(titulo, pad=15, fontweight='bold')

    # Ajustes finales de estética
    if tipo != "torta":
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        plt.tight_layout()

    # Guardar y limpiar
    try:
        ruta_salida = os.path.abspath(nombre_archivo)
        plt.savefig(ruta_salida, bbox_inches='tight', dpi=150)
        return ruta_salida
    finally:
        plt.close(fig)

if __name__ == "__main__":
    # Prueba del servicio
    test_data = {
        "tipo": "barras",
        "titulo": "Crecimiento de la Planta",
        "etiquetas": ["Día 1", "Día 2", "Día 3"],
        "valores": [5, 10, 15],
        "etiqueta_x": "Días",
        "etiqueta_y": "Altura (cm)"
    }
    
    try:
        resultado = generar_grafico(test_data, "test_grafico_barras.png")
        print(f"Gráfico de barras generado en: {resultado}")
        
        test_data_torta = {
            "tipo": "torta",
            "titulo": "Distribución de Gastos",
            "etiquetas": ["Luz", "Agua", "Gas"],
            "valores": [40, 30, 30]
        }
        resultado_torta = generar_grafico(test_data_torta, "test_grafico_torta.png")
        print(f"Gráfico de torta generado en: {resultado_torta}")
        
    except Exception as e:
        print(f"Error en la prueba: {e}")
