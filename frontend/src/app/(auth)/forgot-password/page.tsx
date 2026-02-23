
"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
                <h1 className="text-2xl font-black text-[#1B3C73] mb-4">Recuperar Contraseña</h1>
                <p className="text-slate-500 mb-8">
                    Por favor contacta al administrador del sistema o al equipo UTP para restablecer tu contraseña.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 text-[#1B3C73] font-bold hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Volver al Login
                </Link>
            </div>
        </div>
    );
}
