"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    Library, Book, Search, Calendar, GraduationCap, Layout,
    BrainCircuit, Target, CheckCircle2, Layers, FileQuestion,
    Puzzle, TrendingUp, AlertCircle, Download, Trash2, X,
    FileText, Loader2, MoreVertical, Share2, Globe, Edit3, CheckSquare, Square
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { saveAs } from "file-saver";

// --- ICONO AUXILIAR ---
const SparklesIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
);

// --- COMPONENTE: VELO DE CARGA ---
const LoadingOverlay = () => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#f2ae60] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <BrainCircuit className="w-24 h-24 text-[#f2ae60] animate-bounce relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Cargando Biblioteca...</h2>
            <p className="mt-3 text-slate-400 font-light text-lg">Conectando con tu segundo cerebro</p>
        </div>,
        document.body
    );
};

// --- VISOR INTELIGENTE ---
const VisorDeRecursos = ({ data }: { data: any }) => {
    if (!data) return <p className="text-slate-400 italic">Sin contenido visualizable.</p>;

    let safeData = data;
    if (typeof data === 'string') {
        try { safeData = JSON.parse(data); } catch (e) { console.error("Error parseando contenido:", e); }
    }

    // 1. PLANIFICACIÓN
    if (safeData.planificacion_clases || safeData.clases) {
        const clases = safeData.planificacion_clases || safeData.clases || [];
        return (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-700 uppercase mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4" /> Estrategia Didáctica
                    </h4>
                    <p className="text-sm text-blue-900 italic font-medium leading-relaxed">
                        "{safeData.estrategia_aprendizaje_sentencia || safeData.estrategia || 'Sin estrategia definida'}"
                    </p>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Secuencia Didáctica ({clases.length} Clases)
                    </h4>
                    <div className="space-y-3">
                        {clases.map((clase: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-[#2b546e] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-md border-2 border-white">
                                    {clase.numero_clase || i + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-bold text-slate-800">Clase {clase.numero_clase}</p>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2 leading-snug">{clase.foco_pedagogico || "Sin foco definido"}</p>
                                    {clase.ticket_salida && (
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
                                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                                            <p className="text-xs text-slate-500 truncate"><span className="font-bold">Ticket:</span> {clase.ticket_salida}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 2. RÚBRICA
    if (safeData.tabla && Array.isArray(safeData.tabla)) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-sm font-bold text-slate-600 uppercase flex items-center gap-2"><Layout className="w-4 h-4" /> Puntaje Total</span>
                    <span className="bg-[#2b546e] text-white text-xs font-bold px-3 py-1 rounded-full">{safeData.puntaje_total || 0} pts</span>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Criterios de Evaluación
                    </h4>
                    <div className="space-y-3">
                        {safeData.tabla.map((row: any, i: number) => (
                            <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[#f2ae60] transition-colors">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <span className="text-sm font-bold text-slate-800">{row.criterio}</span>
                                    <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded border border-slate-200">{row.porcentaje}%</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1 mt-3">
                                    {['Insuficiente', 'Elemental', 'Adecuado', 'Destacado'].map((lvl, idx) => (
                                        <div key={idx} className={`h-1.5 rounded-full ${idx < 4 ? 'bg-slate-200' : ''} ${idx === 3 ? 'bg-green-400' : ''}`} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 3. EVALUACIÓN (PRUEBA) - Vista Resumen Rica
    // La evaluación puede guardar items a nivel top o dentro de student_version
    const evalItems = safeData.student_version?.items || (Array.isArray(safeData.items) ? safeData.items : null);
    const evalTitle = safeData.student_version?.title || safeData.title;
    // Si detectamos items de evaluación en cualquier nivel, mostramos el visor
    if (evalItems && Array.isArray(evalItems) && evalItems.length > 0) {
        // Composición: contar por tipo de reactivo
        const composition: Record<string, number> = {};
        let totalPts = 0;
        evalItems.forEach((item: any) => {
            const t = item.type || 'otro';
            composition[t] = (composition[t] || 0) + 1;
            totalPts += item.points || 0;
        });
        const typeLabels: Record<string, string> = {
            multiple_choice: 'Selección Múltiple',
            true_false: 'Verdadero/Falso',
            short_answer: 'Resp. Corta',
            essay: 'Desarrollo',
        };
        // OAs medidos (guardados en config como oaTexts)
        const oaTexts: string[] = safeData.oaTexts || [];
        // DOK distribution
        const dok = safeData.dokDistribution;

        return (
            <div className="space-y-5">
                {/* --- RESUMEN CLAVE --- */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <p className="text-2xl font-black text-[#2b546e]">{evalItems.length}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Reactivos</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                        <p className="text-2xl font-black text-green-700">{totalPts}</p>
                        <p className="text-[10px] font-bold text-green-600 uppercase mt-1">Puntos</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                        <p className="text-2xl font-black text-purple-700">{safeData.num_alternatives || '–'}</p>
                        <p className="text-[10px] font-bold text-purple-600 uppercase mt-1">Alternativas</p>
                    </div>
                </div>

                {/* --- COMPOSICIÓN DE PREGUNTAS --- */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <FileQuestion className="w-4 h-4" /> Composición de la Prueba
                    </h4>
                    <div className="space-y-2">
                        {Object.entries(composition).map(([type, count]) => {
                            const pct = Math.round((count / evalItems.length) * 100);
                            return (
                                <div key={type} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-600 w-36 shrink-0">{typeLabels[type] || type} ({count})</span>
                                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                                        <div className="bg-[#2b546e] h-2 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-slate-500 font-bold w-8 text-right">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- DOK DISTRIBUTION --- */}
                {dok && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Calibración DOK
                        </h4>
                        <div className="flex gap-2">
                            {[{ label: 'DOK 1', value: dok.dok1, color: 'bg-green-400' }, { label: 'DOK 2', value: dok.dok2, color: 'bg-yellow-400' }, { label: 'DOK 3', value: dok.dok3, color: 'bg-red-400' }].map(d => (
                                <div key={d.label} className="flex-1 text-center">
                                    <div className="text-xs text-slate-500 mb-1">{d.label}</div>
                                    <div className="bg-slate-200 rounded-full h-2 mb-1">
                                        <div className={`${d.color} h-2 rounded-full`} style={{ width: `${d.value || 0}%` }} />
                                    </div>
                                    <div className="text-xs font-bold text-slate-700">{d.value || 0}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- OA MEDIDOS --- */}
                {oaTexts.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Objetivos Medidos ({oaTexts.length})
                        </h4>
                        <div className="space-y-2">
                            {oaTexts.slice(0, 2).map((oa: string, i: number) => (
                                <div key={i} className="text-xs text-slate-600 bg-green-50 border border-green-100 p-3 rounded-xl leading-relaxed line-clamp-3 italic">
                                    "{oa}"
                                </div>
                            ))}
                            {oaTexts.length > 2 && <p className="text-xs text-slate-400 text-center">...y {oaTexts.length - 2} objetivos más</p>}
                        </div>
                    </div>
                )}
                {!oaTexts.length && safeData.customOa && (
                    <div className="text-xs text-slate-600 bg-amber-50 border border-amber-100 p-3 rounded-xl italic">
                        <span className="font-bold text-amber-700 block mb-1">Objetivo personalizado:</span>
                        "{safeData.customOa}"
                    </div>
                )}
            </div>
        );
    }


    // 4. ELEVADOR COGNITIVO
    if (safeData.escalera) {
        return (
            <div className="space-y-6">
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex gap-4">
                    <div className="p-2 bg-white rounded-lg h-fit text-orange-500"><AlertCircle className="w-5 h-5" /></div>
                    <div>
                        <h4 className="text-xs font-bold text-orange-700 uppercase mb-1">Diagnóstico Inicial</h4>
                        <p className="text-sm text-orange-900 font-medium leading-snug">{safeData.diagnostico}</p>
                        <Badge className="mt-2 bg-orange-200 text-orange-800 hover:bg-orange-300">{safeData.dok_actual}</Badge>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Escalera de Aprendizaje
                    </h4>
                    <div className="space-y-2 relative pl-4 border-l-2 border-slate-100 ml-2">
                        {safeData.escalera.map((step: any, i: number) => (
                            <div key={i} className="relative pl-6 py-1">
                                <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-[#1a2e3b] text-white flex items-center justify-center text-xs font-bold">
                                    {step.paso}
                                </div>
                                <p className="text-sm text-slate-700">{step.accion}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {safeData.propuestas && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <h4 className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Propuesta Nivel 4 (Meta)
                        </h4>
                        <p className="text-sm text-green-900 leading-relaxed">{safeData.propuestas.actividad}</p>
                    </div>
                )}
            </div>
        );
    }

    // 5. NEE
    if (safeData.estrategias) {
        return (
            <div className="space-y-6">
                <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100">
                    <h4 className="text-xs font-bold text-teal-700 uppercase mb-2 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> Diagnóstico
                    </h4>
                    <p className="text-base font-bold text-teal-900 mb-1">{safeData.diagnosis}</p>
                    <div className="text-xs text-teal-700 bg-teal-100/50 p-2 rounded-lg border border-teal-200/50 mt-2">
                        <span className="font-bold">Barrera detectada:</span> {safeData.barrier}
                    </div>
                </div>
                <div className="grid gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Target className="w-3 h-3" /> Acceso</h5>
                        <p className="text-sm text-slate-700">{safeData.estrategias.acceso}</p>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Evaluación</h5>
                        <p className="text-sm text-slate-700">{safeData.estrategias.evaluacion}</p>
                    </div>
                </div>
            </div>
        );
    }

    // 6. AUDITORIA
    if (safeData.score_coherencia !== undefined) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-red-500" /> Score de Coherencia
                        </h4>
                        <span className={`text-xl font-black ${safeData.score_coherencia < 60 ? 'text-red-500' : 'text-green-500'}`}>
                            {safeData.score_coherencia}%
                        </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium mb-1">{safeData.diagnostico_global}</p>
                    {safeData.conclusion && <p className="text-xs text-slate-500 italic mt-2">{safeData.conclusion.accion}</p>}
                </div>
                {safeData.items_analizados && (
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Reactivos Analizados ({safeData.items_analizados.length})
                        </h4>
                        <div className="space-y-2">
                            {safeData.items_analizados.slice(0, 5).map((item: any, i: number) => (
                                <div key={i} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className={`text-[10px] ${item.estado === 'Mejorable' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-green-600 bg-green-50 border-green-200'}`}>{item.dok_real}</Badge>
                                    </div>
                                    <p className="text-sm text-slate-700 italic line-clamp-2">"{item.pregunta_extracto}"</p>
                                </div>
                            ))}
                            {safeData.items_analizados.length > 5 && (
                                <p className="text-xs text-center text-slate-400 mt-2">...y {safeData.items_analizados.length - 5} reactivos más</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 7. LECTURA INTELIGENTE
    if (safeData.texto && safeData.preguntas) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#f2ae60]" /> Texto Insumo
                    </h4>
                    <p className="text-sm text-slate-700 italic line-clamp-4 font-serif leading-relaxed">
                        "{safeData.texto}"
                    </p>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <FileQuestion className="w-4 h-4" /> Preguntas Taxonómicas ({safeData.preguntas.length})
                    </h4>
                    <div className="space-y-3">
                        {safeData.preguntas.slice(0, 3).map((q: any, i: number) => (
                            <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <p className="text-sm text-slate-800 font-medium mb-2">{i + 1}. {q.pregunta}</p>
                                <div className="pl-4 border-l-2 border-slate-100 space-y-1">
                                    {q.alternativas?.slice(0, 2).map((alt: string, aIdx: number) => (
                                        <p key={aIdx} className="text-xs text-slate-600">{String.fromCharCode(65 + aIdx)}) {alt}</p>
                                    ))}
                                    {q.alternativas?.length > 2 && <p className="text-xs text-slate-400">...</p>}
                                </div>
                            </div>
                        ))}
                        {safeData.preguntas.length > 3 && (
                            <p className="text-xs text-center text-slate-400 mt-2">...y {safeData.preguntas.length - 3} preguntas más</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 8. FALLBACK
    return (
        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[300px]">
            <p className="mb-2 text-slate-500 uppercase font-bold text-[10px]">Datos Crudos:</p>
            <pre className="whitespace-pre-wrap">{JSON.stringify(safeData, null, 2)}</pre>
        </div>
    );
};

type LibraryItem = {
    id: number;
    titulo: string;
    tipo: "PLANIFICACION" | "RUBRICA" | "EVALUACION" | "AUDITORIA" | "ESTRATEGIA" | "ELEVADOR" | "GENERAL";
    asignatura: string;
    nivel: string;
    created_at: string;
    contenido: any;
    is_public?: boolean; // Added for Community Phase
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Tipos para filtrar, incluyendo "TODOS"
const FILTER_TYPES = [
    { key: "TODOS", label: "Todos" },
    { key: "PLANIFICACION", label: "Planificaciones" },
    { key: "EVALUACION", label: "Evaluaciones" },
    { key: "RUBRICA", label: "Rúbricas" },
    { key: "ELEVADOR", label: "Elevador" },
    { key: "AUDITORIA", label: "Auditoría" },
    { key: "ESTRATEGIA", label: "NEE" },
    { key: "LECTURA", label: "Lecturas" },
];

export default function BibliotecaPage() {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("TODOS");
    const [selectedResource, setSelectedResource] = useState<LibraryItem | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [selectedForPackage, setSelectedForPackage] = useState<Set<number>>(new Set());
    const [generatingPackage, setGeneratingPackage] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from("biblioteca_recursos")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error("Error cargando biblioteca:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, e: any) => {
        e.stopPropagation();
        if (!confirm("¿Estás seguro de eliminar este recurso?")) return;
        try {
            const { error } = await supabase.from("biblioteca_recursos").delete().eq("id", id);
            if (error) throw error;
            setItems(items.filter((item) => item.id !== id));
            if (selectedResource?.id === id) setSelectedResource(null);
            toast.success("Recurso eliminado correctamente.");
        } catch (error) {
            console.error("Error eliminando:", error);
            toast.error("No se pudo eliminar el recurso.");
        }
    };

    const handlePublish = async (item: LibraryItem, e: any) => {
        e.stopPropagation();
        const newStatus = !item.is_public;
        const confirmMsg = newStatus
            ? "¿Quieres publicar este recurso en la Sala de Profesores? Todos podrán verlo."
            : "¿Quieres ocultar este recurso?";

        if (!confirm(confirmMsg)) return;

        try {
            // Obtener sesión actual para autenticar la petición al backend
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;

            if (!token) {
                toast.error("Error de sesión. Por favor recarga la página.");
                return;
            }

            const res = await fetch(`${API_URL}/community/share`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // Enviar token para contextos RLS/Auth
                },
                body: JSON.stringify({
                    resource_id: item.id,
                    is_public: newStatus
                })
            });

            if (res.ok) {
                setItems(prevItems => prevItems.map(i => String(i.id) === String(item.id) ? { ...i, is_public: newStatus } : i));
                if (selectedResource && String(selectedResource.id) === String(item.id)) {
                    setSelectedResource({ ...selectedResource, is_public: newStatus });
                }
                toast.success(newStatus ? "¡Publicado en Sala de Profesores! 🌐" : "Recurso ocultado.");
            } else {
                const errData = await res.json();
                console.error("Backend Error:", errData);
                toast.error("No se pudo actualizar. Verifica tu conexión.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión al intentar publicar.");
        }
    };

    const handleDownload = async (item: LibraryItem, e?: any) => {
        if (e) e.stopPropagation(); // Evita abrir el modal
        setDownloading(true);
        try {
            const CURRENT_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const endpoint = `${CURRENT_API_URL}/export/prepare-generic`;
            const payload = {
                titulo_unidad: item.titulo,
                nivel: item.nivel,
                asignatura: item.asignatura,
                contenido: item.contenido
            };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Error en la descarga");

            const { download_id } = await response.json();

            // Limpiar nombre de archivo de caracteres prohibidos por el OS (como ":") que rompen el encabezado y obligan el UUID
            const safeTitle = (item.titulo || "Documento_ProfeIC")
                .replace(/[^a-zA-Z0-9_\u00C0-\u017F\- ]/g, "")
                .replace(/\s+/g, "_");

            // Abrir en una pestaña nueva aisla completamente la acción del DOM de React y fuerza al OS a manejar el archivo de manera nativa
            const downloadUrl = `${CURRENT_API_URL}/export/download-generic/${download_id}/${safeTitle}.docx`;
            window.open(downloadUrl, "_blank");

            toast.success("¡Descarga iniciada! 📄");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo descargar el archivo.");
        } finally {
            setDownloading(false);
        }
    };

    const toggleSelection = (id: number, e: any) => {
        e.stopPropagation();
        const newSet = new Set(selectedForPackage);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedForPackage(newSet);
    };

    const handleCreatePackage = async () => {
        if (selectedForPackage.size === 0) return;
        setGeneratingPackage(true);
        toast.info(`Preparando documento DOCX con ${selectedForPackage.size} recursos. Por favor espera...`);

        try {
            const documentos = Array.from(selectedForPackage)
                .map(id => items.find(i => i.id === id))
                .filter(doc => doc !== undefined)
                .map(doc => ({
                    titulo_unidad: doc!.titulo || "",
                    nivel: doc!.nivel || "",
                    asignatura: doc!.asignatura || "",
                    contenido: doc!.contenido || {}
                }));

            const CURRENT_API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const endpoint = `${CURRENT_API_URL}/export/prepare-paquete`;
            const payload = { documentos };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Error en la petición de DOCX");

            const { download_id } = await response.json();

            // Aislar en nueva pestaña para forzar el gestor de descargas nativo
            const downloadUrl = `${CURRENT_API_URL}/export/download-paquete/${download_id}/Paquete_Didactico_ProfeIC.docx`;
            window.open(downloadUrl, "_blank");

            toast.success("¡Paquete DOCX forzado! 🎉");
            setSelectedForPackage(new Set());
        } catch (error) {
            console.error(error);
            toast.error("Error al preparar el paquete DOCX.");
        } finally {
            setGeneratingPackage(false);
        }
    };

    const getIcon = (tipo: string) => {
        const t = (tipo || "").toUpperCase();
        switch (t) {
            case "PLANIFICACION": return <Calendar className="w-5 h-5 text-blue-500" />;
            case "RUBRICA": return <Layers className="w-5 h-5 text-purple-500" />;
            case "AUDITORIA": return <BrainCircuit className="w-5 h-5 text-red-500" />;
            case "EVALUACION": return <FileQuestion className="w-5 h-5 text-orange-500" />;
            case "ESTRATEGIA": return <Puzzle className="w-5 h-5 text-teal-500" />;
            case "ELEVADOR": return <TrendingUp className="w-5 h-5 text-amber-500" />;
            default: return <FileText className="w-5 h-5 text-slate-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.asignatura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tipo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === "TODOS" || item.tipo === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <style>{`
            @media print {
                @page { margin: 15mm; size: auto; }
                body {
                    background-color: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                /* Hide nextjs dev overlays and external UI */
                #nextjs-dev-overlay { display: none !important; }
                nav, header, aside, .toaster { display: none !important; }
                
                /* Container overrides */
                .print\\:hidden { display: none !important; }
                .print\\:block { display: block !important; }
                .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
                .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
            }
        `}</style>
            <div className="min-h-screen bg-[#f8fafc] p-8 font-sans print:p-0 print:m-0 print:bg-white">
                {loading && <LoadingOverlay />}

                <div className="max-w-7xl mx-auto space-y-8 print:hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#1a2e3b] flex items-center gap-3">
                                <Book className="w-8 h-8 text-[#f2ae60]" />
                                Biblioteca Docente
                            </h1>
                            <p className="text-slate-500 mt-1">Repositorio central de tus recursos educativos.</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar por título, asignatura o tipo..."
                                className="pl-10 bg-white border-slate-200 focus:ring-[#f2ae60] text-slate-900 dark:text-slate-900 font-medium placeholder:text-slate-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* FILTROS POR TIPO */}
                    <div className="flex flex-wrap gap-2">
                        {FILTER_TYPES.map(({ key, label }) => {
                            const count = key === "TODOS" ? items.length : items.filter(i => i.tipo === key).length;
                            if (count === 0 && key !== "TODOS") return null;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveFilter(key)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${activeFilter === key
                                        ? "bg-[#1a2e3b] text-white border-[#1a2e3b] shadow-sm"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-[#f2ae60] hover:text-[#1a2e3b]"
                                        }`}
                                >
                                    {label} <span className={`ml-1 ${activeFilter === key ? "opacity-70" : "opacity-50"}`}>({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Grid */}
                    {!loading && filteredItems.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <Book className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No se encontraron recursos.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item) => {
                                const isSelected = selectedForPackage.has(item.id);
                                return (
                                    <Card key={item.id} className={`group hover:shadow-lg transition-all border-slate-200 hover:border-[#f2ae60]/50 cursor-pointer relative ${isSelected ? 'ring-2 ring-[#f2ae60] bg-orange-50/10' : ''}`} onClick={() => setSelectedResource(item)}>
                                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                                            <div className="flex gap-3 items-center">
                                                <button
                                                    onClick={(e) => toggleSelection(item.id, e)}
                                                    className="text-slate-300 hover:text-[#f2ae60] transition-colors z-10 p-1"
                                                    title="Seleccionar para paquete"
                                                >
                                                    {isSelected ? <CheckSquare className="w-5 h-5 text-[#f2ae60]" /> : <Square className="w-5 h-5" />}
                                                </button>
                                                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-[#f2ae60]/10 transition-colors">
                                                    {getIcon(item.tipo)}
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] font-bold text-slate-500 bg-slate-100 uppercase tracking-wider border border-slate-100">
                                                {formatDate(item.created_at)}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2 mb-3">
                                                <Badge variant="outline" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    {item.tipo}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg font-bold text-[#1a2e3b] leading-tight mb-2 line-clamp-2 group-hover:text-[#2b546e] transition-colors">
                                                {item.titulo}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <GraduationCap className="w-3 h-3" />
                                                <span>{item.asignatura || "General"}</span>
                                                <span className="text-slate-300">•</span>
                                                <span>{item.nivel || "Sin nivel"}</span>
                                            </div>
                                        </CardContent>
                                        {/* Botones Directos en la Tarjeta */}
                                        <div className="px-6 pb-6 pt-0 mt-auto flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs font-bold text-slate-600 hover:text-[#1a2e3b] hover:border-[#1a2e3b]"
                                                onClick={(e: any) => handleDownload(item, e)}
                                            >
                                                <Download className="w-3 h-3 mr-2" /> DOCX
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`flex-1 text-xs font-bold ${item.is_public ? 'text-teal-600 bg-teal-50 hover:bg-teal-100' : 'text-slate-400 hover:text-[#f2ae60] hover:bg-orange-50'}`}
                                                onClick={(e: any) => handlePublish(item, e)}
                                            >
                                                {item.is_public ? <><Globe className="w-3 h-3 mr-2" /> Público</> : <><Share2 className="w-3 h-3 mr-2" /> Publicar</>}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={(e: any) => handleDelete(item.id, e)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* BARRA FLOTANTE DE PAQUETE DIDÁCTICO */}
                {selectedForPackage.size > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1a2e3b] px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 border border-slate-700 print:hidden">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#f2ae60] text-white w-8 h-8 rounded-full flex items-center justify-center font-black">
                                {selectedForPackage.size}
                            </div>
                            <span className="text-white font-medium text-sm hidden sm:inline">documentos seleccionados</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full text-xs"
                                onClick={() => setSelectedForPackage(new Set())}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleCreatePackage}
                                disabled={generatingPackage}
                                className="bg-[#f2ae60] hover:bg-[#d99a50] text-white rounded-full font-bold shadow-lg"
                            >
                                {generatingPackage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando...</> : <><Download className="w-4 h-4 mr-2" /> Crear Paquete DOCX</>}
                            </Button>
                        </div>
                    </div>
                )}

                {/* MODAL DE VISTA PREVIA (VISOR) */}
                <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
                        <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
                            <div className="flex gap-2 mb-3">
                                <Badge className="bg-[#2b546e] hover:bg-[#2b546e]">{selectedResource?.tipo}</Badge>
                                <Badge variant="outline" className="text-slate-500 border-slate-300">{selectedResource?.asignatura}</Badge>
                            </div>
                            <DialogTitle className="text-xl font-extrabold text-[#1a2e3b] leading-snug">
                                {selectedResource?.titulo}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedResource?.nivel} • Creado el {formatDate(selectedResource?.created_at || "")}
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="flex-1 p-6 bg-white">
                            <div className="prose prose-sm max-w-none text-slate-600">
                                {selectedResource && <VisorDeRecursos data={selectedResource.contenido} />}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-slate-50 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 w-full">
                            <Button variant="outline" className="w-full sm:w-auto text-slate-700 font-bold border-slate-300 hover:bg-slate-100" onClick={() => setSelectedResource(null)}>Cerrar</Button>
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto justify-end">
                                {selectedResource && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const typeToUrl: Record<string, string> = {
                                                "PLANIFICACION": "/planificador",
                                                "RUBRICA": "/rubricas",
                                                "EVALUACION": "/evaluaciones",
                                                "AUDITORIA": "/analizador",
                                                "ESTRATEGIA": "/nee",
                                                "ELEVADOR": "/elevador",
                                                "LECTURA": "/lectura-inteligente"
                                            };
                                            const url = typeToUrl[selectedResource.tipo];
                                            if (url) {
                                                window.location.href = `${url}?loadId=${selectedResource.id}`;
                                            } else {
                                                toast.error("Editor no disponible para este tipo de recurso.");
                                            }
                                        }}
                                        className="border-[#2b546e] text-[#2b546e] hover:bg-slate-50 font-bold w-full sm:w-auto"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" /> Abrir en Editor
                                    </Button>
                                )}
                                <Button
                                    onClick={() => selectedResource && handleDownload(selectedResource)}
                                    disabled={downloading}
                                    className="bg-[#1a2e3b] text-white hover:bg-[#2b546e] w-full sm:w-auto"
                                >
                                    {downloading
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Descargando...</>
                                        : <><Download className="w-4 h-4 mr-2" /> Descargar DOCX</>}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}