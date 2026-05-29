"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import CrearMetaManualModal from "@/components/mejora-continua/CrearMetaManualModal";
import ImportarPMEModal from "@/components/mejora-continua/ImportarPMEModal";
import ActualizarProgresoModal from "@/components/mejora-continua/ActualizarProgresoModal";
import InformeEjecutivoModal from "@/components/mejora-continua/InformeEjecutivoModal";
import PMEGantt from "@/components/mejora-continua/PMEGantt";
import PMEAnalytics from "@/components/mejora-continua/PMEAnalytics";
import PMEAlertBanner from "@/components/mejora-continua/PMEAlertBanner";
import SubtareasPhase from "@/components/mejora-continua/SubtareasPhase";
import CuadroMandoScorecard from "@/components/mejora-continua/CuadroMandoScorecard";
import HabilitadoresPhase from "@/components/mejora-continua/HabilitadoresPhase";
import SubirEvidenciaModal from "./SubirEvidenciaModal";
import { StrategicGoal } from "@/types/mejora_continua";
import { useAuth } from "@/contexts/AuthContext";
import {
  Loader2, Target, Activity, UserCircle2, ChevronDown, Pencil,
  Download, Sparkles, PieChart, Clock, AlertCircle, Link2,
  Paperclip, FileText, Upload, CheckCircle2, Star, Trophy, Flame,
  LayoutDashboard, BarChart3, ListChecks, BookOpen, FileBarChart2,
  PlusCircle, ChevronRight, TrendingUp, AlertTriangle, X, Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
const DIMENSIONS = ['Gestión Pedagógica', 'Liderazgo', 'Convivencia Escolar', 'Gestión de Recursos'];
const ALL_LEADERSHIP_ROLES = ["admin", "director", "directivo", "utp", "gestion", "sostenedor"];

const semaphoreColor = (current: number, target: number) => {
  if (!target) return "bg-slate-200";
  const p = (current / target) * 100;
  if (p >= 90) return "bg-emerald-400";
  if (p >= 50) return "bg-amber-400";
  return "bg-rose-400";
};

const translateStatus = (s: string) => {
  const m: Record<string, string> = { pending: "Pendiente", in_progress: "En Curso", completed: "Lograda" };
  return m[s] || s;
};

// Derive the canonical status of a goal from its phases
const getGoalStatus = (goal: StrategicGoal): "pending" | "in_progress" | "completed" => {
  const phases = goal.implementation_phases || [];
  if (phases.length === 0) return "pending";
  const done = phases.filter(p => p.status === "completed").length;
  if (done === phases.length) return "completed";
  if (done > 0) return "in_progress";
  return "pending";
};

// ---------------------------------------------------------------------------
// GoalBadge
// ---------------------------------------------------------------------------
function GoalBadge({ goal, evidenceCount }: { goal: StrategicGoal; evidenceCount: number }) {
  const phases = goal.implementation_phases || [];
  const completed = phases.filter(p => p.status === "completed").length;
  const total = phases.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  if (pct === 100 && total > 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">
      <Trophy className="w-2.5 h-2.5" /> Meta Lograda
    </span>
  );
  if (evidenceCount >= 3) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-violet-50 text-violet-600 border border-violet-200 uppercase tracking-wider">
      <Star className="w-2.5 h-2.5" /> Trazabilidad Total
    </span>
  );
  if (pct >= 50) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wider">
      <Flame className="w-2.5 h-2.5" /> En Momentum
    </span>
  );
  return null;
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------
function KpiCard({ label, value, sub, accent, icon }: { label: string; value: string | number; sub?: string; accent?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">{icon}</div>
      </div>
      <p className={`text-3xl font-black ${accent || "text-slate-900"}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 font-medium">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban Column
// ---------------------------------------------------------------------------
function KanbanColumn({
  title, color, goals, evidences, pmeMap, canEdit, profiles, mgmtProfiles, onEdit, onExpand, expandedGoals, expandedPhases, setExpandedPhases, handleUpdatePhaseLeader, fetchData, pmeActions
}: any) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${color}`}>
        <h3 className="text-[11px] font-black uppercase tracking-widest">{title}</h3>
        <span className="text-[10px] font-bold opacity-70">{goals.length}</span>
      </div>
      {goals.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-400 font-medium">Sin metas aquí</p>
        </div>
      )}
      <div className="space-y-3">
        {goals.map((goal: StrategicGoal) => {
          const goalEvidences = evidences.filter((e: any) => e.goal_id === goal.id);
          const phasesDone = (goal.implementation_phases || []).filter(p => p.status === "completed").length;
          const phasesTotal = (goal.implementation_phases || []).length;
          const pct = phasesTotal > 0 ? Math.round((phasesDone / phasesTotal) * 100) : 0;
          const isExpanded = expandedGoals[goal.id];

          return (
            <div key={goal.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all">
              {/* Card header */}
              <div
                className="p-4 cursor-pointer flex items-start gap-3"
                onClick={() => onExpand(goal.id)}
              >
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-blue-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{goal.title}</h4>
                    <div className="flex items-center gap-1 shrink-0">
                      {canEdit && (
                        <button
                          onClick={e => { e.stopPropagation(); onEdit(goal); }}
                          className="p-1 text-slate-300 hover:text-blue-500 transition-colors rounded"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                      <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {goal.pme_action_link && pmeMap[goal.pme_action_link] && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                        🔗 {pmeMap[goal.pme_action_link].dimension}
                      </span>
                    )}
                    <GoalBadge goal={goal} evidenceCount={goalEvidences.length} />
                  </div>

                  {/* Progress bar */}
                  {phasesTotal > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${pct >= 90 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-blue-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 shrink-0">{pct}%</span>
                      {goalEvidences.length > 0 && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-violet-600">
                          <Paperclip className="w-2.5 h-2.5" /> {goalEvidences.length}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/40">
                  {goal.description && (
                    <p className="text-xs text-slate-500 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                      "{goal.description}"
                    </p>
                  )}

                  {(goal.implementation_phases || []).map((phase: any, pIdx: number) => {
                    const phaseEvidences = evidences.filter((e: any) => e.phase_id === phase.id);
                    const isPhaseExpanded = expandedPhases[phase.id];

                    return (
                      <div key={phase.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        {/* Phase header */}
                        <div
                          className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${isPhaseExpanded ? "border-b border-slate-100" : ""}`}
                          onClick={() => setExpandedPhases((prev: any) => ({ ...prev, [phase.id]: !prev[phase.id] }))}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">{pIdx + 1}</span>
                            <span className="text-sm font-bold text-slate-700">{phase.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {phaseEvidences.length > 0 && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-100 rounded-full text-[9px] font-black text-violet-600">
                                <Paperclip className="w-2.5 h-2.5" /> {phaseEvidences.length}
                              </span>
                            )}
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${phase.status === "completed" ? "bg-emerald-100 text-emerald-700" : phase.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                              {translateStatus(phase.status)}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                              {new Date(phase.end_date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${isPhaseExpanded ? "rotate-180 text-blue-500" : ""}`} />
                          </div>
                        </div>

                        {/* Phase body */}
                        {isPhaseExpanded && (
                          <div className="p-4 space-y-5">
                            {/* Evidences */}
                            <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h6 className="text-[10px] font-black text-violet-700 uppercase tracking-widest flex items-center gap-1.5">
                                  <Paperclip className="w-3 h-3" /> Evidencias
                                </h6>
                                <SubirEvidenciaModal phaseId={phase.id} goalId={goal.id} onSuccess={fetchData} />
                              </div>
                              {phaseEvidences.length === 0 ? (
                                <div className="text-center py-4 border border-dashed border-violet-200 rounded-lg bg-white/50">
                                  <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Sin documentos cargados</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {phaseEvidences.map((ev: any) => (
                                    <div key={ev.id} className="flex items-center justify-between p-2.5 bg-white border border-violet-100 rounded-lg hover:border-violet-300 transition-all shadow-sm group">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="p-1.5 bg-violet-100 rounded-lg"><FileText className="w-3.5 h-3.5 text-violet-600" /></div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-bold text-slate-900 truncate">{ev.file_name}</p>
                                          <p className="text-[9px] text-slate-400">{new Date(ev.created_at).toLocaleDateString("es-CL")}</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={async () => {
                                          const { data } = supabase.storage.from("pme_evidencias").getPublicUrl(ev.file_path);
                                          window.open(data.publicUrl, "_blank");
                                        }}
                                        className="p-1.5 text-slate-300 hover:text-violet-600 transition-colors opacity-0 group-hover:opacity-100"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Responsable */}
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <UserCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Responsable</p>
                                <select
                                  value={phase.leader_id || ""}
                                  onChange={e => handleUpdatePhaseLeader(phase.id, e.target.value)}
                                  disabled={!canEdit}
                                  className="text-xs font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                                >
                                  <option value="">Sin asignar</option>
                                  {mgmtProfiles.map((p: any) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                                </select>
                              </div>
                            </div>

                            {/* Indicators */}
                            {(phase.indicators || []).length > 0 && (
                              <div className="space-y-2">
                                {phase.indicators?.map((ind: any) => (
                                  <div key={ind.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-3 gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Indicador</p>
                                        <p className="text-xs font-bold text-slate-700 leading-snug line-clamp-3">{ind.description}</p>
                                      </div>
                                      <div className="shrink-0 mt-1">
                                        <ActualizarProgresoModal indicator={ind} phaseId={phase.id} />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${semaphoreColor(ind.current_value, ind.target_value)} transition-all`}
                                          style={{ width: `${Math.min((ind.current_value / ind.target_value) * 100, 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-black text-slate-600">{Math.round((ind.current_value / ind.target_value) * 100)}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <HabilitadoresPhase phaseId={phase.id} enablers={phase.enablers} />
                            <SubtareasPhase phaseId={phase.id} profiles={profiles} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function MejoraContinuaDashboard() {
  const { isDirectivo, isLiderazgo, isSuperAdmin, user: authUser, currentSchoolId: authSchoolId } = useAuth();
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPmeLink, setEditPmeLink] = useState<string | null>(null);
  const [pmeActions, setPmeActions] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "goals" | "pme" | "reports">("dashboard");
  const [budgetInfo, setBudgetInfo] = useState<{ budget_sep: number; budget_pie: number; budget_total: number } | null>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  const canEdit = isLiderazgo || isSuperAdmin;
  const pmeMap = Object.fromEntries(pmeActions.map(a => [a.id, a]));

  // Close create menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      let schoolId = authSchoolId;
      if (!schoolId && authUser) {
        const { data: pData } = await supabase.from("profiles").select("school_id").eq("id", authUser.id).single();
        if (pData) schoolId = pData.school_id;
      }

      // Fetch budget info multitenant-safe
      let infoQuery = supabase.from("pme_institutional_info").select("*").eq("academic_year", 2026);
      if (schoolId) {
        infoQuery = infoQuery.eq("school_id", schoolId);
      }
      const { data: info } = await infoQuery.maybeSingle();
      setBudgetInfo(info);

      const { data: goalsRaw, error: goalsError } = await supabase
        .from("strategic_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (goalsError) throw goalsError;
      const typedGoals = (goalsRaw || []) as StrategicGoal[];

      if (typedGoals.length > 0) {
        const goalIds = typedGoals.map(g => g.id);
        const [phasesRes, evidRes] = await Promise.all([
          supabase.from("implementation_phases").select("*").in("goal_id", goalIds),
          supabase.from("pme_evidences").select("*").in("goal_id", goalIds),
        ]);

        const phasesData = phasesRes.data || [];
        setEvidences(evidRes.data || []);

        if (phasesData.length > 0) {
          const phaseIds = phasesData.map(p => p.id);
          const [indRes, enaRes, tskRes] = await Promise.all([
            supabase.from("indicators").select("*").in("phase_id", phaseIds),
            supabase.from("enablers").select("*").in("phase_id", phaseIds),
            supabase.from("phase_tasks").select("*").in("phase_id", phaseIds),
          ]);

          typedGoals.forEach(g => {
            g.implementation_phases = phasesData
              .filter(p => p.goal_id === g.id)
              .map(p => ({
                ...p,
                indicators: indRes.data?.filter(i => i.phase_id === p.id) || [],
                enablers: enaRes.data?.filter(e => e.phase_id === p.id) || [],
                phase_tasks: tskRes.data?.filter(t => t.phase_id === p.id) || [],
              }));
          });
        }
        setGoals(typedGoals);
      } else {
        setGoals([]);
      }

      const [profRes, authRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("authorized_users").select("email, role"),
      ]);
      if (profRes.data && authRes.data) {
        setProfiles(profRes.data.map(p => ({
          ...p,
          role: authRes.data?.find(a => a.email?.toLowerCase() === p.email?.toLowerCase())?.role || "profesor",
        })));
      }

      if (schoolId) {
        const { data: pmeFiltered, error: pmeErr } = await supabase
          .from("pme_actions")
          .select("*")
          .eq("school_id", schoolId)
          .order("dimension");

        if (!pmeErr && pmeFiltered && pmeFiltered.length > 0) {
          setPmeActions(pmeFiltered);
        } else {
          const { data: pmeAll } = await supabase.from("pme_actions").select("*").order("dimension");
          setPmeActions(pmeAll || []);
        }
      } else {
        const { data: pmeAll } = await supabase.from("pme_actions").select("*").order("dimension");
        setPmeActions(pmeAll || []);
      }
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener("mejora-continua-updated", fetchData);
    return () => window.removeEventListener("mejora-continua-updated", fetchData);
  }, [authUser, authSchoolId]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleUpdatePhaseLeader = async (phaseId: string, leaderId: string) => {
    await supabase.from("implementation_phases").update({ leader_id: leaderId || null }).eq("id", phaseId);
    window.dispatchEvent(new Event("mejora-continua-updated"));
  };

  const handleToggleCritical = async (actionId: string, current: boolean) => {
    if (!canEdit) return;
    await supabase.from("pme_actions").update({ is_critical: !current }).eq("id", actionId);
    setPmeActions(prev => prev.map(a => a.id === actionId ? { ...a, is_critical: !current } : a));
    if (!current && typeof window !== "undefined") {
      const confeti = (await import("canvas-confetti")).default;
      confeti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#f59e0b", "#fbbf24", "#ffffff"] });
    }
  };

  const startEdit = (goal: StrategicGoal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditDesc(goal.description || "");
    setEditPmeLink(goal.pme_action_link || null);
    setActiveTab("goals");
    setTimeout(() => setExpandedGoals(prev => ({ ...prev, [goal.id]: true })), 100);
  };

  const saveEdit = async (goalId: string) => {
    const { error } = await supabase.from("strategic_goals").update({ title: editTitle, description: editDesc, pme_action_link: editPmeLink }).eq("id", goalId);
    if (!error) { setEditingGoalId(null); fetchData(); }
  };

  // FIX: Include all leadership roles (new + legacy)
  const mgmtProfiles = profiles.filter(p => ALL_LEADERSHIP_ROLES.includes(p.role?.toLowerCase()));
  const totalInversion = goals.reduce((acc, g) => acc + (g.implementation_phases?.reduce((pa, p) => pa + (p.enablers?.reduce((ea, e) => ea + (e.estimated_cost || 0), 0) || 0), 0) || 0), 0);
  const budgetLimit = budgetInfo ? (budgetInfo.budget_total || (budgetInfo.budget_sep + budgetInfo.budget_pie)) : 0;
  const isBudgetExceeded = budgetLimit > 0 && totalInversion > budgetLimit;
  const budgetOverdraft = totalInversion - budgetLimit;

  // -------------------------------------------------------------------------
  // Alert data
  // -------------------------------------------------------------------------
  const buildAlerts = () => {
    const now = new Date();
    return goals.flatMap(g =>
      (g.implementation_phases || [])
        .filter(p => p.status !== "completed")
        .map(p => {
          const diff = Math.ceil((new Date(p.end_date).getTime() - now.getTime()) / 86400000);
          return diff <= 15 ? { type: diff < 0 ? "critical" : "warning", title: p.title, days: diff, goal: g.title } : null;
        })
        .filter(Boolean)
    ) as { type: string; title: string; days: number; goal: string }[];
  };

  // -------------------------------------------------------------------------
  // Dashboard KPIs
  // -------------------------------------------------------------------------
  const globalPhasesTotal = goals.reduce((acc, g) => acc + (g.implementation_phases?.length || 0), 0);
  const globalPhasesDone = goals.reduce((acc, g) => acc + (g.implementation_phases?.filter(p => p.status === "completed").length || 0), 0);
  const globalPct = globalPhasesTotal > 0 ? Math.round((globalPhasesDone / globalPhasesTotal) * 100) : 0;
  const overdueAlerts = buildAlerts().filter(a => a.type === "critical").length;
  const goalsCompleted = goals.filter(g => getGoalStatus(g) === "completed").length;

  // Kanban groups
  const kanbanGroups = {
    pending: goals.filter(g => getGoalStatus(g) === "pending"),
    in_progress: goals.filter(g => getGoalStatus(g) === "in_progress"),
    completed: goals.filter(g => getGoalStatus(g) === "completed"),
  };

  const kanbanProps = { evidences, pmeMap, canEdit, profiles, mgmtProfiles, onEdit: startEdit, onExpand: (id: string) => setExpandedGoals(prev => ({ ...prev, [id]: !prev[id] })), expandedGoals, expandedPhases, setExpandedPhases, handleUpdatePhaseLeader, fetchData, pmeActions };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto h-14 px-6 flex items-center justify-between gap-4">
          {/* Logo + tabs */}
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-sm font-bold text-slate-900">Mejorando <span className="text-blue-600">Juntos</span></span>
            </button>

            <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {([
                { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-3 h-3" /> },
                { id: "analytics", label: "Analítica", icon: <BarChart3 className="w-3 h-3" /> },
                { id: "goals", label: "Metas", icon: <ListChecks className="w-3 h-3" /> },
                { id: "pme", label: "Vista PME", icon: <BookOpen className="w-3 h-3" /> },
                { id: "reports", label: "Reportes", icon: <FileBarChart2 className="w-3 h-3" /> },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    activeTab === t.id
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <PMEGantt goals={goals} profiles={profiles} isAdminView={isDirectivo} currentUserId={authUser?.id} onRefresh={fetchData} />
            <CuadroMandoScorecard goals={goals} />
            {canEdit && (
              <div className="relative" ref={createMenuRef}>
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-black transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Meta
                  <ChevronDown className={`w-3 h-3 transition-transform ${showCreateMenu ? "rotate-180" : ""}`} />
                </button>
                {showCreateMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 space-y-0.5">
                      <div onClick={() => setShowCreateMenu(false)}>
                        <CrearMetaManualModal />
                      </div>
                      <div className="w-full h-px bg-slate-100 my-1" />
                      <div onClick={() => setShowCreateMenu(false)}>
                        <ImportarPMEModal />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-6 space-y-6">

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <>
            {/* Page title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Panel Ejecutivo</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Gestión Estratégica · Mejorando Juntos PME</p>
              </div>
              <PMEAlertBanner goals={goals} />
            </div>

            {isBudgetExceeded && (
              <div className="p-4 bg-rose-50/90 backdrop-blur border border-rose-100 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-rose-900 text-sm">¡Sobregiro presupuestario detectado!</h4>
                  <p className="text-xs text-rose-700 mt-1 font-semibold leading-relaxed">
                    Has planificado <span className="font-black text-rose-900">${totalInversion.toLocaleString('es-CL')}</span> en habilitadores de PME, lo cual supera en <span className="font-black text-rose-900">${budgetOverdraft.toLocaleString('es-CL')}</span> los recursos SEP/PIE totales asignados a la institución (${budgetLimit.toLocaleString('es-CL')}).
                  </p>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  label="Metas Activas"
                  value={goals.length}
                  sub={`${goals.filter(g => g.pme_action_link).length} vinculadas al PME`}
                  icon={<Target className="w-4 h-4" />}
                />
                <KpiCard
                  label="Avance Global"
                  value={`${globalPct}%`}
                  sub={`${globalPhasesDone} de ${globalPhasesTotal} fases completadas`}
                  accent={globalPct >= 70 ? "text-emerald-600" : globalPct >= 40 ? "text-amber-600" : "text-blue-600"}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
                <KpiCard
                  label="Fases Vencidas"
                  value={overdueAlerts}
                  sub={overdueAlerts > 0 ? "Requieren atención inmediata" : "Todo dentro del plazo ✓"}
                  accent={overdueAlerts > 0 ? "text-rose-600" : "text-emerald-600"}
                  icon={<AlertTriangle className="w-4 h-4" />}
                />
                <KpiCard
                  label="Metas Logradas"
                  value={goalsCompleted}
                  sub={`${Math.round((goalsCompleted / Math.max(goals.length, 1)) * 100)}% de tasa de cierre`}
                  accent="text-amber-600"
                  icon={<Trophy className="w-4 h-4" />}
                />
              </div>
            )}

            {/* Deadline alerts */}
            {!loading && buildAlerts().length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {buildAlerts().slice(0, 3).map((a, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${a.type === "critical" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
                    <Clock className={`w-4 h-4 mt-0.5 ${a.type === "critical" ? "text-rose-500" : "text-amber-500"}`} />
                    <div className="min-w-0">
                      <p className={`text-[9px] font-black uppercase tracking-widest ${a.type === "critical" ? "text-rose-600" : "text-amber-600"}`}>
                        {a.days < 0 ? "Vencido" : `Vence en ${a.days} días`}
                      </p>
                      <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                      <p className="text-[9px] text-slate-500 truncate">{a.goal}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Analytics charts — only shown when there's indicator progress data */}
            {!loading && goals.length > 0 && (() => {
              const hasAnyProgress = goals.some(g =>
                g.implementation_phases?.some(p =>
                  p.indicators?.some((i: any) => i.current_value > 0)
                )
              );
              if (!hasAnyProgress) return (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100 rounded-2xl p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-xl shrink-0">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">La analítica se activará automáticamente</p>
                      <p className="text-xs text-slate-500 mt-0.5">Registra avances en los indicadores de tus fases para ver gráficos de salud PME, cobertura e inversión.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Ver Analítica
                  </button>
                </div>
              );
              return <PMEAnalytics goals={goals} profiles={profiles} pmeMap={pmeMap} budgetInfo={budgetInfo} />;
            })()}

            {/* Quick access to goals */}
            {!loading && goals.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-600 rounded-full block" />
                    Metas en Progreso
                  </h3>
                  <button
                    onClick={() => setActiveTab("goals")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Ver todas <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {kanbanGroups.in_progress.slice(0, 5).map(goal => {
                    const phasesDone = (goal.implementation_phases || []).filter(p => p.status === "completed").length;
                    const phasesTotal = (goal.implementation_phases || []).length;
                    const pct = phasesTotal > 0 ? Math.round((phasesDone / phasesTotal) * 100) : 0;
                    const goalEvidences = evidences.filter(e => e.goal_id === goal.id);

                    return (
                      <div
                        key={goal.id}
                        onClick={() => { setActiveTab("goals"); setExpandedGoals(p => ({ ...p, [goal.id]: true })); }}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 cursor-pointer group transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${pct >= 90 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-blue-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{goal.title}</p>
                          {goal.pme_action_link && pmeMap[goal.pme_action_link] && (
                            <p className="text-[9px] text-slate-400 uppercase font-bold">{pmeMap[goal.pme_action_link].dimension}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {goalEvidences.length > 0 && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-violet-600">
                              <Paperclip className="w-2.5 h-2.5" /> {goalEvidences.length}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full transition-all ${pct >= 90 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-blue-400"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500">{pct}%</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                        </div>
                      </div>
                    );
                  })}
                  {kanbanGroups.in_progress.length === 0 && (
                    <div className="px-5 py-8 text-center">
                      <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 font-medium">No hay metas en progreso aún</p>
                      {canEdit && (
                        <p className="text-xs text-slate-400 mt-1">Usa "Nueva Meta" para comenzar</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && goals.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <Target className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">Comienza tu Plan Estratégico</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Crea las primeras metas de tu PME de forma manual o importa el plan completo desde un archivo Excel.</p>
                {canEdit && (
                  <div className="flex justify-center gap-3">
                    <CrearMetaManualModal />
                    <ImportarPMEModal />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === "analytics" && !loading && (
          <>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Analítica Estratégica</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Métricas de rendimiento por dimensión y cobertura PME</p>
            </div>
            <PMEAnalytics goals={goals} profiles={profiles} pmeMap={pmeMap} budgetInfo={budgetInfo} />
          </>
        )}

        {/* ── GOALS TAB — KANBAN ── */}
        {activeTab === "goals" && !loading && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Metas Estratégicas</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{goals.length} metas · Vista Kanban por estado</p>
              </div>
              <button
                onClick={() => setExpandedGoals({})}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
              >
                <ChevronDown className="w-3.5 h-3.5" /> Colapsar todo
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold text-sm">Sin metas aún</p>
                <p className="text-slate-400 text-xs mt-1">Importa el PME o crea metas manualmente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                <KanbanColumn
                  title={`⬜ Pendiente (${kanbanGroups.pending.length})`}
                  color="bg-slate-100 text-slate-600"
                  goals={kanbanGroups.pending}
                  {...kanbanProps}
                />
                <KanbanColumn
                  title={`🔵 En Curso (${kanbanGroups.in_progress.length})`}
                  color="bg-blue-600 text-white"
                  goals={kanbanGroups.in_progress}
                  {...kanbanProps}
                />
                <KanbanColumn
                  title={`✅ Logradas (${kanbanGroups.completed.length})`}
                  color="bg-emerald-600 text-white"
                  goals={kanbanGroups.completed}
                  {...kanbanProps}
                />
              </div>
            )}
          </section>
        )}

        {/* ── PME TAB ── */}
        {activeTab === "pme" && !loading && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Vista por Dimensión PME</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                  Jerarquización estratégica · {pmeActions.length} acciones importadas
                </p>
              </div>
              <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                <Link2 className="w-3 h-3" />
                {goals.filter(g => g.pme_action_link).length} metas vinculadas
              </div>
            </div>

            {pmeActions.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                <Link2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No hay acciones PME importadas</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                  Usa el botón "Nueva Meta → Importar PME" para cargar las acciones desde tu archivo XLSX.
                </p>
                {canEdit && <div className="mt-4 flex justify-center"><ImportarPMEModal /></div>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-start">
                {DIMENSIONS.map(dim => {
                  const dimActions = pmeActions.filter(a => a.dimension === dim);
                  return (
                    <div key={dim} className="space-y-3">
                      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-center">
                        <h3 className="font-black text-[10px] uppercase tracking-widest">{dim}</h3>
                        <p className="text-[9px] text-slate-400 mt-0.5">{dimActions.length} acción{dimActions.length !== 1 ? "es" : ""}</p>
                      </div>
                      {dimActions.length === 0 ? (
                        <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                          <p className="text-xs text-slate-400">Sin acciones</p>
                        </div>
                      ) : (
                        dimActions.map(action => {
                          const linkedGoals = goals.filter(g => g.pme_action_link === action.id);
                          return (
                            <div
                              key={action.id}
                              className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
                                action.is_critical
                                  ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/30 ring-1 ring-amber-100"
                                  : "border-slate-200 hover:border-blue-200"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                {action.is_critical ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black bg-amber-100 text-amber-700 uppercase tracking-tight">
                                    <Flame className="w-2.5 h-2.5" /> Misión Crítica
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-semibold text-slate-400">{linkedGoals.length > 0 ? `${linkedGoals.length} meta${linkedGoals.length > 1 ? "s" : ""}` : "Sin metas"}</span>
                                )}
                                {canEdit && (
                                  <button
                                    onClick={() => handleToggleCritical(action.id, action.is_critical)}
                                    title={action.is_critical ? "Quitar Misión Crítica" : "Marcar como Misión Crítica"}
                                    className={`p-1 rounded-md transition-all ${action.is_critical ? "text-amber-500 bg-amber-100" : "text-slate-300 hover:text-amber-400 hover:bg-amber-50"}`}
                                  >
                                    <Sparkles className={`w-3.5 h-3.5 ${action.is_critical ? "fill-current" : ""}`} />
                                  </button>
                                )}
                              </div>
                              <h4 className={`font-bold text-xs leading-snug uppercase tracking-tight mb-3 ${action.is_critical ? "text-amber-900" : "text-slate-900"}`}>
                                {action.title}
                              </h4>
                              {linkedGoals.length > 0 && (
                                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                                  {linkedGoals.map(lg => (
                                    <button
                                      key={lg.id}
                                      onClick={() => { setActiveTab("goals"); setExpandedGoals(p => ({ ...p, [lg.id]: true })); }}
                                      className="w-full text-left flex items-start gap-2 p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
                                    >
                                      <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${action.is_critical ? "bg-amber-400" : "bg-blue-400"}`} />
                                      <p className="text-[9px] font-bold text-slate-600 group-hover:text-blue-700 leading-tight">{lg.title}</p>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}

                {/* Unlinked column */}
                <div className="space-y-3">
                  <div className="bg-rose-600 text-white px-4 py-2.5 rounded-xl text-center">
                    <h3 className="font-black text-[10px] uppercase tracking-widest">Por Vincular</h3>
                    <p className="text-[9px] text-rose-200 mt-0.5">{goals.filter(g => !g.pme_action_link).length} meta{goals.filter(g => !g.pme_action_link).length !== 1 ? "s" : ""}</p>
                  </div>
                  {goals.filter(g => !g.pme_action_link).map(goal => (
                    <div
                      key={goal.id}
                      onClick={() => { setActiveTab("goals"); startEdit(goal); }}
                      className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm cursor-pointer hover:border-rose-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-tight">Pendiente</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 uppercase leading-tight group-hover:text-rose-600">{goal.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── REPORTS TAB ── */}
        {activeTab === "reports" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Centro de Reportes</h2>
              <p className="text-xs text-slate-400 mt-0.5">Exportación y análisis de cumplimiento institucional</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all space-y-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-black text-slate-900">Roadmap PDF</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Copia vectorial del plan estratégico para carpetas técnicas y directivos.</p>
                <PMEGantt goals={goals} profiles={profiles} isAdminView={isDirectivo} currentUserId={authUser?.id} onRefresh={fetchData} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all space-y-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-900">Informe de Gestión IA</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Análisis automático de brechas y recomendaciones generadas por IA.</p>
                <InformeEjecutivoModal dashboardData={goals} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all space-y-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-900">Cuadro de Mando 360</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Vista ejecutiva de cumplimiento de misiones críticas.</p>
                <CuadroMandoScorecard goals={goals} />
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
