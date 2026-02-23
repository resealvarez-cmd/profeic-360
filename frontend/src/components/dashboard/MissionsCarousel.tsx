"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
    BookOpenIcon, ArchiveBoxIcon, ClipboardDocumentCheckIcon, ScaleIcon,
    ChatBubbleLeftRightIcon, PuzzlePieceIcon, GlobeAltIcon, ArrowRightIcon
} from "@heroicons/react/24/outline";

function TrendingUpIcon(props: any) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    );
}

const MISSIONS = [
    {
        id: "prepara",
        title: "Prepara tu Clase",
        icon: "🚀",
        color: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50",
        borderColor: "border-blue-100",
        shadowColor: "shadow-blue-900/5",
        description: "Diseña tus clases con inteligencia artificial adaptada al currículum nacional y organiza tus recusos educativos de forma eficiente.",
        tools: [
            { name: "Planificador de Unidades", href: "/planificador", icon: BookOpenIcon, color: "text-blue-600", bg: "bg-blue-100" },
            { name: "Biblioteca Docente", href: "/biblioteca", icon: ArchiveBoxIcon, color: "text-indigo-600", bg: "bg-indigo-100" }
        ]
    },
    {
        id: "evalua",
        title: "Evalúa el Aprendizaje",
        icon: "⚖️",
        color: "from-green-500 to-emerald-600",
        bgLight: "bg-green-50/50",
        borderColor: "border-green-100",
        shadowColor: "shadow-green-900/5",
        description: "Crea instrumentos de evaluación precisos y rúbricas detalladas para medir el progreso de tus estudiantes con rigor.",
        tools: [
            { name: "Evaluaciones", href: "/evaluaciones", icon: ClipboardDocumentCheckIcon, color: "text-green-600", bg: "bg-green-100" },
            { name: "Rúbricas", href: "/rubricas", icon: ScaleIcon, color: "text-emerald-600", bg: "bg-emerald-100" }
        ]
    },
    {
        id: "asistencia",
        title: "Asistencia y Mejora",
        icon: "💡",
        color: "from-purple-500 to-fuchsia-600",
        bgLight: "bg-purple-50/50",
        borderColor: "border-purple-100",
        shadowColor: "shadow-purple-900/5",
        description: "Recibe acompañamiento pedagógico experto de tu mentor IA y eleva el nivel cognitivo (DOK) de tus actividades.",
        tools: [
            { name: "ChatBot Mentor", href: "/mentor", icon: ChatBubbleLeftRightIcon, color: "text-purple-600", bg: "bg-purple-100" },
            { name: "Elevador Cognitivo", href: "/elevador", icon: TrendingUpIcon, color: "text-fuchsia-600", bg: "bg-fuchsia-100" }
        ]
    },
    {
        id: "inclusion",
        title: "Inclusión y Comunidad",
        icon: "🧩",
        color: "from-orange-500 to-red-600",
        bgLight: "bg-orange-50/50",
        borderColor: "border-orange-100",
        shadowColor: "shadow-orange-900/5",
        description: "Adapta tu enseñanza con estrategias DUA para estudiantes con NEE y colabora con otros docentes en la sala de profesores.",
        tools: [
            { name: "Asistente NEE", href: "/nee", icon: PuzzlePieceIcon, color: "text-orange-600", bg: "bg-orange-100" },
            { name: "Sala de Profesores", href: "/comunidad", icon: GlobeAltIcon, color: "text-red-600", bg: "bg-red-100" }
        ]
    }
];

export function MissionsCarousel() {
    return (
        <div className="w-full pb-10">
            <div className="flex justify-between items-end mb-6 px-2">
                <div>
                    <h2 className="text-2xl font-bold text-[#1a2e3b]">Tus Flujos de Trabajo</h2>
                    <p className="text-slate-500 text-sm mt-1">Explora las herramientas de ProfeIC agrupadas por objetivo docente.</p>
                </div>
            </div>

            <Swiper
                grabCursor={true}
                modules={[Pagination, Navigation, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                    768: {
                        slidesPerView: 1.2,
                    },
                    1024: {
                        slidesPerView: 2,
                    },
                    1280: {
                        slidesPerView: 2.2,
                    }
                }}
                className="w-full !pb-12 !px-2" // Added padding for shadows to not get cut off
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                navigation={true}
            >
                {MISSIONS.map((mission, idx) => (
                    <SwiperSlide key={mission.id} className="!h-auto flex">
                        <div className={`p-8 w-full rounded-[2rem] border ${mission.borderColor} shadow-xl ${mission.shadowColor} ${mission.bgLight} relative overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1`}>

                            {/* Background Decoration */}
                            <div className={`absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br ${mission.color} opacity-10 rounded-full blur-3xl -z-0`} />

                            <div className="flex items-center gap-4 mb-5 relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md bg-gradient-to-br ${mission.color} text-white`}>
                                    {mission.icon}
                                </div>
                                <h3 className="text-2xl font-black text-[#1a2e3b] tracking-tight">{mission.title}</h3>
                            </div>

                            <p className="text-[#1a2e3b]/70 font-medium mb-8 leading-relaxed relative z-10">{mission.description}</p>

                            <div className="mt-auto space-y-3 relative z-10 bg-white/60 p-5 rounded-2xl border border-white/50 backdrop-blur-sm shadow-sm">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Herramientas Incluidas
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    {mission.tools.map((tool) => (
                                        <Link
                                            key={tool.name}
                                            href={tool.href}
                                            className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-200/60 hover:border-slate-300/80 hover:shadow-md transition-all bg-white"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool.bg}`}>
                                                    <tool.icon className={`w-5 h-5 ${tool.color}`} />
                                                </div>
                                                <span className="font-bold text-[#1a2e3b] text-sm group-hover:text-blue-700 transition-colors">{tool.name}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
           color: #1a2e3b !important;
           background-color: white;
           width: 48px !important;
           height: 48px !important;
           border-radius: 50%;
           box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
           border: 1px solid #e2e8f0;
           transition: all 0.2s ease;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
           background-color: #f8fafc;
           transform: scale(1.05);
        }
        .swiper-button-next:after, .swiper-button-prev:after {
           font-size: 16px !important;
           font-weight: 900;
        }
        .swiper-button-disabled {
           opacity: 0 !important;
           pointer-events: none;
        }
        .swiper-pagination-bullet {
           background-color: #cbd5e1 !important;
           opacity: 1 !important;
           width: 8px !important;
           height: 8px !important;
           transition: all 0.2s ease;
        }
        .swiper-pagination-bullet-active {
           background-color: #1a2e3b !important;
           width: 24px !important;
           border-radius: 4px !important;
        }
        @media (max-width: 640px) {
           .swiper-button-next, .swiper-button-prev {
              display: none !important;
           }
        }
      `}</style>
        </div>
    );
}
