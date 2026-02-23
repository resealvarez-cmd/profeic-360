"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
    return (
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-white px-4">

            {/* FONDO ABSTRACTO / PATRÓN */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 mt-10">
                {/* LOGO COLEGIO */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-2"
                >
                    <Image src="/logo.png" alt="Insignia Colegio Madre Paulina" width={100} height={100} className="object-contain" />
                </motion.div>

                {/* BAGDE ANIMADO */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 shadow-sm mb-4"
                >
                    <Sparkles className="w-4 h-4 text-[#f2ae60]" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Potenciado por Gemini 2.5</span>
                </motion.div>

                {/* HEADLINE */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black text-[#1a2e3b] tracking-tight leading-[0.9]"
                >
                    Inteligencia <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a2e3b] via-[#2b546e] to-[#f2ae60]">Aumentada,</span> <br />
                    Criterio Docente.
                </motion.h1>

                {/* SUBHEADLINE */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed"
                >
                    El exoesqueleto intelectual diseñado exclusivamente para los profesores del <strong className="text-[#1a2e3b]">Colegio Madre Paulina</strong>.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex justify-center pt-6"
                >
                    <Link href="/login">
                        <button className="group relative px-8 py-4 bg-[#1a2e3b] text-white rounded-full font-bold text-lg shadow-xl hover:bg-[#254153] transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                            Ingresar a la Plataforma
                            <span className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                                <ArrowRight size={20} />
                            </span>
                        </button>
                    </Link>
                </motion.div>

                {/* SOCIAL PROOF MINI */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="pt-12 flex justify-center items-center gap-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                >
                    <p className="text-xs font-bold text-slate-400">HERRAMIENTA OFICIAL</p>
                    <div className="h-4 w-[1px] bg-slate-300"></div>
                    <p className="text-xs font-serif text-slate-500 italic">Decreto 67 Compatible</p>
                </motion.div>

            </div>
        </section>
    );
};
