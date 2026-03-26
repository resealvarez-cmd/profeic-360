"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, BrainCircuit, BarChart3, Target } from 'lucide-react';

export const VisualPME = () => {
    const [progress, setProgress] = useState({ simce: 0, dok: 0, var: 0 });

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress({ simce: 94, dok: 88, var: 72 });
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto hero-animate delay-200">
            {/* Glow Background */}
            <div className="absolute -inset-10 bg-gradient-to-tr from-blue-500/10 via-orange-500/10 to-emerald-500/10 blur-3xl rounded-[4rem] opacity-60" />
            
            <div className="relative bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 p-8 md:p-12 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    
                    {/* Left: Simulation Indicators */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                <Target size={18} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#1B3C73]">Motor de Calidad</h4>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: "Estándar SIMCE 2026", val: progress.simce, color: "bg-blue-600", icon: <Sparkles size={12} className="text-blue-400" /> },
                                { label: "Rigor Cognitivo (DOK 3)", val: progress.dok, color: "bg-[#C87533]", icon: <BrainCircuit size={12} className="text-orange-400" /> },
                                { label: "Variantes Automáticas", val: progress.var, color: "bg-emerald-500", icon: <BarChart3 size={12} className="text-emerald-400" /> }
                            ].map((row, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                        <span className="text-slate-500 flex items-center gap-2">{row.icon} {row.label}</span>
                                        <span className="text-[#1B3C73] tabular-nums">{row.val}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                        <div 
                                            className={`${row.color} h-full transition-all duration-[1.5s] cubic-bezier(0.4, 0, 0.2, 1)`} 
                                            style={{ width: `${row.val}%` }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: The Elevator Bot */}
                    <div className="relative">
                        <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-4xl animate-bounce duration-[2s]">
                                    🤖
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inteligencia Pedagógica</p>
                                    <p className="text-xl font-black text-[#1B3C73]">Elevador Cognitivo</p>
                                </div>
                            </div>
                            <div className="relative group/text">
                                <div className="absolute -inset-2 bg-blue-500/5 blur-lg opacity-0 group-hover/text:opacity-100 transition-opacity" />
                                <p className="relative text-base text-slate-600 italic bg-white p-6 rounded-2xl border border-slate-100 leading-relaxed shadow-sm font-medium">
                                    "Tu actividad apunta a un estándar básico. ¿Deseas elevar a <strong className="text-[#C87533]">DOK 3: Pensamiento Estratégico</strong> y generar variantes automáticas según el <strong className="text-[#1B3C73]">Estándar SIMCE</strong>?"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
