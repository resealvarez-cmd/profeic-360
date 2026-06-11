"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Sparkles, Shield, UserCheck, RefreshCw, Layout, Sliders, CheckCircle } from "lucide-react";

export default function MotorLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, role: userRole, isSuperAdmin } = useAuth();
    const router = useRouter();

    // Estado del rol activo para demostración (inicializado con el rol de supabase o 'director' por defecto)
    const [demoRole, setDemoRole] = useState<string>("director");

    useEffect(() => {
        if (userRole) {
            // Mapeo inicial
            if (userRole === "director" || userRole === "directivo") setDemoRole("director");
            else if (userRole === "gestion") setDemoRole("coordinador");
            else if (userRole === "profesor") setDemoRole("profesor");
        }
    }, [userRole]);

    // Escucha de un evento global para actualizar el componente children en tiempo real al cambiar el rol
    const changeRole = (newRole: string) => {
        setDemoRole(newRole);
        localStorage.setItem("profeic_motor_demo_role", newRole);
        // Despachamos evento global para notificar a la página principal
        window.dispatchEvent(new Event("motorRoleChanged"));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[50vh]">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#1B3C73]" />
                    <p className="text-slate-400 font-medium tracking-tight text-sm">Cargando Motor Preventivo...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const showDemoSelector = isSuperAdmin || 
                             process.env.NEXT_PUBLIC_DEMO_MODE === "true" || 
                             user?.email?.includes("rene") || 
                             user?.email === "admin@profeic.cl";

    return (
        <div className="w-full flex flex-col gap-6 font-sans">
            {/* Header del Módulo con el Selector de Roles Interactivo Premium (Glassmorphism) */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-2xl p-6 shadow-xl shadow-slate-100/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-tr from-[#1B3C73] to-[#2E75B6] text-white rounded-xl shadow-md shadow-blue-200/40">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex flex-wrap items-center gap-2.5">
                            Motor de Conducción Preventiva
                            <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-400/20">
                                <Shield className="w-3 h-3" /> ACTIVO
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 font-bold tracking-tight mt-0.5">Análisis predictivo de trayectoria académica, asistencia y convivencia escolar.</p>
                    </div>
                </div>

                {/* Consola de Demostración - Selector de Roles Premium (Estilo Simulador Oscuro) */}
                {showDemoSelector && (
                    <div className="bg-[#0F172A] text-white border border-slate-800 rounded-2xl p-2.5 flex flex-col md:flex-row md:items-center gap-3.5 self-stretch lg:self-auto shadow-xl shadow-slate-950/20 backdrop-blur-md relative overflow-hidden">
                        <div className="flex items-center gap-2.5 px-3 py-1 text-slate-300 shrink-0">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#C87533] leading-none">Simulador</span>
                                <span className="text-[11px] font-black tracking-tight text-slate-100 mt-0.5">Vista de Roles</span>
                            </div>
                        </div>
                        
                        <div className="bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-1">
                            {[
                                { id: "director", label: "Director", activeBg: "bg-[#1B3C73] text-white shadow-lg shadow-blue-900/30 border-blue-500/20", inactiveBg: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent" },
                                { id: "coordinador", label: "Coordinador", activeBg: "bg-[#C87533] text-white shadow-lg shadow-orange-900/30 border-orange-500/20", inactiveBg: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent" },
                                { id: "jefe_departamento", label: "Jefe Depto", activeBg: "bg-[#7030A0] text-white shadow-lg shadow-purple-900/30 border-purple-500/20", inactiveBg: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent" },
                                { id: "profesor", label: "Profesor", activeBg: "bg-[#2E75B6] text-white shadow-lg shadow-blue-700/30 border-blue-400/20", inactiveBg: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent" }
                            ].map((btn) => (
                                <button
                                    key={btn.id}
                                    onClick={() => changeRole(btn.id)}
                                    className={`text-[11px] font-extrabold px-4 py-2 rounded-lg transition-all duration-300 border hover:scale-[1.03] active:scale-[0.98] ${
                                        demoRole === btn.id ? btn.activeBg : btn.inactiveBg
                                    }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido Dinámico del Módulo */}
            <div className="w-full min-h-[60vh] animate-in fade-in duration-500">
                {children}
            </div>
        </div>
    );
}
