"use client";

import { useState, useEffect, useRef } from "react";
import {
    BrainCircuit, Target, Check, Layers, Sparkles,
    Download, Database, Edit3, ChevronDown, BookOpen, Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from 'canvas-confetti';
import { BotonGuardar } from "@/components/BotonGuardar";

interface OA { id: number; oa_codigo: string; descripcion: string; }
interface RubricCriteria { criterio: string; porcentaje: number; niveles: { insuficiente: string; elemental: string; adecuado: string; destacado: string; }; }
interface RubricResult { titulo: string; descripcion: string; tabla: RubricCriteria[]; }
import { trackEvent } from "@/lib/telemetry";

const NIVEL_ORDER = ["NT1", "NT2", "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio", "3° y 4° Medio"];

const ModernSelect = ({ label, value, options, onChange, placeholder = "Seleccionar...", disabled = false }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

export default function RubricasPage() {
    const [generating, setGenerating] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [mode, setMode] = useState<"bd" | "manual">("bd");

    // --- ESTADO PARA ASIGNATURA MANUAL ---
    const [isManualSubject, setIsManualSubject] = useState(false);

    const [levels, setLevels] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [oas, setOas] = useState<OA[]>([]);

    const [form, setForm] = useState({ nivel: "", asignatura: "", oaId: "", oaDescripcion: "", actividad: "" });
    const [result, setResult] = useState<RubricResult | null>(null);
    const [totalScore, setTotalScore] = useState<number>(60);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (result) setIsDirty(true);
    }, [result]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    // Carga inicial de niveles
    useEffect(() => {
        trackEvent({ eventName: 'page_view', module: 'rubricas' });
        const fetchLevels = async () => { try { const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }); const data = await res.json(); if (data.type === "niveles") setLevels(data.data.sort((a: string, b: string) => (NIVEL_ORDER.indexOf(a) === -1 ? 999 : NIVEL_ORDER.indexOf(a)) - (NIVEL_ORDER.indexOf(b) === -1 ? 999 : NIVEL_ORDER.indexOf(b)))); } catch (e) { console.error(e); } };
        fetchLevels();
    }, []);

    // Carga de Asignaturas (Solo si no es manual)
    useEffect(() => {
        if (form.nivel && mode === "bd") {
            if (isManualSubject) return; // Si es manual, no reseteamos
            setSubjects([]);
            setForm(p => ({ ...p, asignatura: "", oaId: "" }));
            fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nivel: form.nivel }) }).then(r => r.json()).then(d => d.type === "asignaturas" && setSubjects(d.data));
        }
    }, [form.nivel, mode, isManualSubject]);

    // Carga de OAs (Solo si no es manual)
    useEffect(() => {
        if (form.nivel && form.asignatura && mode === "bd") {
            if (isManualSubject) return; // Si es manual, no buscamos en BD
            setOas([]);
            setForm(p => ({ ...p, oaId: "" }));
            fetch("https://profeic-backend-484019506864.us-central1.run.app/curriculum/options", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nivel: form.nivel, asignatura: form.asignatura }) }).then(r => r.json()).then(d => d.type === "oas" && setOas(d.data));
        }
    }, [form.asignatura, mode, isManualSubject]);

    const generar = async () => {
        if (!form.oaDescripcion || !form.actividad) { alert("Faltan datos: Asegúrate de tener un Objetivo y una Actividad."); return; }
        setGenerating(true);
        try {
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/generate-rubric", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            setResult(data);

            // Telemetry: Generation Success
            trackEvent({
                eventName: 'generation_success',
                module: 'rubricas',
                metadata: {
                    level: form.nivel,
                    subject: form.asignatura,
                    is_manual: mode === 'manual'
                }
            });

            setTimeout(() => confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }), 500);
        } catch (e) { alert("Error al generar la rúbrica."); } finally { setGenerating(false); }
    };

    const updateCell = (rowIdx: number, field: string, subfield: string | null, value: string) => {
        if (!result) return;
        const newTable = [...result.tabla];
        if (field === "porcentaje") {
            // @ts-ignore
            newTable[rowIdx][field] = Number(value);
        } else if (subfield) {
            // @ts-ignore
            newTable[rowIdx].niveles[subfield] = value;
        } else {
            // @ts-ignore
            newTable[rowIdx][field] = value;
        }
        setResult({ ...result, tabla: newTable });
    };

    const handleDownloadDocx = async () => {
        if (!result) return;
        setDownloading(true);
        try {
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/export/rubrica-docx", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ titulo: result.titulo, descripcion: result.descripcion, nivel: form.nivel, asignatura: form.asignatura, oa: form.oaDescripcion, actividad: form.actividad, puntaje_total: totalScore, tabla: result.tabla })
            });
            if (res.ok) {
                const blob = await res.blob(); const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = `Rubrica_${form.asignatura}.docx`; document.body.appendChild(a); a.click(); a.remove();
            }
        } catch (e) { alert("Error de conexión"); } finally { setDownloading(false); }
    };

    const calculatePoints = (percent: number, factor: number) => (totalScore * (percent / 100) * factor).toFixed(1);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#1a2e3b] font-sans selection:bg-[#f2ae60]/30">
            {generating && <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center"><div className="relative"><div className="w-24 h-24 border-4 border-slate-700 border-t-[#f2ae60] rounded-full animate-spin"></div><BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-10 h-10 animate-pulse" /></div><h2 className="mt-8 text-2xl font-bold text-white tracking-tight">Diseñando Evaluación...</h2><p className="mt-2 text-slate-400 font-light">Calibrando criterios</p></div>}

            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 py-4 px-8 shadow-sm"><div className="max-w-7xl mx-auto flex items-center gap-3"><div className="w-10 h-10 bg-[#2b546e] rounded-xl flex items-center justify-center text-white shadow-lg"><Layers size={20} /></div><div><h1 className="text-lg font-bold text-[#2b546e] leading-tight">ProfeIC <span className="text-[#f2ae60]">Evaluación</span></h1><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Módulo de Rúbricas</p></div></div></header>

            <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 sticky top-28">
                        <div className="flex items-center gap-3 mb-8"><div className="p-2 bg-[#f2ae60]/10 rounded-lg"><Target className="text-[#f2ae60] w-5 h-5" /></div><h2 className="font-bold text-xl text-[#2b546e]">Parámetros</h2></div>
                        <div className="flex p-1.5 bg-slate-100 rounded-xl mb-8 relative"><div className={cn("absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out", mode === "manual" ? "left-[calc(50%+3px)]" : "left-1.5")} /><button onClick={() => setMode("bd")} className={cn("flex-1 py-2.5 text-xs font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2", mode === "bd" ? "text-[#2b546e]" : "text-slate-400 hover:text-slate-600")}><Database size={14} /> Currículum</button><button onClick={() => setMode("manual")} className={cn("flex-1 py-2.5 text-xs font-bold rounded-lg transition-all relative z-10 flex items-center justify-center gap-2", mode === "manual" ? "text-[#2b546e]" : "text-slate-400 hover:text-slate-600")}><Edit3 size={14} /> Manual</button></div>
                        <div className="space-y-6">
                            {mode === "bd" ? (
                                <div className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-300">
                                    <ModernSelect label="Nivel" value={form.nivel} onChange={(v: string) => setForm({ ...form, nivel: v })} options={levels.map(l => ({ value: l, label: l }))} />

                                    {/* --- ASIGNATURA HÍBRIDA --- */}
                                    <div className="relative">
                                        {!isManualSubject ? (
                                            <ModernSelect
                                                label="Asignatura"
                                                value={form.asignatura}
                                                onChange={(v: string) => setForm({ ...form, asignatura: v })}
                                                options={subjects.map(s => ({ value: s, label: s }))}
                                                disabled={!form.nivel}
                                            />
                                        ) : (
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">Asignatura (Manual)</label>
                                                <input
                                                    type="text"
                                                    value={form.asignatura}
                                                    onChange={(e) => setForm({ ...form, asignatura: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#f2ae60] focus:ring-2 focus:ring-[#f2ae60]/20 outline-none text-sm font-medium transition-all"
                                                    placeholder="Ej: Taller de Periodismo..."
                                                />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setIsManualSubject(!isManualSubject);
                                                setForm(prev => ({ ...prev, asignatura: "", oaId: "", oaDescripcion: "" })); // Limpiar
                                            }}
                                            className="text-[10px] font-bold text-[#2b546e] hover:text-[#f2ae60] underline mt-2 ml-1 flex items-center gap-1"
                                        >
                                            <Edit3 size={10} />
                                            {isManualSubject ? "Volver a lista desplegable" : "¿No está en la lista? Ingresar manualmente"}
                                        </button>
                                    </div>

                                    {/* --- OA HÍBRIDO --- */}
                                    {!isManualSubject ? (
                                        <ModernSelect
                                            label="OA"
                                            value={form.oaId}
                                            onChange={(v: string) => { const o = oas.find(x => x.id.toString() === v); if (o) setForm({ ...form, oaId: v, oaDescripcion: o.descripcion }) }}
                                            options={oas.map(o => ({ value: o.id.toString(), label: `${o.oa_codigo} - ${o.descripcion.substring(0, 50)}...` }))}
                                            disabled={!form.asignatura}
                                        />
                                    ) : (
                                        <div className="animate-in fade-in">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">Objetivo de Aprendizaje</label>
                                            <textarea
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm h-32 resize-none focus:ring-2 focus:ring-[#f2ae60]/20 outline-none transition-all"
                                                placeholder="Escribe aquí el objetivo que deseas evaluar..."
                                                value={form.oaDescripcion}
                                                onChange={e => setForm({ ...form, oaDescripcion: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // MODO MANUAL COMPLETO (LEGACY, PERO ÚTIL SI QUIEREN SALTARSE EL NIVEL)
                                <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">Objetivo (Modo Libre)</label>
                                    <textarea
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm h-32 resize-none focus:ring-2 focus:ring-[#f2ae60]/20 outline-none transition-all"
                                        placeholder="Escribe tu OA..."
                                        onChange={e => setForm({ ...form, oaDescripcion: e.target.value, oaId: "manual", nivel: "Manual", asignatura: "Manual" })}
                                    />
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100"><label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 block ml-1">Producto</label><textarea className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-sm h-28 resize-none focus:ring-4 focus:ring-[#f2ae60]/10 outline-none transition-all font-medium text-[#2b546e]" placeholder="Ej: Maqueta, Ensayo..." value={form.actividad} onChange={e => setForm({ ...form, actividad: e.target.value })} /></div>
                            <button onClick={generar} disabled={generating} className="w-full py-4 rounded-xl font-bold text-white bg-[#2b546e] hover:bg-[#203e52] shadow-xl hover:shadow-2xl hover:-translate-y-1 flex justify-center items-center gap-2 transition-all active:scale-[0.98]"><Sparkles size={18} /> Diseñar Rúbrica</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    {!result ? <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30"><BookOpen size={32} className="mb-4 text-slate-300" /><p>Selecciona un OA para comenzar</p></div> :
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-[#2b546e] font-bold px-2 border-r border-slate-100 pr-4"><Check className="w-5 h-5 text-green-500" /> <span>Listo</span></div>
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200"><Calculator size={16} className="text-slate-400" /><label className="text-xs font-bold text-slate-500 uppercase">Puntaje Total:</label><input type="number" value={totalScore} onChange={(e) => setTotalScore(Number(e.target.value))} className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 text-sm font-bold text-[#2b546e] focus:ring-2 focus:ring-[#f2ae60] outline-none text-center" /><span className="text-xs text-slate-400 font-bold">pts</span></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* --- 2. BOTÓN GUARDAR --- */}
                                    <BotonGuardar
                                        tipo="RUBRICA"
                                        titulo={result.titulo}
                                        asignatura={form.asignatura}
                                        nivel={form.nivel}
                                        contenido={{ ...form, ...result, puntaje_total: totalScore }}
                                    />
                                    <button onClick={handleDownloadDocx} disabled={downloading} className="flex items-center gap-2 text-xs font-bold text-white bg-[#2b546e] px-6 py-2.5 rounded-lg hover:bg-[#1e3a4d] transition-colors shadow-lg shadow-[#2b546e]/20">{downloading ? "Generando..." : <><Download size={16} /> Descargar Word (.docx)</>}</button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden ring-1 ring-black/5">
                                <div className="p-8 border-b-2 border-slate-100 bg-slate-50/50">
                                    <input value={result.titulo} onChange={(e) => setResult({ ...result, titulo: e.target.value })} className="text-2xl font-serif font-bold text-slate-800 bg-transparent w-full border-none focus:ring-0 p-0 mb-3" />
                                    <textarea value={result.descripcion} onChange={(e) => setResult({ ...result, descripcion: e.target.value })} className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-slate-600 h-auto" rows={2} />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] text-left border-collapse">
                                        <thead><tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-700"><th className="p-5 w-[20%] text-[11px] font-bold uppercase tracking-wider">Criterio & Peso</th><th className="p-5 w-[20%] text-[11px] font-bold uppercase tracking-wider border-l border-slate-200 bg-[#ffebee]">Insuficiente</th><th className="p-5 w-[20%] text-[11px] font-bold uppercase tracking-wider border-l border-slate-200 bg-[#fff8e1]">Elemental</th><th className="p-5 w-[20%] text-[11px] font-bold uppercase tracking-wider border-l border-slate-200 bg-[#f1f8e9]">Adecuado</th><th className="p-5 w-[20%] text-[11px] font-bold uppercase tracking-wider border-l border-slate-200 bg-[#e3f2fd]">Destacado</th></tr></thead>
                                        <tbody className="text-sm divide-y divide-slate-100">
                                            {result.tabla.map((row, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-5 align-top bg-white">
                                                        <textarea className="w-full h-52 p-0 border-none bg-transparent font-bold text-slate-800 focus:ring-0 text-sm leading-snug resize-y" value={row.criterio} onChange={(e) => updateCell(idx, "criterio", null, e.target.value)} />

                                                        {/* INPUT DE PESO EDITABLE */}
                                                        <div className="mt-4 flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Peso:</span>
                                                            <input type="number" className="w-12 text-xs font-bold text-center border rounded focus:ring-2 focus:ring-[#f2ae60] outline-none" value={row.porcentaje} onChange={(e) => updateCell(idx, "porcentaje", null, e.target.value)} />
                                                            <span className="text-[10px] font-bold text-slate-400">%</span>
                                                        </div>
                                                        <div className="mt-1 text-[10px] font-bold text-[#f2ae60] text-right">Máx: {calculatePoints(row.porcentaje, 1)} pts</div>
                                                    </td>
                                                    {["insuficiente", "elemental", "adecuado", "destacado"].map((lvl, i) => {
                                                        const factors = [0.25, 0.5, 0.75, 1];
                                                        const bgColors = ["bg-[#fff5f5]", "bg-[#fffcf2]", "bg-[#f6fffa]", "bg-[#f5f9ff]"];
                                                        const textColors = ["text-red-400", "text-yellow-500", "text-green-600", "text-blue-600"];
                                                        return (
                                                            <td key={lvl} className={cn("p-5 align-top border-l border-slate-100 transition-colors relative", bgColors[i])}>
                                                                <textarea className="w-full h-52 p-0 border-none bg-transparent text-slate-700 focus:ring-0 text-xs leading-relaxed resize-y pb-6"
                                                                    // @ts-ignore
                                                                    value={row.niveles[lvl]} onChange={(e) => updateCell(idx, "niveles", lvl, e.target.value)} />
                                                                <span className={cn("absolute bottom-2 right-2 text-[10px] font-bold bg-white/80 px-1.5 rounded border border-white/50", textColors[i])}>
                                                                    {calculatePoints(row.porcentaje, factors[i])} pts
                                                                </span>
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>}
                </div>
            </main>
        </div>
    );
}