"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { Indicator } from "@/types/mejora_continua";
import { Loader2, Save, Pencil, Target, ArrowUpRight } from "lucide-react";
import confeti from 'canvas-confetti';

interface Props {
  indicator: Indicator;
  phaseId: string;
}

export default function ActualizarProgresoModal({ indicator, phaseId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<number>(indicator.current_value);
  const [feedback, setFeedback] = useState("");
  const [decision, setDecision] = useState("Mantener estrategia");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error: indError } = await supabase
        .from("indicators")
        .update({ current_value: currentValue })
        .eq("id", indicator.id);
      
      if (indError) throw indError;

      const { error: cycleError } = await supabase
        .from("iteration_cycles")
        .insert({
          phase_id: phaseId,
          evaluation_notes: feedback || "Actualización de progreso rutinaria",
          decision: decision === "Mantener estrategia" ? "maintain" : decision === "Pivotear (Cambiar enfoque)" ? "pivot" : "scale",
          review_date: new Date().toISOString().split('T')[0]
        });
      
      if (cycleError) throw cycleError;

      setIsOpen(false);
      setFeedback("");
      if (currentValue >= indicator.target_value) {
        confeti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#ffffff']
        });
      }

      window.dispatchEvent(new Event('mejora-continua-updated'));

    } catch (error: any) {
      console.error(error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-white hover:bg-blue-600 rounded-full border border-blue-100 transition-all">
          <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Registrar Avance
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-xl p-0 rounded-xl overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Actualizar Progreso Estratégico</DialogTitle>
          <DialogDescription>Registro de avance y toma de decisiones para el indicador seleccionado.</DialogDescription>
        </DialogHeader>

        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <Target className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Actualización de Logro</span>
                </div>
                <h2 className="text-lg font-bold tracking-tight leading-tight">{indicator.description}</h2>
            </div>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Valor Actual</Label>
                    <div className="relative group/input">
                        <Input 
                            type="text" 
                            inputMode="decimal"
                            className="h-11 text-lg font-black text-slate-900 border-slate-200 bg-slate-50 focus:bg-white focus:ring-blue-500 rounded-lg px-4 transition-all"
                            value={currentValue.toString().replace('.', ',')} 
                            onChange={(e) => {
                                const val = e.target.value.replace(',', '.');
                                if (val === '' || !isNaN(Number(val))) {
                                    setCurrentValue(val === '' ? 0 : Number(val));
                                }
                            }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tight">
                          {indicator.metric_type === 'percentage' ? 'LOGRO %' : (indicator.metric_type || 'VALOR').toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Meta del Periodo</Label>
                    <div className="h-11 flex items-center px-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-lg font-black text-slate-400">{indicator.target_value}</span>
                        <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">
                          {indicator.metric_type === 'percentage' ? '%' : (indicator.metric_type || '')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Notas de Seguimiento (Opcional)</Label>
                <Textarea 
                    placeholder="Describe avances o bloqueadores..."
                    className="min-h-[100px] text-sm font-bold text-slate-900 bg-white border-slate-200 focus:ring-blue-500 placeholder:text-slate-400 rounded-lg p-4 transition-all resize-none shadow-inner"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Curso de Acción</Label>
                <select
                    className="w-full h-11 px-4 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                >
                    <option value="Mantener estrategia">MANTENER ESTRATEGIA ACTUAL</option>
                    <option value="Pivotear (Cambiar enfoque)">PIVOTEAR ENFOQUE</option>
                    <option value="Escalar (Acelerar)">ESCALAR IMPLEMENTACIÓN</option>
                </select>
            </div>

            <div className="flex gap-3 pt-2">
                <Button 
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 h-10 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex-[2] h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar Registro
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
