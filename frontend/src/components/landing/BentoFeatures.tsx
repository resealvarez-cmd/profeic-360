"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    Bot,
    Sparkles,
    ClipboardCheck,
    FileText,
    Accessibility,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const BentoCard = ({ title, description, icon: Icon, className, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay }}
        className={cn(
            "bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between group",
            className
        )}
    >
        <div className="mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-[#1a2e3b] group-hover:text-white transition-colors duration-300">
                <Icon size={28} className="text-[#1a2e3b] group-hover:text-[#f2ae60] transition-colors" />
            </div>
        </div>
        <div>
            <h3 className="text-2xl font-bold text-[#1a2e3b] mb-2">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

export const BentoFeatures = () => {
    return (
        <section className="py-24 bg-slate-50 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center">
                    <h2 className="text-sm font-bold text-[#f2ae60] uppercase tracking-widest mb-2">Ecosistema Profe IC</h2>
                    <h3 className="text-3xl md:text-4xl font-black text-[#1a2e3b]">Todo lo que necesitas para brillar en el aula.</h3>
                </div>

                {/* 
                   Grid Calculation for 6 items (2 large, 4 small):
                   Total width units needed: 2 (Mentor) + 2 (Elevador) + 1*4 (Others) = 8 units.
                   We use a 4-column grid on desktop.
                   Row 1: Mentor (2) + Evaluación (1) + Contexto (1)
                   Row 2: Inclusión (1) + Comunidad (1) + Elevador (2)
                */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[320px]">

                    {/* 1. MENTOR IC (Large) */}
                    <BentoCard
                        title="Mentor Institucional"
                        description="Tu socio pedagógico entrenado con el PEI, Marco Red IC y reglamentos del colegio. Discute, reflexiona y crea."
                        icon={Sparkles}
                        delay={0}
                        className="md:col-span-2 bg-[#1a2e3b] text-white border-none !bg-[#1a2e3b]"
                    />

                    {/* 2. EVALUACIÓN */}
                    <BentoCard
                        title="Calibrador & Rúbricas"
                        description="Genera rúbricas alineadas al Sello Madre Paulina y audita tus instrumentos antes de imprimir."
                        icon={ClipboardCheck}
                        delay={0.1}
                    />

                    {/* 3. CONTEXTO */}
                    <BentoCard
                        title="Soberanía de Datos"
                        description="Sube tus propios textos PDF. Genera pruebas sin alucinaciones basadas 100% en tu material."
                        icon={FileText}
                        delay={0.2}
                    />

                    {/* 4. INCLUSIÓN */}
                    <BentoCard
                        title="Módulo DUA"
                        description="Adecuaciones clínicas (Visual, Kinestésica, Focalizada) para estudiantes PIE, cumpliendo el Decreto 83."
                        icon={Accessibility}
                        delay={0.3}
                    />

                    {/* 5. COMUNIDAD */}
                    <BentoCard
                        title="Sala de Profesores"
                        description="Comparte, comenta y clona recursos de tus colegas. Inteligencia colectiva en acción."
                        icon={Users}
                        delay={0.4}
                    />

                    {/* 6. ELEVADOR DOK (Large) */}
                    <BentoCard
                        title="Elevador Cognitivo"
                        description="Transforma actividades simples en experiencias de Alta Demanda Cognitiva (DOK 3-4). Desafía a tus estudiantes."
                        icon={TrendingUp}
                        delay={0.5}
                        className="md:col-span-2 bg-gradient-to-br from-white to-blue-50/50"
                    />

                </div>
            </div>
        </section>
    );
};
