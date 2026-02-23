"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Clock, Users, Zap, AlertTriangle,
    BarChart3, UserCheck, Activity, Globe, Trophy
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProductAnalytics({ userEmail, isCompact = false }: { userEmail: string, isCompact?: boolean }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`${API_URL}/telemetry/analytics?email=${encodeURIComponent(userEmail)}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
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
                        isCompact
                    />
                    <Card
                        title="Adopción"
                        value={`${data.summary.adoption_percent}%`}
                        icon={<Users size={14} className="text-blue-500" />}
                        isCompact
                    />
                    <Card
                        title="Fricción"
                        value={data.summary.friction_count}
                        icon={<AlertTriangle size={14} className="text-orange-500" />}
                        isCompact
                    />
                    <Card
                        title="Eventos"
                        value={data.summary.total_events}
                        icon={<Zap size={14} className="text-[#f2ae60]" />}
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
                        <div className="space-y-2">
                            {data.power_users.slice(0, 3).map((user: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                            {i + 1}
                                        </div>
                                        <span className="text-[11px] text-slate-600 truncate max-w-[120px] font-medium">{user.email}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">{user.count} ops</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card
                    title="Horas Ahorradas"
                    value={`${data.summary.saved_hours}h`}
                    icon={<Clock className="text-[#A1C969]" />}
                    desc="Tiempo lectivo recuperado"
                />
                <Card
                    title="Adopción"
                    value={`${data.summary.adoption_percent}%`}
                    icon={<Users className="text-blue-600" />}
                    desc={`${data.summary.active_users_count} de ${data.summary.total_authorized} activados`}
                />
                <Card
                    title="Fricción (IA)"
                    value={data.summary.friction_count}
                    icon={<AlertTriangle className="text-orange-500" />}
                    desc="Regeneraciones de ítems"
                />
                <Card
                    title="Total Eventos"
                    value={data.summary.total_events}
                    icon={<Zap className="text-[#f2ae60]" />}
                    desc="Interacciones capturadas"
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

                {/* Power Users */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <UserCheck size={16} /> Power Users (Top Actividad)
                    </h3>
                    <div className="space-y-3">
                        {data.power_users.map((user: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#4a6b8c] text-white flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm text-slate-200 truncate max-w-[200px]">{user.email}</span>
                                </div>
                                <span className="text-xs font-bold text-blue-300">{user.count} ops</span>
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
    if (isCompact) {
        return (
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm group hover:border-[#1e293b] transition-all flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        {icon}
                    </div>
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{title}</h4>
                </div>
                <span className="text-xl font-black text-slate-900">{value}</span>
            </div>
        );
    }

    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm group hover:border-[#1e293b] transition-all">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    {icon}
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{value}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">{desc}</p>
        </div>
    );
}
