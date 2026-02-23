'use client';

import * as React from "react";
import {
    Check, BookOpen, Sparkles, ChevronRight, Backpack, Plus, X,
    Edit3, Eye, Copy, ArrowLeft, BrainCircuit, Download, Target,
    TrendingUp, Repeat
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { trackEvent } from "@/lib/telemetry";

// Renderizado Markdown y LaTeX
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BotonGuardar } from "@/components/BotonGuardar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- TIPOS ---
type OA = { id: string; codigo: string; descripcion: string; asignatura: string; nivel: string; };

type ClaseGenerada = {
    numero_clase: number;
    foco_pedagogico: string;
    contenido_editable: { inicio: string; desarrollo: string; cierre: string; };
    recurso_practica?: string;
    ticket_salida?: string;
    rubrica_tabla: { criterio: string; niveles: { insuficiente: string; elemental: string; adecuado: string; }; };
};

type ResultadoEstrategia = {
    titulo_unidad_creativo: string;
    estrategia_aprendizaje_sentencia: string;
    planificacion_clases: ClaseGenerada[];
};

type DUAConcept = {
    visual_espacial: string;
    kinestesica: string;
    focalizada: string;
};

// --- DATA PEI ---
const VALORES_ACTITUDES: Record<string, string[]> = {
    "Caridad": ["Abiertos", "Acogedores", "Empáticos", "Fraternos", "Solidarios", "Misericordiosos", "Bondadosos", "Serviciales"],
    "Fe": ["Orantes", "Esperanzados", "Fieles", "Confiados", "Testimoniales", "Coherentes", "Pacientes"],
    "Verdad": ["Auténticos", "Autónomos", "Coherentes", "Honestos", "Responsables", "Sinceros", "Justos", "Leales"],
    "Alegría": ["Entusiastas", "Optimistas", "Gozosos", "Motivadores", "Positivos", "Cordiales", "Amables"],
    "Servicio": ["Disponibles", "Generosos", "Desinteresados", "Colaboradores", "Acompañantes", "Participativos"],
    "Libertad": ["Decididos", "Autocríticos", "Originales", "Independientes", "Creativos", "Reflexivos"],
    "Humildad": ["Sencillos", "Modestos", "Respetuosos", "Agradecidos", "Transparentes", "Serenos"],
    "Responsabilidad": ["Comprometidos", "Constantes", "Puntuales", "Rigurosos", "Eficientes", "Organizados"],
    "Respeto": ["Tolerantes", "Dialogantes", "Pacientes", "Cuidadosos", "Asertivos", "Escuchadores"]
};

const NIVELES = ["NT1", "NT2", "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio", "3° y 4° Medio"];

const MENSAJES_CARGA = [
    "Analizando el currículum nacional...",
    "Conectando objetivos con el sello valórico...",
    "Diseñando experiencias de aprendizaje profundo...",
    "Ajustando tiempos y recursos didácticos...",
    "Redactando indicadores de evaluación auténtica...",
    "Finalizando tu planificación estratégica..."
];

// --- COMPONENTES AUXILIARES ---
const LoadingOverlay = ({ mensaje }: { mensaje: string }) => (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-all duration-500">
        <div className="relative">
            <div className="absolute inset-0 bg-[#f2ae60] rounded-full blur-xl opacity-20 animate-pulse"></div>
            <BrainCircuit className="w-24 h-24 text-[#f2ae60] animate-bounce relative z-10" />
        </div>
        <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">Cerebro Digital Trabajando</h3>
        <p className="mt-2 text-lg text-slate-300 font-light animate-pulse text-center max-w-md">{mensaje}</p>
    </div>
);

const GPSPasos = ({ modo, claseIndex, totalClases }: { modo: string, claseIndex: number, totalClases: number }) => {
    const pasos = [{ id: 1, label: "Expectación" }, { id: 2, label: "Activación" }, { id: 3, label: "Modelamiento" }, { id: 4, label: "Práctica G." }, { id: 5, label: "Práctica I." }, { id: 6, label: "Feedback" }, { id: 7, label: "Cierre" }];
    const checkActive = (pasoId: number) => {
        if (modo === "Ciclo Completo") return true;
        const progress = (claseIndex + 1) / totalClases;
        if (progress <= 0.33) return pasoId <= 2;
        if (progress <= 0.66) return pasoId >= 3 && pasoId <= 5;
        return pasoId >= 6;
    };
    return (
        <div className="w-full bg-white rounded-xl p-3 mb-6 border-2 border-slate-100 flex items-center justify-between gap-1 overflow-x-auto print:hidden shadow-sm">
            {pasos.map((p) => {
                const active = checkActive(p.id);
                return (
                    <div key={p.id} className="flex flex-col items-center gap-1.5 min-w-[70px] flex-1">
                        <div className={cn("w-full h-3 rounded-full transition-all duration-700 border", active ? "bg-[#f2ae60] border-[#d99a50]" : "bg-slate-100 border-slate-200")} />
                        <span className={cn("text-[9px] font-bold uppercase tracking-wide", active ? "text-[#1a2e3b]" : "text-slate-300")}>{p.label}</span>
                    </div>
                )
            })}
        </div>
    );
};

const EditableCard = ({ label, value, onChange, tag, icon: Icon, colorClass = "text-[#2b546e]", bgClass = "bg-slate-50" }: any) => {
    const [editMode, setEditMode] = React.useState(false);
    return (
        <Card className="h-full border-l-4 border-l-[#2b546e] shadow-sm hover:shadow-md transition-all flex flex-col group print:border print:shadow-none break-inside-avoid">
            <CardHeader className={cn("py-3 px-4 flex flex-col gap-2 border-b shrink-0 group-hover:bg-opacity-80 transition-colors print:bg-white print:border-b-0 print:pb-0", bgClass)}>
                <div className="flex w-full justify-between items-start">
                    <CardTitle className={cn("text-sm font-bold uppercase tracking-wide flex items-center gap-2", colorClass)}>{Icon && <Icon className="w-4 h-4" />}{label}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)} className="h-6 text-[10px] text-slate-400 hover:text-[#2b546e] print:hidden">{editMode ? <Eye className="w-3 h-3 mr-1" /> : <Edit3 className="w-3 h-3 mr-1" />}{editMode ? "Ver" : "Editar"}</Button>
                </div>
                {tag && <Badge variant="secondary" className="text-[10px] h-auto w-fit bg-white border border-slate-200 text-slate-500 font-medium px-2 py-0.5">{tag}</Badge>}
            </CardHeader>
            <CardContent className="p-4 flex-1 print:p-2">
                {editMode ? (
                    <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="h-full min-h-[150px] text-sm leading-relaxed resize-none bg-white border-slate-200 focus:ring-[#f2ae60]" />
                ) : (
                    <div className="prose prose-sm max-w-none text-slate-700 text-sm leading-relaxed font-sans"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{value}</ReactMarkdown></div>
                )}
            </CardContent>
        </Card>
    );
};

export default function PlanificadorWizard() {
    const [userProfile, setUserProfile] = React.useState<any>(null); // <--- NUEVO STATE
    const [verificando, setVerificando] = React.useState(true); // <--- RESTAURADO

    React.useEffect(() => {
        const validarSesion = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = "/";
            } else {
                // Fetch User Profile
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.user_metadata) {
                    setUserProfile(user.user_metadata);
                    console.log("👤 Perfil cargado para contexto:", user.user_metadata.full_name);
                }
                setVerificando(false);
            }
        };
        validarSesion();
        trackEvent({ eventName: 'page_view', module: 'planificador' });
    }, []);

    const [step, setStep] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [downloading, setDownloading] = React.useState(false);
    const [mensajeCarga, setMensajeCarga] = React.useState(MENSAJES_CARGA[0]);

    // Estados de Datos
    const [nivel, setNivel] = React.useState("");
    const [asignaturaActiva, setAsignaturaActiva] = React.useState("");
    const [asignaturasDisponibles, setAsignaturasDisponibles] = React.useState<string[]>([]);
    const [oasDb, setOasDb] = React.useState<OA[]>([]);
    const [mochila, setMochila] = React.useState<OA[]>([]);
    const [busquedaOA, setBusquedaOA] = React.useState("");

    // ESTADOS PARA OBJETIVO MANUAL
    const [oaManualText, setOaManualText] = React.useState("");
    const [isOaManualOpen, setIsOaManualOpen] = React.useState(false);

    const [valorSeleccionado, setValorSeleccionado] = React.useState("");
    const [actitudesSeleccionadas, setActitudesSeleccionadas] = React.useState<string[]>([]);
    const [medioDidactico, setMedioDidactico] = React.useState("");
    const [numClases, setNumClases] = React.useState([2]);
    const [modoDistribucion, setModoDistribucion] = React.useState<"Ciclo Completo" | "Progresivo">("Ciclo Completo");
    const [resultado, setResultado] = React.useState<ResultadoEstrategia | null>(null);

    // --- ESTADOS DUA ---
    const [showDUAModal, setShowDUAModal] = React.useState(false);
    const [duaContexto, setDuaContexto] = React.useState("");
    const [duaResult, setDuaResult] = React.useState<DUAConcept | null>(null);
    const [loadingDUA, setLoadingDUA] = React.useState(false);

    const [isDirty, setIsDirty] = React.useState(false);

    // --- EFECTOS ---
    React.useEffect(() => {
        if (resultado) setIsDirty(true);
    }, [resultado]);

    React.useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    React.useEffect(() => {
        if (loading) { let i = 0; const interval = setInterval(() => { i = (i + 1) % MENSAJES_CARGA.length; setMensajeCarga(MENSAJES_CARGA[i]); }, 3000); return () => clearInterval(interval); }
    }, [loading]);

    React.useEffect(() => {
        if (!nivel) return;
        const fetchAsignaturas = async () => {
            const { data } = await supabase.from('curriculum_oas').select('asignatura').eq('nivel', nivel);
            if (data) { const unique = Array.from(new Set(data.map(d => d.asignatura))).sort(); setAsignaturasDisponibles(unique); if (!asignaturaActiva) setAsignaturaActiva(unique[0]); }
        };
        fetchAsignaturas();
    }, [nivel]);

    React.useEffect(() => {
        if (!nivel || !asignaturaActiva) return;
        const fetchOAs = async () => { const { data } = await supabase.from('curriculum_oas').select('*').eq('nivel', nivel).eq('asignatura', asignaturaActiva); if (data) setOasDb(data.map(d => ({ ...d, id: d.id.toString() }))); };
        fetchOAs();
    }, [nivel, asignaturaActiva]);

    // --- ACCIONES ---
    const toggleMochila = (oa: OA) => { const existe = mochila.find(m => m.id === oa.id); if (existe) setMochila(mochila.filter(m => m.id !== oa.id)); else setMochila([...mochila, oa]); };
    const toggleActitud = (actitud: string) => { if (actitudesSeleccionadas.includes(actitud)) { setActitudesSeleccionadas(actitudesSeleccionadas.filter(a => a !== actitud)); } else if (actitudesSeleccionadas.length < 4) { setActitudesSeleccionadas([...actitudesSeleccionadas, actitud]); } };

    // FUNCIÓN AGREGAR OA MANUAL
    const addOaManual = () => { if (!oaManualText.trim()) return; const nuevoOA = { id: `m-${Date.now()}`, codigo: "PERSONALIZADO", descripcion: oaManualText, asignatura: asignaturaActiva, nivel }; setMochila([...mochila, nuevoOA]); setOaManualText(""); setIsOaManualOpen(false); };

    // FUNCIÓN PARA AGREGAR ASIGNATURA MANUAL
    const handleNuevaAsignatura = () => {
        const nueva = prompt("Escribe el nombre de la asignatura manual:");
        if (nueva && nueva.trim() !== "") {
            setAsignaturasDisponibles([...asignaturasDisponibles, nueva]);
            setAsignaturaActiva(nueva);
        }
    };

    const handleGenerar = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/generate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nivel,
                    asignatura: Array.from(new Set(mochila.map(m => m.asignatura))).join(" + "),
                    oas_mochila: mochila.map(oa => `[${oa.asignatura}] ${oa.codigo}: ${oa.descripcion}`),
                    valor_panel: valorSeleccionado,
                    actitud_especifica: actitudesSeleccionadas.join(", "),
                    medio_usuario: medioDidactico,
                    num_clases: numClases[0],
                    modo_distribucion: modoDistribucion,
                    perfil_usuario: userProfile // <--- DATA ENVIADA
                })
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Error Backend:", text);
                throw new Error(`Error del servidor: ${res.statusText}`);
            }

            const data = await res.json();

            if (data.error) {
                alert(`Error IA: ${data.error}`);
                console.error("Error IA:", data.error);
                return;
            }

            if (data.result) {
                setResultado(data.result);
                setStep(4);

                // Telemetry: Generation Success
                trackEvent({
                    eventName: 'generation_success',
                    module: 'planificador',
                    metadata: {
                        nivel,
                        asignatura: asignaturaActiva,
                        clases_count: numClases[0]
                    }
                });

                setTimeout(() => { confetti({ particleCount: 180, spread: 100, origin: { y: 0.6 } }); }, 500);
            } else {
                alert("Respuesta vacía del servidor.");
            }

        } catch (e: any) {
            console.error(e);
            alert(`Error de conexión: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- GENERAR DUA ---
    const handleGenerarDUA = async () => {
        if (!duaContexto.trim() || !resultado) return;
        setLoadingDUA(true);
        try {
            // Unimos el inicio/desarrollo de la primera clase como contexto
            const planTexto = resultado.planificacion_clases.map(c => `Clase ${c.numero_clase}: ${c.contenido_editable.inicio} | ${c.contenido_editable.desarrollo}`).join("\n");

            const res = await fetch(`${API_URL}/nee/generate-dua`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planificacion_original: planTexto, contexto_estudiante: duaContexto })
            });
            const data = await res.json();
            setDuaResult(data);
            setShowDUAModal(false);
        } catch (e) { console.error(e); alert("Error generando DUA"); } finally { setLoadingDUA(false); }
    };

    // --- EXPORTACIÓN WORD ---
    const handleDownloadDocx = async () => {
        if (!resultado) return;
        setDownloading(true);
        try {
            const payload = {
                titulo_unidad: resultado.titulo_unidad_creativo,
                estrategia: resultado.estrategia_aprendizaje_sentencia,
                nivel: nivel,
                asignatura: asignaturaActiva,
                oas: mochila.map(m => `${m.codigo}: ${m.descripcion}`),
                clases: resultado.planificacion_clases
            };

            const response = await fetch(`${API_URL}/export/planificacion-docx`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Planificacion_${nivel}.docx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Error generando el archivo");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión");
        } finally {
            setDownloading(false);
        }
    };

    const handleCopyAll = () => {
        if (!resultado) return;
        const htmlContent = `<div style="font-family: Arial;"><h1>${resultado.titulo_unidad_creativo}</h1><hr/>${resultado.planificacion_clases.map(c => `<h2>Clase ${c.numero_clase}</h2><p>${c.contenido_editable.inicio}</p>`).join('')}</div>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(() => alert("Copiado al portapapeles"));
    };

    const getStepClassName = (s: number) => {
        if (step === s) return "bg-[#f2ae60] w-8";
        if (step > s) return "bg-[#2b546e] w-4";
        return "bg-slate-200 w-2";
    };

    // Si estamos verificando la sesión, mostramos el cerebro cargando
    if (verificando) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
                <BrainCircuit className="w-12 h-12 text-[#f2ae60] animate-bounce" />
                <p className="text-[#2b546e] font-bold animate-pulse">Verificando credenciales...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1a2e3b] print:bg-white text-base">
            {loading && <LoadingOverlay mensaje={mensajeCarga} />}

            <header className="bg-white border-b sticky top-0 z-50 shadow-sm/50 backdrop-blur-md bg-white/90 print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="rounded-md w-10 h-10 object-contain"
                        />
                        <div><h1 className="text-xl font-bold text-[#2b546e] leading-none">ProfeIC <span className="text-[#f2ae60]">Planificador</span></h1></div>
                    </div>
                    <div className="flex gap-2">{[1, 2, 3, 4].map(s => <div key={s} className={cn("h-2 rounded-full transition-all", getStepClassName(s))} />)}</div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 flex gap-8 items-start relative print:block print:w-full print:max-w-none print:p-0">
                <div className="flex-1 min-w-0 print:w-full">
                    {step === 1 && <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in py-10"><h2 className="text-3xl font-extrabold text-[#2b546e] text-center">Nivel Educativo</h2><Card className="border-none shadow-xl"><CardContent className="p-8 grid grid-cols-3 md:grid-cols-4 gap-4">{NIVELES.map(n => <button key={n} onClick={() => setNivel(n)} className={cn("p-4 rounded-xl text-base font-bold border transition-all hover:scale-105", nivel === n ? "bg-[#2b546e] text-white" : "bg-white hover:border-[#f2ae60]")}>{n}</button>)}</CardContent><CardFooter className="bg-slate-50 justify-end p-6"><Button disabled={!nivel} onClick={() => setStep(2)} className="bg-[#2b546e] text-white px-8 py-6 text-lg">Comenzar <ChevronRight className="ml-2 w-5 h-5" /></Button></CardFooter></Card></div>}

                    {step === 2 && <div className="space-y-6 animate-in slide-in-from-right-8"><div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><Button variant="ghost" onClick={() => setStep(1)} className="-ml-4 text-slate-400 hover:text-[#2b546e]"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</Button><h2 className="text-3xl font-bold text-[#2b546e]">Objetivos</h2></div><Input placeholder="Buscar clave..." value={busquedaOA} onChange={e => setBusquedaOA(e.target.value)} className="w-full md:w-80 bg-white shadow-sm border-slate-200" /></div>

                        {/* --- LISTA DE ASIGNATURAS CON BOTÓN 'OTRA' --- */}
                        <ScrollArea className="w-full whitespace-nowrap pb-4">
                            <div className="flex space-x-2">
                                {asignaturasDisponibles.map(a => (
                                    <button key={a} onClick={() => setAsignaturaActiva(a)} className={cn("px-5 py-2.5 rounded-full text-sm font-bold border shadow-sm transition-all", asignaturaActiva === a ? "bg-[#2b546e] text-white border-[#2b546e]" : "bg-white text-slate-600 hover:bg-slate-50")}>
                                        {a}
                                    </button>
                                ))}
                                <button onClick={handleNuevaAsignatura} className="px-5 py-2.5 rounded-full text-sm font-bold border border-dashed border-[#f2ae60] text-[#f2ae60] hover:bg-orange-50 transition-all flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Otra
                                </button>
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        <div className="w-full max-w-[calc(100vw-400px)] rounded-2xl border bg-slate-100/50 p-8 shadow-inner"><ScrollArea className="w-full whitespace-nowrap"><div className="flex w-max space-x-6 pb-4"><div onClick={() => setIsOaManualOpen(true)} className="w-[320px] h-[340px] rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-[#f2ae60] hover:scale-[1.01] transition-all group"><div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-[#f2ae60] group-hover:text-white transition-colors"><Plus className="w-8 h-8 text-slate-400 group-hover:text-white" /></div><span className="font-bold text-slate-500 group-hover:text-[#2b546e]">Crear Objetivo Manual</span></div>{oasDb.filter(oa => oa.descripcion.toLowerCase().includes(busquedaOA.toLowerCase())).map(oa => { const isSelected = mochila.some(m => m.id === oa.id); return <div key={oa.id} onClick={() => toggleMochila(oa)} className={cn("w-[320px] h-[340px] rounded-xl border bg-white p-6 cursor-pointer whitespace-normal flex flex-col relative hover:shadow-xl transition-all", isSelected ? "ring-4 ring-[#f2ae60] border-[#f2ae60]" : "hover:border-[#2b546e]")}><div className="flex justify-between mb-3"><Badge variant="outline" className="text-[#2b546e] border-[#2b546e]">{oa.codigo}</Badge> {isSelected && <div className="bg-[#f2ae60] rounded-full p-1"><Check className="text-white w-4 h-4" /></div>}</div><p className="text-sm text-slate-600 overflow-y-auto max-h-[220px] custom-scrollbar leading-relaxed">{oa.descripcion}</p><div className="mt-auto pt-4 border-t text-xs font-bold uppercase text-slate-400 tracking-wide">{oa.asignatura}</div></div> })}</div><ScrollBar orientation="horizontal" /></ScrollArea></div></div>}

                    {step === 3 && <div className="space-y-8 animate-in slide-in-from-right-8 pb-20 max-w-5xl mx-auto"><Button variant="ghost" onClick={() => setStep(2)} className="-ml-4 text-slate-400 hover:text-[#2b546e]"><ArrowLeft className="w-4 h-4 mr-1" /> Volver</Button><div><h2 className="text-3xl font-bold text-[#2b546e]">Estrategia</h2></div><Card className="border shadow-sm"><CardHeader className="bg-slate-50 border-b"><CardTitle>1. Sello Formativo</CardTitle></CardHeader><CardContent className="p-8 space-y-6"><div className="grid grid-cols-3 md:grid-cols-5 gap-3">{Object.keys(VALORES_ACTITUDES).map(v => <button key={v} onClick={() => { setValorSeleccionado(v); setActitudesSeleccionadas([]); }} className={cn("px-4 py-3 rounded-xl text-sm font-bold border transition-all hover:shadow-md", valorSeleccionado === v ? "bg-[#2b546e] text-white shadow-lg" : "bg-white text-slate-600 hover:border-[#2b546e]")}>{v}</button>)}</div>{valorSeleccionado && <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 animate-in fade-in"><p className="text-sm font-bold text-[#2b546e] mb-3 uppercase tracking-wider flex items-center gap-2"><Target className="w-4 h-4" /> Actitudes:</p><div className="flex flex-wrap gap-3">{VALORES_ACTITUDES[valorSeleccionado].map(act => <button key={act} onClick={() => toggleActitud(act)} className={cn("px-4 py-2 rounded-full text-sm font-medium border transition-all", actitudesSeleccionadas.includes(act) ? "bg-[#f2ae60] text-white border-[#f2ae60] shadow-sm scale-105" : "bg-white text-slate-600 border-slate-200 hover:border-[#2b546e]")}>{act}</button>)}</div></div>}</CardContent></Card><div className="grid md:grid-cols-2 gap-8"><Card><CardHeader><CardTitle>2. Medio Didáctico</CardTitle></CardHeader><CardContent><Input placeholder="Ej: Debate, Maqueta" value={medioDidactico} onChange={e => setMedioDidactico(e.target.value)} className="h-12 text-lg" /></CardContent></Card><Card><CardHeader><CardTitle>3. Clases: {numClases}</CardTitle></CardHeader><CardContent><Slider value={numClases} onValueChange={setNumClases} max={8} min={1} step={1} className="py-4" /></CardContent></Card></div><Card><CardHeader><CardTitle>4. Distribución</CardTitle></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"><div onClick={() => setModoDistribucion("Ciclo Completo")} className={cn("p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg flex items-center gap-4", modoDistribucion === "Ciclo Completo" ? "border-[#2b546e] bg-blue-50/50" : "border-slate-100 bg-white")}><div className="bg-[#2b546e] text-white p-3 rounded-full"><Repeat className="w-6 h-6" /></div><div><h3 className="font-bold text-lg text-[#2b546e]">Ciclo Completo</h3><p className="text-sm text-slate-500">7 pasos por clase.</p></div></div><div onClick={() => setModoDistribucion("Progresivo")} className={cn("p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg flex items-center gap-4", modoDistribucion === "Progresivo" ? "border-[#2b546e] bg-blue-50/50" : "border-slate-100 bg-white")}><div className="bg-[#2b546e] text-white p-3 rounded-full"><TrendingUp className="w-6 h-6" /></div><div><h3 className="font-bold text-lg text-[#2b546e]">Progresivo</h3><p className="text-sm text-slate-500">Pasos en la unidad.</p></div></div></CardContent></Card><Button onClick={handleGenerar} disabled={loading || actitudesSeleccionadas.length === 0} className="w-full h-20 text-xl bg-[#f2ae60] hover:bg-[#d99a50] text-white font-bold shadow-xl rounded-xl transition-transform active:scale-[0.99]">{loading ? "Procesando..." : "✨ Generar Planificación Inteligente"}</Button></div>}
                </div>

                {(step === 2 || step === 3) && <div className="hidden lg:block w-[350px] shrink-0 print:hidden"><div className="sticky top-28"><Card className="border-t-4 border-t-[#f2ae60] shadow-2xl"><CardHeader className="bg-slate-50 border-b"><CardTitle className="flex gap-2 items-center text-[#2b546e]"><Backpack className="text-[#f2ae60] w-5 h-5" /> Tu Mochila <Badge className="bg-[#2b546e]">{mochila.length}</Badge></CardTitle></CardHeader><CardContent className="p-0"><ScrollArea className="h-[calc(100vh-300px)] px-4 py-4">{mochila.map(m => <div key={m.id} className="bg-white p-4 rounded-lg border mb-3 relative group shadow-sm hover:shadow-md transition-all"><button onClick={() => toggleMochila(m)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 border text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 shadow-sm transition-opacity"><X className="w-4 h-4" /></button><Badge variant="outline" className="mb-2 text-[10px] text-[#2b546e] border-[#2b546e]">{m.codigo}</Badge><p className="text-sm text-slate-700 line-clamp-3 leading-snug">{m.descripcion}</p></div>)}</ScrollArea></CardContent><CardFooter className="bg-slate-50 p-4">{step === 2 ? <Button onClick={() => setStep(3)} disabled={mochila.length === 0} className="w-full bg-[#2b546e] text-white font-bold h-12 text-base">Configurar Estrategia</Button> : <Button variant="outline" onClick={() => setStep(2)} className="w-full h-12 text-slate-600 font-bold border-2">Agregar más OAs</Button>}</CardFooter></Card></div></div>}

                {/* PASO 4: RESULTADOS */}
                {step === 4 && resultado && (
                    <div className="w-full max-w-6xl mx-auto animate-in fade-in pb-20 print:max-w-none">
                        <div className="sticky top-24 z-40 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white/90 backdrop-blur p-4 rounded-2xl border shadow-lg print:hidden">
                            <Button variant="ghost" onClick={() => setStep(3)} className="text-slate-500 hover:text-[#2b546e] w-full sm:w-auto justify-start"><ArrowLeft className="w-4 h-4 mr-2" /> Editar Configuración</Button>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <BotonGuardar
                                    tipo="PLANIFICACION"
                                    titulo={resultado.titulo_unidad_creativo}
                                    asignatura={asignaturaActiva}
                                    nivel={nivel}
                                    contenido={{ ...resultado, nivel, asignaturaActiva }}
                                />
                                <Button onClick={handleDownloadDocx} disabled={downloading} className="bg-[#2b546e] text-white hover:bg-[#1a2e3b]">
                                    {downloading ? "Generando..." : <><Download className="w-4 h-4 mr-2" /> Descargar Word</>}
                                </Button>

                                {/* BOTÓN DUA */}
                                <Button onClick={() => setShowDUAModal(true)} className="bg-white text-[#f2ae60] border border-[#f2ae60] hover:bg-orange-50 font-bold">
                                    <Sparkles className="w-4 h-4 mr-2" /> Generar Adecuación DUA
                                </Button>
                            </div>
                        </div>

                        {/* RESULTADO DUA (SI EXISTE) */}
                        {duaResult && (
                            <div className="mb-10 bg-white border-2 border-[#f2ae60]/30 rounded-2xl p-6 shadow-xl relative overflow-hidden animate-in slide-in-from-top-10">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#f2ae60]"></div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl text-[#2b546e] flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-[#f2ae60]" /> Adecuaciones Curriculares (DUA)
                                    </h3>
                                    <Badge variant="outline" className="border-[#f2ae60] text-[#f2ae60] bg-orange-50">Perfil: {duaContexto.substring(0, 30)}...</Badge>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <Card className="bg-blue-50/50 border-blue-100 hover:shadow-md transition-all">
                                        <CardHeader><CardTitle className="text-blue-700 text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> Visual / Espacial</CardTitle></CardHeader>
                                        <CardContent><p className="text-sm text-slate-700">{duaResult.visual_espacial}</p></CardContent>
                                    </Card>
                                    <Card className="bg-green-50/50 border-green-100 hover:shadow-md transition-all">
                                        <CardHeader><CardTitle className="text-green-700 text-sm flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-green-600"></div> Kinestésica</CardTitle></CardHeader>
                                        <CardContent><p className="text-sm text-slate-700">{duaResult.kinestesica}</p></CardContent>
                                    </Card>
                                    <Card className="bg-purple-50/50 border-purple-100 hover:shadow-md transition-all">
                                        <CardHeader><CardTitle className="text-purple-700 text-sm flex items-center gap-2"><Target className="w-4 h-4" /> Focalizada</CardTitle></CardHeader>
                                        <CardContent><p className="text-sm text-slate-700">{duaResult.focalizada}</p></CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-10 relative overflow-hidden print:border-0 print:shadow-none print:p-0">
                            <div className="absolute left-0 top-0 h-full w-3 bg-[#f2ae60] print:hidden"></div>
                            <div className="pl-6">
                                <div className="flex flex-wrap gap-2 mb-4 print:hidden"><Badge className="bg-[#2b546e] text-white px-3 py-1 text-xs">{valorSeleccionado}</Badge><Badge variant="secondary" className="bg-slate-100 text-slate-600 px-3 py-1">{numClases} Clases</Badge></div>
                                <h1 className="text-4xl font-extrabold text-[#1a2e3b] mb-6 leading-tight print:text-3xl">{resultado.titulo_unidad_creativo}</h1>
                                <div className="bg-blue-50 border-blue-100 rounded-xl p-2 print:bg-transparent print:border-0 print:p-0"><EditableCard label="Estrategia Socio-Cognitiva" value={resultado.estrategia_aprendizaje_sentencia} onChange={(v: string) => { const r = { ...resultado }; r.estrategia_aprendizaje_sentencia = v; setResultado(r) }} icon={Sparkles} colorClass="text-blue-700" bgClass="bg-blue-50" /></div>
                            </div>
                        </div>

                        <Tabs defaultValue="clase-1" className="w-full print:block">
                            <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b p-0 h-auto gap-2 mb-10 print:hidden">{resultado.planificacion_clases.map((clase) => <TabsTrigger key={clase.numero_clase} value={`clase-${clase.numero_clase}`} className="px-8 py-4 rounded-t-xl border-b-4 border-transparent data-[state=active]:border-[#f2ae60] bg-slate-100 font-bold text-slate-500 data-[state=active]:text-[#2b546e] data-[state=active]:bg-white transition-all text-base">Clase {clase.numero_clase}</TabsTrigger>)}</TabsList>
                            {resultado.planificacion_clases.map((clase, index) => (
                                <TabsContent key={clase.numero_clase} value={`clase-${clase.numero_clase}`} className="space-y-10 print:block print:mb-16 print:break-inside-avoid">
                                    <div className="hidden print:block border-b-2 border-[#2b546e] mb-6 pb-2"><h2 className="text-2xl font-bold">Clase {clase.numero_clase}</h2></div>
                                    <GPSPasos modo={modoDistribucion} claseIndex={index} totalClases={numClases[0]} />
                                    <div className="flex items-center gap-3 text-base text-slate-600 bg-white px-6 py-3 rounded-full border shadow-sm w-fit mx-auto print:hidden"><Target className="w-5 h-5 text-[#f2ae60]" /> <span className="font-bold text-[#2b546e]">Foco Pedagógico:</span> {clase.foco_pedagogico}</div>
                                    <div className="grid lg:grid-cols-3 gap-8 print:block print:space-y-6"><EditableCard label="Inicio" tag="Expectación / Activación" value={clase.contenido_editable.inicio} onChange={(v: string) => { const r = { ...resultado }; r.planificacion_clases[index].contenido_editable.inicio = v; setResultado(r) }} /><EditableCard label="Desarrollo" tag="Modelamiento / Práctica" value={clase.contenido_editable.desarrollo} onChange={(v: string) => { const r = { ...resultado }; r.planificacion_clases[index].contenido_editable.desarrollo = v; setResultado(r) }} /><EditableCard label="Cierre" tag="Metacognición" value={clase.contenido_editable.cierre} onChange={(v: string) => { const r = { ...resultado }; r.planificacion_clases[index].contenido_editable.cierre = v; setResultado(r) }} /></div>
                                    <div className="grid md:grid-cols-2 gap-8 print:block print:space-y-6"><div className="bg-amber-50/40 rounded-xl border-2 border-dashed border-amber-200 p-1"><EditableCard label="Recurso Práctico" value={clase.recurso_practica || "..."} onChange={(v: string) => { const r = { ...resultado }; r.planificacion_clases[index].recurso_practica = v; setResultado(r) }} icon={BookOpen} colorClass="text-amber-700" bgClass="bg-amber-50" /></div><div className="bg-emerald-50/40 rounded-xl border-2 border-dashed border-emerald-200 p-1"><EditableCard label="Ticket de Salida" value={clase.ticket_salida || "..."} onChange={(v: string) => { const r = { ...resultado }; r.planificacion_clases[index].ticket_salida = v; setResultado(r) }} icon={Check} colorClass="text-emerald-700" bgClass="bg-emerald-50" /></div></div>
                                    <div className="border rounded-xl overflow-x-auto overflow-hidden shadow-sm print:border-gray-300 break-inside-avoid"><div className="bg-slate-100 px-6 py-4 border-b print:bg-gray-100"><h3 className="font-bold text-[#1a2e3b] text-base uppercase flex items-center gap-2"><Target className="w-4 h-4" /> Rúbrica de Evaluación</h3></div><Table className="min-w-[700px]"><TableHeader><TableRow><TableHead className="w-[20%] text-slate-700 font-bold">Criterio</TableHead><TableHead className="w-[26%] text-red-700 font-bold bg-red-50">Insuficiente</TableHead><TableHead className="w-[27%] text-yellow-700 font-bold bg-yellow-50">Elemental</TableHead><TableHead className="w-[27%] text-green-700 font-bold bg-green-50">Adecuado</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell className="font-bold text-sm align-top py-4 text-slate-700 bg-white min-w-[150px]">{clase.rubrica_tabla.criterio}</TableCell><TableCell className="text-sm text-slate-700 bg-red-100/50 p-4 align-top border-l border-red-200 print:bg-transparent min-w-[200px]">{clase.rubrica_tabla.niveles.insuficiente}</TableCell><TableCell className="text-sm text-slate-700 bg-yellow-100/50 p-4 align-top border-l border-yellow-200 print:bg-transparent min-w-[200px]">{clase.rubrica_tabla.niveles.elemental}</TableCell><TableCell className="text-sm text-slate-700 bg-green-100/50 p-4 align-top border-l border-green-200 print:bg-transparent min-w-[200px]">{clase.rubrica_tabla.niveles.adecuado}</TableCell></TableRow></TableBody></Table></div>
                                    <div className="print:block hidden h-12 border-b print:border-transparent"></div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                )}


                {/* MODAL PARA OBJETIVO MANUAL */}
                {
                    isOaManualOpen && (
                        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-[#2b546e] flex items-center gap-2">
                                        <Edit3 className="w-5 h-5" /> Objetivo Personalizado
                                    </h3>
                                    <button onClick={() => setIsOaManualOpen(false)} className="text-slate-400 hover:text-red-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-slate-500 mb-3">
                                        Redacta el objetivo específico para <strong>{asignaturaActiva}</strong>. La IA usará esto como base.
                                    </p>
                                    <Textarea
                                        value={oaManualText}
                                        onChange={(e) => setOaManualText(e.target.value)}
                                        placeholder="Ej: Comprender la importancia de la flora nativa del Biobío..."
                                        className="min-h-[120px] text-base mb-4 border-slate-300 focus:border-[#f2ae60]"
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button variant="outline" onClick={() => setIsOaManualOpen(false)}>Cancelar</Button>
                                        <Button onClick={addOaManual} disabled={!oaManualText.trim()} className="bg-[#2b546e] text-white hover:bg-[#1a2e3b]">
                                            <Plus className="w-4 h-4 mr-2" /> Agregar a Mochila
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* MODAL DUA INPUT */}
                {
                    showDUAModal && (
                        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                                <div className="bg-[#f2ae60] px-6 py-4 flex justify-between items-center text-white">
                                    <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="w-5 h-5" /> Generar Adecuación DUA</h3>
                                    <button onClick={() => setShowDUAModal(false)}><X className="w-5 h-5 hover:scale-110 transition-transform" /></button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-slate-600 mb-4 font-medium">Describe las barreras o diagnóstico del estudiante para adaptar esta planificación:</p>
                                    <Textarea
                                        value={duaContexto}
                                        onChange={(e) => setDuaContexto(e.target.value)}
                                        placeholder="Ej: Estudiante con TEA que se abruma con instrucciones verbales largas. Prefiere esquemas..."
                                        className="min-h-[120px] mb-6 focus:border-[#f2ae60] text-base"
                                    />
                                    <Button onClick={handleGenerarDUA} disabled={loadingDUA || !duaContexto} className="w-full bg-[#2b546e] hover:bg-[#1a2e3b] text-white font-bold h-12">
                                        {loadingDUA ? "Analizando Barreras..." : "Generar Estrategias Inclusivas"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
}