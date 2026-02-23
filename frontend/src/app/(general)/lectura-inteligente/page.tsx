"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen, Layers, ArrowRight, ArrowLeft,
    CheckCircle, Target, Sparkles, Download,
    RefreshCcw, AlertTriangle, FileText, GripVertical, ChevronDown, Edit3, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { BotonGuardar } from "@/components/BotonGuardar";
import { trackEvent } from "@/lib/telemetry";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const NIVEL_ORDER = ["NT1", "NT2", "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio", "3° y 4° Medio"];

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
            <button onClick={() => !disabled && setIsOpen(!isOpen)} className={cn("w-full text-left flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all duration-200", isOpen ? "border-[#4a6b8c] ring-2 ring-[#4a6b8c]/20 bg-white" : "border-slate-200 bg-white hover:border-slate-300", disabled && "opacity-50 cursor-not-allowed bg-slate-50")}>
                <span className={cn("text-sm font-medium truncate pr-4", !value && "text-slate-400")}>{selectedLabel || placeholder}</span>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            {isOpen && <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">{options.length === 0 ? <div className="p-4 text-xs text-slate-400 text-center">No hay opciones</div> : options.map((opt: any) => (<div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={cn("px-4 py-3 text-sm cursor-pointer transition-colors border-b border-slate-50 last:border-0", value === opt.value ? "bg-[#4a6b8c]/10 text-[#2b546e] font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-[#2b546e]")}>{opt.label}</div>))}</div>}
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

const LoadingOverlay = ({ mensaje }: { mensaje: string }) => (
    <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-all duration-500">
        <div className="relative">
            <div className="absolute inset-0 bg-[#4a6b8c] rounded-full blur-xl opacity-20 animate-pulse"></div>
            <BookOpen className="w-24 h-24 text-[#4a6b8c] animate-bounce relative z-10" />
        </div>
        <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">Procesando...</h3>
        <p className="mt-2 text-lg text-slate-300 font-light animate-pulse text-center max-w-md">{mensaje}</p>
    </div>
);

export default function LecturaInteligente() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [mensajeCarga, setMensajeCarga] = useState("");

    // Panel 1: Config
    const [niveles, setNiveles] = useState<string[]>([]);
    const [asignaturas, setAsignaturas] = useState<string[]>([]);
    const [oasDisponibles, setOasDisponibles] = useState<any[]>([]);
    const [isManualSubject, setIsManualSubject] = useState(false);

    const [config, setConfig] = useState({
        grade: "",
        subject: "",
        oaText: "", // Guardar texto del OA en vez de IDs para el prompt
        customOaId: "",
        sourceText: "", // Textarea input
        numQuestions: 10,
        textType: "Informativo",
        textLength: "Media (300-500 palabras)"
    });

    // Panel 2: Co-Diseño
    const [generatedText, setGeneratedText] = useState("");
    const [questions, setQuestions] = useState<any[]>([]);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/curriculum/options`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
            .then(res => res.json())
            .then(data => { if (data.type === 'niveles') setNiveles(data.data.sort((a: string, b: string) => (NIVEL_ORDER.indexOf(a) === -1 ? 999 : NIVEL_ORDER.indexOf(a)) - (NIVEL_ORDER.indexOf(b) === -1 ? 999 : NIVEL_ORDER.indexOf(b)))) });

        // Telemetry: Page View
        trackEvent({
            eventName: 'page_view',
            module: 'lectura_inteligente'
        });
    }, []);

    useEffect(() => {
        if (!config.grade) return;
        if (isManualSubject) return;
        setAsignaturas([]);
        setConfig(p => ({ ...p, subject: "", oaText: "", customOaId: "" }));
        fetch(`${API_URL}/curriculum/options`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nivel: config.grade }) })
            .then(res => res.json())
            .then(data => data.type === 'asignaturas' && setAsignaturas(data.data));
    }, [config.grade, isManualSubject]);

    useEffect(() => {
        if (!config.grade || !config.subject) return;
        if (isManualSubject) return;
        fetch(`${API_URL}/curriculum/options`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nivel: config.grade, asignatura: config.subject }) })
            .then(res => res.json())
            .then(data => data.type === 'oas' && setOasDisponibles(data.data));
    }, [config.subject, isManualSubject]);


    // Action: Avanzar a Panel 2
    const handleGenerarPreguntas = async () => {
        if (!config.grade || !config.subject || !config.oaText) {
            alert("Por favor completa Nivel, Asignatura y un OA.");
            return;
        }

        setLoading(true);
        try {
            let workingText = config.sourceText;

            // 1. Si el texto está vacío, lo generamos primero
            if (!workingText.trim()) {
                setMensajeCarga("Generando texto original con IA...");
                const resText = await fetch(`${API_URL}/lectura-inteligente/generar-texto`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nivel: config.grade,
                        asignatura: config.subject,
                        oa: config.oaText,
                        tipo_texto: config.textType,
                        extension_texto: config.textLength
                    })
                });

                if (!resText.ok) throw new Error("Error al generar el texto base");
                const textData = await resText.json();
                workingText = textData.texto;
                setGeneratedText(workingText); // Guardar para panel 2
            } else {
                setGeneratedText(workingText); // Usar el texto provisto
            }

            // 2. Generar preguntas
            setMensajeCarga("Diseñando preguntas taxonómicas...");
            const resQ = await fetch(`${API_URL}/lectura-inteligente/generar-preguntas`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nivel: config.grade,
                    asignatura: config.subject,
                    oa: config.oaText,
                    texto: workingText,
                    num_preguntas: config.numQuestions
                })
            });

            if (!resQ.ok) throw new Error("Error al generar las preguntas");
            const qData = await resQ.json();

            // Si la IA no genera IDs, los asignamos
            const questionsWithIds = (qData.preguntas || []).map((q: any, i: number) => ({
                ...q, id: q.id || `q-${Date.now()}-${i}`
            }));

            setQuestions(questionsWithIds);
            setStep(2);

            // Telemetry: Generation Success
            trackEvent({
                eventName: 'generation_success',
                module: 'lectura-inteligente',
                metadata: {
                    questions_count: questionsWithIds.length,
                    grade: config.grade,
                    subject: config.subject,
                    source: config.sourceText ? 'provided' : 'ai_generated'
                }
            });

            setTimeout(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }), 500);

        } catch (error: any) {
            console.error("Error al generar:", error.message);
            alert(`Error: ${error.message}. Por favor intenta nuevamente.`);
        } finally {
            setLoading(false);
            setMensajeCarga("");
        }
    };

    // Edición local en Panel 2
    const updateQuestionField = (qId: string, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value } : q));
    };

    const updateAlternative = (qId: string, idx: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newAlt = [...q.alternativas];
                newAlt[idx] = value;
                return { ...q, alternativas: newAlt };
            }
            return q;
        }));
    };

    // Regenerar pregunta individual
    const handleRegenerarPregunta = async (qId: string, desiredLevel: string) => {
        setRegeneratingId(qId);

        // Telemetry: Friction/Regeneration Tracking
        trackEvent({
            eventName: 'regenerate_question',
            module: 'lectura_inteligente',
            metadata: {
                question_id: qId,
                target_level: desiredLevel,
                grade: config.grade,
                subject: config.subject
            }
        });

        try {
            const res = await fetch(`${API_URL}/lectura-inteligente/regenerar-pregunta`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nivel: config.grade,
                    asignatura: config.subject,
                    oa: config.oaText,
                    texto: generatedText,
                    nivel_taxonomico_deseado: desiredLevel
                })
            });

            if (!res.ok) throw new Error("Error regenerando pregunta");
            const data = await res.json();

            const newQ = { ...data.pregunta_nueva, id: qId }; // Mantener ID para reemplazar en el array
            setQuestions(questions.map(q => q.id === qId ? newQ : q));

            // Feedback visual pequeño
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#4a6b8c', '#a8dadc'] });

        } catch (error: any) {
            alert(error.message);
        } finally {
            setRegeneratingId(null);
        }
    };

    const handleDownload = async (tipo: "estudiante" | "profesor") => {
        setLoading(true);
        setMensajeCarga(`Generando documento .docx (${tipo})...`);
        try {
            const payload = {
                nivel: config.grade,
                asignatura: config.subject,
                oa: config.oaText,
                texto: generatedText,
                preguntas: questions,
                tipo_documento: tipo
            };

            const res = await fetch(`${API_URL}/export/lectura-inteligente`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Lectura_${tipo}_${config.subject}.docx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                throw new Error("Error al descargar el documento");
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-[#1a2e3b]">
            {loading && <LoadingOverlay mensaje={mensajeCarga} />}

            <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-[#1a2e3b] flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-[#4a6b8c]" />
                        ProfeIC <span className="text-[#4a6b8c]">Lectura</span>
                    </h1>
                    <div className="flex gap-4">
                        <StepIndicator current={step} step={1} label="Configuración" />
                        <StepIndicator current={step} step={2} label="Co-Diseño" />
                        <StepIndicator current={step} step={3} label="Entregables" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 md:p-8">
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        {/* Columna Izquierda: Selectores */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="font-bold text-[#1a2e3b] mb-4 flex items-center gap-2"><Settings2 className="w-5 h-5 text-[#4a6b8c]" /> 1. Parámetros de Generación</h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <ModernSelect label="Nivel Educativo" value={config.grade} onChange={(v: string) => setConfig({ ...config, grade: v, subject: "", customOaId: "", oaText: "" })} options={niveles.map(n => ({ value: n, label: n }))} />
                                        <ModernSelect label="Cant. Preguntas" value={config.numQuestions} onChange={(v: number) => setConfig({ ...config, numQuestions: v })} options={[{ value: 5, label: "5 Preguntas" }, { value: 10, label: "10 Preguntas" }, { value: 15, label: "15 Preguntas" }, { value: 20, label: "20 Preguntas" }]} />
                                    </div>

                                    <div className="relative">
                                        {!isManualSubject ? (
                                            <ModernSelect
                                                label="Asignatura"
                                                value={config.subject}
                                                onChange={(v: string) => setConfig({ ...config, subject: v, customOaId: "", oaText: "" })}
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
                                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#4a6b8c] focus:ring-2 focus:ring-[#4a6b8c]/20 outline-none text-sm font-medium transition-all"
                                                    placeholder="Ej: Filosofía..."
                                                />
                                            </div>
                                        )}
                                        <button onClick={() => { setIsManualSubject(!isManualSubject); setConfig(prev => ({ ...prev, subject: "", customOaId: "", oaText: "" })); }} className="text-[10px] font-bold text-[#2b546e] hover:text-[#4a6b8c] underline mt-2 ml-1 flex items-center gap-1">
                                            <Edit3 size={10} /> {isManualSubject ? "Volver a lista desplegable" : "Ingresar manualmente"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="font-bold text-[#1a2e3b] mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-[#4a6b8c]" /> 2. Objetivo Específico</h2>
                                {!isManualSubject && oasDisponibles.length > 0 && (
                                    <div className="mb-4">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">Seleccionar desde Marco Curricular</label>
                                        <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                            {oasDisponibles.map(oa => (
                                                <div
                                                    key={oa.id}
                                                    onClick={() => setConfig({ ...config, customOaId: oa.id, oaText: oa.descripcion || oa.oa_descripcion })}
                                                    className={cn("p-3 rounded-lg border text-xs cursor-pointer transition-colors", config.customOaId === oa.id ? "bg-[#4a6b8c]/10 border-[#4a6b8c] text-[#1a2e3b] font-medium" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300")}
                                                >
                                                    <span className="font-bold truncate mr-2">{oa.oa_codigo}</span>
                                                    <span className="line-clamp-2 mt-1">{oa.descripcion || oa.oa_descripcion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">{config.customOaId ? 'OA Seleccionado (Editable):' : 'Describir Objetivo Específico:'}</label>
                                    <textarea
                                        rows={4}
                                        value={config.oaText}
                                        onChange={(e) => setConfig({ ...config, oaText: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#4a6b8c] focus:ring-2 focus:ring-[#4a6b8c]/20 outline-none text-sm transition-all resize-none"
                                        placeholder="Escribe o edita el objetivo de aprendizaje para orientar la generación de ítems..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: El Insumo (Texto) */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col relative overflow-hidden">
                                {/* Decoración sutil */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1a2e3b] flex items-center gap-2">
                                            <FileText className="w-6 h-6 text-[#f2ae60]" />
                                            3. Insumo de Lectura
                                        </h2>
                                        <p className="text-sm text-slate-500 mt-1">Pega un texto existente, o déjalo en blanco para que la IA cree uno original a medida.</p>
                                    </div>
                                </div>

                                {/* Opciones de texto generado (sólo visible si está vacío) */}
                                {config.sourceText.trim() === "" && (
                                    <div className="grid grid-cols-2 gap-4 mb-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative z-20">
                                        <ModernSelect
                                            label="Tipo de Texto (IA)"
                                            value={config.textType}
                                            onChange={(v: string) => setConfig({ ...config, textType: v })}
                                            options={[
                                                { value: "Informativo", label: "Informativo" },
                                                { value: "Narrativo", label: "Narrativo (Cuento/Relato)" },
                                                { value: "Periodístico", label: "Periodístico (Noticia/Reportaje)" },
                                                { value: "Argumentativo", label: "Argumentativo (Ensayo/Columna)" },
                                                { value: "Poema", label: "Poema" },
                                                { value: "Dramático", label: "Dramático (Obra de teatro)" }
                                            ]}
                                        />
                                        <ModernSelect
                                            label="Extensión (IA)"
                                            value={config.textLength}
                                            onChange={(v: string) => setConfig({ ...config, textLength: v })}
                                            options={[
                                                { value: "Breve (100-250 palabras)", label: "Breve (100-250 palabras)" },
                                                { value: "Media (300-500 palabras)", label: "Media (300-500 palabras)" },
                                                { value: "Extensa (600-1000 palabras)", label: "Extensa (600-1000 palabras)" }
                                            ]}
                                        />
                                    </div>
                                )}

                                <textarea
                                    className="w-full flex-1 min-h-[300px] p-5 rounded-2xl border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-[#f2ae60] focus:ring-4 focus:ring-[#f2ae60]/10 outline-none text-slate-700 text-base leading-relaxed transition-all resize-none z-10 font-serif"
                                    placeholder="Puedes pegar acá un cuento, artículo, poema o fragmento literario...&#10;&#10;Si dejas este espacio en blanco, escribiré un texto original basándome en el Nivel y OA que has configurado a la izquierda."
                                    value={config.sourceText}
                                    onChange={e => setConfig({ ...config, sourceText: e.target.value })}
                                />

                                <div className="mt-6 flex items-center justify-between text-xs text-slate-400 font-medium px-2">
                                    <span>{config.sourceText.length} caracteres</span>
                                    <div className="flex items-center gap-1">
                                        {config.sourceText.trim() === "" ? (
                                            <span className="text-blue-500 flex items-center gap-1"><Sparkles size={14} /> Modo IA Activado</span>
                                        ) : (
                                            <span className="text-emerald-500 flex items-center gap-1"><CheckCircle size={14} /> Texto Proveído Activado</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleGenerarPreguntas} disabled={loading || !config.grade || !config.subject || !config.oaText} className="w-full py-5 bg-[#1a2e3b] hover:bg-[#203e52] text-white font-bold text-lg rounded-2xl shadow-xl transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3">
                                <Sparkles className="text-[#f2ae60]" size={24} /> {loading ? "Procesando con IA..." : "Generar Material Pedagógico"} <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500 max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-[#4a6b8c] flex items-center gap-2 font-bold transition-colors"><ArrowLeft size={20} /> Volver a Parámetros</button>
                            <h2 className="text-xl font-bold text-[#1a2e3b]">Co-Diseño Pedagógico</h2>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-4xl mx-auto">
                            <h3 className="font-bold text-[#1a2e3b] mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-[#f2ae60]" /> Texto Base (Editable)</h3>
                            <textarea
                                className="w-full min-h-[250px] p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#4a6b8c] outline-none text-slate-700 text-sm leading-relaxed resize-y font-serif"
                                value={generatedText}
                                onChange={e => setGeneratedText(e.target.value)}
                            />
                        </div>

                        <div className="space-y-6 mb-8 max-w-4xl mx-auto">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
                                    {regeneratingId === q.id && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                            <div className="flex flex-col items-center text-[#4a6b8c]">
                                                <RefreshCcw className="w-8 h-8 animate-spin mb-2" />
                                                <span className="font-bold text-sm">Regenerando...</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                                        <div className="flex-1 flex items-center gap-3">
                                            <span className="bg-[#1a2e3b] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</span>

                                            <select
                                                value={q.nivel_taxonomico}
                                                onChange={(e) => updateQuestionField(q.id, 'nivel_taxonomico', e.target.value)}
                                                className={cn("px-3 py-1.5 rounded-lg border text-xs font-bold outline-none",
                                                    q.nivel_taxonomico?.includes("Nivel I") ? "bg-green-50 text-green-700 border-green-200" :
                                                        q.nivel_taxonomico?.includes("Nivel II") ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                            "bg-red-50 text-red-700 border-red-200"
                                                )}
                                            >
                                                <option value="Nivel I (Local)">Nivel I (Local)</option>
                                                <option value="Nivel II (Relacional)">Nivel II (Relacional)</option>
                                                <option value="Nivel III (Reflexivo)">Nivel III (Reflexivo)</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => handleRegenerarPregunta(q.id, q.nivel_taxonomico)}
                                            className="text-xs font-bold text-[#4a6b8c] bg-[#4a6b8c]/10 hover:bg-[#4a6b8c]/20 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                                        >
                                            <RefreshCcw size={14} /> Regenerar Ítem
                                        </button>
                                    </div>

                                    <div className="pl-11 space-y-4">
                                        <textarea
                                            value={q.pregunta}
                                            onChange={(e) => updateQuestionField(q.id, 'pregunta', e.target.value)}
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#4a6b8c] outline-none text-slate-800 font-medium text-sm resize-y text-balance"
                                            rows={2}
                                            placeholder="Texto de la pregunta..."
                                        />

                                        <div className="space-y-2">
                                            {q.alternativas?.map((alt: string, aIdx: number) => {
                                                const isCorrect = q.respuesta_correcta === alt ||
                                                    q.respuesta_correcta?.startsWith(String.fromCharCode(65 + aIdx)) ||
                                                    q.respuesta_correcta?.toLowerCase().includes(`opcion ${String.fromCharCode(97 + aIdx)}`) ||
                                                    q.respuesta_correcta?.toLowerCase().includes(`opción ${String.fromCharCode(97 + aIdx)}`);

                                                return (
                                                    <div key={aIdx} className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => updateQuestionField(q.id, 'respuesta_correcta', alt)}
                                                            className={cn("w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors cursor-pointer", isCorrect ? "bg-green-500 text-white border-green-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                                                        >
                                                            {String.fromCharCode(65 + aIdx)}
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={alt}
                                                            onChange={(e) => updateAlternative(q.id, aIdx, e.target.value)}
                                                            className={cn("flex-1 p-2.5 rounded-lg border outline-none text-sm transition-colors", isCorrect ? "border-green-300 bg-green-50/30 font-medium" : "border-slate-200 bg-white focus:border-[#4a6b8c]")}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="bg-[#f2ae60]/10 border border-[#f2ae60]/30 rounded-xl p-4 mt-4">
                                            <label className="text-xs font-bold text-[#f2ae60] uppercase mb-1 block">Justificación Pedagógica</label>
                                            <textarea
                                                value={q.justificacion}
                                                onChange={(e) => updateQuestionField(q.id, 'justificacion', e.target.value)}
                                                className="w-full bg-white p-3 rounded-lg border border-[#f2ae60]/20 focus:border-[#f2ae60] outline-none text-sm text-slate-700 resize-y"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <button onClick={() => setStep(3)} className="w-full py-4 bg-[#f2ae60] hover:bg-[#d99a50] text-white font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98] flex justify-center items-center gap-2">
                                Siguiente: Generar Entregables <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in zoom-in-95 duration-500 max-w-4xl mx-auto text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[#1a2e3b] mb-4">¡Material Listo para Descargar!</h2>
                        <p className="text-slate-500 mb-10 max-w-xl mx-auto">
                            El módulo ha procesado correctamente el insumo y las {questions.length} preguntas con sus respuestas.
                            Puedes descargar los documentos listos para su uso en el aula.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => handleDownload("estudiante")}
                                className="px-8 py-4 bg-white text-[#4a6b8c] border-2 border-[#4a6b8c] hover:bg-[#4a6b8c]/5 font-bold rounded-2xl shadow-sm transition-transform active:scale-[0.98] flex items-center gap-3 w-full sm:w-auto"
                            >
                                <FileText size={24} />
                                <div className="text-left leading-tight">
                                    <span className="block">Descargar Guía</span>
                                    <span className="text-xs font-medium opacity-80">(Versión Estudiante)</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleDownload("profesor")}
                                className="px-8 py-4 bg-[#1a2e3b] hover:bg-[#203e52] text-white font-bold rounded-2xl shadow-xl transition-transform active:scale-[0.98] flex items-center gap-3 w-full sm:w-auto"
                            >
                                <Target size={24} className="text-[#f2ae60]" />
                                <div className="text-left leading-tight">
                                    <span className="block">Descargar Pauta</span>
                                    <span className="text-xs font-medium text-slate-300">(Versión Docente)</span>
                                </div>
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 border-t border-slate-100 pt-8">
                            <span className="text-xs font-bold text-slate-400 uppercase mr-4">Registrar en Bitácora:</span>
                            <BotonGuardar
                                tipo="LECTURA"
                                titulo={`Lectura Inteligente: ${config.subject}`}
                                asignatura={config.subject}
                                nivel={config.grade}
                                contenido={{ ...config, texto: generatedText, preguntas: questions }}
                            />
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button onClick={() => { setStep(1); setConfig({ ...config, oaText: "", customOaId: "", sourceText: "" }); setGeneratedText(""); setQuestions([]); }} className="text-slate-400 hover:text-[#2b546e] flex items-center gap-2 font-bold transition-colors">
                                <RefreshCcw size={16} /> Crear nuevo material
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
