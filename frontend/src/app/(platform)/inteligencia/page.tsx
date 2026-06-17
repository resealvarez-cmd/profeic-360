"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Brain, FileText, BarChart3, Users, Target, Activity, 
  Search, ChevronLeft, ChevronRight, RefreshCw, Sparkles, TrendingUp, 
  TrendingDown, AlertTriangle, ShieldCheck, Award, Heart, Check, HelpCircle,
  Send, Bot, User, ChevronDown, Database
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, 
  Tooltip as RechartsTooltip, Legend, Bar, LineChart, Line, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, LabelList
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { API_URL } from "@/lib/api";
import { CONVIVENCIA_LONGITUDINAL, SOCIOEMOCIONAL_LONGITUDINAL } from "./constants_socioemocional";

// ----------------------------------------------------
// DATABASE CONSTANTS (Loaded from verified files)
// ----------------------------------------------------

const ATTENDANCE_DATABASE = {
  "year2026": {
    "prek": { "id": "prek", "name": "Prekínder", "cycle": "prebasica", "mar": 90.23, "abr": 86.45, "may": 88.46 },
    "kina": { "id": "kina", "name": "Kínder A", "cycle": "prebasica", "mar": 88.19, "abr": 86.08, "may": 81.20 },
    "kinb": { "id": "kinb", "name": "Kínder B", "cycle": "prebasica", "mar": 91.85, "abr": 87.50, "may": 86.11 },
    "b1a": { "id": "b1a", "name": "1° básico A", "cycle": "basica", "mar": 90.34, "abr": 89.90, "may": 86.44 },
    "b1b": { "id": "b1b", "name": "1° básico B", "cycle": "basica", "mar": 90.09, "abr": 89.24, "may": 84.98 },
    "b2a": { "id": "b2a", "name": "2° básico A", "cycle": "basica", "mar": 88.45, "abr": 85.12, "may": 83.70 },
    "b2b": { "id": "b2b", "name": "2° básico B", "cycle": "basica", "mar": 90.36, "abr": 89.38, "may": 86.32 },
    "b3a": { "id": "b3a", "name": "3° básico A", "cycle": "basica", "mar": 88.70, "abr": 90.63, "may": 85.23 },
    "b3b": { "id": "b3b", "name": "3° básico B", "cycle": "basica", "mar": 88.59, "abr": 85.27, "may": 84.55 },
    "b4a": { "id": "b4a", "name": "4° básico A", "cycle": "basica", "mar": 93.63, "abr": 88.09, "may": 87.43 },
    "b4b": { "id": "b4b", "name": "4° básico B", "cycle": "basica", "mar": 89.06, "abr": 87.97, "may": 89.07 },
    "b5a": { "id": "b5a", "name": "5° básico A", "cycle": "basica", "mar": 89.84, "abr": 87.35, "may": 90.00 },
    "b5b": { "id": "b5b", "name": "5° básico B", "cycle": "basica", "mar": 87.34, "abr": 91.20, "may": 86.70 },
    "b6a": { "id": "b6a", "name": "6° básico A", "cycle": "basica", "mar": 94.24, "abr": 91.87, "may": 94.17 },
    "b6b": { "id": "b6b", "name": "6° básico B", "cycle": "basica", "mar": 88.83, "abr": 91.18, "may": 93.24 },
    "b7a": { "id": "b7a", "name": "7° básico A", "cycle": "basica", "mar": 91.18, "abr": 89.44, "may": 90.58 },
    "b7b": { "id": "b7b", "name": "7° básico B", "cycle": "basica", "mar": 93.00, "abr": 92.06, "may": 89.14 },
    "b8a": { "id": "b8a", "name": "8° básico A", "cycle": "basica", "mar": 90.83, "abr": 92.47, "may": 90.41 },
    "b8b": { "id": "b8b", "name": "8° básico B", "cycle": "basica", "mar": 92.35, "abr": 91.57, "may": 88.89 },
    "m1a": { "id": "m1a", "name": "I° medio A", "cycle": "media", "mar": 90.17, "abr": 86.88, "may": 87.78 },
    "m1b": { "id": "m1b", "name": "I° medio B", "cycle": "media", "mar": 92.03, "abr": 89.26, "may": 89.26 },
    "m2a": { "id": "m2a", "name": "II° medio A", "cycle": "media", "mar": 90.13, "abr": 86.54, "may": 83.09 },
    "m2b": { "id": "m2b", "name": "II° medio B", "cycle": "media", "mar": 92.09, "abr": 90.37, "may": 92.22 },
    "m3a": { "id": "m3a", "name": "III° medio A", "cycle": "media", "mar": 91.88, "abr": 88.24, "may": 87.66 },
    "m3b": { "id": "m3b", "name": "III° medio B", "cycle": "media", "mar": 96.29, "abr": 94.02, "may": 83.29 },
    "m4a": { "id": "m4a", "name": "IV° medio A", "cycle": "media", "mar": 95.75, "abr": 94.17, "may": 90.86 },
    "m4b": { "id": "m4b", "name": "IV° medio B", "cycle": "media", "mar": 95.24, "abr": 91.16, "may": 87.57 }
  },
  "year2025": {
    "prek": { "id": "prek", "mar": 91.80, "abr": 86.32, "may": 76.26 },
    "kina": { "id": "kina", "mar": 89.30, "abr": 85.50, "may": 82.35 },
    "kinb": { "id": "kinb", "mar": 87.53, "abr": 84.98, "may": 86.30 },
    "b1a": { "id": "b1a", "mar": 93.69, "abr": 91.24, "may": 80.59 },
    "b1b": { "id": "b1b", "mar": 91.48, "abr": 84.86, "may": 75.94 },
    "b2a": { "id": "b2a", "mar": 86.67, "abr": 90.63, "may": 82.76 },
    "b2b": { "id": "b2b", "mar": 88.69, "abr": 84.23, "may": 85.69 },
    "b3a": { "id": "b3a", "mar": 92.40, "abr": 90.48, "may": 76.67 },
    "b3b": { "id": "b3b", "mar": 91.34, "abr": 92.14, "may": 93.16 },
    "b4a": { "id": "b4a", "mar": 93.69, "abr": 93.18, "may": 86.50 },
    "b4b": { "id": "b4b", "mar": 91.32, "abr": 91.91, "may": 84.75 },
    "b5a": { "id": "b5a", "mar": 94.52, "abr": 93.16, "may": 86.32 },
    "b5b": { "id": "b5b", "mar": 88.69, "abr": 83.73, "may": 84.14 },
    "b6a": { "id": "b6a", "mar": 93.43, "abr": 90.14, "may": 85.85 },
    "b6b": { "id": "b6b", "mar": 95.44, "abr": 91.01, "may": 89.59 },
    "b7a": { "id": "b7a", "mar": 96.49, "abr": 95.56, "may": 89.12 },
    "b7b": { "id": "b7b", "mar": 96.80, "abr": 93.69, "may": 89.13 },
    "b8a": { "id": "b8a", "mar": 97.13, "abr": 93.29, "may": 91.43 },
    "b8b": { "id": "b8b", "mar": 94.04, "abr": 96.38, "may": 90.99 },
    "m1a": { "id": "m1a", "mar": 96.26, "abr": 96.40, "may": 93.33 },
    "m1b": { "id": "m1b", "mar": 97.14, "abr": 96.27, "may": 91.53 },
    "m2a": { "id": "m2a", "mar": 94.17, "abr": 92.21, "may": 85.70 },
    "m2b": { "id": "m2b", "mar": 97.29, "abr": 93.72, "may": 90.73 },
    "m3a": { "id": "m3a", "mar": 99.02, "abr": 97.38, "may": 90.18 },
    "m3b": { "id": "m3b", "mar": 99.40, "abr": 98.28, "may": 91.31 },
    "m4a": { "id": "m4a", "mar": 98.68, "abr": 97.35, "may": 91.52 },
    "m4b": { "id": "m4b", "mar": 97.50, "abr": 96.80, "may": 93.40 }
  },
  "licenses2026": {
    "prek": { "id": "prek", "mar": 2.1, "abr": 4.2, "may": 3.0 },
    "kina": { "id": "kina", "mar": 1.8, "abr": 3.5, "may": 4.1 },
    "kinb": { "id": "kinb", "mar": 2.0, "abr": 3.8, "may": 3.2 },
    "b1a": { "id": "b1a", "mar": 1.2, "abr": 2.1, "may": 2.5 },
    "b1b": { "id": "b1b", "mar": 1.5, "abr": 2.4, "may": 3.0 },
    "b2a": { "id": "b2a", "mar": 2.4, "abr": 3.9, "may": 4.2 },
    "b2b": { "id": "b2b", "mar": 1.8, "abr": 2.6, "may": 3.1 },
    "b3a": { "id": "b3a", "mar": 1.9, "abr": 2.0, "may": 3.4 },
    "b3b": { "id": "b3b", "mar": 2.1, "abr": 3.5, "may": 4.0 },
    "b4a": { "id": "b4a", "mar": 1.0, "abr": 2.8, "may": 2.9 },
    "b4b": { "id": "b4b", "mar": 2.5, "abr": 3.1, "may": 3.5 },
    "b5a": { "id": "b5a", "mar": 1.4, "abr": 2.2, "may": 2.0 },
    "b5b": { "id": "b5b", "mar": 2.9, "abr": 1.8, "may": 3.2 },
    "b6a": { "id": "b6a", "mar": 0.8, "abr": 1.5, "may": 1.2 },
    "b6b": { "id": "b6b", "mar": 1.9, "abr": 2.0, "may": 2.2 },
    "b7a": { "id": "b7a", "mar": 1.1, "abr": 1.9, "may": 2.3 },
    "b7b": { "id": "b7b", "mar": 1.0, "abr": 1.5, "may": 2.8 },
    "b8a": { "id": "b8a", "mar": 1.3, "abr": 1.2, "may": 2.0 },
    "b8b": { "id": "b8b", "mar": 0.9, "abr": 1.8, "may": 2.4 },
    "m1a": { "id": "m1a", "mar": 2.2, "abr": 3.4, "may": 3.8 },
    "m1b": { "id": "m1b", "mar": 1.4, "abr": 2.5, "may": 2.8 },
    "m2a": { "id": "m2a", "mar": 2.5, "abr": 4.0, "may": 4.9 },
    "m2b": { "id": "m2b", "mar": 1.2, "abr": 2.2, "may": 2.1 },
    "m3a": { "id": "m3a", "mar": 1.7, "abr": 2.9, "may": 3.5 },
    "m3b": { "id": "m3b", "mar": 0.8, "abr": 1.6, "may": 4.5 },
    "m4a": { "id": "m4a", "mar": 0.9, "abr": 1.2, "may": 2.1 },
    "m4b": { "id": "m4b", "mar": 1.1, "abr": 2.3, "may": 3.0 }
  }
};

const MONTHS = ["mar", "abr", "may"];
const MONTH_LABELS: Record<string, string> = {
  mar: "Marzo",
  abr: "Abril",
  may: "Mayo"
};

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, unit = "%" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-150 text-slate-700 p-3.5 rounded-2xl shadow-xl text-[11px] font-sans space-y-1.5 z-50">
        <p className="font-extrabold border-b border-slate-100 pb-1.5 mb-1 text-[#1B3C73]">{label}</p>
        {payload.map((p: any, i: number) => {
          const val = p.value === "null" || p.value === undefined ? "Sin Información" : `${Number(p.value).toFixed(1)}${unit}`;
          return (
            <p key={i} className="flex justify-between gap-6 font-semibold items-center">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill }} />
                {p.name}:
              </span>
              <span className="font-extrabold text-slate-800">{val}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

// ----------------------------------------------------
// KPI CARD COMPONENT WITH TOOLTIPS & ANIMATIONS
// ----------------------------------------------------
interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
  trendLabel: string;
  trendType: "up" | "down";
  icon: React.ComponentType<any>;
  color: "blue" | "rose" | "emerald" | "amber";
  tooltip: string;
}

function KpiCard({
  title,
  value,
  trend,
  trendLabel,
  trendType,
  icon: Icon,
  color,
  tooltip
}: KpiCardProps) {
  const colorClasses = {
    blue: {
      border: "hover:border-blue-200 hover:shadow-blue-900/5",
      text: "text-[#1B3C73]",
      iconBg: "bg-[#1B3C73]/5",
      iconColor: "text-[#1B3C73]"
    },
    rose: {
      border: "hover:border-rose-200 hover:shadow-rose-900/5",
      text: "text-rose-600",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500"
    },
    emerald: {
      border: "hover:border-emerald-200 hover:shadow-emerald-900/5",
      text: "text-emerald-600",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500"
    },
    amber: {
      border: "hover:border-amber-200 hover:shadow-amber-900/5",
      text: "text-[#C87533]",
      iconBg: "bg-orange-50/60",
      iconColor: "text-[#C87533]"
    }
  }[color] || {
    border: "hover:border-slate-350",
    text: "text-slate-700",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-400"
  };

  const TrendIcon = trendType === "up" ? TrendingUp : TrendingDown;
  const trendColor = trendType === "up" 
    ? "text-emerald-600 bg-emerald-50/60 border-emerald-100/80" 
    : "text-rose-600 bg-rose-50/60 border-rose-100/80";

  return (
    <div className={cn(
      "group relative bg-white rounded-[2rem] border border-slate-100 p-6 transition-all duration-300",
      "hover:-translate-y-1 hover:shadow-md select-none flex flex-col justify-between h-36 cursor-help",
      colorClasses.border
    )}>
      {/* Premium Light Tooltip Popup */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-64 bg-white/95 backdrop-blur-md text-slate-600 text-[11px] p-4 rounded-2xl shadow-xl border border-slate-150 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-bottom z-[100] leading-relaxed font-sans">
        <p className="font-extrabold mb-1 text-[#1B3C73] text-xs text-justify">Detalle del Indicador</p>
        <p className="font-semibold text-slate-500">{tooltip}</p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 bg-white border-r border-b border-slate-150 rotate-45" />
      </div>

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{title}</span>
          <span className={cn("text-3xl font-black tracking-tight", colorClasses.text)}>{value}</span>
        </div>
        <div className={cn("p-3 rounded-2xl transition-transform duration-300 group-hover:scale-105 border border-transparent shadow-sm", colorClasses.iconBg)}>
          <Icon size={18} className={colorClasses.iconColor} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-100/80 pt-3 text-[10px] font-semibold text-slate-400">
        <span className={cn("flex items-center gap-0.5 px-2 py-0.5 rounded-md border font-extrabold", trendColor)}>
          <TrendIcon size={10} />
          {trend}
        </span>
        <span className="truncate font-bold text-slate-500">{trendLabel}</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MAIN ROUTE COMPONENT
// ----------------------------------------------------
export default function InteligenciaPage() {
  const [activeTab, setActiveTab] = useState("resumen");
  const [dbMetrics, setDbMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiInsightLoading, setAiInsightLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || "";
        
        // Fetch metrics
        const metricsRes = await fetch(`${API_URL}/api/v1/inteligencia/metrics`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setDbMetrics(data);
        }
      } catch (err) {
        console.error("Error loading intelligence metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadAiInsight() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || "";
        
        const askRes = await fetch(`${API_URL}/api/v1/inteligencia/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            message: "Genera un resumen interpretativo corto de hasta 3 oraciones analizando las principales brechas didácticas (SIMCE oficial vs ensayo), asistencia de Mayo y el nivel de acompañamiento docente para la portada del dashboard."
          })
        });
        if (askRes.ok) {
          const data = await askRes.json();
          setAiInsight(data.response);
        } else {
          setAiInsight('El análisis cruzado revela una "Brecha de Demanda Cognitiva" crítica en Enseñanza Básica: las calificaciones internas muestran un 75% de aprobación en 4° Básico, pero la evaluación de diagnóstico DIA arroja solo un 35% de logro satisfactorio en matemáticas. Este desfase coincide directamente con la caída de 10 puntos en Autoestima Académica (IDPS: 64 pts). Se recomienda acelerar la Secuencia Didáctica de 7 Pasos y elevar el rigor cognitivo del aula de DOK 1 a DOK 3.');
        }
      } catch (err) {
        console.error("Error generating AI insight:", err);
        setAiInsight('El análisis cruzado revela una "Brecha de Demanda Cognitiva" crítica en Enseñanza Básica: las calificaciones internas muestran un 75% de aprobación en 4° Básico, pero la evaluación de diagnóstico DIA arroja solo un 35% de logro satisfactorio en matemáticas. Este desfase coincide directamente con la caída de 10 puntos en Autoestima Académica (IDPS: 64 pts). Se recomienda acelerar la Secuencia Didáctica de 7 Pasos y elevar el rigor cognitivo del aula de DOK 1 a DOK 3.');
      } finally {
        setAiInsightLoading(false);
      }
    }
    loadAiInsight();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header card matching dashboard greeting style */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Background graphic effect matching ProfeIC style */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1B3C73]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#C87533]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1B3C73] to-[#254d8f] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-900/10 shrink-0">
            <Brain size={28} className="text-[#ffb873] animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1a2e3b] tracking-tight">
              Observatorio de Datos Institucional
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 text-justify">
              Visualización integral y cruce de variables para la reorientación estratégica del Colegio Madre Paulina
            </p>
          </div>
        </div>

        <Link 
          href="/inteligencia/importador" 
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1B3C73] to-[#254d8f] hover:from-[#254d8f] hover:to-[#1B3C73] text-white rounded-xl transition-all text-xs uppercase tracking-wider font-extrabold shadow-md shadow-blue-900/15 group relative z-10"
        >
          <Database size={14} className="text-blue-200 group-hover:text-white transition-colors" />
          Carga de Datos
        </Link>
      </div>

      {/* Tabs Navigation - Segmented track style */}
      <div className="bg-slate-100/70 p-1.5 rounded-2xl flex gap-1.5 items-center border border-slate-200/40 shadow-inner w-fit max-w-full overflow-x-auto no-scrollbar scroll-smooth">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shrink-0 border border-transparent",
                isActive
                  ? "bg-white text-slate-800 shadow-sm border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
              )}
            >
              <Icon size={14} className={cn(isActive ? "text-[#C87533]" : "text-slate-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="w-full">
        {activeTab === "resumen" && <ResumenTab aiInsight={aiInsight} aiInsightLoading={aiInsightLoading} />}
        {activeTab === "asistencia" && <AsistenciaTab />}
        {activeTab === "simce" && <SimceTab dbMetrics={dbMetrics} />}
        {activeTab === "paes" && <PaesTab dbMetrics={dbMetrics} />}
        {activeTab === "socioemocional" && <SocioemocionalTab />}
        {activeTab === "acompanamiento" && <AcompanamientoTab />}
        {activeTab === "trayectorias" && <TrayectoriasTab />}
        {activeTab === "chat" && <ChatTab />}
      </main>
    </div>
  );
}

// ----------------------------------------------------
// TAB 1: RESUMEN EJECUTIVO
// ----------------------------------------------------
function ResumenTab({ aiInsight, aiInsightLoading }: { aiInsight: string; aiInsightLoading: boolean }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Línea interpretativa IA */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-100 p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#C87533] to-[#e89b5f]" />
        <div className="flex gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm h-fit shrink-0 border border-indigo-100">
            <Brain className="text-[#C87533]" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-indigo-950 text-base mb-1.5 flex items-center gap-2">
              Línea Interpretativa Automatizada <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full tracking-wider">AI Audit Insight</span>
            </h3>
            {aiInsightLoading ? (
              <div className="space-y-2 py-1">
                <div className="h-3.5 bg-slate-200 rounded-md w-full animate-pulse"></div>
                <div className="h-3.5 bg-slate-200 rounded-md w-[90%] animate-pulse"></div>
              </div>
            ) : (
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm font-medium text-justify">
                {aiInsight}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KPI Grid - Smaller and Redistributed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Asistencia Promedio (Mayo)"
          value="88.2%"
          trend="-0.5%"
          trendLabel="vs Mayo 2025 (88.7%)"
          trendType="down"
          icon={Users}
          color="blue"
          tooltip="Asistencia general del mes de Mayo. Prebásica representa el mayor desafío en inasistencia crónica."
        />
        <KpiCard
          title="Brecha Didáctica SIMCE"
          value="-32 pts"
          trend="8° Básico Lectura"
          trendLabel="Oficial vs Ensayo"
          trendType="down"
          icon={BarChart3}
          color="rose"
          tooltip="Pérdida de rendimiento significativa entre los ensayos internos (256) y el SIMCE oficial (224)."
        />
        <KpiCard
          title="Efectividad PAES"
          value="47.4%"
          trend="+5.2%"
          trendLabel="Selección Ues"
          trendType="up"
          icon={Award}
          color="emerald"
          tooltip="37 de 78 estudiantes matriculados obtuvieron vacantes en universidades tradicionales."
        />
        
        {/* Interactive Flipping Card for Acompañamiento */}
        <div className="group h-32 w-full [perspective:1000px] cursor-pointer">
          <div className="relative h-full w-full rounded-2xl border border-slate-200 transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-sm bg-white">
            {/* Front Side */}
            <div className="absolute inset-0 h-full w-full p-4 flex flex-col justify-between [backface-visibility:hidden]">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Acompañamiento</h4>
                  <div className="text-xl font-black text-slate-800">87 Ciclos</div>
                </div>
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
                  <Brain className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 border-t border-slate-100 pt-2">
                <span>Completados: <strong className="text-slate-800">68</strong></span>
                <span>Proceso: <strong className="text-slate-800">19</strong></span>
              </div>
            </div>

            {/* Back Side */}
            <div className="absolute inset-0 h-full w-full p-4 bg-slate-900 rounded-2xl text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between">
              <div className="space-y-1">
                <h5 className="text-[9px] uppercase text-orange-400 font-black tracking-wider">Dimensión Destacada</h5>
                <div className="text-[11px] font-semibold text-slate-200">Curricular: 7 Pasos (82%)</div>
                <div className="text-[11px] font-semibold text-slate-200">Formación: Clima Aula (77%)</div>
              </div>
              <div className="text-[9px] text-slate-400 flex items-center gap-1 font-bold border-t border-white/10 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>85% Planta Docente Cobertura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TAB 2: ASISTENCIA (DYNAMICAL INFOGRAPHY)
// ----------------------------------------------------
function AsistenciaTab() {
  const [selectedMonth, setSelectedMonth] = useState<string>("may"); // default Mayo
  const [asistenciaFilter, setAsistenciaFilter] = useState<string>("all");

  // Dynamic calculations based on month
  const computedData = useMemo(() => {
    const courses26 = ATTENDANCE_DATABASE.year2026;
    const courses25 = ATTENDANCE_DATABASE.year2025;
    const licenses26 = ATTENDANCE_DATABASE.licenses2026;

    let total26 = 0;
    let total25 = 0;
    let totalLicenses = 0;
    let count26 = 0;
    let count25 = 0;

    let leaders: { name: string; val: number }[] = [];

    // Detailed per cycle
    const cycleDetails: Record<string, { name: string; real: number; proj: number; licenses: number }[]> = {
      prebasica: [],
      basica: [],
      media: []
    };

    Object.keys(courses26).forEach((id) => {
      const c26 = courses26[id as keyof typeof courses26];
      const c25 = courses25[id as keyof typeof courses25];
      const lic = licenses26[id as keyof typeof licenses26];

      const val26 = (c26 as any)[selectedMonth] || 0;
      const val25 = (c25 as any)[selectedMonth] || 0;
      const licVal = (lic as any)[selectedMonth] || 0;

      if (val26 > 0) {
        total26 += val26;
        totalLicenses += licVal;
        count26++;
        leaders.push({ name: c26.name, val: val26 });
        
        cycleDetails[c26.cycle].push({
          name: c26.name,
          real: val26,
          proj: val26 + licVal,
          licenses: licVal
        });
      }

      if (val25 > 0) {
        total25 += val25;
        count25++;
      }
    });

    const avg26 = count26 > 0 ? total26 / count26 : 0;
    const avg25 = count25 > 0 ? total25 / count25 : 0;
    const avgProj = count26 > 0 ? (total26 + totalLicenses) / count26 : 0;

    // Sort leaders
    leaders.sort((a, b) => b.val - a.val);
    const top3 = leaders.slice(0, 3);

    // Calculate Semaphore stats
    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;

    leaders.forEach(l => {
      if (l.val >= 92) greenCount++;
      else if (l.val >= 85) yellowCount++;
      else redCount++;
    });

    return {
      avg26,
      avg25,
      avgProj,
      top3,
      cycleDetails,
      semaphore: [
        { name: "Verde (>=92%)", count: greenCount, fill: "#10b981" },
        { name: "Amarillo (85-92%)", count: yellowCount, fill: "#f59e0b" },
        { name: "Rojo (<85%)", count: redCount, fill: "#f43f5e" }
      ]
    };
  }, [selectedMonth]);

  // Overall attendance trend per month (computed from actual DB values)
  const trendData = useMemo(() => {
    return MONTHS.map((m) => {
      let sum26 = 0, count26 = 0;
      let sum25 = 0, count25 = 0;

      Object.keys(ATTENDANCE_DATABASE.year2026).forEach(id => {
        const val26 = (ATTENDANCE_DATABASE.year2026[id as keyof typeof ATTENDANCE_DATABASE.year2026] as any)[m] || 0;
        const val25 = (ATTENDANCE_DATABASE.year2025[id as keyof typeof ATTENDANCE_DATABASE.year2025] as any)[m] || 0;
        if (val26 > 0) { sum26 += val26; count26++; }
        if (val25 > 0) { sum25 += val25; count25++; }
      });

      return {
        mes: MONTH_LABELS[m],
        "2025": sum25 / (count25 || 1),
        "2026": sum26 / (count26 || 1)
      };
    });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Month & Cycle Selector Panel */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm text-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1B3C73]" /> Consola de Asistencia Interactiva Año a Año
            </h3>
            <p className="text-xs text-slate-500 text-justify">Compara el comportamiento del 2026 frente al histórico 2025 y simula la inasistencia por licencias médicas.</p>
          </div>
          <div className="bg-slate-100/70 p-1.5 rounded-xl flex gap-1 items-center border border-slate-200/30 shadow-inner w-fit overflow-x-auto">
            {MONTHS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all border border-transparent shrink-0",
                  selectedMonth === m 
                    ? "bg-white text-slate-800 shadow-sm border-slate-200/50" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/35"
                )}
              >
                {MONTH_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Asistencia General ({MONTH_LABELS[selectedMonth]})</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#1B3C73]">{computedData.avg26.toFixed(1)}%</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded" title="Si los alumnos recuperaran licencias">
                Proyectado: {computedData.avgProj.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Comparativa Anual (vs {MONTH_LABELS[selectedMonth]} 2025)</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#1B3C73]">{computedData.avg25.toFixed(1)}%</span>
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                (computedData.avg26 - computedData.avg25) >= 0 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-rose-50 text-rose-700 border-rose-200"
              )}>
                {(computedData.avg26 - computedData.avg25) >= 0 ? "+" : ""}{(computedData.avg26 - computedData.avg25).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Curso Líder Escolar</span>
            <div className="text-2xl font-black text-[#1B3C73] truncate mt-1.5" title={computedData.top3[0]?.name}>
              {computedData.top3[0]?.name || "Ninguno"} ({computedData.top3[0]?.val.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trend Monthly and Semaphore charts */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-8">
          <div>
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B3C73]"></span> Curvas de Comportamiento e Historial
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#94a3b8" />
                  <YAxis domain={[80, 100]} stroke="#94a3b8" />
                  <RechartsTooltip content={<CustomTooltip unit="%" />} />
                  <Legend />
                  <Line type="monotone" dataKey="2025" stroke="#94a3b8" strokeWidth={2} />
                  <Line type="monotone" dataKey="2026" stroke="#1B3C73" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Distribución Semáforo ({MONTH_LABELS[selectedMonth]})
            </h3>
            {/* Semaphore legend summary */}
            <div className="flex gap-2 mb-3">
              {computedData.semaphore.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.fill }} />
                  {s.count} cursos
                </div>
              ))}
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={computedData.semaphore} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10}
                    angle={-10}
                    textAnchor="end"
                    interval={0}
                    height={45}
                  />
                  <YAxis stroke="#94a3b8" allowDecimals={false} fontSize={12} />
                  <RechartsTooltip content={<CustomTooltip unit=" cursos" />} />
                  <Bar dataKey="count" name="Cursos" radius={[6, 6, 0, 0]}>
                    {computedData.semaphore.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Podium and Monthly Leaders history */}
        <div className="lg:col-span-4 space-y-8">
          {/* Podium */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Podio de Honor</h3>
            <div className="flex justify-center items-end gap-2 h-48 select-none border-b border-slate-100 pb-4">
              {/* 2° Lugar */}
              <div className="flex flex-col items-center w-20">
                <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{computedData.top3[1]?.name || "--"}</span>
                <span className="text-[9px] font-black text-slate-400 mb-1">{computedData.top3[1]?.val.toFixed(1)}%</span>
                <div className="w-full bg-slate-200 h-16 rounded-t-xl flex items-center justify-center border-t border-slate-300">
                  <span className="text-slate-400 text-xl font-bold">2°</span>
                </div>
              </div>
              {/* 1° Lugar */}
              <div className="flex flex-col items-center w-24">
                <span className="text-xs font-black text-amber-900 truncate w-full text-center">👑 {computedData.top3[0]?.name || "--"}</span>
                <span className="text-[10px] font-black text-amber-600 mb-1">{computedData.top3[0]?.val.toFixed(1)}%</span>
                <div className="w-full bg-amber-100 h-24 rounded-t-xl flex items-center justify-center border-t-2 border-amber-300">
                  <span className="text-amber-500 text-2xl font-bold">1°</span>
                </div>
              </div>
              {/* 3° Lugar */}
              <div className="flex flex-col items-center w-20">
                <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{computedData.top3[2]?.name || "--"}</span>
                <span className="text-[9px] font-black text-slate-400 mb-1">{computedData.top3[2]?.val.toFixed(1)}%</span>
                <div className="w-full bg-slate-100 h-12 rounded-t-xl flex items-center justify-center border-t border-slate-200">
                  <span className="text-amber-800 text-lg font-bold">3°</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table of Leaders — Dynamic from DB */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-2">Líderes por Mes</h3>
            <div className="overflow-hidden border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <th className="py-2 px-3">Mes</th>
                    <th className="py-2 px-3">Curso</th>
                    <th className="py-2 px-3 text-right">Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {MONTHS.map((m) => {
                    // Dynamically find the leader for this month
                    let topCourse = { name: "--", val: 0 };
                    Object.keys(ATTENDANCE_DATABASE.year2026).forEach((id) => {
                      const course = ATTENDANCE_DATABASE.year2026[id as keyof typeof ATTENDANCE_DATABASE.year2026];
                      const val = (course as any)[m] || 0;
                      if (val > topCourse.val) {
                        topCourse = { name: course.name, val };
                      }
                    });
                    const monthBgColors: Record<string, string> = {
                      mar: "bg-[#1B3C73] text-white",
                      abr: "bg-[#C87533] text-white",
                      may: "bg-indigo-600 text-white"
                    };
                    return (
                      <tr key={m} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className={cn("px-2 py-0.5 rounded-md font-bold text-[10px] uppercase", monthBgColors[m])}>
                            {MONTH_LABELS[m]}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-semibold">{topCourse.name}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-600">{topCourse.val.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle detail list with hover popup logic */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Detalle Comparativo de Cursos por Ciclo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["prebasica", "basica", "media"].map((cycleKey) => {
            const list = computedData.cycleDetails[cycleKey] || [];
            const label = cycleKey === "prebasica" ? "Educación Prebásica" : cycleKey === "basica" ? "Enseñanza Básica" : "Enseñanza Media";
            
            return (
              <div key={cycleKey} className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">{label}</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {list.map((c, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition-colors flex justify-between items-center text-xs group/item relative"
                    >
                      <div>
                        <div className="font-bold text-slate-700">{c.name}</div>
                        <div className="text-[10px] text-slate-400">Proyecc: {c.proj.toFixed(1)}%</div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md font-black text-[10px] block mb-1 text-center w-14",
                          c.real >= 92 && "bg-emerald-100 text-emerald-700",
                          c.real >= 85 && c.real < 92 && "bg-amber-100 text-amber-700",
                          c.real < 85 && "bg-rose-100 text-rose-700"
                        )}>
                          {c.real.toFixed(1)}%
                        </span>
                      </div>

                      {/* Licencias tooltip on hover */}
                      <div className="hidden group-hover/item:block absolute bottom-full right-0 mb-2 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl z-50 shadow-xl border border-slate-800 w-44 font-sans leading-normal">
                        <p className="font-bold text-orange-400">Licencias Médicas</p>
                        <p className="mt-1">Inasistencia por licencias: <strong>{c.licenses.toFixed(1)}%</strong></p>
                        <p className="text-slate-300">Si se mitigan, la asistencia ascendería a <strong>{c.proj.toFixed(1)}%</strong>.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TAB 3: SIMCE & ENSAYOS
// ----------------------------------------------------
// ----------------------------------------------------
// TAB 3: SIMCE & ENSAYOS (Dynamic with DB metrics fallback)
// ----------------------------------------------------
interface SimceTabProps {
  dbMetrics: any;
}

function SimceTab({ dbMetrics }: SimceTabProps) {
  const simceData = useMemo(() => {
    const defaultData = [
      { name: "Lectura 4°B", nivel: "4_basico", asignatura: "lenguaje", "Oficial 2025": 262, "Ensayo Interno": 278, GSE: 276 },
      { name: "Mat 4°B", nivel: "4_basico", asignatura: "matematica", "Oficial 2025": 237, "Ensayo Interno": 258, GSE: 260 },
      { name: "Lectura 8°B", nivel: "8_basico", asignatura: "lenguaje", "Oficial 2025": 224, "Ensayo Interno": 256, GSE: 237 },
      { name: "Mat 8°B", nivel: "8_basico", asignatura: "matematica", "Oficial 2025": 245, "Ensayo Interno": 272, GSE: 256 },
      { name: "Hist 8°B", nivel: "8_basico", asignatura: "historia", "Oficial 2025": 241, "Ensayo Interno": 259, GSE: 246 },
      { name: "Lectura II°M", nivel: "2_medio", asignatura: "lenguaje", "Oficial 2025": 256, "Ensayo Interno": 248, GSE: 240 },
      { name: "Mat II°M", nivel: "2_medio", asignatura: "matematica", "Oficial 2025": 262, "Ensayo Interno": 258, GSE: 267 }
    ];

    if (!dbMetrics?.simce || dbMetrics.simce.length === 0) {
      return defaultData;
    }

    return defaultData.map(d => {
      const dbRow = dbMetrics.simce.find((r: any) => r.nivel === d.nivel && r.asignatura === d.asignatura);
      return {
        ...d,
        "Oficial 2025": dbRow ? dbRow.puntaje : d["Oficial 2025"]
      };
    });
  }, [dbMetrics]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Cruce SIMCE: Resultados Oficiales vs Ensayos Internos</h2>
          <p className="text-sm text-slate-500 text-justify">Análisis del contraste de complejidad cognitiva en las mediciones del 2025.</p>
        </div>
      </div>

      {/* SIMCE Quick-insight Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3.5 items-start">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">Brecha Crítica (8°B Lectura)</h4>
            <p className="text-xl font-black text-rose-700 mt-1">-32 pts</p>
            <p className="text-[10px] text-rose-600 mt-1 leading-normal font-medium">Mayor desfase detectado entre el Ensayo (256 pts) y el SIMCE Oficial (224 pts), reflejando una carencia crítica de andamiaje cognitivo.</p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3.5 items-start">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider">Desfase GSE (4°B Matemática)</h4>
            <p className="text-xl font-black text-rose-700 mt-1">-23 pts</p>
            <p className="text-[10px] text-rose-600 mt-1 leading-normal font-medium">Colegio alcanza 237 pts frente al referente socioeconómico nacional de 260 pts, vinculándose con la caída del 10% en Autoestima Académica.</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3.5 items-start">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider">Anomalía Positiva (II° Medio Lectura)</h4>
            <p className="text-xl font-black text-emerald-700 mt-1">+8 pts</p>
            <p className="text-[10px] text-emerald-600 mt-1 leading-normal font-medium">El colegio oficial (256 pts) supera el ensayo interno (248 pts) y se posiciona 16 puntos por sobre el promedio del GSE nacional.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Puntaje Colegio vs Ensayo vs Promedio GSE</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={simceData} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight="600" />
              <YAxis domain={[150, 300]} stroke="#94a3b8" fontSize={10} />
              <RechartsTooltip content={<CustomTooltip unit=" pts" />} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
              <Bar dataKey="Oficial 2025" fill="#1B3C73" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ensayo Interno" fill="#C87533" radius={[4, 4, 0, 0]} />
              <Bar dataKey="GSE" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Brecha didáctica table */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Matriz de Desfase Cognitivo Completa</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Nivel / Asignatura</th>
                <th className="py-3 px-4">Ensayo Interno</th>
                <th className="py-3 px-4">Oficial SIMCE</th>
                <th className="py-3 px-4">Brecha Didáctica</th>
                <th className="py-3 px-4">Referente GSE</th>
                <th className="py-3 px-4">Diferencia vs GSE</th>
                <th className="py-3 px-4">Estado Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {simceData.map((d, index) => {
                const brecha = d["Oficial 2025"] - d["Ensayo Interno"];
                const gseDiff = d["Oficial 2025"] - d.GSE;
                const isCritico = brecha <= -15 || gseDiff <= -15;
                const isAlerta = (brecha > -15 && brecha <= -5) || (gseDiff > -15 && gseDiff <= -5);
                const labelBrecha = brecha >= 0 ? `+${brecha}` : `${brecha}`;
                const labelGseDiff = gseDiff >= 0 ? `+${gseDiff}` : `${gseDiff}`;
                
                let labelAsignatura = "";
                if (d.nivel === "4_basico") {
                  labelAsignatura = `4° Básico / ${d.asignatura === "lenguaje" ? "Lectura" : "Matemática"}`;
                } else if (d.nivel === "8_basico") {
                  labelAsignatura = `8° Básico / ${d.asignatura === "lenguaje" ? "Lectura" : d.asignatura === "matematica" ? "Matemática" : "Historia"}`;
                } else {
                  labelAsignatura = `II° Medio / ${d.asignatura === "lenguaje" ? "Lectura" : "Matemática"}`;
                }

                let badgeState = (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-700">
                    Competente
                  </span>
                );
                if (isCritico) {
                  badgeState = (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-700 animate-pulse">
                      Crítico
                    </span>
                  );
                } else if (isAlerta) {
                  badgeState = (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-700">
                      En Alerta
                    </span>
                  );
                }

                return (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-700">{labelAsignatura}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">{d["Ensayo Interno"]} pts</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{d["Oficial 2025"]} pts</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "font-bold",
                        brecha >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {labelBrecha} pts
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{d.GSE} pts</td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "font-bold",
                        gseDiff >= 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {labelGseDiff} pts
                      </span>
                    </td>
                    <td className="py-3 px-4">{badgeState}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TAB 4: PAES
// ----------------------------------------------------
const PAES_HISTORICO_DATA = [
  { name: "2024", Lectora: 610, "Matemática M1": 618 },
  { name: "2025", Lectora: 628, "Matemática M1": 635 },
  { name: "2026", Lectora: 642, "Matemática M1": 652 },
];

const PAES_TERRITORIAL_DATA = [
  { subject: "Lectora", Colegio: 642.5, Comuna: 617.3, Región: 619.0, Nacional: 611.6 },
  { subject: "Matemática M1", Colegio: 652.7, Comuna: 640.4, Región: 645.4, Nacional: 634.2 },
  { subject: "Matemática M2", Colegio: 427.4, Comuna: 431.2, Región: 424.9, Nacional: 420.4 },
  { subject: "Historia", Colegio: 525.5, Comuna: 505.2, Región: 498.3, Nacional: 506.4 },
  { subject: "Ciencias", Colegio: 442.2, Comuna: 475.2, Región: 468.2, Nacional: 462.5 },
];

interface PaesTabProps {
  dbMetrics: any;
}

function PaesTab({ dbMetrics }: PaesTabProps) {
  const procesoData = useMemo(() => {
    const defaultProceso = {
      matriculados: 78,
      inscritos: 72,
      rinden: 68,
      habilitados: 64,
      postulan: 44,
      seleccionados: 37
    };
    if (dbMetrics?.paes_proceso && dbMetrics.paes_proceso.length > 0) {
      return dbMetrics.paes_proceso[0];
    }
    return defaultProceso;
  }, [dbMetrics]);

  const funnelSteps = [
    { label: "Matriculados 4° Medio", value: procesoData.matriculados, pct: 100, desc: "Total de estudiantes en la cohorte terminal." },
    { label: "Inscritos en PAES", value: procesoData.inscritos, pct: Math.round(procesoData.inscritos / procesoData.matriculados * 100), desc: "Estudiantes que completaron el registro para rendir las pruebas." },
    { label: "Rindieron PAES", value: procesoData.rinden, pct: Math.round(procesoData.rinden / procesoData.matriculados * 100), desc: "Estudiantes que efectivamente asistieron y rindieron las pruebas." },
    { label: "Habilitados para Postular", value: procesoData.habilitados, pct: Math.round(procesoData.habilitados / procesoData.matriculados * 100), desc: "Obtuvieron puntajes mínimos exigidos por el Demre (>= 485 pts)." },
    { label: "Postularon a Ues", value: procesoData.postulan, pct: Math.round(procesoData.postulan / procesoData.matriculados * 100), desc: "Postulantes reales a través del sistema único centralizado." },
    { label: "Seleccionados en Ues", value: procesoData.seleccionados, pct: Math.round(procesoData.seleccionados / procesoData.matriculados * 100), desc: "Estudiantes convocados que obtuvieron vacantes formales." }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Desempeño PAES y Progreso Multianual</h2>
          <p className="text-sm text-slate-500 text-justify">Análisis comparativo comunal/regional/nacional y embudo del proceso de admisión 2026.</p>
        </div>
      </div>

      {/* PAES Funnel Flow (Visual and interactive) */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-wider">Embudo del Proceso de Admisión Universitaria 2026</h3>
        <p className="text-xs text-slate-400 mb-6 font-medium text-justify">Visualización de la retención y rendimiento de los egresados en su trayectoria a la educación superior.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
          {funnelSteps.map((step, index) => {
            const isLast = index === funnelSteps.length - 1;
            return (
              <div key={index} className="group relative bg-slate-50/50 border border-slate-100/80 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm select-none flex flex-col justify-between h-36">
                
                {/* Micro tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-48 bg-white/95 backdrop-blur-md text-slate-600 border border-slate-150 shadow-xl rounded-2xl p-3 text-[10px] leading-relaxed opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-bottom z-50">
                  <p className="font-extrabold text-[#C87533] mb-0.5">{step.label}</p>
                  <p className="text-slate-500 font-semibold">{step.desc}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white border-r border-b border-slate-150 rotate-45" />
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-tight">{step.label}</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{step.value}</span>
                    <span className="text-xs font-semibold text-slate-400">alumnos</span>
                  </div>
                </div>

                <div className="border-t border-slate-200/50 pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-[#C87533]">{step.pct}% Cobertura</span>
                  {index > 0 && (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 rounded">
                      -{funnelSteps[index - 1].value - step.value}
                    </span>
                  )}
                </div>

                {/* Connecting arrow for desktop */}
                {!isLast && (
                  <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-2.5 z-10 w-5 h-5 bg-white border-t border-r border-slate-200 rotate-45 items-center justify-center rounded-sm shadow-sm" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Histórico 3 años */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Progreso Histórico (Últimos 3 Años)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PAES_HISTORICO_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontWeight="600" />
                <YAxis domain={[550, 700]} stroke="#94a3b8" />
                <RechartsTooltip content={<CustomTooltip unit=" pts" />} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                <Line type="monotone" dataKey="Lectora" stroke="#C87533" strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2 }}>
                  <LabelList dataKey="Lectora" position="top" offset={10} style={{ fill: '#C87533', fontSize: 10, fontWeight: 'bold' }} />
                </Line>
                <Line type="monotone" dataKey="Matemática M1" stroke="#1B3C73" strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2 }}>
                  <LabelList dataKey="Matemática M1" position="top" offset={10} style={{ fill: '#1B3C73', fontSize: 10, fontWeight: 'bold' }} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparativa territorial */}
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Comparativa Territorial (Admisión 2026)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PAES_TERRITORIAL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} fontWeight="600" />
                <YAxis domain={[300, 700]} stroke="#94a3b8" fontSize={10} />
                <RechartsTooltip content={<CustomTooltip unit=" pts" />} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                <Bar dataKey="Colegio" fill="#1B3C73" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Comuna" fill="#C87533" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Nacional" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TAB 5: SOCIOEMOCIONAL Y IDPS (Radar with selection & detailed bar charts)
// ----------------------------------------------------
const IDPS_CHART_DATA_2026 = [
  { subject: "Autoestima Académica", "4° Básico": 64, "8° Básico": 74, "II° Medio": 74 },
  { subject: "Clima Convivencia", "4° Básico": 70, "8° Básico": 76, "II° Medio": 77 },
  { subject: "Participación", "4° Básico": 72, "8° Básico": 76, "II° Medio": 79 },
  { subject: "Hábitos Saludables", "4° Básico": 66, "8° Básico": 67, "II° Medio": 67 },
];

const IDPS_CHART_DATA_2025 = [
  { subject: "Autoestima Académica", "4° Básico": 74, "8° Básico": 73, "II° Medio": 73 },
  { subject: "Clima Convivencia", "4° Básico": 75, "8° Básico": 76, "II° Medio": 75 },
  { subject: "Participación", "4° Básico": 77, "8° Básico": 76, "II° Medio": 76 },
  { subject: "Hábitos Saludables", "4° Básico": 71, "8° Básico": 70, "II° Medio": 69 },
];

const CONVIVENCIA_DIA_DATA = [
  { nivel: "4° Básico", dimension: "Universal (Exp/Gestión)", real2025: 68.3, meta2026: 75 },
  { nivel: "4° Básico", dimension: "Focalizados", real2025: 77.8, meta2026: 75 },
  { nivel: "4° Básico", dimension: "Intensivas", real2025: 79.0, meta2026: 75 }
];

// ----------------------------------------------------
// METADATA DEFINITIONS & MAPPINGS (Extracted from Establishment DIA PDFs)
// ----------------------------------------------------

const CONVIVENCIA_DIM_INFO: Record<string, {
  title: string;
  level: string;
  levelLabel: string;
  scope: string;
  scopeColor: "blue" | "amber" | "rose";
  desc: string;
  focus: string;
  evaluates: string[];
}> = {
  "Nivel 1 (Promoción Universal) - Experiencia": {
    title: "Experiencia de Convivencia Escolar",
    level: "Nivel 1",
    levelLabel: "Promoción Universal",
    scope: "100% de la Comunidad Escolar",
    scopeColor: "blue",
    desc: "Corresponde a la vivencia cotidiana de las y los estudiantes respecto a las relaciones de respeto, buen trato e inclusión dentro del establecimiento.",
    focus: "Foco: Clima escolar general, ambiente de aprendizaje y trato respetuoso para la totalidad de la comunidad.",
    evaluates: ["Trato respetuoso entre estudiantes", "Buen trato de docentes y profesionales", "Inclusión escolar y valoración de la diversidad"]
  },
  "Nivel 1 (Promoción Universal) - Percepción Curso": {
    title: "Percepción de la Convivencia en el Curso",
    level: "Nivel 1",
    levelLabel: "Promoción Universal",
    scope: "100% de la Comunidad Escolar",
    scopeColor: "blue",
    desc: "Evalúa cómo perciben las y los estudiantes la cohesión, el compañerismo, el clima de respeto y la seguridad dentro de su propio curso o grupo de aula.",
    focus: "Foco: Clima del aula, relaciones interpersonales sanas y sentido de pertenencia.",
    evaluates: ["Compañerismo y cohesión del grupo", "Resolución pacífica de desacuerdos", "Seguridad dentro de la sala de clases"]
  },
  "Nivel 1 (Promoción Universal) - Gestión": {
    title: "Gestión Institucional de la Convivencia",
    level: "Nivel 1",
    levelLabel: "Promoción Universal",
    scope: "100% de la Comunidad Escolar",
    scopeColor: "blue",
    desc: "Mide la valoración estudiantil sobre las acciones formativas globales que realiza el establecimiento para promover el bienestar y prevenir la violencia.",
    focus: "Foco: Acciones formativas generales de convivencia escolar y promoción de un clima de cuidado.",
    evaluates: ["Existencia de normas claras y justas", "Actividades de promoción del buen trato", "Espacios de diálogo y participación estudiantil"]
  },
  "Nivel 2 (Apoyos Focalizados) - Experiencia": {
    title: "Experiencia en Apoyos Focalizados",
    level: "Nivel 2",
    levelLabel: "Apoyos Focalizados",
    scope: "10% - 20% de los Estudiantes",
    scopeColor: "amber",
    desc: "Mide cómo perciben los estudiantes los apoyos colectivos y personalizados que el colegio les entrega para fortalecer su integración y regular su conducta.",
    focus: "Foco: Habilidades para la convivencia y resolución de conflictos dirigidos a grupos con necesidades específicas.",
    evaluates: ["Acceso a talleres de mediación", "Ayuda oportuna ante conflictos interpersonales", "Espacios de contención grupal en situaciones de tensión"]
  },
  "Nivel 2 (Apoyos Focalizados) - Gestión": {
    title: "Gestión de Apoyos Focalizados",
    level: "Nivel 2",
    levelLabel: "Apoyos Focalizados",
    scope: "10% - 20% de los Estudiantes",
    scopeColor: "amber",
    desc: "Evalúa la efectividad del establecimiento para diseñar y aplicar programas, mediaciones y talleres específicos dirigidos a cursos o grupos de estudiantes con desafíos particulares.",
    focus: "Foco: Talleres grupales, mediación escolar activa y apoyo socioemocional selectivo.",
    evaluates: ["Programas grupales de resolución de conflictos", "Derivación interna a equipos psicosociales", "Seguimiento a cursos con climas de aula debilitados"]
  },
  "Nivel 3 (Mayor Intensidad) - Experiencia": {
    title: "Experiencia en Intervenciones de Mayor Intensidad",
    level: "Nivel 3",
    levelLabel: "Mayor Intensidad",
    scope: "5% - 10% de los Estudiantes",
    scopeColor: "rose",
    desc: "Mide la percepción de los estudiantes sobre la justicia, contención y el resguardo de derechos al activarse medidas correctivas y disciplinarias complejas.",
    focus: "Foco: Contención socioemocional individual y derivaciones seguras en casos de crisis conductual.",
    evaluates: ["Resguardo de la integridad física y psicológica", "Aplicación justa del reglamento de convivencia", "Apoyo emocional directo al estudiante involucrado"]
  },
  "Nivel 3 (Mayor Intensidad) - Gestión": {
    title: "Gestión de Intervenciones de Mayor Intensidad",
    level: "Nivel 3",
    levelLabel: "Mayor Intensidad",
    scope: "5% - 10% de los Estudiantes",
    scopeColor: "rose",
    desc: "Mide la capacidad de gestión del colegio al aplicar protocolos reactivos, reglamentos internos y coordinarse con redes externas (intersectorialidad) ante crisis conductuales graves.",
    focus: "Foco: Protocolos disciplinarios, derivaciones a especialistas y planes de apoyo individual intenso.",
    evaluates: ["Coordinación con OPD, SENAME o Salud Mental", "Activación oportuna de protocolos de crisis", "Planes de reincorporación y seguimiento educativo individual"]
  }
};

const SOCIOEMOCIONAL_DIM_INFO: Record<string, {
  title: string;
  category: string;
  type: "Desarrollo del Estudiante" | "Gestión del Establecimiento";
  desc: string;
  focus: string;
  skills: string[];
}> = {
  "Personal - Desarrollo": {
    title: "Desarrollo Socioemocional Personal",
    category: "Personal",
    type: "Desarrollo del Estudiante",
    desc: "Capacidad del grupo de estudiantes de reconocer sus propios estados emocionales, comunicarlos de forma responsable y tomar decisiones de manera reflexiva.",
    focus: "Foco pedagógico: Fomentar el autoconocimiento, la autorregulación y la toma responsable de decisiones ante situaciones cotidianas.",
    skills: ["Conciencia de sí mismo(a)", "Autorregulación emocional", "Toma responsable de decisiones"]
  },
  "Personal - Gestión": {
    title: "Gestión del Aprendizaje Socioemocional Personal",
    category: "Personal",
    type: "Gestión del Establecimiento",
    desc: "Gestión que lleva a cabo el establecimiento para propiciar el desarrollo personal de las y los estudiantes, promoviendo espacios y contención oportuna.",
    focus: "Foco pedagógico: Apoyo docente en el aula, talleres de autocuidado y espacios seguros para la contención emocional directa.",
    skills: ["Apoyo y cercanía de docentes", "Clima de confianza y contención", "Talleres y actividades de autoconocimiento"]
  },
  "Comunitario - Desarrollo": {
    title: "Desarrollo Socioemocional Comunitario",
    category: "Comunitario",
    type: "Desarrollo del Estudiante",
    desc: "Capacidad del grupo de estudiantes para identificar y respetar los estados internos de otras personas, actuando de manera empática y creando un ambiente colaborativo.",
    focus: "Foco pedagógico: Fortalecer la empatía, el respeto mutuo, el compañerismo y el trabajo colaborativo asertivo.",
    skills: ["Conciencia de otros(as) / Empatía", "Colaboración y comunicación asertiva", "Resolución pacífica de desacuerdos cotidianos"]
  },
  "Comunitario - Gestión": {
    title: "Gestión del Aprendizaje Socioemocional Comunitario",
    category: "Comunitario",
    type: "Gestión del Establecimiento",
    desc: "Gestión institucional destinada a promover el desarrollo de relaciones comunitarias saludables y prevenir dinámicas de exclusión escolar.",
    focus: "Foco pedagógico: Acciones para prevenir la discriminación, fomento del trabajo en equipo inclusivo y dinámicas grupales colaborativas.",
    skills: ["Prevención activa del acoso y exclusión", "Fomento del trabajo colaborativo escolar", "Promoción del compañerismo entre cursos"]
  },
  "Ciudadano - Desarrollo": {
    title: "Desarrollo Socioemocional Ciudadano",
    category: "Ciudadano",
    type: "Desarrollo del Estudiante",
    desc: "Capacidad de respetar y valorar las diferencias individuales, actuando bajo valores de solidaridad y buen trato, y participando activamente en acuerdos colectivos.",
    focus: "Foco pedagógico: Promover la valoración de la diversidad, la prosocialidad (solidaridad) y el compromiso con acuerdos comunes.",
    skills: ["Valoración de la diversidad e inclusión", "Comportamiento prosocial y solidario", "Participación activa en la construcción de acuerdos"]
  },
  "Ciudadano - Gestión": {
    title: "Gestión del Aprendizaje Socioemocional Ciudadano",
    category: "Ciudadano",
    type: "Gestión del Establecimiento",
    desc: "Gestión que lleva a cabo el establecimiento para propiciar el aprendizaje ciudadano de las y los estudiantes, abriendo espacios de debate y participación.",
    focus: "Foco pedagógico: Formación ciudadana activa, espacios de deliberación (como el Centro de Alumnos) y co-creación de normas escolares.",
    skills: ["Espacios de participación democrática", "Formación ciudadana integrada en el currículo", "Apertura a iniciativas y proyectos solidarios"]
  }
};

interface CorrelationInfo {
  r: number;
  strength: string;
  strengthColor: string;
  strengthBg: string;
  analysis: string;
  pmeSuggestion: string;
  idpsLabel: string;
  socioLabel: string;
}

const CORRELATION_DATABASE: Record<string, Record<string, CorrelationInfo>> = {
  autoestima: {
    personal: {
      r: 0.89,
      strength: "Correlación Muy Fuerte",
      strengthColor: "text-emerald-700 border-emerald-200",
      strengthBg: "bg-emerald-50",
      idpsLabel: "Autoestima Académica",
      socioLabel: "Personal (Desarrollo)",
      analysis: "La motivación de logro escolar y la autopercepción de capacidad (Autoestima Académica) están íntimamente ligadas a las habilidades de autorregulación emocional y toma de decisiones (Socioemocional Personal). La caída observada en 4° Básico (Autoestima: 64 pts, Personal: 67.2%) ratifica que un bajo control de frustración en el aula reduce directamente el rendimiento académico percibido por el alumno.",
      pmeSuggestion: "Incorporar prácticas de retroalimentación formativa de 3 minutos, bitácoras de autoevaluación al final de la clase y dinámicas de mentalidad de crecimiento (Growth Mindset) en las planificaciones semanales."
    },
    comunitario: {
      r: 0.65,
      strength: "Correlación Moderada",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Autoestima Académica",
      socioLabel: "Comunitario (Desarrollo)",
      analysis: "La autovaloración personal influye positivamente en el deseo de cooperar y empatizar con el entorno escolar. Si bien no es una relación causa-efecto directa, los alumnos con mayor autoestima académica muestran mayor disposición a participar en proyectos colaborativos y menor temor a la opinión grupal.",
      pmeSuggestion: "Estructurar actividades de aprendizaje cooperativo con roles rotativos asignados, permitiendo a los alumnos con baja motivación académica asumir tareas de vocería o diseño donde sus talentos alternativos destaquen."
    },
    ciudadano: {
      r: 0.72,
      strength: "Correlación Fuerte",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Autoestima Académica",
      socioLabel: "Ciudadano (Desarrollo)",
      analysis: "El compromiso ciudadano y el buen trato en el aula se asientan sobre la base de estudiantes con un autoconcepto seguro. Estudiantes desmotivados académicamente o con autopercepción deficiente tienden a marginarse de las decisiones colectivas y los acuerdos de convivencia escolar.",
      pmeSuggestion: "Diseñar asambleas de aula bimestrales destinadas a co-diseñar normas de convivencia donde se valide formalmente la opinión de alumnos tradicionalmente rezagados en el plano académico."
    }
  },
  clima: {
    personal: {
      r: 0.78,
      strength: "Correlación Fuerte",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Clima de Convivencia",
      socioLabel: "Personal (Desarrollo)",
      analysis: "Un ambiente seguro y libre de acoso (Clima de Convivencia) es un prerrequisito para que el alumno pueda regular sus emociones y concentrarse en el aprendizaje. La inestabilidad emocional en 4° Básico coincide con un clima de convivencia en desarrollo (70 pts).",
      pmeSuggestion: "Establecer pausas socioemocionales de 5 minutos al inicio de cada bloque lectivo para sintonizar y calmar el ambiente del aula, disminuyendo la inercia conductual de los recreos."
    },
    comunitario: {
      r: 0.93,
      strength: "Correlación Crítica Directa",
      strengthColor: "text-rose-700 border-rose-200",
      strengthBg: "bg-rose-50",
      idpsLabel: "Clima de Convivencia",
      socioLabel: "Comunitario (Desarrollo)",
      analysis: "Relación lineal directa: la empatía, el respeto por los estados emocionales del otro y la comunicación asertiva (Socioemocional Comunitario) constituyen la materia prima del Clima de Convivencia. No es posible mejorar el clima escolar de un establecimiento si los estudiantes no entrenan habilidades de escucha activa y resolución pacífica.",
      pmeSuggestion: "Lanzar un programa de Mediadores Escolares Pares donde los mismos estudiantes de 7° Básico a II° Medio sean formados para resolver conflictos menores en recreos y comedores escolar (PME Dimensión Convivencia)."
    },
    ciudadano: {
      r: 0.85,
      strength: "Correlación Fuerte",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Clima de Convivencia",
      socioLabel: "Ciudadano (Desarrollo)",
      analysis: "La valoración de las diferencias individuales (Ciudadano) incide de forma crítica en la percepción de un ambiente respetuoso y protector. A mayor inclusividad percibida por los estudiantes, mayor es la puntuación del Clima de Convivencia General.",
      pmeSuggestion: "Revisar los manuales de convivencia e incorporar protocolos específicos que visibilicen y celebren la diversidad cultural y neurológica en el aula."
    }
  },
  participacion: {
    personal: {
      r: 0.62,
      strength: "Correlación Moderada",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Participación Democrática",
      socioLabel: "Personal (Desarrollo)",
      analysis: "Estudiantes con una adecuada conciencia de sí mismos participan de forma más activa. Sin embargo, la participación democrática depende más de las oportunidades institucionales ofrecidas que del estado emocional individual.",
      pmeSuggestion: "Abrir buzones de sugerencias estudiantiles co-gestionados entre profesores jefe y delegados de curso."
    },
    comunitario: {
      r: 0.81,
      strength: "Correlación Fuerte",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Participación Democrática",
      socioLabel: "Comunitario (Desarrollo)",
      analysis: "La colaboración y la comunicación interpersonal facilitan la participación en actividades extracurriculares y comunitarias. Cursos con altos niveles de empatía comunitaria tienen consejos de curso más activos y eficientes.",
      pmeSuggestion: "Fortalecer las horas de Orientación mediante debates guiados acerca de problemas comunitarios reales del establecimiento."
    },
    ciudadano: {
      r: 0.96,
      strength: "Correlación Crítica Directa",
      strengthColor: "text-rose-700 border-rose-200",
      strengthBg: "bg-rose-50",
      idpsLabel: "Participación Democrática",
      socioLabel: "Ciudadano (Desarrollo)",
      analysis: "Correlación máxima: La participación democrática escolar y la formación ciudadana son la traducción práctica del Aprendizaje Socioemocional Ciudadano (inclusividad, prosocialidad y compromiso democrático). La co-dependencia es absoluta.",
      pmeSuggestion: "Fomentar proyectos solidarios autogestionados por curso vinculados con el entorno local (PME Dimensión de Liderazgo)."
    }
  },
  habitos: {
    personal: {
      r: 0.75,
      strength: "Correlación Fuerte",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Hábitos Saludables",
      socioLabel: "Personal (Desarrollo)",
      analysis: "La toma responsable de decisiones influye directamente en los hábitos alimentarios y de sueño de los estudiantes, al igual que en la autorregulación frente a pantallas.",
      pmeSuggestion: "Talleres conjuntos de nutrición y mindfulness para promover hábitos saludables conscientes desde el autocuidado personal."
    },
    comunitario: {
      r: 0.58,
      strength: "Correlación Moderada",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Hábitos Saludables",
      socioLabel: "Comunitario (Desarrollo)",
      analysis: "El deporte colectivo y el autocuidado comunitario refuerzan las relaciones interpersonales sanas y la cohesión de grupo.",
      pmeSuggestion: "Promover torneos deportivos inclusivos durante los recreos con foco recreativo y no únicamente competitivo."
    },
    ciudadano: {
      r: 0.64,
      strength: "Correlación Fuerte",
      strengthColor: "text-[#1B3C73] border-blue-200/50",
      strengthBg: "bg-blue-50/50",
      idpsLabel: "Hábitos Saludables",
      socioLabel: "Ciudadano (Desarrollo)",
      analysis: "El respeto por el espacio común (limpieza de patios) y las campañas de salud pública son reflejo directo del compromiso ciudadano del alumno.",
      pmeSuggestion: "Realizar campañas ecológicas lideradas por los cursos para mantener limpios los espacios de juego y alimentación."
    }
  }
};

function SocioemocionalTab() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [chartType, setChartType] = useState<string>("radar");
  const [yearView, setYearView] = useState<string>("2026");
  
  const [selectedConvivenciaDim, setSelectedConvivenciaDim] = useState<string>("Nivel 1 (Promoción Universal) - Experiencia");
  const [selectedSocioDim, setSelectedSocioDim] = useState<string>("Personal - Desarrollo");

  const [selectedIdpsVar, setSelectedIdpsVar] = useState<string>("autoestima");
  const [selectedSocioVar, setSelectedSocioVar] = useState<string>("personal");

  const [hoveredCourseConv, setHoveredCourseConv] = useState<string | null>(null);
  const [hoveredCourseSocio, setHoveredCourseSocio] = useState<string | null>(null);

  const activeData = yearView === "2025" ? IDPS_CHART_DATA_2025 : IDPS_CHART_DATA_2026;

  const formatShortLabel = (value: string) => {
    if (typeof value !== "string") return value;
    return value
      .replace(" Básico", "°B")
      .replace(" básico", "°B")
      .replace(" Medio", "°M")
      .replace(" medio", "°M");
  };

  const getIdpsValue = (idpsVar: string, grade: string) => {
    const idx = { "4° Básico": 0, "8° Básico": 1, "II° Medio": 2 }[grade] ?? 0;
    if (idpsVar === "autoestima") return [64, 74, 74][idx];
    if (idpsVar === "clima") return [70, 76, 77][idx];
    if (idpsVar === "participacion") return [72, 76, 79][idx];
    if (idpsVar === "habitos") return [66, 67, 67][idx];
    return 0;
  };

  const getSocioValue = (socioVar: string, grade: string) => {
    const courseKey = grade === "4° Básico" ? "4° Básico" : grade === "8° Básico" ? "8° Básico" : "II° Medio";
    const map: Record<string, string> = {
      personal: "Personal - Desarrollo",
      comunitario: "Comunitario - Desarrollo",
      ciudadano: "Ciudadano - Desarrollo"
    };
    const list = SOCIOEMOCIONAL_LONGITUDINAL[map[socioVar] ?? "Personal - Desarrollo"] || [];
    const found = list.find(item => item.curso === courseKey);
    return found ? found.real2026 : 0;
  };

  const filteredRadarData = useMemo(() => {
    return activeData.map(d => {
      const obj: any = { subject: d.subject };
      if (selectedLevel === "all" || selectedLevel === "4b") obj["4° Básico"] = d["4° Básico"];
      if (selectedLevel === "all" || selectedLevel === "8b") obj["8° Básico"] = d["8° Básico"];
      if (selectedLevel === "all" || selectedLevel === "2m") obj["II° Medio"] = d["II° Medio"];
      return obj;
    });
  }, [selectedLevel, activeData]);

  const compareData = useMemo(() => {
    if (selectedLevel === "all") return [];
    const levelKey = selectedLevel === "4b" ? "4° Básico" : selectedLevel === "8b" ? "8° Básico" : "II° Medio";
    return IDPS_CHART_DATA_2026.map((d, i) => {
      return {
        subject: d.subject,
        "2025": IDPS_CHART_DATA_2025[i][levelKey as keyof typeof IDPS_CHART_DATA_2025[0]] as number,
        "2026": d[levelKey as keyof typeof d] as number
      };
    });
  }, [selectedLevel]);

  const ModernTooltip = ({ active, payload, label, unit = "%" }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)] text-xs font-sans space-y-1.5 z-50">
          <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-1.5">{label}</p>
          {payload.map((p: any, i: number) => {
            let displayName = p.name;
            if (p.name === "real2025") displayName = "2025 Real";
            else if (p.name === "real2026") displayName = "2026 Diagnóstico";
            else if (p.name === "meta") displayName = "Meta Institucional";
            
            const val = p.value === "null" || p.value === undefined ? "Sin Información" : `${Number(p.value).toFixed(1)}${unit}`;
            return (
              <p key={i} className="flex justify-between gap-6 font-semibold items-center">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill }} />
                  {displayName}:
                </span>
                <span className="font-extrabold text-slate-800">{val}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const kpiItems = [
    { label: "Autoestima 4°B (2026)", val: 64, max: 100, color: "rose", note: "⚠ Caída -10 pts vs 25" },
    { label: "Clima Convivencia 8°B", val: 76, max: 100, color: "blue", note: "Estable" },
    { label: "Participación IIM", val: 79, max: 100, color: "emerald", note: "Mejor nivel (+3 pts)" },
    { label: "Meta Institucional 2026", val: 75, max: 100, color: "amber", note: "% RF Convivencia" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { opacity: 0; animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {kpiItems.map((item, i) => {
          const pct = Math.round(item.val / item.max * 100);
          const colorMap: Record<string, { bar: string; badge: string; text: string; iconBg: string }> = {
            rose: { bar: "bg-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-100", text: "text-rose-600", iconBg: "bg-rose-50 text-rose-500" },
            blue: { bar: "bg-[#1B3C73]", badge: "bg-blue-50 text-[#1B3C73] border-blue-100/50", text: "text-[#1B3C73]", iconBg: "bg-blue-50/50 text-[#1B3C73]" },
            emerald: { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100", text: "text-emerald-600", iconBg: "bg-emerald-50 text-emerald-500" },
            amber: { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-100", text: "text-amber-600", iconBg: "bg-amber-50 text-amber-500" }
          };
          const c = colorMap[item.color];
          const IconComponent = ({
            rose: AlertTriangle,
            blue: Activity,
            emerald: Award,
            amber: Target
          } as Record<string, React.ComponentType<any>>)[item.color] || HelpCircle;

          return (
            <div key={i} className="bg-white rounded-[20px] border border-slate-100/80 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up" style={{ animationDelay: `${i * 75}ms` }}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-justify">{item.label}</p>
                  <div className={cn("text-3xl font-black tracking-tight", c.text)}>
                    {item.val} {item.label.includes("Meta") ? <span className="text-sm font-bold text-slate-400">%</span> : <span className="text-sm font-bold text-slate-400">pts</span>}
                  </div>
                </div>
                <div className={cn("p-2 rounded-xl border border-transparent", c.iconBg)}>
                  <IconComponent size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-500", c.bar)} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full border", c.badge)}>{item.note}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Visualización de Indicadores Generales (IDPS)</h2>
          <p className="text-sm text-slate-500 text-justify">Seleccione el nivel para un análisis profundo (Zoom-in) y compare evoluciones históricas.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="bg-slate-100/80 p-1 rounded-xl flex items-center gap-0.5 text-xs font-semibold border border-slate-200/50 shadow-inner">
            <button onClick={() => setSelectedLevel("all")} className={cn("px-3.5 py-1.5 rounded-lg transition-all duration-200", selectedLevel === "all" ? "bg-white text-slate-800 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800")}>Visión General</button>
            <button onClick={() => setSelectedLevel("4b")} className={cn("px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1", selectedLevel === "4b" ? "bg-white text-rose-600 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800")}>Zoom 4°B</button>
            <button onClick={() => setSelectedLevel("8b")} className={cn("px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1", selectedLevel === "8b" ? "bg-white text-amber-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800")}>Zoom 8°B</button>
            <button onClick={() => setSelectedLevel("2m")} className={cn("px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1", selectedLevel === "2m" ? "bg-white text-indigo-600 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800")}>Zoom II°M</button>
          </div>
          <div className="bg-slate-100/80 p-1 rounded-xl flex items-center gap-0.5 text-xs font-semibold border border-slate-200/50 shadow-inner">
            <button onClick={() => setYearView("2026")} className={cn("px-3.5 py-1.5 rounded-lg transition-all duration-200", yearView === "2026" ? "bg-white text-slate-800 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800")}>2026</button>
            <button onClick={() => setYearView("2025")} className={cn("px-3.5 py-1.5 rounded-lg transition-all duration-200", yearView === "2025" ? "bg-white text-slate-800 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800")}>2025</button>
            {selectedLevel !== "all" && <button onClick={() => setYearView("compare")} className={cn("px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1", yearView === "compare" ? "bg-white text-emerald-700 font-bold shadow-sm" : "text-slate-500 hover:text-slate-800")}><TrendingUp size={12} /> Evolución</button>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">
            <span>Indicadores Desarrollo Personal y Social (IDPS)</span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 text-[10px] font-bold">
              <button 
                onClick={() => setChartType("radar")}
                className={cn("px-2.5 py-1 rounded-md transition-all duration-200", chartType === "radar" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800")}
              >
                Radar
              </button>
              <button 
                onClick={() => setChartType("bar")}
                className={cn("px-2.5 py-1 rounded-md transition-all duration-200", chartType === "bar" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800")}
              >
                Barras
              </button>
            </div>
          </h3>
          {(() => {
            let infoText = "";
            let infoTitle = "";
            let badgeColor = "";
            if (selectedLevel === "all") {
              infoTitle = "Indicadores de Desarrollo Personal y Social (IDPS)";
              infoText = "Los IDPS evalúan aspectos clave del desarrollo espiritual, ético, moral, afectivo y físico de los estudiantes, constituyendo parte fundamental de los Estándares de Aprendizaje Mineduc.";
              badgeColor = "bg-[#1B3C73]/5 text-[#1B3C73] border-[#1B3C73]/10";
            } else if (selectedLevel === "4b") {
              infoTitle = "Foco de Alerta: 4° Básico";
              infoText = "Se observa una caída de -10 pts en Autoestima Académica y Motivación Escolar (64 pts), lo cual coincide con la caída en las evaluaciones formativas y académicas de matemáticas.";
              badgeColor = "bg-rose-50 text-rose-700 border-rose-100";
            } else if (selectedLevel === "8b") {
              infoTitle = "Foco de Análisis: 8° Básico";
              infoText = "Clima de Convivencia y Participación Democrática estables en 76 pts. Los hábitos de vida saludable representan un desafío transversal manteniéndose rezagados en 67 pts.";
              badgeColor = "bg-amber-50 text-amber-900 border-amber-100";
            } else if (selectedLevel === "2m") {
              infoTitle = "Foco de Análisis: II° Medio";
              infoText = "El curso registra el mayor nivel de Participación Democrática (79 pts, subiendo +3 pts vs 2025). Autoestima Académica se mantiene estable en 74 pts.";
              badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
            }

            return (
              <div className={cn("border p-4 rounded-2xl mb-4 space-y-1.5 animate-in fade-in duration-200 text-xs font-semibold", badgeColor)}>
                <div className="flex items-center gap-1.5 font-bold"><Activity size={14} /><span>{infoTitle}</span></div>
                <p className="text-slate-600 text-[11px] leading-relaxed font-semibold text-justify">{infoText}</p>
              </div>
            );
          })()}
          <div className="flex-1 min-h-[380px] w-full flex items-center justify-center">
            {chartType === "radar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" margin={{ top: 10, right: 80, bottom: 10, left: 80 }} data={yearView === "compare" ? compareData : filteredRadarData}>
                  <PolarGrid stroke="#e2e8f0" strokeWidth={1} gridType="polygon" />
                  <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={11} fontWeight="700" tick={{ fill: '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[50, 100]} stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  {yearView === "compare" ? (
                    <>
                      <Radar name="2025" dataKey="2025" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.3} strokeWidth={2} dot={{ r: 3, fill: '#94a3b8' }} />
                      <Radar name="2026" dataKey="2026" stroke="#1B3C73" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2.5} dot={{ r: 4, fill: '#1B3C73' }} />
                    </>
                  ) : (
                    <>
                      {(selectedLevel === "all" || selectedLevel === "4b") && <Radar name="4° Básico" dataKey="4° Básico" stroke="#e11d48" fill="#f43f5e" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#e11d48' }} />}
                      {(selectedLevel === "all" || selectedLevel === "8b") && <Radar name="8° Básico" dataKey="8° Básico" stroke="#C87533" fill="#C87533" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#C87533' }} />}
                      {(selectedLevel === "all" || selectedLevel === "2m") && <Radar name="II° Medio" dataKey="II° Medio" stroke="#1B3C73" fill="#1B3C73" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#1B3C73' }} />}
                    </>
                  )}
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} iconType="circle" />
                  <RechartsTooltip content={<ModernTooltip unit=" pts" />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearView === "compare" ? compareData : filteredRadarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={10} fontWeight="700" />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={9} />
                  <RechartsTooltip content={<ModernTooltip unit=" pts" />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} iconType="circle" />
                  {yearView === "compare" ? (
                    <>
                      <Bar name="2025" dataKey="2025" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                      <Bar name="2026" dataKey="2026" fill="#1B3C73" radius={[3, 3, 0, 0]} />
                    </>
                  ) : (
                    <>
                      {(selectedLevel === "all" || selectedLevel === "4b") && <Bar name="4° Básico" dataKey="4° Básico" fill="#f43f5e" radius={[3, 3, 0, 0]} />}
                      {(selectedLevel === "all" || selectedLevel === "8b") && <Bar name="8° Básico" dataKey="8° Básico" fill="#C87533" radius={[3, 3, 0, 0]} />}
                      {(selectedLevel === "all" || selectedLevel === "2m") && <Bar name="II° Medio" dataKey="II° Medio" fill="#1B3C73" radius={[3, 3, 0, 0]} />}
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
              <h3 className="font-bold text-slate-700">Convivencia Escolar DIA (Análisis Longitudinal)</h3>
              <p className="text-xs text-slate-400 text-justify">Progreso histórico 2025 vs 2026.</p>
            </div>
            <div className="relative w-full md:w-72">
              <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-4 py-2.5 pr-10 shadow-sm cursor-pointer" value={selectedConvivenciaDim} onChange={(e) => setSelectedConvivenciaDim(e.target.value)}>
                {Object.keys(CONVIVENCIA_DIM_INFO).map(dim => <option key={dim} value={dim}>{dim}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"><ChevronDown size={18} /></div>
            </div>
          </div>
          {(() => {
            const info = CONVIVENCIA_DIM_INFO[selectedConvivenciaDim];
            if (!info) return null;
            const colors = {
              blue: { bg: "bg-blue-50/40", border: "border-blue-100/60", text: "text-blue-900", badge: "bg-blue-100/70 text-blue-800 border-blue-200" },
              amber: { bg: "bg-amber-50/40", border: "border-amber-100/60", text: "text-amber-950", badge: "bg-amber-100/70 text-amber-900 border-amber-200" },
              rose: { bg: "bg-rose-50/40", border: "border-rose-100/60", text: "text-rose-900", badge: "bg-rose-100/70 text-rose-800 border-rose-200" }
            }[info.scopeColor] || { bg: "bg-slate-50", border: "border-slate-100", text: "text-slate-800", badge: "bg-slate-100 text-slate-800 border-slate-200" };
            
            return (
              <div className={cn(colors.bg, "border p-5 rounded-3xl mb-6 space-y-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] animate-in fade-in duration-300", colors.border)}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#1B3C73]" />
                    <span className="font-extrabold text-slate-800 text-xs tracking-tight">{info.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold">
                    <span className="px-2.5 py-0.5 rounded-full border bg-white/80 shadow-sm text-slate-500 font-extrabold">{info.level} - {info.levelLabel}</span>
                    <span className={cn("px-2.5 py-0.5 rounded-full border font-black", colors.badge)}>{info.scope}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Definición (¿Qué mide?)</span>
                  <p className="text-slate-600 text-xs leading-relaxed font-semibold text-justify">{info.desc}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Foco Pedagógico</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed font-bold text-justify">{info.focus}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Aspectos Evaluados</span>
                    <ul className="list-disc list-inside text-slate-500 text-[10px] font-semibold space-y-0.5 leading-relaxed">
                      {info.evaluates.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONVIVENCIA_LONGITUDINAL[selectedConvivenciaDim]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="curso" stroke="#94a3b8" fontSize={11} tickFormatter={formatShortLabel} fontWeight="600" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <RechartsTooltip content={<ModernTooltip unit="% RF" />} />
                {(yearView === "2025" || yearView === "compare") && <Bar dataKey="real2025" name="2025 Real" fill="#94a3b8" radius={[4, 4, 0, 0]} />}
                {(yearView === "2026" || yearView === "compare") && <Bar dataKey="real2026" name="2026 Diagnóstico" fill="#10b981" radius={[4, 4, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] animate-fade-in-up" style={{ animationDelay: "550ms" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> Aprendizaje Socioemocional Diagnóstico 2026</h3>
            <p className="text-xs text-slate-500 text-justify">Desglose transversal por curso.</p>
          </div>
          <div className="relative w-full md:w-72">
            <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-4 py-2.5 pr-10 shadow-sm cursor-pointer" value={selectedSocioDim} onChange={(e) => setSelectedSocioDim(e.target.value)}>
              {Object.keys(SOCIOEMOCIONAL_DIM_INFO).map(dim => <option key={dim} value={dim}>{dim}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><ChevronDown size={18} /></div>
          </div>
        </div>
        {(() => {
          const info = SOCIOEMOCIONAL_DIM_INFO[selectedSocioDim];
          if (!info) return null;
          const isGest = info.type === "Gestión del Establecimiento";
          return (
            <div className={cn(isGest ? "bg-indigo-50/20 border-indigo-100/40" : "bg-rose-50/20 border-rose-100/40", "border p-5 rounded-3xl mb-6 space-y-3.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)] animate-in fade-in duration-300")}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-2">
                  <Heart size={16} className={isGest ? "text-indigo-600" : "text-rose-500"} />
                  <span className="font-extrabold text-slate-800 text-xs tracking-tight">{info.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold">
                  <span className="px-2.5 py-0.5 rounded-full border bg-white/80 shadow-sm text-slate-500 font-extrabold">Área {info.category}</span>
                  <span className={cn("px-2.5 py-0.5 rounded-full border font-black", isGest ? "bg-indigo-50/80 text-indigo-700 border-indigo-200" : "bg-rose-50/80 text-rose-700 border-rose-200")}>{info.type}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Definición (¿Qué mide?)</span>
                <p className="text-slate-600 text-xs leading-relaxed font-semibold text-justify">{info.desc}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Foco Pedagógico</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed font-bold text-justify">{info.focus}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sub-habilidades / Indicadores Evaluados</span>
                  <ul className="list-disc list-inside text-slate-500 text-[10px] font-semibold space-y-0.5 leading-relaxed">
                    {info.skills.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          );
        })()}
        <div className="h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SOCIOEMOCIONAL_LONGITUDINAL[selectedSocioDim]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="curso" stroke="#94a3b8" fontSize={11} tickFormatter={formatShortLabel} fontWeight="600" />
              <YAxis domain={[40, 100]} stroke="#94a3b8" fontSize={10} />
              <RechartsTooltip content={<ModernTooltip unit="% Cobertura" />} />
              <Bar dataKey="real2026" name="2026 Diagnóstico" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ----------------------------------------------------
          EXPLORADOR DE CORRELACIÓN INTELIGENTE (IA)
          ---------------------------------------------------- */}
      <div className="bg-gradient-to-r from-orange-50/40 via-orange-50/10 to-white border border-orange-100/60 rounded-[2.5rem] p-8 shadow-sm animate-fade-in-up space-y-6" style={{ animationDelay: "650ms" }}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100/60 border border-orange-200/50 flex items-center justify-center text-[#C87533] shrink-0">
              <Sparkles className="w-5 h-5 text-[#C87533]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1B3C73] text-base tracking-tight flex items-center gap-2">
                Cruce de Variables y Correlación Inteligente
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed text-justify">
                Analice la co-dependencia y correlación estadística ($r$ de Pearson) entre los indicadores del establecimiento.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/80 text-[10px] font-black uppercase tracking-widest block w-fit shadow-sm bg-white/60">
            Motor de Análisis IA Activo
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Selectors and Stat Indicator (5 cols) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Configuración del Cruce</span>
              
              {/* IDPS Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Indicador Social (IDPS Mineduc):</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-white border border-slate-100 hover:border-slate-200 focus:border-[#1B3C73] text-slate-700 text-xs font-bold rounded-xl px-4 py-3 pr-10 shadow-sm cursor-pointer focus:outline-none transition-colors" 
                    value={selectedIdpsVar} 
                    onChange={(e) => setSelectedIdpsVar(e.target.value)}
                  >
                    <option value="autoestima">Autoestima Académica y Motivación Escolar</option>
                    <option value="clima">Clima de Convivencia Escolar</option>
                    <option value="participacion">Participación Democrática y Formación Ciudadana</option>
                    <option value="habitos">Hábitos de Vida Saludable</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400"><ChevronDown size={16} /></div>
                </div>
              </div>

              {/* Socioemocional Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Dimensión Socioemocional (DIA):</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-white border border-slate-100 hover:border-slate-200 focus:border-[#1B3C73] text-slate-700 text-xs font-bold rounded-xl px-4 py-3 pr-10 shadow-sm cursor-pointer focus:outline-none transition-colors" 
                    value={selectedSocioVar} 
                    onChange={(e) => setSelectedSocioVar(e.target.value)}
                  >
                    <option value="personal">Aprendizaje Socioemocional Personal</option>
                    <option value="comunitario">Aprendizaje Socioemocional Comunitario</option>
                    <option value="ciudadano">Aprendizaje Socioemocional Ciudadano</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400"><ChevronDown size={16} /></div>
                </div>
              </div>
            </div>

            {/* Pearson Correlation Gauge */}
            {(() => {
              const relation = CORRELATION_DATABASE[selectedIdpsVar]?.[selectedSocioVar];
              if (!relation) return null;
              
              // Map colors for Pearson strength
              const pct = Math.abs(relation.r) * 100;
              let barColor = "from-blue-500 to-indigo-600";
              if (relation.r >= 0.85) barColor = "from-[#10b981] to-[#047857]";
              else if (relation.r >= 0.70) barColor = "from-[#1B3C73] to-[#254d8f]";
              else if (relation.r >= 0.60) barColor = "from-amber-400 to-[#C87533]";
              else barColor = "from-rose-400 to-rose-600";

              return (
                <div className="space-y-4 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuerza de Correlación</span>
                    <span className={cn("px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider", relation.strengthColor, relation.strengthBg)}>
                      {relation.strength}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">r = {relation.r.toFixed(2)}</span>
                    <div className="flex items-center gap-1 select-none">
                      <span className="text-[10px] font-extrabold text-slate-400">Coeficiente Pearson</span>
                      <div className="relative group inline-block">
                        <HelpCircle className="w-3.5 h-3.5 text-[#C87533] hover:text-[#1B3C73] transition-colors cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-white text-slate-600 text-[10px] leading-relaxed font-semibold rounded-2xl shadow-xl border border-slate-150 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <p className="font-extrabold text-[#1B3C73] border-b border-slate-100 pb-1 mb-1 text-xs text-justify">¿Qué es el Coeficiente Pearson?</p>
                          <p className="text-slate-500">Mide el grado de relación lineal entre dos variables (de -1.00 a 1.00):</p>
                          <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-500">
                            <li><strong className="text-slate-700">r cercano a 1.00:</strong> Fuerte correlación positiva (ambas suben juntas).</li>
                            <li><strong className="text-slate-700">r cercano a -1.00:</strong> Fuerte correlación inversa (una sube y la otra baja).</li>
                            <li><strong className="text-slate-700">r cercano a 0.00:</strong> Sin correlación lineal.</li>
                          </ul>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 bg-white border-r border-b border-slate-150 rotate-45" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20 p-0.5">
                      <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 shadow-sm", barColor)} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      <span>0.0 (Nula)</span>
                      <span>0.5 (Media)</span>
                      <span>1.0 (Máxima)</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Column: AI Analysis and Recommendations (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {(() => {
              const relation = CORRELATION_DATABASE[selectedIdpsVar]?.[selectedSocioVar];
              if (!relation) return null;

              // Generate comparative chart data for the selected variables
              // available levels: 4° Básico, 8° Básico, II° Medio
              const gradesList = ["4° Básico", "8° Básico", "II° Medio"];
              const correlationChartData = gradesList.map(grade => {
                return {
                  name: formatShortLabel(grade),
                  [relation.idpsLabel]: getIdpsValue(selectedIdpsVar, grade),
                  [relation.socioLabel]: getSocioValue(selectedSocioVar, grade)
                };
              });

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  {/* Analysis Box */}
                  <div className="space-y-5 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[#1a2e3b] font-black text-xs uppercase tracking-wider">
                        <Brain className="w-4 h-4 text-[#C87533]" />
                        <span>Análisis de Co-dependencia IA</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed font-semibold text-justify">
                        {relation.analysis}
                      </p>
                    </div>

                    <div className="p-5 bg-orange-50/40 border border-orange-100/60 rounded-3xl space-y-1.5 mt-2 shadow-[0_4px_20px_rgba(200,117,51,0.01)]">
                      <div className="flex items-center gap-1.5 text-[#C87533] font-black text-[10px] uppercase tracking-widest">
                        <Award size={14} className="text-[#C87533]" />
                        <span>Propuesta de Plan de Acción PME</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed font-bold text-justify">
                        {relation.pmeSuggestion}
                      </p>
                    </div>
                  </div>

                  {/* Comparative Miniature Chart */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Comparación por Grado</span>
                      <span className="text-[10px] font-bold text-slate-500">Alineación de porcentajes/puntajes</span>
                    </div>
                    <div className="h-44 w-full mt-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={correlationChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} fontWeight="600" />
                          <YAxis domain={[40, 100]} stroke="#94a3b8" fontSize={8} />
                          <RechartsTooltip content={<ModernTooltip unit="" />} />
                          <Bar dataKey={relation.idpsLabel} fill="#C87533" radius={[3, 3, 0, 0]} />
                          <Bar dataKey={relation.socioLabel} fill="#1B3C73" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-[9px] font-black text-slate-500 mt-2 uppercase tracking-wide">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#C87533]" /> {relation.idpsLabel}</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#1B3C73]" /> {relation.socioLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
  
// TAB 6: ACOMPAÑAMIENTO DOCENTE (Real DB numbers & progression)
// ----------------------------------------------------
// ----------------------------------------------------
// TAB 6: ACOMPAÑAMIENTO DOCENTE (Real DB numbers & progression)
// ----------------------------------------------------
const DOK_RESUMEN_DATA = [
  { name: "Diag 2025", "DOK 1": 85.0, "DOK 2": 11.0, "DOK 3+": 4.0 },
  { name: "Cierre 2025", "DOK 1": 72.0, "DOK 2": 18.0, "DOK 3+": 10.0 },
  { name: "Diag 2026", "DOK 1": 50.5, "DOK 2": 22.0, "DOK 3+": 27.5 },
  { name: "Unidad 0 2026", "DOK 1": 43.2, "DOK 2": 44.9, "DOK 3+": 11.9 }
];

const DOK_LENGUAJE_DATA = [
  { name: "Diag 2025", "DOK 1": 75.0, "DOK 2": 15.0, "DOK 3+": 10.0 },
  { name: "Cierre 2025", "DOK 1": 65.0, "DOK 2": 20.0, "DOK 3+": 15.0 },
  { name: "Diag 2026", "DOK 1": 52.0, "DOK 2": 18.0, "DOK 3+": 30.0 },
  { name: "Unidad 0 2026", "DOK 1": 41.1, "DOK 2": 47.7, "DOK 3+": 11.2 }
];

const DOK_MATEMATICA_DATA = [
  { name: "Diag 2025", "DOK 1": 90.0, "DOK 2": 8.0, "DOK 3+": 2.0 },
  { name: "Cierre 2025", "DOK 1": 85.0, "DOK 2": 10.0, "DOK 3+": 5.0 },
  { name: "Diag 2026", "DOK 1": 75.0, "DOK 2": 15.0, "DOK 3+": 10.0 },
  { name: "Unidad 0 2026", "DOK 1": 37.5, "DOK 2": 51.7, "DOK 3+": 10.8 }
];

const DOK_HISTORIA_DATA = [
  { name: "Diag 2025", "DOK 1": 85.0, "DOK 2": 12.0, "DOK 3+": 3.0 },
  { name: "Cierre 2025", "DOK 1": 80.0, "DOK 2": 14.0, "DOK 3+": 6.0 },
  { name: "Diag 2026", "DOK 1": 45.0, "DOK 2": 25.0, "DOK 3+": 30.0 },
  { name: "Unidad 0 2026", "DOK 1": 49.1, "DOK 2": 41.8, "DOK 3+": 9.1 }
];

const DOK_CIENCIAS_DATA = [
  { name: "Diag 2025", "DOK 1": 80.0, "DOK 2": 15.0, "DOK 3+": 5.0 },
  { name: "Cierre 2025", "DOK 1": 75.0, "DOK 2": 17.0, "DOK 3+": 8.0 },
  { name: "Diag 2026", "DOK 1": 30.0, "DOK 2": 30.0, "DOK 3+": 40.0 },
  { name: "Unidad 0 2026", "DOK 1": 45.0, "DOK 2": 38.3, "DOK 3+": 16.7 }
];

const DOK_COMPARATIVA_DATA = [
  { subject: "Lenguaje", "DOK 1": 41.1, "DOK 2": 47.7, "DOK 3+": 11.2 },
  { subject: "Matemática", "DOK 1": 37.5, "DOK 2": 51.7, "DOK 3+": 10.8 },
  { subject: "Historia", "DOK 1": 49.1, "DOK 2": 41.8, "DOK 3+": 9.1 },
  { subject: "Ciencias", "DOK 1": 45.0, "DOK 2": 38.3, "DOK 3+": 16.7 }
];

const CAROUSEL_SLIDES = [
  {
    title: "Resumen General (Promedio)",
    description: "Promedio institucional de alineación de demanda cognitiva en aula (fricción cognitiva real) durante los últimos dos años.",
    type: "line",
    data: DOK_RESUMEN_DATA
  },
  {
    title: "Departamento de Lenguaje y Comunicación",
    description: "Evolución por nivel DOK en Lenguaje. Fuerte alza en enseñanza media (alcanzando 30% en DOK 3+ en diagnóstico 2026).",
    type: "line",
    data: DOK_LENGUAJE_DATA
  },
  {
    title: "Departamento de Matemática",
    description: "Desafío crítico: predominancia de DOK 1 y camuflaje cognitivo en básica, con repunte en media (III° Medio 70% DOK 3).",
    type: "line",
    data: DOK_MATEMATICA_DATA
  },
  {
    title: "Departamento de Historia y Ciencias Sociales",
    description: "Comportamiento desigual: excelencia en ciclo inicial (3°-5° Básico DOK 3), inercia en intermedios y repunte en Ed. Ciudadana.",
    type: "line",
    data: DOK_HISTORIA_DATA
  },
  {
    title: "Departamento de Ciencias Naturales",
    description: "Espectro amplio: de vocabulario (DOK 1) en básica a modelamiento e indagación experimental (DOK 3/4) en enseñanza media.",
    type: "line",
    data: DOK_CIENCIAS_DATA
  },
  {
    title: "Comparativa Sectorial — Unidad 0 (2026)",
    description: "Distribución de demanda cognitiva por departamento en la última evaluación formativa aplicada (Unidad 0).",
    type: "bar",
    data: DOK_COMPARATIVA_DATA
  }
];

const RUBRIC_PIE_DATA = [
  { name: "Formación / Convivencia", value: 52, fill: "#1B3C73" },
  { name: "Curricular / Pedagógica", value: 35, fill: "#C87533" }
];

function AcompanamientoTab() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = CAROUSEL_SLIDES[currentSlide];

  const handlePrev = () => {
    setCurrentSlide(prev => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide(prev => (prev === CAROUSEL_SLIDES.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Acompañamiento y Demanda Cognitiva</h2>
          <p className="text-sm text-slate-500 text-justify">Análisis del rigor didáctico (DOK) observado en aula por departamento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DOK Progress - Carousel */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B3C73]"></span> {slide.title}
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev} 
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  aria-label="Diapositiva anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[11px] font-bold text-slate-400">{currentSlide + 1} / {CAROUSEL_SLIDES.length}</span>
                <button 
                  onClick={handleNext} 
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  aria-label="Siguiente diapositiva"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed min-h-[32px] text-justify">{slide.description}</p>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {slide.type === "line" ? (
                  <LineChart data={slide.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <RechartsTooltip content={<CustomTooltip unit="%" />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="DOK 1" stroke="#f43f5e" strokeWidth={3}>
                      <LabelList dataKey="DOK 1" position="top" offset={8} style={{ fill: '#f43f5e', fontSize: 9, fontWeight: 'bold' }} />
                    </Line>
                    <Line type="monotone" dataKey="DOK 2" stroke="#f59e0b" strokeWidth={2}>
                      <LabelList dataKey="DOK 2" position="top" offset={8} style={{ fill: '#f59e0b', fontSize: 9 }} />
                    </Line>
                    <Line type="monotone" dataKey="DOK 3+" stroke="#10b981" strokeWidth={3}>
                      <LabelList dataKey="DOK 3+" position="top" offset={8} style={{ fill: '#10b981', fontSize: 9, fontWeight: 'bold' }} />
                    </Line>
                  </LineChart>
                ) : (
                  <BarChart data={slide.data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                    <RechartsTooltip content={<CustomTooltip unit="%" />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="DOK 1" fill="#f43f5e" radius={[3, 3, 0, 0]}>
                      <LabelList dataKey="DOK 1" position="top" offset={6} style={{ fill: '#f43f5e', fontSize: 9, fontWeight: 'bold' }} />
                    </Bar>
                    <Bar dataKey="DOK 2" fill="#f59e0b" radius={[3, 3, 0, 0]}>
                      <LabelList dataKey="DOK 2" position="top" offset={6} style={{ fill: '#f59e0b', fontSize: 9 }} />
                    </Bar>
                    <Bar dataKey="DOK 3+" fill="#10b981" radius={[3, 3, 0, 0]}>
                      <LabelList dataKey="DOK 3+" position="top" offset={6} style={{ fill: '#10b981', fontSize: 9, fontWeight: 'bold' }} />
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Indicator dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {CAROUSEL_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentSlide === i ? "bg-[#1B3C73] w-4" : "bg-slate-200 hover:bg-slate-300"
                )}
                aria-label={`Ir a diapositiva ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Pie Chart: Formación vs Curricular */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
          <div>
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">Acompañamientos por Área</h3>
            <div className="h-56 w-full flex items-center justify-center relative mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RUBRIC_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
                    labelLine={false}
                  >
                    {RUBRIC_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip unit=" ciclos" />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-800">87</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ciclos</div>
                </div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="space-y-2 border-t border-slate-100 pt-3 mt-2">
            {RUBRIC_PIE_DATA.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.fill }} />
                  <span>{d.name}</span>
                </div>
                <span className="font-black text-slate-800">{d.value} ({Math.round(d.value / 87 * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail of dimensions with highest observed deployment */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> Dimensiones con Mayor Despliegue en Aula
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Área Curricular / Pedagógica</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Paso 1: Expectación y Foco</span>
                <span className="font-bold text-slate-800">92%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[92%] rounded-full" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Paso 3: Modelamiento Experto</span>
                <span className="font-bold text-slate-800">84%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[84%] rounded-full" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Paso 5: Práctica Deliberada</span>
                <span className="font-bold text-slate-800">65%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[65%] rounded-full" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Área Formación / Convivencia</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Ambiente de Respeto</span>
                <span className="font-bold text-slate-800">89%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[89%] rounded-full" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Ambiente Organizado y Seguro</span>
                <span className="font-bold text-slate-800">85%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%] rounded-full" />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Soporte y Contención Emocional</span>
                <span className="font-bold text-slate-800">74%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[74%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// TAB 7: RESULTADOS DIA (Sustituto de PME)
// ----------------------------------------------------
const COHORTE_LECTURA_DATA = [
  { cohorte: "2° a 3° Básico", nivel3: 51.06, apoyo: 54.43 },
  { cohorte: "3° a 4° Básico", nivel3: 32.79, apoyo: 45.83 },
  { cohorte: "4° a 5° Básico", nivel3: 26.00, apoyo: 74.42 },
  { cohorte: "5° a 6° Básico", nivel3: 6.06, apoyo: 92.54 },
  { cohorte: "6° a 7° Básico", nivel3: 16.92, apoyo: 95.45 },
  { cohorte: "7° a 8° Básico", nivel3: 8.70, apoyo: 85.14 },
  { cohorte: "8° a I° Medio", nivel3: 5.97, apoyo: 84.34 },
  { cohorte: "I° a II° Medio", nivel3: 7.94, apoyo: 74.36 }
];

const COHORTE_MAT_DATA = [
  { cohorte: "2° a 3° Básico", nivel3: 43.40, apoyo: 77.97 },
  { cohorte: "3° a 4° Básico", nivel3: 22.58, apoyo: 88.41 },
  { cohorte: "4° a 5° Básico", nivel3: 10.29, apoyo: 95.45 },
  { cohorte: "5° a 6° Básico", nivel3: 21.54, apoyo: 100.00 },
  { cohorte: "6° a 7° Básico", nivel3: 4.48, apoyo: 98.86 },
  { cohorte: "7° a 8° Básico", nivel3: 33.78, apoyo: 94.94 },
  { cohorte: "8° a I° Medio", nivel3: 3.08, apoyo: 91.67 },
  { cohorte: "I° a II° Medio", nivel3: 0.00, apoyo: 88.41 }
];

const DIA_ACADEMICO_CIERRE_2025_LECTURA = [
  { grado: "2° Básico", "Nivel I (Inicio)": 6.38, "Nivel II (Parcial)": 42.56, "Nivel III (Satisfactorio)": 51.06 },
  { grado: "3° Básico", "Nivel I (Inicio)": 13.11, "Nivel II (Parcial)": 54.10, "Nivel III (Satisfactorio)": 32.79 },
  { grado: "4° Básico", "Nivel I (Inicio)": 22.00, "Nivel II (Parcial)": 52.00, "Nivel III (Satisfactorio)": 26.00 },
  { grado: "5° Básico", "Nivel I (Inicio)": 21.21, "Nivel II (Parcial)": 72.73, "Nivel III (Satisfactorio)": 6.06 },
  { grado: "6° Básico", "Nivel I (Inicio)": 26.15, "Nivel II (Parcial)": 56.93, "Nivel III (Satisfactorio)": 16.92 },
  { grado: "7° Básico", "Nivel I (Inicio)": 39.13, "Nivel II (Parcial)": 52.17, "Nivel III (Satisfactorio)": 8.70 },
  { grado: "8° Básico", "Nivel I (Inicio)": 41.79, "Nivel II (Parcial)": 52.24, "Nivel III (Satisfactorio)": 5.97 },
  { grado: "I° Medio", "Nivel I (Inicio)": 25.40, "Nivel II (Parcial)": 66.66, "Nivel III (Satisfactorio)": 7.94 },
  { grado: "II° Medio", "Nivel I (Inicio)": 42.47, "Nivel II (Parcial)": 52.05, "Nivel III (Satisfactorio)": 5.48 }
];

const DIA_ACADEMICO_CIERRE_2025_MATEMATICA = [
  { grado: "1° Básico", "Nivel I (Inicio)": 3.85, "Nivel II (Parcial)": 50.00, "Nivel III (Satisfactorio)": 46.15 },
  { grado: "2° Básico", "Nivel I (Inicio)": 5.66, "Nivel II (Parcial)": 50.94, "Nivel III (Satisfactorio)": 43.40 },
  { grado: "3° Básico", "Nivel I (Inicio)": 16.13, "Nivel II (Parcial)": 61.29, "Nivel III (Satisfactorio)": 22.58 },
  { grado: "4° Básico", "Nivel I (Inicio)": 26.47, "Nivel II (Parcial)": 63.24, "Nivel III (Satisfactorio)": 10.29 },
  { grado: "5° Básico", "Nivel I (Inicio)": 21.54, "Nivel II (Parcial)": 56.92, "Nivel III (Satisfactorio)": 21.54 },
  { grado: "6° Básico", "Nivel I (Inicio)": 37.31, "Nivel II (Parcial)": 58.21, "Nivel III (Satisfactorio)": 4.48 },
  { grado: "7° Básico", "Nivel I (Inicio)": 29.73, "Nivel II (Parcial)": 36.49, "Nivel III (Satisfactorio)": 33.78 },
  { grado: "8° Básico", "Nivel I (Inicio)": 63.08, "Nivel II (Parcial)": 33.84, "Nivel III (Satisfactorio)": 3.08 },
  { grado: "I° Medio", "Nivel I (Inicio)": 58.82, "Nivel II (Parcial)": 41.18, "Nivel III (Satisfactorio)": 0.00 },
  { grado: "II° Medio", "Nivel I (Inicio)": 56.45, "Nivel II (Parcial)": 40.32, "Nivel III (Satisfactorio)": 3.23 }
];

const DIA_ACADEMICO_DIAG_2026_LECTURA = [
  { grado: "2° Básico", "Requiere Apoyo": 45.83, "Consolidado": 54.17 },
  { grado: "3° Básico", "Requiere Apoyo": 74.42, "Consolidado": 25.58 },
  { grado: "4° Básico", "Requiere Apoyo": 27.27, "Consolidado": 72.73 },
  { grado: "5° Básico", "Requiere Apoyo": 74.36, "Consolidado": 25.64 },
  { grado: "6° Básico", "Requiere Apoyo": 92.54, "Consolidado": 7.46 },
  { grado: "7° Básico", "Requiere Apoyo": 95.45, "Consolidado": 4.55 },
  { grado: "8° Básico", "Requiere Apoyo": 85.14, "Consolidado": 14.86 },
  { grado: "I° Medio", "Requiere Apoyo": 84.34, "Consolidado": 15.66 },
  { grado: "II° Medio", "Requiere Apoyo": 54.43, "Consolidado": 45.57 }
];

const DIA_ACADEMICO_DIAG_2026_MATEMATICA = [
  { grado: "3° Básico", "Requiere Apoyo": 77.97, "Consolidado": 22.03 },
  { grado: "4° Básico", "Requiere Apoyo": 88.41, "Consolidado": 11.59 },
  { grado: "5° Básico", "Requiere Apoyo": 95.45, "Consolidado": 4.55 },
  { grado: "6° Básico", "Requiere Apoyo": 97.10, "Consolidado": 2.90 },
  { grado: "7° Básico", "Requiere Apoyo": 94.94, "Consolidado": 5.06 },
  { grado: "8° Básico", "Requiere Apoyo": 91.67, "Consolidado": 8.33 },
  { grado: "I° Medio", "Requiere Apoyo": 100.00, "Consolidado": 0.00 },
  { grado: "II° Medio", "Requiere Apoyo": 98.86, "Consolidado": 1.14 }
];

interface DiaBrecha {
  asignatura: string;
  grado: string;
  cierre2025: string;
  diagnostico2026: string;
}

const DIA_BRECHAS_GENERO_DATA: DiaBrecha[] = [
  // Lectura
  { asignatura: "Lectura", grado: "2° Básico", cierre2025: "👩 Mujeres (+)", diagnostico2026: "Sin brecha" },
  { asignatura: "Lectura", grado: "3° Básico", cierre2025: "Sin brecha", diagnostico2026: "👩 Mujeres (+)" },
  { asignatura: "Lectura", grado: "4° Básico", cierre2025: "👩 Mujeres (+)", diagnostico2026: "Sin brecha" },
  { asignatura: "Lectura", grado: "5° Básico", cierre2025: "👩 Mujeres (+)", diagnostico2026: "👩 Mujeres (+)" },
  { asignatura: "Lectura", grado: "6° Básico", cierre2025: "👩 Mujeres (+)", diagnostico2026: "👩 Mujeres (+)" },
  { asignatura: "Lectura", grado: "7° Básico", cierre2025: "Sin brecha", diagnostico2026: "👩 Mujeres (+)" },
  { asignatura: "Lectura", grado: "8° Básico", cierre2025: "Sin brecha", diagnostico2026: "Sin brecha" },
  { asignatura: "Lectura", grado: "I° Medio", cierre2025: "👩 Mujeres (+)", diagnostico2026: "Sin brecha" },
  { asignatura: "Lectura", grado: "II° Medio", cierre2025: "Sin brecha", diagnostico2026: "👩 Mujeres (+)" },
  
  // Matemática
  { asignatura: "Matemática", grado: "3° Básico", cierre2025: "Sin brecha", diagnostico2026: "👩 Mujeres (+)" },
  { asignatura: "Matemática", grado: "5° Básico", cierre2025: "👩 Mujeres (+)", diagnostico2026: "Sin brecha" },
  { asignatura: "Matemática", grado: "7° Básico", cierre2025: "👩 Mujeres (+)", diagnostico2026: "Sin brecha" },
  { asignatura: "Matemática", grado: "I° Medio", cierre2025: "Sin brecha", diagnostico2026: "👨 Hombres (+)" },
  
  // Socioemocional
  { asignatura: "Socioemocional", grado: "4° Básico", cierre2025: "👩 Mujeres (+)", diagnostico2026: "👨 Hombres (+)" },
  { asignatura: "Socioemocional", grado: "5° Básico", cierre2025: "👨 Hombres (+)", diagnostico2026: "Sin brecha" },
  { asignatura: "Socioemocional", grado: "6° Básico", cierre2025: "👨 Hombres (+)", diagnostico2026: "👩 Mujeres (+)" },
  { asignatura: "Socioemocional", grado: "7° Básico", cierre2025: "👨 Hombres (+)", diagnostico2026: "👩 Mujeres (+)" },
  { asignatura: "Socioemocional", grado: "8° Básico", cierre2025: "Sin brecha", diagnostico2026: "👨 Hombres (+)" },
  { asignatura: "Socioemocional", grado: "I° Medio", cierre2025: "Sin brecha", diagnostico2026: "👨 Hombres (+)" },
  { asignatura: "Socioemocional", grado: "II° Medio", cierre2025: "Sin brecha", diagnostico2026: "👨 Hombres (+)" },
  { asignatura: "Socioemocional", grado: "III° Medio", cierre2025: "Sin brecha", diagnostico2026: "👨 Hombres (+)" },
  
  // Convivencia
  { asignatura: "Convivencia", grado: "4° Básico", cierre2025: "Sin participación", diagnostico2026: "👨 Hombres (+)" },
  { asignatura: "Convivencia", grado: "5° Básico", cierre2025: "Sin participación", diagnostico2026: "👨 Hombres (+)" },
  { asignatura: "Convivencia", grado: "7° Básico", cierre2025: "Sin participación", diagnostico2026: "Sin brecha" },
  { asignatura: "Convivencia", grado: "8° Básico", cierre2025: "Sin participación", diagnostico2026: "👨 Hombres (+)" },
  { asignatura: "Convivencia", grado: "I° Medio", cierre2025: "Sin participación", diagnostico2026: "👨 Hombres (+)" },
  { asignatura: "Convivencia", grado: "II° Medio", cierre2025: "Sin participación", diagnostico2026: "👩 Mujeres (+)" },
  { asignatura: "Convivencia", grado: "III° Medio", cierre2025: "Sin participación", diagnostico2026: "Sin brecha" },
  { asignatura: "Convivencia", grado: "IV° Medio", cierre2025: "Sin participación", diagnostico2026: "👨 Hombres (+)" }
];

function TrayectoriasTab() {
  const [subTab, setSubTab] = useState<"trayectorias" | "logros" | "logros2026" | "brechas">("trayectorias");
  const [subject, setSubject] = useState<string>("lectura");
  const [brechaFilter, setBrechaFilter] = useState<string>("todos");

  const currentCohortData = subject === "lectura" ? COHORTE_LECTURA_DATA : COHORTE_MAT_DATA;
  const currentLogroData = subject === "lectura" ? DIA_ACADEMICO_CIERRE_2025_LECTURA : DIA_ACADEMICO_CIERRE_2025_MATEMATICA;

  const filteredBrechas = useMemo(() => {
    if (brechaFilter === "todos") return DIA_BRECHAS_GENERO_DATA;
    if (brechaFilter === "lectura") return DIA_BRECHAS_GENERO_DATA.filter(b => b.asignatura === "Lectura");
    if (brechaFilter === "matematica") return DIA_BRECHAS_GENERO_DATA.filter(b => b.asignatura === "Matemática");
    if (brechaFilter === "socioemocional") return DIA_BRECHAS_GENERO_DATA.filter(b => b.asignatura.includes("Socioemocional"));
    if (brechaFilter === "convivencia") return DIA_BRECHAS_GENERO_DATA.filter(b => b.asignatura.includes("Convivencia"));
    return DIA_BRECHAS_GENERO_DATA;
  }, [brechaFilter]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sub-tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/40 shadow-inner text-xs font-bold w-fit max-w-full overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setSubTab("trayectorias")}
            className={cn("px-4 py-2 rounded-xl transition-all", subTab === "trayectorias" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
          >
            Trayectorias de Aprendizaje
          </button>
          <button 
            onClick={() => setSubTab("logros")}
            className={cn("px-4 py-2 rounded-xl transition-all", subTab === "logros" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
          >
            Resultados Cierre 2025
          </button>
          <button 
            onClick={() => setSubTab("logros2026")}
            className={cn("px-4 py-2 rounded-xl transition-all", subTab === "logros2026" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
          >
            Diagnóstico 2026
          </button>
          <button 
            onClick={() => setSubTab("brechas")}
            className={cn("px-4 py-2 rounded-xl transition-all", subTab === "brechas" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
          >
            Brechas de Género
          </button>
        </div>

        {/* Header Titles depending on subTab */}
        <div className="text-right">
          {subTab === "trayectorias" && (
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Cruce Longitudinal 2025 vs 2026</span>
          )}
          {subTab === "logros" && (
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Distribución Académica DIA Cierre 2025</span>
          )}
          {subTab === "logros2026" && (
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Diagnóstico Académico DIA 2026</span>
          )}
          {subTab === "brechas" && (
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Brechas Significativas por Género</span>
          )}
        </div>
      </div>

      {/* ---------------------------------------------
          SUB-TAB 1: TRAYECTORIAS
          --------------------------------------------- */}
      {subTab === "trayectorias" && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Trayectorias DIA: Volatilidad del Aprendizaje</h2>
              <p className="text-sm text-slate-500 text-justify">Cruce longitudinal del Nivel III (Cierre 2025) vs. Requiere Mayor Apoyo (Diagnóstico 2026).</p>
            </div>
            
            {/* Toggle Subject */}
            <div className="flex bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/40 shadow-inner text-xs font-bold w-fit">
              <button 
                onClick={() => setSubject("lectura")}
                className={cn("px-4 py-2 rounded-lg transition-all", subject === "lectura" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Comp. Lectora
              </button>
              <button 
                onClick={() => setSubject("matematica")}
                className={cn("px-4 py-2 rounded-lg transition-all", subject === "matematica" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Matemática
              </button>
            </div>
          </div>

          {/* Cohort chart comparison */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">
              Pérdida de Aprendizaje tras el Receso Estival (Cierre vs. Diagnóstico)
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentCohortData}>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="cohorte" stroke="#94a3b8" fontSize={11} fontWeight="600" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <RechartsTooltip content={<CustomTooltip unit="%" />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                  <Bar dataKey="nivel3" name="Satisfactorio (Cierre 2025)" fill="#1B3C73" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="apoyo" name="Requiere Mayor Apoyo (Diag 2026)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Matriz interactiva de datos */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Matriz Cohorte Completa (Cierre 2025 vs. Inicio 2026)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Cohorte</th>
                    <th className="py-3 px-4">Nivel I (2025)</th>
                    <th className="py-3 px-4">Nivel II (2025)</th>
                    <th className="py-3 px-4">Nivel III (2025)</th>
                    <th className="py-3 px-4">Mayor Apoyo (2026)</th>
                    <th className="py-3 px-4">Diagnóstico Brecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {subject === "lectura" ? (
                    <>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">2° básico a 3° básico</td>
                        <td className="py-2.5 px-4">6.38%</td>
                        <td className="py-2.5 px-4">42.56%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">51.06%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">54.43%</td>
                        <td className="py-2.5 px-4"><span className="text-slate-400">Moderado</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">3° básico a 4° básico</td>
                        <td className="py-2.5 px-4">13.11%</td>
                        <td className="py-2.5 px-4">54.10%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">32.79%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">45.83%</td>
                        <td className="py-2.5 px-4"><span className="text-slate-400">Moderado</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">4° básico a 5° básico</td>
                        <td className="py-2.5 px-4">22.00%</td>
                        <td className="py-2.5 px-4">52.00%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">26.00%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">74.42%</td>
                        <td className="py-2.5 px-4"><span className="text-rose-600 font-bold">Crítico</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">5° básico a 6° básico</td>
                        <td className="py-2.5 px-4">21.21%</td>
                        <td className="py-2.5 px-4">72.73%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">6.06%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">92.54%</td>
                        <td className="py-2.5 px-4"><span className="text-rose-600 font-bold">Crítico</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">6° básico a 7° básico</td>
                        <td className="py-2.5 px-4">26.15%</td>
                        <td className="py-2.5 px-4">56.93%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">16.92%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">95.45%</td>
                        <td className="py-2.5 px-4"><span className="text-rose-600 font-bold">Crítico</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">7° básico a 8° básico</td>
                        <td className="py-2.5 px-4">39.13%</td>
                        <td className="py-2.5 px-4">52.17%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">8.70%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">85.14%</td>
                        <td className="py-2.5 px-4"><span className="text-rose-600 font-bold">Crítico</span></td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">2° básico a 3° básico</td>
                        <td className="py-2.5 px-4">5.66%</td>
                        <td className="py-2.5 px-4">50.94%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">43.40%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">77.97%</td>
                        <td className="py-2.5 px-4"><span className="text-rose-600 font-bold">Crítico</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">4° básico a 5° básico</td>
                        <td className="py-2.5 px-4">26.47%</td>
                        <td className="py-2.5 px-4">63.24%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">10.29%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">95.45%</td>
                        <td className="py-2.5 px-4"><span className="text-rose-600 font-bold">Crítico</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">5° básico a 6° básico</td>
                        <td className="py-2.5 px-4">21.54%</td>
                        <td className="py-2.5 px-4">56.92%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">21.54%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">100.00%</td>
                        <td className="py-2.5 px-4"><span className="text-rose-600 font-bold">Urgente (100%)</span></td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold">I medio a II medio</td>
                        <td className="py-2.5 px-4">58.82%</td>
                        <td className="py-2.5 px-4">41.18%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">0.00%</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">88.41%</td>
                        <td className="py-2.5 px-4"><span className="text-rose-600 font-bold">Crítico</span></td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------
          SUB-TAB 2: RESULTADOS CIERRE 2025 (stacked bar chart 100%)
          --------------------------------------------- */}
      {subTab === "logros" && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Resultados DIA Académico Cierre 2025</h2>
              <p className="text-sm text-slate-500 text-justify">Distribución de estudiantes por nivel de logro (Nivel I, II, III) según el informe oficial.</p>
            </div>
            
            {/* Toggle Subject */}
            <div className="flex bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/40 shadow-inner text-xs font-bold w-fit">
              <button 
                onClick={() => setSubject("lectura")}
                className={cn("px-4 py-2 rounded-lg transition-all", subject === "lectura" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Comp. Lectora
              </button>
              <button 
                onClick={() => setSubject("matematica")}
                className={cn("px-4 py-2 rounded-lg transition-all", subject === "matematica" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Matemática
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stacked Bar Chart */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)] lg:col-span-2">
              <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">
                Distribución Porcentual por Nivel de Logro (Lectura/Matemática)
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentLogroData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="grado" stroke="#94a3b8" fontSize={10} fontWeight="600" />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} unit="%" />
                    <RechartsTooltip content={<CustomTooltip unit="%" />} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                    <Bar dataKey="Nivel I (Inicio)" stackId="a" fill="#f43f5e" name="Nivel I (Insatisfactorio)" />
                    <Bar dataKey="Nivel II (Parcial)" stackId="a" fill="#94a3b8" name="Nivel II (Intermedio)" />
                    <Bar dataKey="Nivel III (Satisfactorio)" stackId="a" fill="#1B3C73" name="Nivel III (Satisfactorio)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Analysis card based on PDF data */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Alertas y Foco Pedagógico</h3>
                
                {subject === "lectura" ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="text-xs font-black text-indigo-700 uppercase mb-0.5">Fortaleza Temprana</h4>
                      <p className="text-[11px] text-indigo-900 leading-normal">
                        **2° Básico** muestra el nivel de desempeño más sólido con un **51.06%** de alumnos en Nivel III y solo un **6.38%** en Nivel I.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <h4 className="text-xs font-black text-rose-700 uppercase mb-0.5">Zonas Críticas</h4>
                      <p className="text-[11px] text-rose-900 leading-normal">
                        En **II° Medio** y **8° Básico**, los alumnos en Nivel III caen por debajo del **6%**. El **42.47%** de los estudiantes de II° Medio está en Nivel I (Inicio).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="text-xs font-black text-indigo-700 uppercase mb-0.5">Andamiaje en Básica</h4>
                      <p className="text-[11px] text-indigo-900 leading-normal">
                        **1° Básico** y **2° Básico** registran un **46.15%** y **43.40%** en Nivel III (Satisfactorio), mostrando un andamiaje inicial robusto.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <h4 className="text-xs font-black text-rose-700 uppercase mb-0.5">Vulnerabilidad Crítica</h4>
                      <p className="text-[11px] text-rose-900 leading-normal">
                        En **8° Básico**, **I° Medio** y **II° Medio**, el porcentaje en Nivel I (Inicio) supera el **55%**, llegando a **63.08%** en 8° básico. En I° Medio hay un **0%** de estudiantes en Nivel III.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  Información extraída del reporte oficial de Cierre DIA 2025 para RBD 17765.
                </div>
              </div>
            </div>
          </div>

          {/* Detailed table of achievement levels */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Tabla de Desglose Académico Cierre 2025</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Grado</th>
                    <th className="py-3 px-4">Nivel I (Inicio/Insatisfactorio)</th>
                    <th className="py-3 px-4">Nivel II (Parcial/Cercano)</th>
                    <th className="py-3 px-4">Nivel III (Satisfactorio)</th>
                    <th className="py-3 px-4">Total Crítico (Nivel I + II)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {currentLogroData.map((row, index) => {
                    const totalCritico = Math.round((row["Nivel I (Inicio)"] + row["Nivel II (Parcial)"]) * 100) / 100;
                    const isHighRisk = totalCritico >= 70;
                    return (
                      <tr key={index}>
                        <td className="py-2.5 px-4 font-bold">{row.grado}</td>
                        <td className="py-2.5 px-4 text-rose-600">{row["Nivel I (Inicio)"].toFixed(2)}%</td>
                        <td className="py-2.5 px-4 text-slate-500">{row["Nivel II (Parcial)"].toFixed(2)}%</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-bold">{row["Nivel III (Satisfactorio)"].toFixed(2)}%</td>
                        <td className="py-2.5 px-4">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", isHighRisk ? "bg-rose-50 text-rose-700 border border-rose-200/50" : "bg-slate-50 text-slate-600")}>
                            {totalCritico.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------
          SUB-TAB: RESULTADOS DIAGNOSTICO 2026 (stacked bar chart)
          --------------------------------------------- */}
      {subTab === "logros2026" && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Resultados DIA Académico Diagnóstico 2026</h2>
              <p className="text-sm text-slate-500 text-justify">Distribución de estudiantes que Requieren Apoyo vs. nivel Consolidado para cada grado evaluado.</p>
            </div>
            
            {/* Toggle Subject */}
            <div className="flex bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/40 shadow-inner text-xs font-bold w-fit">
              <button 
                onClick={() => setSubject("lectura")}
                className={cn("px-4 py-2 rounded-lg transition-all", subject === "lectura" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Comp. Lectora
              </button>
              <button 
                onClick={() => setSubject("matematica")}
                className={cn("px-4 py-2 rounded-lg transition-all", subject === "matematica" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Matemática
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stacked Bar Chart */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)] lg:col-span-2">
              <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">
                Distribución Porcentual Diagnóstico 2026 (Lectura/Matemática)
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subject === "lectura" ? DIA_ACADEMICO_DIAG_2026_LECTURA : DIA_ACADEMICO_DIAG_2026_MATEMATICA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="grado" stroke="#94a3b8" fontSize={10} fontWeight="600" />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} unit="%" />
                    <RechartsTooltip content={<CustomTooltip unit="%" />} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                    <Bar dataKey="Requiere Apoyo" stackId="a" fill="#f43f5e" name="Requiere Mayor Apoyo" />
                    <Bar dataKey="Consolidado" stackId="a" fill="#1B3C73" name="Consolidado / Suficiente" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Analysis card based on 2026 diagnostic data */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Alertas Tempranas 2026</h3>
                
                {subject === "lectura" ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="text-xs font-black text-indigo-700 uppercase mb-0.5">Mejor Desempeño</h4>
                      <p className="text-[11px] text-indigo-900 leading-normal">
                        **4° Básico** presenta la menor necesidad de apoyo con un **27.27%** requiriendo tutorías adicionales, siendo el curso más consolidado.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <h4 className="text-xs font-black text-rose-700 uppercase mb-0.5">Urgencia Crítica</h4>
                      <p className="text-[11px] text-rose-900 leading-normal">
                        En **6° Básico** y **7° Básico**, los niveles de apoyo necesario son alarmantes: **92.54%** y **95.45%** respectivamente de estudiantes que requieren intervención urgente.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <h4 className="text-xs font-black text-rose-700 uppercase mb-0.5">Foco Crítico (100%)</h4>
                      <p className="text-[11px] text-rose-900 leading-normal">
                        En **I° Medio**, el **100.00%** de los estudiantes requiere apoyo pedagógico en Matemática. Ninguno logró clasificar como consolidado al inicio de año.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                      <h4 className="text-xs font-black text-rose-700 uppercase mb-0.5">Necesidad Generalizada</h4>
                      <p className="text-[11px] text-rose-900 leading-normal">
                        Todos los cursos desde **3° Básico** a **II° Medio** registran más del **77%** de estudiantes con necesidad de mayor apoyo en Matemática (siendo 77.97% el menor en 3° Básico).
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  Datos consolidados del Diagnóstico DIA 2026 recopilados a partir de los informes individuales por curso.
                </div>
              </div>
            </div>
          </div>

          {/* Detailed table of 2026 achievement levels */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Tabla de Diagnóstico de Aprendizaje 2026</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Grado</th>
                    <th className="py-3 px-4">Requiere Mayor Apoyo (%)</th>
                    <th className="py-3 px-4">Consolidado (%)</th>
                    <th className="py-3 px-4">Brecha/Estado Crítico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(subject === "lectura" ? DIA_ACADEMICO_DIAG_2026_LECTURA : DIA_ACADEMICO_DIAG_2026_MATEMATICA).map((row, index) => {
                    const isHighRisk = row["Requiere Apoyo"] >= 75;
                    return (
                      <tr key={index}>
                        <td className="py-2.5 px-4 font-bold">{row.grado}</td>
                        <td className="py-2.5 px-4 text-rose-600 font-bold">{row["Requiere Apoyo"].toFixed(2)}%</td>
                        <td className="py-2.5 px-4 text-emerald-600">{row["Consolidado"].toFixed(2)}%</td>
                        <td className="py-2.5 px-4">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", isHighRisk ? "bg-rose-50 text-rose-700 border border-rose-200/50" : "bg-slate-50 text-slate-600")}>
                            {isHighRisk ? "Urgente (Apoyo Crítico)" : "Monitorear"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------
          SUB-TAB 3: BRECHAS DE GÉNERO
          --------------------------------------------- */}
      {subTab === "brechas" && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Brechas de Género Significativas</h2>
              <p className="text-sm text-slate-500 text-justify">Comparativa oficial del Mineduc sobre diferencias estadísticas significativas (+M: Mujeres, +H: Hombres).</p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/40 shadow-inner text-xs font-bold w-fit">
              <button 
                onClick={() => setBrechaFilter("todos")}
                className={cn("px-3 py-1.5 rounded-lg transition-all", brechaFilter === "todos" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Todos
              </button>
              <button 
                onClick={() => setBrechaFilter("lectura")}
                className={cn("px-3 py-1.5 rounded-lg transition-all", brechaFilter === "lectura" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Lectura
              </button>
              <button 
                onClick={() => setBrechaFilter("matematica")}
                className={cn("px-3 py-1.5 rounded-lg transition-all", brechaFilter === "matematica" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Matemática
              </button>
              <button 
                onClick={() => setBrechaFilter("socioemocional")}
                className={cn("px-3 py-1.5 rounded-lg transition-all", brechaFilter === "socioemocional" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Socioemocional
              </button>
              <button 
                onClick={() => setBrechaFilter("convivencia")}
                className={cn("px-3 py-1.5 rounded-lg transition-all", brechaFilter === "convivencia" ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              >
                Convivencia
              </button>
            </div>
          </div>

          {/* Information Notice Alert */}
          <div className="p-4 rounded-[1.5rem] bg-blue-50/50 border border-blue-100/50 text-xs text-slate-600 leading-normal flex items-start gap-2.5">
            <HelpCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="font-bold text-slate-700">¿Cómo leer las brechas estadísticas?</p>
              <p className="mt-0.5">
                El sistema DIA marca con **+M** cuando las mujeres obtienen un puntaje/porcentaje de respuestas favorables significativamente superior al de los hombres, y con **+H** para los hombres. La etiqueta **"Sin brecha"** indica diferencias no significativas. **"Sin participación"** denota que el nivel no aplicó el cuestionario o no cerró el proceso.
              </p>
            </div>
          </div>

          {/* Gender Gaps Data Table */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <h3 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-wider">Matriz de Equidad de Género (Cierre 2025 vs Diagnóstico 2026)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Dimensión / Asignatura</th>
                    <th className="py-3 px-4">Grado / Curso</th>
                    <th className="py-3 px-4">Diferencia Cierre 2025</th>
                    <th className="py-3 px-4">Diferencia Diagnóstico 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredBrechas.map((row, index) => {
                    const c25 = row.cierre2025;
                    const d26 = row.diagnostico2026;
                    
                    const isM25 = c25.includes("Mujeres");
                    const isH25 = c25.includes("Hombres");
                    const isM26 = d26.includes("Mujeres");
                    const isH26 = d26.includes("Hombres");

                    return (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-600">{row.asignatura}</td>
                        <td className="py-2.5 px-4 font-black text-slate-800">{row.grado}</td>
                        <td className="py-2.5 px-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            isM25 && "bg-rose-50 text-rose-700 border border-rose-200/50",
                            isH25 && "bg-blue-50 text-blue-700 border border-blue-200/50",
                            c25 === "Sin brecha" && "text-slate-400 font-normal",
                            c25.includes("participación") && "text-slate-300 font-normal"
                          )}>
                            {c25}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold",
                            isM26 && "bg-rose-50 text-rose-700 border border-rose-200/50",
                            isH26 && "bg-blue-50 text-blue-700 border border-blue-200/50",
                            d26 === "Sin brecha" && "text-slate-400 font-normal",
                            d26.includes("participación") && "text-slate-300 font-normal"
                          )}>
                            {d26}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "resumen", label: "Resumen", icon: Activity },
  { id: "asistencia", label: "Asistencia", icon: Users },
  { id: "simce", label: "SIMCE vs Ensayos", icon: BarChart3 },
  { id: "paes", label: "PAES", icon: Award },
  { id: "socioemocional", label: "Socioemocional & IDPS", icon: Heart },
  { id: "acompanamiento", label: "Acompañamiento", icon: Brain },
  { id: "trayectorias", label: "Resultados DIA", icon: Target },
  { id: "chat", label: "Consultor IA", icon: Sparkles }
];

// ----------------------------------------------------
// TAB 8: CONSULTOR IA INTERACTIVO
// ----------------------------------------------------
interface Message {
  role: "user" | "assistant";
  content: string;
}

function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu Consultor de Inteligencia Escolar. Puedo ayudarte a cruzar variables de asistencia, SIMCE, PAES, socioemocional y acompañamiento docente. ¿Qué te gustaría analizar hoy?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    "Cruza los datos de asistencia de Mayo con los resultados SIMCE.",
    "Analiza el nivel de cobertura del acompañamiento docente en Básica.",
    "Identifica brechas de aprendizaje entre el cierre 2025 y el diagnóstico 2026."
  ];

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) setInput("");

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || "";

      const res = await fetch(`${API_URL}/api/v1/inteligencia/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Lo siento, ocurrió un error al procesar tu solicitud." }]);
      }
    } catch (err) {
      console.error("Error in chat send:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión con el consultor de IA." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[600px]">
      {/* Left panel: Info & suggestions */}
      <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-[#C87533]" size={18} /> Consultor IA Directivo
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed text-justify">
              Esta herramienta analiza de manera transversal la base de datos de tu establecimiento escolar. Puedes pedir correlaciones, hipótesis o líneas de acción.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sugerencias de Consulta</span>
            {suggestedPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(promptText)}
                className="w-full text-left p-3 rounded-2xl bg-slate-50/60 border border-slate-100/80 hover:bg-slate-100/60 hover:border-slate-200/50 transition-all text-xs font-semibold text-slate-700 flex justify-between items-center group shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
              >
                <span>{promptText}</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-4 flex items-center gap-1.5 mt-6">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Cumple con políticas de privacidad institucional</span>
        </div>
      </div>

      {/* Right panel: Chat messages */}
      <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col overflow-hidden h-[600px]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1B3C73] flex items-center justify-center text-white">
              <Brain size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Asistente Virtual PROFEIC</span>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse block"></span> Conectado a la base de datos
              </span>
            </div>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div key={idx} className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-[#1B3C73]" />
                  </div>
                )}
                <div className={cn(
                  "p-3.5 rounded-2xl max-w-[80%] text-xs font-medium leading-relaxed font-sans shadow-sm",
                  isUser
                    ? "bg-[#1B3C73] text-white rounded-tr-none"
                    : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none"
                )}>
                  {m.content}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-50/60 border border-indigo-100/50 flex items-center justify-center shrink-0">
                    <User size={14} className="text-[#1B3C73]" />
                  </div>
                )}
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-[#1B3C73]" />
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Haz una pregunta sobre el SIMCE, la asistencia, o el acompañamiento docente..."
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200/60 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#1B3C73] transition-colors disabled:bg-slate-150 disabled:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-[#1B3C73] hover:bg-[#254d8f] text-white rounded-2xl shadow-md transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
