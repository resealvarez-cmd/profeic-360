"use client";
import Link from "next/link";
import Image from "next/image";
import {
    ChatBubbleLeftRightIcon,
    BookOpenIcon,
    ClipboardDocumentCheckIcon,
    ScaleIcon,
    SparklesIcon,
    PuzzlePieceIcon,
    PresentationChartBarIcon,
    ArchiveBoxIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
    const tools = [
        {
            name: "Planificador de Unidades",
            href: "/planificador",
            icon: BookOpenIcon,
            color: "text-blue-600",
            bg: "bg-blue-50",
            desc: "Diseña trayectorias completas"
        },
        {
            name: "Biblioteca Docente",
            href: "/biblioteca",
            icon: ArchiveBoxIcon,
            color: "text-gray-600",
            bg: "bg-gray-100",
            desc: "Tus recursos guardados"
        },
        {
            name: "Evaluaciones",
            href: "/evaluaciones",
            icon: ClipboardDocumentCheckIcon,
            color: "text-green-600",
            bg: "bg-green-50",
            desc: "Pruebas y reactivos"
        },
        {
            name: "Rúbricas",
            href: "/rubricas",
            icon: ScaleIcon,
            color: "text-teal-600",
            bg: "bg-teal-50",
            desc: "Criterios de evaluación"
        },
        {
            name: "ChatBot Mentor",
            href: "/mentor",
            icon: ChatBubbleLeftRightIcon,
            color: "text-purple-600",
            bg: "bg-purple-50",
            desc: "Asistencia pedagógica"
        },
        {
            name: "Elevador Cognitivo",
            href: "/elevador",
            icon: SparklesIcon,
            color: "text-orange-600",
            bg: "bg-orange-50",
            desc: "Sube el nivel DOK"
        },
        {
            name: "Asistente NEE",
            href: "/nee",
            icon: PuzzlePieceIcon,
            color: "text-pink-600",
            bg: "bg-pink-50",
            desc: "Adecuaciones DUA"
        },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">

            {/* LOGO SUPERIOR (OPCIONAL) */}
            <div className="mb-8 relative w-20 h-20 hidden md:block">
                <Image src="/logo.png" alt="CMP" fill className="object-contain" />
            </div>

            {/* SALUDO CENTRAL */}
            <div className="text-center mb-12 space-y-3 animate-in slide-in-from-top-4 duration-700">
                <h1 className="text-4xl font-extrabold text-[#1a2e3b] tracking-tight">
                    ¡Hola Profe!
                </h1>
                <p className="text-lg text-gray-500 font-medium">
                    ¿En qué desafío pedagógico te apoyamos hoy?
                </p>
            </div>

            {/* GRILLA DE HERRAMIENTAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl w-full">
                {tools.map((tool) => (
                    <Link
                        key={tool.name}
                        href={tool.href}
                        className="group flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className={`p-3.5 rounded-xl ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                            <tool.icon className="w-7 h-7" />
                        </div>

                        <div className="text-left">
                            <h3 className="font-bold text-gray-800 text-base group-hover:text-[#1a2e3b] transition-colors">
                                {tool.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 font-medium">
                                {tool.desc}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}