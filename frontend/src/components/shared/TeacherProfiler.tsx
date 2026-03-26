"use client";

import { useState, useEffect } from "react";
import { 
  X, Users, Calendar, BrainCircuit, Target, Trophy, Eye, AlertCircle, Loader2, Sparkles, CheckCircle 
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TeacherProfilerProps {
  teacherId: string;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export function TeacherProfiler({ teacherId, isOpen, onClose, userRole = 'director' }: TeacherProfilerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen && teacherId) {
      fetchTeacherDetail();
    }
  }, [isOpen, teacherId]);

  const handleExport = async () => {
    if (!teacherId) return;
    setIsExporting(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/acompanamiento/export-trajectory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId })
      });

      if (!response.ok) throw new Error("Error al generar el informe");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Perfil_${data.teacher_name?.replace(/\s+/g, '_') || 'Docente'}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Informe exportado correctamente");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("No se pudo exportar el informe");
    } finally {
      setIsExporting(false);
    }
  };

  const fetchTeacherDetail = async () => {
    setLoading(true);
    setData(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      console.log(`[Profiler] Fetching trajectory for ${teacherId} at ${API_URL}`);
      
      // 1. Fetch Trajectory Analysis (IA)
      const response = await fetch(`${API_URL}/acompanamiento/trajectory-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: teacherId })
      });

      console.log(`[Profiler] AI Status: ${response.status}`);

      // 2. Fetch Gamification Skills (Supabase)
      const { data: skillsData, error: skillsError } = await supabase
        .from('teacher_skills')
        .select('*')
        .eq('teacher_id', teacherId);

      if (skillsError) console.error("[Profiler] Skills DB Error:", skillsError);

      if (response.ok) {
        const trajectoryData = await response.json();
        setData({ ...trajectoryData, skills: skillsData || [] });
      } else {
        const errorText = await response.text();
        console.error(`[Profiler] IA Error: ${response.status} - ${errorText}`);
        // Fallback if IA fails but we have skills
        setData({ 
          teacher_name: "Docente", 
          skills: skillsData || [],
          trajectory_analysis: null 
        });
      }
    } catch (error: any) {
      console.error("[Profiler] Critical Error loading teacher profiler:", error);
      toast.error(`Error de conexión: ${error.message || 'Se agotó el tiempo de espera'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto relative animate-in slide-in-from-right duration-300 border-l border-slate-100 font-sans">
        {/* Header */}
        <div className="bg-[#1B3C73] p-6 text-white sticky top-0 z-10 shadow-md">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-black flex items-center gap-3 text-white">
            <Users className="text-orange-400" size={28} />
            Perfilador Docente
          </h2>
          <p className="text-blue-100 text-sm mt-2 opacity-90 font-medium">Trayectoria basada en evidencia didáctica 360°</p>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="w-16 h-16 rounded-full border-4 border-slate-50 border-t-[#C87533] animate-spin shadow-inner"></div>
              <div className="text-center">
                <p className="text-slate-600 font-bold text-lg animate-pulse">Sincronizando con IA...</p>
                <p className="text-slate-400 text-sm">Analizando historial de acompañamiento</p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Profile Card */}
              <div className="text-center bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Target size={120} />
                </div>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1B3C73] to-[#2A59A8] text-white text-4xl font-black shadow-2xl mb-6 transform -rotate-3 relative z-10">
                  {data.teacher_name?.charAt(0) || 'D'}
                </div>
                <h3 className="text-3xl font-black text-[#1B3C73] tracking-tight relative z-10">{data.teacher_name || 'Docente'}</h3>
                
                <div className="flex flex-col items-center gap-3 mt-4 relative z-10">
                  <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <CheckCircle size={14} className="text-orange-400" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{data.total_cycles || 0} Ciclos Cerrados</span>
                  </div>

                  {data.observers && data.observers.length > 0 && (
                    <div className="flex flex-col items-center gap-2 mt-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Observado por:</span>
                       <div className="flex flex-wrap justify-center gap-1.5">
                          {data.observers.map((obs: string) => (
                            <span key={obs} className="text-[10px] bg-white text-[#1B3C73] font-bold px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                              {obs}
                            </span>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 text-center shadow-sm">
                  <span className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Cierre de Ciclos</span>
                  <span className="text-3xl font-black text-[#1a2e3b]">{data.closure_rate || 0}%</span>
                </div>
                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 text-center shadow-sm">
                  <span className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">KPI Didáctico</span>
                  <span className="text-3xl font-black text-[#C87533]">{data.depth_index || 0}%</span>
                </div>
              </div>

              {/* Trajectory Report & AI Conclusion */}
              <div className="bg-[#1B3C73] text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
                <BrainCircuit className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-110 transition-transform duration-700" size={240} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <BrainCircuit size={20} className="text-orange-400" />
                    </div>
                    <h4 className="font-black text-lg tracking-tight uppercase tracking-widest">Conclusión del Acompañamiento</h4>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-black uppercase text-orange-400 tracking-widest mb-2 block">Evidencia y Síntesis IA</span>
                      <p className="text-sm text-blue-50 leading-relaxed font-medium italic">
                        "{data.trajectory_analysis?.summary || 'Sincronizando conclusiones del último proceso de acompañamiento...'}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                        <span className="text-[9px] font-black uppercase text-green-400 mb-2 block">Principales Fortalezas</span>
                        <ul className="text-[11px] text-green-50 space-y-1 list-disc list-inside">
                          {data.trajectory_analysis?.strengths && data.trajectory_analysis.strengths.length > 0 ? (
                            data.trajectory_analysis.strengths.map((s: string) => (
                              <li key={s}>{s}</li>
                            ))
                          ) : (
                            <li className="opacity-50 italic list-none">Identificando fortalezas...</li>
                          )}
                        </ul>
                      </div>
                      <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
                        <span className="text-[9px] font-black uppercase text-orange-400 mb-2 block">Oportunidades</span>
                        <ul className="text-[11px] text-orange-50 space-y-1 list-disc list-inside">
                          {data.trajectory_analysis?.gaps && data.trajectory_analysis.gaps.length > 0 ? (
                            data.trajectory_analysis.gaps.map((g: string) => (
                              <li key={g}>{g}</li>
                            ))
                          ) : (
                            <li className="opacity-50 italic list-none">Analizando brechas...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Suggestions */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <h4 className="font-black text-[#1B3C73] text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-orange-400" />
                  Capacitaciones Sugeridas (IA)
                </h4>
                <div className="space-y-3">
                  {data.trajectory_analysis?.suggested_training && data.trajectory_analysis.suggested_training.length > 0 ? (
                    data.trajectory_analysis.suggested_training.map((t: string) => (
                      <div key={t} className="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-[#1B3C73] transition-all cursor-pointer">
                        <div className="bg-orange-400 p-2 rounded-xl text-white mt-0.5 group-hover:bg-[#1B3C73] transition-colors">
                          <Target size={16} />
                        </div>
                        <span className="text-xs font-bold leading-tight text-slate-700">{t}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Sugerencias disponibles tras finalizar el primer ciclo de acompañamiento.</p>
                  )}
                </div>
              </div>

              {/* Skills / Medals */}
              <div className="space-y-4">
                <h4 className="font-black text-[#1a2e3b] text-lg flex items-center gap-3 px-2">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Trophy size={18} className="text-[#C87533]" />
                  </div>
                  Medallero y Skills
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.skills && data.skills.length > 0 ? data.skills.map((skill: any) => {
                    const lvlIcons: Record<string, string> = { 'Novato': '🌱', 'Competente': '⭐', 'Referente': '🔥', 'Mentor': '👑' };
                    const xp = skill.total_xp || 0;
                    const lvlName = skill.current_level || 'Novato';
                    
                    let floor = 0, ceil = 150, maxedOut = false;
                    if(xp >= 500) { floor = 500; ceil = 500; maxedOut = true; }
                    else if(xp >= 300) { floor = 300; ceil = 500; }
                    else if(xp >= 150) { floor = 150; ceil = 300; }
                    const progressPercent = maxedOut ? 100 : Math.round(((xp - floor) / (ceil - floor)) * 100);

                    return (
                      <div key={skill.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-[#C87533]/30 transition-all group overflow-hidden relative">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="min-w-0">
                            <h5 className="font-bold text-[#1a2e3b] text-sm truncate pr-2">{skill.skill_name}</h5>
                            <span className="inline-flex mt-2 items-center gap-1.5 bg-slate-50 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border border-slate-100">
                              {lvlIcons[lvlName] || '✨'} {lvlName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block text-xl font-black text-[#C87533] leading-none">{xp}</span>
                            <span className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">XP</span>
                          </div>
                        </div>
                        
                        <div className="relative z-10 mt-2">
                          <div className="flex justify-between text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">
                            <span>Siguiente Rango</span>
                            <span>{maxedOut ? 'MAX' : `${progressPercent}%`}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner font-bold">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                maxedOut ? "bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/20" : "bg-[#1a2e3b]"
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="col-span-2 text-center p-12 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                        <Sparkles size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-500 font-bold max-w-[200px] mx-auto leading-relaxed">Sin insignias desbloqueadas en este periodo.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col gap-4 pt-6">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full py-5 bg-[#1B3C73] hover:bg-[#2A59A8] text-white font-black rounded-2xl shadow-xl shadow-blue-900/10 transition-all text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} className="text-orange-400" />}
                  {isExporting ? "GENERANDO INFORME..." : "EXPORTAR INFORME (WORD)"}
                </button>
                <button
                  onClick={() => router.push(`/acompanamiento/docentes?q=${encodeURIComponent(data.teacher_name)}`)}
                  className="w-full py-5 bg-slate-50 hover:bg-slate-100 text-[#1B3C73] font-black rounded-2xl border border-slate-200 transition-all text-sm flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Eye size={20} />
                  VER EXPEDIENTE COMPLETO
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-40 bg-slate-50 rounded-[3rem] border border-slate-100 mx-4">
              <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-bold">Error al cargar datos del docente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
