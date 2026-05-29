import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { StrategicGoal } from '@/types/mejora_continua';
import { DollarSign, Layers, Target, TrendingUp, BarChart3, AlertCircle, Sparkles } from 'lucide-react';

interface PMEAnalyticsProps {
  goals: StrategicGoal[];
  profiles: any[];
  pmeMap?: Record<string, any>;
  budgetInfo?: { budget_sep: number; budget_pie: number; budget_total: number } | null;
}

const BRAND_COLORS = ['#1B3C73', '#C87533', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

// ── Empty state shown when there's not enough data ──────────────────────────
function EmptyAnalytics({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
      <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl mb-3">
        <BarChart3 className="w-6 h-6 text-slate-300" />
      </div>
      <p className="text-sm font-bold text-slate-500 text-center">{message}</p>
      <p className="text-xs text-slate-400 text-center mt-1">
        Agrega indicadores y registra avances para ver la analítica aquí.
      </p>
    </div>
  );
}

// ── Custom tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{payload[0].name}</p>
        <p className="text-sm font-black text-white">
          {payload[0].name === 'cost' || payload[0].dataKey === 'cost'
            ? `$${Number(payload[0].value).toLocaleString('es-CL')}`
            : `${payload[0].value}${payload[0].dataKey === 'avgProgress' ? '%' : ''}`
          }
        </p>
      </div>
    );
  }
  return null;
}

// ── Mini stat card ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</span>
      <div className="flex items-end gap-2">
        <span className={`text-3xl font-black ${color || 'text-slate-900'}`}>{value}</span>
        {sub && <span className="text-[10px] font-bold text-slate-400 mb-0.5">{sub}</span>}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function PMEAnalytics({ goals, profiles, pmeMap, budgetInfo }: PMEAnalyticsProps) {
  if (!goals || goals.length === 0) return null;

  // ── Aggregate indicator data ────────────────────────────────────────────
  let logrados = 0;
  let enProgreso = 0;
  let criticos = 0;
  let totalPercent = 0;
  let totalIndicators = 0;
  let totalCost = 0;

  const dimensionData: Record<string, { name: string; cost: number; count: number; progress: number }> = {
    'Gestión Pedagógica': { name: 'Pedagógica', cost: 0, count: 0, progress: 0 },
    'Liderazgo':          { name: 'Liderazgo',  cost: 0, count: 0, progress: 0 },
    'Convivencia Escolar': { name: 'Convivencia', cost: 0, count: 0, progress: 0 },
    'Gestión de Recursos': { name: 'Recursos',   cost: 0, count: 0, progress: 0 },
  };

  goals.forEach(g => {
    const officialDim = g.pme_action_link && pmeMap && pmeMap[g.pme_action_link]
      ? pmeMap[g.pme_action_link].dimension
      : null;

    g.implementation_phases?.forEach(p => {
      let dim = officialDim;
      if (!dim) {
        const match = p.title.match(/\[(.*?)\]/);
        dim = match ? match[1] : 'Gestión Pedagógica'; // default to first dimension
      }
      if (!dimensionData[dim]) {
        dimensionData[dim] = { name: dim.split(' ')[0], cost: 0, count: 0, progress: 0 };
      }
      dimensionData[dim].count++;

      p.enablers?.forEach(e => {
        const cost = e.estimated_cost || 0;
        dimensionData[dim].cost += cost;
        totalCost += cost;
      });

      p.indicators?.forEach(i => {
        const perc = i.target_value > 0 ? (i.current_value / i.target_value) * 100 : 0;
        const capped = Math.min(perc, 100);
        totalPercent += capped;
        totalIndicators++;
        dimensionData[dim].progress += capped;

        if (perc >= 100) logrados++;
        else if (perc >= 50) enProgreso++;
        else criticos++;
      });
    });
  });

  const avgHealth = totalIndicators > 0 ? Math.round(totalPercent / totalIndicators) : 0;
  const hasIndicatorData = totalIndicators > 0;
  const hasCostData = totalCost > 0;

  const dimensionChartData = Object.values(dimensionData)
    .filter(d => d.count > 0)
    .map(d => ({
      ...d,
      avgProgress: d.count > 0 ? Math.round(d.progress / Math.max(d.count, 1)) : 0,
    }));

  const pieData = [
    { name: 'Logrados', value: logrados, color: '#10b981' },
    { name: 'En Proceso', value: enProgreso, color: '#f59e0b' },
    { name: 'Críticos', value: criticos, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const criticalActions = pmeMap
    ? Object.values(pmeMap).filter((a: any) => a.is_critical).length
    : 0;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── KPI stat row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Salud PME"
          value={hasIndicatorData ? `${avgHealth}%` : '—'}
          sub={hasIndicatorData ? (avgHealth >= 70 ? 'En buen estado' : avgHealth >= 40 ? 'En riesgo' : 'Atención requerida') : 'Sin datos aún'}
          color={hasIndicatorData ? (avgHealth >= 70 ? 'text-emerald-600' : avgHealth >= 40 ? 'text-amber-500' : 'text-rose-600') : 'text-slate-400'}
        />
        <StatCard
          label="Inversión Total"
          value={hasCostData ? `$${totalCost.toLocaleString('es-CL')}` : '—'}
          sub={hasCostData ? 'Estimada en habilitadores' : 'Sin habilitadores con costo'}
          color={hasCostData ? 'text-slate-900' : 'text-slate-400'}
        />
        <StatCard
          label="Indicadores"
          value={totalIndicators > 0 ? totalIndicators : '—'}
          sub={totalIndicators > 0 ? `${logrados} logrados · ${criticos} críticos` : 'Sin indicadores con avance'}
          color={totalIndicators > 0 ? 'text-slate-900' : 'text-slate-400'}
        />
        <StatCard
          label="Misiones Críticas"
          value={criticalActions > 0 ? criticalActions : '—'}
          sub={criticalActions > 0 ? 'Bajo gestión directiva' : 'Ninguna marcada aún'}
          color={criticalActions > 0 ? 'text-amber-600' : 'text-slate-400'}
        />
      </div>

      {budgetInfo && (budgetInfo.budget_total > 0 || budgetInfo.budget_sep > 0 || budgetInfo.budget_pie > 0) && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Gestión de Inversión y Presupuesto PME</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Control financiero de habilitadores para el año académico 2026</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Recursos SEP / PIE
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Budget Progress */}
            {budgetInfo.budget_total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Presupuesto Total Institucional</span>
                  <span>{budgetInfo.budget_total > 0 ? Math.round((totalCost / budgetInfo.budget_total) * 100) : 0}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      totalCost > budgetInfo.budget_total 
                        ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}
                    style={{ width: `${Math.min((totalCost / budgetInfo.budget_total) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Asignado: ${budgetInfo.budget_total.toLocaleString('es-CL')}</span>
                  <span>Planificado: ${totalCost.toLocaleString('es-CL')}</span>
                </div>
              </div>
            )}

            {/* SEP Budget Progress */}
            {budgetInfo.budget_sep > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Inversión en Recursos SEP</span>
                  <span>{budgetInfo.budget_sep > 0 ? Math.round((totalCost / budgetInfo.budget_sep) * 100) : 0}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      totalCost > budgetInfo.budget_sep 
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${Math.min((totalCost / budgetInfo.budget_sep) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Asignado: ${budgetInfo.budget_sep.toLocaleString('es-CL')}</span>
                  <span>Disponible: ${(Math.max(0, budgetInfo.budget_sep - totalCost)).toLocaleString('es-CL')}</span>
                </div>
              </div>
            )}

            {/* PIE Budget Progress */}
            {budgetInfo.budget_pie > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Fondo de Inclusión PIE</span>
                  <span>{budgetInfo.budget_pie > 0 ? Math.round((totalCost / budgetInfo.budget_pie) * 100) : 0}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      totalCost > budgetInfo.budget_pie 
                        ? 'bg-gradient-to-r from-rose-400 to-red-500' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min((totalCost / budgetInfo.budget_pie) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Asignado: ${budgetInfo.budget_pie.toLocaleString('es-CL')}</span>
                  <span>PIE Restante: ${(Math.max(0, budgetInfo.budget_pie - totalCost)).toLocaleString('es-CL')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Indicator health pie ── */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
            <Target className="w-3.5 h-3.5" /> Estado de Indicadores
          </h3>
          {pieData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '16px', fontSize: '10px', fontWeight: 'bold' }}
                    formatter={(value, entry: any) => (
                      <span style={{ color: entry.color }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyAnalytics message="Sin progreso registrado aún" />
          )}
        </div>

        {/* ── Cobertura Estratégica radar ── */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
            <Layers className="w-3.5 h-3.5" /> Cobertura por Dimensión
          </h3>
          {dimensionChartData.length >= 2 && hasIndicatorData ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dimensionChartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Avance %"
                    dataKey="avgProgress"
                    stroke="#1B3C73"
                    fill="#1B3C73"
                    fillOpacity={0.5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyAnalytics message="Necesitas al menos 2 dimensiones con indicadores" />
          )}
        </div>

        {/* ── Avance por Dimensión bar ── */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
            <TrendingUp className="w-3.5 h-3.5" /> Avance Promedio por Dimensión
          </h3>
          {dimensionChartData.some(d => d.avgProgress > 0) ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionChartData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgProgress" name="Avance %" radius={[6, 6, 0, 0]}>
                    {dimensionChartData.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyAnalytics message="Sin avances registrados en indicadores" />
          )}
        </div>

        {/* ── Inversión por Dimensión bar ── */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
            <DollarSign className="w-3.5 h-3.5" /> Inversión por Dimensión (SEP)
          </h3>
          {hasCostData ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionChartData.filter(d => d.cost > 0)} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cost" name="cost" radius={[6, 6, 0, 0]}>
                    {dimensionChartData.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/30">
              <div className="w-12 h-12 flex items-center justify-center bg-amber-50 rounded-xl mb-3">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm font-bold text-slate-600 text-center">Sin habilitadores presupuestados</p>
              <p className="text-xs text-slate-400 text-center mt-1">
                Agrega habilitadores con costo estimado en las fases para ver la distribución del presupuesto SEP.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
