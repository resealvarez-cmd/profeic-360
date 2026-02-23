"use client";

import { useState } from "react";
import { Save, Send } from "lucide-react";
import { TrajectoryWidget } from "./TrajectoryWidget";

export function PreObservation({ onSubmit, initialData = {}, lastCommitment }: any) {
    const [formData, setFormData] = useState({
        focus: initialData.focus || "",
        support_req: initialData.support_req || "",
        context: initialData.context || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto">

            {/* TRAJECTORY SYSTEM (New) */}
            <TrajectoryWidget commitment={lastCommitment} />

            <h2 className="text-2xl font-bold text-[#1a2e3b] mb-6 border-b pb-4">A. Pre-Observación (Acuerdos)</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-[#2b546e] mb-2">
                        1. Foco Principal de la Sesión
                        <span className="block text-xs font-normal text-slate-400">¿Qué aspecto pedagógico específico quieres que observemos hoy?</span>
                    </label>
                    <textarea
                        name="focus"
                        value={formData.focus}
                        onChange={handleChange}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#f2ae60] focus:border-transparent min-h-[100px]"
                        placeholder="Ej: Gestión del tiempo durante la práctica independiente..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#2b546e] mb-2">
                        2. Solicitud de Apoyo Específica
                        <span className="block text-xs font-normal text-slate-400">¿En qué necesitas ayuda concreta?</span>
                    </label>
                    <textarea
                        name="support_req"
                        value={formData.support_req}
                        onChange={handleChange}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#f2ae60] focus:border-transparent min-h-[100px]"
                        placeholder="Ej: Estrategias para recuperar la atención del grupo..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#2b546e] mb-2">
                        3. Factores del Contexto
                        <span className="block text-xs font-normal text-slate-400">¿Algo que debamos saber del curso o situación actual?</span>
                    </label>
                    <textarea
                        name="context"
                        value={formData.context}
                        onChange={handleChange}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#f2ae60] focus:border-transparent min-h-[100px]"
                        placeholder="Ej: Vienen de educación física, están un poco agitados..."
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <button className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                    Guardar Borrador
                </button>
                <button
                    onClick={() => onSubmit(formData)}
                    className="px-6 py-3 rounded-xl bg-[#1a2e3b] text-white hover:bg-[#2b546e] font-medium flex items-center gap-2 shadow-lg shadow-blue-900/10"
                >
                    <Send size={18} />
                    Enviar Acuerdos
                </button>
            </div>
        </div>
    );
}
