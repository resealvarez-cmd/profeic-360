"use client";

import { useState, useEffect, Suspense } from "react"; // Added Suspense
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { Search, Calendar, Mail, FileText, MoreVertical, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function TeachersList() { // Converted to inner component to usage Suspense in parent if needed (Next.js requirement for useSearchParams)
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQuery = searchParams.get("q") || "";
    const [search, setSearch] = useState(initialQuery);
    const [userRole, setUserRole] = useState<string | null>(null);

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

            // 3. Fetch Profiles to get UUIDs (unconditional to avoid 400 URL overflow limit from Supabase .in() query)
            const { data: profiles, error: profError } = await supabase
                .from('profiles')
                .select('id, email, full_name, avatar_url');

            // 4. Merge Data
            const merged = authorized.map(auth => {
                const profile = profiles?.find(p => p.email === auth.email);
                return {
                    ...auth,
                    id: profile?.id, // This is the crucial UUID
                    avatar_url: profile?.avatar_url
                };
            });

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

    const filteredTeachers = teachers.filter(t => {
        if (!search) return true;
        const low = search.toLowerCase();
        return (
            t.full_name?.toLowerCase().includes(low) ||
            t.email?.toLowerCase().includes(low) ||
            t.subject?.toLowerCase().includes(low) ||
            t.grade?.toLowerCase().includes(low)
        );
    });

    const handleObserve = async (teacher: any) => {
        if (!teacher.id) {
            alert("Este docente no ha activado su cuenta (Falta UUID). No se puede observar aún.");
            return;
        }
        if (!currentUserId) {
            alert("Debes iniciar sesión para observar.");
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
            alert("Error iniciando observación: " + err.message);
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
            alert("No hay correos disponibles.");
        }
    };

    const handleAddTeacher = () => {
        router.push('/acompanamiento/admin/users');
    };

    const handleSchedule = (teacher: any) => {
        if (teacher.email) {
            openMailtoLink(teacher.email, "Agendar Reunión");
        } else {
            alert("Este docente no tiene correo registrado.");
        }
    };

    return (
        <div className="font-sans text-[#1a2e3b]">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e3b]">Nómina Docente</h1>
                    <p className="text-slate-500">Gestión y Acompañamiento</p>
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
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 mb-8">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre, asignatura o nivel..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400"
                />
            </div>

            {/* TABLA/LISTA */}
            {loading ? <p>Cargando docentes...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map((teacher) => (
                        <div key={teacher.email} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-[#f2ae60] group-hover:bg-blue-500 transition-colors"></div>

                            <div className="flex justify-between items-start mb-4 pl-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
                                    {teacher.full_name ? teacher.full_name[0] : 'D'}
                                </div>
                                <button className="text-slate-300 hover:text-slate-500"><MoreVertical size={20} /></button>
                            </div>

                            <div className="pl-4 mb-6">
                                <h3 className="font-bold text-lg text-[#1a2e3b]">{teacher.full_name}</h3>
                                <p className="text-sm text-slate-400">{teacher.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">{teacher.subject || 'General'}</span>
                                    <span className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded-md">{teacher.grade || 'Media'}</span>
                                </div>
                            </div>

                            <div className="pl-4 flex gap-2 border-t border-slate-50 pt-4">
                                {userRole !== 'teacher' ? (
                                    <>
                                        <button
                                            onClick={() => handleSchedule(teacher)}
                                            className="flex-1 bg-[#1a2e3b]/5 text-[#1a2e3b] py-2 rounded-lg text-xs font-bold hover:bg-[#1a2e3b] hover:text-white transition-colors flex items-center justify-center gap-2">
                                            <Calendar size={14} /> Agendar
                                        </button>
                                        <button
                                            onClick={() => handleObserve(teacher)}
                                            className="flex-1 bg-[#f2ae60]/10 text-orange-600 py-2 rounded-lg text-xs font-bold hover:bg-[#f2ae60] hover:text-white transition-colors flex items-center justify-center gap-2">
                                            <FileText size={14} /> Observar
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-slate-400 italic w-full text-center py-2">Solo visualización</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredTeachers.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-400">
                            No se encontraron docentes con "{search}".
                        </div>
                    )}
                </div>
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
