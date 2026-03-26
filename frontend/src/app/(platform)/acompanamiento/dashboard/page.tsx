"use client";

import { useEffect, useState } from "react";
import { MessageCircle, FileText, CheckCircle, TrendingUp, Search, Calendar, ChevronRight, ArrowRight, X, AlertCircle, Clock, PlayCircle, Eye, Settings, Users, BrainCircuit, Plus, Loader2, Target, Home, Zap, Info, BarChart3, CheckCircle2, ChevronDown, ChevronUp, Trash2, Trophy } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line, AreaChart, Area } from "recharts";
import { toast } from "sonner";
import ProductAnalytics from "@/components/ProductAnalytics";
import { TeacherProfiler } from "@/components/shared/TeacherProfiler";

export default function Dashboard360() {
    const router = useRouter();
    const [stats, setStats] = useState({ active: 0, completed: 0, total: 0 });

    const [recentCycles, setRecentCycles] = useState<any[]>([]);
    const [allCycles, setAllCycles] = useState<any[]>([]);
    const [usersMap, setUsersMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [showInsightDrawer, setShowInsightDrawer] = useState(false);

    // NEW OBSERVATION CYCLE STATE
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [showNewCycleModal, setShowNewCycleModal] = useState(false);
    const [newCycleTeacherId, setNewCycleTeacherId] = useState("");
    const [newCycleDateTime, setNewCycleDateTime] = useState("");
    const [newCycleSubject, setNewCycleSubject] = useState("");

    // EXECUTIVE REPORT STATE
    const [showExecutiveModal, setShowExecutiveModal] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false); // New Config Modal
    const [executiveData, setExecutiveData] = useState<any>(null);
    const [loadingExecutive, setLoadingExecutive] = useState(false);
    const [latestInsight, setLatestInsight] = useState<any>(null);

    // TEACHER DETAIL MODAL STATE
    const [showTeacherDetailDrawer, setShowTeacherDetailDrawer] = useState(false);
    const [teacherDetailData, setTeacherDetailData] = useState<any>(null);
    const [loadingTeacherDetail, setLoadingTeacherDetail] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

    // FILTERS STATE
    const [filterDept, setFilterDept] = useState("");
    const [filterExp, setFilterExp] = useState("");
    const [filterAge, setFilterAge] = useState("");

    // DASHBOARD REFINEMENTS
    const [showSuperAdminPanel, setShowSuperAdminPanel] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const handleGenerateExecutive = async () => {
        setLoadingExecutive(true);
        setShowConfigModal(false); // Close config, start loading
        try {
            const body = {
                author_id: currentUser?.id,
                department: filterDept || null,
                years_experience_range: filterExp || null,
                age_range: filterAge || null
            };

            const response = await fetch(`${API_URL}/acompanamiento/executive-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data = await response.json();
                setExecutiveData(data);
                setShowExecutiveModal(true);
                // Update latest insight immediately to show the new result in the blue card too
                setLatestInsight({ ...data, heatmap: data.metrics });
            } else {
                toast.error("Error generando reporte ejecutivo.");
            }
        } catch (error) {
            console.error("Error executive:", error);
            toast.error("Error de conexión IA.");
        } finally {
            setLoadingExecutive(false);
        }
    };

    const handleViewTeacherDetail = (teacherId: string) => {
        if (!teacherId) {
            toast.error("Este acompañamiento heredado no tiene un ID de docente asignado.");
            return;
        }
        setSelectedTeacherId(teacherId);
        setShowTeacherDetailDrawer(true);
    };

    const handleDeleteObservation = async (cycleId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta observación? Esta acción no se puede deshacer.")) return;

        try {
            const { error } = await supabase
                .from('observation_cycles')
                .delete()
                .eq('id', cycleId);

            if (error) throw error;

            toast.success("Observación eliminada correctamente.");
            // Refresh data
            setRecentCycles(prev => prev.filter(c => c.id !== cycleId));
            setAllCycles(prev => prev.filter(c => c.id !== cycleId));
            setStats(prev => ({
                ...prev,
                total: prev.total - 1
            }));
        } catch (error: any) {
            console.error("Error deleting observation:", error);
            toast.error("Error al eliminar: " + error.message);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            console.log("DASHBOARD_FETCH: Starting fetch...");
            try {
                const { data: { user } } = await supabase.auth.getUser();
                console.log("DASHBOARD_FETCH: User verified:", user?.email);
                setCurrentUser(user);

                let currentRole = 'teacher';
                if (user) {
                    // Determine Role & Name
                    try {
                        const { data: authUser, error: authErr } = await supabase
                            .from('authorized_users')
                            .select('role, full_name')
                            .eq('email', user.email)
                            .single();

                        if (!authErr && authUser) {
                            currentRole = authUser.role;
                            setUserRole(authUser.role);
                            setUserName(authUser.full_name || 'Docente');
                        } else if (user.email === 're.se.alvarez@gmail.com') {
                            currentRole = 'admin';
                            setUserRole('admin');
                            setUserName('Super Admin');
                        } else {
                            setUserRole('teacher');
                            setUserName('Docente');
                        }
                    } catch (e) {
                        console.error("Auth check error:", e);
                        if (user?.email === 're.se.alvarez@gmail.com') {
                            currentRole = 'admin';
                            setUserRole('admin');
                            setUserName('Super Admin');
                        } else {
                            setUserRole('teacher');
                            setUserName('Docente');
                        }
                    }
                }

                console.log("DASHBOARD_FETCH: Determined Role:", currentRole);

                // --- MULTI-TENANCY FILTERING ---
                let currentSchoolId = null;
                const { data: myProfile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle();
                currentSchoolId = myProfile?.school_id;

                console.log("DASHBOARD_FETCH: School ID:", currentSchoolId);

                // 1. Fetch Profiles of the SCHOOL
                let profileQuery = supabase.from('profiles').select('id, email, full_name');
                if (currentSchoolId) {
                    profileQuery = profileQuery.eq('school_id', currentSchoolId);
                }
                const { data: profilesList } = await profileQuery;
                const schoolUserEmails = profilesList?.map(p => p.email?.toLowerCase()) || [];
                const schoolUserIds = profilesList?.map(p => p.id) || [];

                // 2. Fetch Authorized Users (Whitelist)
                const { data: authorizedList } = await supabase
                    .from('authorized_users')
                    .select('*')
                    .in('role', ['teacher', 'utp'])
                    .order('full_name', { ascending: true });

                const uMap: Record<string, string> = {};
                let filteredAuthorized: any[] = [];

                if (authorizedList && profilesList) {
                    filteredAuthorized = authorizedList.filter(auth => 
                        schoolUserEmails.includes(auth.email?.toLowerCase())
                    ).map(auth => {
                        const profile = profilesList.find(p => p.email?.toLowerCase() === auth.email?.toLowerCase());
                        if (profile && profile.id) {
                            uMap[profile.id] = profile.full_name || auth.full_name || auth.email;
                        }
                        return { ...auth, id: profile?.id };
                    }).filter(u => u.id);
                }

                setUsersMap(uMap);
                setAllUsers(filteredAuthorized);

                // 3. Fetch Observation Cycles (Filtered by School Users)
                let cyclesQuery = supabase.from('observation_cycles').select('*').order('created_at', { ascending: false });
                
                if (currentRole === 'teacher') {
                    cyclesQuery = cyclesQuery.eq('teacher_id', user.id);
                } else if (currentSchoolId && schoolUserIds.length > 0) {
                    cyclesQuery = cyclesQuery.in('teacher_id', schoolUserIds);
                }

                const { data: cycles } = await cyclesQuery;
                console.log("DASHBOARD_FETCH: Cycles fetched:", cycles?.length);

                if (cycles) {
                    const active = cycles.filter(c => c.status === 'in_progress' || c.status === 'planned').length;
                    const completed = cycles.filter(c => c.status === 'completed').length;

                    setStats({ active, completed, total: cycles.length });
                    setRecentCycles(cycles.slice(0, 5));
                    setAllCycles(cycles);

                    // 4. Radar Calculation
                    const completedCycleIds = cycles.filter(c => c.status === 'completed').map(c => c.id);
                    if (completedCycleIds.length > 0) {
                        const { data: executionData } = await supabase
                            .from('observation_data')
                            .select('content, created_at')
                            .in('cycle_id', completedCycleIds)
                            .eq('stage', 'execution');

                        if (executionData && executionData.length > 0) {
                            const weightedSums: Record<string, number> = {};
                            const totalWeights: Record<string, number> = {};
                            const now = new Date();

                            executionData.forEach((row: any) => {
                                const scores = row.content?.scores || {};
                                const date = row.created_at ? new Date(row.created_at) : new Date();
                                const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
                                const weight = Math.max(0.5, 1 - (diffDays / 180));

                                Object.keys(scores).forEach((key) => {
                                    const scoreValue = Number(scores[key]) || 0;
                                    weightedSums[key] = (weightedSums[key] || 0) + (scoreValue * weight);
                                    totalWeights[key] = (totalWeights[key] || 0) + weight;
                                });
                            });

                            setRadarData(prev => prev.map(item => {
                                const wSum = weightedSums[item.id] || 0;
                                const wTotal = totalWeights[item.id] || 0;
                                const avg = wTotal > 0 ? wSum / wTotal : 0;
                                return { ...item, A: Math.round((avg / 4) * 100) };
                            }));
                        }
                    }
                }
            } catch (err) {
                console.error("Dashboard massive crash:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleNewCycle = async () => {
        if (!newCycleTeacherId) {
            toast.error("Selecciona un docente para observar.");
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return router.push('/login');
            }

            const { data, error } = await supabase
                .from('observation_cycles')
                .insert([{ 
                    teacher_id: newCycleTeacherId, 
                    observer_id: user.id, 
                    status: 'planned',
                    scheduled_at: newCycleDateTime ? new Date(newCycleDateTime).toISOString() : null,
                    subject_context: newCycleSubject || null,
                    teacher_agreed: false
                }])
                .select().single();

            if (error) {
                console.error("Supabase Error:", error);
                toast.error("Error al crear ciclo: " + error.message);
            } else {
                toast.success("Nueva observación creada.");
                setShowNewCycleModal(false);
                router.push(`/acompanamiento/observacion/${data.id}`);
            }
        } catch (err) {
            console.error("Unexpected error in handleNewCycle:", err);
            toast.error("Error inesperado al crear observación.");
        }
    };

    const SuperAdminWidget = ({ currentUser, userRole }: { currentUser: any, userRole: string | null }) => {
        const [activeTab, setActiveTab] = useState<'gestion' | 'impacto'>('gestion');
        const [metrics, setMetrics] = useState<any>(null);
        const [loadingMetrics, setLoadingMetrics] = useState(true);

        useEffect(() => {
            const fetchMetrics = async () => {
                setLoadingMetrics(true);
                try {
                    console.log("SUPERADMIN_FETCH: Requesting metrics for author:", currentUser?.id);
                    const res = await fetch(`${API_URL}/acompanamiento/executive-metrics`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            department: filterDept || undefined,
                            years_experience_range: filterExp || undefined,
                            age_range: filterAge || undefined,
                            author_id: currentUser?.id
                        })
                    });

                    console.log("SUPERADMIN_FETCH: Status Code:", res.status);

                    if (res.ok) {
                        const data = await res.json();
                        console.log("SUPERADMIN_FETCH: Data received:", data);
                        setMetrics(data);
                    } else {
                        const errData = await res.text();
                        console.error("SUPERADMIN_FETCH: Error response:", errData);
                    }
                } catch (e) {
                    console.error("SUPERADMIN_FETCH: Network fetch error:", e);
                } finally {
                    setLoadingMetrics(false);
                }
            };
            fetchMetrics();
        }, [filterDept, filterExp, filterAge, currentUser]);

        const canManageTeachers = ['admin', 'director', 'utp'].includes(userRole || '');
        if (!canManageTeachers && currentUser?.email !== 're.se.alvarez@gmail.com') return null;

        return (
            <div className="mb-12 p-1 bg-white rounded-[3rem] shadow-xl border border-slate-200 relative overflow-hidden">
                {/* Modern Tab Switcher - Light Mode */}
                <div className="flex p-2 gap-2 bg-slate-50 rounded-[2.8rem] m-3 border border-slate-100">
                    <button
                        onClick={() => setActiveTab('gestion')}
                        className={`flex-1 py-4 px-6 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'gestion' ? 'bg-[#1e293b] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                    >
                        <Settings size={16} /> Gestión Operativa
                    </button>
                    <button
                        onClick={() => setActiveTab('impacto')}
                        className={`flex-1 py-4 px-6 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'impacto' ? 'bg-[#A1C969] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                    >
                        <Zap size={16} /> Impacto & Analítica IA
                    </button>
                </div>

                <div className="p-8 pt-4">
                    {activeTab === 'gestion' ? (
                        <div className="animate-in fade-in slide-in-from-left-8 duration-700">
                            {loadingMetrics ? (
                                <div className="text-center p-16 text-slate-400 flex flex-col items-center gap-4">
                                    <Loader2 className="animate-spin text-slate-400" size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Sincronizando planta docente...</p>
                                </div>
                            ) : metrics && (
                                <>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 px-2 gap-4">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                                <AlertCircle size={28} className="text-[#f2ae60]" />
                                                Panel Administrativo
                                            </h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 md:ml-10">Cobertura, gestión de observadores y semáforo de compromisos</p>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-right">
                                                <span className="block text-xl font-black text-slate-900">{metrics.global_metrics.total_teachers}</span>
                                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">Docentes</span>
                                            </div>
                                            <div className="bg-[#A1C969]/10 px-4 py-2 rounded-2xl border border-[#A1C969]/20 text-right">
                                                <span className="block text-xl font-black text-[#A1C969]">{metrics.global_metrics.coverage_percent}%</span>
                                                <span className="text-[8px] text-[#A1C969] uppercase font-black tracking-tighter">Cobertura</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Ranking Card */}
                                        <div className="lg:col-span-1 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                            <h3 className="text-slate-400 text-[10px] font-black uppercase mb-6 flex items-center gap-2 tracking-widest">
                                                Ranking Mentoría (KPI)
                                                <Info size={12} className="text-slate-300" />
                                            </h3>
                                            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-3 custom-scrollbar">
                                                {metrics.observer_ranking.map((obs: any) => (
                                                    <div key={obs.id} className="flex justify-between items-center bg-white hover:border-[#1e293b] p-4 rounded-2xl border border-slate-100 transition-all duration-300 shadow-sm">
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-black ${obs.alert ? 'text-orange-600' : 'text-slate-900'}`}>
                                                                {obs.name} {obs.alert && '⚠️'}
                                                            </span>
                                                            <div className="flex gap-3 mt-1">
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase">KPI: {obs.kpi_score}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] text-slate-400 font-black uppercase bg-slate-50 px-2 py-1 rounded-lg">
                                                            {obs.closure_rate}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Activity & Rigor */}
                                        <div className="lg:col-span-1 space-y-6">
                                            {/* Semáforo */}
                                            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                                <h3 className="text-slate-400 text-[10px] font-black uppercase mb-6 tracking-widest">Semáforo de Compromisos</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase">
                                                            <span className="text-slate-600">Logrados</span>
                                                            <span className="text-green-600">{metrics.trajectory?.commitments_rates?.achieved_rate || 0}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-green-500 h-full rounded-full" style={{ width: `${metrics.trajectory?.commitments_rates?.achieved_rate || 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[10px] font-black mb-1.5 uppercase">
                                                            <span className="text-slate-600">En Proceso</span>
                                                            <span className="text-blue-600">{metrics.trajectory?.commitments_rates?.pending_rate || 0}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${metrics.trajectory?.commitments_rates?.pending_rate || 0}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rigor Evolution */}
                                            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl text-white">
                                                <h4 className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-4">Evolución Profundidad IA</h4>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-2xl font-black text-[#A1C969]">{metrics.trajectory?.global_depth_index || 0}%</span>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Rigor Itinerario Docente</p>
                                                    </div>
                                                    <TrendingUp className="text-[#A1C969]" size={24} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Activity Matrix Card (Collapsible) */}
                                        <div className="lg:col-span-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm mt-4">
                                            <details className="group">
                                                <summary className="cursor-pointer flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest list-none">
                                                    <span className="flex items-center gap-2">
                                                        <Zap size={14} className="text-[#C87533]" />
                                                        Matriz Histórica de Acompañamiento
                                                    </span>
                                                    <span className="transition group-open:rotate-180">
                                                        <ChevronDown size={14} />
                                                    </span>
                                                </summary>
                                                <div className="mt-6">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left text-sm text-slate-600">
                                                            <thead className="bg-slate-100 text-slate-500 uppercase font-black text-[9px] tracking-widest">
                                                                <tr>
                                                                    <th className="px-4 py-3 rounded-l-xl">Fecha</th>
                                                                    <th className="px-4 py-3">Docente</th>
                                                                    <th className="px-4 py-3">Acompañante</th>
                                                                    <th className="px-4 py-3 rounded-r-xl">Estado</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {metrics.matriz && metrics.matriz.length > 0 ? metrics.matriz.map((m: any, idx: number) => (
                                                                    <tr key={idx} className="hover:bg-white transition-colors">
                                                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-900">
                                                                            {m.date ? new Date(m.date).toLocaleDateString() : 'N/A'}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-xs font-black">
                                                                            <button
                                                                                onClick={() => handleViewTeacherDetail(m.teacher_id)}
                                                                                className="hover:text-[#A1C969] transition-colors focus:outline-none"
                                                                            >
                                                                                {m.teacher_name || 'Docente Desconocido'}
                                                                            </button>
                                                                        </td>
                                                                        <td className="px-4 py-3 text-[10px] font-bold uppercase tracking-tight">
                                                                            {m.observer_name}
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className={`text-[9px] px-2 py-1 rounded-lg font-black tracking-widest uppercase ${m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                                {m.status === 'completed' ? 'DOC' : 'PRO'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                )) : (
                                                                    <tr>
                                                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs text-italic">No hay ciclos de observación registrados aún.</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </details>
                                        </div>
                                    </div>

                                    {/* HEATMAP SECTION (Wow Factor) */}
                                    {metrics.heatmap && Object.keys(metrics.heatmap).length > 0 && (
                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
                                                <BrainCircuit size={14} className="text-[#A1C969]" /> Pulso Cuantitativo (Heatmap)
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                {Object.entries(metrics.heatmap).sort((a: any, b: any) => b[1] - a[1]).map(([focus, score]: any) => {
                                                    const bgColor = score >= 3.2 ? 'bg-green-50 border-green-200' : (score >= 2.6 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200');
                                                    const textColor = score >= 3.2 ? 'text-green-700' : (score >= 2.6 ? 'text-yellow-700' : 'text-red-700');
                                                    return (
                                                        <div key={focus} className={`p-4 rounded-2xl border ${bgColor} flex flex-col justify-between h-24 hover:scale-105 transition-transform cursor-default shadow-sm`}>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                                                                {focus.replace(/_/g, ' ')}
                                                            </span>
                                                            <span className={`text-2xl font-black ${textColor}`}>
                                                                {score.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Highlights Section */}
                                    {metrics.highlights && (
                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                                                        <Trophy size={14} className="text-[#f2ae60]" /> Cuadro de Honor
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {metrics.highlights.top_teachers.length > 0 ? metrics.highlights.top_teachers.map((teacher: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-900">
                                                                <span className="flex items-center gap-2 opacity-80">#{idx + 1} {teacher.name}</span>
                                                                <span className="text-green-600">+{teacher.score}%</span>
                                                            </div>
                                                        )) : <span className="text-[10px] text-slate-400">Sin datos de mejora este mes</span>}
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                                                        <Users size={14} className="text-blue-500" /> Mejores Observadores
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {metrics.highlights.top_observers.length > 0 ? metrics.highlights.top_observers.map((obs: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-900">
                                                                <span className="flex items-center gap-2 opacity-80">#{idx + 1} {obs.name}</span>
                                                                <span className="text-blue-600">{obs.kpi_score} KPI</span>
                                                            </div>
                                                        )) : <span className="text-[10px] text-slate-400">Sin registros suficientes</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="mb-8 px-2">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <Zap size={28} className="text-[#A1C969]" />
                                    Impacto IA & Telemetría
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-10">Análisis de uso, eficiencia y ahorro de tiempo docente</p>
                            </div>
                            <ProductAnalytics userEmail={currentUser?.email || ''} isCompact={true} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // RADAR CHART DATA STATE
    const [radarData, setRadarData] = useState([
        { subject: 'Activación', A: 0, fullMark: 100, id: 'activacion_cognitiva' },
        { subject: 'Andamiaje', A: 0, fullMark: 100, id: 'andamiaje_modelaje' },
        { subject: 'Rigor', A: 0, fullMark: 100, id: 'rigor_autonomia' },
        { subject: 'Clima', A: 0, fullMark: 100, id: 'clima_contencion' },
        { subject: 'Gestión', A: 0, fullMark: 100, id: 'gestion_aula' },
        { subject: 'Recursos', A: 0, fullMark: 100, id: 'recursos_didacticos' },
        { subject: 'Monitoreo', A: 0, fullMark: 100, id: 'monitoreo_formativo' },
        { subject: 'Feedback', A: 0, fullMark: 100, id: 'calidad_feedback' },
    ]);



    return (
        <Suspense fallback={<div className="p-8 text-[#1B3C73]">Cargando panel...</div>}>
            <DashboardContent
                loading={loading}
                userRole={userRole}
                userName={userName}
                currentUser={currentUser}
                stats={stats}
                recentCycles={recentCycles}
                allCycles={allCycles}
                radarData={radarData}
                handleGenerateExecutive={handleGenerateExecutive}
                loadingExecutive={loadingExecutive}
                handleNewCycle={handleNewCycle}
                showInsightDrawer={showInsightDrawer}
                setShowInsightDrawer={setShowInsightDrawer}
                showExecutiveModal={showExecutiveModal}
                setShowExecutiveModal={setShowExecutiveModal}
                executiveData={executiveData}
                SuperAdminWidget={() => <SuperAdminWidget currentUser={currentUser} userRole={userRole} />}
                usersMap={usersMap}
                latestInsight={latestInsight}
                setShowConfigModal={setShowConfigModal} // Pass this
                handleViewTeacherDetail={handleViewTeacherDetail}
                showTeacherDetailDrawer={showTeacherDetailDrawer}
                setShowTeacherDetailDrawer={setShowTeacherDetailDrawer}
                teacherDetailData={teacherDetailData}
                loadingTeacherDetail={loadingTeacherDetail}
                selectedTeacherId={selectedTeacherId}
                showSuperAdminPanel={showSuperAdminPanel}
                setShowSuperAdminPanel={setShowSuperAdminPanel}
                handleDeleteObservation={handleDeleteObservation}
                setShowNewCycleModal={setShowNewCycleModal}
            />

            {/* NEW CYCLE MODAL */}
            {showNewCycleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#1B3C73] p-6 text-white relative">
                            <button onClick={() => setShowNewCycleModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">✕</button>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users size={20} /> Nueva Observación
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">Selecciona el docente que vas a acompañar</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Docente a Observar</label>
                                <select
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#C87533] outline-none transition-all"
                                    value={newCycleTeacherId}
                                    onChange={(e) => setNewCycleTeacherId(e.target.value)}
                                >
                                    <option value="">Seleccionar Docente...</option>
                                    {allUsers.filter((u: any) => u.role !== 'superadmin').map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Fecha y Hora Programada</label>
                                <input
                                    type="datetime-local"
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#C87533] outline-none transition-all"
                                    value={newCycleDateTime}
                                    onChange={(e) => setNewCycleDateTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Asignatura / Contexto (Ej: Matemática 2º Medio)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 focus:ring-2 focus:ring-[#C87533] outline-none transition-all"
                                    value={newCycleSubject}
                                    onChange={(e) => setNewCycleSubject(e.target.value)}
                                    placeholder="Ej: Matemática 2º Medio"
                                />
                            </div>
                            <button
                                onClick={handleNewCycle}
                                disabled={!newCycleTeacherId}
                                className="w-full py-3 bg-[#1B3C73] hover:bg-[#2A59A8] text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                            >
                                INICIAR PAUTA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TEACHER DETAIL DRAWER */}
            {showTeacherDetailDrawer && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTeacherDetailDrawer(false)} />
                    <div className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto relative animate-in slide-in-from-right duration-300">
                        <div className="bg-[#1B3C73] p-6 text-white sticky top-0 z-10 shadow-md">
                            <button onClick={() => setShowTeacherDetailDrawer(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Users className="text-[#f2ae60]" size={28} />
                                Perfil Docente Interactivo
                            </h2>
                            <p className="text-blue-100 text-sm mt-2 opacity-90">Resumen y trayectoria pedagógica basada en observación empírica</p>
                        </div>

                        <div className="p-8">
                            {loadingTeacherDetail ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#C87533] animate-spin"></div>
                                    <p className="text-slate-500 font-medium animate-pulse">Solicitando análisis de trayectoria a IA...</p>
                                </div>
                            ) : teacherDetailData ? (
                                <div className="space-y-8 animate-in mt-4 fade-in duration-500">

                                    {/* CABECERA RESUMEN */}
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1B3C73] to-[#2A59A8] text-white text-3xl font-black shadow-lg mb-4">
                                            {teacherDetailData.teacher_name?.charAt(0) || 'D'}
                                        </div>
                                        <h3 className="text-2xl font-black text-[#1B3C73]">{teacherDetailData.teacher_name || 'Docente'}</h3>
                                        <p className="text-slate-500 font-medium flex items-center justify-center gap-2 mt-2">
                                            <Calendar size={14} /> Historial de {teacherDetailData.total_observations || 0} Acompañamientos
                                        </p>
                                    </div>

                                    {/* STATS RAPIDAS */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                            <span className="block text-slate-500 text-xs font-bold uppercase mb-1">Cierre Cliclos</span>
                                            <span className="text-2xl font-black text-[#1B3C73]">{teacherDetailData.closure_rate || 0}%</span>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                            <span className="block text-slate-500 text-xs font-bold uppercase mb-1">Índice Rigor</span>
                                            <span className="text-2xl font-black text-[#C87533]">{teacherDetailData.depth_index || 0}%</span>
                                        </div>
                                    </div>

                                    {/* TRAYECTORIA IA */}
                                    {teacherDetailData.trajectory_analysis && (
                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden">
                                            <BrainCircuit className="absolute top-4 right-4 text-indigo-200/50" size={100} />
                                            <div className="relative z-10">
                                                <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                                    <BrainCircuit size={18} className="text-indigo-600" />
                                                    IA Trajectory Report
                                                </h4>

                                                <div className="space-y-4">
                                                    <div>
                                                        <span className="text-xs font-bold uppercase text-indigo-400">Tendencia General</span>
                                                        <p className="text-indigo-900 font-medium text-lg leading-tight mt-1">
                                                            {teacherDetailData.trajectory_analysis.trend || 'Sin datos suficientes'}
                                                        </p>
                                                    </div>

                                                    <div className="bg-white/60 p-4 rounded-xl border border-indigo-100">
                                                        <span className="text-xs font-bold uppercase text-indigo-400 mb-2 block">Insight Segmentado ({userRole?.toUpperCase()})</span>
                                                        <p className="text-sm text-slate-700 leading-relaxed italic">
                                                            "{userRole === 'teacher' ? teacherDetailData.trajectory_analysis.teacher_view : userRole === 'utp' ? teacherDetailData.trajectory_analysis.utp_view : teacherDetailData.trajectory_analysis.director_view || teacherDetailData.trajectory_analysis.summary || 'El docente requiere de más ciclos de observación.'}"
                                                        </p>
                                                    </div>

                                                    {teacherDetailData.trajectory_analysis.focus && (
                                                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                                            <span className="text-xs font-bold uppercase text-orange-600 mb-1 flex items-center gap-1">
                                                                <Target size={14} /> Foco Directivo Recomendado
                                                            </span>
                                                            <p className="text-sm text-orange-900 font-medium">
                                                                {teacherDetailData.trajectory_analysis.focus}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* GAMIFICATION XP */}
                                    <div className="mt-8">
                                        <h4 className="font-bold text-[#1B3C73] mb-4 flex items-center gap-2">
                                            <Trophy size={20} className="text-[#f2ae60]" />
                                            Insignias y Desarrollo Profesional
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {teacherDetailData.skills && teacherDetailData.skills.length > 0 ? teacherDetailData.skills.map((skill: any) => {
                                                const lvlIcons: Record<string, string> = { 'Novato': '🌱', 'Competente': '⭐', 'Referente': '🔥', 'Mentor': '👑' };
                                                const xp = skill.total_xp || 0;
                                                const lvlName = skill.current_level || 'Novato';
                                                
                                                // Calculate progress to next tier
                                                let floor = 0;
                                                let ceil = 150;
                                                let maxedOut = false;
                                                
                                                if(xp >= 500) { floor = 500; ceil = 500; maxedOut = true; }
                                                else if(xp >= 300) { floor = 300; ceil = 500; }
                                                else if(xp >= 150) { floor = 150; ceil = 300; }
                                                
                                                const progressPercent = maxedOut ? 100 : Math.round(((xp - floor) / (ceil - floor)) * 100);

                                                return (
                                                    <div key={skill.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                                        {maxedOut && <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none"><Trophy size={60} /></div>}
                                                        
                                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                                            <div>
                                                                <h5 className="font-bold text-[#1B3C73] text-sm leading-tight pr-2">{skill.skill_name}</h5>
                                                                <span className="inline-flex mt-1 items-center gap-1 bg-blue-50 text-[#2A59A8] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                                                                    {lvlIcons[lvlName] || ''} Nivel {lvlName}
                                                                </span>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <span className="block text-xl font-black text-[#C87533] leading-none">{xp}</span>
                                                                <span className="text-[10px] uppercase font-bold text-slate-400">XP</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="relative z-10">
                                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                                                                <span>Progreso Hito</span>
                                                                <span>{maxedOut ? 'Máximo' : `${progressPercent}%`}</span>
                                                            </div>
                                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                <div 
                                                                    className={`h-full rounded-full transition-all duration-1000 ${maxedOut ? 'bg-yellow-400' : 'bg-[#1B3C73]'}`}
                                                                    style={{ width: `${progressPercent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }) : (
                                                <div className="col-span-2 text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                                    <p className="text-sm text-slate-500 font-medium">Aún no hay insignias desbloqueadas. ¡Completa más observaciones para subir de nivel!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* VER DETALLE BOTON */}
                                    <div className="pt-4">
                                        <button
                                            // TODO: link to full historic view for this specific teacher
                                            onClick={() => router.push(`/acompanamiento/docentes?q=${encodeURIComponent(teacherDetailData.teacher_name)}`)}
                                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                                        >
                                            <Eye size={18} /> VER HISTORIAL COMPLETO
                                        </button>
                                    </div>

                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-400">
                                    <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No se pudo cargar la información del docente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIG MODAL */}
            {showConfigModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#1B3C73] p-6 text-white relative">
                            <button onClick={() => setShowConfigModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white">✕</button>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Settings size={20} /> Configurar Reporte
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">Segmentación de datos para inteligencia</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento / Asignatura</label>
                                <select
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white"
                                    value={filterDept}
                                    onChange={(e) => setFilterDept(e.target.value)}
                                >
                                    <option value="">Todos los Departamentos</option>
                                    <option value="Lenguaje">Lenguaje</option>
                                    <option value="Matemática">Matemática</option>
                                    <option value="Ciencias">Ciencias</option>
                                    <option value="Historia">Historia</option>
                                    <option value="Inglés">Inglés</option>
                                    <option value="Artes">Artes</option>
                                    <option value="Educación Física">Educación Física</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Experiencia</label>
                                    <select
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white"
                                        value={filterExp}
                                        onChange={(e) => setFilterExp(e.target.value)}
                                    >
                                        <option value="">Todas</option>
                                        <option value="0-5">Novatos (0-5 años)</option>
                                        <option value="5-15">Intermedios (5-15)</option>
                                        <option value="15+">Expertos (15+)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Edad Docente</label>
                                    <select
                                        className="w-full p-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white"
                                        value={filterAge}
                                        onChange={(e) => setFilterAge(e.target.value)}
                                    >
                                        <option value="">Todas</option>
                                        <option value="20-30">20-30 años</option>
                                        <option value="30-50">30-50 años</option>
                                        <option value="50+">50+ años</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleGenerateExecutive}
                                    className="w-full py-3 bg-[#C87533] hover:bg-[#A65E26] text-white font-bold rounded-xl shadow-lg shadow-orange-900/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <BrainCircuit size={18} /> GENERAR ANÁLISIS ESTRATÉGICO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Suspense>
    );
}

function DashboardContent({
    loading, userRole, userName, currentUser, stats, recentCycles, allCycles, radarData,
    handleGenerateExecutive, loadingExecutive, handleNewCycle,
    showInsightDrawer, setShowInsightDrawer, showExecutiveModal, setShowExecutiveModal, executiveData, SuperAdminWidget, usersMap,
    latestInsight, setShowConfigModal, handleViewTeacherDetail,
    showTeacherDetailDrawer, setShowTeacherDetailDrawer, teacherDetailData, loadingTeacherDetail, selectedTeacherId,
    showSuperAdminPanel, setShowSuperAdminPanel, handleDeleteObservation, setShowNewCycleModal
}: any) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get('view');

    // STRICT WHITELIST
    const canManageTeachers = ['admin', 'director', 'utp'].includes(userRole || '');

    const pendingAgreements = userRole === 'teacher' ? allCycles.filter((c: any) => c.status === 'planned' && c.teacher_agreed === false && c.teacher_id === currentUser?.id) : [];
    const upcomingFlights = canManageTeachers ? allCycles.filter((c: any) => c.status === 'planned').sort((a: any, b: any) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime()) : [];

    // Auto-open reports if requested
    useEffect(() => {
        if (view === 'reports' && !showExecutiveModal && !loadingExecutive) {
            // Optional: Auto-trigger or just show the button
            // handleGenerateExecutive(); 
        }
    }, [view, showExecutiveModal, loadingExecutive]);

    const [showDrillDown, setShowDrillDown] = useState(false);
    const [drillDownDimension, setDrillDownDimension] = useState<any>(null);
    const [drillDownData, setDrillDownData] = useState<{tags: {name: string, count: number}[], notes: any[]}>({tags: [], notes: []});
    const [loadingDrillDown, setLoadingDrillDown] = useState(false);

    const handleRadarClick = async (event: any) => {
        const payload = event?.payload || event;
        if(!payload || !payload.id) return;
        
        setDrillDownDimension(payload);
        setShowDrillDown(true);
        setLoadingDrillDown(true);
        setDrillDownData({tags: [], notes: []});

        try {
            const completedCycles = allCycles.filter((c:any) => c.status === 'completed');
            let filterIds = completedCycles.map((c:any) => c.id);
            if(userRole === 'teacher') {
                filterIds = completedCycles.filter((c:any) => c.teacher_id === currentUser?.id).map((c:any) => c.id);
            }
            if(filterIds.length === 0) { setLoadingDrillDown(false); return; }

            const { data: obsData } = await supabase
                .from('observation_data')
                .select('cycle_id, content, created_at')
                .in('cycle_id', filterIds)
                .eq('stage', 'execution');

            if(obsData) {
                const tagCounts: Record<string, number> = {};
                const notesList: any[] = [];
                const dimId = payload.id;

                obsData.forEach((row: any) => {
                    const content = row.content || {};
                    const tags = content.tags_selected || [];
                    const obs = content.observations || {};
                    const parentCycle = allCycles.find((c:any) => c.id === row.cycle_id);
                    const date = row.created_at;
                    const observerName = parentCycle ? (usersMap[parentCycle.observer_id] || 'Observador') : 'Observador';

                    // Parse Tags
                    tags.forEach((t: string) => {
                        if(t.startsWith(`${dimId}_`)) {
                            const tagName = t.replace(`${dimId}_`, '');
                            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
                        }
                    });

                    // Parse Notes
                    if(obs[dimId] && obs[dimId].trim() !== '') {
                        notesList.push({
                            text: obs[dimId],
                            date: date,
                            observerName: observerName
                        });
                    }
                });

                const tagsArray = Object.entries(tagCounts).map(([name, count]) => ({name, count})).sort((a,b)=>b.count-a.count);
                notesList.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setDrillDownData({ tags: tagsArray, notes: notesList });
            }
        } catch(e) {
            console.error("Error fetching drilldown:", e);
        } finally {
            setLoadingDrillDown(false);
        }
    };

    if (loading) return <div className="p-8 text-[#1B3C73]">Cargando panel...</div>;

    return (
        <div className="font-sans text-[#1B3C73]">
            {/* DRILL DOWN DRAWER */}
            {showDrillDown && drillDownDimension && (
                <div className="fixed inset-0 z-[150] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDrillDown(false)} />
                    <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-300">
                        <div className="bg-[#1B3C73] p-6 text-white shrink-0">
                            <button onClick={() => setShowDrillDown(false)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Target className="text-[#f2ae60]" size={28} />
                                {drillDownDimension.subject}
                            </h2>
                            <p className="text-blue-100 text-sm mt-1 opacity-90">Evidencia cualitativa y didáctica</p>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
                            {loadingDrillDown ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
                                    <p className="text-slate-500 font-medium">Buscando evidencia observacional...</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* TAGS */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Estrategias (Tags)</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {drillDownData.tags.map(t => (
                                                <div key={t.name} className="bg-white border text-xs border-[#2A59A8] text-[#1B3C73] px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-2">
                                                    {t.name} <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full text-[10px]">{t.count}</span>
                                                </div>
                                            ))}
                                            {drillDownData.tags.length === 0 && <p className="text-slate-500 text-sm">No hay etiquetas registradas para este eje.</p>}
                                        </div>
                                    </div>

                                    {/* NOTES FEED */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Evidencia Descriptiva</h3>
                                        <div className="space-y-4">
                                            {drillDownData.notes.map((note, idx) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-[#C87533]">{note.observerName}</span>
                                                        <span className="text-[10px] font-medium text-slate-400">{new Date(note.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
                                                </div>
                                            ))}
                                            {drillDownData.notes.length === 0 && <p className="text-slate-500 text-sm">No hay notas de campo para este eje.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* LOADING SCREEN FOR EXECUTIVE REPORT */}
            {loadingExecutive && (
                <div className="fixed inset-0 z-[200] bg-[#1B3C73] flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-full border-4 border-[#1B3C73] border-t-[#f2ae60] border-r-[#f2ae60] animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BrainCircuit className="w-10 h-10 text-white animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3">Construyendo Inteligencia Estratégica</h2>
                    <p className="text-blue-200 text-lg max-w-lg text-center leading-relaxed">Analizando datos observacionales, identificando brechas y recomendando acciones pedagógicas para tu equipo docente...</p>
                </div>
            )}

            {/* INICIO DRAWER (SIMULADO) */}
            {showInsightDrawer && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowInsightDrawer(false)} />
                    <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto relative animate-in slide-in-from-right duration-300">
                        <button onClick={() => setShowInsightDrawer(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400">
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold text-[#1B3C73] mb-2 flex items-center gap-3">
                            <BrainCircuit className="text-[#C87533]" /> Insight Detallado
                        </h2>
                        <p className="text-slate-500 text-sm mb-6">Análisis basado en {latestInsight ? 'IA en tiempo real' : 'datos pedagógicos'}</p>

                        <div className="space-y-6">
                            {latestInsight && ((latestInsight.analysis || latestInsight).systemic_summary || (Array.isArray((latestInsight.analysis || latestInsight).top_3_gaps) && (latestInsight.analysis || latestInsight).top_3_gaps.length > 0)) ? (
                                <>
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <h3 className="font-bold text-[#C87533] text-sm mb-2">🚨 Brechas Detectadas (Top 3)</h3>
                                        <ul className="space-y-2">
                                            {Array.isArray((latestInsight.analysis || latestInsight).top_3_gaps) && (latestInsight.analysis || latestInsight).top_3_gaps.length > 0 ? (
                                                (latestInsight.analysis || latestInsight).top_3_gaps.map((gap: any, i: number) => (
                                                    <li key={i} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                                                        <span className="font-bold">•</span> {typeof gap === 'string' ? gap : (gap.foco || gap.objetivo || JSON.stringify(gap))}
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-slate-500 italic flex gap-2">
                                                    <span className="font-bold">•</span> No hay datos suficientes para mostrar brechas en este período.
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className={"font-bold text-[#1B3C73] text-sm mb-3"}>💡 Recomendación Estratégica</h3>
                                        <div className={"bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-slate-700 mb-4 whitespace-pre-wrap"}>
                                            <span className={"block font-bold text-[#2A59A8] mb-3"}>Capacitación Sugerida:</span>
                                            {Array.isArray((latestInsight.analysis || latestInsight).recommended_training) ? (
                                                <div className="space-y-4">
                                                    {(latestInsight.analysis || latestInsight).recommended_training.map((item: any, idx: number) => (
                                                        <div key={idx} className="bg-white border border-blue-200/60 rounded-xl p-4 shadow-sm">
                                                            <h5 className="font-bold text-[#1B3C73] mb-2">{item.foco || "Sugerencia de Capacitación"}</h5>
                                                            <p className="text-slate-600 mb-2 leading-relaxed"><span className="font-semibold text-slate-700">Objetivo:</span> {item.objetivo}</p>
                                                            <p className="text-slate-600 mb-2 leading-relaxed"><span className="font-semibold text-slate-700">Metodología:</span> {item.metodologia}</p>
                                                            {item.kpi && <p className="text-blue-700 font-medium italic mt-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100"><span className="text-slate-500 not-italic font-semibold">KPI Esperado:</span> {item.kpi}</p>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                typeof (latestInsight.analysis || latestInsight).recommended_training === 'string'
                                                    ? (latestInsight.analysis || latestInsight).recommended_training
                                                    : JSON.stringify((latestInsight.analysis || latestInsight).recommended_training, null, 2)
                                            )}
                                        </div>

                                        {/* EXPORT BUTTON */}
                                        <button
                                            onClick={async () => {
                                                const toastId = toast.loading("Generando documento...");
                                                try {
                                                    const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                                                    const metricsData = latestInsight.metrics || latestInsight.heatmap || {};
                                                    const analysisData = latestInsight.analysis || latestInsight || {};
                                                    const body = {
                                                        systemic_summary: String(analysisData.systemic_summary || ""),
                                                        top_3_gaps: Array.isArray(analysisData.top_3_gaps) ? analysisData.top_3_gaps : (analysisData.top_3_gaps ? [analysisData.top_3_gaps] : []),
                                                        recommended_training: analysisData.recommended_training || "",
                                                        rigor_audit: metricsData.rigor_audit || null,
                                                        heatmap: metricsData.heatmap || null,
                                                        global_metrics: metricsData.global_metrics || null,
                                                        highlights: metricsData.highlights || null,
                                                        matriz: metricsData.matriz || null
                                                    };
                                                    const res = await fetch(`${BE_URL}/export/executive-docx`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(body)
                                                    });
                                                    if (!res.ok) throw new Error("Error export");
                                                    const blob = await res.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = "Reporte_Ejecutivo_ProfeIC.docx";
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                    toast.success("Documento descargado", { id: toastId });
                                                } catch (e) {
                                                    console.error(e);
                                                    toast.error("Error al exportar", { id: toastId });
                                                }
                                            }}
                                            className={"w-full py-2 bg-[#1B3C73] text-white text-sm font-bold rounded-lg hover:bg-[#2A59A8] transition-colors flex items-center justify-center gap-2"}
                                        >
                                            <FileText size={16} /> Descargar Reporte Oficial (DOCX)
                                        </button>

                                        {latestInsight.rigor_audit && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="text-xs text-slate-400 font-mono text-center">
                                                    Auditoría de Rigor: Index {latestInsight.rigor_audit.depth_index}%
                                                    <span className={latestInsight.rigor_audit.depth_index < 30 ? "text-red-400 ml-1" : "text-green-400 ml-1"}>
                                                        ●
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : latestInsight ? (
                                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                        <AlertCircle size={28} className="text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-700 mb-2">Sin datos actuales</h3>
                                    <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                                        El sistema interactuó con la base de datos pero la información está incompleta o vacía. Realiza más observaciones o genera un nuevo reporte para ver detalles.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-400">
                                    <p>Genera un reporte para ver el detalle.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EXECUTIVE REPORT */}
            {showExecutiveModal && executiveData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in-50 duration-300 relative">
                        <button
                            onClick={() => setShowExecutiveModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 bg-white shadow-sm z-10"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-4 mb-8 border-b pb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#1a2e3b] to-[#2b546e] rounded-2xl flex items-center justify-center text-3xl shadow-lg text-white">
                                🏛️
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-[#1a2e3b]">Reporte Ejecutivo Institucional</h3>
                                <p className="text-slate-500 font-medium">Análisis Sistémico de {executiveData.metrics.total_observations} Observaciones</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* COL 1: DIAGNOSTIC */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-[#1a2e3b] mb-2 flex items-center gap-2">
                                        🔍 Diagnóstico Sistémico
                                    </h4>
                                    <div className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm whitespace-pre-wrap">
                                        {typeof executiveData.analysis.systemic_summary === 'string'
                                            ? executiveData.analysis.systemic_summary
                                            : JSON.stringify(executiveData.analysis.systemic_summary)}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                                        ⚠️ Top 3 Brechas Detectadas
                                    </h4>
                                    <ul className="space-y-2">
                                        {executiveData.analysis.top_3_gaps.map((gap: any, i: number) => (
                                            <li key={i} className="flex items-start gap-3 bg-red-50 p-3 rounded-xl border border-red-100 text-red-900 text-sm font-medium">
                                                <span className="bg-white text-red-600 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0">{i + 1}</span>
                                                {typeof gap === 'string' ? gap : (gap.foco || gap.objetivo || JSON.stringify(gap))}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* COL 2: ACTION PLAN */}
                            <div className="space-y-6">
                                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 h-full">
                                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                        🎓 Plan de Capacitación Recomendado
                                    </h4>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 mb-4 h-64 overflow-y-auto space-y-4">
                                        <span className="text-xs font-bold text-indigo-400 uppercase block mb-2 sticky top-0 bg-white pb-2 z-10 border-b border-indigo-50">Iniciativas de Capacitación Sugeridas</span>
                                        {Array.isArray(executiveData.analysis.recommended_training) ? (
                                            executiveData.analysis.recommended_training.map((item: any, idx: number) => (
                                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
                                                    <h5 className="font-bold text-indigo-900 mb-1">{item.foco}</h5>
                                                    <p className="text-slate-600 mb-2 whitespace-pre-wrap leading-relaxed"><span className="font-semibold text-slate-700">Objetivo:</span> {item.objetivo}</p>
                                                    <p className="text-slate-600 mb-2 whitespace-pre-wrap leading-relaxed"><span className="font-semibold text-slate-700">Metodología:</span> {item.metodologia}</p>
                                                    <p className="text-indigo-600 font-medium italic"><span className="text-slate-500 not-italic">KPI:</span> {item.kpi}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-indigo-900 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                                                {typeof executiveData.analysis.recommended_training === 'string'
                                                    ? executiveData.analysis.recommended_training.replace(/\|/g, '\n\n')
                                                    : JSON.stringify(executiveData.analysis.recommended_training)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-indigo-700/80 text-sm leading-relaxed mb-6">
                                        Las recomendaciones anteriores han sido generadas específicamente para abordar las brechas detectadas en la muestra de observaciones institucionales.
                                    </p>

                                    {/* EXPORT BUTTON */}
                                    <button
                                        onClick={async () => {
                                            const toastId = toast.loading("Generando documento...");
                                            try {
                                                const metricsData = executiveData.metrics || {};
                                                const analysisData = executiveData.analysis || {};
                                                const body = {
                                                    systemic_summary: String(analysisData.systemic_summary || ""),
                                                    top_3_gaps: Array.isArray(analysisData.top_3_gaps) ? analysisData.top_3_gaps : (analysisData.top_3_gaps ? [analysisData.top_3_gaps] : []),
                                                    recommended_training: analysisData.recommended_training || "",
                                                    rigor_audit: metricsData.rigor_audit || null,
                                                    heatmap: metricsData.heatmap || null,
                                                    global_metrics: {
                                                        ...metricsData.global_metrics,
                                                        structural: metricsData.structural || null
                                                    },
                                                    highlights: metricsData.highlights || null,
                                                    matriz: metricsData.matriz || null
                                                };
                                                const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                                                const res = await fetch(`${BE_URL}/export/executive-docx`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(body)
                                                });
                                                if (!res.ok) throw new Error("Error export");
                                                const blob = await res.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = "Reporte_Ejecutivo_ProfeIC.docx";
                                                document.body.appendChild(a);
                                                a.click();
                                                window.URL.revokeObjectURL(url);
                                                toast.success("Documento descargado", { id: toastId });
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Error al exportar", { id: toastId });
                                            }
                                        }}
                                        className={"w-full py-4 bg-[#C87533] text-white text-sm font-bold rounded-xl hover:bg-[#A65E26] transition-all shadow-lg shadow-orange-900/10 flex items-center justify-center gap-2"}
                                    >
                                        <FileText size={18} /> DESCARGAR REPORTE OFICIAL PARA SOSTENEDOR
                                    </button>

                                    {/* CSV EXPORT BUTTON */}
                                    <button
                                        onClick={() => {
                                            if (!allCycles || allCycles.length === 0) {
                                                toast.error("No hay datos para exportar");
                                                return;
                                            }
                                            const headers = ["ID_Observacion", "Fecha", "Estado", "ID_Docente", "Nombre_Docente", "ID_Observador", "Puntaje_Total_Generado"];
                                            const csvRows = allCycles.map((c: any) => {
                                                const date = new Date(c.created_at).toLocaleDateString() || "";
                                                const status = c.status || "";
                                                const teacherId = c.teacher_id || "";
                                                const teacherName = (usersMap[c.teacher_id] || "Desconocido").replace(/,/g, " ");
                                                const obsId = c.observer_id || "";
                                                const score = c.total_score || 0;
                                                return [c.id, date, status, teacherId, teacherName, obsId, score].join(",");
                                            });
                                            const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
                                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement("a");
                                            link.href = url;
                                            link.setAttribute("download", "Dataset_Observaciones_ProfeIC.csv");
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            toast.success("Dataset exportado correctamente");
                                        }}
                                        className={"w-full py-3 mt-3 bg-white text-[#1B3C73] border-2 border-[#1B3C73] text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"}
                                    >
                                        <FileText size={18} /> DESCARGAR DATASET CRUDO (CSV)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-[#1a2e3b]">
                            {userRole === 'teacher' ? 'Mi Desarrollo Profesional' : 'Panel de Dirección'}
                        </h1>
                        <p className="text-xs text-slate-500 font-bold tracking-wide uppercase">
                            {userRole === 'teacher' ? 'Portafolio Docente' : 'Gestión de Acompañamiento'}
                        </p>
                    </div>

                    {canManageTeachers && (
                        <button
                            onClick={() => setShowConfigModal(true)}
                            disabled={loadingExecutive}
                            className={`px-5 py-2.5 rounded-xl font-bold hover:bg-[#2b546e] transition-all shadow-lg flex items-center gap-2 text-sm ${view === 'reports' ? 'bg-[#C87533] text-white ring-2 ring-[#f2ae60] ring-offset-2' : 'bg-[#1a2e3b] text-white'
                                }`}
                        >
                            {loadingExecutive ? <span className="animate-spin">🔄</span> : <span>🏛️</span>}
                            {loadingExecutive ? "Procesando..." : "Generar Reporte Ejecutivo"}
                        </button>
                    )}
                </div>
            </header>

            {/* HEADER CON BUSCADOR Y ACCIONES */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-8 max-w-7xl mx-auto px-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#1B3C73]">
                        Hola, {userName.split(' ')[0] || 'Docente'} 👋
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {userRole === 'teacher' ? 'Aquí tienes el resumen de tu actividad pedagógica.' : 'Resumen Ejecutivo del Colegio'}
                    </p>
                </div>

                {canManageTeachers && (
                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap md:flex-nowrap">
                        <div className="relative group w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C87533] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar docente (Enter)..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#C87533] focus:border-transparent outline-none transition-all text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value;
                                        if (val.trim()) router.push(`/acompanamiento/docentes?q=${encodeURIComponent(val)}`);
                                    }
                                }}
                            />
                        </div>

                        <Link href="/acompanamiento/docentes" className="bg-white text-slate-600 p-3 rounded-xl hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors group relative">
                            <Users size={20} className="group-hover:text-[#2A59A8]" />
                            <div className="hidden group-hover:block absolute top-[120%] left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg shadow-xl z-50 pointer-events-none">Gestión Docentes</div>
                        </Link>

                        {currentUser?.email === 're.se.alvarez@gmail.com' && (
                            <Link href="/acompanamiento/admin/users" className="bg-white text-slate-600 p-3 rounded-xl hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors group relative">
                                <Settings size={20} className="group-hover:text-[#C87533]" />
                                <div className="hidden group-hover:block absolute top-[120%] left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg shadow-xl z-50 pointer-events-none">Admin Usuarios</div>
                            </Link>
                        )}

                        <button onClick={() => setShowNewCycleModal(true)} className="bg-[#1B3C73] text-white p-3 md:px-5 md:py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2A59A8] transition-colors shadow-lg shadow-blue-900/20 active:scale-95 whitespace-nowrap">
                            <Plus size={20} />
                            <span className="hidden md:inline font-bold">Observar</span>
                        </button>
                    </div>
                )}
            </header>

            {/* SUPER ADMIN DASHBOARD */}
            {canManageTeachers && (
                <div className="max-w-7xl mx-auto px-6 mb-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm transition-all">
                        <button
                            onClick={() => setShowSuperAdminPanel(!showSuperAdminPanel)}
                            className="w-full px-8 py-4 flex items-center justify-between text-[#1B3C73] hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#1B3C73] text-white rounded-xl shadow-md shadow-blue-900/10">
                                    <Settings size={18} />
                                </div>
                                <span className="font-bold text-lg">Panel Directivo</span>
                                {!showSuperAdminPanel && (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold ml-2">KPIs & MÉTRICAS</span>
                                )}
                            </div>
                            {showSuperAdminPanel ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showSuperAdminPanel && (
                            <div className="p-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                                <SuperAdminWidget currentUser={currentUser} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                {userRole === 'teacher' && pendingAgreements.length > 0 && (
                    <div className="mb-8">
                        {pendingAgreements.map((cycle: any) => (
                            <div key={cycle.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-yellow-900">¡Acuerdo Pendiente!</h3>
                                        <p className="text-yellow-800 text-sm mt-1">
                                            Tienes un acompañamiento programado el <strong>{cycle.scheduled_at ? new Date(cycle.scheduled_at).toLocaleDateString() : 'Pronto'}</strong> para <strong>{cycle.subject_context || 'tu clase'}</strong>.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push(`/acompanamiento/observacion/${cycle.id}`)}
                                    className="whitespace-nowrap bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
                                >
                                    Declarar Foco Aquí
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* PRÓXIMOS VUELOS WIDGET (ADMIN) */}
                {view !== 'observations' && canManageTeachers && upcomingFlights.length > 0 && (
                    <div className="mb-8 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                        <h3 className="font-bold text-[#1B3C73] mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-[#C87533]" />
                            Próximos Acompañamientos (Próximos Vuelos)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingFlights.map((cycle: any) => (
                                <div key={cycle.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/acompanamiento/observacion/${cycle.id}`)}>
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-slate-800 text-sm flex-1 mr-2">{usersMap[cycle.teacher_id] || 'Docente'}</span>
                                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm whitespace-nowrap">
                                                {cycle.scheduled_at ? new Date(cycle.scheduled_at).toLocaleDateString('es-CL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Sin Fecha'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">{cycle.subject_context || 'Sin asignatura'}</p>
                                    </div>
                                    <div className={`mt-auto text-[10px] font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 ${cycle.teacher_agreed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                        <span className={`w-2 h-2 shrink-0 rounded-full ${cycle.teacher_agreed ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                                        {cycle.teacher_agreed ? 'Foco declarado - Listo' : 'Esperando confirmación'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* WIDGETS ROW: INSIGHT (IF ADMIN) & RADAR */}
                {view !== 'observations' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {canManageTeachers && (
                            <div className="md:col-span-3 bg-gradient-to-br from-[#1B3C73] via-[#244b8f] to-[#1B3C73] p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-white/10">
                                <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-[120px] select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                    360°
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-orange-400/20 p-2.5 rounded-xl backdrop-blur-md border border-orange-400/30">
                                                <Zap size={20} className="text-[#f2ae60] animate-pulse" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl tracking-tight flex items-center gap-2">
                                                    Insight Estratégico AI
                                                    <span className="bg-blue-400/20 text-blue-200 text-[9px] font-black px-2 py-0.5 rounded-full border border-blue-400/30 tracking-widest uppercase">Live</span>
                                                </h3>
                                                <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.2em]">Análisis Estructural Inteligente</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-inner relative group/box">
                                            <p className="text-blue-50 text-sm leading-relaxed font-medium line-clamp-2 italic">
                                                {latestInsight
                                                    ? (latestInsight.analysis || latestInsight).systemic_summary || `Se detectaron ${(latestInsight.analysis || latestInsight).top_3_gaps?.length || 0} oportunidades de mejora sistémica.`
                                                    : "El analizador neuronal está procesando los datos de acompañamiento. Genera un nuevo informe para obtener una visión profunda."}
                                            </p>
                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover/box:opacity-10 transition-opacity">
                                                <BrainCircuit size={40} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 w-full md:w-56 space-y-2">
                                        <button
                                            onClick={() => setShowConfigModal(true)}
                                            className="w-full py-3.5 bg-white text-[#1B3C73] text-[11px] font-black rounded-xl hover:bg-slate-50 transition-all shadow-xl shadow-black/20 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                                        >
                                            🚀 Generar Reporte 360°
                                        </button>

                                        {latestInsight && (
                                            <button
                                                onClick={() => setShowInsightDrawer(true)}
                                                className="w-full py-2.5 bg-white/10 border border-white/20 text-white text-[10px] font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md uppercase tracking-widest"
                                            >
                                                Detalles <ArrowRight size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {view === 'observations' ? (
                    /* FULL OBSERVATIONS LIST VIEW */
                    <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col shadow-sm">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-[#1B3C73] text-lg">Historial Completo de Observaciones</h3>
                            <button onClick={() => router.push('/acompanamiento/dashboard')} className="text-sm font-bold text-slate-500 hover:text-[#1B3C73]">
                                Volver al Dashboard
                            </button>
                        </div>
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                        <th className="p-3">Estado</th>
                                        <th className="p-3">Docente / Fecha</th>
                                        <th className="p-3">Observador</th>
                                        <th className="p-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-50">
                                    {allCycles.map((cycle: any) => (
                                        <tr key={cycle.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${cycle.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-[#C87533]'}`}>
                                                    {cycle.status === 'in_progress' ? 'En Curso' : cycle.status === 'planned' ? 'Planificado' : 'Completado'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleViewTeacherDetail(cycle.teacher_id)}
                                                    className="font-bold text-[#1B3C73] text-left hover:underline focus:outline-none"
                                                >
                                                    {usersMap[cycle.teacher_id] || 'Docente Observado'}
                                                </button>
                                                <div className="text-xs text-slate-400">{new Date(cycle.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-3 text-slate-500">
                                                {/* Requires join, using ID for now if name not available in this view */}
                                                {usersMap[cycle.observer_id] || (cycle.observer_id === currentUser?.id ? 'Mí mismo' : 'Otro observador')}
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2 text-slate-400">
                                                    <Link href={`/acompanamiento/observacion/${cycle.id}`} className="p-2 hover:bg-slate-100 rounded-lg text-[#2A59A8] transition-colors" title="Ver detalle">
                                                        <ArrowRight size={18} />
                                                    </Link>
                                                    {canManageTeachers && (
                                                        <button
                                                            onClick={() => handleDeleteObservation(cycle.id)}
                                                            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                            title="Eliminar observación"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {allCycles.length === 0 && (
                                <p className="text-center text-slate-400 py-10">No hay observaciones registradas.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    /* DEFAULT DASHBOARD GRID */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* WIDGET 1: KPI CARDS */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-200/60 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BarChart3 size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="p-1.5 bg-blue-50 text-[#1B3C73] rounded-lg"><BarChart3 size={16} /></span>
                                        <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Total Ciclos</h3>
                                    </div>
                                    <p className="text-4xl font-extrabold text-[#1B3C73]">{stats.total}</p>
                                    <p className="text-xs text-green-500 mt-2 font-bold flex items-center gap-1">
                                        <TrendingUp size={12} /> +12% vs mes anterior
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-200/60 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Users size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="p-1.5 bg-orange-50 text-[#C87533] rounded-lg"><Users size={16} /></span>
                                        <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Activos Ahora</h3>
                                    </div>
                                    <p className="text-4xl font-extrabold text-[#1B3C73]">{stats.active}</p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">Docentes siendo observados</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-200/60 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <CheckCircle2 size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="p-1.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={16} /></span>
                                        <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Completados</h3>
                                    </div>
                                    <p className="text-4xl font-extrabold text-[#1B3C73]">{stats.completed}</p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">Ciclos cerrados exitosamente</p>
                                </div>
                            </div>
                        </div>

                        {/* WIDGET 2: RADAR CHART */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 lg:col-span-1 h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-[#1B3C73] flex items-center gap-2">
                                    <TrendingUp size={18} className="text-[#C87533]" />
                                    {userRole === 'teacher' ? 'Mi Pulso Metodológico' : 'Pulso Metodológico (Colegio)'}
                                </h3>
                            </div>
                            <div className="flex-1 min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Colegio" dataKey="A" stroke="#C87533" strokeWidth={3} fill="#C87533" fillOpacity={0.2} activeDot={{ onClick: handleRadarClick, cursor: 'pointer' }} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* WIDGET 3: AI INSIGHT & DOCENTES SEMÁFORO */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* AI INSIGHT COLLAPSIBLE*/}
                            <div className="bg-gradient-to-br from-[#1B3C73] to-[#2A59A8] p-6 rounded-3xl shadow-xl text-white relative transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                    <BrainCircuit size={150} />
                                </div>
                                <div className="relative z-10">
                                    <details className="group">
                                        <summary className="cursor-pointer list-none flex items-center justify-between outline-none">
                                            <div className="flex items-center gap-2 text-[#C87533] hover:text-[#f2ae60] transition-colors">
                                                <BrainCircuit size={20} />
                                                <span className="font-bold text-xs uppercase tracking-widest">
                                                    {userRole === 'teacher' ? 'Feedback de Práctica (IA)' : 'Análisis Sistémico Extendido (IA)'}
                                                </span>
                                            </div>
                                            <ChevronDown size={18} className="text-[#C87533] group-open:rotate-180 transition-transform duration-300" />
                                        </summary>
                                        <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
                                            <p className="text-sm font-light leading-relaxed mb-4 text-blue-50/90 whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {userRole === 'teacher'
                                                    ? '"Tu práctica destaca en el Modelamiento, pero podrías potenciar el Cierre de Clase. Conoce estrategias prácticas aquí."'
                                                    : latestInsight
                                                        ? String((latestInsight.analysis || latestInsight).systemic_summary || "")
                                                        : '"Genera tu primer Reporte Ejecutivo para ver insights en tiempo real aquí."'
                                                }
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowInsightDrawer(true);
                                                }}
                                                disabled={!latestInsight && userRole !== 'teacher'}
                                                className="text-xs font-bold text-[#C87533] hover:text-white transition-colors flex items-center gap-1 group/btn disabled:opacity-50">
                                                VER DETALLE DE ANÁLISIS <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </details>
                                </div>
                            </div>

                            {/* LISTA RECIENTE */}
                            <div className="bg-white rounded-3xl border border-slate-200/60 flex-1 overflow-hidden flex flex-col">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                    <h3 className="font-bold text-[#1B3C73]">Actividad Reciente</h3>
                                    <Link href="/acompanamiento/dashboard?view=observations" className="text-xs font-bold text-[#2A59A8] hover:text-[#1B3C73]">
                                        Ver todo
                                    </Link>
                                </div>
                                <div className="overflow-y-auto flex-1 p-2">
                                    {recentCycles.length === 0 ? (
                                        <p className="text-center text-slate-400 py-10 text-sm">Sin actividad reciente.</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {recentCycles.map((cycle: any) => (
                                                <Link key={cycle.id} href={`/acompanamiento/observacion/${cycle.id}`} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${cycle.status === 'completed' ? 'bg-green-500' : 'bg-[#C87533]'}`}></div>
                                                        <div>
                                                            <p className="font-bold text-sm text-[#1B3C73]">{usersMap[cycle.teacher_id] || 'Docente Observado'}</p>
                                                            <p className="text-xs text-slate-400">{new Date(cycle.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${cycle.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-[#C87533]'}`}>
                                                            {cycle.status === 'in_progress' ? 'En Curso' : 'Completado'}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <ArrowRight size={14} className="text-slate-300 group-hover:text-[#1B3C73]" />
                                                            {canManageTeachers && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDeleteObservation(cycle.id);
                                                                    }}
                                                                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Teacher Profiler Drawer */}
            {showTeacherDetailDrawer && selectedTeacherId && (
                <TeacherProfiler 
                    teacherId={selectedTeacherId}
                    isOpen={showTeacherDetailDrawer}
                    onClose={() => {
                        setShowTeacherDetailDrawer(false);
                        setSelectedTeacherId(null);
                    }}
                    userRole={userRole || 'director'}
                />
            )}
        </div>
    );
}
