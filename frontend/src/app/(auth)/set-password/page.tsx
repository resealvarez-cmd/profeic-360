"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

const setPasswordSchema = z.object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type SetPasswordForm = z.infer<typeof setPasswordSchema>;

export default function SetPasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [checkingSession, setCheckingSession] = useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SetPasswordForm>({
        resolver: zodResolver(setPasswordSchema),
    });

    useEffect(() => {
        // Al darle clic al enlace de invitación, Supabase procesa el '#access_token' en la URL.
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserEmail(session.user.email || null);
            } else {
                toast.error("No hay una sesión activa. Usa el enlace de tu correo nuevamente o inicia sesión.");
                router.push('/login');
            }
            setCheckingSession(false);
        };

        // Retardar un poco para permitir que se lea el hash de la URL
        const timer = setTimeout(checkUser, 1000);
        return () => clearTimeout(timer);
    }, [router]);

    const onSubmit = async (data: SetPasswordForm) => {
        setIsLoading(true);

        try {
            const { data: updateData, error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) throw error;

            toast.success("¡Contraseña creada exitosamente!");

            const user = updateData.user;
            let role = user?.user_metadata?.role || "teacher";

            let redirectPath = "/dashboard";
            if (role === "admin" || role === "director" || role === "utp") {
                redirectPath = "/acompanamiento/dashboard";
            }

            window.location.href = redirectPath;

        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la contraseña');
            setIsLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#1B3C73]" />
                <p className="mt-4 text-slate-500 font-medium">Verificando invitación...</p>
            </div>
        );
    }

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
                    <h2 className="text-2xl font-extrabold text-[#1B3C73] mb-1">Crea tu Contraseña</h2>
                    <p className="text-xs font-bold text-slate-400 tracking-widest mt-2">{userEmail}</p>
                    <p className="text-slate-500 text-sm mt-3">Para completar tu registro, estabece una contraseña que usarás para ingresar en el futuro.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Password */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className={`w-full pl-4 pr-12 py-3 bg-[#F8FAFC] border rounded-xl text-slate-800 
                            ${errors.password ? 'border-red-500' : 'border-slate-200'}
                            focus:ring-2 focus:ring-[#1B3C73] outline-none transition-all placeholder:text-slate-400`}
                                placeholder="Min. 8 caracteres"
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

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                className={`w-full pl-4 pr-12 py-3 bg-[#F8FAFC] border rounded-xl text-slate-800 
                            ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}
                            focus:ring-2 focus:ring-[#1B3C73] outline-none transition-all placeholder:text-slate-400`}
                                placeholder="Repite la contraseña"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-[#1B3C73] text-white font-bold rounded-xl shadow-lg hover:bg-[#2A59A8] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                Guardar Contraseña
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

            </div>
            <p className="absolute bottom-6 text-slate-400/50 text-xs font-medium">© 2026 ProfeIC Suite Empresarial</p>
        </div>
    );
}
