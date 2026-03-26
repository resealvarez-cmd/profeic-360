import os
import glob
from pathlib import Path

def generate_bible():
    PROJECT_ROOT = Path(__file__).resolve().parent
    output_file = PROJECT_ROOT / "PROFEIC_LA_BIBLIA_EXTENDIDA.md"
    project_root = PROJECT_ROOT
    
    with open(output_file, "w", encoding="utf-8") as out:
        out.write("# 📘 PROFEIC: LA BIBLIA DEL ECOSISTEMA (VERSIÓN EXTENDIDA)\n")
        out.write("## Documento Maestro Técnico, Arquitectónico y Comercial (B2B SaaS)\n\n")
        out.write("Este documento ha sido generado mediante una inspección profunda y automatizada del código fuente, esquemas de base de datos y documentos fundacionales. Es la única fuente de la verdad para el ecosistema ProfeIC.\n\n")
        
        out.write("---\n\n")
        
        # 1. Documentos Existentes
        out.write("# 1. GÉNESIS Y FILOSOFÍA (DOCUMENTOS FUNDACIONALES)\n\n")
        docs = ["PLAN_MAESTRO_PROFEIC.md", "PROFEIC_INFORME_TECNICO_COMPLETO.md", "PROFEIC_LA_BIBLIA.md"]
        for doc in docs:
            path = os.path.join(project_root, doc)
            if os.path.exists(path):
                out.write(f"## {doc}\n")
                with open(path, "r", encoding="utf-8") as f:
                    out.write(f.read())
                out.write("\n\n")
                
        # 2. Infraestructura de Base de Datos
        out.write("# 2. INFRAESTRUCTURA Y ESQUEMA DE BASE DE DATOS (SUPABASE)\n\n")
        out.write("El siguiente es el esquema completo que da vida al sistema Multi-Tenant y garantiza la seguridad de la información mediante RLS (Row Level Security):\n\n")
        migrations = glob.glob(os.path.join(project_root, "supabase/migrations/*.sql"))
        for sql_file in sorted(migrations):
            out.write(f"### Archivo: `{os.path.basename(sql_file)}`\n")
            out.write("```sql\n")
            with open(sql_file, "r", encoding="utf-8") as f:
                content = f.read()
                # To prevent the file from getting too insanely large, we just put everything. 
                out.write(content)
            out.write("\n```\n\n")

        # 3. Backend Routers
        out.write("# 3. ARQUITECTURA DEL MOTOR DE INTELIGENCIA ARTIFICIAL (BACKEND FASTAPI)\n\n")
        out.write("Los siguientes módulos contienen la lógica de inyección de prompts, validación de contextos educativos (DUA, DOK) y procesamiento de documentos.\n\n")
        backend_files = glob.glob(os.path.join(project_root, "backend/routers/*.py"))
        for py_file in sorted(backend_files):
            out.write(f"### Router: `{os.path.basename(py_file)}`\n")
            out.write("```python\n")
            with open(py_file, "r", encoding="utf-8") as f:
                content = f.read()
                out.write(content)
            out.write("\n```\n\n")

        # 4. Frontend Estructura Principal
        out.write("# 4. COMPONENTES CLAVE DE INTERFAZ DE USUARIO E INTERACCIÓN\n\n")
        frontend_components = [
            "frontend/src/app/page.tsx",
            "frontend/src/app/institucional/page.tsx",
            "frontend/src/app/(saas)/superadmin/page.tsx",
            "frontend/src/components/ui/HeroSection.tsx"
        ]
        for ts_file in frontend_components:
            path = os.path.join(project_root, ts_file)
            if os.path.exists(path):
                out.write(f"### Componente: `{ts_file}`\n")
                out.write("```tsx\n")
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    out.write(content)
                out.write("\n```\n\n")
                
        out.write("\n\n---\n*Fin del Reporte Maestro Extendido.*")

generate_bible()
