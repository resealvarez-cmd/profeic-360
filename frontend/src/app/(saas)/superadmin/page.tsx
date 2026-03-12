"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Plus, Users, Building, Mail, Loader2, ArrowRight, Pencil, X, Save, MapPin, BookOpen, Sparkles, Upload, FileText, Trash2, File as FileIcon, UserX, CheckCircle, TrendingUp, Clock, UserCheck, BarChart3, Zap, Trophy } from "lucide-react";

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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/20 rounded-xl text-teal-400">
                            <Building size={22} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-tight">{school.name}</h2>
                            <p className="text-slate-400 text-xs">Perfil Institucional para la IA</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* --- TABS --- */}
                <div className="flex border-b border-slate-700 px-6 mt-4 gap-6">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "profile" ? "border-teal-400 text-teal-400" : "border-transparent text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        📝 Perfil Texto
                    </button>
                    <button
                        onClick={() => setActiveTab("docs")}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === "docs" ? "border-teal-400 text-teal-400" : "border-transparent text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        📚 Contexto Base de Conocimientos (RAG)
                    </button>
                </div>

                {activeTab === "profile" ? (
                    <>
                        {/* Info banner */}
                        <div className="mx-6 mt-5 p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl flex gap-2">
                            <Sparkles size={14} className="text-teal-400 shrink-0 mt-0.5" />
                            <p className="text-teal-300 text-xs leading-relaxed">
                                Esta información se inyecta automáticamente en todos los prompts de IA de los profesores de este colegio. Completa todos los campos para mejores resultados.
                            </p>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-5">
                            {/* Ubicación */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <MapPin size={12} /> Ubicación
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Ciudad (ej: Chiguayante)"
                                        value={form.city}
                                        onChange={e => setForm({ ...form, city: e.target.value })}
                                        className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Región (ej: Biobío)"
                                        value={form.region}
                                        onChange={e => setForm({ ...form, region: e.target.value })}
                                        className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Sello */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <Sparkles size={12} /> Sello Institucional
                                </label>
                                <input
                                    type="text"
                                    placeholder="ej: Humanista-Cristiano con Excelencia Académica"
                                    value={form.sello_institucional}
                                    onChange={e => setForm({ ...form, sello_institucional: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                                <p className="text-slate-500 text-xs mt-1.5">Frase corta que identifica la identidad del colegio.</p>
                            </div>

                            {/* Valores */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    ✨ Valores Institucionales
                                </label>
                                <input
                                    type="text"
                                    placeholder="ej: Respeto, Fe, Servicio, Excelencia, Alegría"
                                    value={form.valores}
                                    onChange={e => setForm({ ...form, valores: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                                <p className="text-slate-500 text-xs mt-1.5">Separados por coma. Se incluyen en los recursos pedagógicos.</p>
                            </div>

                            {/* PEI / Proyecto Educativo */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    <BookOpen size={12} /> Proyecto Educativo Institucional (PEI)
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="Descripción breve del PEI o misión del colegio."
                                    value={form.proyecto_educativo}
                                    onChange={e => setForm({ ...form, proyecto_educativo: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                />
                                <p className="text-slate-500 text-xs mt-1.5">La IA usará esto para alinear el contenido pedagógico con la identidad del colegio. Máximo 3-4 frases.</p>
                            </div>
                        </div>

                        {/* Footer Profile */}
                        <div className="flex justify-end gap-3 px-6 pb-6">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-600 transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-sm hover:bg-teal-400 transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Guardar Perfil Texto
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* DOCS TAB */}
                        <div className="p-6 space-y-6">
                            <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
                                <h3 className="text-white font-bold text-sm mb-3">Subir Nuevo Documento (PDF)</h3>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={tipoDocSeleccionado}
                                        onChange={(e) => setTipoDocSeleccionado(e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm outline-none w-1/3"
                                    >
                                        <option value="pei">Doc. PEI (Institucional)</option>
                                        <option value="rice">Doc. RICE (Convivencia)</option>
                                        <option value="reglamento_evaluacion">Reglamento Evaluación</option>
                                        <option value="general">Otro / General</option>
                                    </select>

                                    <label className={`flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 border-dashed rounded-xl px-4 py-2 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {uploading ? <Loader2 size={18} className="text-slate-300 animate-spin" /> : <Upload size={18} className="text-slate-300" />}
                                        <span className="text-sm text-slate-200 font-bold">
                                            {uploading ? "Procesando Vectorización (RAG)..." : "Seleccionar y Vectorizar PDF"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                <p className="text-slate-500 text-[11px] mt-3">
                                    Los PDFs subidos aquí serán fragmentados (chunking) y convertidos a vectores. El Mentor y otros asistentes de IA leerán esta base de conocimientos cuando un profesor de {school.name} haga preguntas relacionadas (RAG).
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-white font-bold text-sm mb-2">Base de Conocimientos Activa ({docs.length})</h3>
                                {loadingDocs ? (
                                    <div className="animate-pulse space-y-2">
                                        {[1, 2].map(i => <div key={i} className="h-14 bg-slate-800 rounded-xl" />)}
                                    </div>
                                ) : docs.length === 0 ? (
                                    <div className="text-center py-6 bg-slate-800/30 rounded-xl border border-slate-700/50 border-dashed">
                                        <FileIcon className="mx-auto text-slate-600 mb-2" size={32} />
                                        <p className="text-slate-400 text-sm">No hay documentos vectorizados aún.</p>
                                    </div>
                                ) : (
                                    docs.map((doc, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-bold truncate max-w-[200px] sm:max-w-xs">{doc.filename}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                                            TIPO: {doc.tipo_documento}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500">
                                                            {doc.chunks} fragmentos (chunks) embebidos
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteDoc(doc.filename)}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Eliminar documento del modelo RAG"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newSchoolName, setNewSchoolName] = useState("");
    const [newSchoolSlug, setNewSchoolSlug] = useState("");
    const [newSchoolMaxUsers, setNewSchoolMaxUsers] = useState(10);
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);

    // Invite states
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteSchoolId, setInviteSchoolId] = useState("");
    const [inviteRole, setInviteRole] = useState("teacher");
    const [isInviting, setIsInviting] = useState(false);

    // Edit modal
    const [editingSchool, setEditingSchool] = useState<School | null>(null);

    // Unassigned users
    const [unassignedUsers, setUnassignedUsers] = useState<UserProfile[]>([]);
    const [loadingUnassigned, setLoadingUnassigned] = useState(false);
    const [assigningMap, setAssigningMap] = useState<Record<string, boolean>>({});
    const [schoolSelectionMap, setSchoolSelectionMap] = useState<Record<string, string>>({});

    // Stats state
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

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                const errData = await response.json().catch(() => ({ detail: "Error desconocido" }));
                console.error("Stats error response:", response.status, errData);
                toast.error(`Error ${response.status}: ${errData.detail || 'Fallo al cargar stats'}`);
            }
        } catch (err: any) {
            console.error("Error fetching stats", err);
            toast.error("Error de conexión: " + err.message);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchSchools = async () => {
        try {
            const { data, error } = await supabase
                .from('schools')
                .select('id, name, slug, status, subscription_plan, max_users, city, region, sello_institucional, valores, proyecto_educativo')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSchools(data || []);

            if (data && data.length > 0 && !inviteSchoolId) {
                setInviteSchoolId(data[0].id);
            }
        } catch (error: any) {
            toast.error("Error al cargar colegios: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassignedUsers = async () => {
        setLoadingUnassigned(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, email, full_name')
                .is('school_id', null)
                .order('email', { ascending: true });

            if (error) throw error;
            setUnassignedUsers(data || []);

            // Pre-populate selection map with first school
            const { data: schoolData } = await supabase.from('schools').select('id').limit(1);
            if (schoolData && schoolData.length > 0) {
                const defaults: Record<string, string> = {};
                (data || []).forEach((u: UserProfile) => { defaults[u.id] = schoolData[0].id; });
                setSchoolSelectionMap(prev => ({ ...defaults, ...prev }));
            }
        } catch (err: any) {
            toast.error("Error cargando usuarios sin colegio: " + err.message);
        } finally {
            setLoadingUnassigned(false);
        }
    };

    const handleAssignSchool = async (userId: string) => {
        const selectedSchoolId = schoolSelectionMap[userId];
        if (!selectedSchoolId) { toast.error("Selecciona un colegio primero"); return; }

        setAssigningMap(prev => ({ ...prev, [userId]: true }));
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No hay sesión activa");

            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${BE_URL}/admin/profile-plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    profile_id: userId,
                    school_id: selectedSchoolId,
                    individual_plan_active: false
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Error en el servidor");
            }

            const school = schools.find(s => s.id === selectedSchoolId);
            toast.success(`Usuario asignado a ${school?.name || 'colegio'} ✓`);
            // Remove from list optimistically
            setUnassignedUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err: any) {
            toast.error("Error al asignar: " + err.message);
        } finally {
            setAssigningMap(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchoolName || !newSchoolSlug) return;
        setIsCreatingSchool(true);

        try {
            const { error } = await supabase
                .from('schools')
                .insert({
                    name: newSchoolName,
                    slug: newSchoolSlug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    max_users: newSchoolMaxUsers,
                    status: 'active',
                    subscription_plan: 'pro'
                });

            if (error) throw error;

            toast.success("Colegio creado exitosamente");
            setNewSchoolName("");
            setNewSchoolSlug("");
            fetchSchools();
        } catch (error: any) {
            toast.error("Error al crear colegio: " + error.message);
        } finally {
            setIsCreatingSchool(false);
        }
    };

    const handleUpdateSchoolPlan = async (schoolId: string, newPlan: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No hay sesión activa");

            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${BE_URL}/admin/school-plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    school_id: schoolId,
                    subscription_plan: newPlan
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Error al actualizar plan");
            }

            toast.success("Plan actualizado. Aplicando cambios...");
            await fetchSchools();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !inviteSchoolId) return;
        setIsInviting(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No hay sesión activa");

            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const isIndividual = inviteSchoolId === "independiente";

            const response = await fetch(`${BE_URL}/admin/invite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    school_id: isIndividual ? null : inviteSchoolId,
                    role: inviteRole,
                    individual_plan_active: isIndividual
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Error en el servidor al invitar");
            }

            toast.success(`Invitación enviada a ${inviteEmail}`);
            setInviteEmail("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsInviting(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse w-full h-64 bg-slate-800 rounded-xl"></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">SaaS Backoffice</h1>
                    <p className="text-slate-400 mt-2">Gestiona múltiples colegios (tenants) y conoce el impacto de la plataforma.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-all border border-slate-700"
                >
                    <Zap size={14} className="text-amber-400" /> Refrescar Estadísticas
                </button>
            </header>

            {/* --- STATS SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Adopción ProfeIC</p>
                    <h3 className="text-3xl font-black text-white">{stats?.summary?.adoption_percent || 0}%</h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
                        <Users size={12} /> {stats?.summary?.active_users || 0} de {stats?.summary?.total_authorized || 0} usuarios activos
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock size={80} />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Horas Ahorradas</p>
                    <h3 className="text-3xl font-black text-white">{stats?.summary?.saved_hours || 0}h</h3>
                    <p className="text-slate-500 text-[10px] mt-2 font-bold flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-400" /> Basado en productividad real
                    </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <UserCheck size={80} />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Impacto Real</p>
                    <h3 className="text-3xl font-black text-white">{stats?.summary?.total_resources || 0}</h3>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
                        <BookOpen size={12} /> Recursos generados y guardados
                    </div>
                </div>

                <div className="lg:col-span-1 bg-slate-800 border border-slate-700 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/20 text-indigo-500 rounded-xl">
                            <Trophy size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Top Actividad (10)</h2>
                    </div>
                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats?.power_users?.map((user: any, i: number) => (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${i === 0 ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900'}`}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i === 0 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-[11px] font-bold text-slate-200 truncate">{user.name}</p>
                                        <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-indigo-400 whitespace-nowrap ml-2">
                                    {user.count} <span className="opacity-50 font-medium">acciones</span>
                                </span>
                            </div>
                        ))}
                        {(!stats?.power_users || stats.power_users.length === 0) && (
                            <p className="text-center text-slate-600 py-8 text-xs italic">Cargando actividad...</p>
                        )}
                    </div>
                </div>

                {/* School Distribution */}
                <div className="lg:col-span-1 bg-slate-800 border border-slate-700 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
                            <Building size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Distribución por Colegio</h2>
                    </div>
                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats?.school_stats?.map((school: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-900/40 border border-slate-700/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-bold text-slate-200 truncate pr-2">{school.name}</span>
                                    <span className="text-[10px] font-black text-white px-2 py-0.5 bg-slate-800 rounded-lg border border-slate-700">
                                        {school.count} <span className="text-slate-500 font-medium">users</span>
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.3)] transition-all duration-1000"
                                        style={{ width: `${(school.count / (stats?.summary?.active_users || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.school_stats || stats.school_stats.length === 0) && (
                            <p className="text-center text-slate-600 py-8 text-xs italic">Cargando distribución...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TOP MODULES & RECENT EVENTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-slate-800 border border-slate-700 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
                            <BarChart3 size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Módulos más Populares</h2>
                    </div>
                    <div className="space-y-4">
                        {stats?.top_modules?.map((mod: any, i: number) => (
                            <div key={i} className="group">
                                <div className="flex items-center justify-between mb-1.5 px-1">
                                    <span className="text-xs font-bold text-slate-300">{mod.name}</span>
                                    <span className="text-xs font-black text-white">{mod.val}</span>
                                </div>
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000"
                                        style={{ width: `${Math.min((mod.val / (stats?.summary?.total_resources || 1)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-teal-500/20 text-teal-500 rounded-xl">
                            <Zap size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-white">Eventos Real-Time (Engagement)</h2>
                    </div>
                    <div className="space-y-3">
                        {stats?.recent_events?.map((ev: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-2xl hover:bg-slate-900 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-teal-400 animate-pulse' : 'bg-slate-600'}`}></div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-bold text-slate-200">
                                            {ev.event_name.replace(/_/g, ' ')}
                                            <span className="text-slate-500 font-normal ml-2">en {ev.module?.split('/').pop() || 'general'}</span>
                                        </p>
                                        <p className="text-[10px] text-slate-500">{ev.email}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-mono text-slate-600">
                                    {new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {
                editingSchool && (
                    <SchoolEditModal
                        school={editingSchool}
                        onClose={() => setEditingSchool(null)}
                        onSaved={fetchSchools}
                    />
                )
            }

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* SCHOOLS MODULE */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#2A59A8]/20 text-[#2A59A8] rounded-lg">
                            <Building size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Administrar Colegios</h2>
                    </div>

                    <form onSubmit={handleCreateSchool} className="flex gap-4 mb-6">
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                placeholder="Nombre (Ej. Colegio Sur)"
                                value={newSchoolName}
                                onChange={(e) => setNewSchoolName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            />
                        </div>
                        <div className="w-32 space-y-2">
                            <input
                                type="text"
                                placeholder="Slug (sur)"
                                value={newSchoolSlug}
                                onChange={(e) => setNewSchoolSlug(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            />
                        </div>
                        <div className="w-24 space-y-2">
                            <input
                                type="number"
                                placeholder="Cupos"
                                value={newSchoolMaxUsers}
                                onChange={(e) => setNewSchoolMaxUsers(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreatingSchool}
                            className="bg-[#C87533] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B36829] transition-colors flex items-center justify-center min-w-[120px]"
                        >
                            {isCreatingSchool ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear"}
                        </button>
                    </form>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {schools.map(school => (
                            <div key={school.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white flex items-center gap-2">
                                            {school.name}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider 
                                                ${school.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {school.status}
                                            </span>
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <select
                                                value={school.subscription_plan}
                                                onChange={(e) => handleUpdateSchoolPlan(school.id, e.target.value)}
                                                className="bg-slate-800 border border-slate-600 outline-none text-xs px-2 py-1 rounded text-slate-300 focus:border-[#C87533] cursor-pointer"
                                            >
                                                <option value="trial">Trial</option>
                                                <option value="basic">Básico</option>
                                                <option value="pro">Pro (360°)</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                            <span className="text-xs text-slate-500">
                                                | Cupos: {school.max_users} | Slug: {school.slug}
                                            </span>
                                        </div>

                                        {/* Indicador de perfil institucional */}
                                        <div className="flex items-center gap-2 mt-2">
                                            {school.sello_institucional ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold">
                                                    ✓ Perfil IA configurado
                                                </span>
                                            ) : (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                                                    ⚠ Sin perfil institutional
                                                </span>
                                            )}
                                            {school.city && (
                                                <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                                                    <MapPin size={9} /> {school.city}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <p className="text-sm font-mono text-slate-400 text-xs">{school.id.substring(0, 8)}...</p>
                                        <button
                                            onClick={() => setEditingSchool(school)}
                                            className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-bold bg-teal-500/10 hover:bg-teal-500/20 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Pencil size={12} /> Editar Perfil IA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INVITE MODULE */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#C87533]/20 text-[#C87533] rounded-lg">
                            <Mail size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Generar Invitación</h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 drop-shadow-md">
                        Las cuentas solo pueden ser creadas enviando un *Magic Link* desde este panel. El usuario será encapsulado automáticamente en el colegio seleccionado.
                    </p>

                    <form onSubmit={handleInviteUser} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Colegio (Tenant) o Independiente</label>
                            <select
                                value={inviteSchoolId}
                                onChange={(e) => setInviteSchoolId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            >
                                <option value="independiente">👤 Profesor Independiente (Suscripción $12k)</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>🏫 {school.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Rol a asignar</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            >
                                <option value="teacher">Profesor (teacher)</option>
                                <option value="director">Director</option>
                                <option value="utp">UTP</option>
                                <option value="admin">Administrador Sistema</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
                            <input
                                type="email"
                                placeholder="nuevo@docente.cl"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isInviting || schools.length === 0}
                            className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            {isInviting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando Invitación Mágica...
                                </>
                            ) : (
                                <>
                                    <span>Enviar e Inscribir</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

            </div>

            {/* ─── USUARIOS SIN COLEGIO ─────────────────────────────────────────────── */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                            <UserX size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Usuarios sin Colegio Asignado</h2>
                            <p className="text-slate-400 text-sm mt-0.5">Perfiles creados en Supabase sin <code className="text-amber-300 bg-amber-500/10 px-1 rounded">school_id</code>. Asígnales un colegio aquí.</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchUnassignedUsers}
                        disabled={loadingUnassigned}
                        className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors"
                    >
                        {loadingUnassigned ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                        Actualizar
                    </button>
                </div>

                {loadingUnassigned ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-700 rounded-xl" />)}
                    </div>
                ) : unassignedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-900/50 rounded-xl border border-slate-700/50 border-dashed gap-3">
                        <CheckCircle size={36} className="text-emerald-500" />
                        <p className="text-slate-400 text-sm font-bold">¡Todos los usuarios tienen colegio asignado!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {unassignedUsers.map(user => (
                            <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-900 border border-slate-700/80 p-4 rounded-xl">
                                {/* User info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {user.full_name && (
                                            <span className="text-slate-400 text-xs">{user.full_name}</span>
                                        )}
                                        {user.role && (
                                            <span className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full font-bold uppercase">{user.role}</span>
                                        )}
                                        <span className="text-[10px] font-mono text-slate-600">{user.id.substring(0, 8)}...</span>
                                    </div>
                                </div>

                                {/* School selector */}
                                <select
                                    value={schoolSelectionMap[user.id] || ""}
                                    onChange={(e) => setSchoolSelectionMap(prev => ({ ...prev, [user.id]: e.target.value }))}
                                    className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm outline-none focus:ring-2 focus:ring-amber-500 min-w-[200px]"
                                >
                                    <option value="" disabled>— Seleccionar colegio —</option>
                                    {schools.map(s => (
                                        <option key={s.id} value={s.id}>🏫 {s.name}</option>
                                    ))}
                                </select>

                                {/* Assign button */}
                                <button
                                    onClick={() => handleAssignSchool(user.id)}
                                    disabled={assigningMap[user.id] || !schoolSelectionMap[user.id]}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {assigningMap[user.id] ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <CheckCircle size={14} />
                                    )}
                                    Asignar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
