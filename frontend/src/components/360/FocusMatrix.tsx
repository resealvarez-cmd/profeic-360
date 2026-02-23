"use client";

import { useState, useEffect } from "react";
import { Camera, Mic, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { TrajectoryWidget } from "./TrajectoryWidget";

const FOCOS = [
    { id: "estructura", label: "Estructura de la Clase", desc: "Inicio, desarrollo, cierre y tiempos." },
    { id: "ambiente", label: "Ambiente de Aula", desc: "Normas, convivencia y respeto." },
    { id: "relevancia", label: "Relevancia del Contenido", desc: "Conexión con la vida real y OAs." },
    { id: "modelamiento", label: "Modelamiento", desc: "Claridad en las explicaciones y ejemplos." },
    { id: "socializacion", label: "Socialización", desc: "Trabajo colaborativo y participación." },
    { id: "complejidad", label: "Complejidad Cognitiva", desc: "Nivel de desafío (Taxonomía)." },
    { id: "retroalimentacion", label: "Retroalimentación", desc: "Calidad y frecuencia del feedback." },
];

const LEVEL_LABELS: Record<number, string> = {
    1: "Insatisfactorio",
    2: "Básico",
    3: "Competente",
    4: "Destacado"
};

export function FocusMatrix({ onSubmit, initialData = {}, lastCommitment }: any) {
    const [observations, setObservations] = useState(initialData.observations || {});
    const [scores, setScores] = useState<Record<string, number>>(initialData.scores || {});
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

    const handleSubmit = async () => {
        // Validation: Ensure all have scores
        const missingScores = FOCOS.filter(f => !scores[f.id]);
        if (missingScores.length > 0) {
            toast.error(`Faltan niveles por evaluar en: ${missingScores.map(f => f.label).join(", ")}`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ observations, scores });
            setIsDirty(false); // Reset dirty state on successful save
            toast.success("Observación guardada exitosamente");
        } catch (error: any) {
            toast.error("Error al guardar: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-0">
            {/* TRAJECTORY WIDGET (Execution Context) */}
            <div className="mb-6">
                <TrajectoryWidget commitment={lastCommitment} />
            </div>

            <h2 className="text-2xl font-bold text-navy-950 mb-2">B. Matriz de Observación (Ejecución)</h2>
            <p className="text-slate-500 mb-8">Registra evidencia cualitativa y asigna nivel de logro (Rúbrica).</p>

            <div className="grid grid-cols-1 gap-6">
                {FOCOS.map((foco) => (
                    <div key={foco.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-copper-500/30 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-navy-950 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center group-hover:bg-copper-500 group-hover:text-white transition-colors">
                                        {foco.id[0].toUpperCase()}
                                    </span>
                                    {foco.label}
                                </h3>
                                <p className="text-sm text-slate-400 ml-8">{foco.desc}</p>
                            </div>

                            {/* SCORING BUTTONS */}
                            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                                {[1, 2, 3, 4].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handleScoreChange(foco.id, level)}
                                        title={LEVEL_LABELS[level]}
                                        className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${scores[foco.id] === level
                                            ? 'bg-navy-950 text-white shadow-md scale-110'
                                            : 'text-slate-400 hover:bg-white hover:text-navy-950'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <textarea
                            className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-copper-500 text-sm text-navy-950 placeholder:text-slate-400 min-h-[120px]"
                            placeholder={`Evidencia para ${foco.label.toLowerCase()}...`}
                            value={observations[foco.id] || ""}
                            onChange={(e) => handleObsChange(foco.id, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end sticky bottom-6 z-10 w-full">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-4 rounded-full bg-navy-950 text-white hover:bg-slate-800 font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                    {isSubmitting ? "Guardando..." : "Finalizar Observación"}
                </button>
            </div>
        </div>
    );
}
