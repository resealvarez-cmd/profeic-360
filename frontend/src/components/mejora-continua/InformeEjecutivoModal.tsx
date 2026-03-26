"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Sparkles, 
  FileDown, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Target,
  Zap
} from "lucide-react";

interface InformeJSON {
  health_status: "Crítico" | "Estable" | "Óptimo";
  health_score: number;
  executive_summary: string;
  critical_alerts: Array<{ title: string; description: string }>;
  strategic_recommendations: Array<{ action: string; detail: string }>;
  positive_highlights: string[];
  pending_tasks: Array<{ task: string; responsible: string }>;
}

export default function InformeEjecutivoModal({ dashboardData }: { dashboardData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [informe, setInforme] = useState<InformeJSON | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setInforme(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/api/v1/mejora-continua/generar-informe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dashboardData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Error de servidor" }));
        throw new Error(errorData.detail || "Fallo la generación del informe");
      }

      const data = await res.json();
      setInforme(data);
    } catch (error: any) {
      console.error(error);
      alert(`Error IA: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Óptimo": return "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-500/10";
      case "Estable": return "bg-amber-50 text-amber-600 border-amber-200 ring-amber-500/10";
      case "Crítico": return "bg-rose-50 text-rose-600 border-rose-200 ring-rose-500/10";
      default: return "bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/10";
    }
  };

  const handleDownloadWord = async () => {
    if (!informe) return;
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${baseUrl}/api/v1/mejora-continua/descargar-word`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ informe, dashboard_data: dashboardData }),
        });
        if (!response.ok) throw new Error("Fallo descarga word");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Informe_Directivo_MejorandoJuntos_${new Date().toISOString().split('T')[0]}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        alert("Error al descargar archivo oficial Word.");
    }
  };

  // Helper para el Gauge de Salud
  const HealthGauge = ({ score, status }: { score: number, status: string }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const halfCircumference = circumference / 2;
    const offset = halfCircumference - (score / 100) * halfCircumference;
    
    const getColor = (s: string) => {
        if (s === "Óptimo") return "#10b981";
        if (s === "Estable") return "#f59e0b";
        return "#ef4444";
    };

    return (
      <div className="relative flex flex-col items-center justify-center">
        <svg width="180" height="100" className="rotate-0">
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke={getColor(status)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            style={{ 
                strokeDashoffset: offset,
                transition: "stroke-dashoffset 1.5s ease-in-out"
            }}
          />
        </svg>
        <div className="absolute top-12 text-center">
          <span className="text-4xl font-black text-slate-900 leading-none">{score}</span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Score</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-black text-white gap-2 border-none shadow-md transition-all active:scale-95 rounded-xl px-6 h-11">
          <Sparkles className="w-4 h-4 text-amber-400" /> Informe Ejecutivo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[850px] max-h-[92vh] flex flex-col bg-white border border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl">
        {/* Header Premium con Logo SVG */}
        <DialogHeader className="p-8 pb-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
          <div className="flex gap-4 items-center">
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center">
               <img src="/logo_profeic.svg" alt="ProfeIC" className="h-10 w-auto" />
            </div>
            <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Informe Directivo Estratégico
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded-full border border-blue-100">Mejorando Juntos</span>
              </DialogTitle>
              <p className="text-slate-500 text-xs font-medium mt-0.5">
                Powered by Gemini 2.5 Flash · Análisis de Gestión de Centro
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generado el</p>
                <p className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString('es-CL')}</p>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          {!informe && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                <Target className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Auditoría Institucional Copilot</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8 text-base leading-relaxed">
                Descubra cuellos de botella, asigne responsabilidades críticas y obtenga un score de salud de su plan <b>Mejorando Juntos</b> en segundos.
              </p>
              <Button 
                onClick={handleGenerate} 
                className="bg-slate-900 hover:bg-black text-white h-12 px-10 text-base font-bold rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-amber-400" /> Generar Informe Directivo
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/logo_profeic.svg" className="w-10 h-10 animate-pulse" alt="..." />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 tracking-tight">Procesando métricas institucionales...</p>
                <p className="text-slate-400 text-sm mt-1 animate-pulse italic">Consultando con la Inteligencia Artificial</p>
              </div>
            </div>
          )}

          {informe && !isLoading && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* HERO: METRICAS VISUALES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                    <HealthGauge score={informe.health_score} status={informe.health_status} />
                    <div className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusBadge(informe.health_status)}`}>
                        Nivel de Salud: {informe.health_status}
                    </div>
                </section>

                <section className="md:col-span-2 bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <h4 className="uppercase tracking-[0.2em] text-[10px] font-black text-orange-400 mb-2">
                      Insight Directivo (IA)
                    </h4>
                    <p className="text-base text-white font-bold leading-relaxed pr-6">
                      {informe.executive_summary}
                    </p>
                </section>
              </div>

              {/* MONITOREO DE TAREAS PENDIENTES */}
              <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h4 className="uppercase tracking-[0.15em] text-[10px] font-bold text-slate-500 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" /> Monitoreo Operativo: Pendientes y Responsables
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-100">Acción Requerida</span>
                </div>
                <div className="divide-y divide-slate-50">
                    {informe.pending_tasks && informe.pending_tasks.length > 0 ? (
                        informe.pending_tasks.map((task, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-amber-400 transition-colors"></div>
                                    <p className="text-sm font-semibold text-slate-700">{task.task}</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                    <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] text-white font-bold">
                                        {task.responsible.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-slate-600">{task.responsible}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">No se identificaron tareas críticas pendientes.</div>
                    )}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alertas Críticas */}
                <section>
                  <h4 className="uppercase tracking-[0.15em] text-[10px] font-bold text-slate-400 mb-4 flex items-center gap-2 px-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500" /> Riesgos de Implementación
                  </h4>
                  <div className="space-y-3">
                    {informe.critical_alerts.map((alert, i) => (
                      <div key={i} className="group flex gap-4 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:border-rose-200 transition-all hover:shadow-md">
                        <div className="bg-rose-50 p-2.5 rounded-2xl h-fit">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{alert.title}</h5>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recomendaciones */}
                <section>
                  <h4 className="uppercase tracking-[0.15em] text-[10px] font-bold text-slate-400 mb-4 flex items-center gap-2 px-1">
                    <TrendingUp className="w-3 h-3 text-indigo-500" /> Recomendaciones Estratégicas
                  </h4>
                  <div className="space-y-3">
                    {informe.strategic_recommendations.map((rec, i) => (
                      <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-all shadow-sm flex items-start gap-4">
                        <div className="mt-0.5 bg-indigo-50 p-2 rounded-2xl">
                          <CheckCircle className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{rec.action}</h5>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{rec.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Logros (Bloque Verde Suave) */}
              {informe.positive_highlights.length > 0 && (
                <section>
                  <h4 className="uppercase tracking-[0.15em] text-[10px] font-bold text-slate-400 mb-4 px-1">
                    Hitos y Logros Alcanzados
                  </h4>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      {informe.positive_highlights.map((highlight, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm font-semibold text-emerald-900 leading-tight">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center sm:px-10">
          {informe && !isLoading ? (
            <>
              <Button 
                variant="ghost" 
                className="text-slate-500 hover:text-slate-900 font-semibold px-4 rounded-xl transition-colors" 
                onClick={handleGenerate}
              >
                Actualizar Datos
              </Button>
              <div className="flex gap-3">
                <Button 
                    className="bg-slate-900 hover:bg-black text-white px-8 h-12 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-2 font-bold transition-all hover:-translate-y-0.5 active:scale-95" 
                    onClick={handleDownloadWord}
                >
                    <FileDown className="w-5 h-5" /> Exportar Word Oficial
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
               <Button variant="ghost" className="text-slate-400 hover:bg-slate-50 rounded-xl" onClick={() => setIsOpen(false)}>Cerrar Panel</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
