import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { StrategicGoal } from '@/types/mejora_continua';
import { Activity, BarChart3, PieChart as PieIcon, ShieldCheck, DollarSign, Layers } from 'lucide-react';

interface PMEAnalyticsProps {
  goals: StrategicGoal[];
  profiles: any[];
  pmeMap?: Record<string, any>;
}

const COLORS = ['#1B3C73', '#C87533', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

export default function PMEAnalytics({ goals, profiles, pmeMap }: PMEAnalyticsProps) {
  if (!goals || goals.length === 0) return null;

  // 1. Calcular estado general de indicadores
  let logrados = 0;
  let enProgreso = 0;
  let criticos = 0;
  let totalPercent = 0;
  let totalIndicators = 0;

  // Analítica por Dimensión
  const dimensionData: Record<string, { name: string, cost: number, count: number, progress: number }> = {
    "Gestión Pedagógica": { name: "Pedagógica", cost: 0, count: 0, progress: 0 },
    "Liderazgo": { name: "Liderazgo", cost: 0, count: 0, progress: 0 },
    "Convivencia Escolar": { name: "Convivencia", cost: 0, count: 0, progress: 0 },
    "Gestión de Recursos": { name: "Recursos", cost: 0, count: 0, progress: 0 },
  };

  goals.forEach(g => {
    // Dimensión principal de la meta (desde el link oficial)
    const officialDim = g.pme_action_link && pmeMap && pmeMap[g.pme_action_link] 
        ? pmeMap[g.pme_action_link].dimension 
        : null;

    g.implementation_phases?.forEach(p => {
      // Intentar extraer del título como fallback o usar la oficial
      let dim = officialDim;
      if (!dim) {
          const match = p.title.match(/\[(.*?)\]/);
          dim = match ? match[1] : "Otras";
      }
      
      if (!dimensionData[dim]) {
          dimensionData[dim] = { name: dim.split(' ')[0], cost: 0, count: 0, progress: 0 };
      }
      
      dimensionData[dim].count++;
      
      // Costos
      p.enablers?.forEach(e => {
          dimensionData[dim].cost += (e.estimated_cost || 0);
      });

      // Indicadores
      p.indicators?.forEach(i => {
        const perc = i.target_value > 0 ? (i.current_value / i.target_value) * 100 : 0;
        const cappedPerc = Math.min(perc, 100);
        totalPercent += cappedPerc;
        totalIndicators++;
        
        dimensionData[dim].progress += cappedPerc;

        if (perc >= 100) logrados++;
        else if (perc >= 50) enProgreso++;
        else criticos++;
      });
    });
  });

  const avgHealth = totalIndicators > 0 ? Math.round(totalPercent / totalIndicators) : 0;

  const pieData = [
    { name: 'Logrados', value: logrados },
    { name: 'En Proceso', value: enProgreso },
    { name: 'Críticos', value: criticos }
  ].filter(d => d.value > 0);

  // Formatear datos de dimensión para Gráficos
  const dimensionChartData = Object.values(dimensionData).filter(d => d.count > 0).map(d => ({
      ...d,
      avgProgress: d.count > 0 ? Math.round(d.progress / (d.count || 1)) : 0
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl animate-in fade-in duration-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{payload[0].name}</p>
          <p className="text-sm font-bold text-white">
            {payload[0].name === 'cost' ? `$${payload[0].value.toLocaleString()}` : `${payload[0].value}${payload[0].name === 'avgProgress' ? '%' : ''}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Salud PME</span>
              <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900">{avgHealth}%</span>
                  <span className="text-[10px] font-bold text-emerald-500 mb-1">Óptimo</span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Inversión Total</span>
              <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900">${Object.values(dimensionData).reduce((a, b) => a + b.cost, 0).toLocaleString()}</span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Metas Activas</span>
              <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900">{goals.length}</span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Misiones Críticas</span>
              <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-amber-600">
                    {pmeMap ? Object.values(pmeMap).filter((a: any) => a.is_critical).length : 0}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mb-1">Bajo Gestión</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Gráfico de Inversión por Dimensión */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" /> Inversión por Dimensión
              </h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dimensionChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="cost"
                  nameKey="name"
                  stroke="none"
                >
                  {dimensionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Radar de Cobertura de Dimensiones */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Cobertura Estratégica
                </h3>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dimensionChartData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="name" tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
                        <Radar
                            name="Avance"
                            dataKey="avgProgress"
                            stroke="#1B3C73"
                            fill="#1B3C73"
                            fillOpacity={0.6}
                        />
                        <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}
