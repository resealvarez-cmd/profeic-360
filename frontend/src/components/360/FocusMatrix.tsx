"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Target, CheckSquare, MessageSquare, Mic } from "lucide-react";
import { toast } from "sonner";
import { TrajectoryWidget } from "./TrajectoryWidget";
import { VoiceRecorder } from "../shared/VoiceRecorder";

const DIMENSIONS = [
    {
        category: "A. Arquitectura del Aprendizaje",
        items: [
            { id: "activacion_cognitiva", label: "Activación Cognitiva", desc: "Conectar con saberes previos y generar motivación", tags: ["Conexión saberes previos", "Hook motivacional", "Objetivo claro"] },
            { id: "andamiaje_modelaje", label: "Andamiaje y Modelaje", desc: "Soporte progresivo y demostración experta", tags: ["Pensamiento en voz alta", "Preguntas de andamiaje", "Ejemplos claros"] },
            { id: "rigor_autonomia", label: "Rigor y Autonomía", desc: "Desafío y cesión de la responsabilidad", tags: ["Desafío cognitivo", "Práctica independiente", "Tiempo adecuado"] }
        ]
    },
    {
        category: "B. Cultura de Aula",
        items: [
            { id: "clima_contencion", label: "Clima y Contención", desc: "Ambiente seguro y vínculos de confianza", tags: ["Validación del error", "Vínculo positivo", "Manejo de ansiedad"] },
            { id: "gestion_aula", label: "Gestión de Aula", desc: "Organización de rutinas y flujo de clase", tags: ["Rutinas fluidas", "Transiciones rápidas", "Señales de atención"] }
        ]
    },
    {
        category: "C. Ecosistema y Evaluación",
        items: [
            { id: "recursos_didacticos", label: "Recursos Didácticos", desc: "Integración de herramientas y espacios", tags: ["Uso de TICs efectivo", "Material pertinente", "Pizarra organizada"] },
            { id: "monitoreo_formativo", label: "Monitoreo Formativo", desc: "Levantamiento de evidencia durante la clase", tags: ["Paseo por la sala", "Revisión cuadernos", "Preguntas de chequeo"] },
            { id: "calidad_feedback", label: "Calidad del Feedback", desc: "Devoluciones oportunas y constructivas", tags: ["Feedback específico", "Corrección en el momento", "Orientado a la mejora"] }
        ]
    }
];

const LEVEL_LABELS: Record<number, string> = {
    1: "Inicial",
    2: "Desarrollo",
    3: "Competente",
    4: "Destacado"
};

export function FocusMatrix({ onSubmit, initialData = {}, lastCommitment, teacherFocus }: any) {
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
        // Validate all 8 dimensions are scored
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
            toast.success("Observación guardada exitosamente");
        } catch (error: any) {
            toast.error("Error al guardar: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTeacherFocus = () => {
        if (!teacherFocus) return null;
        
        return (
            <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-8 relative overflow-hidden group">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                    <Target size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#1B3C73] text-white rounded-xl shadow-md group-hover:rotate-12 transition-transform">
                            <Target size={20} />
                        </div>
                        <h3 className="text-sm font-black text-[#1B3C73] uppercase tracking-widest">Foco Acordado: La Voz del Docente</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Prioridades del Aprendizaje</span>
                            {teacherFocus.selected_tags && teacherFocus.selected_tags.length > 0 ? (
                               <div className="flex flex-wrap gap-2">
                                   {teacherFocus.selected_tags.map((fk: string) => {
                                       // Map step format ID like paso5_practica_independiente to readable label
                                       let label = fk;
                                       if(fk.startsWith('paso')) {
                                           label = fk.split('_').slice(1).join(' ').toUpperCase();
                                       }
                                       return (
                                           <span key={fk} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                                               <div className="w-1.5 h-1.5 rounded-full bg-[#C87533]" />
                                               {label}
                                           </span>
                                       )
                                   })}
                               </div>
                            ) : (
                                <p className="text-slate-400 text-xs italic">Sin etiquetas seleccionadas.</p>
                            )}
                        </div>

                        {teacherFocus.context_note && (
                            <div className="bg-white/60 p-4 rounded-2xl border border-slate-100/50 backdrop-blur-sm">
                                <span className="text-[10px] font-bold text-[#C87533] uppercase tracking-widest mb-1 block">Contexto del Docente</span>
                                <p className="text-slate-600 text-xs leading-relaxed italic">"{teacherFocus.context_note}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-0">
            {/* TRAJECTORY WIDGET (Execution Context) */}
            <div className="mb-6">
                <TrajectoryWidget commitment={lastCommitment} />
            </div>

            {renderTeacherFocus()}

            <div className="mb-8">
                <h2 className="text-3xl font-black text-[#1B3C73] mb-2 flex items-center gap-3">
                    <CheckSquare className="text-[#f2ae60]" size={32} />
                    Observación Ágil
                </h2>
                <p className="text-slate-500 font-medium">Asigna un nivel de logro y selecciona etiquetas rápidas basadas en la evidencia.</p>
            </div>

            <div className="space-y-10">
                {DIMENSIONS.map((category, catIdx) => (
                    <div key={catIdx} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                        <h3 className="text-xl font-black text-[#C87533] mb-6 uppercase tracking-wider border-b border-orange-100 pb-3">
                            {category.category}
                        </h3>
                        <div className="grid grid-cols-1 gap-8">
                            {category.items.map(dim => (
                                <div key={dim.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 hover:border-blue-200 transition-colors">
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
                                                        ? 'bg-[#1B3C73] text-white shadow-md transform scale-105' 
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
                                                            ? 'bg-blue-50 border-[#2A59A8] text-[#1B3C73] shadow-sm' 
                                                            : 'bg-white border-transparent text-slate-500 hover:border-slate-200 shadow-sm'}`}
                                                    >
                                                        {isSelected && <CheckCircle2 size={16} className="text-[#2A59A8]" />}
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
                                            placeholder="Nota de campo cualitativa (opcional)..."
                                            value={observations[dim.id] || ""}
                                            onChange={(e) => handleObsChange(dim.id, e.target.value)}
                                            className="w-full pl-10 pr-12 py-3 rounded-xl bg-white border border-slate-200 focus:border-[#C87533] focus:ring-1 focus:ring-[#C87533] transition-all text-sm text-slate-700 min-h-[80px] resize-y"
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
                    <span className="text-sm font-bold text-slate-500">Completitud:</span>
                    <span className="text-lg font-black text-[#C87533] ml-4">
                        {Object.keys(scores).length} / {DIMENSIONS.reduce((acc, cat) => acc + cat.items.length, 0)}
                    </span>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-2xl bg-[#1B3C73] text-white hover:bg-[#2A59A8] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                    {isSubmitting ? "Finalizando..." : "Finalizar Observación"}
                </button>
            </div>
        </div>
    );
}
