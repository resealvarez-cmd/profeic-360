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
                    Planes de implementación diseñados para colegios que buscan estandarizar la calidad de enseñanza, ahorrar cientos de horas lectivas y dar seguimiento directo al impacto de las clases.
                </p>
            </header>

            <section className="max-w-4xl mx-auto px-4 lg:px-8 pb-32">
                <div className="bg-[#1B3C73] rounded-3xl p-10 md:p-14 border border-[#2A59A8] shadow-2xl shadow-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
                    <div className="relative z-10 flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-black text-white mb-4 flex items-center justify-center md:justify-start gap-3">
                            Implementación Institucional <Star className="w-8 h-8 text-orange-400 fill-orange-400" />
                        </h3>
                        <p className="text-blue-100/80 text-lg font-medium mb-8 leading-relaxed">
                            Lleva el poder de ProfeIC a toda tu institución. Integraremos tu modelo pedagógico, sello del colegio y habilitaremos el Panel 360° para directivos.
                        </p>
                        <ul className="space-y-4 mb-10">
                            <li className="flex gap-3 text-base text-blue-100 font-medium items-center justify-center md:justify-start">
                                <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0" />
                                <span>Acceso para todos los docentes de tu red.</span>
                            </li>
                            <li className="flex gap-3 text-base text-blue-100 font-medium items-center justify-center md:justify-start">
                                <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0" />
                                <span>Integración total de tu Modelo Pedagógico.</span>
                            </li>
                            <li className="flex gap-3 text-base text-blue-100 font-medium items-center justify-center md:justify-start">
                                <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0" />
                                <span>Panel de Acompañamiento 360° para Directivos.</span>
                            </li>
                        </ul>
                        <div className="flex justify-center md:justify-start">
                            <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud de Implementación - ProfeIC" className="px-10 py-5 rounded-2xl font-black bg-white text-[#1B3C73] hover:bg-orange-50 hover:shadow-lg transition-all flex items-center gap-3 text-lg">
                                Contactar para implementar <Zap className="w-5 h-5 text-orange-500" />
                            </a>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-600/20 to-transparent blur-3xl pointer-events-none" />
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
