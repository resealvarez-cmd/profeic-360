"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Mail, BuildingIcon, Star, Zap } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function InstitucionalPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 text-slate-500 hover:text-[#1B3C73] transition-colors font-bold">
                        <ChevronLeft size={20} /> Volver al Inicio
                    </Link>
                    <div className="flex items-center gap-5">
                        <Logo />
                        <div className="hidden sm:flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-[#1B3C73] leading-none">ProfeIC</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mt-1">Institucional</span>
                        </div>
                    </div>
                </div>
            </nav>

            <header className="pt-20 pb-16 text-center px-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#1B3C73] text-[10px] font-black mb-8 shadow-sm uppercase tracking-widest">
                    <BuildingIcon size={14} className="text-[#1B3C73]" /> Licencias Colegios y Sostenedores
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 tracking-tight text-[#1B3C73]">
                    Impulsa la Excelencia <br /> Pedagógica en tu Red.
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                    Planes diseñados para colegios que buscan estandarizar la calidad de enseñanza, ahorrar cientos de horas lectivas y dar seguimiento directo al impacto de las clases.
                </p>
            </header>

            <section className="max-w-[90rem] mx-auto px-4 lg:px-8 pb-32">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-full mx-auto">

                    {/* PLAN INDIVIDUAL */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Individual</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Para docentes que buscan optimizar su propio tiempo y clases.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900">$12.000</span>
                            <span className="text-sm font-bold text-slate-400">/Mes</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                1 Docente (Personal).
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Acceso a herramientas de Aula IA genéricas.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Planificador y Generador de Rúbricas.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-500 line-through opacity-70 align-top">
                                <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" />
                                Sin ADN pedagógico institucional.
                            </li>
                        </ul>
                        <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud - Plan Individual" className="w-full py-4 text-center rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                            Suscribirme
                        </a>
                    </div>

                    {/* PLAN BÁSICO */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Básico</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Ideal para dependencias pequeñas o escuelas rurales.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900">$190.000</span>
                            <span className="text-sm font-bold text-slate-400">/Mes</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Hasta 20 docentes inscritos.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Plataforma ProfeIC completa.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Planificador DUA, Elevador Cognitivo, Analizador Forense.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-500 line-through opacity-70 align-top">
                                <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" />
                                Panel de Acompañamiento 360° para Directivos.
                            </li>
                        </ul>
                        <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud Demo - Plan Básico" className="w-full py-4 text-center rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                            Cotizar Básico
                        </a>
                    </div>

                    {/* PLAN PRO / INSTITUCIONAL (Destacado) */}
                    <div className="bg-[#1B3C73] rounded-3xl p-8 border border-[#2A59A8] shadow-2xl shadow-blue-900/20 transform lg:-translate-y-4 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-bl-2xl">
                            Recomendado
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                            Institucional Pro <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                        </h3>
                        <p className="text-blue-100/70 text-sm font-medium mb-6">La suite completa para colegios medianos y grandes.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-white">$390.000</span>
                            <span className="text-sm font-bold text-blue-200/50">/Mes</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3 text-sm text-blue-100 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                                Hasta 60 docentes inscritos.
                            </li>
                            <li className="flex gap-3 text-sm text-blue-100 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                                Integración del Modelo y Sello del Colegio en todas las inteligencias.
                            </li>
                            <li className="flex gap-3 text-sm text-blue-100 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                                Todo ProfeIC <strong>+ Panel Acompañamiento 360° para Directivos</strong> (Observaciones y Analytics).
                            </li>
                        </ul>
                        <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud Demo - Plan Institucional" className="w-full py-3 text-center rounded-xl font-black bg-white text-[#1B3C73] hover:bg-orange-50 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            Agendar Demo <Zap className="w-4 h-4 text-orange-500" />
                        </a>
                    </div>

                    {/* PLAN ENTERPRISE */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Enterprise</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Red de sostenedores o corporaciones grandes.</p>
                        <div className="mb-6 mt-1">
                            <span className="text-3xl font-black text-slate-900">A Medida</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Docentes ilimitados.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Configuración Multi-Sede (Jerarquía por colegio).
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Soporte Prioritario Dedicado.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Capacitación Onboarding.
                            </li>
                        </ul>
                        <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud Demo - Plan Enterprise" className="w-full py-4 text-center rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                            Contactar a Ventas
                        </a>
                    </div>

                </div>
            </section>

            <section className="bg-slate-900 text-white py-24 mb-0">
                <div className="max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4">¿Dudas o Casos Especiales?</h2>
                    <p className="text-slate-400 mb-8 max-w-xl text-lg">
                        Escríbenos directamente para resolver cualquier inquietud sobre la implementación en tu establecimiento educativo.
                    </p>
                    <a href="mailto:re.se.alvarez@gmail.com" className="bg-[#C87533] px-8 py-4 rounded-xl font-black hover:bg-[#A65B21] transition-colors text-xl">
                        re.se.alvarez@gmail.com
                    </a>
                </div>
            </section>
        </div>
    );
}
