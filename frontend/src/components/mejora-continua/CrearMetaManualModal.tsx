"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2, Save, Loader2, Target, X } from "lucide-react";

export default function CrearMetaManualModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado completo del formulario manual
  const [goal, setGoal] = useState({
    title: "",
    description: "",
    phases: [
      {
        id: crypto.randomUUID(),
        title: "",
        leader_id: "",
        indicators: [
          {
            id: crypto.randomUUID(),
            description: "",
            target_value: 100,
            metric_type: "percentage",
            data_source: "manual"
          }
        ]
      }
    ]
  });

  useEffect(() => {
    async function loadProfiles() {
      const { data: authUsers } = await supabase.from('authorized_users').select('email').in('role', ['admin', 'director', 'utp']);
      const emails = authUsers?.map(u => u.email) || [];
      const { data, error } = await supabase.from('profiles').select('id, full_name, email').in('email', emails).order('full_name');
      if (!error && data) {
        setProfiles(data);
      }
    }
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  const addPhase = () => {
    setGoal(prev => ({
      ...prev,
      phases: [
        ...prev.phases,
        {
          id: crypto.randomUUID(),
          title: "",
          leader_id: "",
          indicators: [
            { id: crypto.randomUUID(), description: "", target_value: 100, metric_type: "percentage", data_source: "manual"}
          ]
        }
      ]
    }));
  };

  const removePhase = (phaseId: string) => {
    setGoal(prev => ({
      ...prev,
      phases: prev.phases.filter(p => p.id !== phaseId)
    }));
  };

  const addIndicator = (phaseId: string) => {
    const newPhases = goal.phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          indicators: [
            ...p.indicators,
            { id: crypto.randomUUID(), description: "", target_value: 100, metric_type: "percentage", data_source: "manual" }
          ]
        }
      }
      return p;
    });
    setGoal({...goal, phases: newPhases});
  };

  const removeIndicator = (phaseId: string, indId: string) => {
    const newPhases = goal.phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          indicators: p.indicators.filter(i => i.id !== indId)
        }
      }
      return p;
    });
    setGoal({...goal, phases: newPhases});
  };

  const updatePhase = (phaseId: string, field: string, value: any) => {
    setGoal(prev => ({
      ...prev,
      phases: prev.phases.map(p => p.id === phaseId ? { ...p, [field]: value } : p)
    }));
  };

  const updateIndicator = (phaseId: string, indId: string, field: string, value: any) => {
    setGoal(prev => ({
      ...prev,
      phases: prev.phases.map(p => {
        if (p.id === phaseId) {
          return {
            ...p,
            indicators: p.indicators.map(i => i.id === indId ? { ...i, [field]: value } : i)
          }
        }
        return p;
      })
    }));
  };

  const handleGuardar = async () => {
    if (!goal.title.trim()) {
      alert("Por favor, ponle un título a la meta.");
      return;
    }
    setIsSaving(true);
    try {
      // 1. Insert Strategic Goal
      const { data: goalData, error: goalError } = await supabase
        .from("strategic_goals")
        .insert({
          title: goal.title,
          description: goal.description,
          status: "active",
          academic_year: new Date().getFullYear(),
        })
        .select()
        .single();
        
      if (goalError) throw goalError;
      const goalId = goalData.id;

      // 2. Iterate and insert Phases
      for (const phase of goal.phases) {
        if (!phase.title.trim()) continue; // Skip empty phases
        const { data: phaseData, error: phaseError } = await supabase
          .from("implementation_phases")
          .insert({
            goal_id: goalId,
            title: phase.title,
            leader_id: phase.leader_id || null, // Perfil de la base de datos
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
            status: "pending",
          })
          .select()
          .single();

        if (phaseError) throw phaseError;
        const phaseId = phaseData.id;

        // 3. Insert Indicators
        const validIndicators = phase.indicators.filter(i => i.description.trim() !== "");
        if (validIndicators.length > 0) {
          const indicatorsToInsert = validIndicators.map((ind: any) => ({
            phase_id: phaseId,
            description: ind.description,
            target_value: Number(ind.target_value),
            current_value: 0,
            metric_type: ind.metric_type,
            data_source: ind.data_source
          }));
          const { error: indError } = await supabase.from("indicators").insert(indicatorsToInsert);
          if (indError) throw indError;
        }
      }

      alert("¡Meta estratégica creada manualmente!");
      setIsOpen(false);
      window.dispatchEvent(new Event('mejora-continua-updated'));

      // Reseteamos
      setGoal({
          title: "", description: "", phases: [{
              id: crypto.randomUUID(), title: "", leader_id: "", indicators: [
                  { id: crypto.randomUUID(), description: "", target_value: 100, metric_type: "percentage", data_source: "manual" }
              ]
          }]
      });

    } catch (error) {
      console.error("Error guardando manual en Supabase:", error);
      alert("Hubo un error al guardar la meta en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 px-3 text-[11px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all rounded-lg gap-2">
          <Plus className="w-3.5 h-3.5" /> Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-2xl p-0 rounded-xl overflow-hidden">
        <div className="bg-slate-900 px-6 py-6 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full"></div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Nueva Meta Institucional</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestión Manual PME</p>
                </div>
            </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
              <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">Objetivo General</Label>
                  <Input 
                      value={goal.title} 
                      onChange={(e) => setGoal({...goal, title: e.target.value})}
                      className="h-11 font-black text-slate-900 bg-white border-slate-200 focus:ring-emerald-500 rounded-lg px-4"
                      placeholder="Ej: Fortalecer el liderazgo pedagógico..."
                  />
              </div>
              
              <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 ml-1">Descripción del Logro</Label>
                  <Textarea 
                      value={goal.description}
                      onChange={(e) => setGoal({...goal, description: e.target.value})}
                      className="min-h-[100px] text-sm font-bold text-slate-900 bg-white border-slate-200 focus:ring-emerald-500 rounded-lg p-4 resize-none shadow-inner"
                      placeholder="Describe el impacto esperado..."
                  />
              </div>
          </div>

          <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Despliegue de Fases</h3>
                  <Button onClick={addPhase} variant="ghost" size="sm" className="gap-2 text-blue-600 hover:bg-blue-50 rounded-full px-4 font-black uppercase text-[9px] tracking-widest">
                      <Plus className="w-4 h-4" /> Añadir Fase
                  </Button>
              </div>

              {goal.phases.map((phase, pIdx) => (
                  <div key={phase.id} className="relative bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                      {goal.phases.length > 1 && (
                          <button onClick={() => removePhase(phase.id)} className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 className="w-5 h-5" />
                          </button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fase 0{pIdx + 1}</Label>
                              <Input 
                                  value={phase.title}
                                  onChange={(e) => updatePhase(phase.id, 'title', e.target.value)}
                                  className="h-12 font-bold text-slate-900 bg-white border-slate-200 focus:ring-blue-500 rounded-xl px-4"
                                  placeholder="Nombre de la fase..."
                              />
                          </div>
                          <div className="space-y-3">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Líder Responsable</Label>
                              <select 
                                  className="w-full h-12 px-4 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                                  value={phase.leader_id}
                                  onChange={(e) => updatePhase(phase.id, 'leader_id', e.target.value)}
                              >
                                  <option value="">SELECCIONAR RESPONSABLE</option>
                                  {profiles.map(p => (
                                      <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                      
                      <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Indicadores de Éxito</Label>
                              <Button onClick={() => addIndicator(phase.id)} variant="ghost" size="sm" className="h-8 px-3 text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-50 rounded-full">
                                  + Nuevo Indicador
                              </Button>
                          </div>
                          
                          <div className="space-y-2">
                              {phase.indicators.map((ind, iIdx) => (
                                  <div key={ind.id} className="flex flex-col md:flex-row gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative group">
                                      <Input 
                                          className="h-10 text-sm font-bold text-slate-900 border-transparent bg-transparent focus:bg-slate-50 transition-all flex-1"
                                          placeholder={`Indicador ${iIdx + 1}...`}
                                          value={ind.description}
                                          onChange={(e) => updateIndicator(phase.id, ind.id, 'description', e.target.value)}
                                      />
                                      <div className="flex gap-2 items-center">
                                          <Input 
                                              type="number"
                                              className="h-10 w-24 text-sm font-black text-slate-900 border-slate-100 bg-slate-50 text-center"
                                              value={ind.target_value}
                                              onChange={(e) => updateIndicator(phase.id, ind.id, 'target_value', e.target.value)}
                                          />
                                          <select 
                                              className="h-10 px-3 text-[10px] font-black text-slate-500 bg-slate-50 rounded-lg outline-none uppercase"
                                              value={ind.metric_type}
                                              onChange={(e) => updateIndicator(phase.id, ind.id, 'metric_type', e.target.value)}
                                          >
                                              <option value="percentage">%</option>
                                              <option value="count">#</option>
                                              <option value="average_score">★</option>
                                          </select>
                                          {phase.indicators.length > 1 && (
                                              <button onClick={() => removeIndicator(phase.id, ind.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                  <X className="w-4 h-4" />
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
          </div>

          <div className="flex gap-4 pt-6">
            <Button 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
                className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100"
            >
                Descartar
            </Button>
            <Button 
                onClick={handleGuardar} 
                disabled={isSaving || !goal.title.trim()}
                className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "PROCESANDO..." : "CONSOLIDAR ESTRATEGIA"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
