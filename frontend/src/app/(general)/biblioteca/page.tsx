"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    Library, Book, Search, Calendar, GraduationCap, Layout,
    BrainCircuit, Target, CheckCircle2, Layers, FileQuestion,
    Puzzle, TrendingUp, AlertCircle, Download, Trash2, X,
    FileText, Loader2, MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";

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

    // 3. EVALUACIÓN (PRUEBA)
    if (safeData.items && Array.isArray(safeData.items)) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 italic text-slate-600 text-sm">
                    "{safeData.description}"
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <FileQuestion className="w-4 h-4" /> Reactivos ({safeData.items.length})
                    </h4>
                    <div className="space-y-3">
                        {safeData.items.map((item: any, i: number) => (
                            <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase border px-2 py-0.5 rounded text-slate-500">{item.type}</span>
                                    <span className="text-xs font-bold text-[#2b546e]">{item.points} pts</span>
                                </div>
                                <p className="text-sm text-slate-800 font-medium">{item.stem}</p>
                            </div>
                        ))}
                    </div>
                </div>
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

    // 6. FALLBACK
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
};

export default function BibliotecaPage() {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedResource, setSelectedResource] = useState<LibraryItem | null>(null);
    const [downloading, setDownloading] = useState(false);

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
        e.stopPropagation(); // Evita abrir el modal
        if (!confirm("¿Estás seguro de eliminar este recurso?")) return;
        try {
            const { error } = await supabase.from("biblioteca_recursos").delete().eq("id", id);
            if (error) throw error;
            setItems(items.filter((item) => item.id !== id));
            if (selectedResource?.id === id) setSelectedResource(null);
        } catch (error) {
            console.error("Error eliminando:", error);
        }
    };

    const handleDownload = async (item: LibraryItem, e?: any) => {
        if (e) e.stopPropagation(); // Evita abrir el modal
        setDownloading(true);
        try {
            const endpoint = "https://profeic-backend-484019506864.us-central1.run.app/export/generic-docx";
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

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${item.titulo.replace(/\s+/g, "_")}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert("No se pudo descargar el archivo.");
        } finally {
            setDownloading(false);
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

    const filteredItems = items.filter(item =>
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.asignatura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
            {loading && <LoadingOverlay />}

            <div className="max-w-7xl mx-auto space-y-8">
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
                            className="pl-10 bg-white border-slate-200 focus:ring-[#f2ae60]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                {!loading && filteredItems.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <Book className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>No se encontraron recursos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <Card key={item.id} className="group hover:shadow-lg transition-all border-slate-200 hover:border-[#f2ae60]/50 cursor-pointer" onClick={() => setSelectedResource(item)}>
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-[#f2ae60]/10 transition-colors">
                                        {getIcon(item.tipo)}
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
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={(e: any) => handleDelete(item.id, e)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

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

                    <DialogFooter className="p-4 border-t bg-slate-50 flex justify-between gap-2">
                        <Button variant="outline" onClick={() => setSelectedResource(null)}>Cerrar</Button>
                        <Button onClick={() => selectedResource && handleDownload(selectedResource)} disabled={downloading} className="bg-[#1a2e3b] text-white hover:bg-[#2b546e]">
                            {downloading ? "Descargando..." : <><Download className="w-4 h-4 mr-2" /> Descargar DOCX</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}