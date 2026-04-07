"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, DollarSign, Activity, ChevronRight, BarChart3, AlertCircle, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const DIMENSIONS = [
  "Gestión Pedagógica",
  "Liderazgo",
  "Convivencia Escolar",
  "Gestión de Recursos",
];

export default function PMEDashboardBeta() {
  const [actions, setActions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [institutionalInfo, setInstitutionalInfo] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 0. Fetch Institutional Info (Finances & Identity)
      const { data: info } = await supabase.from("pme_institutional_info").select("*").eq("academic_year", 2026).maybeSingle();
      setInstitutionalInfo(info);

      // 1. Fetch pme_actions
      const { data: pmeData } = await supabase.from("pme_actions").select("*").order("title");
      
      // 2. Fetch strategic_goals that have a pme_action_link
      const { data: goalsData } = await supabase.from("strategic_goals")
        .select("*")
        .not("pme_action_link", "is", null);

      // 3. Fetch related phases and indicators for linked goals
      if (goalsData && goalsData.length > 0) {
        const goalIds = goalsData.map(g => g.id);
        const { data: phasesData } = await supabase.from("implementation_phases")
          .select("*, profiles(full_name, email)")
          .in("goal_id", goalIds);
          
        if (phasesData && phasesData.length > 0) {
          const phaseIds = phasesData.map(p => p.id);
          const { data: indData } = await supabase.from("indicators")
            .select("*")
            .in("phase_id", phaseIds);
          setIndicators(indData || []);
        }
        setPhases(phasesData || []);
      }
      
      setActions(pmeData || []);
      setGoals(goalsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAiAnalysis = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      // This endpoint needs to be implemented in backend as per task 5
      const res = await fetch(`${baseUrl}/api/v1/pme/analisis-progreso`);
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/api/v1/pme/exportar`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Evidencia_Cumplimiento_PME.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Error al generar la exportación.");
    } finally {
      setIsExporting(false);
    }
  };

  const getGoalsForAction = (actionId: string) => {
    return goals.filter(g => g.pme_action_link === actionId);
  };

  const calculateActionProgress = (actionId: string) => {
    const linkedGoals = getGoalsForAction(actionId);
    if (linkedGoals.length === 0) return null; // No goals linked, no progress calculation

    let totalProgress = 0;
    let count = 0;

    linkedGoals.forEach(goal => {
      const goalPhases = phases.filter(p => p.goal_id === goal.id);
      goalPhases.forEach(phase => {
        const phaseInds = indicators.filter(i => i.phase_id === phase.id);
        phaseInds.forEach(ind => {
          if (ind.target_value > 0) {
            totalProgress += Math.min(100, (ind.current_value / ind.target_value) * 100);
            count++;
          }
        });
      });
    });

    return count === 0 ? 0 : Math.round(totalProgress / count);
  };

  const getSemaphoreColor = (progress: number | null) => {
    if (progress === null) return "bg-slate-100 border-slate-200 text-slate-400";
    if (progress < 40) return "bg-rose-100 border-rose-300 text-rose-700 shadow-sm";
    if (progress < 80) return "bg-amber-100 border-amber-300 text-amber-700 shadow-sm";
    return "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm";
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header and Alerts */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tablero Estratégico PME</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Puente Operativo-Estratégico en Tiempo Real</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadAiAnalysis} className="font-bold border-blue-200 text-blue-700 hover:bg-blue-50">
            <SparklesIcon className="w-4 h-4 mr-2" /> Auditar Ritmo P/M
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Exportar Evidencia
          </Button>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest mb-1">Alerta Ejecutiva (AI)</h4>
            <p className="text-amber-800 text-sm font-medium leading-relaxed">{aiAnalysis.alerta || aiAnalysis.message || "Análisis completado."}</p>
          </div>
        </div>
      )}

      {/* Top Zone: Presupuesto e Identidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SEP Asignado</p>
          <div className="flex items-center text-3xl font-black text-slate-900 leading-none">
            <DollarSign className="w-6 h-6 text-rose-500 mr-1" />
            {institutionalInfo ? (institutionalInfo.budget_sep / 1000000).toFixed(1) + 'M' : '0.0M'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PIE Asignado</p>
          <div className="flex items-center text-3xl font-black text-slate-900 leading-none">
            <DollarSign className="w-6 h-6 text-blue-500 mr-1" />
             {institutionalInfo ? (institutionalInfo.budget_pie / 1000000).toFixed(1) + 'M' : '0.0M'}
          </div>
        </div>
        <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner flex flex-col justify-center">
            <div className="flex items-center gap-3">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Misión Institucional</span>
                    <p className="text-xs font-bold text-slate-600 italic line-clamp-2 mt-1 leading-relaxed">
                        "{institutionalInfo?.mission || 'Carga el PME para definir la misión'}"
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Middle Zone: 4 Dimensones */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {DIMENSIONS.map(dim => {
            const dimActions = actions.filter(a => a.dimension === dim);
            return (
              <div key={dim} className="space-y-4">
                <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-md">
                  <h3 className="font-black text-xs uppercase tracking-widest text-center">{dim}</h3>
                </div>
                
                <div className="space-y-4">
                  {dimActions.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs font-bold">
                      Sin acciones oficiales
                    </div>
                  ) : (
                    dimActions.map(action => {
                      const linkedGoals = getGoalsForAction(action.id);
                      const progress = calculateActionProgress(action.id);
                      const semColor = getSemaphoreColor(progress);

                      return (
                        <Sheet key={action.id}>
                          <SheetTrigger asChild>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden text-left w-full group">
                              {progress !== null && (
                                <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[9px] font-black ${semColor}`}>
                                  {progress}%
                                </div>
                              )}
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">PME Oficial</p>
                              <h4 className="font-black text-sm text-slate-800 leading-tight mb-4 group-hover:text-blue-700 transition-colors">{action.title}</h4>
                              
                              <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                                <span className="text-[10px] font-bold text-slate-500 flex items-center">
                                  <Activity className="w-3 h-3 mr-1" /> {linkedGoals.length} Metas Vinculadas
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                              </div>
                            </div>
                          </SheetTrigger>
                          <SheetContent className="sm:max-w-2xl overflow-y-auto px-6 py-8 border-l border-slate-200 shadow-2xl bg-white">
                            <SheetHeader className="mb-8">
                              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-600 mb-2">Despliegue Operativo</p>
                              <SheetTitle className="text-xl font-black text-slate-900 leading-tight">{action.title}</SheetTitle>
                            </SheetHeader>
                            
                            <div className="space-y-8">
                              {linkedGoals.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                  <p className="text-sm font-bold text-slate-500">No hay metas operativas diarias ("Mejorando Juntos") vinculadas a esta acción del PME.</p>
                                </div>
                              ) : (
                                linkedGoals.map((goal, idx) => {
                                  const goalPhases = phases.filter(p => p.goal_id === goal.id);
                                  return (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                                      <h5 className="font-black text-slate-900 text-lg mb-2">{goal.title}</h5>
                                      <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">{goal.description}</p>
                                      
                                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                        {goalPhases.map((phase) => {
                                          const phaseInds = indicators.filter(i => i.phase_id === phase.id);
                                          return (
                                            <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                              <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10"></div>
                                              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm group-hover:border-blue-200 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                  <h6 className="font-bold text-xs text-slate-900">{phase.title}</h6>
                                                </div>
                                                {phase.profiles && (
                                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Responsable: {phase.profiles.full_name || phase.profiles.email}</p>
                                                )}
                                                
                                                <div className="space-y-2 mt-2 pt-2 border-t border-slate-50">
                                                  {phaseInds.length === 0 ? (
                                                    <span className="text-[9px] text-slate-400">Sin indicadores</span>
                                                  ) : (
                                                    phaseInds.map(ind => (
                                                      <div key={ind.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                                        <span className="text-[10px] font-medium text-slate-600 truncate mr-2">{ind.description}</span>
                                                        <span className="text-[10px] font-black text-slate-900">{ind.current_value}/{ind.target_value}</span>
                                                      </div>
                                                    ))
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      );
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
