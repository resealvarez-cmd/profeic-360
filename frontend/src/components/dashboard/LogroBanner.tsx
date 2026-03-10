"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Star } from "lucide-react";

export type TipoLogro = "PRIMER_RECURSO" | "COBERTURA_20" | "COBERTURA_50" | "COBERTURA_100";

interface LogroConfig {
    emoji: string;
    titulo: string;
    descripcion: string;
    color: string;
    bgColor: string;
}

const LOGROS: Record<TipoLogro, LogroConfig> = {
    PRIMER_RECURSO: {
        emoji: "🌟",
        titulo: "¡Primer Recurso!",
        descripcion: "Guardaste tu primer recurso en la Biblioteca. ¡El viaje comienza!",
        color: "#f2ae60",
        bgColor: "from-amber-50 to-orange-50",
    },
    COBERTURA_20: {
        emoji: "🥉",
        titulo: "¡20% de Cobertura!",
        descripcion: "Ya cubriste el 20% de los OAs. ¡Vas por buen camino!",
        color: "#b08d57",
        bgColor: "from-amber-50 to-yellow-50",
    },
    COBERTURA_50: {
        emoji: "🥈",
        titulo: "¡Mitad del Camino!",
        descripcion: "El 50% de los OAs está cubierto. ¡Eres un ejemplo pedagógico!",
        color: "#8EA5B4",
        bgColor: "from-slate-50 to-blue-50",
    },
    COBERTURA_100: {
        emoji: "🥇",
        titulo: "¡Cobertura Total!",
        descripcion: "Alcanzaste el 100% de cobertura curricular. ¡ProfeIC de excelencia!",
        color: "#f2ae60",
        bgColor: "from-yellow-50 to-amber-100",
    },
};

interface Props {
    tipo: TipoLogro;
    asignatura?: string;
    nivel?: string;
    onClose: () => void;
}

export function LogroBanner({ tipo, asignatura, nivel, onClose }: Props) {
    const config = LOGROS[tipo];
    const [particles, setParticles] = useState<{ x: number; delay: number; color: string }[]>([]);

    useEffect(() => {
        const colors = ["#f2ae60", "#2b546e", "#1a2e3b", "#fbbf24", "#34d399"];
        setParticles(
            Array.from({ length: 20 }, (_, i) => ({
                x: Math.random() * 100,
                delay: Math.random() * 0.8,
                color: colors[i % colors.length],
            }))
        );

        const timer = setTimeout(onClose, 6000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
                {/* Confetti particles */}
                {particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute top-0 w-3 h-3 rounded-sm pointer-events-none"
                        style={{ left: `${p.x}%`, backgroundColor: p.color }}
                        initial={{ y: -20, opacity: 1, rotate: 0 }}
                        animate={{ y: "110vh", opacity: 0, rotate: 360 * 3 }}
                        transition={{ duration: 3 + Math.random(), delay: p.delay, ease: "easeIn" }}
                    />
                ))}

                {/* Main Banner */}
                <motion.div
                    className={`pointer-events-auto bg-gradient-to-br ${config.bgColor} border-2 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center relative overflow-hidden`}
                    style={{ borderColor: config.color }}
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 opacity-20 blur-3xl rounded-3xl"
                        style={{ backgroundColor: config.color }}
                    />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <X size={14} />
                    </button>

                    {/* Emoji */}
                    <motion.div
                        className="text-6xl mb-4 relative z-10"
                        animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {config.emoji}
                    </motion.div>

                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-3 relative z-10">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                            >
                                <Star size={16} className="fill-amber-400 text-amber-400" />
                            </motion.div>
                        ))}
                    </div>

                    <h2 className="text-xl font-black text-[#1a2e3b] mb-2 relative z-10">{config.titulo}</h2>
                    <p className="text-sm text-slate-600 mb-3 relative z-10">{config.descripcion}</p>

                    {(asignatura || nivel) && (
                        <div className="text-xs font-bold px-3 py-1 rounded-full bg-white/80 text-slate-500 inline-block relative z-10">
                            {asignatura} {nivel && `· ${nivel}`}
                        </div>
                    )}

                    <motion.div
                        className="mt-4 text-xs text-slate-400 relative z-10"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        Se cerrará automáticamente...
                    </motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
