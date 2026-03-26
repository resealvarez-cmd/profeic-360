"use client";

import { StrategicGoal } from "@/types/mejora_continua";
import { AlertTriangle, Clock, CalendarDays, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  goals: StrategicGoal[];
  profiles: any[];
}

export default function WidgetAtrasos({ goals, profiles }: Props) {
  const hoy = new Date();
  const atrasos: { metaTitle: string; phaseTitle: string; deadline: string; daysLate: number; leaderId?: string }[] = [];

  goals.forEach(goal => {
    if (goal.status === 'completed' || goal.status === 'archived') return;

    goal.implementation_phases?.forEach(phase => {
      if (phase.status === 'completed') return;

      if (phase.end_date) {
        const endDate = new Date(phase.end_date);
        if (endDate < hoy) {
          const diffTime = Math.abs(hoy.getTime() - endDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          atrasos.push({
            metaTitle: goal.title,
            phaseTitle: phase.title,
            deadline: phase.end_date,
            daysLate: diffDays,
            leaderId: phase.leader_id
          });
        }
      }
    });
  });

  if (atrasos.length === 0) {
    return (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-emerald-900 tracking-tight">Gestión Impecable</h3>
                    <p className="text-[10px] text-emerald-700/80 font-medium">No se detectan atrasos en el despliegue estratégico.</p>
                </div>
            </div>
        </div>
    );
  }

  const getLeaderEmail = (id?: string) => {
      if (!id) return "";
      const p = profiles.find(pr => pr.id === id);
      return p ? p.email : "";
  };

  const notifyLeader = (email: string, phaseTitle: string, daysLate: number) => {
      if (!email) {
          alert("Este responsable no tiene un correo válido o no ha sido asignado.");
          return;
      }
      const subject = encodeURIComponent(`ALERTA: Atraso en la fase "${phaseTitle}" — Mejorando Juntos`);
      const body = encodeURIComponent(`Hola,\n\nTe escribo porque el sistema me alerta que la fase de implementación "${phaseTitle}" lleva ${daysLate} días de atraso respecto a su fecha límite planificada.\n\nPor favor, ingresa a la plataforma ProfeIC para actualizar tus indicadores o registrar los motivos del atraso en la bitácora.\n\nSaludos.`);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-rose-50 border border-rose-100 rounded-xl p-5 mb-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div>
              <h3 className="text-sm font-bold text-rose-900 tracking-tight">Alertas de Desviación Estratégica</h3>
              <p className="text-[10px] text-rose-700/80 font-medium uppercase tracking-widest">{atrasos.length} Fases con Atraso Crítico</p>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {atrasos.map((atraso, idx) => {
          const email = getLeaderEmail(atraso.leaderId);
          return (
          <div key={idx} className="bg-white rounded-xl p-4 border border-rose-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tight truncate" title={atraso.metaTitle}>{atraso.metaTitle}</p>
              <h4 className="text-xs font-bold text-slate-800 leading-snug">{atraso.phaseTitle}</h4>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between text-[10px] mb-3">
                  <span className="text-slate-500 flex items-center gap-1 font-bold">
                    <CalendarDays className="w-3 h-3" /> {atraso.deadline}
                  </span>
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-lg">
                    -{atraso.daysLate} d
                  </span>
                </div>
                
                <Button 
                  onClick={() => notifyLeader(email, atraso.phaseTitle, atraso.daysLate)}
                  disabled={!email}
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-[10px] font-bold gap-2 rounded-lg border-slate-200 hover:bg-slate-50"
                >
                  <Mail className="w-3 h-3" /> Notificar
                </Button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
