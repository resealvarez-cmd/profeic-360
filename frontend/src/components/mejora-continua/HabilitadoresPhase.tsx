"use client";

import { Enabler } from "@/types/mejora_continua";
import { 
  Clock, 
  GraduationCap, 
  Laptop, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Hourglass 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import CrearHabilitadorModal from "./CrearHabilitadorModal";
import EditarHabilitadorModal from "./EditarHabilitadorModal";

interface Props {
  phaseId: string;
  enablers?: Enabler[];
}

export default function HabilitadoresPhase({ phaseId, enablers = [] }: Props) {
  const { isDirectivo } = useAuth();
  const canEdit = isDirectivo;

  if (enablers.length === 0) {
    return (
      <div className="pt-4 border-t border-slate-100 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Habilitadores y Recursos</span>
          {canEdit && <CrearHabilitadorModal phaseId={phaseId} />}
        </div>
        <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">No hay recursos solicitados aún</p>
        </div>
      </div>
    );
  }

  const getIcon = (type?: string) => {
    switch (type) {
      case 'time': return <Clock className="w-3.5 h-3.5" />;
      case 'training': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'technology': return <Laptop className="w-3.5 h-3.5" />;
      case 'material': return <Package className="w-3.5 h-3.5" />;
      default: return <Package className="w-3.5 h-3.5" />;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'provided': 
        return { 
          label: 'Disponible', 
          color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          icon: <CheckCircle2 className="w-3 h-3" />
        };
      case 'approved': 
        return { 
          label: 'Aprobado', 
          color: 'text-blue-600 bg-blue-50 border-blue-100',
          icon: <Hourglass className="w-3 h-3" />
        };
      case 'requested': 
        return { 
          label: 'Solicitado', 
          color: 'text-amber-600 bg-amber-50 border-amber-100',
          icon: <AlertCircle className="w-3 h-3" />
        };
      default: 
        return { 
          label: 'Pendiente', 
          color: 'text-slate-500 bg-slate-50 border-slate-100',
          icon: <AlertCircle className="w-3 h-3" />
        };
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t border-slate-100 mt-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Habilitadores y Recursos</span>
        {canEdit && <CrearHabilitadorModal phaseId={phaseId} />}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {enablers.map((enabler) => {
          const status = getStatusInfo(enabler.status);
          return (
            <div key={enabler.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-blue-400 transition-all duration-300">
                  {getIcon(enabler.resource_type)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{enabler.description}</p>
                  <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter mt-0.5">
                    {enabler.resource_type === 'time' ? 'Tiempo' : enabler.resource_type === 'training' ? 'Capacitación' : enabler.resource_type === 'technology' ? 'Tecnología' : 'Materiales'}
                    {enabler.estimated_cost && ` • Est: $${enabler.estimated_cost.toLocaleString('es-CL')}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canEdit && <EditarHabilitadorModal enabler={enabler} />}
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${status.color}`}>
                  {status.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
