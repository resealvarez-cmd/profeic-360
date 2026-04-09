"use client";

import { useEffect, useState } from "react";
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
  Paperclip, FileText, Upload, CheckCircle2, Star, Trophy, Flame
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const DIMENSIONS = ['Gestión Pedagógica', 'Liderazgo', 'Convivencia Escolar', 'Gestión de Recursos'];

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

// ---------------------------------------------------------------------------
// Badge de gamificación
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
// Componente principal
// ---------------------------------------------------------------------------
export default function MejoraContinuaDashboard() {
  const { isDirectivo, user: authUser, currentSchoolId: authSchoolId } = useAuth();
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

  const canEdit = isDirectivo;
  const pmeMap = Object.fromEntries(pmeActions.map(a => [a.id, a]));

  // -------------------------------------------------------------------------
  // Carga de datos
  // -------------------------------------------------------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Obtener school_id
      let schoolId = authSchoolId;
      if (!schoolId && authUser) {
        const { data: pData } = await supabase.from("profiles").select("school_id").eq("id", authUser.id).single();
        if (pData) schoolId = pData.school_id;
      }

      // 2. Cargar metas (sin filtro school_id — lo maneja RLS)
      const { data: goalsRaw, error: goalsError } = await supabase
        .from("strategic_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (goalsError) throw goalsError;
      const typedGoals = (goalsRaw || []) as StrategicGoal[];

      if (typedGoals.length > 0) {
        const goalIds = typedGoals.map(g => g.id);

        // 3. Fases y evidencias en paralelo
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

      // 4. Perfiles
      const [profRes, authRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("authorized_users").select("email, role"),
      ]);
      if (profRes.data && authRes.data) {
        setProfiles(profRes.data.map(p => ({
          ...p,
          role: authRes.data?.find(a => a.email?.toLowerCase() === p.email?.toLowerCase())?.role || "teacher",
        })));
      }

      // 5. Acciones PME — con fallback si school_id no existe
      if (schoolId) {
        const { data: pmeFiltered, error: pmeErr } = await supabase
          .from("pme_actions")
          .select("*")
          .eq("school_id", schoolId)
          .order("dimension");

        if (!pmeErr && pmeFiltered && pmeFiltered.length > 0) {
          setPmeActions(pmeFiltered);
        } else {
          // Fallback: traer todas las acciones sin filtro
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
  };

  const saveEdit = async (goalId: string) => {
    const { error } = await supabase.from("strategic_goals").update({ title: editTitle, description: editDesc, pme_action_link: editPmeLink }).eq("id", goalId);
    if (!error) { setEditingGoalId(null); fetchData(); }
  };

  const mgmtProfiles = profiles.filter(p => ["admin", "director", "utp", "sostenedor"].includes(p.role?.toLowerCase()));
  const totalInversion = goals.reduce((acc, g) => acc + (g.implementation_phases?.reduce((pa, p) => pa + (p.enablers?.reduce((ea, e) => ea + (e.estimated_cost || 0), 0) || 0), 0) || 0), 0);

  // -------------------------------------------------------------------------
  // Alertas de vencimiento
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
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* NAV */}
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
                { id: "dashboard", label: "Dashboard" },
                { id: "analytics", label: "Analítica" },
                { id: "goals", label: "Metas" },
                { id: "pme", label: "Vista PME" },
                { id: "reports", label: "Reportes" },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all ${
                    activeTab === t.id
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <PMEGantt goals={goals} profiles={profiles} isAdminView={isDirectivo} currentUserId={authUser?.id} />
            {canEdit && <ImportarPMEModal />}
            {canEdit && <CrearMetaManualModal />}
            <CuadroMandoScorecard goals={goals} />
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-6 space-y-6">

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <>
            {/* Header + inversión */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Gestión Estratégica Institucional</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Plataforma colaborativa · Mejorando Juntos PME</p>
              </div>
              <div className="flex items-center gap-4">
                {totalInversion > 0 && (
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inversión total</p>
                    <p className="text-lg font-black text-slate-900">${totalInversion.toLocaleString("es-CL")}</p>
                  </div>
                )}
                <PMEAlertBanner goals={goals} />
              </div>
            </div>

            {/* Alertas vencimiento */}
            {buildAlerts().length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {buildAlerts().slice(0, 3).map((a, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${a.type === "critical" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
                    <Clock className={`w-4 h-4 mt-0.5 ${a.type === "critical" ? "text-rose-500" : "text-amber-500"}`} />
                    <div className="min-w-0">
                      <p className={`text-[9px] font-black uppercase tracking-widest ${a.type === "critical" ? "text-rose-600" : "text-amber-600"}`}>
                        {a.days < 0 ? "Vencido" : `Vence en ${a.days} días`}
                      </p>
                      <p className="text-xs font-bold text-slate-800 truncate">{a.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center h-52 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest">Cargando datos...</p>
              </div>
            ) : (
              <PMEAnalytics goals={goals} profiles={profiles} pmeMap={pmeMap} />
            )}
          </>
        )}

        {/* ── ANALÍTICA ── */}
        {activeTab === "analytics" && !loading && (
          <PMEAnalytics goals={goals} profiles={profiles} pmeMap={pmeMap} />
        )}

        {/* ── METAS ── */}
        {(activeTab === "goals" || activeTab === "dashboard") && !loading && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-600 rounded-full block" />
                Bitácora de Metas Estratégicas ({goals.length})
              </h3>
              <button onClick={() => { setExpandedGoals({}); setExpandedPhases({}); }} className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                <ChevronDown className="w-3.5 h-3.5" /> Colapsar todo
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold text-sm">Sin metas aún</p>
                <p className="text-slate-400 text-xs mt-1">Importa el PME o crea metas manualmente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map(goal => {
                  const goalEvidences = evidences.filter(e => e.goal_id === goal.id);
                  const phasesDone = (goal.implementation_phases || []).filter(p => p.status === "completed").length;
                  const phasesTotal = (goal.implementation_phases || []).length;
                  const pct = phasesTotal > 0 ? Math.round((phasesDone / phasesTotal) * 100) : 0;

                  return (
                    <div key={goal.id} className={`bg-white rounded-xl border shadow-sm transition-all ${expandedGoals[goal.id] ? "ring-1 ring-blue-100" : "hover:border-slate-300"} border-slate-200`}>
                      {/* Cabecera de meta */}
                      <div
                        className={`p-4 cursor-pointer flex items-center justify-between gap-3 ${expandedGoals[goal.id] ? "border-b border-slate-100" : ""}`}
                        onClick={() => setExpandedGoals(prev => ({ ...prev, [goal.id]: !prev[goal.id] }))}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Semáforo */}
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-blue-400"}`} />

                          {editingGoalId === goal.id ? (
                            <div className="flex-1 space-y-2" onClick={e => e.stopPropagation()}>
                              <Input
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="h-9 text-sm font-bold text-slate-900 border-blue-300 bg-white"
                                placeholder="Título del objetivo..."
                              />
                              <Textarea
                                value={editDesc}
                                onChange={e => setEditDesc(e.target.value)}
                                className="text-xs text-slate-700 border-blue-200 bg-white"
                                placeholder="Descripción..."
                              />
                              <div className="flex items-center gap-2">
                                <select
                                  className="flex-1 text-xs font-semibold text-slate-800 bg-white border border-blue-200 rounded-lg px-2 py-1.5"
                                  value={editPmeLink || ""}
                                  onChange={e => setEditPmeLink(e.target.value || null)}
                                >
                                  <option value="">-- Sin vinculación PME --</option>
                                  {pmeActions.map(a => (
                                    <option key={a.id} value={a.id}>({a.dimension}) {a.title}</option>
                                  ))}
                                </select>
                                <Button size="sm" onClick={() => saveEdit(goal.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black">Guardar</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingGoalId(null)} className="text-slate-400 text-xs">Cancelar</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <h4 className="text-sm font-bold text-slate-900 truncate">{goal.title}</h4>
                                {goal.pme_action_link && pmeMap[goal.pme_action_link] && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                    🔗 {pmeMap[goal.pme_action_link].dimension}
                                  </span>
                                )}
                                <GoalBadge goal={goal} evidenceCount={goalEvidences.length} />
                              </div>
                              {!expandedGoals[goal.id] && (
                                <div className="flex items-center gap-3 mt-1">
                                  {phasesTotal > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${pct >= 90 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-blue-400"} transition-all`} style={{ width: `${pct}%` }} />
                                      </div>
                                      <span className="text-[10px] font-black text-slate-500">{pct}%</span>
                                    </div>
                                  )}
                                  {goalEvidences.length > 0 && (
                                    <span className="flex items-center gap-1 text-[9px] font-black text-violet-600">
                                      <Paperclip className="w-2.5 h-2.5" /> {goalEvidences.length} evidencia{goalEvidences.length > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {canEdit && (
                            <button
                              onClick={e => { e.stopPropagation(); startEdit(goal); }}
                              className="p-1.5 text-slate-300 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedGoals[goal.id] ? "rotate-180 text-blue-600" : ""}`} />
                        </div>
                      </div>

                      {/* Cuerpo expandido */}
                      {expandedGoals[goal.id] && (
                        <div className="p-4 space-y-4 bg-slate-50/40">
                          {goal.description && (
                            <p className="text-xs text-slate-500 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                              "{goal.description}"
                            </p>
                          )}

                          {/* FASES */}
                          {(goal.implementation_phases || []).map((phase, pIdx) => {
                            const phaseEvidences = evidences.filter(e => e.phase_id === phase.id);
                            return (
                              <div key={phase.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                {/* Cabecera de fase */}
                                <div
                                  className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${expandedPhases[phase.id] ? "border-b border-slate-100" : ""}`}
                                  onClick={() => setExpandedPhases(prev => ({ ...prev, [phase.id]: !prev[phase.id] }))}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">{pIdx + 1}</span>
                                    <span className="text-sm font-bold text-slate-700">{phase.title}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {/* Contador evidencias */}
                                    {phaseEvidences.length > 0 && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-100 rounded-full text-[9px] font-black text-violet-600">
                                        <Paperclip className="w-2.5 h-2.5" /> {phaseEvidences.length}
                                      </span>
                                    )}
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${phase.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                      {translateStatus(phase.status)}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                                      {new Date(phase.end_date).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                                    </span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform ${expandedPhases[phase.id] ? "rotate-180 text-blue-500" : ""}`} />
                                  </div>
                                </div>

                                {/* Cuerpo de fase */}
                                {expandedPhases[phase.id] && (
                                  <div className="p-4 space-y-5">

                                    {/* ── EVIDENCIAS ── */}
                                    <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h6 className="text-[10px] font-black text-violet-700 uppercase tracking-widest flex items-center gap-1.5">
                                          <Paperclip className="w-3 h-3" /> Evidencias de Cumplimiento
                                        </h6>
                                        {/* Botón prominente para subir */}
                                        <SubirEvidenciaModal
                                          phaseId={phase.id}
                                          goalId={goal.id}
                                          onSuccess={fetchData}
                                        />
                                      </div>

                                      {phaseEvidences.length === 0 ? (
                                        <div className="text-center py-5 border border-dashed border-violet-200 rounded-lg bg-white/50">
                                          <Upload className="w-6 h-6 text-violet-300 mx-auto mb-2" />
                                          <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Sin documentos cargados</p>
                                          <p className="text-[9px] text-slate-400 mt-0.5">Usa el botón "Subir" para agregar evidencias</p>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {phaseEvidences.map(ev => (
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
                                          {mgmtProfiles.map(p => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                                        </select>
                                      </div>
                                    </div>

                                    {/* Indicadores */}
                                    {(phase.indicators || []).length > 0 && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {phase.indicators?.map((ind: any) => (
                                          <div key={ind.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-start mb-3">
                                              <div>
                                                <p className="text-[9px] font-black text-blue-600 uppercase">Indicador</p>
                                                <p className="text-xs font-bold text-slate-700 leading-tight mt-0.5">{ind.description}</p>
                                              </div>
                                              <ActualizarProgresoModal indicator={ind} phaseId={phase.id} />
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
            )}
          </section>
        )}

        {/* ── VISTA PME ── */}
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
                  Usa el botón "Importar PME" (arriba a la derecha) para cargar las acciones desde tu archivo XLSX.
                </p>
                {canEdit && (
                  <div className="mt-4 flex justify-center">
                    <ImportarPMEModal />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-start">
                {DIMENSIONS.map(dim => {
                  const dimActions = pmeActions.filter(a => a.dimension === dim);
                  return (
                    <div key={dim} className="space-y-3">
                      {/* Header dimensión */}
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
                              {/* Badge crítico + toggle */}
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

                              {/* Metas vinculadas */}
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

                {/* Columna sin vincular */}
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

        {/* ── REPORTES ── */}
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
                <PMEGantt goals={goals} profiles={profiles} isAdminView={isDirectivo} currentUserId={authUser?.id} />
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
