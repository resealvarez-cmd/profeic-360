
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

const loginSchema = z.object({
    email: z
        .string()
        .email('Correo electrónico inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [buttonText, setButtonText] = useState("Ingresar");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setButtonText("Verificando...");

        try {
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (signInError) throw signInError;

            toast.success("Bienvenido a ProfeIC");

            // --- LOGICA DE REDIRECCION POR ROL (Conserva lógica original) ---
            const { user } = authData;
            let role = user?.user_metadata?.role;

            if (!role) {
                const preferredRole = localStorage.getItem("preferred_role");
                if (preferredRole) role = preferredRole;
            }
            role = role || "teacher";

            let redirectPath = "/dashboard";
            if (role === "admin" || role === "director" || role === "utp") {
                redirectPath = "/acompanamiento/dashboard";
                setButtonText("Entrando a Gestión...");
            } else {
                setButtonText("Entrando al Aula...");
            }

            // Hard redirect
            window.location.href = redirectPath;

        } catch (error: any) {
            toast.error(error.message || 'Error al iniciar sesión');
            setIsLoading(false);
            setButtonText("Ingresar");
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative font-sans">
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-[#1B3C73] rounded-b-[100%] scale-x-125 z-0 shadow-xl"></div>

            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-[#F8FAFC] overflow-hidden relative">
                        <Logo size={60} />
                    </div>
                </div>

                <div className="mt-10 text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-[#1B3C73] mb-1">Iniciar Sesión</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ProfeIC Suite</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Correo Institucional</label>
                        <input
                            type="email"
                            {...register('email')}
                            className={`w-full pl-4 pr-4 py-3 bg-[#F8FAFC] border rounded-xl 
                        ${errors.email ? 'border-red-500' : 'border-slate-200'}
                        focus:ring-2 focus:ring-[#1B3C73] outline-none transition-all placeholder:text-slate-300`}
                            placeholder="docente@profeic.cl"
                            disabled={isLoading}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className={`w-full pl-4 pr-12 py-3 bg-[#F8FAFC] border rounded-xl 
                            ${errors.password ? 'border-red-500' : 'border-slate-200'}
                            focus:ring-2 focus:ring-[#1B3C73] outline-none transition-all placeholder:text-slate-300`}
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="text-right">
                        <Link href="/forgot-password" className="text-sm text-[#1B3C73] hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-[#1B3C73] text-white font-bold rounded-xl shadow-lg hover:bg-[#2A59A8] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {buttonText === "Ingresar" ? "Ingresando..." : buttonText}
                            </>
                        ) : (
                            <>
                                Ingresar
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Acceso restringido a usuarios institucionales.</p>
                    <p className="text-[#1B3C73] font-bold text-sm">
                        Si tu colegio tiene ProfeIC, revisa tu correo.
                    </p>
                </div>
            </div>
            <p className="absolute bottom-6 text-slate-400/50 text-xs font-medium">© 2026 ProfeIC Suite Empresarial</p>
        </div>
    );
}