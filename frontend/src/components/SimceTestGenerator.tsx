"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2, ChevronRight, ChevronLeft, Upload, Sparkles, FileText,
    ClipboardList, Loader2, Download, BookOpen, BarChart3, Layers,
    Image as ImageIcon, X, Pencil, Save, Eye, EyeOff, AlertCircle,
    ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// SIMCE JSON keys must match tablas_especificaciones_simce.json exactly
const NIVELES = ["4° Básico", "6° Básico", "8° Básico", "II Medio"];

const ASIGNATURAS_SIMCE = [
    "Lenguaje y Comunicación - Lectura",
    "Matemática",
    "Ciencias Naturales",
    "Historia, Geografía y Ciencias Sociales",
];

// Display labels for select UI
const ASIGNATURAS_UI: Record<string, string> = {
    "Lenguaje y Comunicación - Lectura": "Lenguaje y Comunicación",
    Matemática: "Matemática",
    "Ciencias Naturales": "Ciencias Naturales",
    "Historia, Geografía y Ciencias Sociales": "Historia, Geografía y Cs. Sociales",
};

type Mode = "formativo" | "simce";
type StimulusMode = "upload" | "auto" | null;

const OAS_MOCK: Record<string, { id: string; texto: string }[]> = {
    "Lenguaje y Comunicación - Lectura": [
        { id: "OA1", texto: "OA1 · Leer y comprender textos con estrategias de comprensión lectora." },
        { id: "OA2", texto: "OA2 · Localizar información explícita en textos literarios y no literarios." },
        { id: "OA3", texto: "OA3 · Interpretar y relacionar elementos del texto para construir significados." },
        { id: "OA4", texto: "OA4 · Reflexionar críticamente sobre los textos leídos." },
        { id: "OA5", texto: "OA5 · Leer en voz alta con fluidez y entonación adecuada." },
    ],
    Matemática: [
        { id: "OA1", texto: "OA1 · Números y operaciones con racionales e irracionales." },
        { id: "OA2", texto: "OA2 · Álgebra, funciones y ecuaciones." },
        { id: "OA3", texto: "OA3 · Geometría plana y espacial." },
        { id: "OA4", texto: "OA4 · Probabilidad y estadística descriptiva." },
        { id: "OA5", texto: "OA5 · Medición y unidades del SI." },
    ],
    "Ciencias Naturales": [
        { id: "OA1", texto: "OA1 · Biología celular y sistemas del cuerpo humano." },
        { id: "OA2", texto: "OA2 · Química: materia, reacciones y compuestos." },
        { id: "OA3", texto: "OA3 · Física: fuerzas, energía y movimiento." },
        { id: "OA4", texto: "OA4 · Ecosistemas e impacto ambiental." },
        { id: "OA5", texto: "OA5 · Habilidades de investigación científica." },
    ],
    "Historia, Geografía y Ciencias Sociales": [
        { id: "OA1", texto: "OA1 · Pensamiento temporal y espacial." },
        { id: "OA2", texto: "OA2 · Análisis y trabajo con fuentes de información." },
        { id: "OA3", texto: "OA3 · Pensamiento crítico sobre hechos sociales." },
        { id: "OA4", texto: "OA4 · Historia de Chile y América." },
        { id: "OA5", texto: "OA5 · Formación ciudadana y democracia." },
    ],
};

const LOADING_MESSAGES = [
    "🔍 Analizando currículum MINEDUC...",
    "🧠 Seleccionando objetivos de aprendizaje...",
    "📊 Cargando tabla de especificaciones SIMCE...",
    "📚 Consultando indicadores curriculares...",
    "✍️ Redactando ítems con IA...",
    "📐 Ajustando distribución de habilidades...",
    "🔎 Revisando calidad técnica de los ítems...",
    "📋 Estructurando el instrumento final...",
    "✅ Finalizando...",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    nivel: string;
    asignatura: string;
    cantidad: number;
    modo: Mode;
    oasSeleccionados: string[];
    stimulusMode: StimulusMode;
    uploadedFile: File | null;
}

interface Pregunta {
    numero: number;
    habilidad_medida: string;
    enunciado: string;
    alternativas: Record<string, any>; // Puede ser string o {texto: string, ...}
    correcta: string;
    justificacion: string;
    estimulo_texto?: string;
    estimulo_imagen?: string;
}

interface BloqueEnsayo {
    tipo_estimulo: string;
    contenido_estimulo: string;
    ruta_local?: string;
    preguntas: Pregunta[];
}

interface GeneratedResult {
    titulo: string;
    asignatura: string;
    nivel: string;
    cantidad_preguntas: number;
    modo: string;
    blueprint_resumen: string;
    estimulo_texto?: string;
    estimulo_imagen?: string;
    ensayo: BloqueEnsayo[];
    preguntas: Pregunta[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}

async function downloadBlob(
    url: string,
    body: object,
    token: string,
    fallbackName: string
) {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
        throw new Error(err.detail ?? "Error al descargar");
    }

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
    const filename = match ? decodeURIComponent(match[1].replace(/"/g, "")) : fallbackName;

    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
    const steps = [
        { label: "Parámetros", icon: <Layers size={16} /> },
        { label: "Cobertura", icon: <BookOpen size={16} /> },
        { label: "Generar", icon: <Sparkles size={16} /> },
    ];
    return (
        <div className="flex items-center gap-0 w-full mb-8">
            {steps.map((step, i) => {
                const done = i < current, active = i === current;
                return (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${done ? "bg-[#C87533] text-white shadow-md shadow-[#C87533]/30"
                                : active ? "bg-[#1B3C73] text-white ring-4 ring-[#1B3C73]/20 shadow-md"
                                    : "bg-slate-200 text-slate-400"
                                }`}>
                                {done ? <CheckCircle2 size={18} /> : step.icon}
                            </div>
                            <span className={`text-xs font-semibold whitespace-nowrap ${active ? "text-[#1B3C73]" : done ? "text-[#C87533]" : "text-slate-400"
                                }`}>{step.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-2 mb-4 rounded-full transition-all duration-500 ${i < current ? "bg-[#C87533]" : "bg-slate-200"
                                }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Parámetros del Instrumento</h2>
                <p className="text-sm text-slate-500 mt-1">Configura nivel, asignatura y tipo de evaluación.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nivel Educativo</label>
                    <select value={data.nivel} onChange={e => onChange({ nivel: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#C87533]/40 focus:border-[#C87533] transition-all">
                        <option value="">Seleccionar nivel...</option>
                        {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Asignatura</label>
                    <select value={data.asignatura} onChange={e => onChange({ asignatura: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#C87533]/40 focus:border-[#C87533] transition-all">
                        <option value="">Seleccionar asignatura...</option>
                        {ASIGNATURAS_SIMCE.map(a => <option key={a} value={a}>{ASIGNATURAS_UI[a]}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Cantidad de Preguntas: <span className="text-[#C87533] text-base font-extrabold">{data.cantidad}</span>
                </label>
                <input type="range" min={20} max={45} value={data.cantidad}
                    onChange={e => onChange({ cantidad: Number(e.target.value) })}
                    className="w-full accent-[#C87533] cursor-pointer" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>20 (mínimo)</span><span>45 (máximo SIMCE)</span>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Modo de Evaluación</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {([
                        { val: "formativo" as const, title: "Ensayo Formativo Libre", desc: "Selección manual de OAs y configuración flexible.", icon: <ClipboardList size={22} className="text-blue-500" /> },
                        { val: "simce" as const, title: "Simulación SIMCE Estricta", desc: "Usa tabla de especificaciones oficial MINEDUC.", icon: <BarChart3 size={22} className="text-[#C87533]" /> },
                    ]).map(opt => (
                        <button key={opt.val} type="button" onClick={() => onChange({ modo: opt.val })}
                            className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${data.modo === opt.val
                                ? opt.val === "simce" ? "border-[#C87533] bg-[#C87533]/5 shadow-md" : "border-[#1B3C73] bg-[#1B3C73]/5 shadow-md"
                                : "border-slate-200 bg-white hover:border-slate-300"
                                }`}>
                            {data.modo === opt.val && (
                                <span className="absolute top-3 right-3">
                                    <CheckCircle2 size={16} className={opt.val === "simce" ? "text-[#C87533]" : "text-[#1B3C73]"} />
                                </span>
                            )}
                            <div className="flex items-center gap-3 mb-1">{opt.icon}<span className="font-bold text-sm text-slate-800">{opt.title}</span></div>
                            <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const oas = data.asignatura ? (OAS_MOCK[data.asignatura] ?? []) : [];
    const toggleOA = (id: string) => {
        const sel = data.oasSeleccionados;
        onChange({ oasSeleccionados: sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id] });
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        onChange({ uploadedFile: file, stimulusMode: file ? "upload" : null });
    };
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Cobertura Curricular y Estímulos</h2>
                <p className="text-sm text-slate-500 mt-1">
                    {data.modo === "formativo"
                        ? "Selecciona los Objetivos de Aprendizaje que medirá el instrumento."
                        : "El modo SIMCE Estricto aplica la tabla de especificaciones oficial. Solo configura los estímulos."}
                </p>
            </div>

            {data.modo === "formativo" && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">OAs — {(ASIGNATURAS_UI[data.asignatura] ?? data.asignatura) || "Selecciona asignatura"}</span>
                        <span className="text-xs font-semibold text-[#C87533] bg-[#C87533]/10 px-2 py-0.5 rounded-full">{data.oasSeleccionados.length} seleccionados</span>
                    </div>
                    {oas.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-400">Selecciona una asignatura en el paso anterior.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {oas.map(oa => {
                                const checked = data.oasSeleccionados.includes(oa.id);
                                return (
                                    <label key={oa.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? "bg-blue-50/60" : "hover:bg-slate-50"}`}>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${checked ? "bg-[#1B3C73] border-[#1B3C73]" : "border-slate-300 bg-white"}`}
                                            onClick={() => toggleOA(oa.id)}>
                                            {checked && <CheckCircle2 size={12} className="text-white" />}
                                        </div>
                                        <span className="text-sm text-slate-700 leading-snug">{oa.texto}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {data.modo === "simce" && (
                <div className="bg-[#C87533]/5 border border-[#C87533]/20 rounded-xl p-4 flex items-start gap-3">
                    <BarChart3 size={20} className="text-[#C87533] flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Tabla de Especificaciones SIMCE Activa</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            La distribución de habilidades se calculará automáticamente para {data.nivel || "el nivel"} en {(ASIGNATURAS_UI[data.asignatura] ?? data.asignatura) || "la asignatura"}.
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-gradient-to-br from-slate-900 to-[#1B3C73] rounded-2xl p-5 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                    <ImageIcon size={18} className="text-[#f2ae60]" />
                    <span className="text-sm font-bold text-[#f2ae60] uppercase tracking-wider">Estímulos Visuales y Textos</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Agrega gráficos o imágenes. Puedes subir los tuyos o dejar que la IA los genere.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all group ${data.stimulusMode === "upload" ? "border-[#C87533] bg-[#C87533]/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"}`}>
                        <Upload size={24} className={data.stimulusMode === "upload" ? "text-[#C87533]" : "text-slate-400 group-hover:text-white"} />
                        <span className="text-xs font-semibold text-center leading-snug">Subir imagen propia<br /><span className="font-normal text-slate-400">(BYOI)</span></span>
                        {data.uploadedFile && <span className="text-[10px] text-[#C87533] bg-[#C87533]/10 px-2 py-0.5 rounded-full truncate max-w-[120px]">{data.uploadedFile.name}</span>}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                    <button type="button" onClick={() => onChange({ stimulusMode: data.stimulusMode === "auto" ? null : "auto", uploadedFile: null })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all group ${data.stimulusMode === "auto" ? "border-[#f2ae60] bg-[#f2ae60]/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"}`}>
                        <Sparkles size={24} className={data.stimulusMode === "auto" ? "text-[#f2ae60]" : "text-slate-400 group-hover:text-white"} />
                        <span className="text-xs font-semibold text-center leading-snug">IA genera gráficos<br /><span className="font-normal text-slate-400">según el contexto</span></span>
                        {data.stimulusMode === "auto" && <span className="text-[10px] text-[#f2ae60] bg-[#f2ae60]/10 px-2 py-0.5 rounded-full">✓ Seleccionado</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Editable Question Card ───────────────────────────────────────────────────

function PreguntaCard({
    pregunta,
    index,
    onEdit,
}: {
    pregunta: Pregunta;
    index: number;
    onEdit: (updated: Pregunta) => void;
}) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<Pregunta>(pregunta);

    const save = () => {
        onEdit(draft);
        setEditing(false);
    };

    const altColors: Record<string, string> = { A: "bg-blue-50 border-blue-200", B: "bg-purple-50 border-purple-200", C: "bg-amber-50 border-amber-200", D: "bg-rose-50 border-rose-200" };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Card header */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
            >
                <div className="w-7 h-7 rounded-lg bg-[#1B3C73] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {pregunta.numero}
                </div>
                <span className="text-xs font-semibold text-[#C87533] bg-[#C87533]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                    {pregunta.habilidad_medida}
                </span>
                <span className="text-sm text-slate-700 flex-1 truncate">{pregunta.enunciado}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 w-5 h-5 flex items-center justify-center rounded-full">{pregunta.correcta}</span>
                    {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                </div>
            </button>

            {/* Expanded content */}
            {open && (
                <div className="border-t border-slate-100 px-4 py-4 space-y-3">
                    {editing ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enunciado</label>
                                <textarea
                                    rows={3}
                                    value={draft.enunciado}
                                    onChange={e => setDraft(d => ({ ...d, enunciado: e.target.value }))}
                                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87533]/40 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {["A", "B", "C", "D"].map(letra => (
                                    <div key={letra}>
                                        <label className="text-xs font-bold text-slate-500">{letra})</label>
                                        <input
                                            type="text"
                                            value={draft.alternativas[letra] ?? ""}
                                            onChange={e => setDraft(d => ({ ...d, alternativas: { ...d.alternativas, [letra]: e.target.value } }))}
                                            className="w-full mt-0.5 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C87533]/40"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correcta</label>
                                    <select value={draft.correcta} onChange={e => setDraft(d => ({ ...d, correcta: e.target.value }))}
                                        className="ml-2 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#C87533]/40">
                                        {["A", "B", "C", "D"].map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Justificación</label>
                                <textarea rows={2} value={draft.justificacion}
                                    onChange={e => setDraft(d => ({ ...d, justificacion: e.target.value }))}
                                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C87533]/40 resize-none" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={save} className="flex items-center gap-1.5 bg-[#1B3C73] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#152f5a] transition-colors">
                                    <Save size={12} /> Guardar
                                </button>
                                <button onClick={() => { setDraft(pregunta); setEditing(false); }} className="flex items-center gap-1.5 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                                    <X size={12} /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-800 leading-relaxed font-medium">{pregunta.enunciado}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {["A", "B", "C", "D"].map(letra => (
                                    <div key={letra} className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${letra === pregunta.correcta ? "bg-emerald-50 border-emerald-200" : altColors[letra]}`}>
                                        <span className={`font-bold w-5 flex-shrink-0 ${letra === pregunta.correcta ? "text-emerald-700" : "text-slate-500"}`}>{letra})</span>
                                        <span className={`${letra === pregunta.correcta ? "text-emerald-800 font-semibold" : "text-slate-700"} leading-snug`}>{pregunta.alternativas[letra]}</span>
                                        {letra === pregunta.correcta && <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />}
                                    </div>
                                ))}
                            </div>
                            {pregunta.justificacion && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Justificación Pedagógica</p>
                                    <p className="text-xs text-amber-800 leading-relaxed">{pregunta.justificacion}</p>
                                </div>
                            )}
                            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-[#1B3C73] hover:text-[#C87533] font-semibold transition-colors">
                                <Pencil size={12} /> Editar esta pregunta
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

function Step3({ data }: { data: FormData }) {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [msgIdx, setMsgIdx] = useState(0);
    const [result, setResult] = useState<GeneratedResult | null>(null);
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [showBlueprint, setShowBlueprint] = useState(false);
    const [downloading, setDownloading] = useState<"cuadernillo" | "pauta" | "omr" | null>(null);

    useEffect(() => {
        if (!generating) return;
        const iv = setInterval(() => setMsgIdx(p => Math.min(p + 1, LOADING_MESSAGES.length - 1)), 2000);
        return () => clearInterval(iv);
    }, [generating]);

    const generate = async () => {
        setError(null);
        setResult(null);
        setMsgIdx(0);
        setGenerating(true);

        // AbortController con 5 minutos — Gemini puede tardar 90-120s generando 45 preguntas
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

        try {
            const token = await getAuthToken();
            if (!token) throw new Error("No autenticado. Inicia sesión e intenta de nuevo.");

            const res = await fetch(`${API_BASE}/api/v1/simce/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                signal: controller.signal,
                body: JSON.stringify({
                    nivel: data.nivel,
                    asignatura: data.asignatura,
                    cantidad_preguntas: data.cantidad,
                    modo: data.modo,
                    oas_seleccionados: data.oasSeleccionados,
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail ?? `Error ${res.status}`);
            }

            const json: GeneratedResult = await res.json();
            setResult(json);
            setPreguntas(json.preguntas);
        } catch (e: unknown) {
            if (e instanceof DOMException && e.name === "AbortError") {
                setError("La generación tardó demasiado (>5 min). Intenta con menos preguntas o vuelve a intentarlo.");
            } else {
                setError(e instanceof Error ? e.message : "Error inesperado");
            }
        } finally {
            clearTimeout(timeoutId);
            setGenerating(false);
        }
    };


    const handleDownload = async (type: "cuadernillo" | "pauta" | "omr") => {
        if (!result) return;
        setDownloading(type);
        try {
            const token = await getAuthToken();
            if (!token) throw new Error("No autenticado");

            if (type === "omr") {
                await downloadBlob(
                    `${API_BASE}/api/v1/simce/generate/download-omr`,
                    { titulo: result.titulo, asignatura: result.asignatura, nivel: result.nivel, cantidad_preguntas: preguntas.length },
                    token,
                    `Hoja_OMR_${result.asignatura}.pdf`
                );
            } else {
                const updatedEnsayo = result.ensayo.map(bloque => ({
                    ...bloque,
                    preguntas: bloque.preguntas.map(p => preguntas.find(ep => ep.numero === p.numero) || p)
                }));
                
                await downloadBlob(
                    `${API_BASE}/api/v1/simce/generate/download-cuadernillo`,
                    { 
                        titulo: result.titulo, 
                        asignatura: result.asignatura, 
                        nivel: result.nivel, 
                        modo: result.modo, 
                        estimulo_texto: result.estimulo_texto,
                        estimulo_imagen: result.estimulo_imagen,
                        preguntas: preguntas, // Enviamos la lista plana de preguntas (editadas)
                        incluir_clave: type === "pauta" 
                    },
                    token,
                    `Cuadernillo_${result.asignatura}.docx`
                );
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al descargar");
        } finally {
            setDownloading(null);
        }
    };

    const stimulusLabel = data.stimulusMode === "auto" ? "Gráficos auto-generados por IA"
        : data.stimulusMode === "upload" && data.uploadedFile ? `Imagen: ${data.uploadedFile.name}`
            : "Sin estímulos visuales";

    const summaryItems = [
        { label: "Tipo", value: data.modo === "simce" ? "Simulación SIMCE Estricta" : "Ensayo Formativo Libre" },
        { label: "Asignatura", value: (ASIGNATURAS_UI[data.asignatura] ?? data.asignatura) || "—" },
        { label: "Nivel", value: data.nivel || "—" },
        { label: "Preguntas", value: `${data.cantidad}` },
        { label: "OAs", value: data.modo === "formativo" ? (data.oasSeleccionados.join(", ") || "Ninguno") : "Tabla SIMCE" },
        { label: "Estímulos", value: stimulusLabel },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Confirmación y Generación</h2>
                <p className="text-sm text-slate-500 mt-1">Revisa los parámetros y genera el instrumento.</p>
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#1B3C73] to-[#2A59A8] px-5 py-3">
                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Resumen</p>
                    <p className="text-white font-bold text-base mt-0.5 leading-tight">
                        {data.modo === "simce" ? "Simulación SIMCE" : "Ensayo Formativo"} · {(ASIGNATURAS_UI[data.asignatura] ?? data.asignatura) || "—"} · {data.nivel || "—"} · {data.cantidad} preguntas
                    </p>
                </div>
                <div className="divide-y divide-slate-100">
                    {summaryItems.map(item => (
                        <div key={item.label} className="flex items-start gap-3 px-5 py-2.5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 shrink-0 pt-0.5">{item.label}</span>
                            <span className="text-sm text-slate-700 font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-800 text-sm">Error al generar</p>
                        <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
            )}

            {/* Loading */}
            {generating && (
                <div className="bg-slate-900 rounded-2xl p-6 text-center">
                    <Loader2 size={40} className="text-[#C87533] animate-spin mx-auto mb-4" />
                    <p className="text-white font-semibold text-base mb-1">Generando con IA...</p>
                    <p className="text-slate-400 text-sm animate-pulse min-h-[1.25rem]">{LOADING_MESSAGES[msgIdx]}</p>
                    <div className="mt-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#C87533] to-[#f2ae60] rounded-full transition-all duration-[2000ms]"
                            style={{ width: `${((msgIdx + 1) / LOADING_MESSAGES.length) * 100}%` }} />
                    </div>
                </div>
            )}

            {/* Generate button */}
            {!generating && !result && (
                <button type="button" onClick={generate}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#C87533] to-[#e8913d] hover:from-[#a65e26] hover:to-[#C87533] text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-[#C87533]/30 transition-all hover:-translate-y-0.5 active:translate-y-0 hover:shadow-2xl">
                    <Sparkles size={22} /> Generar Ensayo con IA
                </button>
            )}

            {/* Result */}
            {result && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    {/* Success header */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                <CheckCircle2 size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-emerald-800">¡Instrumento generado!</p>
                                <p className="text-xs text-emerald-600">{preguntas.length} ítems listos · Edita, previsualiza y descarga.</p>
                            </div>
                        </div>

                        {/* Download buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {([
                                { type: "cuadernillo" as const, label: "Cuadernillo Alumno", icon: <FileText size={15} />, color: "bg-[#1B3C73] hover:bg-[#152f5a]" },
                                { type: "pauta" as const, label: "Pauta Docente", icon: <Eye size={15} />, color: "bg-[#2A59A8] hover:bg-[#1B3C73]" },
                                { type: "omr" as const, label: "Hoja OMR", icon: <Download size={15} />, color: "bg-[#C87533] hover:bg-[#a65e26]" },
                            ] as const).map(btn => (
                                <button key={btn.type} onClick={() => handleDownload(btn.type)} disabled={!!downloading}
                                    className={`${btn.color} text-white font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}>
                                    {downloading === btn.type ? <Loader2 size={14} className="animate-spin" /> : btn.icon}
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Blueprint toggle */}
                    {result.blueprint_resumen && (
                        <button onClick={() => setShowBlueprint(b => !b)}
                            className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#1B3C73] font-semibold transition-colors">
                            <BarChart3 size={13} />
                            {showBlueprint ? "Ocultar" : "Ver"} distribución de habilidades (Blueprint)
                        </button>
                    )}
                    {showBlueprint && (
                        <pre className="bg-slate-900 text-slate-300 text-xs rounded-xl p-4 overflow-x-auto font-mono animate-in fade-in duration-300">
                            {result.blueprint_resumen}
                        </pre>
                    )}

                    {/* Editable question list */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-slate-700">{preguntas.length} Preguntas Generadas</p>
                            <span className="text-xs text-slate-400">Haz clic en cada una para expandir y editar</span>
                        </div>
                        <div className="space-y-2">
                            {preguntas.map((p, i) => (
                                <PreguntaCard
                                    key={p.numero}
                                    pregunta={p}
                                    index={i}
                                    onEdit={updated => setPreguntas(prev => prev.map((q, qi) => qi === i ? updated : q))}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Regenerate */}
                    <button type="button" onClick={() => { setResult(null); setPreguntas([]); }}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#C87533] font-semibold transition-colors">
                        <Sparkles size={13} /> Generar nuevo instrumento
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const INITIAL_DATA: FormData = {
    nivel: "", asignatura: "", cantidad: 35, modo: "simce",
    oasSeleccionados: [], stimulusMode: null, uploadedFile: null,
};

export default function SimceTestGenerator() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);

    const updateForm = (patch: Partial<FormData>) => setFormData(prev => ({ ...prev, ...patch }));

    const canNext = () => {
        if (currentStep === 0) return formData.nivel && formData.asignatura;
        if (currentStep === 1) return formData.modo === "simce" || formData.oasSeleccionados.length > 0;
        return true;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 md:p-8">
            <div className="w-full max-w-2xl">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#C87533] to-[#e8913d] rounded-xl flex items-center justify-center shadow-md">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Generador de Ensayos SIMCE</h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">ProfeIC · Módulo IA · Instrumentos Evaluativos</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
                    <Stepper current={currentStep} />
                    {currentStep === 0 && <Step1 data={formData} onChange={updateForm} />}
                    {currentStep === 1 && <Step2 data={formData} onChange={updateForm} />}
                    {currentStep === 2 && <Step3 data={formData} />}

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                        <button type="button" disabled={currentStep === 0} onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <ChevronLeft size={16} /> Anterior
                        </button>
                        {currentStep < 2 ? (
                            <button type="button" disabled={!canNext()} onClick={() => setCurrentStep(s => Math.min(2, s + 1))}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#1B3C73] text-white hover:bg-[#152f5a] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
                                Siguiente <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button type="button" onClick={() => { setCurrentStep(0); setFormData(INITIAL_DATA); }}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                                <X size={15} /> Nuevo instrumento
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-center text-xs text-slate-400 mt-4">ProfeIC · IA Educativa Hecha en Chile 🇨🇱</p>
            </div>
        </div>
    );
}
