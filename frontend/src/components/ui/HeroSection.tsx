"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-slate-50">
            {/* Background Decorativo */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="container px-4 md:px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6 max-w-3xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a2e3b]/5 border border-[#1a2e3b]/10 text-[#1a2e3b] text-sm font-semibold mb-4"
                    >
                        <Sparkles size={14} className="text-[#f2ae60]" />
                        <span>Nueva Versión 4.0</span>
                    </motion.div>

                    {/* Titulo Principal */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1a2e3b]">
                        El Exoesqueleto Intelectual para
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1a2e3b] to-[#f2ae60]">
                            Profesores Modernos
                        </span>
                    </h1>

                    {/* Subtitulo */}
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Planifica, evalúa y adapta tu enseñanza con la potencia de la Inteligencia Artificial.
                        Recupera tu tiempo y soberanía pedagógica.
                    </p>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button className="px-8 py-4 bg-[#1a2e3b] text-white rounded-full font-bold shadow-lg hover:bg-[#203e52] transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                            Comenzar Ahora <ArrowRight size={20} />
                        </button>
                        <button className="px-8 py-4 bg-white text-[#1a2e3b] border-2 border-slate-200 rounded-full font-bold hover:bg-slate-50 transform hover:scale-105 transition-all">
                            Ver Demo
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
