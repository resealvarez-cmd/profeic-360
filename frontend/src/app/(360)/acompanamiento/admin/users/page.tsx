"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Mail, Shield, ShieldAlert, User, CheckCircle, XCircle, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        full_name: '',
        role: 'teacher',
        age: '',
        department: '',
        years_experience: ''
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            (user.full_name && user.full_name.toLowerCase().includes(term)) ||
            (user.email && user.email.toLowerCase().includes(term))
        );
    });

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email === 're.se.alvarez@gmail.com') {
                setIsAuthorized(true);
                fetchUsers();
            } else {
                setLoading(false); // Unauthorized
            }
        };
        checkAuth();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // 1. Fetch Authorized Users (Whitelist + Roles)
            const { data: authorizedData, error: authError } = await supabase
                .from('authorized_users')
                .select('*')
                .order('created_at', { ascending: false });

            if (authError) throw authError;

            // 2. Fetch Actual Profiles (Registered Users)
            const { data: profilesData, error: profError } = await supabase
                .from('profiles')
                .select('*');

            if (profError) throw profError;

            // 3. Merge Logic
            const mergedMap = new Map();

            // First add Authorized Users (Source of Role Truth)
            authorizedData?.forEach(u => {
                mergedMap.set(u.email.toLowerCase(), {
                    ...u,
                    source: 'authorized',
                    status: u.status // 'active', 'suspended', 'pending'
                });
            });

            // Then merge/add Profiles (Source of Existence)
            profilesData?.forEach(p => {
                const email = p.email?.toLowerCase();
                if (!email) return;

                if (mergedMap.has(email)) {
                    // User is authorized AND registered -> Confirm 'active' status and update name if needed
                    const existing = mergedMap.get(email);
                    mergedMap.set(email, {
                        ...existing,
                        full_name: p.full_name || existing.full_name, // Prefer profile name
                        avatar_url: p.avatar_url,
                        source: 'both',
                        status: 'active' // If they have a profile, they are active
                    });
                } else {
                    // User is registered but NOT in authorized list (Early Adopters / Guests)
                    mergedMap.set(email, {
                        email: email,
                        full_name: p.full_name || "Usuario Registrado",
                        role: 'teacher', // Default for unlisted users
                        status: 'unverified', // Flag for admin to see they are not in whitelist
                        avatar_url: p.avatar_url,
                        created_at: p.updated_at,
                        source: 'profile'
                    });
                }
            });

            const mergedList = Array.from(mergedMap.values());
            // Sort: Pending/Unverified first, then by name
            mergedList.sort((a, b) => {
                if (a.status === 'unverified' && b.status !== 'unverified') return -1;
                if (a.status !== 'unverified' && b.status === 'unverified') return 1;
                return a.full_name.localeCompare(b.full_name);
            });

            setUsers(mergedList);

        } catch (error: any) {
            console.error("Error fetching users:", error);
            alert("Error cargando usuarios: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (e: any) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            if (editingUser) {
                // UPDATE LOGIC
                const { error } = await supabase
                    .from('authorized_users')
                    .update({
                        full_name: newUser.full_name,
                        role: newUser.role
                    })
                    .eq('email', newUser.email);

                if (error) throw error;
                if (error) throw error;

                // UPDATE PROFILES (Enrichment)
                if (editingUser.id) {
                    await supabase
                        .from('profiles')
                        .update({
                            age: newUser.age ? parseInt(newUser.age) : null,
                            department: newUser.department,
                            years_experience: newUser.years_experience ? parseInt(newUser.years_experience) : null,
                            full_name: newUser.full_name
                        })
                        .eq('id', editingUser.id);
                }

                alert("Usuario actualizado correctamente.");
            } else {
                // CREATE LOGIC
                // Check if user exists
                const { data: existing } = await supabase
                    .from('authorized_users')
                    .select('email')
                    .eq('email', newUser.email)
                    .single();

                if (existing) {
                    alert("Este correo ya está registrado en el sistema.");
                    setActionLoading(false);
                    return;
                }

                const { error } = await supabase
                    .from('authorized_users')
                    .insert([{
                        email: newUser.email,
                        full_name: newUser.full_name,
                        role: newUser.role,
                        status: 'pending'
                    }]);

                if (error) throw error;
                alert(`Usuario ${newUser.full_name} pre-autorizado.`);
            }

            setShowModal(false);
            setEditingUser(null);
            setNewUser({ email: '', full_name: '', role: 'teacher', age: '', department: '', years_experience: '' });
            fetchUsers();

        } catch (error: any) {
            console.error("Error saving user:", error);
            alert("Error: " + error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (email: string) => {
        if (!confirm("¿Seguro que deseas eliminar este usuario? Quitará su acceso.")) return;

        try {
            const { error } = await supabase.from('authorized_users').delete().eq('email', email);
            if (error) throw error;
            setUsers(users.filter(u => u.email !== email));
        } catch (error: any) {
            alert("Error al eliminar: " + error.message);
        }
    };

    const openEditModal = (user: any) => {
        setEditingUser(user);
        setNewUser({
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            age: user.age || '',
            department: user.department || '',
            years_experience: user.years_experience || ''
        });
        setShowModal(true);
    };

    const openNewUserModal = () => {
        setEditingUser(null);
        setNewUser({ email: '', full_name: '', role: 'teacher', age: '', department: '', years_experience: '' });
        setShowModal(true);
    };

    if (!isAuthorized && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
                <ShieldAlert size={64} className="mb-4 text-red-500" />
                <h2 className="text-2xl font-bold text-[#1a2e3b]">Acceso Denegado</h2>
                <p>Esta área está restringida exclusivamente al Super Administrador.</p>
            </div>
        );
    }

    return (
        <div className="font-sans text-[#1a2e3b]">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e3b] flex items-center gap-3">
                        <Shield className="text-[#f2ae60]" /> Gestión de Usuarios
                    </h1>
                    <p className="text-slate-500">Control de Acceso y Roles del Ecosistema</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#f2ae60] transition-all w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={openNewUserModal}
                        className="bg-[#1a2e3b] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#2b546e] shadow-lg shadow-blue-900/20 font-bold transition-transform active:scale-95"
                    >
                        <Plus size={20} /> Nuevo Usuario
                    </button>
                </div>
            </header>

            {/* TABLA DE USUARIOS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                        <tr>
                            <th className="p-6">Usuario</th>
                            <th className="p-6">Rol</th>
                            <th className="p-6">Estado</th>
                            <th className="p-6 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={4} className="p-10 text-center text-slate-400">No se encontraron usuarios.</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.email} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#1a2e3b]">
                                                {user.full_name ? user.full_name[0] : <User size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1a2e3b]">{user.full_name || "Sin nombre"}</p>
                                                <p className="text-sm text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' :
                                            user.role === 'director' || user.role === 'utp' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {user.role || 'teacher'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className={`flex items-center gap-2 font-medium text-sm ${user.status === 'active' ? 'text-green-600' :
                                            user.status === 'unverified' ? 'text-amber-500' :
                                                'text-slate-400'
                                            }`}>
                                            {user.status === 'active' ? <CheckCircle size={16} /> :
                                                user.status === 'unverified' ? <ShieldAlert size={16} /> :
                                                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>}

                                            {user.status === 'active' ? 'Activo' :
                                                user.status === 'unverified' ? 'No Listado' :
                                                    user.status === 'pending' ? 'Pendiente' :
                                                        user.status === 'suspended' ? 'Suspendido' : user.status}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar Usuario"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.email)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Usuario"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL (ADD / EDIT) */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <XCircle size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-[#1a2e3b] mb-1">
                            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                        </h2>
                        <p className="text-slate-400 text-sm mb-6">
                            {editingUser ? "Modifica los permisos y datos del usuario." : "Registra un nuevo miembro en la plataforma."}
                        </p>

                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#f2ae60] transition-all"
                                    placeholder="Ej: Juan Pérez"
                                    value={newUser.full_name}
                                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Institucional</label>
                                <input
                                    type="email"
                                    required
                                    disabled={!!editingUser} // Disable email edit
                                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#f2ae60] transition-all ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder="nombre@colegio.cl"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol Asignado</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#f2ae60] transition-all"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="teacher">Docente (Aula)</option>
                                    <option value="director">Director / Gestión</option>
                                    <option value="utp">Coord. UTP</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Edad</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#f2ae60] transition-all"
                                        placeholder="Ej: 35"
                                        value={newUser.age}
                                        onChange={e => setNewUser({ ...newUser, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Años Exp.</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#f2ae60] transition-all"
                                        placeholder="Ej: 10"
                                        value={newUser.years_experience}
                                        onChange={e => setNewUser({ ...newUser, years_experience: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departamento / Asignatura</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#f2ae60] transition-all"
                                    value={newUser.department}
                                    onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Matemática">Matemática</option>
                                    <option value="Lenguaje">Lenguaje</option>
                                    <option value="Historia">Historia</option>
                                    <option value="Ciencias">Ciencias</option>
                                    <option value="Inglés">Inglés</option>
                                    <option value="Artes/Música">Artes / Música</option>
                                    <option value="Educación Física">Educación Física</option>
                                    <option value="Primer Ciclo">Primer Ciclo</option>
                                    <option value="Pre-Básica">Pre-Básica</option>
                                    <option value="PIE">PIE / Orientación</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="w-full py-4 bg-[#1a2e3b] text-white font-bold rounded-xl shadow-lg hover:bg-[#2b546e] transition-all mt-4 disabled:opacity-50"
                            >
                                {actionLoading ? "Guardando..." : (editingUser ? "Guardar Cambios" : "Crear Usuario")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
