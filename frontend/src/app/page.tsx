"use client";

import React from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    ArrowRight,
    Sparkles,
    User,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { VideoModal } from '@/components/VideoModal';
import { modules, features360, testimonials } from '@/constants/landingData';

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
                        <Link href="/institucional" className="text-slate-500 hover:text-[#1B3C73] transition-colors py-3">
                            Planes para Colegios
                        </Link>
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
                            Transforma la Gestión <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B3C73] via-[#2A59A8] to-[#C87533]">
                                en Liderazgo Real.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                            Elimina la carga administrativa y enfócate en lo que importa: generar <strong>aprendizaje profundo</strong>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                            <Link href="/institucional" className="bg-white text-[#1B3C73] border-2 border-[#1B3C73]/20 hover:border-[#1B3C73]/50 px-12 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-xl hover:bg-slate-50">
                                Contratar para mi Colegio
                            </Link>
                            <Link href="/login" className="bg-[#1B3C73] text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-blue-900/30 hover:scale-105 transition-all flex items-center justify-center gap-3 text-xl group">
                                Acceso Profesores <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
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

                    {/* Faux UI Hero (Elevador Cognitivo) */}
                    <div className="relative mt-20 w-full max-w-5xl hero-animate delay-200">
                        <div className="absolute -inset-10 bg-gradient-to-tr from-blue-200/20 to-orange-200/20 blur-3xl rounded-full" />
                        <div className="relative bg-white rounded-[3rem] shadow-2xl border border-slate-200 p-8 md:p-12 overflow-hidden mx-auto">
                            <div className="flex gap-2.5 mb-12 justify-center md:justify-start">
                                <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                            </div>
                            <div className="max-w-2xl mx-auto bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl">🤖</div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inteligencia Pedagógica</p>
                                        <p className="text-xl font-black text-[#1B3C73]">Elevador Cognitivo</p>
                                    </div>
                                </div>
                                <p className="text-lg text-slate-600 italic bg-white p-6 rounded-2xl border border-slate-100 leading-relaxed shadow-sm">
                                    "Tu actividad apunta a <strong>DOK 1</strong>. ¿Deseas sugerencias para elevar a <strong>DOK 3: Pensamiento Estratégico</strong>?"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Marquee de Módulos (Ecosistema Dinámico) */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 text-center mb-16">
                    <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Ecosistema de Innovación</h2>
                    <p className="text-slate-500 text-xl font-medium">Desliza para explorar la suite completa de ProfeIC.</p>
                </div>

                <InfiniteCarousel speed={60}>
                    {modules.map((item, i) => (
                        <div key={i} className="w-[400px] shrink-0 bg-[#F8FAFC] p-10 rounded-[2.5rem] border border-slate-200 hover:border-[#1B3C73]/30 hover:bg-white hover:shadow-2xl transition-all duration-500 group/card">
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

            {/* Testimonios */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-8 text-center mb-24">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">El Impacto en la Comunidad</h2>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-4">Pilotaje 2025 • Resultados Reales</p>
                </div>
                <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className={`bg-[#F8FAFC] p-10 rounded-[2.5rem] border-t-8 ${t.accent} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between`}>
                            <div>
                                <div className="text-slate-200 mb-6">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.017 21L16.411 14.182C15.821 14.182 15.114 13.978 14.613 13.568C14.113 13.159 13.863 12.545 13.863 11.523C13.863 10.614 14.158 9.818 14.75 9.136C15.341 8.455 16.159 8.114 17.205 8.114C18.25 8.114 19.068 8.455 19.659 9.136C20.25 9.818 20.545 10.614 20.545 11.523C20.545 13.159 19.955 15.023 18.773 17.114L14.017 21ZM3.722 21L6.116 14.182C5.526 14.182 4.819 13.978 4.318 13.568C3.818 13.159 3.568 12.545 3.568 11.523C3.568 10.614 3.863 9.818 4.455 9.136C5.045 8.455 5.864 8.114 6.909 8.114C7.955 8.114 8.773 8.455 9.364 9.136C9.955 9.818 10.25 10.614 10.25 11.523C10.25 13.159 9.659 15.023 8.477 17.114L3.722 21Z" />
                                    </svg>
                                </div>
                                <p className="text-slate-700 mb-10 font-bold italic text-lg leading-relaxed">"{t.quote}"</p>
                            </div>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-slate-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-black text-md text-[#1B3C73]">{t.name}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
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
