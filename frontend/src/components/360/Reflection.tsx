import { useState } from "react";
import { MessageSquare, CheckCheck, TrendingUp, Info } from "lucide-react";

export function Reflection({ onSubmit, initialData = {}, observationData }: any) {
    const [formData, setFormData] = useState({
        agreements: initialData.agreements || "",
        metacognition: initialData.metacognition || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const renderObservationSummary = () => {
        if (!observationData || !observationData.scores) {
             return (
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-slate-400 italic text-sm mb-8">
                     Esperando datos de la observación de aula...
                 </div>
             );
        }

        return (
            <div className="mb-10 animate-in fade-in duration-700">
                <div className="flex items-center gap-2 mb-6 text-[#1B3C73]">
                    <TrendingUp size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm">Resultados de la Observación</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(observationData.scores).map(([key, score]: any) => {
                        const note = observationData.observations?.[key];
                        // Basic formatting for the key
                        const label = key.replace(/_/g, ' ').toUpperCase();
                        
                        return (
                            <div key={key} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-black text-slate-400 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                                        {label}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${score >= 3 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        Nivel {score}
                                    </span>
                                </div>
                                {note ? (
                                    <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                                        "{note}"
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic">Sin nota detallada registrada.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100 max-w-5xl mx-auto">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-[#1B3C73] mb-2 flex items-center gap-3">
                     <MessageSquare size={32} className="text-[#f2ae60]" />
                     Reflexión y Cierre
                </h2>
                <p className="text-slate-500 font-medium">Conversación de retroalimentación y acuerdos de mejora continua.</p>
            </div>

            {renderObservationSummary()}

            <div className="space-y-8 pt-8 border-t border-slate-100">
                <div className="bg-[#1B3C73] p-6 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-blue-900/10">
                    <Info className="absolute top-4 right-4 opacity-10" size={80} />
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                        <MessageSquare size={20} className="text-blue-100" />
                        Guía Metacognitiva para el Docente
                    </h3>
                    <ul className="text-sm text-blue-100/90 space-y-2 relative z-10">
                        <li className="flex gap-2"><span>1.</span> ¿Qué decisiones pedagógicas impactaron positivamente el aprendizaje hoy?</li>
                        <li className="flex gap-2"><span>2.</span> ¿Qué micro-gesto o estrategia harías diferente en tu próxima clase?</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-black text-[#1B3C73] mb-4 uppercase tracking-widest">
                            Metacognición del Docente
                            <span className="block text-[10px] font-bold text-slate-400 mt-1">SÍNTESIS DE LA REFLEXIÓN RECOGIDA</span>
                        </label>
                        <textarea
                            name="metacognition"
                            value={formData.metacognition}
                            onChange={handleChange}
                            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#f2ae60] focus:border-transparent min-h-[150px] text-sm text-slate-700 bg-slate-50/30"
                            placeholder="Escribe aquí los puntos clave de la reflexión docente..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-[#C87533] mb-4 uppercase tracking-widest">
                            Acuerdos de Mejora
                            <span className="block text-[10px] font-bold text-slate-400 mt-1">COMPROMISOS PARA EL PRÓXIMO CICLO</span>
                        </label>
                        <textarea
                            name="agreements"
                            value={formData.agreements}
                            onChange={handleChange}
                            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#C87533] focus:border-transparent min-h-[150px] text-sm text-slate-700 bg-slate-50/30"
                            placeholder="Ej: Implementar tickets de salida diarios..."
                        />
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-end">
                <button
                    onClick={() => onSubmit(formData)}
                    className="px-8 py-4 rounded-2xl bg-[#1B3C73] text-white hover:bg-[#2A59A8] font-black uppercase tracking-widest text-sm flex items-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    <CheckCheck size={20} />
                    Cerrar Ciclo Pedagógico
                </button>
            </div>
        </div>
    );
}
