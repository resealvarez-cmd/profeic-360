"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export const DemoVideo = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#f2ae60] via-[#d68c3e] to-[#f2ae60]"></div>

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-sm font-bold text-[#f2ae60] uppercase tracking-widest mb-3">
                        En Acción
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-black text-[#1a2e3b] mb-4">
                        Mira cómo funciona.
                    </h3>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Descubre cómo Profe IC transforma horas de planificación en minutos de creatividad pedagógica.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-[#1a2e3b]/20 bg-slate-900 border-4 border-slate-900 group cursor-pointer"
                >
                    {/* Placeholder de Video - Reemplazar con <iframe /> o <video /> real */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center mix-blend-overlay"></div>

                        <div className="relative z-10 flex flex-col items-center gap-6 group-hover:scale-105 transition-transform duration-300">
                            <div className="w-24 h-24 rounded-full bg-[#f2ae60] flex items-center justify-center shadow-lg shadow-[#f2ae60]/30 animate-pulse group-hover:animate-none">
                                <Play className="w-10 h-10 text-[#1a2e3b] ml-1 fill-[#1a2e3b]" />
                            </div>
                            <span className="text-white font-bold text-lg tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                Ver Demostración
                            </span>
                        </div>
                    </div>

                    {/* Ejemplo de iframe (Descomentar y usar URL real)
                    <iframe 
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/VIDEO_ID" 
                        title="Profe IC Demo"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                    */}
                </motion.div>
            </div>
        </section>
    );
};
