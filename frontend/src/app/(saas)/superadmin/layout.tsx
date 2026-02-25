"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";
import { Loader2, Server, LogOut, LayoutDashboard, Sparkles } from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSuperAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            // STRCIT CHECK: Only this email can enter the SuperAdmin SaaS dashboard
            if (session.user.email !== "re.se.alvarez@gmail.com") {
                router.push("/dashboard");
                return;
            }

            setAuthorized(true);
        };
        checkSuperAdmin();
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
                <Loader2 className="w-12 h-12 animate-spin text-[#C87533] mb-4" />
                <h1 className="text-xl font-bold">Verificando credenciales de sistema...</h1>
            </div>
        );
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden font-sans">
            {/* Sidebar Dark Mode */}
            <aside className="w-64 bg-black/50 border-r border-slate-800 flex flex-col justify-between">
                <div>
                    <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                            <Logo size={40} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight text-white uppercase">SaaS Control</h1>
                            <p className="text-[10px] text-slate-500 tracking-widest uppercase">ProfeIC Root</p>
                        </div>
                    </div>

                    <nav className="p-4 space-y-2">
                        <div className="flex items-center gap-3 px-4 py-3 bg-[#C87533]/20 text-[#C87533] border border-[#C87533]/30 rounded-xl font-bold text-sm mb-4">
                            <Server size={20} />
                            Tenants & Escuelas
                        </div>

                        <div className="pt-4 border-t border-slate-800 space-y-2">
                            <button onClick={() => router.push('/home')} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all text-sm font-medium">
                                <LayoutDashboard size={18} />
                                Volver a ProfeIC
                            </button>
                            <button onClick={() => router.push('/acompanamiento/dashboard')} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all text-sm font-medium">
                                <Sparkles size={18} />
                                Volver a Gestión 360°
                            </button>
                        </div>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all text-sm font-medium">
                        <LogOut size={18} />
                        Cerrar Sesión Root
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative p-8">
                {children}
            </main>
        </div>
    );
}
