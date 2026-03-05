"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Plus, Users, Building, Mail, Loader2, ArrowRight, Pencil, X, Save, MapPin, BookOpen, Sparkles } from "lucide-react";

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

function SchoolEditModal({ school, onClose, onSaved }: { school: School; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState({
        city: school.city || "",
        region: school.region || "",
        sello_institucional: school.sello_institucional || "",
        valores: school.valores || "",
        proyecto_educativo: school.proyecto_educativo || "",
    });
    const [saving, setSaving] = useState(false);

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
                            placeholder="Descripción breve del PEI o misión del colegio. Ejemplo: 'Formar personas íntegras en la fe católica, con excelencia académica y compromiso social, preparadas para los desafíos del siglo XXI...'"
                            value={form.proyecto_educativo}
                            onChange={e => setForm({ ...form, proyecto_educativo: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                        />
                        <p className="text-slate-500 text-xs mt-1.5">La IA usará esto para alinear el contenido pedagógico con la identidad del colegio. Máximo 3-4 frases.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-sm hover:bg-teal-400 transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Guardar Perfil
                    </button>
                </div>
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

    useEffect(() => {
        fetchSchools();
    }, []);

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
            <header>
                <h1 className="text-3xl font-extrabold text-white">SaaS Backoffice</h1>
                <p className="text-slate-400 mt-2">Gestiona múltiples colegios (tenants) y envía invitaciones mágicas.</p>
            </header>

            {/* Edit Modal */}
            {editingSchool && (
                <SchoolEditModal
                    school={editingSchool}
                    onClose={() => setEditingSchool(null)}
                    onSaved={fetchSchools}
                />
            )}

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
        </div>
    );
}
