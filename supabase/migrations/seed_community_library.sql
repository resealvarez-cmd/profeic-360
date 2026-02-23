-- SEED DATA: Biblioteca & Comunidad (Demo)

DO $$
DECLARE
    teacher_id UUID;
BEGIN
    -- 1. Intentar obtener un usuario existente (Rene o cualquiera)
    SELECT id INTO teacher_id FROM auth.users WHERE email LIKE '%rene%' LIMIT 1;
    
    IF teacher_id IS NULL THEN
        SELECT id INTO teacher_id FROM auth.users LIMIT 1;
    END IF;

    -- Si no hay usuarios, no hacemos nada (evita errores en fresh DB vacía)
    IF teacher_id IS NOT NULL THEN

        -- A. Rubrica: Debate Histórico (PÚBLICO)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Rúbrica de Debate: La Guerra Fría',
            'RUBRICA',
            'Historia',
            'II Medio',
            true, -- Public for Community
            'Profe Historia',
            '{
                "puntaje_total": 24,
                "tabla": [
                    { "criterio": "Argumentación Sólida", "porcentaje": 40 },
                    { "criterio": "Uso de Evidencia", "porcentaje": 30 },
                    { "criterio": "Contraargumentación", "porcentaje": 20 },
                    { "criterio": "Respeto y Turnos", "porcentaje": 10 }
                ],
                "url_archivo": "https://www.curriculumnacional.cl/614/articles-145434_recurso_pdf.pdf"
            }'::jsonb,
            now() - interval '2 days'
        );

        -- B. Planificación: Unidad de Álgebra (PÚBLICO)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Unidad 2: Ecuaciones Cuadráticas',
            'PLANIFICACION',
            'Matemática',
            'III Medio',
            true,
            'Depto. Matemática',
            '{
                "estrategia": "Aprendizaje Basado en Problemas (ABP)",
                "clases": [
                    { "numero_clase": 1, "foco_pedagogico": "Identificar coeficientes a, b y c en formas generales.", "ticket_salida": "Resolver x^2 - 4 = 0" },
                    { "numero_clase": 2, "foco_pedagogico": "Aplicar fórmula general discriminante.", "ticket_salida": "¿Cuántas soluciones tiene si D < 0?" },
                    { "numero_clase": 3, "foco_pedagogico": "Modelar problemas de área con ecuaciones cuadráticas.", "ticket_salida": "Plantear ecuación del problema del granjero." }
                ]
            }'::jsonb,
            now() - interval '5 days'
        );

        -- C. Evaluación: Quiz de Literatura (PRIVADO -> Biblioteca)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Control de Lectura: Cien Años de Soledad',
            'EVALUACION',
            'Lenguaje',
            'IV Medio',
            false,
            'Profesor Jefe',
            '{
                "description": "Evaluación sumativa de comprensión lectora y análisis de personajes.",
                "items": [
                    { "type": "Selección Múltiple", "points": 2, "stem": "¿Qué evento marca el inicio y fin de la novela?" },
                    { "type": "Desarrollo", "points": 5, "stem": "Explique la metáfora de los pescaditos de oro." },
                    { "type": "Verdadero/Falso", "points": 1, "stem": "Úrsula Iguarán vive más de 100 años." }
                ]
            }'::jsonb,
            now()
        );

        -- D. Estrategia: Rutina de Pensamiento (PÚBLICO)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Rutina: Antes pensaba / Ahora pienso',
            'ESTRATEGIA',
            'Orientación',
            'General',
            true,
            'Equipo Convivencia',
            '{
                "estrategia": "Metacognición Visible",
                "clases": [
                    { "numero_clase": 1, "foco_pedagogico": "Reflexionar sobre el cambio de percepción tras el debate.", "ticket_salida": "Completar hoja de rutina." }
                ]
            }'::jsonb,
            now() - interval '1 hour'
        );
        
        -- E. NEE: Adecuación PIE (PRIVADO)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Adecuación: Evaluación Biología Celular',
            'ESTRATEGIA',
            'Biología',
            'I Medio',
            false,
            'Coordinadora PIE',
            '{
                "diagnosis": "Estudiante con TDAH y dificultad de procesamiento visual.",
                "barrier": "Textos densos y figuras complejas sin rotular.",
                "estrategias": {
                    "acceso": "Uso de infografía simplificada y más tiempo.",
                    "evaluacion": "Evaluación oral complementaria para desarrollo."
                }
            }'::jsonb,
            now() - interval '3 hours'
        );

    END IF;
END $$;
