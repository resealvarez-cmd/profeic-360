"use client";
import { useState, useEffect, useRef } from "react";
import {
    ClipboardCheck, Sparkles, RefreshCw, CheckCircle,
    FileText, Sliders, Download, Plus, Minus,
    BrainCircuit, ArrowRight, ArrowLeft, Target, AlertCircle, Calculator, ChevronDown, Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { BotonGuardar } from "@/components/BotonGuardar";

// --- CONSTANTES ---
const NIVEL_ORDER = ["NT1", "NT2", "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio", "3° y 4° Medio"];

const MENSAJES_CARGA = [
    "Analizando los Objetivos de Aprendizaje...",
    "Calibrando la profundidad cognitiva (DOK)...",
    "Diseñando preguntas de Selección Múltiple...",
    "Redactando distractores plausibles...",
    "Construyendo ítems de Desarrollo y Rúbricas...",
    "Ajustando el puntaje total...",
    "Finalizando formato..."
];

// --- UI COMPONENTS ---
const ModernSelect = ({ label, value, options, onChange, placeholder = "Seleccionar...", disabled = false }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const selectedLabel = options.find((o: any) => o.value === value)?.label;
    return (
        <div className="relative" ref={containerRef}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">{label}</label>
            <button onClick={() => !disabled && setIsOpen(!isOpen)} className={cn("w-full text-left flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all duration-200", isOpen ? "border-[#f2ae60] ring-2 ring-[#f2ae60]/20 bg-white" : "border-slate-200 bg-white hover:border-slate-300", disabled && "opacity-50 cursor-not-allowed bg-slate-50")}>
                <span className={cn("text-sm font-medium truncate pr-4", !value && "text-slate-400")}>{selectedLabel || placeholder}</span>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            {isOpen && <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">{options.length === 0 ? <div className="p-4 text-xs text-slate-400 text-center">No hay opciones</div> : options.map((opt: any) => (<div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={cn("px-4 py-3 text-sm cursor-pointer transition-colors border-b border-slate-50 last:border-0", value === opt.value ? "bg-[#f2ae60]/10 text-[#2b546e] font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#2b546e]")}>{opt.label}</div>))}</div>}
        </div>
    );
};

const StepIndicator = ({ current, step, label }: { current: number, step: number, label: string }) => (
    <div className={cn("flex items-center gap-2 transition-colors", current >= step ? "text-[#1a2e3b]" : "text-slate-300")}>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2",
            current >= step ? "bg-[#1a2e3b] text-white border-[#1a2e3b]" : "bg-transparent border-slate-200")}>
            {step}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider hidden md:block">{label}</span>
        {current > step && <div className="w-12 h-0.5 bg-[#1a2e3b]/20 mx-2 hidden md:block"></div>}
    </div>
);

const DistributionSlider = ({ label, value, onChange }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase text-slate-300"><span>{label}</span><span className="text-[#f2ae60] text-sm">{value}%</span></div>
        <input type="range" min="0" max="100" step="5" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-[#f2ae60]" />
    </div>
);

const ItemConfigRow = ({ label, quantity, points, onQtyChange, onPointsChange }: any) => (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-[#f2ae60]/50 transition-all shadow-sm">
        <div className="flex flex-col w-1/3"><span className="text-xs font-bold text-slate-500 uppercase">{label}</span><span className="text-[10px] text-slate-400">Cantidad</span></div>
        <div className="flex items-center gap-2"><button onClick={() => onQtyChange(Math.max(0, quantity - 1))} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"><Minus size={14} /></button><span className="w-6 text-center font-bold text-[#1a2e3b]">{quantity}</span><button onClick={() => onQtyChange(quantity + 1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Plus size={14} /></button></div>
        <div className="flex items-center gap-2 border-l border-slate-100 pl-4 ml-2"><div className="flex flex-col items-end"><span className="text-[10px] text-slate-400">Pts c/u</span><input type="number" value={points} onChange={(e) => onPointsChange(Math.max(1, parseInt(e.target.value) || 0))} className="w-10 text-right text-xs font-bold border-b border-slate-200 focus:border-[#f2ae60] outline-none text-[#2b546e]" /></div></div>
        <div className="w-12 text-right"><span className="text-xs font-bold text-[#f2ae60]">{quantity * points} pts</span></div>
    </div>
);

const LoadingOverlay = ({ mensaje }: { mensaje: string }) => (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-all duration-500">
        <div className="relative">
            <div className="absolute inset-0 bg-[#f2ae60] rounded-full blur-xl opacity-20 animate-pulse"></div>
            <BrainCircuit className="w-24 h-24 text-[#f2ae60] animate-bounce relative z-10" />
        </div>
        <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">Diseñando Evaluación</h3>
        <p className="mt-2 text-lg text-slate-300 font-light animate-pulse text-center max-w-md">{mensaje}</p>
    </div>
);

export default function GeneradorEvaluaciones() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [mensajeCarga, setMensajeCarga] = useState(MENSAJES_CARGA[0]);

    // --- NUEVO ESTADO PARA ASIGNATURA MANUAL ---
    const [isManualSubject, setIsManualSubject] = useState(false);

    const [niveles, setNiveles] = useState<string[]>([]);
    const [asignaturas, setAsignaturas] = useState<string[]>([]);
    const [oasDisponibles, setOasDisponibles] = useState<any[]>([]);

    const [config, setConfig] = useState({
        grade: "", subject: "", oaIds: [] as string[], customOa: "",
        dokDistribution: { dok1: 20, dok2: 50, dok3: 30 },
        quantities: { multiple_choice: 10, true_false: 0, short_answer: 0, essay: 2 },
        points: { multiple_choice: 2, true_false: 1, short_answer: 3, essay: 5 }
    });

    const [resultado, setResultado] = useState<any>(null);
    const totalPoints = (config.quantities.multiple_choice * config.points.multiple_choice) + (config.quantities.true_false * config.points.true_false) + (config.quantities.short_answer * config.points.short_answer) + (config.quantities.essay * config.points.essay);

    useEffect(() => {
        if (loading) {
            let i = 0;
            const interval = setInterval(() => { i = (i + 1) % MENSAJES_CARGA.length; setMensajeCarga(MENSAJES_CARGA[i]); }, 2500);
            return () => clearInterval(interval);
        }
    }, [loading]);

    const handleDistributionChange = (type: 'dok1' | 'dok2' | 'dok3', newValue: number) => {
        if (newValue < 0) newValue = 0; if (newValue > 100) newValue = 100;
        const keys = ['dok1', 'dok2', 'dok3'] as const;
        const others = keys.filter(k => k !== type);
        const remaining = 100 - newValue;
        const currentTotalOthers = config.dokDistribution[others[0]] + config.dokDistribution[others[1]];
        let newDist = { ...config.dokDistribution, [type]: newValue };
        if (remaining === 0) { newDist[others[0]] = 0; newDist[others[1]] = 0; }
        else if (currentTotalOthers === 0) { newDist[others[0]] = Math.floor(remaining / 2); newDist[others[1]] = remaining - newDist[others[0]]; }
        else { const ratio = remaining / currentTotalOthers; newDist[others[0]] = Math.round(config.dokDistribution[others[0]] * ratio); newDist[others[1]] = remaining - newDist[others[0]]; }
        setConfig({ ...config, dokDistribution: newDist });
    };

    useEffect(() => { fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }).then(res => res.json()).then(data => { if (data.type === 'niveles') setNiveles(data.data.sort((a: string, b: string) => (NIVEL_ORDER.indexOf(a) === -1 ? 999 : NIVEL_ORDER.indexOf(a)) - (NIVEL_ORDER.indexOf(b) === -1 ? 999 : NIVEL_ORDER.indexOf(b)))) }); }, []);

    useEffect(() => {
        if (!config.grade) return;
        if (isManualSubject) return; // Si es manual, no reseteamos al cambiar curso
        setAsignaturas([]);
        setConfig(p => ({ ...p, subject: "" }));
        fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nivel: config.grade }) }).then(res => res.json()).then(data => data.type === 'asignaturas' && setAsignaturas(data.data));
    }, [config.grade, isManualSubject]);

    useEffect(() => {
        if (!config.grade || !config.subject) return;
        if (isManualSubject) return; // Si es manual, no buscamos OAs en BD
        fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nivel: config.grade, asignatura: config.subject }) }).then(res => res.json()).then(data => data.type === 'oas' && setOasDisponibles(data.data));
    }, [config.subject, isManualSubject]);

    const generarPrueba = async () => {
        const totalQ = Object.values(config.quantities).reduce((a, b) => a + b, 0);
        if (totalQ === 0) { alert("Agrega al menos una pregunta."); return; }
        if (config.oaIds.length === 0 && !config.customOa) { alert("Selecciona al menos un Objetivo o escribe uno manual."); return; }

        setLoading(true);
        try {
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/generate-assessment", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Error en el servidor");
            }
            const data = await res.json();
            setResultado(data);
            setStep(3);
            setTimeout(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }), 500);
        } catch (e: any) { alert(`Error al generar: ${e.message}`); } finally { setLoading(false); }
    };

    const descargarWord = async () => {
        if (!resultado) return;
        setDownloading(true);
        try {
            const payload = { title: resultado.title, description: resultado.description, grade: config.grade, subject: config.subject, items: resultado.items };
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/export/evaluacion-docx", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) { const blob = await res.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Evaluacion_${config.subject}.docx`; document.body.appendChild(a); a.click(); a.remove(); }
        } catch (e) { alert("Error descarga"); } finally { setDownloading(false); }
    };

    const updateQty = (type: keyof typeof config.quantities, val: number) => setConfig({ ...config, quantities: { ...config.quantities, [type]: val } });
    const updatePts = (type: keyof typeof config.points, val: number) => setConfig({ ...config, points: { ...config.points, [type]: val } });

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-[#1a2e3b]">
            {loading && <LoadingOverlay mensaje={mensajeCarga} />}

            <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-[#1a2e3b] flex items-center gap-2"><ClipboardCheck className="w-8 h-8 text-[#f2ae60]" /> ProfeIC <span className="text-[#f2ae60]">Evaluación</span></h1>
                    <div className="flex gap-4"><StepIndicator current={step} step={1} label="Configuración" /><StepIndicator current={step} step={2} label="Objetivos" /><StepIndicator current={step} step={3} label="Resultado" /></div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8">
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="font-bold text-[#1a2e3b] mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> 1. Contexto Curricular</h2>
                                <div className="space-y-4">
                                    <ModernSelect label="Nivel Educativo" value={config.grade} onChange={(v: string) => setConfig({ ...config, grade: v })} options={niveles.map(n => ({ value: n, label: n }))} />

                                    {/* --- SELECTOR HÍBRIDO DE ASIGNATURA --- */}
                                    <div className="relative">
                                        {!isManualSubject ? (
                                            <ModernSelect
                                                label="Asignatura"
                                                value={config.subject}
                                                onChange={(v: string) => setConfig({ ...config, subject: v })}
                                                options={asignaturas.map(a => ({ value: a, label: a }))}
                                                disabled={!config.grade}
                                            />
                                        ) : (
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">Asignatura (Manual)</label>
                                                <input
                                                    type="text"
                                                    value={config.subject}
                                                    onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#f2ae60] focus:ring-2 focus:ring-[#f2ae60]/20 outline-none text-sm font-medium transition-all"
                                                    placeholder="Ej: Taller de Robótica, Filosofía..."
                                                />
                                            </div>
                                        )}

                                        <button
                                            onClick={() => {
                                                setIsManualSubject(!isManualSubject);
                                                setConfig(prev => ({ ...prev, subject: "" })); // Limpiar al cambiar
                                            }}
                                            className="text-[10px] font-bold text-[#2b546e] hover:text-[#f2ae60] underline mt-2 ml-1 flex items-center gap-1"
                                        >
                                            <Edit3 size={10} />
                                            {isManualSubject ? "Volver a lista desplegable" : "¿No está en la lista? Ingresar manualmente"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-[#1a2e3b] flex items-center gap-2"><Sliders className="w-5 h-5" /> 2. Estructura y Puntaje</h2><div className="bg-[#f2ae60]/10 text-[#f2ae60] px-3 py-1 rounded-full text-xs font-bold border border-[#f2ae60]/20 flex items-center gap-1"><Calculator size={14} /> Total: {totalPoints} pts</div></div>
                                <div className="space-y-3">
                                    <ItemConfigRow label="Selección Múltiple" quantity={config.quantities.multiple_choice} points={config.points.multiple_choice} onQtyChange={(v: number) => updateQty('multiple_choice', v)} onPointsChange={(v: number) => updatePts('multiple_choice', v)} />
                                    <ItemConfigRow label="Verdadero/Falso" quantity={config.quantities.true_false} points={config.points.true_false} onQtyChange={(v: number) => updateQty('true_false', v)} onPointsChange={(v: number) => updatePts('true_false', v)} />
                                    <ItemConfigRow label="Respuesta Breve" quantity={config.quantities.short_answer} points={config.points.short_answer} onQtyChange={(v: number) => updateQty('short_answer', v)} onPointsChange={(v: number) => updatePts('short_answer', v)} />
                                    <ItemConfigRow label="Desarrollo" quantity={config.quantities.essay} points={config.points.essay} onQtyChange={(v: number) => updateQty('essay', v)} onPointsChange={(v: number) => updatePts('essay', v)} />
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="bg-[#1a2e3b] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex-1">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Target className="w-40 h-40" /></div>
                                <h2 className="text-xl font-bold mb-6 relative z-10">Calibración DOK</h2>
                                <div className="space-y-8 relative z-10">
                                    <div className="p-5 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 space-y-6">
                                        <DistributionSlider label="DOK 1: Recordar" value={config.dokDistribution.dok1} onChange={(v: number) => handleDistributionChange('dok1', v)} />
                                        <DistributionSlider label="DOK 2: Aplicar" value={config.dokDistribution.dok2} onChange={(v: number) => handleDistributionChange('dok2', v)} />
                                        <DistributionSlider label="DOK 3: Estratégico" value={config.dokDistribution.dok3} onChange={(v: number) => handleDistributionChange('dok3', v)} />
                                    </div>
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3"><AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" /><p className="text-xs text-yellow-200 leading-relaxed">El sistema calibrará la dificultad.</p></div>
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} disabled={!config.grade || !config.subject} className="w-full py-4 bg-[#f2ae60] hover:bg-[#d99a50] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">Siguiente: Definir Objetivos <ArrowRight size={20} /></button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500 max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-6"><button onClick={() => setStep(1)} className="text-slate-400 hover:text-[#2b546e] flex items-center gap-2 font-bold transition-colors"><ArrowLeft size={20} /> Volver a Configuración</button><h2 className="text-xl font-bold text-[#1a2e3b]">Selecciona los Objetivos a Evaluar</h2></div>

                        {/* LISTA DE OAS (Solo si no es manual) */}
                        {!isManualSubject && oasDisponibles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                {oasDisponibles.map((oa) => {
                                    const isSelected = config.oaIds.includes(oa.id);
                                    return (
                                        <div key={oa.id} onClick={() => { const newIds = isSelected ? config.oaIds.filter(id => id !== oa.id) : [...config.oaIds, oa.id]; setConfig({ ...config, oaIds: newIds }); }} className={cn("p-5 rounded-2xl border cursor-pointer transition-all duration-200 group relative", isSelected ? "bg-blue-50 border-[#1a2e3b] ring-1 ring-[#1a2e3b]" : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm")}>
                                            <div className="flex justify-between items-start mb-2"><span className={cn("text-[10px] font-bold px-2 py-1 rounded uppercase", isSelected ? "bg-[#1a2e3b] text-white" : "bg-slate-100 text-slate-500")}>{oa.oa_codigo || 'OA'}</span>{isSelected && <CheckCircle className="w-6 h-6 text-[#1a2e3b]" />}</div>
                                            <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">{oa.descripcion || oa.oa_descripcion}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-8"><h3 className="font-bold text-amber-900 mb-2 text-sm flex items-center gap-2"><Sparkles className="w-4 h-4" /> ¿Objetivo Específico?</h3><textarea className="w-full p-3 rounded-xl border border-amber-200 bg-white text-sm focus:ring-2 focus:ring-amber-400 outline-none" rows={3} placeholder={isManualSubject ? "Como es una asignatura manual, escribe aquí qué contenidos u objetivos quieres evaluar..." : "Escribe aquí un objetivo manual..."} value={config.customOa} onChange={(e) => setConfig({ ...config, customOa: e.target.value })} /></div>
                        <button onClick={generarPrueba} className="w-full py-4 bg-[#1a2e3b] text-white rounded-xl font-bold shadow-xl hover:bg-[#203e52] transition-transform active:scale-[0.98] flex justify-center items-center gap-2"><Sparkles className="w-5 h-5 text-[#f2ae60]" /> Generar Prueba ({totalPoints} pts)</button>
                    </div>
                )}

                {step === 3 && resultado && (
                    <div className="animate-in zoom-in-95 duration-500 max-w-4xl mx-auto">
                        <div className="mb-6 flex justify-between items-center"><button onClick={() => setStep(2)} className="text-slate-400 hover:text-[#2b546e] flex items-center gap-2 font-bold transition-colors"><ArrowLeft size={20} /> Editar Objetivos</button><span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Total: {totalPoints} puntos</span></div>
                        <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200 mb-20">
                            <div className="text-center border-b-2 border-slate-100 pb-6 mb-8"><h1 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">{resultado.title}</h1><p className="text-slate-500 italic mt-2">{resultado.description}</p></div>
                            <div className="space-y-8">
                                {resultado.items.map((item: any, i: number) => (
                                    <div key={i} className="break-inside-avoid">
                                        <div className="flex gap-2 mb-2"><span className="font-bold text-slate-900">{i + 1}.</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start"><p className="text-slate-800 font-medium text-lg leading-snug">{item.stem}</p><span className="text-xs font-bold text-slate-400 ml-4 whitespace-nowrap">({item.points} pts)</span></div>
                                                {item.type === 'multiple_choice' && item.options && <div className="mt-3 space-y-2 ml-2">{item.options.map((opt: any, idx: number) => (<div key={idx} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full border border-slate-400 flex items-center justify-center text-xs font-bold text-slate-500">{String.fromCharCode(97 + idx)}</div><span className="text-slate-700">{opt.text}</span></div>))}</div>}
                                                {(item.type === 'essay' || item.type === 'short_answer') && <div className="mt-4 w-full h-24 border border-slate-200 rounded-lg bg-slate-50/50"></div>}
                                                {item.type === 'true_false' && <div className="mt-2 text-slate-600 font-medium ml-4">_____ Verdadero &nbsp;&nbsp;&nbsp;&nbsp; _____ Falso</div>}
                                            </div>
                                            <div className="print:hidden"><span className={cn("text-[10px] font-bold px-2 py-1 rounded border", item.dok_level === 1 ? "bg-green-50 text-green-700 border-green-200" : item.dok_level === 2 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200")}>DOK {item.dok_level}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="fixed bottom-8 right-8 flex gap-3 z-50">
                            {/* --- 2. AQUÍ INSERTAMOS EL BOTÓN GUARDAR --- */}
                            <BotonGuardar
                                tipo="EVALUACION"
                                titulo={resultado.title}
                                asignatura={config.subject}
                                nivel={config.grade}
                                contenido={{ ...config, ...resultado }} // Guardamos configuración y resultado
                            />

                            <button onClick={descargarWord} disabled={downloading} className="bg-[#2b546e] text-white px-6 py-3 rounded-full font-bold shadow-xl hover:bg-[#1a2e3b] flex items-center gap-2 transform hover:scale-105 transition-all">{downloading ? "Descargando..." : <><Download className="w-5 h-5" /> Descargar Word</>}</button>
                            <button onClick={() => setStep(1)} className="bg-white text-[#1a2e3b] px-6 py-3 rounded-full font-bold shadow-xl hover:bg-slate-50 border border-slate-200 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#f2ae60]" /> Nueva</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}