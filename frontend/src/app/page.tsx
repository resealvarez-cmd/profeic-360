"use client";

import React from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    ArrowRight,
    Sparkles,
    User,
    Scale,
    ScanFace,
    BrainCircuit,
    ShieldCheck,
    TrendingUp,
    Layers,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { VideoModal } from '@/components/VideoModal';
import { VisualPME } from '@/components/landing/VisualPME';
import { modules, features360 } from '@/constants/landingData';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
            <h2 className="sr-only">Plataforma de Inteligencia Artificial para la Gestión Docente y Escolar</h2>

            {/* Grid Pattern Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.06]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0V60H60V0ZM1 1H59V59H1V1Z' fill='%231B3C73' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Logo />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tighter text-[#1B3C73] leading-none">ProfeIC</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mt-1">Plataforma Oficial</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600">
                        <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud de Implementación - ProfeIC" className="text-slate-500 hover:text-[#1B3C73] transition-colors py-3">
                            Implementar en tu Colegio
                        </a>
                        <Link href="/login" className="bg-[#1B3C73] text-white px-8 py-3 rounded-xl border-2 border-[#1B3C73] hover:bg-[#2A59A8] transition-all font-black shadow-lg">
                            Acceso Privado
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center">
                    <div className="max-w-4xl mx-auto flex flex-col items-center hero-animate">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#1B3C73] text-[10px] font-black mb-10 shadow-sm uppercase tracking-widest">
                            <Sparkles size={14} className="text-orange-500" /> IA Pedagógica Especializada
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-10 text-slate-900 tracking-tight">
                            Del Cumplimiento Administrativo <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B3C73] via-[#2A59A8] to-[#C87533]">
                                a la Excelencia Institucional.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                            El ecosistema definitivo de gestión y mejora educativa 360°. Integra el control del PME, analítica predictiva y diseño pedagógico avanzado en un solo centro de control.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                            <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud de Demo Directiva - ProfeIC" className="bg-[#1B3C73] text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-blue-900/30 hover:scale-105 transition-all flex items-center justify-center gap-3 text-xl group">
                                Solicitar Demo para Equipos Directivos <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            <Link href="/login" className="bg-white text-[#1B3C73] border-2 border-[#1B3C73]/20 hover:border-[#1B3C73]/50 px-8 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-lg hover:bg-slate-50 text-center">
                                Acceso Docentes
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 flex flex-col items-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Metodología inspirada en la visión pedagógica del</p>
                            <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <Logo className="w-8 h-8" />
                                <span className="text-xl font-black text-[#1B3C73] tracking-tighter">Colegio Madre Paulina</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-20 w-full max-w-5xl">
                        <VisualPME />
                    </div>
                </div>
            </header>

            {/* SECCIÓN: CENTRO DE CONTROL PME */}
            <section className="py-24 bg-white border-y border-slate-100 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        {/* Visual: Dashboard Simulation */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-orange-500/10 blur-2xl rounded-[3rem]" />
                            <div className="relative bg-[#0F172A] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest">Gantt Estratégico PME</h4>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { label: "Fase de Diagnóstico", p: 100, color: "bg-emerald-500" },
                                        { label: "Planificación Estratégica", p: 85, color: "bg-blue-500" },
                                        { label: "Ejecución Curricular", p: 45, color: "bg-orange-500" },
                                        { label: "Evaluación de Impacto", p: 15, color: "bg-slate-700" }
                                    ].map((row, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                                                <span className="text-slate-400">{row.label}</span>
                                                <span className="text-slate-500">{row.p}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${row.color} transition-all duration-1000`} style={{ width: `${row.p}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Texto: Propuesta de Valor */}
                        <div>
                            <span className="text-[#C87533] font-black tracking-[0.3em] text-xs uppercase block mb-6">Control de Procesos</span>
                            <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
                                Visibilidad Estratégica <br />
                                <span className="text-[#1B3C73]">del PME.</span>
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { t: "Gestión operativa de alto nivel", d: "Supervise el avance de metas institucionales con un solo vistazo." },
                                    { t: "Eliminación de cuellos de botella", d: "Identifique retrasos antes de que afecten los resultados anuales." },
                                    { t: "Asignación dinámica de responsables", d: "Vincule cada acción del plan con equipos operativos específicos." }
                                ].map((bullet, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#1B3C73]" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900">{bullet.t}</h4>
                                            <p className="text-slate-500 text-sm">{bullet.d}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marquee de Módulos (Ecosistema Dinámico) */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 text-center mb-16">
                    <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Ecosistema de Innovación</h2>
                    <p className="text-slate-500 text-xl font-medium">Desliza para explorar la suite completa de ProfeIC.</p>
                </div>

                <InfiniteCarousel speed={60}>
                    {modules.map((item, i) => (
                        <div key={i} className="w-[450px] shrink-0 bg-[#F8FAFC] p-10 rounded-[2.5rem] border border-slate-200 hover:border-[#1B3C73]/30 hover:bg-white hover:shadow-2xl transition-all duration-500 group/card">
                            <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover/card:scale-110 transition-transform duration-500`}>
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-black mb-4 text-[#1B3C73]">{item.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">{item.desc}</p>
                        </div>
                    ))}
                </InfiniteCarousel>
            </section>

            {/* NUEVA SECCIÓN: VIDEO TESTIMONIAL */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">
                                Mira ProfeIC en <br />
                                <span className="text-[#1B3C73]">Acción Real.</span>
                            </h2>
                            <p className="text-xl text-slate-600 mb-8 font-medium italic">
                                "No es solo software, es una extensión de nuestra visión pedagógica que buscamos que devuelva el propósito al trabajo docente y mejore los aprendizajes de nuestros estudiantes."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-slate-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-black text-[#1B3C73]">Testimonio Directivo</p>
                                    <p className="text-sm text-slate-400 font-bold uppercase">Colegio Madre Paulina</p>
                                </div>
                            </div>
                        </div>

                        {/* Contenedor del Video */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-[#1B3C73] to-[#C87533] opacity-20 blur-2xl rounded-[3rem]" />
                            <VideoModal
                                thumbnailUrl="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80"
                                videoId="TU_VIDEO_ID_AQUI" // TODO: Reemplazar con ID real de YouTube
                                title="Mira ProfeIC en Acción"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Acompañamiento 360 */}
            <section className="py-32 bg-[#1B3C73] text-white">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="max-w-4xl mb-24 mx-auto text-center md:text-left">
                        <span className="text-orange-400 font-black tracking-[0.3em] text-xs uppercase block mb-6">LIDERAZGO PEDAGÓGICO 360°</span>
                        <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-tight mb-8">"Acompañamiento basado en el crecimiento, no en el control."</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {features360.map((item, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                <div className="text-orange-400 mb-6">{item.icon}</div>
                                <h4 className="font-black text-xl mb-3">{item.title}</h4>
                                <p className="text-sm text-blue-100/60 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-20 flex justify-center">
                        <Link href="/login" className="bg-white text-[#1B3C73] px-12 py-5 rounded-2xl font-black shadow-2xl flex items-center gap-3 hover:bg-orange-50 transition-all text-lg">
                            Acceder al Panel de Gestión <ArrowRight size={24} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Diseñado desde la realidad escolar */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                            Diseñado desde la realidad escolar, <br />
                            <span className="text-[#1B3C73]">para la realidad escolar.</span>
                        </h2>
                        <div className="w-20 h-1.5 bg-[#C87533] mx-auto rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Bloque 1 */}
                        <div className="space-y-6 group">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#1B3C73] group-hover:scale-110 transition-transform duration-500">
                                <BrainCircuit size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Cero Doble Trabajo</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Sabemos que el tiempo directivo es escaso. ProfeIC automatiza la recolección de datos y centraliza la información para que dejes de cruzar planillas Excel y te enfoques en el liderazgo pedagógico.
                            </p>
                        </div>

                        {/* Bloque 2 */}
                        <div className="space-y-6 group">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#C87533] group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Rigor sin Fricción</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Desde la observación en el aula hasta el PME. Conectamos la ejecución diaria de los docentes con las metas estratégicas del colegio de forma invisible y automática.
                            </p>
                        </div>

                        {/* Bloque 3 */}
                        <div className="space-y-6 group">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Decisiones en Evidencia</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Transformamos la intuición en datos. Nuestra IA procesa miles de interacciones para entregarte alertas tempranas y sugerencias estratégicas antes de que termine el semestre.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TECNOLOGÍA DE VANGUARDIA: SEGURIDAD */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20L0 20z' fill='%231B3C73' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
                <div className="max-w-7xl mx-auto px-8 relative">
                    <div className="max-w-3xl">
                        <span className="text-orange-400 font-black tracking-[0.3em] text-xs uppercase block mb-6">Confianza y Seguridad</span>
                        <h2 className="text-5xl font-black mb-8 tracking-tight">Infraestructura Blindada y Privacidad Total.</h2>
                        <p className="text-xl text-slate-400 leading-relaxed font-medium mb-12">
                            Arquitectura de datos diseñada para instituciones, con cifrado de extremo a extremo y motor OMR de alta precisión para resultados inmediatos. Su información es su activo más valioso; nosotros la protegemos.
                        </p>
                        <div className="flex gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <Scale className="text-orange-400" size={20} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Cumplimiento Normativo</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <ScanFace className="text-blue-400" size={20} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Biometría OMR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-5">
                        <Logo className="w-12 h-12" />
                        <span className="font-black text-3xl text-[#1B3C73] tracking-tighter">ProfeIC</span>
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em]">© 2026 ProfeIC • Innovación Educativa</p>
                    <div className="flex gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Link href="#" className="hover:text-[#1B3C73] transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-[#1B3C73] transition-colors">Soporte</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
