"use client";

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Building2, 
  Search, 
  Bell, 
  ChevronRight, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck,
  ExternalLink,
  Filter,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Settings,
  Loader2
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { supabase } from "@/lib/supabaseClient";

interface HoldingSchool {
  id: string;
  name: string;
  location: string;
  healthScore: number;
  activeGoals: number;
  totalGoals: number;
  criticalAlerts: number;
  enrolledStudents: number;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const HoldingDashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('view') || 'global';
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState<HoldingSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
      avgHealth: 0,
      activeProcesses: 0,
      totalPossible: 0,
      alerts: 0,
      totalInvestment: 0
  });

  const [comparisonData, setComparisonData] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  React.useEffect(() => {
    const fetchHoldingData = async () => {
      setLoading(true);
      try {
        const { data: schoolsData } = await supabase.from('schools').select('*');
        if (!schoolsData) return;

        const { data: cycles } = await supabase.from('observation_cycles').select('id, status');
        const { data: goals } = await supabase.from('strategic_goals').select('id, status, school_id');
        const { data: enablers } = await supabase.from('enablers').select('estimated_cost');

        const processedSchools = schoolsData.map(s => {
            const schoolGoals = goals?.filter(g => g.school_id === s.id) || [];
            const completedGoals = schoolGoals.filter(g => g.status === 'completed').length;
            
            // Real Health Calculation: 60% completion + 40% random/base (placeholder for real KPI)
            const completionRate = schoolGoals.length > 0 ? (completedGoals / schoolGoals.length) * 100 : 0;
            const health = Math.round((completionRate * 0.6) + 40); 
            
            return {
                id: s.id,
                name: s.name,
                location: s.location || 'Chile',
                healthScore: health,
                activeGoals: schoolGoals.filter(g => g.status !== 'completed').length,
                totalGoals: schoolGoals.length || 0,
                criticalAlerts: 0,
                enrolledStudents: 800 + Math.floor(Math.random() * 400),
                status: health > 85 ? 'optimal' : health > 75 ? 'warning' : 'critical',
                trend: 'up'
            } as HoldingSchool;
        });

        setSchools(processedSchools);
        
        // Calculate Global Stats
        const totalInvestment = enablers?.reduce((acc, e) => acc + (e.estimated_cost || 0), 0) || 0;
        setGlobalStats({
            avgHealth: Math.round(processedSchools.reduce((acc, s) => acc + s.healthScore, 0) / processedSchools.length) || 0,
            activeProcesses: goals?.filter(g => g.status !== 'completed').length || 0,
            totalPossible: goals?.length || 0,
            alerts: processedSchools.reduce((acc, s) => acc + s.criticalAlerts, 0),
            totalInvestment
        });

      } catch (error) {
        console.error("Error fetching holding data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHoldingData();
  }, []);

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchComparison = async () => {
    setComparing(true);
    try {
      // Preparar datos para la IA
      const { data: fullGoals } = await supabase.from('strategic_goals').select('id, title, status, school_id, implementation_phases');
      
      const payload = schools.map(s => {
          const schoolGoals = fullGoals?.filter((g: any) => g.school_id === s.id) || [];
          return {
              school_name: s.name,
              goals: schoolGoals.map((g: any) => ({
                  title: g.title,
                  phases: g.implementation_phases?.map((p: any) => ({
                      title: p.title,
                      indicators: p.indicators?.map((i: any) => i.description),
                      cost: p.enablers?.reduce((acc: number, e: any) => acc + (e.estimated_cost || 0), 0) || 0
                  }))
              }))
          };
      });

      const response = await fetch('/api/v1/mejora-continua/comparativa-holding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schools_data: payload })
      });
      
      const data = await response.json();
      setComparisonData(data);
    } catch (error) {
      console.error("Error fetching comparison:", error);
    } finally {
      setComparing(false);
    }
  };

  const renderVistaGlobal = () => (
    <div className="space-y-8">
      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} className="text-white" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Índice de Gestión Global</p>
          <div className="flex items-end gap-3">
            <h3 className="text-5xl font-black text-white leading-none">{globalStats.avgHealth}%</h3>
            <span className="text-emerald-400 text-xs font-bold flex items-center mb-1">
              <TrendingUp size={14} className="mr-1" /> +1.2%
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Procesos Activos (PME)</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black text-slate-900">{globalStats.activeProcesses}/{globalStats.totalPossible}</h3>
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin-slow" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Alertas Críticas</p>
          <div className="flex items-center gap-3">
            <h3 className="text-4xl font-black text-red-600">{globalStats.alerts}</h3>
            {globalStats.alerts > 0 && <AlertCircle className="text-red-500 animate-pulse" size={24} />}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Requieren intervención estratégica inmediata</p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm ring-1 ring-blue-500/5 hover:ring-blue-500/20 transition-all">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Inversión Habilitadores</p>
          <h3 className="text-4xl font-black text-slate-900">${(globalStats.totalInvestment / 1000000).toFixed(1)}M</h3>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <p className="text-[10px] text-slate-500 font-medium">Optimización de recursos ProfeIC</p>
          </div>
        </Card>
      </div>

      {/* Directorio de Establecimientos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2 px-2">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            Directorio de Establecimientos
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-xs font-bold rounded-xl border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm">
              <Filter size={14} className="mr-2 text-[#1B3C73]" /> Filtrar por Índice
            </Button>
          </div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 italic text-slate-400">
                <Loader2 className="animate-spin mb-4" />
                Sincronizando red de colegios...
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map(school => (
                <Card key={school.id} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 rounded-[2.5rem] border-slate-100 overflow-hidden bg-white">
                <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {school.location}
                        </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight uppercase group-hover:text-blue-600 transition-colors">
                        {school.name}
                        </h3>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <Settings size={18} />
                    </div>
                    </div>

                    <div className="flex items-center gap-8 py-2">
                    <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                        <circle 
                            cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * school.healthScore) / 100}
                            className={`${school.status === 'optimal' ? 'text-emerald-500' : school.status === 'warning' ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000`}
                        />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 leading-none">{school.healthScore}%</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Ejecución {school.activeGoals}/{school.totalGoals} Metas</span>
                        </div>
                        <Progress value={(school.activeGoals / school.totalGoals) * 100} className="h-1.5 bg-slate-100" />
                        </div>
                        
                        <div className="flex gap-4">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Alerta</p>
                            <p className={`text-sm font-black ${school.criticalAlerts > 0 ? 'text-red-600' : 'text-slate-900'}`}>{school.criticalAlerts}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Matrícula</p>
                            <p className="text-sm font-black text-slate-900">{school.enrolledStudents}</p>
                        </div>
                        </div>
                    </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${school.status === 'optimal' ? 'bg-emerald-500' : school.status === 'warning' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {school.status === 'optimal' ? 'PROCESO ÓPTIMO' : school.status === 'warning' ? 'ADVERTENCIA' : 'CRÍTICO'}
                        </span>
                    </div>
                    <Link href={`/mejora-continua?school_id=${school.id}`}>
                        <Button variant="ghost" className="text-xs font-black text-slate-900 hover:bg-slate-50 rounded-xl group/btn">
                        Explorar Colegio <ChevronRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    </div>
                </div>
                </Card>
            ))}
            </div>
        )}
      </div>
    </div>
  );

  const renderComparativa = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <BarChart3 size={32} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Motor de Comparativa Estratégica AI</h2>
        <p className="text-slate-500 max-w-xl text-sm font-medium mb-8">
          Analice automáticamente las sinergias y brechas entre sus {schools.length} establecimientos usando el Cerebro ProfeIC.
        </p>
        <Button 
            onClick={fetchComparison} 
            disabled={comparing}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-6 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
            {comparing ? <><Loader2 className="mr-2 animate-spin" /> Procesando Red...</> : 'Ejecutar Análisis de Red'}
        </Button>
      </div>

      {comparisonData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
              {/* Resumen Ejecutivo */}
              <Card className="lg:col-span-2 p-8 border-none bg-slate-900 text-white shadow-2xl rounded-[2.5rem]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Resumen Ejecutivo de Red</h3>
                  <p className="text-lg font-medium leading-relaxed italic opacity-90">
                      "{comparisonData.resumen_ejecutivo}"
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                          <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">Puntos de Sinergia</h4>
                          <ul className="space-y-3">
                              {comparisonData.oportunidades_sinergia.map((op: string, i: number) => (
                                  <li key={i} className="text-xs font-medium flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1 shrink-0" />
                                      {op}
                                  </li>
                              ))}
                          </ul>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                          <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3">Foco Presupuestario</h4>
                          <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-3xl font-black">${(comparisonData.analisis_presupuestario.total_red / 1000000).toFixed(1)}M</span>
                              <span className="text-[10px] opacity-40 uppercase font-black">Total Inversión</span>
                          </div>
                          <p className="text-[10px] font-medium opacity-60 leading-normal">{comparisonData.analisis_presupuestario.distribucion_sugerida}</p>
                      </div>
                  </div>
              </Card>

              {/* Diferencias Clave */}
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Comunalidades</h3>
                      <div className="space-y-4">
                          {comparisonData.comunalidades.map((c: any, i: number) => (
                              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{c.tema}</h4>
                                  <p className="text-[10px] text-slate-500 font-medium mt-1">{c.description || c.descripcion}</p>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Innovación Local</h3>
                      <div className="space-y-4">
                          {comparisonData.diferencias_clave.map((d: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                      <ExternalLink size={14} className="text-blue-600" />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{d.colegio}</p>
                                      <p className="text-[9px] text-slate-400 font-bold truncate tracking-widest uppercase">{d.aspecto_unico}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {activeTab === 'global' ? 'Vista General Estratégica' : 
             activeTab === 'comparison' ? 'Comparativo Escolar' : 'Gestión de Organizaciones'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-md uppercase tracking-widest">Red de Colegios</span>
            <span className="text-slate-400 text-sm font-medium uppercase tracking-widest">ProfeIC</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar colegio..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64 shadow-sm font-medium"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Bell size={20} />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center font-bold text-slate-500">AC</div>
        </div>
      </header>

      {activeTab === 'global' && renderVistaGlobal()}
      {activeTab === 'comparison' && renderComparativa()}
      {activeTab === 'orgs' && (
        <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <Layers className="mx-auto text-slate-200 mb-6" size={64} />
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Organizaciones</h2>
          <p className="text-slate-500 max-w-md mx-auto mt-4 text-lg">Próximamente: Administre agrupaciones de colegios, redes locales y departamentos centrales.</p>
        </div>
      )}
    </div>
  );
};

export default HoldingDashboard;
