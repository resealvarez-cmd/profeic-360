"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Clock, Users, Zap, AlertTriangle,
    BarChart3, UserCheck, Activity, Globe, Trophy, Info, Building
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProductAnalytics({ userEmail, isCompact = false }: { userEmail: string, isCompact?: boolean }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_URL}/telemetry/analytics?email=${encodeURIComponent(userEmail)}&t=${Date.now()}`);
                if (res.ok) {
                    const json = await res.json();
                    console.log("📊 Analytics Data:", json);
                    setData(json);
                } else {
                    const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
                    console.error("📊 Analytics Error:", res.status, err);
                }
            } catch (e) {
                console.error("Error loading analytics", e);
            } finally {
                setLoading(false);
            }
        };

        if (userEmail) fetchAnalytics();
    }, [userEmail]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Activity className="animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Calculando impacto pedagógico...</p>
        </div>
    );

    if (!data) return null;

    if (isCompact) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Compact KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card
                        title="Horas"
                        value={`${data.summary.saved_hours}h`}
                        icon={<Clock size={14} className="text-[#A1C969]" />}
                        desc="Horas estimadas de ahorro administrativo"
                        isCompact
                    />
                    <Card
                        title="Adopción"
                        value={`${data.summary.adoption_percent}%`}
                        icon={<Users size={14} className="text-blue-500" />}
                        desc="Usuarios activos vs autorizados"
                        isCompact
                    />
                    <Card
                        title="Fricción"
                        value={data.summary.friction_count}
                        icon={<AlertTriangle size={14} className="text-orange-500" />}
                        desc="Regeneraciones IA por insatisfacción del usuario"
                        isCompact
                    />
                    <Card
                        title="Eventos"
                        value={data.summary.total_events}
                        icon={<Zap size={14} className="text-[#f2ae60]" />}
                        desc="Total de interacciones capturadas"
                        isCompact
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Compact Chart */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <BarChart3 size={12} /> Uso de Módulos
                        </h3>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.top_modules} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#64748b"
                                        fontSize={9}
                                        width={80}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontSize: '10px' }}
                                    />
                                    <Bar dataKey="value" fill="#1e293b" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Compact Power Users */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <UserCheck size={12} /> Power Users
                        </h3>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            {data.power_users.map((user: any, i: number) => (
                                <div key={i} className={`flex justify-between items-center p-2 rounded-xl border transition-colors ${i === 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i === 0 ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-200 text-slate-700'}`}>
                                            {i + 1}
                                        </div>
                                        <span className="text-[11px] text-slate-600 truncate max-w-[120px] font-medium">{user.email}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${i === 0 ? 'bg-white text-indigo-600 border-indigo-200' : 'bg-white text-slate-900 border-slate-200'}`}>
                                        {user.count} acciones
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* School Totals (Only in Compact for SuperAdmin view) */}
                {data.school_stats && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Building size={12} /> Usuarios por Colegio
                        </h3>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                            {data.school_stats.map((school: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-[10px] text-slate-600 truncate font-bold">{school.name}</span>
                                    <span className="text-[10px] font-black text-slate-900">{school.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Version and Timestamp */}
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizado con Base de Datos</span>
                </div>
                {data.last_updated && (
                    <span className="text-[9px] font-medium text-slate-300">
                        Refrescado a las {new Date(data.last_updated).toLocaleTimeString()}
                    </span>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card
                    title="Horas Ahorradas"
                    value={`${data.summary.saved_hours}h`}
                    icon={<Clock className="text-[#A1C969]" />}
                    desc="Horas de trabajo administrativo ahorradas mediante automatización IA."
                />
                <Card
                    title="Adopción"
                    value={`${data.summary.adoption_percent}%`}
                    icon={<Users className="text-blue-600" />}
                    desc={`${data.summary.active_users_count} de ${data.summary.total_authorized} docentes activos en el periodo.`}
                />
                <Card
                    title="Fricción (IA)"
                    value={data.summary.friction_count}
                    icon={<AlertTriangle className="text-orange-500" />}
                    desc="Cantidad de veces que un usuario regeneró contenido IA por no estar satisfecho con el resultado inicial."
                />
                <Card
                    title="Total Eventos"
                    value={data.summary.total_events}
                    icon={<Zap className="text-[#f2ae60]" />}
                    desc="Volumen total de interacciones y ejecuciones exitosas en la plataforma."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Module Adoption Chart */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 size={16} /> Uso de Módulos (Adopción)
                    </h3>
                    <div className="h-64 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.top_modules} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#4a6b8c" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Trophy size={16} className="text-indigo-400" /> Power Users (Top 10 Actividad)
                    </h3>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.power_users.map((user: any, i: number) => (
                            <div key={i} className={`flex justify-between items-center p-3 rounded-xl transition-all border ${i === 0 ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5'}`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-indigo-500 text-white' : 'bg-[#4a6b8c] text-white'}`}>
                                        {i + 1}
                                    </div>
                                    <span className="text-sm text-slate-200 truncate max-w-[200px]">{user.email}</span>
                                </div>
                                <span className={`text-xs font-bold ${i === 0 ? 'text-indigo-300' : 'text-blue-300'}`}>{user.count} acciones</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* School Breakdown */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Building size={16} className="text-teal-400" /> Distribución por Colegio
                    </h3>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.school_stats?.map((school: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-transparent">
                                <span className="text-sm text-slate-200 truncate font-bold">{school.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-teal-500"
                                            style={{ width: `${(school.count / data.summary.active_users_count) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs font-black text-white w-6 text-right">{school.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Audit Log (Minimalist) */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe size={16} /> Auditoría Silenciosa (Live)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-slate-500 border-b border-white/5 uppercase">
                                <th className="pb-2">Usuario</th>
                                <th className="pb-2">Acción</th>
                                <th className="pb-2">Módulo</th>
                                <th className="pb-2">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {data.recent_events.map((event: any) => (
                                <tr key={event.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                    <td className="py-2.5 text-slate-300">{event.email}</td>
                                    <td className="py-2.5"><span className="bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">{event.event_name}</span></td>
                                    <td className="py-2.5 text-slate-400">{event.module || '/'}</td>
                                    <td className="py-2.5 text-slate-500">{new Date(event.created_at).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon, desc, isCompact = false }: any) {
    return (
        <div className={`
            rounded-3xl border transition-all relative group
            ${isCompact ? 'p-3 rounded-2xl bg-white border-slate-200 shadow-sm' : 'p-5 bg-white border-slate-200 shadow-sm'}
            hover:border-indigo-400 hover:shadow-md
        `}>
            {/* Tooltip visible on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[9px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center shadow-xl border border-white/10">
                {desc}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
            </div>

            <div className={`flex items-center gap-3 ${isCompact ? 'mb-1 justify-between' : 'mb-3'}`}>
                <div className="flex items-center gap-2">
                    <div className={`${isCompact ? 'p-1.5' : 'p-2'} bg-slate-50 rounded-xl border border-slate-100`}>
                        {icon}
                    </div>
                    <h4 className={`${isCompact ? 'text-[9px]' : 'text-[10px]'} font-black text-slate-400 uppercase tracking-widest`}>
                        {title}
                    </h4>
                </div>
                <Info size={isCompact ? 10 : 12} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </div>

            <div className="flex items-baseline gap-2">
                <span className={`${isCompact ? 'text-xl' : 'text-3xl'} font-black text-slate-900`}>{value}</span>
            </div>
            {!isCompact && (
                <p className="text-[10px] text-slate-500 mt-1 font-medium line-clamp-1">{desc}</p>
            )}
        </div>
    );
}
