"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, Loader2, Save, Target, User, ChevronRight, X } from "lucide-react";

export default function CopilotoMejoraModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [desafio, setDesafio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [propuesta, setPropuesta] = useState<any | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  
  // Novedades PME
  const [pmeActions, setPmeActions] = useState<any[]>([]);
  const [selectedPmeAction, setSelectedPmeAction] = useState<string>("");
  const [schoolId, setSchoolId] = useState<string | null>(null);

  // Fetch profiles and PME actions
  useEffect(() => {
    async function loadData() {
      const { data: authUsers } = await supabase.from('authorized_users').select('email').in('role', ['admin', 'director', 'utp']);
      const emails = authUsers?.map(u => u.email) || [];
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name, email').in('email', emails).order('full_name');
      if (profilesData) setProfiles(profilesData);

      // Fetch PME actions
      const { data: pmeData } = await supabase.from('pme_actions').select('id, title, dimension').order('title');
      if (pmeData) setPmeActions(pmeData);

      // Fetch user profile for school_id
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', session.user.id).single();
        if (profile) setSchoolId(profile.school_id);
      }
    }
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleEstructurar = async () => {
    if (!desafio.trim()) return;
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/api/v1/mejora-continua/copiloto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desafio, school_id: schoolId })
      });
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      const data = await res.json();
      setPropuesta(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardarMeta = async () => {
    if (!propuesta) return;
    setIsSaving(true);
    try {
      const { data: goalData, error: goalError } = await supabase
        .from("strategic_goals")
        .insert({
          title: propuesta.title,
          description: propuesta.description,
          status: "active",
          academic_year: new Date().getFullYear(),
          pme_action_link: selectedPmeAction || null,
        })
        .select()
        .single();
        
      if (goalError) throw goalError;
      const goalId = goalData.id;

      for (const phase of propuesta.phases) {
        const { data: phaseData, error: phaseError } = await supabase
          .from("implementation_phases")
          .insert({
            goal_id: goalId,
            title: phase.title,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
            status: "pending",
            leader_id: phase.leader_id || null,
          })
          .select()
          .single();

        if (phaseError) throw phaseError;
        const phaseId = phaseData.id;

        if (phase.indicators?.length > 0) {
          const indicatorsToInsert = phase.indicators.map((ind: any) => ({
            phase_id: phaseId,
            description: ind.description,
            target_value: ind.target_value,
            current_value: 0,
            metric_type: ind.metric_type,
            data_source: ind.data_source
          }));
          const { error: indError } = await supabase.from("indicators").insert(indicatorsToInsert);
          if (indError) throw indError;
        }

        if (phase.enablers?.length > 0) {
          const enablersToInsert = phase.enablers.map((en: any) => ({
            phase_id: phaseId,
            description: en.description,
            resource_type: en.resource_type,
            status: "requested"
          }));
          const { error: enError } = await supabase.from("enablers").insert(enablersToInsert);
          if (enError) throw enError;
        }
      }

      setIsOpen(false);
      window.dispatchEvent(new Event('mejora-continua-updated'));
    } catch (error) {
      console.error("Error guardando en Supabase:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
        setIsOpen(val);
        if(!val) { setPropuesta(null); setDesafio(""); }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] h-8 px-4 rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-95 group border border-indigo-500">
          <Sparkles className="w-3.5 h-3.5 mr-2 group-hover:rotate-12 transition-transform text-indigo-200" /> Plan IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto bg-white p-0 rounded-xl border-none shadow-2xl">
        <div className="bg-slate-900 px-6 py-6 text-white relative">
            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full"></div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="p-2.5 bg-blue-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Copiloto de Mejora Continua</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asistente Estratégico IA</p>
                </div>
            </div>
        </div>

        <div className="p-6 space-y-6">
            {!propuesta ? (
              <div className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500 ml-1">Reto Estratégico</Label>
                    <Textarea 
                        placeholder="Ej: Necesito mejorar los resultados de lectura en 2° básico basándome en los últimos datos de evaluación interna..."
                        className="min-h-[120px] text-sm font-bold text-slate-900 bg-white border-slate-200 focus:ring-blue-500 rounded-lg p-4 resize-none transition-all shadow-inner"
                        value={desafio}
                        onChange={(e) => setDesafio(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500 ml-1">🔗 Vincular a una Acción del PME Institucional (Opcional)</Label>
                    <div className="flex items-center gap-3">
                        <select 
                            className="flex-1 h-11 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            value={selectedPmeAction}
                            onChange={(e) => setSelectedPmeAction(e.target.value)}
                        >
                            <option value="">-- Sin Vincular --</option>
                            {pmeActions.map((action: any) => (
                                <option key={action.id} value={action.id}>{action.title} ({action.dimension || 'Sin dimensión'})</option>
                            ))}
                        </select>
                        <div className="shrink-0">
                            {!selectedPmeAction ? (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                    Gestión Interna
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                                    <Sparkles className="w-3 h-3 mr-1" /> PME Oficial
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <Button 
                    onClick={handleEstructurar} 
                    className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl transition-all shadow-xl disabled:opacity-50"
                    disabled={isLoading || !desafio.trim()}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Sparkles className="w-5 h-5 mr-3 text-blue-400" />}
                  {isLoading ? "Consultando Cerebro ProfeIC..." : "Generar Estructura Estratégica"}
                </Button>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-l-4 border-blue-600 pl-3">Meta Propuesta</h3>
                        <div className="shrink-0">
                            {!selectedPmeAction ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                                    Gestión Interna
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm uppercase tracking-wider">
                                    <Sparkles className="w-3 h-3 mr-1" /> PME Oficial
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3 bg-slate-50 p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <Input 
                            value={propuesta.title} 
                            onChange={(e) => setPropuesta({...propuesta, title: e.target.value})}
                            className="font-black text-xl text-slate-900 border-transparent bg-transparent focus:bg-white px-0 focus:px-4 h-auto py-2"
                        />
                        <Textarea 
                            value={propuesta.description}
                            onChange={(e) => setPropuesta({...propuesta, description: e.target.value})}
                            className="text-sm font-bold text-slate-700 border-transparent bg-transparent focus:bg-white px-0 focus:px-4 min-h-[100px] resize-none leading-relaxed"
                        />
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-l-4 border-blue-600 pl-3">Fases de Despliegue</h3>
                        <span className="text-[10px] font-bold text-slate-300">{propuesta.phases.length} Fases Sugeridas</span>
                    </div>
                    
                    <div className="space-y-4">
                        {propuesta.phases.map((phase: any, pIdx: number) => (
                            <div key={pIdx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-slate-200 hover:border-l-blue-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Fase 0{pIdx + 1}</label>
                                        <Input 
                                            value={phase.title}
                                            onChange={(e) => {
                                                const newPhases = [...propuesta.phases];
                                                newPhases[pIdx].title = e.target.value;
                                                setPropuesta({...propuesta, phases: newPhases});
                                            }}
                                            className="font-bold text-slate-900 h-auto p-0 border-transparent bg-transparent focus:bg-slate-50 focus:px-3 py-1"
                                        />
                                    </div>
                                    <div className="w-fit">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block text-right">Líder sugerido</label>
                                        <select 
                                            className="h-8 bg-slate-50 text-[10px] font-black uppercase tracking-tighter border-none rounded-full px-4 outline-none focus:ring-2 focus:ring-blue-500"
                                            value={phase.leader_id || ""}
                                            onChange={(e) => {
                                                const newPhases = [...propuesta.phases];
                                                newPhases[pIdx].leader_id = e.target.value;
                                                setPropuesta({...propuesta, phases: newPhases});
                                            }}
                                        >
                                            <option value="">Delegar...</option>
                                            {profiles.map(p => (
                                                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                                    <div className="space-y-3">
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                                            <Target className="w-3 h-3" /> Metas de Logro
                                        </span>
                                        <ul className="space-y-2">
                                            {phase.indicators?.map((ind: any, iIdx: number) => (
                                                <li key={iIdx} className="text-[11px] font-bold text-slate-600 bg-slate-50/50 p-2 rounded-xl flex justify-between gap-3">
                                                    <span className="truncate">{ind.description}</span>
                                                    <span className="text-blue-600 shrink-0">{ind.target_value}{ind.metric_type === 'percentage' ? '%' : ''}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="space-y-3">
                                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                            <Save className="w-3 h-3" /> Recursos (Habilitadores)
                                        </span>
                                        <ul className="space-y-2">
                                            {phase.enablers?.map((en: any, eIdx: number) => (
                                                <li key={eIdx} className="text-[11px] font-bold text-slate-600 bg-orange-50/30 p-2 rounded-xl border border-orange-100/50">
                                                    {en.description}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex flex-col gap-3 pt-6">
                    <Button 
                        onClick={handleGuardarMeta} 
                        disabled={isSaving}
                        className="h-14 w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-[28px] shadow-2xl shadow-blue-500/30"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                        {isSaving ? "Inyectando meta en el sistema..." : "Confirmar y Desplegar Estrategia"}
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        onClick={() => setPropuesta(null)} 
                        disabled={isSaving}
                        className="h-12 w-full text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest"
                    >
                        Descartar propuesta y regenerar
                    </Button>
                </div>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
