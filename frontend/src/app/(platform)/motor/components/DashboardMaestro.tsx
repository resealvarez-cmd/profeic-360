"use client";

import React from "react";
import { DirectorDashboard } from "../types";
import { 
    TrendingUp, 
    BookOpen, 
    AlertTriangle, 
    Activity, 
    ArrowUpRight, 
    Award, 
    Users, 
    Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";
import GraficoEvolucion from "./GraficoEvolucion";

interface DashboardMaestroProps {
    data: DirectorDashboard;
    evolucionData: any[];
    desgloseData?: any[];
}

export default function DashboardMaestro({ data, evolucionData, desgloseData = [] }: DashboardMaestroProps) {
    const currentPeriodId = data.periodo_id;
    const allKeys = Object.keys(data.datos_academicos_longitudinal).sort();
    
    // El actual es el seleccionado (s2)
    const s2 = data.datos_academicos_longitudinal[currentPeriodId] ?? { promedio: 0, aprobacion: 0, atrasos: 0 };
    
    // Intentar buscar el periodo anterior (s1), si no existe, comparamos contra sí mismo o cero
    const prevKey = allKeys.find(k => k < currentPeriodId);
    const s1 = prevKey ? data.datos_academicos_longitudinal[prevKey] : s2;

    // Calcular variaciones
    const promedioDiff = s2.promedio - s1.promedio;
    const aprobacionDiff = s2.aprobacion - s1.aprobacion;
    const atrasosDiff = s2.atrasos - s1.atrasos;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Tarjetas de Indicadores Macro de Impacto (Branding ProfeIC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Promedio General */}
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:border-[#1B3C73]/30 hover:shadow-lg shadow-sm">
                    <div>
                        <p className="text-slate-500 text-xs font-bold tracking-wider uppercase font-mono">Promedio General</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1 font-mono">{s2.promedio.toFixed(1)}</h3>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 mt-2.5 w-max border ${
                            promedioDiff >= 0 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                            {promedioDiff >= 0 ? `+${promedioDiff.toFixed(1)}` : `${promedioDiff.toFixed(1)}`} vs S1
                        </span>
                    </div>
                    <div className="p-3 bg-[#1B3C73]/5 text-[#1B3C73] rounded-xl border border-[#1B3C73]/10">
                        <Award className="w-6 h-6" />
                    </div>
                </div>

                {/* % Aprobación */}
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:border-[#1B3C73]/30 hover:shadow-lg shadow-sm">
                    <div>
                        <p className="text-slate-500 text-xs font-bold tracking-wider uppercase font-mono">Tasa de Aprobación</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1 font-mono">{s2.aprobacion.toFixed(1)}%</h3>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 mt-2.5 w-max border ${
                            aprobacionDiff >= 0 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                            {aprobacionDiff >= 0 ? `+${aprobacionDiff.toFixed(1)}%` : `${aprobacionDiff.toFixed(1)}%`} vs S1
                        </span>
                    </div>
                    <div className="p-3 bg-[#1B3C73]/5 text-[#1B3C73] rounded-xl border border-[#1B3C73]/10">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                {/* Minutos Atrasos */}
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:border-[#C87533]/30 hover:shadow-lg shadow-sm">
                    <div>
                        <p className="text-slate-500 text-xs font-bold tracking-wider uppercase font-mono">Atrasos Totales</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1 font-mono">{s2.atrasos} <span className="text-xs text-slate-400 font-normal">mins</span></h3>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 mt-2.5 w-max border ${
                            atrasosDiff <= 0 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                            {atrasosDiff <= 0 ? `${atrasosDiff} mins` : `+${atrasosDiff} mins`} vs S1
                        </span>
                    </div>
                    <div className="p-3 bg-[#C87533]/10 text-[#C87533] rounded-xl border border-[#C87533]/20">
                        <Activity className="w-6 h-6" />
                    </div>
                </div>

                {/* Alumnos Doble Riesgo */}
                <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center justify-between hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 hover:border-rose-300 hover:shadow-lg shadow-sm">
                    <div>
                        <p className="text-slate-500 text-xs font-bold tracking-wider uppercase font-mono">Doble Riesgo Crítico</p>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1 font-mono">{data.alumnos_doble_riesgo_resumen.en_riesgo_critico}</h3>
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 mt-2.5 w-max">
                            {data.alumnos_doble_riesgo_resumen.variacion_mensual} este mes
                        </span>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Dos Columnas: Comparación Longitudinal vs Distribución DOK */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Rendimiento Longitudinal */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <div>
                        <h4 className="text-base font-extrabold text-slate-800 tracking-tight">Comparativa de Impacto Longitudinal</h4>
                        <p className="text-xs text-slate-500 font-medium">Conversión de indicadores académicos entre semestres del período {data.periodo_id}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {[
                            { name: "Promedio Escolar", val1: s1.promedio.toFixed(1), val2: s2.promedio.toFixed(1), pct: (s2.promedio / 7.0) * 100, color: "bg-gradient-to-r from-[#1B3C73] to-[#2E75B6]" },
                            { name: "Aprobación de Asignaturas", val1: `${s1.aprobacion.toFixed(0)}%`, val2: `${s2.aprobacion.toFixed(0)}%`, pct: s2.aprobacion, color: "bg-gradient-to-r from-[#2E75B6] to-[#4A90E2]" },
                            { name: "Reducción de Atrasos", val1: `${s1.atrasos} mins`, val2: `${s2.atrasos} mins`, pct: 100 - (s2.atrasos / 20), color: "bg-gradient-to-r from-[#C87533] to-[#E59850]" }
                        ].map((metric, idx) => (
                            <div key={idx} className="flex flex-col gap-2.5 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-700">{metric.name}</span>
                                    <span className="font-mono text-slate-500">
                                        <span className="line-through mr-2">{metric.val1}</span>
                                        <span className="text-slate-800 font-black text-sm">{metric.val2}</span>
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                    <motion.div 
                                        className={`h-full rounded-full ${metric.color}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${metric.pct}%` }}
                                        transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.15 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Niveles DOK */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <div>
                        <h4 className="text-base font-extrabold text-slate-800 tracking-tight">Niveles de Profundidad del Conocimiento (DOK)</h4>
                        <p className="text-xs text-slate-500 font-medium">Nivel de profundidad de conocimiento activo en evaluaciones de ciclo</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {Object.entries(data.graficos_conversion_dok).map(([key, val], idx) => {
                            // BUG FIX (Bug 3): el backend puede retornar "38%" (string) o 38 (number).
                            // Parseamos defensivamente para evitar el doble % ("38%%") en la barra animada.
                            const numVal = typeof val === "number" ? val : parseFloat(String(val).replace("%", "")) || 0;
                            let barColor = "bg-gradient-to-r from-blue-600 to-blue-400"; // azul
                            if (key.includes("DOK 2")) barColor = "bg-gradient-to-r from-[#1B3C73] to-[#2E75B6]"; // branding blue
                            if (key.includes("DOK 3")) barColor = "bg-gradient-to-r from-[#C87533] to-[#E59850]"; // branding copper
                            
                            return (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-40 text-xs font-bold text-slate-700 truncate font-mono">{key}</div>
                                    <div className="flex-1 bg-slate-100 border border-slate-200 h-6 rounded-lg overflow-hidden relative shadow-inner">
                                        <motion.div 
                                            className={`h-full ${barColor}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${numVal}%` }}
                                            transition={{ duration: 1, delay: 0.3 + (idx * 0.1) }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-end px-3">
                                            <span className="text-[10px] font-black text-slate-800 mix-blend-overlay drop-shadow-sm">{numVal}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 text-xs text-slate-700">
                        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-extrabold text-amber-700">Recomendación IA:</span> Elevar en un <span className="font-extrabold text-[#1B3C73]">5%</span> el peso de ítems reflexivos (DOK 3) en el próximo ciclo evaluativo para fortalecer el razonamiento profundo y evaluar con precisión el dominio de habilidades de nivel superior.
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de Evolución Temporal de Cortes (V2.5) */}
            <GraficoEvolucion data={evolucionData} desgloseData={desgloseData} />

            {/* Desafíos Directivos Inversos */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            Desafíos Directivos Inversos
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-0.5 rounded-full">Acción Requerida</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">Tareas e intervenciones estratégicas basadas en nudos y cuellos de botella detectados en el colegio</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.desafios_directivos_inversos.map((desafio, idx) => (
                        <div 
                            key={idx} 
                            className="bg-slate-50 hover:bg-slate-100 transition-all duration-300 border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group shadow-sm"
                        >
                            {/* Línea decorativa lateral */}
                            <div className={`absolute left-0 inset-y-0 w-2 ${
                                desafio.urgencia === "Crítica" ? "bg-rose-500" : "bg-emerald-500"
                            }`}></div>

                            <div className="flex justify-between items-start pl-3">
                                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                    desafio.urgencia === "Crítica" 
                                        ? "bg-rose-50 text-rose-700 border-rose-200" 
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}>
                                    Prioridad {desafio.urgencia}
                                </span>
                                <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-[#1B3C73] transition-colors" />
                            </div>

                            <p className="text-xs font-bold text-slate-700 leading-snug pl-3">{desafio.tarea}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
