"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, Mail, FileText, MoreVertical, Plus, BrainCircuit, ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { TeacherProfiler } from "@/components/shared/TeacherProfiler";
function TeachersList() { // Converted to inner component to usage Suspense in parent if needed (Next.js requirement for useSearchParams)
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get("q") || "";
    const [search, setSearch] = useState(initialQuery);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [showProfiler, setShowProfiler] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grid');

    const [hideNoObservations, setHideNoObservations] = useState(false);
    const [observationStats, setObservationStats] = useState<Record<string, number>>({});
    const [selectedSkill, setSelectedSkill] = useState<string>("all");

    const SKILLS = [
        "Gestión del Clima",
        "Dominio de Contenido",
        "Estrategias de Enseñanza",
        "Evaluación y Retroalimentación",
        "Uso de TIC",
        "Inclusión y Diversidad"
    ];

    useEffect(() => {
        const initData = async () => {
            // 1. Get Current User (Observer)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Should allow redirect by middleware or other logic

            setCurrentUserId(user.id);

            // Check Role
            const { data: authUser } = await supabase
                .from('authorized_users')
                .select('role')
                .eq('email', user.email)
                .single();

            if (authUser) {
                setUserRole(authUser.role);
                // SECURITY CHECK: If Teacher, Do NOT fetch list, redirect or show empty.
                if (authUser.role === 'teacher') {
                    setLoading(false);
                    // Optional: Redirect
                    router.push('/acompanamiento/dashboard');
                    return;
                }
            }

            // 2. Fetch Teachers (Authorized) AND their Profile IDs
            // ONLY if not a teacher
            const { data: authorized, error: authError } = await supabase
                .from('authorized_users')
                .select('*')
                .eq('role', 'teacher')
                .order('full_name', { ascending: true });

            if (authError) {
                console.error(authError);
                return;
            }

            // 3. Fetch Profiles strictly bounded by tenant school_id
            const { data: myProfile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle();
            const currentSchoolId = myProfile?.school_id;

            let profileQuery = supabase.from('profiles').select('id, email, full_name, avatar_url');
            if (currentSchoolId) {
                profileQuery = profileQuery.eq('school_id', currentSchoolId);
            }
            const { data: profiles } = await profileQuery;
            const schoolUserEmails = profiles?.map(p => p.email?.toLowerCase()) || [];
            const schoolUserIds = profiles?.map(p => p.id) || [];

            // 4. Merge Data
            const merged = authorized.filter(auth => 
                schoolUserEmails.includes(auth.email?.toLowerCase())
            ).map(auth => {
                const profile = profiles?.find(p => p.email?.toLowerCase() === auth.email?.toLowerCase());
                return {
                    ...auth,
                    id: profile?.id,
                    avatar_url: profile?.avatar_url
                };
            }).filter(u => u.id);

            // 5. Fetch Observation Stats for grouping/filtering
            if (schoolUserIds.length > 0) {
                const { data: cycles } = await supabase
                    .from('observation_cycles')
                    .select('teacher_id, status')
                    .in('teacher_id', schoolUserIds);
                
                if (cycles) {
                    const stats: Record<string, number> = {};
                    cycles.forEach(c => {
                        if (c.status === 'completed') {
                            stats[c.teacher_id] = (stats[c.teacher_id] || 0) + 1;
                        }
                    });
                    setObservationStats(stats);
                }
            }

            setTeachers(merged);
            setLoading(false);
        };
        initData();
    }, []);

    // Sync search state if URL changes (optional, but good for back button)
    useEffect(() => {
        setSearch(searchParams.get("q") || "");
    }, [searchParams]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        // Optional: Update URL without reload could go here, but keep it simple for now
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 3. DERIVED STATE (Reactivity FTW)
    // ─────────────────────────────────────────────────────────────────────────
    const filteredTeachers = teachers.filter(t => {
        // A. Filter by observation count if toggle is active
        if (hideNoObservations && !observationStats[t.id]) return false;

        // B. Filter by search query
        const low = search.toLowerCase();
        const matchesSearch = !search || (
            t.full_name?.toLowerCase().includes(low) ||
            t.email?.toLowerCase().includes(low) ||
            t.subject?.toLowerCase().includes(low) ||
            t.grade?.toLowerCase().includes(low)
        );
        if (!matchesSearch) return false;

        // C. Filter by Skill (Placeholder logic: if we don't have skills array in list, we match 'all')
        // In a real scenario, t.skills would be an array of strings.
        if (selectedSkill !== "all") {
            // Note: If t.skills is not yet available in the list fetch, this will currently show nothing
            // if a skill is selected. This is the correct behavior for a filter.
            if (!t.skills || !t.skills.includes(selectedSkill)) return false;
        }

        return true;
    });

    // Derive grouped data in real-time
    const groupedData = viewMode === 'grouped' 
        ? filteredTeachers.reduce((acc: any, t: any) => {
            const completedCount = observationStats[t.id] || 0;
            let key = '⚪ Por Evaluar (Sin observaciones)';
            
            if (completedCount >= 4) key = '🏆 Fortalezas: Liderazgo Pedagógico';
            else if (completedCount >= 2) key = '📈 En Desarrollo: Prácticas Consolidadas';
            else if (completedCount > 0) key = '⚠️ Necesidades de Desarrollo: Plan IA Sugerido';
            
            if (!acc[key]) acc[key] = [];
            acc[key].push(t);
            return acc;
        }, {})
        : null;

    const handleObserve = async (teacher: any) => {
        if (!teacher.id) {
            toast.error("Este docente no ha activado su cuenta (Falta UUID). No se puede observar aún.");
            return;
        }
        if (!currentUserId) {
            toast.error("Debes iniciar sesión para observar.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from('observation_cycles')
                .insert([{
                    teacher_id: teacher.id,
                    observer_id: currentUserId,
                    status: 'in_progress'
                }])
                .select()
                .single();

            if (error) throw error;

            router.push(`/acompanamiento/observacion/${data.id}`);

        } catch (err: any) {
            toast.error("Error iniciando observación: " + err.message);
        }
    };


    const openMailtoLink = (email: string, subject: string, bcc: string = "") => {
        const link = document.createElement("a");
        link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&bcc=${bcc}`;
        link.target = "_blank"; // Force new tab/window context if possible
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleContactAll = () => {
        const emails = teachers.map(t => t.email).filter(Boolean);
        if (emails.length > 0) {
            // Some clients have limits on BCC length, but this is best effort
            openMailtoLink("", "Comunicado Docente", emails.join(','));
        } else {
            toast.error("No hay correos disponibles.");
        }
    };

    const handleAddTeacher = () => {
        router.push('/acompanamiento/admin/users');
    };

    const handleSchedule = (teacher: any) => {
        if (teacher.email) {
            openMailtoLink(teacher.email, "Agendar Reunión");
        } else {
            toast.error("Este docente no tiene correo registrado.");
        }
    };

    return (
        <div className="font-sans text-[#1a2e3b]">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-[#1B3C73]">Gestión de Talentos Docentes</h1>
                    <p className="text-slate-500 font-medium">Panel de acompañamiento y desarrollo profesional</p>
                </div>
                <div className="flex gap-3">
                    {userRole !== 'teacher' && (
                        <>
                            <button onClick={handleContactAll} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50 font-medium">
                                <Mail size={18} /> Contactar Todos
                            </button>
                            <button onClick={handleAddTeacher} className="bg-[#1a2e3b] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#2b546e] shadow-lg shadow-blue-900/20 font-bold">
                                <Plus size={18} /> Agregar Docente
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* FILTROS */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 w-full">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Buscar por nombre, asignatura o nivel..."
                        className="flex-1 bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400 font-medium"
                    />
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-[#1B3C73] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Vista Galería
                    </button>
                    <button 
                        onClick={() => setViewMode('grouped')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'grouped' ? 'bg-[#1B3C73] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Agrupar por Potencial
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Habilidad:</span>
                    <select 
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] font-bold text-[#1B3C73] cursor-pointer"
                    >
                        <option value="all">Todas</option>
                        {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm ml-auto">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ocultar sin observación</span>
                    <button 
                        onClick={() => setHideNoObservations(!hideNoObservations)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${hideNoObservations ? 'bg-orange-500' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hideNoObservations ? 'left-6' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>

            {/* TABLA/LISTA */}
            {loading ? <p className="text-center py-20 text-slate-400 font-bold animate-pulse">Cargando nómina docente...</p> : (
                <div className="space-y-8">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTeachers.map((teacher) => (
                                <div key={teacher.email} className="bg-white rounded-3xl border border-slate-200/60 p-6 hover:shadow-xl transition-all group relative overflow-hidden h-full flex flex-col">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-[#1B3C73] group-hover:bg-orange-400 transition-colors"></div>

                                    <div className="flex justify-between items-start mb-6 pl-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[#1B3C73] text-xl shadow-inner">
                                            {teacher.full_name ? teacher.full_name[0] : 'D'}
                                        </div>
                                        <button className="text-slate-300 hover:text-[#1B3C73] p-1 rounded-lg transition-colors"><MoreVertical size={20} /></button>
                                    </div>

                                    <div className="pl-4 mb-6 flex-1">
                                        <h3 className="font-bold text-lg text-[#1B3C73] mb-1">{teacher.full_name}</h3>
                                        <p className="text-xs text-slate-400 font-medium">{teacher.email}</p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider border border-blue-100">{teacher.subject || 'General'}</span>
                                            <span className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider border border-slate-100">{teacher.grade || 'Media'}</span>
                                        </div>
                                    </div>

                                    <div className="pl-4 flex flex-col gap-2 border-t border-slate-50 pt-5">
                                        <button
                                            onClick={() => {
                                                setSelectedTeacherId(teacher.id);
                                                setShowProfiler(true);
                                            }}
                                            className="w-full bg-[#1B3C73] text-white py-3 rounded-xl text-xs font-black hover:bg-[#2A59A8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 active:scale-95 group/btn"
                                        >
                                            <BrainCircuit size={14} className="text-orange-400 group-hover/btn:rotate-12 transition-transform" /> Ver Perfilador
                                        </button>
                                        
                                        {userRole !== 'teacher' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSchedule(teacher)}
                                                    className="flex-1 bg-slate-50 text-slate-600 py-2.5 rounded-xl text-[10px] font-black hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 border border-slate-100">
                                                    <Calendar size={12} className="text-[#1B3C73]" /> Agendar
                                                </button>
                                                <button
                                                    onClick={() => handleObserve(teacher)}
                                                    className="flex-1 bg-orange-50 text-orange-700 py-2.5 rounded-xl text-[10px] font-black hover:bg-orange-400 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-orange-200">
                                                    <FileText size={12} /> Observar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {groupedData && Object.entries(groupedData).map(([groupName, teachers]: [string, any]) => (
                                <div key={groupName} className="relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-xl font-black text-[#1B3C73] whitespace-nowrap bg-[#F8FAFC] pr-4 z-10">{groupName}</h2>
                                        <div className="h-[2px] bg-slate-200 flex-1"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{teachers.length} Docentes</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {teachers.map((teacher: any) => (
                                            <div key={teacher.email} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-[#C87533]/50 hover:shadow-xl transition-all flex items-center gap-4 shadow-sm group cursor-pointer" onClick={() => { setSelectedTeacherId(teacher.id); setShowProfiler(true); }}>
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-black text-[#1B3C73] shadow-inner group-hover:bg-[#1B3C73] group-hover:text-white transition-colors">
                                                    {teacher.full_name ? teacher.full_name[0] : 'D'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-[#1B3C73] text-sm truncate">{teacher.full_name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{teacher.subject || 'Sin Asignatura'}</p>
                                                </div>
                                                <div className="ml-auto bg-slate-50 p-2 rounded-lg group-hover:bg-[#C87533]/10 transition-colors">
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#C87533] transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredTeachers.length === 0 && (
                        <div className="col-span-full text-center py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                            <Search size={48} className="mx-auto mb-6 text-slate-200" />
                            <p className="text-slate-500 font-bold text-lg">No se encontraron docentes con su criterio de búsqueda.</p>
                            <button onClick={() => setSearch("")} className="mt-4 text-[#C87533] font-black text-xs uppercase tracking-widest hover:text-[#1B3C73] transition-colors">Limpiar Filtros</button>
                        </div>
                    )}
                </div>
            )}

            {/* Teacher Profiler Drawer */}
            {showProfiler && selectedTeacherId && (
                <TeacherProfiler 
                    teacherId={selectedTeacherId as string}
                    isOpen={showProfiler}
                    onClose={() => {
                        setShowProfiler(false);
                        setSelectedTeacherId(null);
                    }}
                    userRole={userRole || 'director'}
                />
            )}
        </div>
    );
}

export default function TeachersDirectory() {
    return (
        <Suspense fallback={<div>Cargando directorio...</div>}>
            <TeachersList />
        </Suspense>
    );
}
