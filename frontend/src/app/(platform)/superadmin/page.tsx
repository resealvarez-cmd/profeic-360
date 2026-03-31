"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
    Plus, Users, Building, Mail, Loader2, ArrowRight, Pencil, X, Save, 
    MapPin, BookOpen, Sparkles, Upload, FileText, Trash2, File as FileIcon, 
    UserX, CheckCircle, TrendingUp, Clock, UserCheck, BarChart3, Zap, 
    Trophy, AlertTriangle, Activity, RefreshCw
} from "lucide-react";
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// ─── Modal de edición del perfil institucional ───────────────────────────────
interface School {
    id: string;
    name: string;
    slug: string;
    status: string;
    subscription_plan: string;
    max_users: number;
    city?: string;
    region?: string;
    sello_institucional?: string;
    valores?: string;
    proyecto_educativo?: string;
}

interface UserProfile {
    id: string;          // auth.users uuid
    email: string;
    full_name?: string;
    role?: string;
}

function SchoolEditModal({ school, onClose, onSaved }: { school: School; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState({
        city: school.city || "",
        region: school.region || "",
        sello_institucional: school.sello_institucional || "",
        valores: school.valores || "",
        proyecto_educativo: school.proyecto_educativo || "",
    });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"profile" | "docs">("profile");

    // --- Document Manager States ---
    const [docs, setDocs] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [tipoDocSeleccionado, setTipoDocSeleccionado] = useState("general");

    const fetchDocs = async () => {
        setLoadingDocs(true);
        try {
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (!token) return;

            const res = await fetch(`${BE_URL}/documentos/${school.id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDocs(data.documents || []);
            }
        } catch (e) {
            console.error("Error cargando docs", e);
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        if (activeTab === "docs") fetchDocs();
    }, [activeTab]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Procesando y vectorizando documento...");

        try {
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (!token) throw new Error("No hay sesión");

            const formData = new FormData();
            formData.append("file", file);
            formData.append("school_id", school.id);
            formData.append("tipo_documento", tipoDocSeleccionado);

            const res = await fetch(`${BE_URL}/upload-contexto`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Error subiendo archivo");
            }

            toast.success("Documento procesado con éxito", { id: toastId });
            fetchDocs();
        } catch (err: any) {
            toast.error(err.message || "Error al subir", { id: toastId });
        } finally {
            setUploading(false);
            if (e.target) e.target.value = ""; // reset input
        }
    };

    const handleDeleteDoc = async (filename: string) => {
        if (!confirm(`¿Eliminar ${filename}? La IA ya no lo usará.`)) return;

        const toastId = toast.loading("Eliminando documento...");
        try {
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (!token) throw new Error("No hay sesión");

            const res = await fetch(`${BE_URL}/documentos/${school.id}/${encodeURIComponent(filename)}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error eliminando documento");

            toast.success("Documento eliminado", { id: toastId });
            fetchDocs();
        } catch (e: any) {
            toast.error("Error al eliminar", { id: toastId });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from("schools")
                .update({
                    city: form.city.trim() || null,
                    region: form.region.trim() || null,
                    sello_institucional: form.sello_institucional.trim() || null,
                    valores: form.valores.trim() || null,
                    proyecto_educativo: form.proyecto_educativo.trim() || null,
                })
                .eq("id", school.id);

            if (error) throw error;
            toast.success("Perfil institucional guardado ✓");
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error("Error al guardar: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
                            <Building size={22} />
                        </div>
                        <div>
                            <h2 className="text-slate-800 font-bold text-lg leading-tight">{school.name}</h2>
                            <p className="text-slate-500 text-xs">Perfil Institucional para la IA</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* --- TABS --- */}
                <div className="flex border-b border-slate-100 px-6 mt-4 gap-6">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "profile" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        📝 Perfil Texto
                    </button>
                    <button
                        onClick={() => setActiveTab("docs")}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "docs" ? "border-teal-500 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        📚 Base de Conocimientos (RAG)
                    </button>
                </div>

                {activeTab === "profile" ? (
                    <>
                        {/* Info banner */}
                        <div className="mx-6 mt-5 p-3 bg-teal-50 border border-teal-100 rounded-xl flex gap-2">
                            <Sparkles size={14} className="text-teal-600 shrink-0 mt-0.5" />
                            <p className="text-teal-700 text-xs leading-relaxed">
                                Esta información se inyecta en los prompts de IA de los profesores de este colegio para personalizar el contenido pedagógico.
                            </p>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-5">
                            {/* Ubicación */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <MapPin size={12} /> Ubicación
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Ciudad"
                                        value={form.city}
                                        onChange={e => setForm({ ...form, city: e.target.value })}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Región"
                                        value={form.region}
                                        onChange={e => setForm({ ...form, region: e.target.value })}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Sello */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <Sparkles size={12} /> Sello Institucional
                                </label>
                                <input
                                    type="text"
                                    placeholder="ej: Humanista-Cristiano con Excelencia Académica"
                                    value={form.sello_institucional}
                                    onChange={e => setForm({ ...form, sello_institucional: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>

                            {/* PEI / Proyecto Educativo */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <BookOpen size={12} /> Proyecto Educativo (PEI)
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Descripción breve del PEI o misión del colegio."
                                    value={form.proyecto_educativo}
                                    onChange={e => setForm({ ...form, proyecto_educativo: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 pb-6">
                            <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-200 transition-colors">Cerrar</button>
                            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors flex items-center gap-2">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Guardar Perfil
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-6 space-y-6">
                        <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                            <h3 className="text-slate-800 font-bold text-sm mb-3">Subir Nuevo Documento (PDF)</h3>
                            <div className="flex items-center gap-3">
                                <select
                                    value={tipoDocSeleccionado}
                                    onChange={(e) => setTipoDocSeleccionado(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm outline-none w-1/3"
                                >
                                    <option value="pei">Doc. PEI</option>
                                    <option value="rice">Doc. RICE</option>
                                    <option value="general">General</option>
                                </select>
                                <label className={`flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 border-dashed rounded-xl px-4 py-2 cursor-pointer transition-colors ${uploading ? 'opacity-50' : ''}`}>
                                    {uploading ? <Loader2 size={18} className="animate-spin text-slate-400" /> : <Upload size={18} className="text-slate-400" />}
                                    <span className="text-sm text-slate-600 font-bold">{uploading ? "Procesando..." : "Subir PDF"}</span>
                                    <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-slate-800 font-bold text-sm mb-2">Documentos Activos ({docs.length})</h3>
                            {loadingDocs ? (
                                <div className="space-y-2 animate-pulse">
                                    {[1, 2].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
                                </div>
                            ) : docs.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <FileText size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-slate-800 text-sm font-bold truncate max-w-[200px]">{doc.filename}</p>
                                            <p className="text-[10px] text-slate-400">{doc.tipo_documento}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteDoc(doc.filename)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);

    const [newSchoolName, setNewSchoolName] = useState("");
    const [newSchoolSlug, setNewSchoolSlug] = useState("");
    const [newSchoolMaxUsers, setNewSchoolMaxUsers] = useState(10);
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);

    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteSchoolId, setInviteSchoolId] = useState("");
    const [inviteRole, setInviteRole] = useState("teacher");
    const [isInviting, setIsInviting] = useState(false);

    const [editingSchool, setEditingSchool] = useState<School | null>(null);

    const [unassignedUsers, setUnassignedUsers] = useState<UserProfile[]>([]);
    const [loadingUnassigned, setLoadingUnassigned] = useState(false);
    const [assigningMap, setAssigningMap] = useState<Record<string, boolean>>({});
    const [schoolSelectionMap, setSchoolSelectionMap] = useState<Record<string, string>>({});

    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        fetchSchools();
        fetchUnassignedUsers();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${BE_URL}/admin/stats`, {
                headers: { "Authorization": `Bearer ${session.access_token}` }
            });
            if (response.ok) setStats(await response.json());
        } catch (err) {
            console.error("Error fetching stats", err);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchSchools = async () => {
        try {
            const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setSchools(data || []);
            if (data && data.length > 0 && !inviteSchoolId) setInviteSchoolId(data[0].id);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassignedUsers = async () => {
        setLoadingUnassigned(true);
        try {
            const { data, error } = await supabase.from('profiles').select('id, email, full_name').is('school_id', null).order('email', { ascending: true });
            if (error) throw error;
            setUnassignedUsers(data || []);
            const { data: schoolData } = await supabase.from('schools').select('id').limit(1);
            if (schoolData?.[0]) {
                const defaults: Record<string, string> = {};
                (data || []).forEach((u: any) => { defaults[u.id] = schoolData[0].id; });
                setSchoolSelectionMap(prev => ({ ...defaults, ...prev }));
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingUnassigned(false);
        }
    };

    const handleAssignSchool = async (userId: string) => {
        const selectedSchoolId = schoolSelectionMap[userId];
        if (!selectedSchoolId) return;
        setAssigningMap(prev => ({ ...prev, [userId]: true }));
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${BE_URL}/admin/profile-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                body: JSON.stringify({ profile_id: userId, school_id: selectedSchoolId, individual_plan_active: false })
            });
            if (!response.ok) throw new Error("Error en el servidor");
            toast.success("Usuario asignado ✓");
            setUnassignedUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setAssigningMap(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingSchool(true);
        try {
            const { error } = await supabase.from('schools').insert({ name: newSchoolName, slug: newSchoolSlug.toLowerCase(), max_users: newSchoolMaxUsers, status: 'active', subscription_plan: 'pro' });
            if (error) throw error;
            toast.success("Colegio creado ✓");
            setNewSchoolName(""); setNewSchoolSlug(""); fetchSchools();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsCreatingSchool(false);
        }
    };

    const handleUpdateSchoolPlan = async (schoolId: string, newPlan: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${BE_URL}/admin/school-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                body: JSON.stringify({ school_id: schoolId, subscription_plan: newPlan })
            });
            if (!response.ok) throw new Error("Error al actualizar");
            toast.success("Plan actualizado ✓");
            fetchSchools();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const isIndividual = inviteSchoolId === "independiente";
            const response = await fetch(`${BE_URL}/admin/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                body: JSON.stringify({ email: inviteEmail, school_id: isIndividual ? null : inviteSchoolId, role: inviteRole, individual_plan_active: isIndividual })
            });
            if (!response.ok) throw new Error("Error al invitar");
            toast.success("Invitación enviada ✓");
            setInviteEmail("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsInviting(false);
        }
    };

    if (loading) return <div className="animate-pulse bg-slate-100 h-96 rounded-3xl" />;

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 p-8 pt-0 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">SaaS Backoffice</h1>
                    <p className="text-slate-500 mt-1">Control maestro de la plataforma ProfeIC.</p>
                </div>
                <button onClick={fetchStats} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all shadow-sm">
                    <Zap size={14} className="text-amber-500" /> Refrescar Analytics
                </button>
            </header>

            <Tabs defaultValue="metricas" className="w-full">
                <TabsList className="bg-slate-200/50 p-1 rounded-xl mb-8">
                    <TabsTrigger value="metricas" className="rounded-lg px-8 py-2 text-xs font-bold uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-[#1B3C73] data-[state=active]:shadow-sm">Métricas Globales</TabsTrigger>
                    <TabsTrigger value="colegios" className="rounded-lg px-8 py-2 text-xs font-bold uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-[#1B3C73] data-[state=active]:shadow-sm">Gestión de Colegios</TabsTrigger>
                    <TabsTrigger value="usuarios" className="rounded-lg px-8 py-2 text-xs font-bold uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-[#1B3C73] data-[state=active]:shadow-sm">Usuarios y Accesos</TabsTrigger>
                </TabsList>

                {/* --- TAB: MÉTRICAS --- */}
                <TabsContent value="metricas" className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-[#1B3C73]/30 transition-colors">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Clock size={80} /></div>
                             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Horas Ahorradas</p>
                             <h3 className="text-3xl font-black text-slate-800">{stats?.summary?.saved_hours || 0}h</h3>
                             <p className="text-amber-600 text-[10px] mt-2 font-bold flex items-center gap-1"><Sparkles size={12} /> Impacto real</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-[#1B3C73]/30 transition-colors">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Users size={80} /></div>
                             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Adopción ProfeIC</p>
                             <h3 className="text-3xl font-black text-slate-800">{stats?.summary?.adoption_percent || 0}%</h3>
                             <p className="text-slate-500 text-[10px] mt-2 font-bold flex items-center gap-1"><UserCheck size={12} /> {stats?.summary?.active_users || 0} activos</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-[#1B3C73]/30 transition-colors">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><AlertTriangle size={80} /></div>
                             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Fricción IA</p>
                             <h3 className="text-3xl font-black text-slate-800">{stats?.summary?.friction_count || 0}</h3>
                             <p className="text-orange-500 text-[10px] mt-2 font-bold flex items-center gap-1"><Zap size={12} /> Regeneraciones</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:border-[#1B3C73]/30 transition-colors">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={80} /></div>
                             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Eventos Totales</p>
                             <h3 className="text-3xl font-black text-slate-800">{stats?.summary?.total_events || 0}</h3>
                             <p className="text-indigo-500 text-[10px] mt-2 font-bold flex items-center gap-1"><Activity size={12} /> Interactions</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6"><Trophy size={18} className="text-indigo-500" /> Power Users</h2>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {stats?.power_users?.map((u: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                                            <div className="min-w-0"><p className="text-xs font-bold text-slate-800 truncate">{u.name}</p><p className="text-[10px] text-slate-500">{u.email}</p></div>
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg">{u.count} Ops</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6"><Building size={18} className="text-teal-500" /> Distribución Escolar</h2>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {stats?.school_stats?.map((s: any, i: number) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-[11px] font-bold"><span className="text-slate-700">{s.name}</span><span className="text-slate-400">{s.count} users</span></div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500" style={{ width: `${(s.count / (stats?.summary?.active_users || 1)) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                         <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6"><Activity size={18} className="text-rose-500" /> Registro de Actividad</h2>
                         <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                             {stats?.recent_events?.map((ev: any, i: number) => (
                                 <div key={i} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded-lg">
                                     <div className="flex items-center gap-3">
                                         <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
                                         <div>
                                             <p className="text-[11px] font-bold text-slate-800">{ev.event_name.replace(/_/g, ' ')} <span className="text-slate-400 font-normal ml-1">por {ev.email}</span></p>
                                             <p className="text-[9px] text-slate-400">{ev.module?.split('/').pop() || 'Core'}</p>
                                         </div>
                                     </div>
                                     <span className="text-[9px] font-mono text-slate-400">{new Date(ev.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                </TabsContent>

                {/* --- TAB: COLEGIOS --- */}
                <TabsContent value="colegios" className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6"><Plus size={18} className="text-teal-600" /> Registrar Institución</h2>
                        <form onSubmit={handleCreateSchool} className="flex flex-col md:flex-row gap-4">
                            <input type="text" placeholder="Nombre Colegio" value={newSchoolName} onChange={e => setNewSchoolName(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B3C73] outline-none" required />
                            <input type="text" placeholder="Slug" value={newSchoolSlug} onChange={e => setNewSchoolSlug(e.target.value)} className="md:w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B3C73] outline-none" required />
                            <input type="number" placeholder="Cupos" value={newSchoolMaxUsers} onChange={e => setNewSchoolMaxUsers(Number(e.target.value))} className="md:w-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1B3C73] outline-none" required min="1" />
                            <button type="submit" disabled={isCreatingSchool} className="bg-[#1B3C73] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#132c54] transition-colors disabled:opacity-50">
                                {isCreatingSchool ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear"}
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">Instituciones Activas ({schools.length})</h3>
                             <div className="space-y-4">
                                 {schools.map(school => (
                                     <div key={school.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                         <div className="flex justify-between items-start">
                                             <div className="space-y-2">
                                                 <div className="flex items-center gap-2">
                                                     <h4 className="font-bold text-slate-800">{school.name}</h4>
                                                     <Badge className={school.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'} variant="outline">{school.status}</Badge>
                                                 </div>
                                                 <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                     <span className="flex items-center gap-1"><Users size={10} /> {school.max_users} Cupos</span>
                                                     <span className="flex items-center gap-1">Plan: {school.subscription_plan}</span>
                                                 </div>
                                                 {school.sello_institucional ? 
                                                     <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 font-bold border border-teal-100">✓ Perfil IA Activo</span> : 
                                                     <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold border border-amber-100">⚠ Perfil IA Pendiente</span>
                                                 }
                                             </div>
                                             <div className="flex flex-col items-end gap-2">
                                                 <select value={school.subscription_plan} onChange={e => handleUpdateSchoolPlan(school.id, e.target.value)} className="text-[10px] bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-[#1B3C73] font-bold">
                                                     <option value="trial">Trial</option>
                                                     <option value="pro">Pro (360°)</option>
                                                     <option value="enterprise">Enterprise</option>
                                                 </select>
                                                 <button onClick={() => setEditingSchool(school)} className="text-[10px] font-bold text-teal-600 hover:underline flex items-center gap-1"><Pencil size={10} /> Configurar IA</button>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit">
                             <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-6"><BarChart3 size={18} className="text-amber-500" /> Módulos Populares</h3>
                             <div className="space-y-5">
                                 {stats?.top_modules?.map((m: any, i: number) => (
                                     <div key={i}>
                                         <div className="flex justify-between text-[11px] mb-1.5"><span className="text-slate-600 font-medium">{m.name}</span><span className="text-slate-900 font-black">{m.val}</span></div>
                                         <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                             <div className="h-full bg-amber-500" style={{ width: `${Math.min((m.val / (stats?.summary?.total_resources || 1)) * 100, 100)}%` }} />
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- TAB: USUARIOS --- */}
                <TabsContent value="usuarios" className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* INVITE FORM */}
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2"><Mail size={18} className="text-[#C87533]" /> Acceso Maestro</h2>
                            <p className="text-xs text-slate-400 mb-8 border-b border-slate-50 pb-4">Genera enlaces de invitación (Magic Links) con rol pre-definido.</p>
                            <form onSubmit={handleInviteUser} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Institución / Destino</label>
                                    <select value={inviteSchoolId} onChange={e => setInviteSchoolId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#1B3C73] outline-none">
                                        <option value="independiente">👤 Profesor Independiente</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>🏫 {s.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rol</label>
                                         <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#1B3C73] outline-none">
                                             <option value="teacher">Profesor</option>
                                             <option value="utp">Coordinador UTP</option>
                                             <option value="director">Director</option>
                                             <option value="admin">Súper Admin</option>
                                         </select>
                                    </div>
                                    <div className="space-y-1.5">
                                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                         <input type="email" placeholder="hola@docente.cl" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#1B3C73] outline-none" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={isInviting} className="w-full bg-[#1B3C73] text-white py-4 rounded-xl font-bold shadow-md hover:bg-[#132c54] transition-all flex items-center justify-center gap-2">
                                    {isInviting ? <Loader2 className="animate-spin" /> : <><span>Enviar Invitación</span><ArrowRight size={18} /></>}
                                </button>
                            </form>
                        </div>

                        {/* UNASSIGNED USERS LIST */}
                        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><UserX size={18} className="text-amber-500" /> Pendientes de Asignación</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Usuarios sin school_id registrado</p>
                                </div>
                                <button onClick={fetchUnassignedUsers} className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"><RefreshCw size={14} className={loadingUnassigned ? "animate-spin" : ""} /></button>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {unassignedUsers.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                        <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2 opacity-30" />
                                        <p className="text-xs text-slate-400 font-medium tracking-tight">¡Todo el padrón está asignado!</p>
                                    </div>
                                ) : unassignedUsers.map(u => (
                                    <div key={u.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 shadow-sm">
                                        <div className="flex justify-between items-center"><p className="text-xs font-black text-slate-800 truncate">{u.email}</p><span className="text-[10px] text-slate-400 font-mono italic">#{u.id.substring(0,6)}</span></div>
                                        <div className="flex gap-2">
                                            <select value={schoolSelectionMap[u.id] || ""} onChange={e => setSchoolSelectionMap(prev => ({ ...prev, [u.id]: e.target.value }))} className="flex-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 outline-none">
                                                <option value="" disabled>Elegir colegio...</option>
                                                {schools.map(s => <option key={s.id} value={s.id}>🏫 {s.name}</option>)}
                                            </select>
                                            <button onClick={() => handleAssignSchool(u.id)} disabled={assigningMap[u.id] || !schoolSelectionMap[u.id]} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-amber-600 transition-colors">
                                                {assigningMap[u.id] ? <Loader2 size={14} className="animate-spin" /> : "Vincular"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {editingSchool && <SchoolEditModal school={editingSchool} onClose={() => setEditingSchool(null)} onSaved={fetchSchools} />}
            </div>
        </div>
    );
}
