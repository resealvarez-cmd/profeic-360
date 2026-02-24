"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    BrainCircuit, Search, FileText, CheckCircle2, Sparkles, Copy,
    Microscope, ChevronRight, ChevronLeft, AlertOctagon, Info,
    ListChecks, AlertTriangle, Lightbulb, Check, Activity,
    PanelLeftClose, PanelLeftOpen, PieChart as PieIcon,
    ArrowRight, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/telemetry";

// --- IMPORTACIÓN ÚNICA DEL BOTÓN ---
import { BotonGuardar } from "@/components/BotonGuardar";

// --- COLORES ---
const COLORS = ["#94a3b8", "#60a5fa", "#2b546e", "#f2ae60"];

// --- VELO DE CARGA ---
const LoadingOverlay = ({ mensaje }: { mensaje: string }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#f2ae60] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <BrainCircuit className="w-24 h-24 text-[#f2ae60] animate-bounce relative z-10" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">Procesando...</h3>
            <p className="text-slate-400 font-light animate-pulse">{mensaje}</p>
        </div>, document.body
    );
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AnalizadorPage() {
    const [objetivo, setObjetivo] = useState("");
    const [instrumento, setInstrumento] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [verSoloCriticos, setVerSoloCriticos] = useState(true);
    const [textoEditado, setTextoEditado] = useState("");
    const [copiado, setCopiado] = useState(false);
    const [inputCollapsed, setInputCollapsed] = useState(false);

    useEffect(() => {
        setMounted(true);
        trackEvent({ eventName: 'page_view', module: 'analizador' });
    }, []);

    useEffect(() => {
        if (result && result.items_analizados?.[selectedIndex]) {
            setTextoEditado(result.items_analizados[selectedIndex].sugerencia_reingenieria);
        }
    }, [selectedIndex, result]);

    useEffect(() => {
        if (result) setInputCollapsed(true);
    }, [result]);

    const handleAnalyze = async () => {
        if (!objetivo.trim() || !instrumento.trim()) return;
        setIsAnalyzing(true);
        setResult(null);

        try {
            const response = await fetch(`${API_URL}/analizador/audit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ objetivo_aprendizaje: objetivo, texto_evaluacion: instrumento })
            });

            if (!response.ok) throw new Error("Error de conexión");

            const data = await response.json();
            setResult(data);
            setVerSoloCriticos(true);

            // Telemetry: Generation Success
            trackEvent({
                eventName: 'generation_success',
                module: 'analizador',
                metadata: {
                    subject: data.metadata?.asignatura_detectada,
                    level: data.metadata?.nivel_detectado,
                    score: data.score_coherencia
                }
            });
        } catch (error) {
            console.error(error);
            alert("No se pudo conectar con la IA. Asegúrate de que el backend esté corriendo.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(textoEditado);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const itemsParaMostrar = result?.items_analizados
        ? (verSoloCriticos ? result.items_analizados.filter((i: any) => i.estado === "Crítico") : result.items_analizados)
        : [];

    const openDetail = (item: any) => {
        const index = result.items_analizados.findIndex((i: any) => i.id === item.id);
        setSelectedIndex(index);
        setIsSheetOpen(true);
    };

    const selectedItem = result?.items_analizados?.[selectedIndex];
    const dataMeta = result?.niveles_data ? result.niveles_data.map((d: any) => ({ name: d.nombre, value: d.esperado })) : [];
    const dataRealidad = result?.niveles_data ? result.niveles_data.map((d: any) => ({ name: d.nombre, value: d.cantidad })) : [];

    // Helper para generar título automático para el botón guardar
    const generarTituloGuardado = () => {
        if (!result) return "Auditoría";
        const asig = result.metadata?.asignatura_detectada || "General";
        const niv = result.metadata?.nivel_detectado || "";
        return `Auditoría: ${asig} ${niv}`;
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans relative">
            {isAnalyzing && <LoadingOverlay mensaje="Analizando consistencia..." />}

            {/* HEADER */}
            <div className="max-w-[1600px] mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1a2e3b] flex items-center gap-3">
                        <Microscope className="w-8 h-8 text-[#2b546e]" />
                        Analizador Cognitivo
                    </h1>
                    <p className="text-slate-500 font-medium ml-11">Auditoría forense de instrumentos.</p>
                </div>

                <div className="flex items-center gap-3">
                    {result && (
                        <>
                            {/* AQUI ESTÁ EL BOTÓN INTELIGENTE */}
                            <BotonGuardar
                                tipo="AUDITORIA"
                                titulo={generarTituloGuardado()}
                                asignatura={result.metadata?.asignatura_detectada}
                                nivel={result.metadata?.nivel_detectado}
                                contenido={result} // Pasamos todo el resultado
                            />

                            <Button
                                variant="ghost"
                                onClick={() => setInputCollapsed(!inputCollapsed)}
                                className="text-[#2b546e] hover:bg-slate-100 hidden lg:flex"
                            >
                                {inputCollapsed ? <ChevronRight className="w-5 h-5 mr-2" /> : <ChevronLeft className="w-5 h-5 mr-2" />}
                                {inputCollapsed ? "Ver Contexto" : "Ocultar"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 items-start transition-all duration-500">

                {/* --- COLUMNA INPUTS --- */}
                <div className={cn(
                    "transition-all duration-500 ease-in-out overflow-hidden flex-shrink-0 bg-white rounded-xl shadow-md border border-slate-100",
                    inputCollapsed ? "w-12 cursor-pointer opacity-80 hover:w-16" : "w-full lg:w-[350px] opacity-100"
                )}>
                    {inputCollapsed ? (
                        <div
                            className="h-[600px] flex flex-col items-center pt-6 gap-6 bg-slate-50/50"
                            onClick={() => setInputCollapsed(false)}
                            title="Expandir"
                        >
                            <ChevronRight className="w-6 h-6 text-[#2b546e]" />
                            <FileText className="w-5 h-5 text-slate-400 mt-4" />
                            <span className="whitespace-nowrap -rotate-90 text-xs font-bold text-slate-400 uppercase tracking-widest mt-8">
                                Contexto
                            </span>
                        </div>
                    ) : (
                        <div className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[#2b546e] font-bold flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Entrada
                                </h3>
                                {result && (
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setInputCollapsed(true)}>
                                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">OA</label>
                                    <Textarea
                                        placeholder="Ej: OA 4..."
                                        className="bg-slate-50 min-h-[100px] text-sm resize-none text-slate-900"
                                        value={objetivo}
                                        onChange={(e) => setObjetivo(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Prueba</label>
                                    <Textarea
                                        placeholder="Pega la prueba..."
                                        className="bg-slate-50 min-h-[300px] text-sm font-mono text-slate-900"
                                        value={instrumento}
                                        onChange={(e) => setInstrumento(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleAnalyze} disabled={isAnalyzing || !objetivo || !instrumento} className="w-full bg-[#2b546e] hover:bg-[#1e3b4e] text-white font-bold">
                                    <Search className="w-4 h-4 mr-2" /> {result ? "Re-Auditar" : "Auditar"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- COLUMNA RESULTADOS --- */}
                < div className="flex-1 min-w-0 space-y-6" >
                    {!result ? (
                        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30 text-slate-400 p-8 text-center">
                            <BrainCircuit className="w-16 h-16 mb-4 opacity-10" />
                            <h3 className="font-bold">Esperando Datos</h3>
                            <p className="text-sm">Ingresa el OA y la prueba para comenzar.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* SCORE CARD */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className={cn("md:col-span-1 border-l-4 shadow-sm", result.score_coherencia < 60 ? "border-l-red-500" : "border-l-green-500")}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Coherencia</p>
                                            <Badge variant="outline" className={result.score_coherencia < 60 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}>
                                                {result.score_coherencia < 60 ? "Crítico" : "Aceptable"}
                                            </Badge>
                                        </div>
                                        <h2 className={cn("text-5xl font-black", result.score_coherencia < 60 ? "text-red-600" : "text-green-600")}>
                                            {result.score_coherencia}%
                                        </h2>
                                        {result.score_coherencia < 60 && (
                                            <div className="mt-3 flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded text-xs font-bold border border-red-100">
                                                <AlertOctagon className="w-4 h-4" /> Ilusión de Competencia
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2 border-0 shadow-sm bg-white">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg text-[#2b546e] flex items-center gap-2">
                                            <Info className="w-5 h-5 text-[#f2ae60]" /> Diagnóstico
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-700 font-medium mb-2">{result.diagnostico_global}</p>
                                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border-l-2 border-[#2b546e]">
                                            {result.conclusion.accion}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* GRÁFICOS Y LISTA */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <Card className="lg:col-span-5 border-none shadow-md bg-white">
                                    <CardHeader className="pb-0"><CardTitle className="text-[#2b546e] text-base">Coherencia Visual</CardTitle></CardHeader>
                                    <CardContent className="h-[300px] p-2 grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <p className="text-center text-[10px] font-bold text-slate-400 mb-2">META (OA)</p>
                                            <ResponsiveContainer width="100%" height="80%">
                                                <PieChart>
                                                    <Pie data={dataMeta} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value">
                                                        {dataMeta.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="relative">
                                            <p className="text-center text-[10px] font-bold text-slate-400 mb-2">REALIDAD (PRUEBA)</p>
                                            <ResponsiveContainer width="100%" height="80%">
                                                <PieChart>
                                                    <Pie data={dataRealidad} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value">
                                                        {dataRealidad.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                    </Pie>
                                                    <RechartsTooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-7 border-none shadow-md bg-white flex flex-col h-[400px]">
                                    <CardHeader className="pb-3 border-b bg-slate-50/50 flex justify-between items-center sticky top-0 z-10">
                                        <div className="flex items-center gap-2"><ListChecks className="w-4 h-4 text-[#f2ae60]" /><CardTitle className="text-[#2b546e] text-base">Reactivos</CardTitle></div>
                                        <div className="flex bg-slate-200/50 p-1 rounded">
                                            <button onClick={() => setVerSoloCriticos(true)} className={cn("px-3 py-1 text-[10px] font-bold rounded", verSoloCriticos ? "bg-white text-red-600 shadow-sm" : "text-slate-500")}>Críticos</button>
                                            <button onClick={() => setVerSoloCriticos(false)} className={cn("px-3 py-1 text-[10px] font-bold rounded", !verSoloCriticos ? "bg-white text-[#2b546e] shadow-sm" : "text-slate-500")}>Todos</button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-0">
                                        {itemsParaMostrar.length > 0 ? itemsParaMostrar.map((item: any) => (
                                            <div key={item.id} onClick={() => openDetail(item)} className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className={cn("text-[10px]", item.estado === "Crítico" ? "text-red-600 bg-red-50 border-red-200" : "text-green-600 bg-green-50 border-green-200")}>{item.dok_real}</Badge>
                                                    {item.estado === "Crítico" && <AlertTriangle className="w-3 h-3 text-red-400" />}
                                                </div>
                                                <p className="text-sm text-slate-700 italic line-clamp-1">"{item.pregunta_extracto}"</p>
                                            </div>
                                        )) : <div className="p-8 text-center text-slate-400 text-xs">Sin ítems en esta categoría.</div>}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div >
            </div >

            {/* PANEL LATERAL */}
            < Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen} >
                <SheetContent className="w-[400px] sm:w-[550px] bg-[#fcfcfc] overflow-y-auto">
                    {selectedItem && (
                        <div className="space-y-6 pt-6">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="font-bold text-[#2b546e]">Detalle Forense</h3>
                                <Badge className={selectedItem.estado === "Crítico" ? "bg-red-500" : "bg-green-500"}>{selectedItem.estado}</Badge>
                            </div>

                            <div className="flex items-center justify-between bg-slate-100 p-3 rounded text-xs text-center">
                                <div className="flex-1">
                                    <p className="text-slate-400 font-bold mb-1">OA PIDE</p>
                                    <div className="bg-[#2b546e] text-white px-2 py-1 rounded">{selectedItem.dok_declarado}</div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400 mx-2" />
                                <div className="flex-1">
                                    <p className="text-slate-400 font-bold mb-1">ÍTEM MIDE</p>
                                    <div className="bg-white border border-slate-300 px-2 py-1 rounded">{selectedItem.dok_real}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Pregunta Original</h4>
                                <div className="bg-white p-3 rounded border border-slate-200 text-sm italic text-slate-600">"{selectedItem.pregunta_completa}"</div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Diagnóstico</h4>
                                <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-slate-700">{selectedItem.analisis}</div>
                            </div>

                            {selectedItem.estado === "Crítico" && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-xs font-bold text-[#2b546e] uppercase flex items-center gap-1"><Sparkles className="w-3 h-3" /> Propuesta IA</h4>
                                        <Button size="sm" variant="ghost" onClick={handleCopy} className="h-6 text-[10px]">{copiado ? "Copiado" : "Copiar"}</Button>
                                    </div>
                                    <Textarea
                                        value={textoEditado}
                                        onChange={(e) => setTextoEditado(e.target.value)}
                                        className="min-h-[120px] bg-white text-sm"
                                    />
                                    <div className="mt-4 flex gap-2 p-3 bg-slate-50 rounded text-xs text-slate-500">
                                        <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" />
                                        <p>Para profundizar, utiliza el módulo <strong>Elevador DOK</strong>.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet >
        </div >
    );
}