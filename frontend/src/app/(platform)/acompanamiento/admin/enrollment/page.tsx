"use client";

import React from "react";
import CSVUploader from "@/components/enrollment/CSVUploader";
import StudentDirectory from "@/components/enrollment/StudentDirectory";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EnrollmentPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section with back button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Link href="/acompanamiento/dashboard" className="hover:text-[#1B3C73] flex items-center gap-1 transition-colors">
                            <ArrowLeft size={16} /> Volver al Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-[#1B3C73] flex items-center gap-3">
                        <UserPlus className="text-[#C87533]" size={32} /> Gestión de Matrícula
                    </h1>
                    <p className="text-slate-500 mt-1 italic">
                        Administración de estudiantes y cursos institucionales.
                    </p>
                </div>
            </div>

            {/* Instruction Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl md:col-span-1">
                    <h3 className="font-bold text-[#1B3C73] flex items-center gap-2 mb-3">
                        ¿Cómo funciona?
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex gap-2">
                            <span className="w-5 h-5 bg-[#C87533] text-white rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                            Prepara tu archivo Excel y expórtalo como CSV (delimitado por comas).
                        </li>
                        <li className="flex gap-2">
                            <span className="w-5 h-5 bg-[#C87533] text-white rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                            Asegúrate de que las cabeceras sean exactas: RUT, Nombres, Apellidos, Nivel, Letra.
                        </li>
                        <li className="flex gap-2">
                            <span className="w-5 h-5 bg-[#C87533] text-white rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                            El sistema creará automáticamente los cursos si no existen y actualizará los datos de los alumnos.
                        </li>
                    </ul>
                </div>

                <div className="md:col-span-2 space-y-8">
                    <CSVUploader />
                    <StudentDirectory />
                </div>
            </div>

            {/* Footer / Help */}
            <div className="text-center text-slate-400 text-sm mt-12 pb-8">
                <p>© 2026 ProfeIC - Gestión Inteligente de Datos Escolares</p>
            </div>
        </div>
    );
}
