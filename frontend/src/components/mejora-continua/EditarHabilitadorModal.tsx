"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { Enabler } from "@/types/mejora_continua";
import { Loader2, Save, Pencil, Trash2, CheckCircle2, Clock, Hourglass } from "lucide-react";

interface Props {
  enabler: Enabler;
}

export default function EditarHabilitadorModal({ enabler }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState(enabler.description);
  const [status, setStatus] = useState(enabler.status);
  const [estimatedCost, setEstimatedCost] = useState<number>(enabler.estimated_cost || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("enablers")
        .update({
          status: status,
          estimated_cost: estimatedCost,
          description: description
        })
        .eq("id", enabler.id);
      
      if (error) throw error;
      setIsOpen(false);
      window.dispatchEvent(new Event('mejora-continua-updated'));
    } catch (error: any) {
      console.error(error);
      alert(`Error al actualizar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este recurso?")) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("enablers").delete().eq("id", enabler.id);
      if (error) throw error;
      setIsOpen(false);
      window.dispatchEvent(new Event('mejora-continua-updated'));
    } catch (error: any) {
      console.error(error);
      alert(`Error al eliminar: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg hover:bg-blue-50">
          <Pencil className="w-3 h-3" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] bg-white border-none shadow-2xl p-0 rounded-2xl overflow-hidden">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <DialogTitle className="text-xl font-bold tracking-tight">Gestionar Recurso</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-medium mt-1">
            Actualiza el estado de adquisición o la inversión proyectada.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</Label>
              <Input 
                className="h-11 bg-slate-50 border-slate-200 text-slate-900 font-bold rounded-xl px-4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Estado de Provisión</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'requested', label: 'Solicitado', icon: <Clock size={12} />, color: 'blue' },
                  { id: 'approved', label: 'Aprobado', icon: <Hourglass size={12} />, color: 'amber' },
                  { id: 'provided', label: 'Provisto', icon: <CheckCircle2 size={12} />, color: 'emerald' }
                ].map((s) => {
                  const isActive = status === s.id;
                  const activeClasses = {
                    blue: "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20",
                    amber: "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-500/20",
                    emerald: "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  }[s.color as 'blue' | 'amber' | 'emerald'];

                  return (
                    <button
                      key={s.id}
                      onClick={() => setStatus(s.id as any)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${isActive ? activeClasses : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-blue-200'}`}
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Inversión Final / Estimada</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <Input 
                  type="number" 
                  className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 font-black text-lg rounded-xl"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={handleDelete} className="w-11 h-11 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200">
               {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 h-11 rounded-xl text-xs font-bold text-slate-400">Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !description} className="flex-[2] h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Actualizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
