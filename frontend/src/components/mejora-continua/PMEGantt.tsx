"use client";

import { StrategicGoal } from "@/types/mejora_continua";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileDown, Server, X, User, Target, Calendar, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { exportGanttPDF, exportGanttXLSX, exportGanttPDFBackend } from "@/hooks/useGanttExport";
import { toast } from "sonner";

interface Props {
  goals: StrategicGoal[];
  profiles: any[];
  isAdminView?: boolean;
  currentUserId?: string;
}

export default function PMEGantt({ goals, profiles, isAdminView = true, currentUserId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterGoal, setFilterGoal] = useState<string>("all");
  const [filterLeader, setFilterLeader] = useState<string>("all");
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | "server" | null>(null);

  const handleExport = async (type: "pdf" | "xlsx" | "server") => {
    setExporting(type);
    try {
      const config = { goals: filteredData, profiles, filterGoal, filterLeader };
      if (type === "pdf") await exportGanttPDF(config);
      else if (type === "xlsx") await exportGanttXLSX(config);
      else await exportGanttPDFBackend(config);
      toast.success("Documento exportado correctamente.");
    } catch (e: any) {
      const msg = e.message || "Error al exportar. Intenta nuevamente.";
      toast.error(`Error: ${msg}`);
      console.error(e);
    } finally {
      setExporting(null);
    }
  };

  const filteredData = useMemo(() => {
    let result = [...goals];
    if (!isAdminView) {
        result = result.map(g => ({
            ...g,
            implementation_phases: g.implementation_phases?.filter(p => p.leader_id === currentUserId)
        })).filter(g => (g.implementation_phases?.length || 0) > 0);
    }
    if (filterGoal !== "all") {
        result = result.filter(g => g.id === filterGoal);
    }
    if (filterLeader !== "all") {
        result = result.map(g => ({
            ...g,
            implementation_phases: g.implementation_phases?.filter(p => p.leader_id === filterLeader)
        })).filter(g => (g.implementation_phases?.length || 0) > 0);
    }
    return result;
  }, [goals, isAdminView, currentUserId, filterGoal, filterLeader]);

  const allPhases = useMemo(() => {
    return filteredData.flatMap(g => g.implementation_phases || []);
  }, [filteredData]);

  const dateRange = useMemo(() => {
    if (allPhases.length === 0) return { start: new Date(), end: new Date() };
    let dates = allPhases.flatMap(p => [
        new Date(p.start_date || Date.now()).getTime(),
        new Date(p.end_date || Date.now()).getTime()
    ]);
    let min = new Date(Math.min(...dates));
    let max = new Date(Math.max(...dates));
    min.setDate(1);
    min.setMonth(min.getMonth() - 1);
    max.setMonth(max.getMonth() + 2);
    return { start: min, end: max };
  }, [allPhases]);

  const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const pixelsPerDay = 5;
  const chartWidth = totalDays * pixelsPerDay;
  const rowHeight = 48;
  const labelWidth = 260;

  const getX = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = d.getTime() - dateRange.start.getTime();
    return (diff / (1000 * 60 * 60 * 24)) * pixelsPerDay;
  };

  const months = useMemo(() => {
    const m = [];
    const curr = new Date(dateRange.start);
    while (curr <= dateRange.end) {
      m.push({
        label: curr.toLocaleString('es-ES', { month: 'short', year: 'numeric' }),
        x: getX(curr.toISOString())
      });
      curr.setMonth(curr.getMonth() + 1);
    }
    return m;
  }, [dateRange]);

  const leaderOptions = useMemo(() => {
      const set = new Set<string>();
      goals.forEach(g => g.implementation_phases?.forEach(p => { if(p.leader_id) set.add(p.leader_id) }));
      return Array.from(set).map(id => {
          const p = profiles.find(pr => pr.id === id);
          return { id, name: p ? (p.full_name || p.email) : `ID: ${id.slice(-4)}` };
      }).sort((a, b) => a.name.localeCompare(b.name));
  }, [goals, profiles]);

  const getProfileName = (id: string) => {
    const p = profiles.find(pr => pr.id === id);
    return p ? (p.full_name || p.email) : `ID: ${id.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-slate-800 transition-all border border-slate-700 shadow-sm active:scale-95 group">
          <Calendar className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-6 transition-transform" /> Roadmap
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[98vw] w-full h-[95vh] bg-white p-0 overflow-hidden flex flex-col border-none shadow-2xl rounded-xl z-[60]">
        <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between no-print bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 shadow-inner">
                <Target className="text-blue-400 w-5 h-5" />
            </div>
            <div>
                <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">ROADMAP ESTRATÉGICO</DialogTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Despliegue Estratégico <span className="w-1 h-1 rounded-full bg-slate-200"></span> 
                    {allPhases.length} Fases Activas
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
               <div className="flex items-center gap-1.5">
                   <Target className="w-3 h-3 text-slate-400" />
                   <select className="bg-transparent text-[10px] font-bold text-slate-600 outline-none uppercase cursor-pointer" value={filterGoal} onChange={e => setFilterGoal(e.target.value)}>
                       <option value="all">Filtro Objetivos</option>
                       {goals.map(g => <option key={g.id} value={g.id}>{g.title.toUpperCase()}</option>)}
                   </select>
               </div>
               <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
               <div className="flex items-center gap-1.5">
                   <User className="w-3 h-3 text-slate-400" />
                   <select className="bg-transparent text-[10px] font-bold text-slate-600 outline-none uppercase cursor-pointer" value={filterLeader} onChange={e => setFilterLeader(e.target.value)}>
                       <option value="all">Filtro Líderes</option>
                       {leaderOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name.toUpperCase()}</option>)}
                   </select>
               </div>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleExport("pdf")}
                disabled={!!exporting}
                className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider border border-slate-700 shadow-md transition-all active:scale-95"
              >
                {exporting === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <FileDown className="w-3.5 h-3.5 mr-1.5 text-blue-400" />}
                PDF
              </Button>
              <Button
                onClick={() => handleExport("server")}
                disabled={!!exporting}
                className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                {exporting === "server" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Server className="w-3.5 h-3.5 mr-1.5" />}
                PDF Pro
              </Button>
              <Button
                onClick={() => handleExport("xlsx")}
                disabled={!!exporting}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                {exporting === "xlsx" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />}
                Excel
              </Button>
            </div>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-50/50">

          <div className="min-w-max p-8">
            <svg width={labelWidth + chartWidth + 100} height={(allPhases.length + 1) * rowHeight + 100} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible print:shadow-none print:border-none">
              <g transform={`translate(${labelWidth}, 60)`}>
                {months.map((m, i) => (
                  <g key={i} transform={`translate(${m.x}, 0)`}>
                    <line y1="0" y2={(allPhases.length) * rowHeight} stroke="#F1F5F9" strokeWidth="1" />
                    <text y="-15" textAnchor="start" fontSize="9" fontWeight="700" className="fill-slate-400 uppercase">
                      {m.label}
                    </text>
                  </g>
                ))}
              </g>

              <g transform="translate(30, 60)">
                {allPhases.map((phase, i) => {
                  const x = getX(phase.start_date || Date.now().toString());
                  const endX = getX(phase.end_date || Date.now().toString());
                  const width = Math.max(endX - x, 40);
                  const isCompleted = phase.status === 'completed';
                  const leaderName = getProfileName(phase.leader_id || "");
                  
                  return (
                    <g key={phase.id} transform={`translate(0, ${i * rowHeight})`}>
                      <line x1="0" x2={labelWidth + chartWidth} y1={rowHeight} y2={rowHeight} stroke="#F8FAFC" strokeWidth="1" />
                      
                      <foreignObject x="0" y="0" width={labelWidth - 40} height={rowHeight}>
                        <div className="h-full flex flex-col justify-center pr-4">
                          <p className="text-[10px] font-bold text-slate-800 leading-tight truncate">{phase.title}</p>
                          <p className="text-[8px] font-medium text-slate-400 mt-0.5">{leaderName}</p>
                        </div>
                      </foreignObject>

                      <rect 
                        x={labelWidth - 30 + x} 
                        y={rowHeight/4} 
                        width={width} 
                        height={16} 
                        rx="8"
                        className={`${isCompleted ? 'fill-emerald-500' : 'fill-blue-500'}`}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between no-print">
            <div className="flex gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[9px] font-bold uppercase text-slate-500">Logrado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-[9px] font-bold uppercase text-slate-500">En Ejecución</span>
                </div>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase italic">
                ProfeIC 360 • Roadmap de Gestión
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function translateStatus(s: string) {
    const map: any = { 'pending': 'P', 'in_progress': 'A', 'completed': 'L' };
    return map[s] || s;
}
