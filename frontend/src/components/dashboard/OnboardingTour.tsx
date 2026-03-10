"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface TourStep {
    title: string;
    description: string;
    emoji: string;
    targetId?: string; // ID of element to highlight
    position: "center" | "bottom-right" | "bottom-left" | "top-right";
}

const STEPS: TourStep[] = [
    {
        emoji: "👋",
        title: "¡Bienvenido/a a ProfeIC!",
        description: "Te mostramos en 30 segundos todo lo que puedes hacer desde el Dashboard. ¡Es muy fácil!",
        position: "center",
    },
    {
        emoji: "🎯",
        title: "Tu Cobertura Curricular",
        description: "Aquí verás en tiempo real cuántos Objetivos de Aprendizaje has abordado este año. Cada recurso que guardes en la Biblioteca suma progreso.",
        targetId: "tour-tracker",
        position: "bottom-right",
    },
    {
        emoji: "🏆",
        title: "Sistema de Logros",
        description: "Desbloquea medallas de bronce, plata y oro al llegar al 20%, 50% y 100% de cobertura. ¡Celebrate tus avances!",
        targetId: "tour-tracker",
        position: "bottom-right",
    },
    {
        emoji: "🧠",
        title: "Mentor IA",
        description: "Tu asistente pedagógico personal. Te entrega insights basados en tu actividad para orientar tu planificación.",
        targetId: "tour-insights",
        position: "bottom-left",
    },
    {
        emoji: "📚",
        title: "Tu Biblioteca",
        description: "Todos tus recursos guardados: planificaciones, rúbricas, evaluaciones y más. Desde aquí puedes exportarlos, reutilizarlos o compartirlos.",
        targetId: "tour-biblioteca",
        position: "bottom-right",
    },
    {
        emoji: "✨",
        title: "¡Todo listo!",
        description: "Ya conoces el Dashboard. Empieza creando tu primer recurso desde el menú lateral. ¡ProfeIC está aquí para acompañarte!",
        position: "center",
    },
];

interface Props {
    onComplete: () => void;
}

export function OnboardingTour({ onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [highlight, setHighlight] = useState<DOMRect | null>(null);
    const current = STEPS[step];

    useEffect(() => {
        if (current.targetId) {
            const el = document.getElementById(current.targetId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => {
                    setHighlight(el.getBoundingClientRect());
                }, 350);
            }
        } else {
            setHighlight(null);
        }
    }, [step, current.targetId]);

    const next = () => {
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else onComplete();
    };
    const prev = () => setStep(s => Math.max(0, s - 1));

    const tooltipPositionClass = {
        "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "bottom-right": "bottom-8 right-8",
        "bottom-left": "bottom-8 left-8",
        "top-right": "top-16 right-8",
    }[current.position];

    return (
        <div className="fixed inset-0 z-[9000] pointer-events-none">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onComplete} />

            {/* Spotlight highlight */}
            <AnimatePresence>
                {highlight && (
                    <motion.div
                        key="spotlight"
                        className="absolute rounded-2xl ring-4 ring-[#f2ae60] ring-offset-2 ring-offset-transparent pointer-events-none z-[9001]"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            top: highlight.top - 6 + (typeof window !== "undefined" ? window.scrollY : 0),
                            left: highlight.left - 6,
                            width: highlight.width + 12,
                            height: highlight.height + 12,
                            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Tooltip Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    className={`absolute z-[9002] pointer-events-auto w-full max-w-sm ${tooltipPositionClass}`}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={current.position === "center" ? {} : { margin: "1rem" }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f2ae60] via-[#2b546e] to-[#1a2e3b]" />

                        {/* Close */}
                        <button
                            onClick={onComplete}
                            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-500"
                        >
                            <X size={12} />
                        </button>

                        {/* Step indicator dots */}
                        <div className="flex gap-1.5 mb-4">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-[#f2ae60]" : i < step ? "w-2 bg-[#2b546e]" : "w-2 bg-slate-200"
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="text-3xl mb-3">{current.emoji}</div>
                        <h3 className="font-black text-[#1a2e3b] text-base mb-2">{current.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-5">{current.description}</p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={prev}
                                disabled={step === 0}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-0"
                            >
                                <ChevronLeft size={14} /> Anterior
                            </button>

                            <button
                                onClick={next}
                                className="flex items-center gap-2 bg-[#1a2e3b] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#2b546e] transition-colors shadow-lg"
                            >
                                {step < STEPS.length - 1 ? (
                                    <>Siguiente <ChevronRight size={14} /></>
                                ) : (
                                    <><Sparkles size={14} /> ¡Empezar!</>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
