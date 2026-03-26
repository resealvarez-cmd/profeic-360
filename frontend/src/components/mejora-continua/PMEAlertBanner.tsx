"use client";

import { StrategicGoal } from "@/types/mejora_continua";
import { AlertTriangle, Bell, Calendar, ChevronRight } from "lucide-react";
import { useMemo } from "react";

interface Props {
  goals: StrategicGoal[];
}

export default function PMEAlertBanner({ goals }: Props) {
  const alerts = useMemo(() => {
    const items: { label: string; type: 'urgent' | 'warning'; date: string }[] = [];
    
    goals.forEach(goal => {
      goal.implementation_phases?.forEach(phase => {
        if (phase.status !== 'completed' && phase.end_date) {
          const end = new Date(phase.end_date);
          const now = new Date();
          const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            items.push({ label: `Atraso Crítico: ${phase.title}`, type: 'urgent', date: phase.end_date });
          } else if (diffDays <= 15) {
            items.push({ label: `Próximo Vencimiento: ${phase.title}`, type: 'warning', date: phase.end_date });
          }
        }
      });
    });
    
    return items.sort((a,b) => (a.type === 'urgent' ? -1 : 1));
  }, [goals]);

  if (alerts.length === 0) return (
      <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Todo al día</span>
      </div>
  );

  const urgentCount = alerts.filter(a => a.type === 'urgent').length;

  return (
    <div className="relative group animate-in fade-in slide-in-from-right-4 duration-500">
        <div className={`flex items-center justify-between gap-4 px-6 py-3 rounded-xl border shadow-sm transition-all duration-300 ${urgentCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${urgentCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {urgentCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <div>
                    <h4 className={`text-xs font-bold ${urgentCount > 0 ? 'text-rose-900' : 'text-amber-900'}`}>
                        Hey! Tienes tareas {urgentCount > 0 ? 'atrasadas' : 'por vencer'}
                    </h4>
                    <p className={`text-[10px] font-medium ${urgentCount > 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                        {urgentCount > 0 
                            ? `Hay ${urgentCount} tareas críticas sin completar.` 
                            : `Tienes ${alerts.length} hitos que vencen pronto.`
                        }
                    </p>
                </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
                {alerts.slice(0, 1).map((alert, i) => (
                    <div key={i} className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[10px] font-bold ${alert.type === 'urgent' ? 'bg-white border-rose-200 text-rose-600' : 'bg-white border-amber-200 text-amber-600'}`}>
                        <Calendar className="w-3 h-3" />
                        {alert.label.length > 20 ? alert.label.substring(0, 17) + '...' : alert.label}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
