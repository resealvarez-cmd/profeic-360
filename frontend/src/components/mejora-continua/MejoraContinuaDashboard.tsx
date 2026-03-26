"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CopilotoMejoraModal from "@/components/mejora-continua/CopilotoMejoraModal";
import CrearMetaManualModal from "@/components/mejora-continua/CrearMetaManualModal";
import ImportarPMEModal from "@/components/mejora-continua/ImportarPMEModal";
import ActualizarProgresoModal from "@/components/mejora-continua/ActualizarProgresoModal";
import InformeEjecutivoModal from "@/components/mejora-continua/InformeEjecutivoModal";
import PMEGantt from "@/components/mejora-continua/PMEGantt";
import PMEAnalytics from "@/components/mejora-continua/PMEAnalytics";
import WidgetAtrasos from "@/components/mejora-continua/WidgetAtrasos";
import PMEAlertBanner from "@/components/mejora-continua/PMEAlertBanner";
import SubtareasPhase from "@/components/mejora-continua/SubtareasPhase";
import CuadroMandoScorecard from "@/components/mejora-continua/CuadroMandoScorecard";
import HabilitadoresPhase from "@/components/mejora-continua/HabilitadoresPhase";
import { StrategicGoal } from "@/types/mejora_continua";
import { Loader2, Target, Activity, Maximize2, UserCircle2, ChevronDown, Pencil, Download, X, Sparkles, PieChart, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function MejoraContinuaDashboard() {
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTitleBuffer, setEditTitleBuffer] = useState("");
  const [editDescBuffer, setEditDescBuffer] = useState("");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'goals' | 'reports'>('dashboard');

  const fetchData = async () => {
    setLoading(true);
    try {
      let currentSchoolId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        if (user) {
          const { data: authData } = await supabase.from('authorized_users').select('role').eq('email', user.email).maybeSingle();
          setIsAdmin(authData?.role === 'admin' || authData?.role === 'director');

          // Fetch school_id for multi-tenancy
          const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle();
          currentSchoolId = profile?.school_id;
        }
      } catch (authError) {
        console.error("Auth check failed:", authError);
      }

      let goalsQuery = supabase
        .from('strategic_goals')
        .select(`
          *,
          implementation_phases (
            *,
            indicators (*),
            enablers (*)
          )
        `);

      if (currentSchoolId) {
        goalsQuery = goalsQuery.eq('school_id', currentSchoolId);
      }

      const { data: goalsData, error: goalsError } = await goalsQuery.order('created_at', { ascending: false });

      if (goalsError) {
        console.error("Goals fetch error:", goalsError);
      } else if (goalsData) {
        const typedGoals = goalsData as unknown as StrategicGoal[];
        
        // Fetch Phase Tasks separately to avoid nesting relationship errors
        const phaseIds = typedGoals.flatMap(g => g.implementation_phases?.map(p => p.id) || []);
        if (phaseIds.length > 0) {
          const { data: tasksData, error: tasksError } = await supabase
            .from('phase_tasks')
            .select('*')
            .in('phase_id', phaseIds);

          if (!tasksError && tasksData) {
            typedGoals.forEach(goal => {
              goal.implementation_phases?.forEach(phase => {
                phase.phase_tasks = tasksData.filter(t => t.phase_id === phase.id);
              });
            });
          }
        }
        setGoals(typedGoals);
      }

      // Enhanced profile fetching with roles
      const { data: authUsers } = await supabase.from('authorized_users').select('email, role');
      const { data: profileData } = await supabase.from('profiles').select('id, full_name, email');
      
      if (profileData && authUsers) {
        const enhancedProfiles = profileData.map(p => ({
          ...p,
          role: authUsers.find(au => au.email?.toLowerCase() === p.email?.toLowerCase())?.role || 'teacher'
        }));
        setProfiles(enhancedProfiles);
      } else if (profileData) {
        setProfiles(profileData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('mejora-continua-updated', fetchData);
    return () => window.removeEventListener('mejora-continua-updated', fetchData);
  }, []);

  const handleUpdatePhaseLeader = async (phaseId: string, leaderId: string) => {
    const { error } = await supabase.from('implementation_phases').update({ leader_id: leaderId || null }).eq('id', phaseId);
    if (!error) {
       window.dispatchEvent(new Event('mejora-continua-updated'));
    }
  };

  const managementProfiles = profiles.filter(p => ['admin', 'director', 'utp', 'sostenedor'].includes(p.role?.toLowerCase()));

  const toggleGoal = (id: string) => {
    setExpandedGoals(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const collapseAll = () => {
    setExpandedGoals({});
    setExpandedPhases({});
  };

  const getProfileName = (id?: string) => {
    if (!id) return "Sin asignar";
    const p = profiles.find(pr => pr.id === id);
    return p ? (p.full_name || p.email) : "Desconocido";
  };

  const getSemaphoreColor = (current: number, target: number) => {
    if (target === 0) return "bg-slate-200";
    const perc = (current / target) * 100;
    if (perc >= 90) return 'bg-emerald-400';
    if (perc >= 50) return 'bg-amber-400';
    return 'bg-rose-400';
  };

  const startEditingGoal = (goal: StrategicGoal) => {
    setEditingGoalId(goal.id);
    setEditTitleBuffer(goal.title);
    setEditDescBuffer(goal.description || "");
  };

  const saveGoalEdit = async (goalId: string) => {
    const { error } = await supabase
      .from('strategic_goals')
      .update({ 
        title: editTitleBuffer,
        description: editDescBuffer
      })
      .eq('id', goalId);

    if (!error) {
      setGoals(goals.map(g => g.id === goalId ? { ...g, title: editTitleBuffer, description: editDescBuffer } : g));
      setEditingGoalId(null);
    }
  };

  const translateStatus = (s: string) => {
    const map: any = { 'pending': 'Pendiente', 'in_progress': 'En Curso', 'completed': 'Lograda' };
    return map[s] || s;
  };

  const renderMonitoringAlerts = () => {
    const alerts: any[] = [];
    const now = new Date();
    
    goals.forEach(goal => {
      goal.implementation_phases?.forEach(phase => {
        // Phase level monitoring
        const phaseEnd = new Date(phase.end_date);
        const phaseDiffDays = Math.ceil((phaseEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (phase.status !== 'completed' && phaseDiffDays <= 15) {
          alerts.push({
            type: phaseDiffDays < 0 ? 'critical' : 'warning',
            title: `Plazo de Fase: ${phase.title}`,
            subtitle: phaseDiffDays < 0 ? 'VENCIDO' : `Vence en ${phaseDiffDays} días`,
            goal: goal.title
          });
        }

        // Subtask level monitoring
        phase.phase_tasks?.forEach(task => {
          if (task.status !== 'completed' && task.due_date) {
            const taskDue = new Date(task.due_date);
            const taskDiffDays = Math.ceil((taskDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (taskDiffDays <= 15) {
              alerts.push({
                type: taskDiffDays < 0 ? 'critical' : 'warning',
                title: `Acción Pendiente: ${task.title}`,
                subtitle: taskDiffDays < 0 ? 'VENCIDO' : `Límite: ${taskDiffDays} días`,
                goal: `${goal.title} > ${phase.title}`
              });
            }
          }
        });
      });
    });

    if (alerts.length === 0) return null;

    return (
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 max-w-[1400px] mx-auto w-full px-8">
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Monitor de Seguimiento Crítico</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {alerts.slice(0, 3).map((alert, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${alert.type === 'critical' ? 'bg-white border-rose-200 shadow-sm shadow-rose-100' : 'bg-white border-amber-200 shadow-sm shadow-amber-100'} flex items-start gap-4 transition-all hover:scale-[1.02]`}>
              <div className={`mt-1 p-1.5 rounded-lg ${alert.type === 'critical' ? 'bg-rose-500' : 'bg-amber-500'} text-white`}>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-widest ${alert.type === 'critical' ? 'text-rose-600' : 'text-amber-600'}`}>{alert.subtitle}</p>
                <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">{alert.title}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase truncate mt-1">{alert.goal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 no-print">
        <div className="max-w-[1400px] mx-auto w-full h-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5 group cursor-pointer">
                  <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                      <Target className="text-blue-500 w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                      <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Mejorando <span className="text-blue-600">Juntos</span></h1>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ProfeIC 360</span>
                  </div>
              </div>
              <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/50 rounded-lg border border-slate-200/50">
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'analytics', label: 'Analítica' },
                    { id: 'goals', label: 'Metas' },
                    { id: 'reports', label: 'Reportes' }
                  ].map((tab) => (
                      <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>
          </div>
          <div className="flex items-center gap-2">
              <PMEGantt goals={goals} profiles={profiles} isAdminView={isAdmin} currentUserId={currentUser?.id} />
              <div className="h-4 w-[1px] bg-slate-200 mx-2"></div>
              <div className="flex items-center gap-3">
              <ImportarPMEModal />
              <CrearMetaManualModal />
              <CuadroMandoScorecard goals={goals} />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-8 py-8 space-y-8">
        {(activeTab === 'dashboard' || activeTab === 'reports') && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {activeTab === 'dashboard' ? 'Gestión Estratégica Institucional' : 'Centro de Reportes'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-500 font-medium">
                        {activeTab === 'dashboard' ? 'Plataforma colaborativa Mejorando Juntos' : 'Exportación y análisis de cumplimiento'}
                    </p>
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                      Gestión Estratégica PME
                    </span>
                  </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inversión Agregada</span>
                    <span className="text-xl font-black text-slate-900">
                        ${goals.reduce((acc, g) => 
                            acc + (g.implementation_phases?.reduce((pAcc, p) => 
                                pAcc + (p.enablers?.reduce((eAcc, e) => eAcc + (e.estimated_cost || 0), 0) || 0), 0) || 0), 0
                        ).toLocaleString('es-CL')}
                    </span>
                </div>
                {activeTab === 'dashboard' && <PMEAlertBanner goals={goals} />}
              </div>
          </div>
        )}

        {activeTab === 'dashboard' && renderMonitoringAlerts()}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[40vh] text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Cargando Cerebro Institucional...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-200">
             <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-slate-800">Comienza tu plan de mejora</h3>
             <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">No hay metas activas. Usa el Copiloto IA para iniciar.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(activeTab === 'dashboard' || activeTab === 'analytics') && (
              <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className={activeTab === 'analytics' ? "space-y-4" : ""}>
                    {activeTab === 'analytics' && (
                      <div className="pb-4 border-b border-slate-200">
                         <h2 className="text-xl font-bold text-slate-900">Análisis Institucional Avanzado</h2>
                         <p className="text-xs text-slate-500 font-medium">Proyección de salud y cumplimiento estratégico</p>
                      </div>
                    )}
                    <PMEAnalytics goals={goals} profiles={profiles} />
                  </div>
              </section>
            )}

            {(activeTab === 'dashboard' || activeTab === 'goals') && (
              <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                          {activeTab === 'goals' ? 'Bitácora de Metas Estratégicas' : 'Objetivos de Calidad'} ({goals.length})
                      </h3>
                      <button onClick={collapseAll} className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors">
                          <ChevronDown className="w-3.5 h-3.5" /> Colapsar Todo
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      {goals.map((goal) => (
                        <div key={goal.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                          <div className={`p-6 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors ${expandedGoals[goal.id] ? 'bg-slate-50/50 border-b border-slate-100' : ''}`} onClick={() => toggleGoal(goal.id)}>
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${goal.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                                  {editingGoalId === goal.id ? (
                                          <div className="flex-1 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                               <Input 
                                                  value={editTitleBuffer} 
                                                  onChange={e => setEditTitleBuffer(e.target.value)} 
                                                  className="h-10 text-base font-black border-blue-300 text-slate-900 focus:ring-blue-500 bg-white shadow-sm"
                                                  placeholder="Título del Objetivo..."
                                              />
                                               <Textarea 
                                                   value={editDescBuffer} 
                                                   onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescBuffer(e.target.value)}
                                                   className="text-sm font-bold border-blue-200 text-slate-900 focus:ring-blue-500 bg-white min-h-[80px] rounded-xl p-3"
                                                   placeholder="Descripción detallada..."
                                               />
                                              <div className="flex gap-2 justify-end mt-1">
                                                <Button size="sm" onClick={() => saveGoalEdit(goal.id)} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase">Guardar</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingGoalId(null)} className="text-slate-400 font-bold text-[10px] uppercase">Cancelar</Button>
                                              </div>
                                          </div>
                                  ) : (
                                      <div className="flex-1 min-w-0">
                                          <h4 className="text-base font-bold text-slate-800 truncate">{goal.title}</h4>
                                          {!expandedGoals[goal.id] && (
                                              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{goal.description || 'Sin descripción'}</p>
                                          )}
                                      </div>
                                  )}
                              </div>
                              
                              <div className="flex items-center gap-3 ml-4">
                                  <button onClick={(e) => { e.stopPropagation(); startEditingGoal(goal); }} className="p-1.5 text-slate-300 hover:text-slate-500 transition-colors">
                                      <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <div className={`p-1 text-slate-400 transition-transform duration-300 ${expandedGoals[goal.id] ? 'rotate-180 text-blue-600' : ''}`}>
                                      <ChevronDown className="w-4 h-4" />
                                  </div>
                              </div>
                          </div>

                          {expandedGoals[goal.id] && (
                            <div className="p-6 space-y-6 animate-in fade-in duration-300">
                               {goal.description && (
                                   <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                       <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                                          "{goal.description}"
                                       </p>
                                   </div>
                               )}
                               
                               <div className="space-y-3">
                                  {goal.implementation_phases?.map((phase, pIdx) => (
                                      <div key={phase.id} className="rounded-lg border border-slate-100 overflow-hidden">
                                          <div className={`p-4 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors ${expandedPhases[phase.id] ? 'bg-slate-50/30' : ''}`} onClick={() => togglePhase(phase.id)}>
                                              <div className="flex items-center gap-3">
                                                  <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{pIdx+1}</div>
                                                  <h5 className="text-sm font-bold text-slate-700">{phase.title}</h5>
                                              </div>
                                              <div className="flex items-center gap-4">
                                                   <div className="flex -space-x-2">
                                                       {phase.phase_tasks && phase.phase_tasks.length > 0 && (
                                                           <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-sm" title={`${phase.phase_tasks.length} Acciones`}>
                                                               <span className="text-[8px] font-black text-white">{phase.phase_tasks.length}</span>
                                                           </div>
                                                       )}
                                                       {phase.enablers && phase.enablers.length > 0 && (
                                                           <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm" title={`${phase.enablers.length} Habilitadores`}>
                                                               <span className="text-[8px] font-black text-white">{phase.enablers.length}</span>
                                                           </div>
                                                       )}
                                                   </div>
                                                   <div className="flex flex-col items-end">
                                                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Cronograma</span>
                                                       <span className="text-[10px] font-black text-slate-700 tabular-nums">
                                                           {new Date(phase.start_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} - {new Date(phase.end_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                                                       </span>
                                                   </div>
                                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${phase.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                       {translateStatus(phase.status)}
                                                   </span>
                                                   <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${expandedPhases[phase.id] ? 'rotate-180' : ''}`} />
                                               </div>
                                          </div>
                                          
                                          {expandedPhases[phase.id] && (
                                              <div className="px-4 pb-4 pt-2 space-y-4 animate-in fade-in duration-200">
                                                  <div className="py-4 border-b border-slate-50 space-y-4">
                                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                          <div className="flex items-center gap-3">
                                                              <UserCircle2 className="w-4 h-4 text-slate-400" />
                                                              <div className="flex flex-col">
                                                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Responsable de Fase</span>
                                                                  <select 
                                                                    className="text-xs font-bold text-slate-900 bg-transparent border-none focus:ring-0 cursor-pointer p-0 h-auto"
                                                                    value={phase.leader_id || ""}
                                                                    onChange={(e) => handleUpdatePhaseLeader(phase.id, e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                  >
                                                                    <option value="">Sin asignar</option>
                                                                    {managementProfiles.map(p => (
                                                                      <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                                                                    ))}
                                                                  </select>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>

                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                      {phase.indicators?.map(ind => (
                                                          <div key={ind.id} className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 group/ind transition-all hover:bg-white hover:border-blue-200">
                                                              <div className="flex justify-between items-start mb-4">
                                                                  <div className="space-y-1 pr-4">
                                                                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Indicador</span>
                                                                      <h6 className="text-xs font-bold text-slate-700 leading-tight">{ind.description}</h6>
                                                                  </div>
                                                                  <ActualizarProgresoModal indicator={ind} phaseId={phase.id} />
                                                              </div>
                                                              <div className="flex items-center gap-3">
                                                                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                                      <div 
                                                                          className={`h-full ${getSemaphoreColor(ind.current_value, ind.target_value)} transition-all duration-700`}
                                                                          style={{ width: `${Math.min((ind.current_value / ind.target_value) * 100, 100)}%` }}
                                                                      ></div>
                                                                  </div>
                                                                  <span className="text-xs font-bold text-slate-600 tabular-nums">
                                                                      {((ind.current_value / ind.target_value) * 100).toFixed(0)}%
                                                                  </span>
                                                              </div>
                                                          </div>
                                                      ))}
                                                  </div>
                                                  <HabilitadoresPhase phaseId={phase.id} enablers={phase.enablers} />
                                              </div>
                                          )}
                                      </div>
                                  ))}
                               </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 hover:border-slate-300 transition-all group">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Download className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Exportación Estratégica</h3>
                      <p className="text-xs text-slate-500 font-medium">Obtén una copia profesional del Roadmap actual en formato PDF vectorial.</p>
                      <PMEGantt goals={goals} profiles={profiles} isAdminView={isAdmin} currentUserId={currentUser?.id} />
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 hover:border-blue-200 transition-all group">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Informe Ejecutivo IA</h3>
                      <p className="text-xs text-slate-500 font-medium">Análisis automático de brechas y fortalezas institucionales con sugerencias de acción.</p>
                      <InformeEjecutivoModal dashboardData={goals} />
                  </div>

                   <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-4 hover:border-emerald-200 transition-all group">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PieChart className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Cuadro de Mando</h3>
                      <p className="text-xs text-slate-500 font-medium">Visualización 360 de cumplimiento y KPIs estratégicos para sostenedores.</p>
                      <CuadroMandoScorecard goals={goals} />
                  </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
