"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, Brain, TrendingUp, AlertTriangle, Lightbulb,
    BookOpen, ClipboardCheck, Scale, RefreshCw, ChevronRight,
    BarChart2, Layers, Zap
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface InsightAlert {
    tipo: "warning" | "info" | "tip";
    mensaje: string;
    accion: string;
}

interface InsightStats {
    total_recursos: number;
    tipos: Record<string, number>;
    asignaturas: Record<string, number>;
    ultimo_recurso: string | null;
}

interface InsightData {
    has_data: boolean;
    insight_text: string | null;
    stats: InsightStats;
    alerts: InsightAlert[];
}

const TIPO_LABEL: Record<string, string> = {
    EVALUACION: "Evaluaciones",
    PLANIFICACION: "Planificaciones",
    RUBRICA: "Rúbricas",
    LECTURA: "Lecturas",
    NEE: "Adecuaciones",
    GENERAL: "Otros"
};

const TIPO_ICON: Record<string, React.ReactNode> = {
    EVALUACION: <ClipboardCheck size={14} />,
    PLANIFICACION: <BookOpen size={14} />,
    RUBRICA: <Scale size={14} />,
    LECTURA: <Layers size={14} />,
    NEE: <Brain size={14} />,
};

const ALERT_CONFIG = {
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />, textColor: "text-amber-900" },
    info: { bg: "bg-blue-50", border: "border-blue-200", icon: <TrendingUp size={16} className="text-blue-500 shrink-0 mt-0.5" />, textColor: "text-blue-900" },
    tip: { bg: "bg-purple-50", border: "border-purple-200", icon: <Lightbulb size={16} className="text-purple-500 shrink-0 mt-0.5" />, textColor: "text-purple-900" },
};

const ACTION_LINKS: Record<string, string> = {
    "Genera una planificación": "/planificador",
    "Prueba el Elevador Cognitivo": "/elevador",
    "Crea una rúbrica para complementar": "/rubricas",
};

export function InsightsWidget() {
    const [data, setData] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInsights = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (!token) return;

            const res = await fetch(`${API_URL}/dashboard/insights`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (err) {
            console.error("[InsightsWidget] Error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    if (loading) {
        return (
            <div className="w-full bg-gradient-to-br from-[#1a2e3b] to-[#2b546e] rounded-3xl p-6 animate-pulse">
                <div className="h-5 w-40 bg-white/20 rounded-lg mb-4" />
                <div className="h-16 bg-white/10 rounded-xl mb-3" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/10 rounded-xl" />)}
                </div>
            </div>
        );
    }

    if (!data || !data.has_data) {
        return (
            <div className="w-full bg-gradient-to-br from-[#1a2e3b] to-[#2b546e] rounded-3xl p-8 text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="text-[#f2ae60]" size={28} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Tu mentor IA está listo</h3>
                <p className="text-white/60 text-sm mb-5">
                    Genera tu primer recurso (planificación, evaluación o rúbrica) y comenzaré a analizarte.
                </p>
                <Link
                    href="/planificador"
                    className="inline-flex items-center gap-2 bg-[#f2ae60] text-[#1a2e3b] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e09d50] transition-colors"
                >
                    <BookOpen size={16} /> Crear primera planificación
                </Link>
            </div>
        );
    }

    const { insight_text, stats, alerts } = data;
    const tipos = Object.entries(stats.tipos).sort((a, b) => b[1] - a[1]).slice(0, 4);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-br from-[#1a2e3b] to-[#2b546e] rounded-3xl overflow-hidden shadow-xl shadow-[#1a2e3b]/30"
        >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#f2ae60]/20 rounded-xl flex items-center justify-center">
                        <Brain className="text-[#f2ae60]" size={22} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-base leading-tight">Mentor IA</h3>
                        <p className="text-white/40 text-xs">{stats.total_recursos} recursos analizados</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchInsights(true)}
                    disabled={refreshing}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white/80"
                    title="Actualizar análisis"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Insight paragraph */}
            <div className="px-6 pb-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <div className="flex gap-2 items-start">
                        <Sparkles size={14} className="text-[#f2ae60] shrink-0 mt-0.5" />
                        <p className="text-white/90 text-sm leading-relaxed">
                            {insight_text}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats chips */}
            {tipos.length > 0 && (
                <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                        {tipos.map(([tipo, count]) => (
                            <div
                                key={tipo}
                                className="flex items-center gap-1.5 bg-white/10 border border-white/10 text-white/75 text-xs px-3 py-1.5 rounded-full"
                            >
                                {TIPO_ICON[tipo] || <BarChart2 size={14} />}
                                <span>{TIPO_LABEL[tipo] || tipo}</span>
                                <span className="font-bold text-white">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="px-4 pb-5 space-y-2">
                    {alerts.map((alert, i) => {
                        const cfg = ALERT_CONFIG[alert.tipo];
                        const href = ACTION_LINKS[alert.accion];
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className={`flex items-start gap-2 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                            >
                                {cfg.icon}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium ${cfg.textColor}`}>{alert.mensaje}</p>
                                    {href ? (
                                        <Link
                                            href={href}
                                            className="text-xs font-bold text-[#2b546e] hover:underline flex items-center gap-0.5 mt-0.5"
                                        >
                                            {alert.accion} <ChevronRight size={12} />
                                        </Link>
                                    ) : (
                                        <p className="text-xs font-bold text-[#2b546e] mt-0.5">{alert.accion}</p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
