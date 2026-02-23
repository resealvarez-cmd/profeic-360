"use client";

import { motion } from "framer-motion";
import { Star, Zap, Brain, Layout, BarChart3, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const reviews = [
    {
        module: "Evaluaciones IA",
        icon: Zap,
        highlight: " Adiós a los fines de semana trabajando.",
        quote: "El generador de pruebas no solo crea preguntas, las *calibra*. Literalmente recuperé mis domingos. Lo que me tomaba 4 horas, ahora me toma 15 minutos.",
        author: "Camila R.",
        role: "Profesora de Historia",
        color: "from-amber-50 to-orange-50",
        iconColor: "text-amber-500",
        borderColor: "border-amber-200"
    },
    {
        module: "Planificación DUA",
        icon: Brain,
        highlight: "Mi UTP quedó impresionado.",
        quote: "La coherencia entre objetivos basales y las actividades sugeridas es increíble. Por fin una planificación que realmente considera la diversidad del aula real.",
        author: "Felipe M.",
        role: "Profesor de Ciencias",
        color: "from-blue-50 to-indigo-50",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200"
    },
    {
        module: "Analizador de Datos",
        icon: BarChart3,
        highlight: "Decisiones basadas en datos, no intuición.",
        quote: "Poder visualizar las brechas de aprendizaje de mi curso con un solo clic cambió mi forma de remediar contenidos. Es como tener un analista de datos personal.",
        author: "Andrea S.",
        role: "Jefa de UTP",
        color: "from-emerald-50 to-teal-50",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-200"
    },
    {
        module: "Soberanía Curricular",
        icon: Layout,
        highlight: "Mis textos, mis reglas.",
        quote: "Subí mis propias guías y la IA generó preguntas sobre *mis* textos, no sobre contenido genérico de internet. Eso es respeto profesional.",
        author: "Roberto D.",
        role: "Profesor de Lenguaje",
        color: "from-purple-50 to-fuchsia-50",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200"
    }
];

export const ModuleReviews = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#f2ae60]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#1a2e3b]/5 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-sm font-bold text-[#f2ae60] uppercase tracking-widest mb-3">
                            Impacto Real en el Aula
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-black text-[#1a2e3b] mb-6 leading-tight">
                            Cada módulo diseñado para <span className="text-[#f2ae60]">liberar tu tiempo</span>.
                        </h3>
                        <p className="text-lg text-slate-600">
                            Estos testimonios provienen de los <span className="font-bold text-[#1a2e3b]">profesionales que ayudaron a validar la plataforma</span> durante su fase piloto.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                                "relative p-8 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br",
                                review.color,
                                review.borderColor
                            )}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className={cn("p-3 rounded-2xl bg-white shadow-sm", review.iconColor)}>
                                    <review.icon size={28} />
                                </div>
                                <Quote className="text-black/5 w-12 h-12 absolute top-6 right-8 rotate-180" />
                            </div>

                            <div className="mb-6 relative z-10">
                                <h4 className="text-xl font-bold text-[#1a2e3b] mb-2 font-serif italic">
                                    "{review.highlight}"
                                </h4>
                                <p className="text-slate-700 leading-relaxed text-[15px]">
                                    {review.quote}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 pt-6 border-t border-black/5">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-sm text-[#1a2e3b] shadow-sm border border-slate-100">
                                    {review.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-[#1a2e3b] text-sm">{review.author}</p>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                        {review.role} • {review.module}
                                    </p>
                                </div>
                                <div className="ml-auto flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4 text-[#f2ae60] fill-[#f2ae60]" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <button className="bg-[#1a2e3b] text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg shadow-[#1a2e3b]/30 hover:bg-[#f2ae60] hover:text-[#1a2e3b] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
                        <Zap className="w-5 h-5" />
                        Prueba Profe IC Gratis
                    </button>
                    <p className="mt-4 text-sm text-slate-500 font-medium">
                        Sin tarjeta de crédito • 100% Funcional
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
