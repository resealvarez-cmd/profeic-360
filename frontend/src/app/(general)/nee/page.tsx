"use client";
import { useState, useEffect } from "react";
import {
    Heart, Layout, Sparkles, ChevronDown, Download, Loader2,
    BrainCircuit, Accessibility, Ear, Eye, Puzzle, CheckCircle2
} from "lucide-react";
// --- 1. IMPORTAMOS EL BOTÓN INTELIGENTE ---
import { BotonGuardar } from "@/components/BotonGuardar";

// Lista de Diagnósticos Comunes (Para agilizar)
const DIAGNOSES = [
    "TDAH (Déficit Atencional)",
    "TEA (Trastorno Espectro Autista)",
    "DEA (Dificultad Específica Aprendizaje)",
    "FIL (Funcionamiento Intelectual Limítrofe)",
    "TEL (Trastorno Específico del Lenguaje)",
    "Discapacidad Auditiva",
    "Discapacidad Visual",
    "Otro / Sin Diagnóstico"
];

export default function NeePage() {
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [result, setResult] = useState<any>(null);

    // Listas dinámicas de Supabase
    const [grades, setGrades] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);

    const [form, setForm] = useState({
        grade: "",
        subject: "",
        diagnosis: "TDAH (Déficit Atencional)",
        barrier: "",
        activity: ""
    });

    // Carga de Cursos
    useEffect(() => {
        async function fetchGrades() {
            try {
                const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({})
                });
                const data = await res.json();
                if (data.type === "niveles" && Array.isArray(data.data)) {
                    setGrades(data.data);
                    if (data.data.length > 0) setForm(prev => ({ ...prev, grade: data.data[0] }));
                }
            } catch (e) { setGrades(["1° Medio", "2° Medio"]); }
        }
        fetchGrades();
    }, []);

    // Carga de Asignaturas
    useEffect(() => {
        if (!form.grade) return;
        async function fetchSubjects() {
            try {
                const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nivel: form.grade })
                });
                const data = await res.json();
                if (data.type === "asignaturas" && Array.isArray(data.data)) {
                    setSubjects(data.data);
                    if (data.data.length > 0) setForm(prev => ({ ...prev, subject: data.data[0] }));
                }
            } catch (e) { setSubjects(["Historia", "Lenguaje"]); }
        }
        fetchSubjects();
    }, [form.grade]);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleResultEdit = (field: string, value: string) => {
        setResult((prev: any) => ({
            ...prev,
            estrategias: { ...prev.estrategias, [field]: value }
        }));
    };

    const generar = async () => {
        if (!form.activity.trim() || !form.barrier.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/nee/generate", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
            });
            if (!res.ok) throw new Error("Error");
            const data = await res.json();
            setResult(data);
        } catch (error) { alert("Error de conexión con el Asistente de Inclusión."); }
        finally { setLoading(false); }
    };

    const descargarDocx = async () => {
        if (!result) return;
        setDownloading(true);
        try {
            const payload = { ...form, ...result };
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/nee/download", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Adecuacion_${form.grade}_${form.diagnosis.split(' ')[0]}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) { alert("Error al descargar."); }
        finally { setDownloading(false); }
    };

    return (
        <div className="min-h-screen bg-[#f0f4f8] text-[#1a2e3b] font-sans selection:bg-teal-200 selection:text-teal-900 relative">

            {/* --- OVERLAY OSCURO --- */}
            {loading && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="mb-6 relative">
                        <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full"></div>
                        <BrainCircuit size={64} className="text-teal-400 relative z-10 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Especialista DUA Trabajando</h3>
                    <p className="text-slate-300 text-sm font-medium">Diseñando adecuaciones curriculares personalizadas...</p>
                </div>
            )}

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-teal-700 to-teal-900 rounded-lg text-white shadow-md">
                            <Heart size={24} className="fill-white/20" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#1a2e3b]">Asistente de Inclusión (NEE)</h1>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Programa de Integración Escolar</p>
                        </div>
                    </div>

                    {/* Botonera Superior */}
                    <div className="flex items-center gap-3">
                        {/* --- 2. AQUÍ INSERTAMOS EL BOTÓN GUARDAR --- */}
                        <BotonGuardar
                            tipo="ESTRATEGIA"
                            titulo={`Adecuación: ${form.diagnosis}`}
                            asignatura={form.subject}
                            nivel={form.grade}
                            contenido={result ? { ...form, ...result } : null}
                        />

                        {result && (
                            <button
                                onClick={descargarDocx}
                                disabled={downloading}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-teal-700 hover:border-teal-500 transition-all shadow-sm text-sm font-bold h-10"
                            >
                                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                Exportar Adecuación
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- PANEL IZQUIERDO: PERFIL DEL ESTUDIANTE --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-[#1a2e3b]">
                            <Layout size={20} className="text-teal-500" /> Contexto & Perfil
                        </h2>

                        <div className="space-y-5">
                            {/* Curso y Asignatura */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="group">
                                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Curso</label>
                                    <div className="relative">
                                        <select name="grade" value={form.grade} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:ring-2 focus:ring-teal-500/30 text-xs font-bold text-slate-700 outline-none">
                                            {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Asignatura</label>
                                    <div className="relative">
                                        <select name="subject" value={form.subject} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:ring-2 focus:ring-teal-500/30 text-xs font-bold text-slate-700 outline-none">
                                            {subjects.length === 0 ? <option>...</option> : subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                    </div>
                                </div>
                            </div>

                            {/* Diagnóstico */}
                            <div className="group">
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Diagnóstico / Condición</label>
                                <div className="relative">
                                    <select name="diagnosis" value={form.diagnosis} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:ring-2 focus:ring-teal-500/30 font-medium text-slate-700 outline-none">
                                        {DIAGNOSES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Barrera Específica (CRUCIAL) */}
                            <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Barrera Específica (¿Qué le cuesta?)</label>
                                <textarea
                                    name="barrier"
                                    value={form.barrier}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500/30 min-h-[100px] text-slate-700 resize-none outline-none text-sm placeholder:text-slate-400"
                                    placeholder="Ej: Se frustra con textos largos, le molestan los ruidos fuertes, le cuesta seguir instrucciones verbales..."
                                />
                            </div>

                            {/* Actividad Original */}
                            <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Actividad Planificada</label>
                                <textarea
                                    name="activity"
                                    value={form.activity}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500/30 min-h-[100px] text-slate-700 resize-none outline-none text-sm placeholder:text-slate-400"
                                    placeholder="Ej: Leer un cuento y responder preguntas escritas..."
                                />
                            </div>

                            <button
                                onClick={generar}
                                disabled={loading || !form.activity || !form.barrier}
                                className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-50"
                            >
                                <Sparkles size={18} className="text-teal-200" />
                                <span>Generar Adecuaciones</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- PANEL DERECHO: ESTRATEGIAS (RESULTADOS) --- */}
                <div className="lg:col-span-8">
                    {!result ? (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12">
                            <Puzzle size={40} className="text-slate-300 mb-4" />
                            <p className="text-sm text-center max-w-sm">
                                Describe la barrera del estudiante y la actividad. La IA diseñará una estrategia de acceso, actividad y evaluación.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                            {/* Principios DUA */}
                            <div className="bg-teal-50 border border-teal-100 p-6 rounded-3xl flex gap-4 items-center">
                                <div className="p-3 bg-teal-100 text-teal-700 rounded-xl shrink-0"><BrainCircuit size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-teal-900 text-sm uppercase tracking-wide mb-1">Enfoque DUA Aplicado</h3>
                                    <p className="text-teal-800 text-[15px]">{result.dua_principles}</p>
                                </div>
                            </div>

                            {/* Tarjetas de Estrategia EDITABLES */}
                            <div className="grid grid-cols-1 gap-6">

                                {/* 1. Acceso */}
                                <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-2 mb-3 text-blue-700">
                                        <Accessibility size={20} /> <span className="font-bold text-sm uppercase">1. Adecuación de Acceso (Preparación)</span>
                                    </div>
                                    <textarea
                                        value={result.estrategias.acceso}
                                        onChange={(e) => handleResultEdit('acceso', e.target.value)}
                                        className="w-full bg-slate-50 p-4 rounded-xl border-none resize-none text-slate-700 text-[15px] focus:ring-2 focus:ring-blue-200 outline-none leading-relaxed"
                                        rows={4}
                                    />
                                </div>

                                {/* 2. Actividad */}
                                <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-2 mb-3 text-purple-700">
                                        <Layout size={20} /> <span className="font-bold text-sm uppercase">2. Adecuación de la Actividad (Durante)</span>
                                    </div>
                                    <textarea
                                        value={result.estrategias.actividad}
                                        onChange={(e) => handleResultEdit('actividad', e.target.value)}
                                        className="w-full bg-slate-50 p-4 rounded-xl border-none resize-none text-slate-700 text-[15px] focus:ring-2 focus:ring-purple-200 outline-none leading-relaxed"
                                        rows={6}
                                    />
                                </div>

                                {/* 3. Evaluación */}
                                <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-2 mb-3 text-orange-700">
                                        <CheckCircle2 size={20} /> <span className="font-bold text-sm uppercase">3. Evaluación Diversificada (Cierre)</span>
                                    </div>
                                    <textarea
                                        value={result.estrategias.evaluacion}
                                        onChange={(e) => handleResultEdit('evaluacion', e.target.value)}
                                        className="w-full bg-slate-50 p-4 rounded-xl border-none resize-none text-slate-700 text-[15px] focus:ring-2 focus:ring-orange-200 outline-none leading-relaxed"
                                        rows={4}
                                    />
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}