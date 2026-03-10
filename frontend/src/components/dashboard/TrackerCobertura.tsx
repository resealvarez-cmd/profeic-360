"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, Sparkles, CheckCircle2, Bookmark, Target, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoberturaRecord {
    id: string;
    nivel: string;
    asignatura: string;
    oa_id: string;
    tipo_recurso: string;
    created_at: string;
}

interface OA {
    id: number;
    oa_codigo: string;
    descripcion: string;
}

export function TrackerCobertura() {
    const [loadingRecords, setLoadingRecords] = useState(true);
    const [loadingOas, setLoadingOas] = useState(false);

    // Lista cruda de la base de datos de cobertura
    const [records, setRecords] = useState<CoberturaRecord[]>([]);

    // Cursos detectados (Combinación Nivel + Asignatura)
    const [courses, setCourses] = useState<{ nivel: string; asignatura: string }[]>([]);
    const [selectedCourseIdx, setSelectedCourseIdx] = useState<number>(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // OAs Oficiales del Ministerio cargados para el curso seleccionado
    const [officialOas, setOfficialOas] = useState<OA[]>([]);

    // Tabs "pendientes" | "logrados"
    const [activeTab, setActiveTab] = useState<"pendientes" | "logrados">("pendientes");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://profeic-backend-484019506864.us-central1.run.app";

    useEffect(() => {
        const fetchCoverage = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setLoadingRecords(false);
                return;
            }

            const { data, error } = await supabase
                .from("cobertura_curricular")
                .select("*")
                .eq("user_id", session.user.id);

            if (data && !error) {
                setRecords(data);

                // Extraer combinaciones únicas de Nivel + Asignatura
                const uniqueCoursesMap = new Map();
                data.forEach(r => {
                    const key = `${r.nivel}|||${r.asignatura}`;
                    if (!uniqueCoursesMap.has(key)) {
                        uniqueCoursesMap.set(key, { nivel: r.nivel, asignatura: r.asignatura });
                    }
                });

                const coursesArray = Array.from(uniqueCoursesMap.values());
                setCourses(coursesArray);
            }
            setLoadingRecords(false);
        };
        fetchCoverage();
    }, []);

    // Cada vez que cambia el curso seleccionado, traer OAs oficiales
    useEffect(() => {
        if (courses.length > 0) {
            fetchOfficialOas(courses[selectedCourseIdx]);
        }
    }, [selectedCourseIdx, courses]);

    const fetchOfficialOas = async (course: { nivel: string; asignatura: string }) => {
        setLoadingOas(true);
        try {
            const res = await fetch(`${API_URL}/curriculum/options`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nivel: course.nivel, asignatura: course.asignatura })
            });
            const d = await res.json();
            if (d.type === "oas") {
                setOfficialOas(d.data);
            } else {
                setOfficialOas([]);
            }
        } catch (e) {
            console.error("Error fetching OAs", e);
            setOfficialOas([]);
        } finally {
            setLoadingOas(false);
        }
    };

    if (loadingRecords) {
        return (
            <div className="w-full bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-full mb-3"></div>
                <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
                <div className="h-3 w-48 bg-slate-50 rounded"></div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="w-full bg-gradient-to-br from-white to-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                    <Target size={20} />
                </div>
                <h3 className="font-bold text-[#1a2e3b] mb-1">Tracker Curricular</h3>
                <p className="text-sm text-slate-500 max-w-xs">Guarda recursos en tu Biblioteca para comenzar a medir tu avance curricular automáticamente.</p>
            </div>
        );
    }

    const currentCourse = courses[selectedCourseIdx];

    // Lógica de Cruce CRÍTICA
    // Un OA oficial se considera abordado si algún récord en `records` (filtrado por este curso) 
    // contiene parte de la descripción o código.
    const courseRecords = records.filter(r => r.nivel === currentCourse.nivel && r.asignatura === currentCourse.asignatura);

    const isCovered = (oa: OA) => {
        // Normalizamos strings para comparación robusta
        const oaDesc = oa.descripcion.toLowerCase();
        const oaCod = oa.oa_codigo.toLowerCase();

        return courseRecords.some(r => {
            const recId = r.oa_id.toLowerCase();
            return (
                recId === String(oa.id) || // ID exacto
                oaDesc.includes(recId) ||  // El record es un prefijo truncado de la desc
                recId.includes(oaCod)      // El record contiene el código "OA 1"
            );
        });
    };

    const coveredOas = officialOas.filter(isCovered);
    const pendingOas = officialOas.filter(oa => !isCovered(oa));

    // Si la BD no nos devuelve OAs para esa asignatura, usamos la lista cruda como fallback (100% progreso simulado)
    const displayList = officialOas.length > 0
        ? (activeTab === "pendientes" ? pendingOas : coveredOas)
        : [];

    const total = officialOas.length || courseRecords.length;
    const coveredCount = officialOas.length > 0 ? coveredOas.length : courseRecords.length;
    const percentage = total === 0 ? 0 : Math.round((coveredCount / total) * 100);

    const chartData = [
        { name: "Logrados", value: coveredCount, color: "#f2ae60" },
        { name: "Pendientes", value: total - coveredCount, color: "#f1f5f9" } // slate-100
    ];

    if (percentage === 100) chartData[1].value = 0; // Prevent recharts error with 0

    return (
        <div className="w-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full ring-1 ring-black/5">
            {/* Header Seleccionable */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between relative">
                <div className="flex items-center gap-2 text-[#2b546e] font-bold">
                    <Target className="w-5 h-5 text-[#f2ae60]" />
                    <span>Mi Cobertura</span>
                </div>

                {/* Dropdown de cursos */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition-colors shadow-sm"
                    >
                        <span className="truncate max-w-[150px]">{currentCourse.asignatura} - {currentCourse.nivel}</span>
                        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95">
                            {courses.map((c, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setSelectedCourseIdx(idx); setDropdownOpen(false); }}
                                    className={cn("w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-between", idx === selectedCourseIdx ? "bg-[#f2ae60]/10 text-[#2b546e] font-bold" : "text-slate-600 hover:bg-slate-50")}
                                >
                                    <span className="truncate">{c.asignatura}</span>
                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 ml-2 shrink-0">{c.nivel}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 flex-1 flex grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">

                {/* Parte Lado Izquierdo: Gráfico Mágico */}
                <div className="flex flex-col items-center justify-center relative">
                    <div className="w-32 h-32 relative group">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={60}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-[#1a2e3b] leading-none">{percentage}%</span>
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avance Curricular</p>
                        <p className="text-sm font-bold text-[#2b546e] mt-0.5">{coveredCount} / {total} OAs</p>
                    </div>
                </div>

                {/* Parte Lado Derecho: Pestañas de Detalle */}
                <div className="flex flex-col border-l-0 md:border-l md:border-slate-100 md:pl-6 min-h-[220px]">
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-4 w-fit">
                        <button
                            onClick={() => setActiveTab("pendientes")}
                            className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === "pendientes" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            Pendientes ({pendingOas.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("logrados")}
                            className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5", activeTab === "logrados" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            <CheckCircle2 size={12} /> Logrados ({coveredOas.length})
                        </button>
                    </div>

                    <div className="flex-1 relative overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                        {loadingOas ? (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
                        ) : displayList.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-6">
                                <Bookmark className="w-8 h-8 text-slate-200 mb-2" />
                                <p className="text-sm font-bold text-slate-400">
                                    {activeTab === "pendientes" ? "¡Increíble! Has cubierto todos los OAs." : "Aún no hay OAs abordados en este curso."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 pb-2">
                                {displayList.map((oa, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100/50 flex items-start gap-3 hover:bg-slate-100 transition-colors group">
                                        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", activeTab === "pendientes" ? "bg-orange-400" : "bg-green-500")} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-[#2b546e] uppercase mb-0.5">{oa.oa_codigo}</p>
                                            <p className="text-xs text-slate-600 leading-snug line-clamp-2" title={oa.descripcion}>{oa.descripcion}</p>
                                        </div>
                                        {activeTab === "pendientes" && (
                                            <a
                                                href={`/planificador?nivel=${encodeURIComponent(currentCourse.nivel)}&asignatura=${encodeURIComponent(currentCourse.asignatura)}`}
                                                className="shrink-0 bg-white p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#f2ae60] hover:border-[#f2ae60] transition-colors shadow-sm ml-2 group-hover:scale-110"
                                                title="Planificar clase"
                                            >
                                                <Sparkles size={14} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
