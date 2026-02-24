"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    HomeIcon, BookOpenIcon, QueueListIcon, BeakerIcon,
    ArchiveBoxIcon, PuzzlePieceIcon, ArrowLeftOnRectangleIcon,
    SparklesIcon, ScaleIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftRightIcon,
    DocumentMagnifyingGlassIcon,
    GlobeAltIcon,
    UserCircleIcon,
    Bars3Icon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";

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
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("");
    const [isTransitioningTo360, setIsTransitioningTo360] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [individualPlan, setIndividualPlan] = useState(false);
    const [schoolPlan, setSchoolPlan] = useState("basic");

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            } else {
                setAuthorized(true);
                const meta = session.user.user_metadata;
                const name = meta?.full_name || meta?.first_name || meta?.nombre || "Profesor(a)";
                setUserName(name);
                setUserEmail(session.user.email || "");

                const role = meta?.role || localStorage.getItem("preferred_role") || "director";
                setUserRole(role);

                // Load plan info to control feature access
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('individual_plan_active, schools(plan_type, subscription_plan)')
                    .eq('id', session.user.id)
                    .single();

                if (profileData) {
                    setIndividualPlan(profileData.individual_plan_active || false);
                    const schoolData = Array.isArray(profileData.schools) ? profileData.schools[0] : profileData.schools;
                    setSchoolPlan((schoolData as any)?.subscription_plan || (schoolData as any)?.plan_type || "basic");
                }

                // Load collapsed preference
                const storedPref = localStorage.getItem("sidebar_collapsed");
                if (storedPref === "true") {
                    setIsCollapsed(true);
                }
            }
        };
        checkSession();
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
        localStorage.setItem("sidebar_collapsed", (!isCollapsed).toString());
    };

    if (!authorized) {
        return null;
    }

    const handleGoTo360 = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsTransitioningTo360(true);
        setTimeout(() => {
            router.push('/acompanamiento/dashboard');
        }, 1500);
    };

    // Helper to render Nav Items gracefully in collapsed vs expanded
    const NavItem = ({ href, icon: Icon, label, isActive = false }: any) => (
        <Link
            href={href}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed && !isMobileOpen ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium group relative
            ${isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a2e3b]'}
            ${isCollapsed && !isMobileOpen ? 'justify-center border border-transparent hover:border-gray-200 shadow-sm' : ''}
         `}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>{label}</span>}

            {/* Tooltip for collapsed mode */}
            {isCollapsed && !isMobileOpen && (
                <div className="absolute left-full ml-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {label}
                </div>
            )}
        </Link>
    );

    const SectionDivider = ({ label }: { label: string }) => (
        <div className={`mt-6 mb-2 ${isCollapsed && !isMobileOpen ? 'flex justify-center' : 'px-3'}`}>
            {isCollapsed && !isMobileOpen ? (
                <div className="w-6 h-px bg-gray-200"></div>
            ) : (
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{label}</p>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            {isTransitioningTo360 && (
                <div className="fixed inset-0 z-[9999] bg-[#1B3C73] flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-white/10 rounded-full animate-pulse mb-6 flex items-center justify-center shadow-lg shadow-black/20">
                        <SparklesIcon className="w-8 h-8 text-[#C87533]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Conectando con Panel 360°</h2>
                    <p className="text-blue-200 text-lg max-w-md text-center">Llevándote al espacio de gestión directiva, acompañamiento y análisis avanzado...</p>
                </div>
            )}

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside
                className={`bg-white border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative z-50
                    ${isMobileOpen ? 'fixed inset-y-0 left-0 w-64 shadow-2xl' : 'hidden md:flex'}
                    ${!isMobileOpen && isCollapsed ? 'md:w-20' : 'md:w-64'}
               `}
            >
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-24 hidden md:block bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                </button>

                <div className={`p-4 flex flex-col justify-center border-b border-gray-100 h-24 transition-all overflow-hidden`}>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 relative w-10 h-10 mx-auto">
                            <Logo size={40} />
                        </div>

                        {(!isCollapsed || isMobileOpen) && (
                            <div className="flex-1 min-w-0">
                                <span className="block font-bold text-[#1a2e3b] leading-tight truncate">
                                    {userName || "Cargando..."}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    ProfeIC • Aula
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <nav className={`flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-3' : ''}`}>
                    <div className="mb-4">
                        <NavItem href="/dashboard" icon={HomeIcon} label="Inicio" />
                    </div>

                    <SectionDivider label="Gestión" />
                    <NavItem href="/planificador" icon={BookOpenIcon} label="Planificador de Unidades" />
                    <NavItem href="/biblioteca" icon={ArchiveBoxIcon} label="Biblioteca Docente" />

                    <SectionDivider label="Evaluación" />
                    <NavItem href="/analizador" icon={DocumentMagnifyingGlassIcon} label="Analizador IA" />
                    <NavItem href="/rubricas" icon={ScaleIcon} label="Rúbricas" />
                    <NavItem href="/evaluaciones" icon={ClipboardDocumentCheckIcon} label="Evaluaciones" />

                    <SectionDivider label="Asistencia IA" />
                    <NavItem href="/lectura-inteligente" icon={BookOpenIcon} label="Lectura Inteligente" />
                    <NavItem href="/mentor" icon={ChatBubbleLeftRightIcon} label="ChatBot Mentor" />
                    <NavItem href="/elevador" icon={TrendingUpIcon} label="Elevador Cognitivo" />
                    <NavItem href="/nee" icon={PuzzlePieceIcon} label="Asistente NEE" />

                    {!individualPlan && (
                        <NavItem href="/comunidad" icon={GlobeAltIcon} label="Sala de Profesores" />
                    )}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    {["admin", "director", "utp"].includes(userRole) && !individualPlan && ['pro', 'enterprise'].includes(schoolPlan) && (
                        <a
                            href="/acompanamiento/dashboard"
                            onClick={handleGoTo360}
                            title={isCollapsed && !isMobileOpen ? "Gestión 360°" : undefined}
                            className={`flex items-center gap-3 w-full py-2.5 bg-orange-50 text-[#C87533] hover:bg-orange-100 rounded-xl transition-all text-sm font-bold border border-orange-200/50 mb-2 cursor-pointer group relative
                                ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'px-3'}
                            `}
                        >
                            <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                            {(!isCollapsed || isMobileOpen) && <span>Ir a Gestión 360°</span>}
                            {isCollapsed && !isMobileOpen && (
                                <div className="absolute left-full ml-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                    Ir a Gestión 360°
                                </div>
                            )}
                        </a>
                    )}

                    {userEmail === "re.se.alvarez@gmail.com" && (
                        <Link
                            href="/superadmin"
                            title={isCollapsed && !isMobileOpen ? "SaaS Root Control" : undefined}
                            className={`flex items-center gap-3 w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all text-sm font-bold border border-slate-700 mb-2 cursor-pointer group relative
                                ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'px-3'}
                            `}
                        >
                            <GlobeAltIcon className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                            {(!isCollapsed || isMobileOpen) && <span>SaaS Root Control</span>}
                            {isCollapsed && !isMobileOpen && (
                                <div className="absolute left-full ml-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                    SaaS Root Control
                                </div>
                            )}
                        </Link>
                    )}

                    <NavItem href="/perfil" icon={UserCircleIcon} label="Mi Perfil" />

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            localStorage.removeItem("profeic_token");
                            router.push("/");
                        }}
                        title={isCollapsed && !isMobileOpen ? "Cerrar Sesión" : undefined}
                        className={`flex items-center gap-3 w-full py-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-sm font-bold group relative
                           ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'px-3'}
                        `}
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                        {(!isCollapsed || isMobileOpen) && <span>Cerrar Sesión</span>}
                        {isCollapsed && !isMobileOpen && (
                            <div className="absolute left-full ml-2 w-max px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                Cerrar Sesión
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
                {/* Mobile Header */}
                <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Logo size={32} />
                        <span className="font-bold text-[#1a2e3b]">ProfeIC Aula</span>
                    </div>
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-500 hover:text-[#f2ae60] bg-slate-50 rounded-lg">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </main>
        </div>
    );
}