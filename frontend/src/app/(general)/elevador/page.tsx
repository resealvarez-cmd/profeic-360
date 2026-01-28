"use client";
import { useState, useEffect } from "react";
import {
    TrendingUp, ArrowRight, CheckCircle2,
    HelpCircle, Layout, Ticket, AlertTriangle, ChevronDown, Sparkles, Download, Loader2, BrainCircuit
} from "lucide-react";
// --- 1. IMPORTAMOS EL BOTÓN INTELIGENTE ---
import { BotonGuardar } from "@/components/BotonGuardar";

export default function ElevadorPage() {
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [grades, setGrades] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);

    const [form, setForm] = useState({
        activity: "",
        grade: "",
        subject: ""
    });

    useEffect(() => {
        async function fetchGrades() {
            try {
                const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({})
                });
                const data = await res.json();
                if (data.type === "niveles" && Array.isArray(data.data)) {
                    setGrades(data.data);
                    // Selección inteligente: Si no hay selección, elige el primero
                    if (data.data.length > 0 && !form.grade) setForm(prev => ({ ...prev, grade: data.data[0] }));
                }
            } catch (e) { setGrades(["1° Medio", "2° Medio"]); }
        }
        fetchGrades();
    }, []);

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
            propuestas: { ...prev.propuestas, [field]: value }
        }));
    };

    const elevar = async () => {
        if (!form.activity.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/elevate", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
            });
            if (!res.ok) throw new Error("Error");
            const data = await res.json();
            setResult(data);
        } catch (error) { alert("Error de conexión."); }
        finally { setLoading(false); }
    };

    const descargarDocx = async () => {
        if (!result) return;
        setDownloading(true);
        try {
            const payload = { ...form, ...result };
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/export/elevador-docx", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Error generando archivo");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Elevador_Cognitivo_ProfeIC.docx";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) { alert("Error al descargar."); }
        finally { setDownloading(false); }
    };

    return (
        <div className="min-h-screen bg-[#f0f4f8] text-[#1a2e3b] font-sans selection:bg-[#f2ae60] selection:text-white relative">

            {/* --- OVERLAY CORPORATIVO (Idéntico al Planificador) --- */}
            {loading && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="mb-6 relative">
                        {/* Efecto de brillo naranja detrás del cerebro */}
                        <div className="absolute inset-0 bg-[#f2ae60]/20 blur-xl rounded-full"></div>
                        <BrainCircuit size={64} className="text-[#f2ae60] relative z-10 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-wide">Cerebro Digital Trabajando</h3>
                    <p className="text-slate-300 text-sm font-medium">Elevando la complejidad cognitiva de la actividad...</p>
                </div>
            )}

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#2b546e] to-[#1a2e3b] rounded-lg text-white shadow-md">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#1a2e3b]">Elevador Cognitivo</h1>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Diseño Instruccional</p>
                        </div>
                    </div>
                    {/* Botonera Superior */}
                    <div className="flex items-center gap-3">
                        {/* --- 2. AQUÍ INSERTAMOS EL BOTÓN --- */}
                        <BotonGuardar
                            tipo="ELEVADOR"
                            titulo={`Elevador DOK: ${form.subject}`}
                            asignatura={form.subject}
                            nivel={form.grade}
                            contenido={result ? { ...form, ...result } : null}
                        />

                        {result && (
                            <button
                                onClick={descargarDocx}
                                disabled={downloading}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[#1a2e3b] hover:border-[#f2ae60] transition-all shadow-sm text-sm font-bold h-10"
                            >
                                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                Exportar DOCX
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- INPUTS --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-[#1a2e3b]">
                            <Layout size={20} className="text-[#f2ae60]" /> Configuración
                        </h2>

                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Nivel Educativo</label>
                                <div className="relative">
                                    <select name="grade" value={form.grade} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:ring-2 focus:ring-[#f2ae60]/50 outline-none text-slate-700 font-medium">
                                        {grades.length === 0 ? <option>Cargando...</option> : grades.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Asignatura</label>
                                <div className="relative">
                                    <select name="subject" value={form.subject} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none focus:ring-2 focus:ring-[#f2ae60]/50 outline-none text-slate-700 font-medium">
                                        {subjects.length === 0 ? <option>Seleccione nivel...</option> : subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Actividad Base</label>
                                <textarea
                                    name="activity"
                                    value={form.activity}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#f2ae60]/50 min-h-[140px] text-slate-700 resize-none outline-none text-sm"
                                    placeholder="Ej: Pintar el mapa de Chile..."
                                />
                            </div>

                            <button
                                onClick={elevar}
                                disabled={loading || !form.activity}
                                className="w-full py-4 bg-[#1a2e3b] hover:bg-[#233d4d] text-white font-bold rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2"
                            >
                                <Sparkles size={18} className="text-[#f2ae60]" />
                                <span>Elevar Nivel</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RESULTADOS --- */}
                <div className="lg:col-span-8">
                    {!result ? (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12">
                            <TrendingUp size={40} className="text-slate-300 mb-4" />
                            <p className="text-sm text-center">Configura la actividad para comenzar.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

                            {/* Diagnóstico */}
                            <div className="bg-white border-l-4 border-[#f2ae60] p-8 rounded-3xl shadow-lg shadow-slate-200/40 flex gap-4">
                                <div className="p-3 bg-orange-50 text-[#f2ae60] rounded-xl shrink-0 h-fit"><AlertTriangle size={24} /></div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-[#1a2e3b] text-lg">Diagnóstico</h3>
                                        <span className="px-3 py-1 bg-[#f2ae60]/10 text-[#d48c3b] text-xs font-bold rounded-full uppercase border border-[#f2ae60]/20">{result.dok_actual}</span>
                                    </div>
                                    <p className="text-slate-600 text-[15px]">{result.diagnostico}</p>
                                </div>
                            </div>

                            {/* Escalera */}
                            {result.escalera && (
                                <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-50">
                                    <h3 className="font-bold text-[#1a2e3b] mb-6 flex items-center gap-2"><ArrowRight className="text-[#f2ae60]" size={20} /> Escalera de Aprendizaje</h3>
                                    <div className="space-y-4">
                                        {result.escalera.map((step: any, idx: number) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-[#1a2e3b] text-white flex items-center justify-center text-xs font-bold shrink-0">{step.paso}</div>
                                                <p className="text-slate-700 font-medium text-[15px] pt-1">{step.accion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Propuestas EDITABLES */}
                            {result.propuestas && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2 px-2">
                                        <CheckCircle2 className="text-green-500" size={20} />
                                        <h3 className="font-bold text-[#1a2e3b]">Propuesta Nivel 4 (Editable)</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Actividad */}
                                        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-green-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-green-800">
                                                <Layout size={18} /> <span className="font-bold text-xs uppercase">Actividad de Aula</span>
                                            </div>
                                            <textarea
                                                value={result.propuestas.actividad}
                                                onChange={(e) => handleResultEdit('actividad', e.target.value)}
                                                className="w-full bg-slate-50 p-3 rounded-xl border-none resize-none text-[#1a2e3b] text-[15px] focus:ring-2 focus:ring-green-200 outline-none"
                                                rows={4}
                                            />
                                        </div>

                                        {/* Pregunta */}
                                        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-blue-700">
                                                <HelpCircle size={18} /> <span className="font-bold text-xs uppercase">Pregunta Esencial</span>
                                            </div>
                                            <textarea
                                                value={result.propuestas.pregunta}
                                                onChange={(e) => handleResultEdit('pregunta', e.target.value)}
                                                className="w-full bg-slate-50 p-3 rounded-xl border-none resize-none text-slate-600 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                                                rows={4}
                                            />
                                        </div>

                                        {/* Ticket */}
                                        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3 text-purple-700">
                                                <Ticket size={18} /> <span className="font-bold text-xs uppercase">Ticket de Salida</span>
                                            </div>
                                            <textarea
                                                value={result.propuestas.ticket}
                                                onChange={(e) => handleResultEdit('ticket', e.target.value)}
                                                className="w-full bg-slate-50 p-3 rounded-xl border-none resize-none text-slate-600 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}