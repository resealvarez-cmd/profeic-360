"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Save, User, BookOpen, GraduationCap, Sparkles, Brain,
    Lightbulb, Users, Wifi, Tv, Speaker, Monitor, Library, PenTool, Hash, Target, MapPin
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// --- TIPOS DE DATOS ---
interface PedagogicalProfile {
    full_name: string;
    age?: number; // <--- Agregado
    department?: string; // <--- Agregado
    years_experience?: number; // <--- Agregado
    niveles: string[];
    asignaturas: string[];
    es_profesor_jefe: boolean;
    curso_jefatura?: string;
    estilo_ia: "formal" | "cercano" | "socratico";
    estilo_trabajo: string;
    infraestructura: string[];
    infraestructura_otro?: string;
    desafios: string[];
    otro_desafio?: string;
}

// --- OPCIONES ---
const NIVELES = [
    "Sala Cuna", "Nivel Medio", "Pre-Kinder", "Kinder", // Párvulo
    "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico",
    "1° Medio", "2° Medio", "3° Medio", "4° Medio"
];

const ASIGNATURAS_GENERAL = [
    "Lenguaje", "Matemática", "Historia", "Ciencias Naturales",
    "Inglés", "Artes Visuales", "Música", "Tecnología", "Ed. Física", "Religión", "Orientación"
];

const NUCLEOS_PARVULO = [
    "Identidad y Autonomía", "Convivencia y Ciudadanía", "Corporalidad y Movimiento",
    "Lenguaje Verbal", "Lenguajes Artísticos", "Exploración del Entorno Natural",
    "Comprensión del Entorno Sociocultural", "Pensamiento Matemático"
];

const ESTILOS_IA = [
    { id: "formal", label: "Formal", desc: "Académico, técnico y estructurado", icon: GraduationCap },
    { id: "cercano", label: "Cercano", desc: "Empático, motivador y cálido", icon: Sparkles },
    { id: "socratico", label: "Socrático", desc: "Guíame con preguntas, no respuestas", icon: Brain }
];

const ESTILOS_TRABAJO = [
    { id: "silencio", label: "Silencio y Estructura", desc: "Foco individual y concentración profunda.", icon: Brain },
    { id: "caos", label: "Caos Creativo", desc: "Alta participación, ruido productivo y energía.", icon: Lightbulb },
    { id: "colaborativo", label: "Trabajo Colaborativo", desc: "Aprendizaje entre pares, proyectos y grupos.", icon: Users },
    { id: "movimiento", label: "Movimiento Constante", desc: "Dinámicas kinestésicas y aprendizaje activo.", icon: Wifi } // Wifi as a proxy for movement/waves? Swapped to Activity if available, sticking to lucide basics.
];

const INFRAESTRUCTURA = [
    { id: "proyector", label: "Proyector", icon: Tv },
    { id: "internet", label: "Internet Estable", icon: Wifi },
    { id: "audio", label: "Sistema de Audio", icon: Speaker },
    { id: "computacion", label: "Sala Computación", icon: Monitor },
    { id: "cra", label: "Biblioteca CRA", icon: Library },
    { id: "pizarra", label: "Solo Pizarra", icon: PenTool }
];

const DESAFIOS_COMUNES = [
    "Disminuir carga administrativa",
    "Diversificar evaluación",
    "Implementar DUA",
    "Mejorar convivencia escolar",
    "Innovar con tecnología",
    "Atender NEE",
    "Fomentar lectura",
    "Aprendizaje Basado en Proyectos"
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [usarContextoGeo, setUsarContextoGeo] = useState(true); // Toggle contexto geográfico
    const [schoolName, setSchoolName] = useState<string | null>(null); // Nombre del colegio para mostrar

    // Estado Principal
    const [profile, setProfile] = useState<PedagogicalProfile>({
        full_name: "",
        age: 0,
        department: "",
        years_experience: 0,
        niveles: [],
        asignaturas: [],
        es_profesor_jefe: false,
        curso_jefatura: "",
        estilo_ia: "formal",
        estilo_trabajo: "colaborativo",
        infraestructura: [],
        desafios: []
    });

    const [otherInfra, setOtherInfra] = useState("");
    const [desafioTexto, setDesafioTexto] = useState("");

    // --- EFECTOS ---
    useEffect(() => {
        loadProfile();
    }, []);

    // Lógica Modo Párvulo
    const isParvuloMode = profile.niveles.some(n => ["Pre-Kinder", "Kinder", "Sala Cuna", "Nivel Medio"].includes(n));

    // --- CARGA DE DATOS ---
    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = "/login";
                return;
            }

            // Cargar desde Metadata
            const meta = user.user_metadata || {};

            setProfile({
                full_name: meta.full_name || meta.nombre || "",
                age: meta.age || 0,
                department: meta.department || "",
                years_experience: meta.years_experience || 0,
                niveles: meta.niveles || [],
                asignaturas: meta.asignaturas || [],
                es_profesor_jefe: meta.es_profesor_jefe || false,
                curso_jefatura: meta.curso_jefatura || "",
                estilo_ia: meta.estilo_ia || "formal",
                estilo_trabajo: meta.estilo_trabajo || "colaborativo",
                infraestructura: meta.infraestructura || [],
                desafios: meta.desafios || []
            });
            setOtherInfra(meta.infraestructura_otro || "");
            setDesafioTexto(meta.otro_desafio || "");

            // Cargar preferencia de contexto geográfico desde el backend
            try {
                const session = await supabase.auth.getSession();
                const token = session.data.session?.access_token;
                if (token) {
                    const ctxRes = await fetch(`${API_URL}/profile/context`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (ctxRes.ok) {
                        const ctxData = await ctxRes.json();
                        setUsarContextoGeo(ctxData.usar_contexto_geografico ?? true);
                        setSchoolName(ctxData.school?.name || null);
                    }
                }
            } catch {
                // No es crítico si falla, sigue con el valor por defecto
            }

        } catch (error) {
            console.error("Error cargando perfil", error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    // --- GUARDADO ---
    const handleSave = async () => {
        setSaving(true);
        try {
            // Guardar en Supabase Auth Metadata
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: profile.full_name,
                    age: profile.age,
                    department: profile.department,
                    years_experience: profile.years_experience,
                    niveles: profile.niveles,
                    asignaturas: profile.asignaturas,
                    es_profesor_jefe: profile.es_profesor_jefe,
                    curso_jefatura: profile.curso_jefatura,
                    estilo_ia: profile.estilo_ia,
                    estilo_trabajo: profile.estilo_trabajo,
                    infraestructura: profile.infraestructura,
                    infraestructura_otro: otherInfra,
                    desafios: profile.desafios,
                    otro_desafio: desafioTexto
                }
            });

            if (error) throw error;
            // Also update the 'profiles' table for sql querying
            await supabase.from('profiles').update({
                full_name: profile.full_name,
                age: profile.age,
                department: profile.department,
                years_experience: profile.years_experience
            }).eq('id', (await supabase.auth.getUser()).data.user?.id);

            // Guardar preferencia de contexto geográfico
            const session = await supabase.auth.getSession();
            const token = session.data.session?.access_token;
            if (token) {
                await fetch(`${API_URL}/profile/context`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ usar_contexto_geografico: usarContextoGeo })
                });
            }

            toast.success("Perfil actualizado correctamente");
        } catch (error) {
            console.error("Error guardando", error);
            toast.error("Error al guardar perfil");
        } finally {
            setSaving(false);
        }
    };

    // --- HANDLERS ---
    const toggleArrayItem = (field: keyof PedagogicalProfile, value: string) => {
        setProfile(prev => {
            const list = prev[field] as string[];
            if (list.includes(value)) {
                return { ...prev, [field]: list.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...list, value] };
            }
        });
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-[#1a2e3b]">Cargando perfil...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#1a2e3b] flex items-center gap-3">
                            <User className="text-[#f2ae60]" size={32} />
                            Configuración Pedagógica
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium text-lg leading-relaxed">
                            Queremos <span className="text-[#f2ae60] font-bold">conocerte mejor</span> para acompañarte a la medida de tus necesidades.
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-[#1a2e3b] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#254153] transition-all disabled:opacity-50 shadow-lg shadow-[#1a2e3b]/20 hover:scale-105 active:scale-95"
                    >
                        {saving ? "Guardando..." : <><Save size={20} /> Guardar Cambios</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* DATA CARD: INFO PERSONAL (Nuevo) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 md:col-span-2"
                    >
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl shrink-0">
                                👋
                            </div>
                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre del Docente</label>
                                    <input
                                        type="text"
                                        value={profile.full_name}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        placeholder="Ej: Juan Pérez"
                                        className="w-full text-xl md:text-2xl font-black text-[#1a2e3b] bg-transparent border-b-2 border-slate-200 focus:border-[#f2ae60] outline-none placeholder:text-slate-300 transition-colors py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Edad</label>
                                    <input
                                        type="number"
                                        value={profile.age || ''}
                                        onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                                        placeholder="Ej: 35"
                                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#1a2e3b] outline-none font-bold text-[#1a2e3b]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Años de Experiencia</label>
                                    <input
                                        type="number"
                                        value={profile.years_experience || ''}
                                        onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })}
                                        placeholder="Ej: 10"
                                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#1a2e3b] outline-none font-bold text-[#1a2e3b]"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Departamento / Rol</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "Lenguaje", "Matemática", "Ciencias", "Historia",
                                            "Inglés", "Artes/Música", "Educación Física",
                                            "Educadora Diferencial (PIE)", "Primer Ciclo", "Pre-Básica"
                                        ].map((dept) => (
                                            <button
                                                key={dept}
                                                onClick={() => setProfile({ ...profile, department: dept })}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${profile.department === dept
                                                    ? "bg-[#1a2e3b] text-white border-[#1a2e3b] shadow-md"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-[#f2ae60]"
                                                    }`}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 1. IDENTIDAD: Niveles y Asignaturas */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 md:col-span-2"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><GraduationCap size={24} /></div>
                            <h3 className="text-xl font-bold text-[#1a2e3b]">Identidad Docente</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Niveles */}
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Niveles que imparto</label>
                                <div className="flex flex-wrap gap-2">
                                    {NIVELES.map(nivel => (
                                        <button
                                            key={nivel}
                                            onClick={() => toggleArrayItem("niveles", nivel)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${profile.niveles.includes(nivel)
                                                ? "bg-[#1a2e3b] text-white border-[#1a2e3b] shadow-md"
                                                : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#f2ae60]"
                                                }`}
                                        >
                                            {nivel}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Asignaturas / Núcleos */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    {isParvuloMode ? "Núcleos de Aprendizaje (BCEP)" : "Asignaturas"}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(isParvuloMode ? NUCLEOS_PARVULO : ASIGNATURAS_GENERAL).map(item => (
                                        <button
                                            key={item}
                                            onClick={() => toggleArrayItem("asignaturas", item)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${profile.asignaturas.includes(item)
                                                ? "bg-[#f2ae60] text-[#1a2e3b] border-[#f2ae60] shadow-md"
                                                : "bg-slate-50 text-slate-500 border-slate-200 hover:border-[#f2ae60]"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                                {isParvuloMode && (
                                    <p className="text-xs text-[#f2ae60] font-bold mt-2 flex items-center gap-1">
                                        <Sparkles size={12} /> Modo Párvulo Activado: Mostrando Núcleos BCEP
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>


                    {/* 2. JEFATURA */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><BookOpen size={24} /></div>
                            <h3 className="text-xl font-bold text-[#1a2e3b]">Jefatura de Curso</h3>
                        </div>

                        <div className="flex items-center justify-between mb-4 bg-slate-50 p-4 rounded-2xl">
                            <span className="font-bold text-[#1a2e3b]">¿Eres Profesor(a) Jefe?</span>
                            <button
                                onClick={() => setProfile({ ...profile, es_profesor_jefe: !profile.es_profesor_jefe })}
                                className={`w-14 h-8 rounded-full p-1 transition-colors ${profile.es_profesor_jefe ? "bg-[#1a2e3b]" : "bg-slate-300"}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${profile.es_profesor_jefe ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>

                        {profile.es_profesor_jefe && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">¿De qué curso?</label>
                                <input
                                    type="text"
                                    value={profile.curso_jefatura}
                                    onChange={(e) => setProfile({ ...profile, curso_jefatura: e.target.value })}
                                    placeholder="Ej: 2° Medio B"
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-[#1a2e3b] outline-none font-bold text-[#1a2e3b]"
                                />
                            </motion.div>
                        )}
                    </motion.div>


                    {/* 3. ESTILO IA */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Brain size={24} /></div>
                            <h3 className="text-xl font-bold text-[#1a2e3b]">Personalidad Profe IC</h3>
                        </div>

                        <div className="space-y-3">
                            {ESTILOS_IA.map((estilo) => (
                                <button
                                    key={estilo.id}
                                    onClick={() => setProfile({ ...profile, estilo_ia: estilo.id as any })}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${profile.estilo_ia === estilo.id
                                        ? "border-[#1a2e3b] bg-slate-50 ring-1 ring-[#1a2e3b]"
                                        : "border-slate-100 hover:border-slate-200"
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${profile.estilo_ia === estilo.id ? "bg-[#1a2e3b] text-white" : "bg-slate-100 text-slate-400"}`}>
                                        <estilo.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#1a2e3b]">{estilo.label}</p>
                                        <p className="text-xs text-slate-500">{estilo.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* 4. ESTILO DE TRABAJO */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 md:col-span-1"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Users size={24} /></div>
                            <h3 className="text-xl font-bold text-[#1a2e3b]">Ambiente de Aula</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                            Selecciona cómo es la dinámica habitual en tus clases para ajustar las actividades sugeridas.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {ESTILOS_TRABAJO.map(estilo => (
                                <button
                                    key={estilo.id}
                                    onClick={() => setProfile({ ...profile, estilo_trabajo: estilo.id })}
                                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all min-h-[140px] px-2 ${profile.estilo_trabajo === estilo.id
                                        ? "bg-[#1a2e3b] text-white border-[#1a2e3b] shadow-lg"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-[#f2ae60]"
                                        }`}
                                >
                                    <estilo.icon size={24} className="mb-1" />
                                    <span className="text-sm font-bold leading-tight">{estilo.label}</span>
                                    <span className={`text-[10px] leading-tight opacity-80 ${profile.estilo_trabajo === estilo.id ? "text-slate-200" : "text-slate-400"}`}>
                                        {estilo.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* 5. RECURSOS DIDÁCTICOS (Antes Infraestructura) */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 md:col-span-1"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Tv size={24} /></div>
                            <h3 className="text-xl font-bold text-[#1a2e3b]">Recursos Didácticos</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {/* Predefinidos */}
                            {INFRAESTRUCTURA.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => toggleArrayItem("infraestructura", item.id)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border ${profile.infraestructura.includes(item.id)
                                        ? "bg-slate-800 text-white border-slate-800"
                                        : "bg-white text-slate-500 border-slate-200"
                                        }`}
                                >
                                    <item.icon size={14} /> {item.label}
                                </button>
                            ))}

                            {/* Custom Items */}
                            {profile.infraestructura
                                .filter(id => !INFRAESTRUCTURA.some(i => i.id === id)) // Solo los que no son IDs predefinidos
                                .map(customItem => (
                                    <button
                                        key={customItem}
                                        onClick={() => toggleArrayItem("infraestructura", customItem)}
                                        className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border bg-slate-800 text-white border-slate-800"
                                    >
                                        <Hash size={14} /> {customItem} (x)
                                    </button>
                                ))
                            }
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Otro recurso:</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={otherInfra}
                                    onChange={(e) => setOtherInfra(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && otherInfra.trim() !== "") {
                                            const newVal = otherInfra.trim();
                                            if (!profile.infraestructura.includes(newVal)) {
                                                setProfile(prev => ({ ...prev, infraestructura: [...prev.infraestructura, newVal] }));
                                                setOtherInfra("");
                                            }
                                        }
                                    }}
                                    placeholder="Ej: Tablets, Instrumentos..."
                                    className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-bold text-[#1a2e3b]"
                                />
                                <button
                                    onClick={() => {
                                        if (otherInfra.trim() !== "") {
                                            const newVal = otherInfra.trim();
                                            if (!profile.infraestructura.includes(newVal)) {
                                                setProfile(prev => ({ ...prev, infraestructura: [...prev.infraestructura, newVal] }));
                                                setOtherInfra("");
                                            }
                                        }
                                    }}
                                    className="px-4 py-2 bg-[#1a2e3b] text-white rounded-lg font-bold text-sm hover:bg-[#254153]"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>

                    </motion.div>

                </div>

                {/* 6. DESAFÍOS Y OBJETIVOS (Nuevo) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 md:col-span-2"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-50 rounded-lg text-pink-600"><Target size={24} /></div>
                        <h3 className="text-xl font-bold text-[#1a2e3b]">🎯 Desafío Profe 2026</h3>
                    </div>

                    <p className="text-slate-500 mb-6 text-sm">
                        Selecciona tus metas principales para este año. Así podremos sugerirte herramientas y estrategias alineadas a tu crecimiento.
                    </p>

                    {/* Chips de Desafíos Comunes */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {DESAFIOS_COMUNES.map(desafio => (
                            <button
                                key={desafio}
                                onClick={() => toggleArrayItem("desafios", desafio)}
                                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${profile.desafios.includes(desafio)
                                    ? "bg-pink-100 text-pink-700 border-pink-200 shadow-sm"
                                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-pink-200 hover:text-pink-600"
                                    }`}
                            >
                                {profile.desafios.includes(desafio) && <Sparkles size={14} />}
                                {desafio}
                            </button>
                        ))}
                    </div>

                    {/* Texto Abierto */}
                    <div>
                        <label className="block text-sm font-bold text-[#1a2e3b] mb-2">¿Tienes algún otro objetivo específico?</label>
                        <textarea
                            rows={3}
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all resize-none text-sm"
                            placeholder="Ej: Quiero implementar metodologías ágiles en mis clases de historia..."
                            value={desafioTexto}
                            onChange={(e) => setDesafioTexto(e.target.value)}
                        />
                    </div>
                </motion.div>
                {/* 7. CONTEXTO DE IA (NUEVO) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 md:col-span-2"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-teal-50 rounded-lg text-teal-600"><MapPin size={24} /></div>
                        <div>
                            <h3 className="text-xl font-bold text-[#1a2e3b]">Contexto de IA</h3>
                            {schoolName && (
                                <p className="text-xs text-slate-400 mt-0.5">Colegio: <span className="font-bold text-[#2b546e]">{schoolName}</span> — el sello institucional se aplica siempre por defecto.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div>
                            <p className="font-bold text-[#1a2e3b] text-base">Usar contexto geográfico local</p>
                            <p className="text-sm text-slate-500 mt-1 max-w-md">
                                Cuando está activo, la IA usará referencias locales en ejemplos y situaciones
                                (ciudad, entorno, elementos regionales). Desactívalo para obtener recursos más genéricos.
                            </p>
                        </div>
                        <button
                            onClick={() => setUsarContextoGeo(!usarContextoGeo)}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ml-6 shrink-0 ${usarContextoGeo ? "bg-teal-500" : "bg-slate-300"
                                }`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${usarContextoGeo ? "translate-x-6" : "translate-x-0"
                                }`} />
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                        <Sparkles size={11} />
                        {usarContextoGeo
                            ? "Activado: la IA contextualizará con tu localidad cuando sea pertinente."
                            : "Desactivado: la IA generará recursos genéricos sin referencias geográficas."
                        }
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
