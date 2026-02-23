"use client";

import { useEffect, useState, Suspense } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileText, BarChart3, LogOut, Settings, ShieldAlert, Home, Calendar, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

const inter = Inter({ subsets: ["latin"] });

export default function Layout360({ children }: { children: React.ReactNode }) {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loadingUser, setLoadingUser] = useState(true);
    const [isTransitioningToAula, setIsTransitioningToAula] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.email) {
                    setUserEmail(user.email);

                    // Fetch Role
                    const { data: authUser } = await supabase
                        .from('authorized_users')
                        .select('role')
                        .eq('email', user.email)
                        .single();

                    if (authUser) setUserRole(authUser.role);
                }
            } catch (e) {
                console.error("Auth check failed", e);
            } finally {
                setLoadingUser(false);
            }
        };
        checkUser();
    }, []);

    const isSuperAdmin = userEmail === 're.se.alvarez@gmail.com';
    const isTeacher = userRole === 'teacher';
    // STRICT WHITELIST: Only these roles can see management tools
    const canManageTeachers = ['admin', 'director', 'utp'].includes(userRole || '');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/'; // Hard refresh/redirect
    };

    const handleGoToAula = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsTransitioningToAula(true);
        setTimeout(() => {
            router.push('/dashboard');
        }, 1500);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8 text-[#1B3C73]">Cargando plataforma...</div>}>
            <div className="flex bg-[#F8FAFC] min-h-screen font-sans overflow-hidden">
                {isTransitioningToAula && (
                    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Home size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-[#1a2e3b] mb-3">Retornando a ProfeIC</h2>
                        <p className="text-slate-500 text-lg max-w-md text-center">Llevándote al espacio de planificación activa, rutinas y recursos docentes...</p>
                    </div>
                )}

                {/* Mobile Overlay */}
                {isMobileOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in" onClick={() => setIsMobileOpen(false)} />
                )}

                <aside className={`w-64 bg-[#1B3C73] text-slate-300 fixed h-full flex flex-col justify-between z-50 shadow-2xl transition-transform duration-300
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div>
                        <div className="p-6 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden relative shadow-md">
                                    <Logo size={40} />
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg leading-tight text-[#C87533] uppercase">Panel 360°</h1>
                                    <p className="text-[10px] text-slate-400 tracking-wider">ACOMPAÑAMIENTO</p>
                                </div>
                            </div>
                            <button className="md:hidden text-white hover:text-[#C87533]" onClick={() => setIsMobileOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="px-4 space-y-2 mt-4">
                            <Link href="/acompanamiento/dashboard"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${isActive('/acompanamiento/dashboard')
                                    ? 'bg-white/10 text-white border-white/10 shadow-sm'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
                                    }`}>
                                <LayoutDashboard size={20} className={isActive('/acompanamiento/dashboard') ? "text-[#f2ae60]" : "text-slate-500"} />
                                <span className="font-medium text-sm">Visión Global</span>
                            </Link>

                            {/* ONLY SHOW MANAGEMENT MODULES TO ALLOWED ROLES (Admin, Director, UTP) */}
                            {!loadingUser && canManageTeachers && (
                                <>
                                    <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase mt-4">Módulos</div>

                                    <Link href="/acompanamiento/docentes"
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${isActive('/acompanamiento/docentes')
                                            ? 'bg-white/10 text-white border-white/10 shadow-sm'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
                                            }`}>
                                        <Users size={20} className={isActive('/acompanamiento/docentes') ? "text-[#2A59A8]" : "text-slate-500"} />
                                        <span className="font-medium text-sm">Mis Docentes</span>
                                    </Link>

                                    <Link href="/acompanamiento/dashboard?view=observations"
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${searchParams.get('view') === 'observations'
                                            ? 'bg-white/10 text-white border-white/10 shadow-sm'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
                                            }`}>
                                        <FileText size={20} className={searchParams.get('view') === 'observations' ? "text-[#2A59A8]" : "text-slate-500"} />
                                        <span className="font-medium text-sm">Observaciones</span>
                                    </Link>

                                    <Link href="/acompanamiento/dashboard?view=reports"
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${searchParams.get('view') === 'reports'
                                            ? 'bg-white/10 text-white border-white/10 shadow-sm'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
                                            }`}>
                                        <BarChart3 size={20} className={searchParams.get('view') === 'reports' ? "text-[#2A59A8]" : "text-slate-500"} />
                                        <span className="font-medium text-sm">Reportes IA</span>
                                    </Link>

                                    <div className="px-4 py-2 text-xs font-bold text-[#C87533] uppercase mt-6 flex items-center gap-2">
                                        <Settings size={12} /> Administración
                                    </div>
                                    <Link href="/acompanamiento/admin/eventos" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${isActive('/acompanamiento/admin/eventos')
                                        ? 'bg-[#C87533]/20 text-[#C87533] border-[#C87533]/20 shadow-sm'
                                        : 'text-[#C87533]/70 hover:bg-[#C87533]/10 hover:text-[#C87533] border-transparent'
                                        }`}>
                                        <Calendar size={20} />
                                        <span className="font-bold text-sm">Eventos Institucionales</span>
                                    </Link>

                                    {isSuperAdmin && (
                                        <Link href="/acompanamiento/admin/users" className="flex items-center gap-3 px-4 py-3 mt-2 bg-[#C87533]/10 text-[#C87533] rounded-xl transition-all hover:bg-[#C87533]/20 group border border-[#C87533]/20">
                                            <Users size={20} />
                                            <span className="font-bold text-sm">Usuarios y Roles</span>
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-white/5 space-y-2">
                        <a
                            href="/dashboard"
                            onClick={handleGoToAula}
                            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-blue-500/10 hover:text-blue-400 rounded-xl transition-all text-sm group cursor-pointer"
                        >
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium">Ir a ProfeIC (Aula)</span>
                        </a>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all text-sm group">
                            <LogOut size={18} />
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 md:ml-64 relative bg-[#F8FAFC] overflow-y-auto">
                    {/* Mobile Header */}
                    <div className="md:hidden bg-[#1B3C73] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
                        <div className="flex items-center gap-2">
                            <Logo size={32} />
                            <span className="font-bold uppercase tracking-wider text-[#C87533] text-sm">Panel 360°</span>
                        </div>
                        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-white hover:text-[#C87533]">
                            <Menu size={24} />
                        </button>
                    </div>
                    <div className="p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </Suspense>
    );
}
