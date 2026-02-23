"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    LayoutDashboard, BookOpen, Users, FileText, Settings,
    BarChart3, Calendar, MessageSquare, Bell, Search,
    LogOut, Menu, X, ChevronRight, Plus, ExternalLink,
    GraduationCap, Sparkles, Brain, Lightbulb, CheckCircle,
    CalendarDays as CalendarDaysIcon, User,
    ClipboardCheck, Scale, Globe, Puzzle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { NewsWall } from "@/components/NewsWall";
import { MissionsCarousel } from "@/components/dashboard/MissionsCarousel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ADMIN_EMAILS removed in favor of DB check

// INLINE COMPONENT: FeedbackWidget
function FeedbackWidget({ feedbacks, loading }: { feedbacks: any[], loading: boolean }) {
    if (loading) return <div className="animate-pulse bg-slate-100 h-32 rounded-2xl w-full mb-8"></div>;
    if (!feedbacks || feedbacks.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mb-8 bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-[#C87533] flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-[#C87533]" /> Mis Acompañamientos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {feedbacks.map((fb) => (
                    <Link key={fb.id} href={`/acompanamiento/observacion/${fb.id}`} className="bg-white p-4 rounded-xl border border-orange-100 hover:shadow-md transition-all group relative overflow-hidden">
                        {fb.status === 'planned' && (
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <span className="text-4xl">📅</span>
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${fb.status === 'completed' ? 'bg-green-100 text-green-700' :
                                fb.status === 'planned' ? 'bg-purple-100 text-purple-700' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                {fb.status === 'completed' ? 'Finalizada' : fb.status === 'planned' ? '📅 Programada' : 'En Curso'}
                            </span>
                            <span className="text-xs text-slate-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors relative z-10">
                            {fb.status === 'planned' ? 'Visita de Aula Agendada' : 'Observación de Aula'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 relative z-10">
                            Por: {fb.profiles?.full_name || 'Equipo Directivo'}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// INLINE COMPONENT: AdminPanel (Placeholder)
function AdminPanel() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="font-bold text-[#1a2e3b] mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400" /> Panel de Administración
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/usuarios" className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600">Usuarios</span>
                </Link>
                <Link href="/admin/configuracion" className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-center">
                    <Settings className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600">Config</span>
                </Link>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [userName, setUserName] = useState("Profe");
    const [isAdmin, setIsAdmin] = useState(false);
    const [newsKey, setNewsKey] = useState(0);
    const [activeTab, setActiveTab] = useState<"tools" | "social">("tools");

    // Trajectory Report State
    const [showTrajectoryModal, setShowTrajectoryModal] = useState(false);
    const [trajectoryData, setTrajectoryData] = useState<any>(null);
    const [loadingTrajectory, setLoadingTrajectory] = useState(false);

    // Executive Report State
    const [showExecutiveModal, setShowExecutiveModal] = useState(false);
    const [executiveData, setExecutiveData] = useState<any>(null);
    const [loadingExecutive, setLoadingExecutive] = useState(false);

    // Feedbacks State
    const [feedbacks, setFeedbacks] = useState<any[]>([]);

    // Events State
    const [events, setEvents] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // User & Role
                const metadataName = session.user.user_metadata?.full_name;
                if (metadataName) setUserName(metadataName.split(" ")[0]);

                // Check Admin via DB
                const { data: authUser } = await supabase
                    .from('authorized_users')
                    .select('role')
                    .eq('email', session.user.email)
                    .single();

                if (authUser && (authUser.role === 'admin' || authUser.role === 'director' || authUser.role === 'utp')) {
                    setIsAdmin(true);
                }

                // Feedbacks
                const { data: fb } = await supabase
                    .from('observation_cycles')
                    .select('*, profiles:observer_id(full_name)')
                    .eq('teacher_id', session.user.id)
                    .order('created_at', { ascending: false })
                    .limit(3);
                setFeedbacks(fb || []);

                // Events
                const { data: evts } = await supabase
                    .from('school_events')
                    .select('*')
                    .gte('event_date', new Date().toISOString()) // Only future events
                    .order('event_date', { ascending: true })
                    .limit(4);
                setEvents(evts || []);
            }
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const handleGenerateTrajectory = async () => {
        setLoadingTrajectory(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const response = await fetch(`${API_URL}/acompanamiento/trajectory-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacher_id: user.id })
            });

            if (response.ok) {
                const data = await response.json();
                setTrajectoryData(data);
                setShowTrajectoryModal(true);
            } else {
                toast.error("No se pudo generar el reporte. Quizás falta historial.");
            }
        } catch (error) {
            console.error("Error trajectory:", error);
            toast.error("Error de conexión con la IA.");
        } finally {
            setLoadingTrajectory(false);
        }
    };

    const handleGenerateExecutive = async () => {
        setLoadingExecutive(true);
        try {
            const response = await fetch(`${API_URL}/acompanamiento/executive-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (response.ok) {
                const data = await response.json();
                setExecutiveData(data);
                setShowExecutiveModal(true);
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



    if (loading) return <div className="flex h-screen items-center justify-center text-[#1a2e3b]">Cargando panel...</div>;

    const stats = [
        { label: "Planificaciones", value: "12", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
        { label: "Evaluaciones", value: "8", icon: Brain, color: "bg-purple-100 text-purple-600" },
        { label: "Reflexiones", value: "4", icon: Lightbulb, color: "bg-amber-100 text-amber-600" },
        { label: "Asistencia", value: "95%", icon: CheckCircle, color: "bg-emerald-100 text-emerald-600" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* HEADER COMPACTO */}
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center py-8 px-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 hidden md:block">
                        <Image src="/logo.png" alt="CMP" fill className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#1a2e3b] tracking-tight">
                            Hola {userName}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Panel de Control
                        </p>
                    </div>
                </div>

                {/* TABS DE NAVEGACIÓN */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("tools")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            activeTab === "tools" ? "bg-white text-[#1a2e3b] shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        📚 Herramientas
                    </button>
                    <button
                        onClick={() => setActiveTab("social")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "social" ? "bg-white text-[#f2ae60] shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        📢 Social
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 pb-12">
                {/* SALUDO & ACCIÓN RÁPIDA */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h1 className="text-3xl font-black text-[#1a2e3b]">
                            Hola, <span className="text-[#f2ae60]">{userName.split(' ')[0]}</span> 👋
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Aquí tienes el resumen de tu actividad pedagógica.</p>
                    </div>

                    <Link
                        href="/acompanamiento/dashboard"
                        className="bg-[#1a2e3b] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2b546e] transition-all shadow-lg shadow-[#1a2e3b]/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Sparkles size={20} />
                        Ir a Gestión 360°
                    </Link>
                </div>

                {/* MODAL TRAJECTORY REPORT */}
                {showTrajectoryModal && trajectoryData && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in-50 duration-300 relative">
                            <button
                                onClick={() => setShowTrajectoryModal(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>

                            <div className="flex items-center gap-4 mb-6 border-b pb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                                    📈
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#1a2e3b]">Reporte de Trayectoria</h3>
                                    <p className="text-slate-500 text-sm">Análisis de evolución pedagógica</p>
                                </div>
                                <div className={`ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase ${trajectoryData.trend === 'ascending' ? 'bg-green-100 text-green-700' :
                                    trajectoryData.trend === 'stable' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    Tendencia: {trajectoryData.trend === 'ascending' ? 'Ascendente 🚀' : trajectoryData.trend === 'stable' ? 'Estable ⚖️' : 'Irregular ⚠️'}
                                </div>
                            </div>

                            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                                <div>
                                    <h4 className="font-bold text-[#1a2e3b] mb-2 flex items-center gap-2">
                                        📝 Resumen Ejecutivo
                                    </h4>
                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl text-sm">
                                        {trajectoryData.summary}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {trajectoryData.focus_alert && (
                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                            <h5 className="font-bold text-red-700 text-xs uppercase mb-1">⚠️ Foco de Atención</h5>
                                            <p className="text-red-900 font-bold text-sm">{trajectoryData.focus_alert}</p>
                                        </div>
                                    )}
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <h5 className="font-bold text-indigo-700 text-xs uppercase mb-1">💡 Recomendación Estratégica</h5>
                                        <p className="text-indigo-900 font-medium text-sm leading-snug">
                                            "{trajectoryData.recommendation}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t flex justify-end">
                                <button
                                    onClick={() => setShowTrajectoryModal(false)}
                                    className="px-6 py-2 rounded-lg bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cerrar Reporte
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONDITIONAL CONTENT */}
                {activeTab === 'tools' ? (
                    <div className="space-y-8">
                        {/* 1. FEEDBACK WIDGET (Always visible or relevant for Tools too?) - Let's keep it here for now as "My Work" */}
                        <FeedbackWidget feedbacks={feedbacks} loading={loading} />

                        {/* 2. TOOLS CAROUSEL */}
                        <MissionsCarousel />
                    </div>
                ) : (
                    /* SOCIAL / WIDGETS GRID */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEft Column */}
                        <div className="lg:col-span-2 space-y-8">
                            <NewsWall key={newsKey} />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* ADMIN PANEL */}
                            {isAdmin && <AdminPanel />}

                            {/* CALENDAR WIDGET */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-[#1a2e3b] mb-4 flex items-center gap-2">
                                    <CalendarDaysIcon className="w-5 h-5 text-slate-400" /> Próximos Eventos
                                </h3>
                                <div className="space-y-4">
                                    {events.length === 0 ? (
                                        /* EMPTY STATE */
                                        <div className="text-center py-6">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CalendarDaysIcon className="text-slate-300" size={24} />
                                            </div>
                                            <p className="text-slate-500 font-medium text-sm">No hay eventos programados</p>
                                            <p className="text-xs text-slate-400">Tu agenda está despejada.</p>
                                        </div>
                                    ) : (
                                        /* EVENTS LIST */
                                        <div className="space-y-3">
                                            {events.map((event) => {
                                                const date = new Date(event.event_date);
                                                return (
                                                    <div key={event.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                                        <div className="flex flex-col items-center justify-center w-12 h-12 bg-orange-50 rounded-xl text-orange-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                                                            <span className="text-xs font-bold uppercase">{date.toLocaleDateString('es-CL', { month: 'short' })}</span>
                                                            <span className="text-lg font-black leading-none">{date.getDate()}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-[#1a2e3b] text-sm truncate">{event.title}</h4>
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                                <span>{date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs</span>
                                                                {event.type && (
                                                                    <>
                                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                        <span className="truncate">{event.type}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}