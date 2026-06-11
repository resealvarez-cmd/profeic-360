"use client";

import React, { useState } from "react";
import { 
    LineChart, 
    Line, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Clock, AlertTriangle, Sparkles, BarChart2 } from "lucide-react";

interface EvolucionPunto {
    corte: string;
    promedio: number;
    aprobacion: number;
    atrasos: number;
    alumnos_riesgo: number;
}

interface DesglosePunto {
    curso: string;
    promedio: number;
    aprobacion: number;
    atrasos: number;
    alumnos_riesgo: number;
}

interface GraficoEvolucionProps {
    data: EvolucionPunto[];
    desgloseData?: DesglosePunto[];
}

export default function GraficoEvolucion({ data, desgloseData = [] }: GraficoEvolucionProps) {
    const [activeTab, setActiveTab] = useState<"academic" | "attendance" | "risk">("academic");
    const [viewMode, setViewMode] = useState<"temporal" | "desglose">("temporal");

    if (!data || data.length === 0) {
        return (
            <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[300px]">
                <p className="text-xs text-slate-400 italic font-bold">Cargando datos evolutivos...</p>
            </div>
        );
    }

    // Configuración del tema de color premium de ProfeIC (Branding Original)
    const colors = {
        primary: "#1B3C73",      // Azul Marino Profundo (Sidebar y branding)
        secondary: "#2E75B6",    // Índigo Royal
        accent: "#C87533",       // Cobre/Oro Elegante (Atrasos y acentos)
        grid: "#f1f5f9",         // Slate 100
        bg: "transparent"
    };

    // Tooltip personalizado estilizado
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-3.5 rounded-2xl shadow-xl font-sans">
                    <p className="text-xs font-black text-slate-800 tracking-tight mb-2 border-b border-slate-100 pb-1.5">{label}</p>
                    {payload.map((pld: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 justify-between text-xs py-0.5">
                            <span className="font-bold text-slate-500" style={{ color: pld.color }}>
                                {pld.name}:
                            </span>
                            <span className="font-mono font-black text-slate-800">
                                {pld.value} {pld.name.includes("Atrasos") ? "mins" : pld.name.includes("Aprobación") ? "%" : ""}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const chartData = viewMode === "temporal" ? data : desgloseData;
    const xKey = viewMode === "temporal" ? "corte" : "curso";

    return (
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xl shadow-slate-100/30 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabecera del gráfico */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h4 className="text-base font-extrabold text-[#1B3C73] tracking-tight flex items-center gap-2">
                        {viewMode === "temporal" ? <TrendingUp className="w-5 h-5 text-[#1B3C73]" /> : <BarChart2 className="w-5 h-5 text-[#1B3C73]" />}
                        {viewMode === "temporal" ? "Tendencia e Impacto Temporal" : "Desglose Transversal por Curso"}
                    </h4>
                    <p className="text-xs text-slate-400 font-bold tracking-tight mt-0.5">
                        {viewMode === "temporal" ? "Monitoreo evolutivo de métricas pedagógicas por semana / mes" : "Comparativa de métricas entre distintos cursos del mismo nivel"}
                    </p>
                </div>

                <div className="flex flex-col gap-2 items-end">
                    {/* Toggle Switch */}
                    <div className="bg-slate-100/60 border border-slate-200/30 rounded-2xl p-1 flex gap-1 shadow-inner self-start sm:self-auto">
                        <button
                            onClick={() => setViewMode("temporal")}
                            className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
                                viewMode === "temporal" 
                                    ? "bg-white text-[#1B3C73] shadow-sm border border-slate-200/50" 
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Evolución</span>
                        </button>
                        <button
                            onClick={() => setViewMode("desglose")}
                            className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
                                viewMode === "desglose" 
                                    ? "bg-white text-[#1B3C73] shadow-sm border border-slate-200/50" 
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <BarChart2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Por Curso</span>
                        </button>
                    </div>

                    {/* Tabs de Selección de Métrica */}
                <div className="bg-slate-100/60 border border-slate-200/30 rounded-2xl p-1 flex gap-1 self-start sm:self-auto shadow-inner">
                    {[
                        { id: "academic", label: "Académico", icon: TrendingUp, color: "text-[#1B3C73]" },
                        { id: "attendance", label: "Atrasos", icon: Clock, color: "text-[#C87533]" },
                        { id: "risk", label: "Doble Riesgo", icon: AlertTriangle, color: "text-red-600" }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`text-[11px] font-extrabold px-3.5 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 ${
                                    isSelected 
                                        ? `bg-white ${tab.color} shadow-sm border border-slate-200/50` 
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50 border border-transparent"
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'animate-pulse' : ''}`} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
                </div>
            </div>

            {/* Contenedor del Gráfico Dinámico */}
            <div className="h-[280px] w-full relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab + viewMode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            {activeTab === "academic" ? (
                                viewMode === "temporal" ? (
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                                        <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                        <YAxis domain={[1.0, 7.0]} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold", paddingTop: 10 }} />
                                        <Line name="Promedio General" type="monotone" dataKey="promedio" stroke={colors.primary} strokeWidth={3} activeDot={{ r: 6 }} />
                                        <Line name="Tasa Aprobación (%)" type="monotone" dataKey="aprobacion" stroke={colors.secondary} strokeWidth={2} />
                                    </LineChart>
                                ) : (
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                                        <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                        <YAxis domain={[1.0, 7.0]} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold", paddingTop: 10 }} />
                                        <Bar name="Promedio" dataKey="promedio" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                )
                            ) : activeTab === "attendance" ? (
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                                    <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                    <YAxis tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold", paddingTop: 10 }} />
                                    <Bar name="Minutos Atrasos Acumulados" dataKey="atrasos" fill={colors.accent} radius={[8, 8, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            ) : (
                                viewMode === "temporal" ? (
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                                        <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                        <YAxis tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold", paddingTop: 10 }} />
                                        <Line name="Alumnos en Doble Riesgo" type="monotone" dataKey="alumnos_riesgo" stroke="#e11d48" strokeWidth={3} activeDot={{ r: 6 }} />
                                    </LineChart>
                                ) : (
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                                        <XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                        <YAxis tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold", paddingTop: 10 }} />
                                        <Bar name="Alumnos en Doble Riesgo" dataKey="alumnos_riesgo" fill="#e11d48" radius={[8, 8, 0, 0]} maxBarSize={60} />
                                    </BarChart>
                                )
                            )}
                        </ResponsiveContainer>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="bg-[#FFF9E6]/50 border border-[#FFEBA6]/40 p-4 rounded-2xl flex gap-2.5 text-xs text-slate-700 items-start">
                <Sparkles className="w-5 h-5 text-[#C87533] shrink-0 mt-0.5" />
                <div>
                    <span className="font-extrabold text-[#C87533] tracking-tight">Evolución Predictiva:</span>
                    {(() => {
                        if (!chartData || chartData.length === 0) return <span> Analizando datos...</span>;
                        const lastPoint = chartData[chartData.length - 1];
                        
                        if (activeTab === "academic") {
                            return <span> Se registra un promedio base de {lastPoint.promedio.toFixed(1)} y una aprobación del {lastPoint.aprobacion.toFixed(1)}%, requiere seguimiento continuo.</span>;
                        } else if (activeTab === "attendance") {
                            return <span> Se contabilizan {lastPoint.atrasos} minutos totales de atrasos, validar impacto en clima de aula.</span>;
                        } else {
                            return <span> {lastPoint.alumnos_riesgo} estudiantes detectados en zona de doble riesgo crítico para intervención inmediata.</span>;
                        }
                    })()}
                </div>
            </div>
        </div>
    );
}
