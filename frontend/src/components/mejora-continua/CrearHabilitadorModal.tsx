"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Loader2, Save, Clock, GraduationCap, Laptop, Package } from "lucide-react";

interface Props {
  phaseId: string;
}

export default function CrearHabilitadorModal({ phaseId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState<'time' | 'training' | 'technology' | 'material'>('time');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!description.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("enablers")
        .insert({
          phase_id: phaseId,
          resource_type: resourceType,
          description: description,
          status: 'requested',
          estimated_cost: estimatedCost || 0
        });
      
      if (error) throw error;

      setIsOpen(false);
      setDescription("");
      setEstimatedCost(0);
      window.dispatchEvent(new Event('mejora-continua-updated'));

    } catch (error: any) {
      console.error(error);
      alert(`Error al guardar recurso: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
          <Plus className="w-3 h-3 mr-1" /> Nuevo Recurso
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] bg-white border-none shadow-2xl p-0 rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Package size={80} />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">Solicitar Habilitador</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-medium mt-1">
            Define el recurso estratégico necesario para habilitar esta fase de implementación.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4 text-slate-900">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo de Recurso</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'time', label: 'Tiempo / HH', icon: <Clock size={14} /> },
                  { id: 'training', label: 'Capacitación', icon: <GraduationCap size={14} /> },
                  { id: 'technology', label: 'Tecnología', icon: <Laptop size={14} /> },
                  { id: 'material', label: 'Insumos', icon: <Package size={14} /> }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setResourceType(t.id as any)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${resourceType === t.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-blue-200'}`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Descripción del Requerimiento</Label>
              <Input 
                placeholder="Ej: Licencias para 20 docentes, 4 horas de relatoría..." 
                className="h-12 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-xl px-4 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2 text-slate-900">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Inversión Estimada (CLP)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <Input 
                  type="number" 
                  step="1000"
                  className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 font-black text-lg rounded-xl focus:ring-blue-500"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 h-11 rounded-xl text-xs font-bold text-slate-400">Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !description} className="flex-[2] h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-blue-500/20">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Solicitar Recurso
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
