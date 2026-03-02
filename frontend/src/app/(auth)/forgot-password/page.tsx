"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

const schema = z.object({
    email: z.string().email('Correo electrónico inválido'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${siteUrl}/set-password`,
            });
            if (error) throw error;
            setSent(true);
        } catch (error: any) {
            toast.error(error.message || 'Error al enviar el correo');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative font-sans">
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-[#1B3C73] rounded-b-[100%] scale-x-125 z-0 shadow-xl"></div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-[#F8FAFC]">
                        <Logo size={60} />
                    </div>
                </div>

                <div className="mt-10 text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-[#1B3C73] mb-1">Recuperar Contraseña</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ProfeIC Suite</p>
                </div>

                {sent ? (
                    <div className="text-center py-6 space-y-4">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                        <h3 className="text-xl font-bold text-[#1B3C73]">¡Correo enviado!</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Revisa tu bandeja de entrada y haz clic en el enlace para crear una nueva contraseña.
                            Si no lo encuentras, revisa tu carpeta de spam.
                        </p>
                        <Link
                            href="/login"
                            className="mt-4 inline-flex items-center gap-2 text-[#1B3C73] font-bold hover:underline text-sm"
                        >
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <p className="text-slate-500 text-sm text-center -mt-2 mb-4">
                            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                                Correo Institucional
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                className={`w-full pl-4 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-slate-800
                                    ${errors.email ? 'border-red-500' : 'border-slate-200'}
                                    focus:ring-2 focus:ring-[#1B3C73] outline-none transition-all placeholder:text-slate-400`}
                                placeholder="docente@colegio.cl"
                                disabled={isLoading}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-[#1B3C73] text-white font-bold rounded-xl shadow-lg hover:bg-[#2A59A8] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                            ) : (
                                <>Enviar enlace de recuperación <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/login" className="text-sm text-slate-400 hover:text-[#1B3C73] transition-colors font-medium">
                                ← Volver al inicio de sesión
                            </Link>
                        </div>
                    </form>
                )}
            </div>
            <p className="absolute bottom-6 text-slate-400/50 text-xs font-medium">© 2026 ProfeIC Suite Empresarial</p>
        </div>
    );
}
