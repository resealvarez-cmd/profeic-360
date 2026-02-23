"use client";

import { useState } from "react";
import { MessageSquare, CheckCheck } from "lucide-react";

export function Reflection({ onSubmit, initialData = {} }: any) {
    const [formData, setFormData] = useState({
        agreements: initialData.agreements || "",
        metacognition: initialData.metacognition || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1a2e3b] mb-6 border-b pb-4">C. Reflexión y Cierre (Metacognición)</h2>

            <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="font-bold text-[#2b546e] flex items-center gap-2 mb-2">
                        <MessageSquare size={20} />
                        Preguntas Metacognitivas
                    </h3>
                    <p className="text-sm text-slate-600">
                        Guiar la conversación:
                        <br />1. ¿Qué decisiones tomaste que impactaron el aprendizaje?
                        <br />2. ¿Qué harías diferente la próxima vez?
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#2b546e] mb-2">
                        1. Reflexión del Docente
                        <span className="block text-xs font-normal text-slate-400">Síntesis de la conversación de retroalimentación.</span>
                    </label>
                    <textarea
                        name="metacognition"
                        value={formData.metacognition}
                        onChange={handleChange}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#f2ae60] focus:border-transparent min-h-[150px]"
                        placeholder="El docente reconoce que..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#2b546e] mb-2">
                        2. Acuerdos de Mejora
                        <span className="block text-xs font-normal text-slate-400">Compromisos concretos para la próxima observación.</span>
                    </label>
                    <textarea
                        name="agreements"
                        value={formData.agreements}
                        onChange={handleChange}
                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#f2ae60] focus:border-transparent min-h-[100px]"
                        placeholder="1. Aplicar la estrategia de..."
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => onSubmit(formData)}
                    className="px-6 py-3 rounded-xl bg-[#2b546e] text-white hover:bg-[#1a2e3b] font-medium flex items-center gap-2"
                >
                    <CheckCheck size={18} />
                    Cerrar Ciclo de Observación
                </button>
            </div>
        </div>
    );
}
