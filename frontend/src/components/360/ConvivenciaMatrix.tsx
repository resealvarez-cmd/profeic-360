"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Target, CheckSquare, MessageSquare, Mic } from "lucide-react";
import { toast } from "sonner";
import { VoiceRecorder } from "../shared/VoiceRecorder";
import { cn } from "@/lib/utils";

const DIMENSIONS = [
    {
        category: "A. Ambiente de Respeto",
        items: [
            { id: "promocion_respeto", label: "Promoción del Respeto", desc: "Clima de trato horizontal y escucha activa", tags: ["Trato cordial y horizontal", "Fomento de escucha activa entre pares", "Lenguaje inclusivo y respetuoso", "Trato equitativo (sin favoritismos)"] },
            { id: "diversidad_aula", label: "Gestión de la Diversidad", desc: "Valoración positiva de la pluralidad", tags: ["Uso de materiales libres de sesgos", "Referencias positivas a distintas culturas", "Integración activa de estudiantes PIE/extranjeros"] },
            { id: "abordaje_discriminacion", label: "Abordaje de Discriminación", desc: "Intervención ante sesgos o burlas", tags: ["Intervención inmediata ante burlas", "Mediación formativa de conflictos", "Fomento de la reflexión sobre estereotipos"] }
        ]
    },
    {
        category: "B. Buena Convivencia",
        items: [
            { id: "habilidades_convivir", label: "Habilidades para Convivir", desc: "Fomento de la colaboración y el diálogo", tags: ["Trabajo colaborativo estructurado", "Diálogo guiado y respetuoso", "Asignación de roles positivos"] },
            { id: "prevencion_normas", label: "Prevención y Normas", desc: "Gestión formativa de la conducta", tags: ["Recordatorio explícito de normas", "Redirección positiva de conducta", "Aplicación coherente del reglamento"] }
        ]
    },
    {
        category: "C. Ambiente Organizado",
        items: [
            { id: "claridad_responsabilidades", label: "Claridad de Responsabilidades", desc: "Instrucciones y estructura de la sesión", tags: ["Instrucciones dadas paso a paso", "Uso visible de temporizador/reloj", "Claridad en el producto o meta esperada"] },
            { id: "prevencion_distracciones", label: "Prevención de Distracciones", desc: "Fluidez y manejo de interrupciones", tags: ["Transiciones fluidas", "Disposición estratégica del mobiliario", "Reacción ágil ante interrupciones"] }
        ]
    },
    {
        category: "D. Apoyo Socioemocional",
        items: [
            { id: "vinculos_contencion", label: "Vínculos y Contención", desc: "Seguridad emocional y validación", tags: ["Saludo personalizado en la puerta", "Acercamiento a estudiantes frustrados", "Validación explícita de emociones"] },
            { id: "practica_habilidades", label: "Práctica de Habilidades", desc: "Modelaje de asertividad y empatía", tags: ["Fomento del contacto visual", "Modelaje de respuestas asertivas", "Generación de espacios de opinión segura"] }
        ]
    }
];

const LEVEL_LABELS: Record<number, string> = {
    1: "Insatisfactorio",
    2: "Básico",
    3: "Competente",
    4: "Destacado"
};

export function ConvivenciaMatrix({ onSubmit, initialData = {} }: any) {
    const [observations, setObservations] = useState<Record<string, string>>(initialData.observations || {});
    const [scores, setScores] = useState<Record<string, number>>(initialData.scores || {});
    const [tagsSelected, setTagsSelected] = useState<string[]>(initialData.tags_selected || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

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

    const handleObsChange = (id: string, value: string) => {
        setObservations({ ...observations, [id]: value });
        setIsDirty(true);
    };

    const handleScoreChange = (id: string, value: number) => {
        setScores({ ...scores, [id]: value });
        setIsDirty(true);
    };

    const toggleTag = (tag: string) => {
        setTagsSelected(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        setIsDirty(true);
    };

    const handleSubmit = async () => {
        const missingScores: string[] = [];
        DIMENSIONS.forEach(cat => {
            cat.items.forEach(dim => {
                if (!scores[dim.id]) missingScores.push(dim.label);
            });
        });

        if (missingScores.length > 0) {
            toast.error(`Faltan puntajes en: ${missingScores.join(", ")}`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ observations, scores, tags_selected: tagsSelected });
            setIsDirty(false);
            toast.success("Evaluación de Convivencia guardada");
        } catch (error: any) {
            toast.error("Error al guardar: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-0">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl shadow-sm">
                        <CheckSquare size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#1B3C73]">Pauta de Convivencia</h2>
                        <p className="text-slate-500 font-medium">Evaluación formativa del ambiente y clima para el aprendizaje.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                {DIMENSIONS.map((category, catIdx) => (
                    <div key={catIdx} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                        <h3 className="text-xl font-black text-teal-600 mb-6 uppercase tracking-wider border-b border-teal-50 pb-3">
                            {category.category}
                        </h3>
                        <div className="grid grid-cols-1 gap-8">
                            {category.items.map(dim => (
                                <div key={dim.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 hover:border-teal-200 transition-colors">
                                    <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center mb-6">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg text-[#1B3C73] mb-1">{dim.label}</h4>
                                            <p className="text-sm text-slate-500">{dim.desc}</p>
                                        </div>
                                        
                                        {/* SCORE TABS */}
                                        <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 self-start xl:self-auto w-full xl:w-auto">
                                            {[1, 2, 3, 4].map(score => (
                                                <button
                                                    key={score}
                                                    onClick={() => handleScoreChange(dim.id, score)}
                                                    className={`flex-1 xl:flex-none px-4 py-3 rounded-lg text-lg font-black transition-all ${scores[dim.id] === score 
                                                        ? 'bg-teal-600 text-white shadow-md transform scale-105' 
                                                        : 'text-slate-400 hover:bg-slate-50'}`}
                                                    title={LEVEL_LABELS[score]}
                                                >
                                                    {score}
                                                    <span className="block text-[8px] uppercase tracking-widest mt-1 opacity-70">
                                                        {LEVEL_LABELS[score]}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* QUICK TAGS */}
                                    <div className="mb-4">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Evidencias Observables</span>
                                        <div className="flex flex-wrap gap-2">
                                            {dim.tags.map(tag => {
                                                const tagId = `${dim.id}_${tag}`;
                                                const isSelected = tagsSelected.includes(tagId);
                                                return (
                                                    <button
                                                        key={tag}
                                                        onClick={() => toggleTag(tagId)}
                                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 flex items-center gap-2 ${isSelected 
                                                            ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' 
                                                            : 'bg-white border-transparent text-slate-500 hover:border-slate-200 shadow-sm'}`}
                                                    >
                                                        {isSelected && <CheckCircle2 size={16} className="text-teal-500" />}
                                                        {tag}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* FIELD NOTE */}
                                    <div className="relative mt-4 group/note">
                                        <div className="absolute top-3 left-3 text-slate-300">
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className="absolute top-2 right-2 z-10">
                                            <VoiceRecorder 
                                                onTranscription={(text) => {
                                                    const current = observations[dim.id] || "";
                                                    const newValue = current ? `${current}\n${text}` : text;
                                                    handleObsChange(dim.id, newValue);
                                                }} 
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Nota de campo sobre comportamiento o clima..."
                                            value={observations[dim.id] || ""}
                                            onChange={(e) => handleObsChange(dim.id, e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 rounded-xl bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm text-slate-700 min-h-[80px] resize-y"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end sticky bottom-6 z-10 w-full animate-in slide-in-from-bottom flex-col md:flex-row gap-4">
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex-1 md:flex-none flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Progreso:</span>
                    <span className="text-lg font-black text-teal-600 ml-4">
                        {Object.keys(scores).length} / {DIMENSIONS.reduce((acc, cat) => acc + cat.items.length, 0)}
                    </span>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-2xl bg-teal-600 text-white hover:bg-teal-700 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                    {isSubmitting ? "Guardando..." : "Finalizar Evaluación"}
                </button>
            </div>
        </div>
    );
}
