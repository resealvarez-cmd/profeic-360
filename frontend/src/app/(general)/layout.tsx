"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    HomeIcon, BookOpenIcon, QueueListIcon, BeakerIcon,
    ArchiveBoxIcon, PuzzlePieceIcon, ArrowLeftOnRectangleIcon,
    SparklesIcon, ScaleIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftRightIcon,
    DocumentMagnifyingGlassIcon // <--- NUEVO ÍCONO IMPORTADO
} from "@heroicons/react/24/outline";

// Icono personalizado para Elevador
function TrendingUpIcon(props: any) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
    );
}

export default function GeneralLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("profeic_token");
        if (!token) {
            router.push("/login");
        } else {
            setAuthorized(true);
        }
    }, []);

    if (!authorized) {
        return null;
    }

    return (
        <div className="flex h-screen bg-[#f8fafc]">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0 z-20">
                <div className="p-6 flex items-center gap-3 border-b border-gray-100 h-20">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/logo.png"
                            alt="Logo Colegio"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <div>
                        <span className="block font-bold text-[#1a2e3b] leading-none">ProfeIC</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Suite Docente</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* INICIO */}
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium mb-4">
                        <HomeIcon className="w-5 h-5" /> Inicio
                    </Link>

                    {/* GESTIÓN */}
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 px-3">Gestión</p>

                    <Link href="/planificador" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium">
                        <BookOpenIcon className="w-5 h-5" /> Planificador
                    </Link>

                    <Link href="/biblioteca" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium">
                        <ArchiveBoxIcon className="w-5 h-5" /> Biblioteca
                    </Link>

                    {/* EVALUACIÓN */}
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 mt-6 px-3">Evaluación</p>

                    {/* --- NUEVO MÓDULO: ANALIZADOR --- */}
                    <Link href="/analizador" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium">
                        <DocumentMagnifyingGlassIcon className="w-5 h-5" /> Analizador IA
                    </Link>

                    <Link href="/rubricas" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium">
                        <ScaleIcon className="w-5 h-5" /> Rúbricas
                    </Link>

                    <Link href="/evaluaciones" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium">
                        <ClipboardDocumentCheckIcon className="w-5 h-5" /> Pruebas
                    </Link>

                    {/* ASISTENCIA IA */}
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 mt-6 px-3">Asistencia IA</p>

                    <Link href="/mentor" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium">
                        <ChatBubbleLeftRightIcon className="w-5 h-5" /> Mentor
                    </Link>

                    <Link href="/elevador" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium">
                        <TrendingUpIcon className="w-5 h-5" /> Elevador DOK
                    </Link>

                    <Link href="/nee" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b] rounded-xl transition-all font-medium">
                        <PuzzlePieceIcon className="w-5 h-5" /> Inclusión
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => {
                            localStorage.removeItem("profeic_token");
                            router.push("/login");
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-sm font-bold"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 overflow-y-auto relative z-10">
                {children}
            </main>
        </div>
    );
}