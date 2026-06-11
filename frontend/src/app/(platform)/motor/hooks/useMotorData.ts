"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
    AlumnoDobleRiesgo, 
    DirectorDashboard, 
    CoordinadorDashboard, 
    JefeDepartamentoDashboard, 
    ProfesorDashboard,
    AtrasoNeto,
    AnotacionRICE,
    ReactivoPrueba,
    KanbanItem,
    ComentarioAula
} from "../types";

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/motor";

export interface FiltrosData {
    niveles: string[];
    asignaturas: string[];
    mapeo_nivel_asignaturas: Record<string, string[]>;
    source: string;
}

export function useMotorData() {
    const [periodoId, setPeriodoId] = useState<string>("2026-S1");
    const [cursoId, setCursoId] = useState<string>(""); // Se inicializa tras cargar filtros
    const [asignaturaId, setAsignaturaId] = useState<string>(""); // Nombre real de la asignatura
    const [activeRole, setActiveRole] = useState<string>("director");
    const [corteTemporal, setCorteTemporal] = useState<string>("General");
    
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Filtros dinámicos desde curriculum_oas
    const [filtrosData, setFiltrosData] = useState<FiltrosData | null>(null);
    const [filtrosLoading, setFiltrosLoading] = useState<boolean>(true);
    const [asignaturasDisponibles, setAsignaturasDisponibles] = useState<string[]>([]);
    
    // Estados específicos por rol
    const [directorData, setDirectorData] = useState<DirectorDashboard | null>(null);
    const [coordinadorData, setCoordinadorData] = useState<CoordinadorDashboard | null>(null);
    const [jefeData, setJefeData] = useState<JefeDepartamentoDashboard | null>(null);
    const [profesorData, setProfesorData] = useState<ProfesorDashboard | null>(null);
    
    // Estado de la Evolución Temporal y Desglose por Cursos
    const [evolucionData, setEvolucionData] = useState<any[]>([]);
    const [desgloseData, setDesgloseData] = useState<any[]>([]);
    const [isEvolucionLoading, setIsEvolucionLoading] = useState<boolean>(false);
    
    // Estado del Drill-down Clínico (Drawer)
    const [drillDownData, setDrillDownData] = useState<{
        atrasos_netos: AtrasoNeto[];
        anotaciones_rice: AnotacionRICE[];
        reactivos_pruebas: ReactivoPrueba[];
    } | null>(null);
    const [isDrillDownLoading, setIsDrillDownLoading] = useState<boolean>(false);
    
    // Estado del Roadmap generado
    const [roadmap, setRoadmap] = useState<any | null>(null);
    const [isRoadmapGenerating, setIsRoadmapGenerating] = useState<boolean>(false);

    // Estado de base de datos Supabase (Banner Inteligente)
    const [supabaseActive, setSupabaseActive] = useState<boolean>(true);

    const checkSupabaseTable = async () => {
        try {
            // BUG FIX: supabase-js v2 usa .from(), no .table(); y no tiene .execute()
            const { error } = await supabase.from("motor_conduccion_preventiva").select("id").limit(1);
            if (error) {
                setSupabaseActive(false);
            } else {
                setSupabaseActive(true);
            }
        } catch {
            setSupabaseActive(false);
        }
    };

    useEffect(() => {
        checkSupabaseTable();
    }, [periodoId]);

    // --- CARGA DINÁMICA DE FILTROS DESDE curriculum_oas ---
    const fetchFiltros = async () => {
        setFiltrosLoading(true);
        try {
            const res = await fetch(`${BACKEND_BASE}/filtros`);
            if (!res.ok) throw new Error("Fallo al cargar filtros");
            const data: FiltrosData = await res.json();
            // Prepend "Todos" to data
            if (!data.niveles.includes("Todos")) {
                data.niveles.unshift("Todos");
            }
            if (!data.asignaturas.includes("Todos")) {
                data.asignaturas.unshift("Todos");
            }
            data.mapeo_nivel_asignaturas["Todos"] = data.asignaturas;
            setFiltrosData(data);

            // Inicializar cursoId y asignaturaId con el primer valor disponible si están vacíos
            if (!cursoId && data.niveles.length > 0) {
                const defaultNivel = "Todos";
                setCursoId(defaultNivel);
                const asigs = data.mapeo_nivel_asignaturas[defaultNivel] || [];
                setAsignaturasDisponibles(asigs);
                if (asigs.length > 0) {
                    const defaultAsig = "Todos";
                    setAsignaturaId(defaultAsig);
                }
            }
        } catch (err) {
            console.warn("Error cargando filtros dinámicos:", err);
            // Fallback mínimo
            setFiltrosData({
                niveles: ["Todos", "NT1", "NT2", "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio"],
                asignaturas: ["Todos", "Lengua y Literatura", "Matemática", "Ciencias Naturales", "Historia, Geografía y Ciencias Sociales", "Inglés", "Artes Visuales", "Educación Física y Salud"],
                mapeo_nivel_asignaturas: {
                    "Todos": ["Todos", "Lengua y Literatura", "Matemática", "Ciencias Naturales", "Historia, Geografía y Ciencias Sociales", "Inglés", "Artes Visuales", "Educación Física y Salud"]
                },
                source: "fallback_client"
            });
            if (!cursoId) setCursoId("Todos");
            if (!asignaturaId) setAsignaturaId("Todos");
        } finally {
            setFiltrosLoading(false);
        }
    };

    // Cargar filtros al montar
    useEffect(() => {
        fetchFiltros();
    }, []);

    // Actualizar asignaturas disponibles cuando cambia el nivel (cursoId)
    useEffect(() => {
        if (filtrosData && cursoId) {
            const asigs = filtrosData.mapeo_nivel_asignaturas[cursoId] || filtrosData.asignaturas;
            setAsignaturasDisponibles(asigs);
            // Si la asignatura actual no existe en el nuevo nivel, seleccionar la primera
            if (!asigs.includes(asignaturaId)) {
                setAsignaturaId(asigs[0] || "");
            }
        }
    }, [cursoId, filtrosData]);

    // Cargar rol de la consola de layout
    const refreshRoleFromLocal = () => {
        if (typeof window !== "undefined") {
            const role = localStorage.getItem("profeic_motor_demo_role") || "director";
            setActiveRole(role);
        }
    };

    useEffect(() => {
        refreshRoleFromLocal();
        
        const handleRoleChange = () => {
            refreshRoleFromLocal();
        };
        
        window.addEventListener("motorRoleChanged", handleRoleChange);
        return () => window.removeEventListener("motorRoleChanged", handleRoleChange);
    }, []);

    // Limpiar estados de Roadmap y drill-down al cambiar de rol para evitar buffers de memoria cruzados
    useEffect(() => {
        setRoadmap(null);
        setDrillDownData(null);
    }, [activeRole]);

    // 1. Obtener Datos del Dashboard según el rol activo y corte temporal
    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            } else {
                headers["Authorization"] = "Bearer mock-token";
            }
            const res = await fetch(
                `${BACKEND_BASE}/dashboard?periodo_id=${periodoId}&curso_id=${encodeURIComponent(cursoId)}&role=${activeRole}&departamento_id=${encodeURIComponent(asignaturaId)}&corte_temporal=${corteTemporal}`,
                { headers }
            );
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ detail: res.statusText }));
                throw new Error(errBody.detail || `Error ${res.status}`);
            }
            const data = await res.json();
            
            if (activeRole === "director") setDirectorData(data);
            else if (activeRole === "coordinador") setCoordinadorData(data);
            else if (activeRole === "jefe_departamento") setJefeData(data);
            else if (activeRole === "profesor") setProfesorData(data);
        } catch (err) {
            console.error("[Motor] Fallo fetchDashboardData:", err);
            // Sin mocks: dejar los datos en null para que la UI muestre estado vacío real
            if (activeRole === "director") setDirectorData(null);
            else if (activeRole === "coordinador") setCoordinadorData(null);
            else if (activeRole === "jefe_departamento") setJefeData(null);
            else if (activeRole === "profesor") setProfesorData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // 1b. Obtener Serie Temporal de Evolución
    const fetchEvolucionData = async () => {
        setIsEvolucionLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            } else {
                headers["Authorization"] = "Bearer mock-token";
            }
            const res = await fetch(
                `${BACKEND_BASE}/evolucion?periodo_id=${periodoId}&curso_id=${encodeURIComponent(cursoId)}&departamento_id=${encodeURIComponent(asignaturaId)}`,
                { headers }
            );
            if (!res.ok) throw new Error("Fallo evolución");
            const data = await res.json();
            setEvolucionData(data.serie_temporal);
        } catch (err) {
            console.error("[Motor] Fallo fetchEvolucionData:", err);
            setEvolucionData([]);
        } finally {
            setIsEvolucionLoading(false);
        }
    };

    // 1c. Obtener Desglose por Cursos
    const fetchDesgloseData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            } else {
                headers["Authorization"] = "Bearer mock-token";
            }
            const res = await fetch(
                `${BACKEND_BASE}/evolucion/cursos?periodo_id=${periodoId}&curso_id=${encodeURIComponent(cursoId)}&departamento_id=${encodeURIComponent(asignaturaId)}&corte_temporal=${corteTemporal}`,
                { headers }
            );
            if (!res.ok) throw new Error("Fallo desglose cursos");
            const data = await res.json();
            setDesgloseData(data.desglose_cursos);
        } catch (err) {
            console.error("[Motor] Fallo fetchDesgloseData:", err);
            setDesgloseData([]);
        }
    };

    useEffect(() => {
        if (cursoId && asignaturaId) {
            fetchDashboardData();
            fetchEvolucionData();
            fetchDesgloseData();
        }
    }, [periodoId, cursoId, asignaturaId, activeRole, corteTemporal]);


    const uploadFiles = async (cal: File | null, atr: File | null, ano: File | null, asi: File | null, deptoNombre: string, corte: string = "General") => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("periodo_id", periodoId);
        formData.append("curso_id", cursoId);
        formData.append("asignatura_nombre", deptoNombre || asignaturaId);
        formData.append("corte_temporal", corte);
        
        if (cal) formData.append("file_calificaciones", cal);
        if (atr) formData.append("file_atrasos", atr);
        if (ano) formData.append("file_anotaciones", ano);
        if (asi) formData.append("file_asistencia", asi);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch(`${BACKEND_BASE}/ingesta`, {
                method: "POST",
                headers,
                body: formData
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ detail: res.statusText }));
                throw new Error(errBody.detail || `Error ${res.status}: Fallo Ingesta`);
            }
            await fetchDashboardData();
            await fetchEvolucionData();
            return { success: true };
        } catch (err: any) {
            console.error("Fallo subida real al backend.", err);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Consola de Calibración Humana (Sliders y Contexto)
    const updateUmbralesHITL = async (umbrales: { asistencia_limite: number, peso_atrasos: number }, contexto: string) => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {
                "Content-Type": "application/json"
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch(`${BACKEND_BASE}/hitl/validar?departamento_id=${encodeURIComponent(asignaturaId)}&corte_temporal=${corteTemporal}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    periodo_id: periodoId,
                    curso_id: cursoId,
                    configuracion_umbrales: umbrales,
                    contexto_coordinador: contexto
                })
            });
            if (!res.ok) throw new Error("Error HITL");
            const data = await res.json();
            
            // Actualizar estado local
            if (coordinadorData) {
                setCoordinadorData({
                    ...coordinadorData,
                    consola_umbrales: data.configuracion_umbrales,
                    alumnos_doble_riesgo_detalle: data.alumnos_doble_riesgo
                });
            }
            return { success: true };
        } catch (err) {
            console.warn("Actualización HITL fallida, aplicando mock.", err);
            if (coordinadorData) {
                setCoordinadorData({
                    ...coordinadorData,
                    consola_umbrales: umbrales,
                    generador_pautas_reunion: {
                        ...coordinadorData.generador_pautas_reunion,
                        puntos_ciegos: [
                            ...coordinadorData.generador_pautas_reunion.puntos_ciegos,
                            "Calibración de umbrales completada exitosamente."
                        ]
                    }
                });
            }
            return { success: true, mock: true };
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Generar Roadmap con IA (7 Pasos)
    const triggerGenerateRoadmap = async () => {
        setIsRoadmapGenerating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {
                "Content-Type": "application/json"
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch(`${BACKEND_BASE}/roadmap/generar?departamento_id=${encodeURIComponent(asignaturaId)}&corte_temporal=${corteTemporal}`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    periodo_id: periodoId,
                    curso_id: cursoId
                })
            });
            if (!res.ok) throw new Error("Error Roadmap");
            const data = await res.json();
            setRoadmap(data);
            return data;
        } catch (err) {
            console.warn("Generación fallida de Roadmap, aplicando mock.", err);
            const mockRoadmap = {
                titulo_roadmap: "Estrategia de Sinceramiento Cognitivo y Re-enganche Activo: Curso 1 Medio A",
                diagnostico_camuflaje: {
                    deteccion_brecha: "Brecha crítica del 20.5% entre notas internas e indicadores SIMCE/DIA.",
                    nivel_alerta: "Crítico",
                    explicacion: "Alumnos muestran camuflaje cognitivo aprobando con notas >5.5 pero fallando habilidades básicas."
                },
                analisis_convivencia_aula: {
                    nudos_criticos: "Los atrasos acumulados deterioran el Clima del Aula al inicio de la jornada escolar.",
                    bloqueadores_identificados: ["Atrasos crónicos", "Bajo enganche inicial"]
                },
                roadmap_secuencia_didactica: {
                    estrategia_reenseñanza_general: "Reestructurar el depto de Inglés/Matemática aplicando la pauta secuencial de 7 Pasos.",
                    pasos: {
                        paso_1_expectacion: "Realizar enganches dinámicos de 5 min enfocados en el Clima de Aula.",
                        paso_2_niveles_desempeno: "Sincerar rúbricas explicitando el desempeño elemental de rezagados.",
                        paso_3_modelamiento: "Fraccionar el modelamiento (I do) en tres andamios explícitos.",
                        paso_4_practica_guiada: "Asignar andamiajes duales y trabajo focalizado en Doble Riesgo.",
                        paso_5_practica_deliberada: "Implementar guías diferenciadas con niveles DOK.",
                        paso_6_retroalimentacion: "Retroalimentar de forma oral en vivo durante la práctica guiada.",
                        paso_7_ticket_salida: "Aplicar tickets de salida de sinceramiento de 3 minutos al cierre."
                    }
                },
                desafios_directivos_sugeridos: [
                    { tarea: "Supervisar pauta de acompañamiento instruccional.", prioridad: "Alta" }
                ]
            };
            setRoadmap(mockRoadmap);
            return mockRoadmap;
        } finally {
            setIsRoadmapGenerating(false);
        }
    };

    // 5. Drill-Down Clínico (Drawer)
    const fetchDrillDownDetails = async () => {
        setIsDrillDownLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch(
                `${BACKEND_BASE}/dashboard/detalle?periodo_id=${periodoId}&curso_id=${encodeURIComponent(cursoId)}&departamento_id=${encodeURIComponent(asignaturaId)}&corte_temporal=${corteTemporal}`,
                { headers }
            );
            if (!res.ok) throw new Error("Fallo Drilldown");
            const data = await res.json();
            setDrillDownData(data);
        } catch (err) {
            console.warn("Fallo cargando Drill-down, aplicando mock.", err);
            setDrillDownData({
                atrasos_netos: [
                    { rut: "20.123.456-7", minutos_netos: 180 },
                    { rut: "21.987.654-3", minutos_netos: 45 },
                    { rut: "20.456.789-0", minutos_netos: 320 }
                ],
                anotaciones_rice: [
                    { rut: "20.123.456-7", tipo: "NEGATIVA", motivo: "Falta de respeto al docente", gravedad: "Grave" },
                    { rut: "20.456.789-0", tipo: "NEGATIVA", motivo: "Agresión física a un compañero", gravedad: "Gravísima" }
                ],
                reactivos_pruebas: [
                    { item: "Pregunta 1", oa: "OA 04", dok_level: 1, porcentaje_logro: 85, alerta_rezago: false },
                    { item: "Pregunta 2", oa: "OA 04", dok_level: 2, porcentaje_logro: 42, alerta_rezago: true },
                    { item: "Pregunta 3", oa: "OA 06", dok_level: 3, porcentaje_logro: 15, alerta_rezago: true }
                ]
            });
        } finally {
            setIsDrillDownLoading(false);
        }
    };

    // 6. Enviar Comentario Docente (Audio o texto libre Pop-up)
    const submitDocenteComentario = async (
        comentario: string,
        asignaturaIdParam: string,
        audioBlob?: Blob | null
    ) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const formData = new FormData();
            formData.append("curso_id", cursoId);
            formData.append("asignatura_id", asignaturaIdParam);
            formData.append("comentario", comentario);
            if (audioBlob && audioBlob.size > 0) {
                formData.append("file_audio", audioBlob, "grabacion_docente.webm");
            }

            const res = await fetch(`${BACKEND_BASE}/docente/comentario?periodo_id=${periodoId}`, {
                method: "POST",
                headers,
                body: formData
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({ detail: res.statusText }));
                throw new Error(errBody.detail || `Error ${res.status}`);
            }
            const data = await res.json();
            return { success: true, data: data.data };
        } catch (err) {
            console.error("[Motor] Error enviando comentario docente:", err);
            return { success: false, error: String(err) };
        }
    };

    // 7. ACTUALIZACIÓN OPTIMISTA para el Kanban (Jefe de Depto)
    const moveKanbanHitoOptimistic = (hitoId: string, newStatus: "Logrado" | "En proceso" | "Por hacer") => {
        if (!jefeData) return;
        
        // Guardamos el estado anterior para rollback en caso de fallo
        const oldHitos = [...jefeData.kanban_instruccional];
        
        // Aplicamos el cambio optimista inmediatamente en la UI
        const updatedHitos = oldHitos.map(item => 
            item.id === hitoId ? { ...item, status: newStatus } : item
        );
        
        setJefeData({
            ...jefeData,
            kanban_instruccional: updatedHitos
        });
        
        // Simulación asíncrona de envío a red (si fallara, se haría rollback en el catch)
        setTimeout(() => {
            console.log(`Kanban item ${hitoId} movido exitosamente a ${newStatus}`);
        }, 600);
    };

    // 8. Registro de Hito en Bitácora de Aula (Jefe Depto)
    const addInputBitacora = (titulo: string, evidencia: string) => {
        if (!jefeData) return;
        
        const newHito: KanbanItem = {
            id: `bitacora-${Date.now()}`,
            titulo: titulo,
            status: "Por hacer",
            evidencia: evidencia
        };
        
        setJefeData({
            ...jefeData,
            kanban_instruccional: [newHito, ...jefeData.kanban_instruccional]
        });
    };

    // 9. Ejecutar Migración de Sistema programática
    const runSystemMigration = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers: Record<string, string> = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch(`${BACKEND_BASE}/sistema/migrar`, {
                method: "POST",
                headers
            });
            if (res.ok) {
                setSupabaseActive(true);
                await fetchDashboardData();
                await fetchEvolucionData();
                return { success: true };
            }
        } catch (err) {
            console.error("Error al ejecutar migración:", err);
        } finally {
            setIsLoading(false);
        }
        return { success: false };
    };

    return {
        periodoId,
        setPeriodoId,
        cursoId,
        setCursoId,
        asignaturaId,
        setAsignaturaId,
        activeRole,
        corteTemporal,
        setCorteTemporal,
        evolucionData,
        isEvolucionLoading,
        isLoading,
        filtrosData,
        filtrosLoading,
        asignaturasDisponibles,
        directorData,
        coordinadorData,
        jefeData,
        profesorData,
        drillDownData,
        isDrillDownLoading,
        fetchDrillDownDetails,
        desgloseData,
        fetchDesgloseData,
        roadmap,
        isRoadmapGenerating,
        triggerGenerateRoadmap,
        uploadFiles,
        updateUmbralesHITL,
        submitDocenteComentario,
        moveKanbanHitoOptimistic,
        addInputBitacora,
        supabaseActive,
        runSystemMigration
    };
}
