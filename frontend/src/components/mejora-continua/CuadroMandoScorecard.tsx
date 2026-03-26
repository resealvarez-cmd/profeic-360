"use client";

import { StrategicGoal } from "@/types/mejora_continua";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, Target, Zap, ChevronRight, Activity } from "lucide-react";

interface Props {
  goals: StrategicGoal[];
}

export default function CuadroMandoScorecard({ goals }: Props) {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  
  const totalPhases = goals.flatMap(g => g.implementation_phases || []).length;

  const calcGoalProgress = (goal: StrategicGoal) => {
    if (!goal.implementation_phases || goal.implementation_phases.length === 0) return 0;
    const completed = goal.implementation_phases.filter(p => p.status === 'completed').length;
    return Math.round((completed / goal.implementation_phases.length) * 100);
  };

  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + calcGoalProgress(g), 0) / goals.length) 
    : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 px-4 text-[11px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all rounded-lg gap-2 mt-2">
           <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> Ver Scorecard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-slate-50 p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-slate-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                    <PieChart className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Cuadro de Mando Estratégico</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Consolidado Estratégico Institucional</p>
                </div>
            </div>
        </div>

        <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cumplimiento Global</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900">{avgProgress}%</span>
                        <div className={`mb-1.5 flex items-center gap-1 text-[10px] font-bold ${avgProgress > 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            <Zap className="w-3 h-3" /> Estatus
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${avgProgress}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metas Logradas</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900">{completedGoals}</span>
                        <span className="text-sm font-bold text-slate-300 mb-1.5">/ {totalGoals}</span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 italic">Objetivos estratégicos cerrados</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fases Activas</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900">{totalPhases}</span>
                        <Activity className="w-5 h-5 text-blue-400 mb-2" />
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 italic">Acciones técnicas en ejecución</p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Desglose por Estado</h4>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm divide-y divide-slate-50">
                    <div className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-bold text-slate-700">Objetivos Logrados</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black">{completedGoals}</span>
                    </div>
                    <div className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-bold text-slate-700">Objetivos en Curso</span>
                        </div>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">{activeGoals}</span>
                    </div>
                    <div className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            <span className="text-sm font-bold text-slate-700">Pendientes de Inicio</span>
                        </div>
                        <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-xs font-black">{totalGoals - completedGoals - activeGoals}</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-blue-500/20">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Consejo del Copiloto</p>
                    <p className="text-sm font-medium leading-tight max-w-[400px]">
                        {avgProgress < 50 
                            ? "Priorice la activación de fases pendientes en los objetivos de Liderazgo Pedagógico para subir el score global."
                            : "El ritmo de cumplimiento es óptimo. Considere exportar el Informe Ejecutivo para la próxima reunión de concejo."}
                    </p>
                </div>
                <ChevronRight className="w-8 h-8 text-blue-300/50" />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
