"use client";

import React, { useState, useMemo } from "react";
import {
    Users,
    GraduationCap,
    Save,
    Loader2,
    UserCheck,
    ChevronRight,
    Search,
    CheckCircle2,
    BookOpen,
    Filter
} from "lucide-react";

// --- Tipos ---

interface Teacher {
    id: string;
    full_name: string;
    email: string;
    avatar?: string;
}

interface Course {
    id: string;
    nivel: string;
    letra: string;
    sort_index: number;
}

// --- Datos Mock ---

const MOCK_TEACHERS: Teacher[] = [
    { id: "t1", full_name: "Ana María Rodríguez", email: "ana.rodriguez@colegio.cl" },
    { id: "t2", full_name: "Carlos Soto Valdés", email: "carlos.soto@colegio.cl" },
    { id: "t3", full_name: "Lucía Méndez Castro", email: "lucia.mendez@colegio.cl" },
    { id: "t4", full_name: "Roberto Araya Fuentes", email: "roberto.araya@colegio.cl" },
    { id: "t5", full_name: "Patricia Lagos Soto", email: "patricia.lagos@colegio.cl" },
];

const MOCK_COURSES: Course[] = [
    { id: "c1", nivel: "1° Básico", letra: "A", sort_index: 3 },
    { id: "c2", nivel: "1° Básico", letra: "B", sort_index: 3 },
    { id: "c3", nivel: "2° Básico", letra: "A", sort_index: 4 },
    { id: "c4", nivel: "Pre-Kínder", letra: "A", sort_index: 1 },
    { id: "c5", nivel: "Kínder", letra: "A", sort_index: 2 },
    { id: "c6", nivel: "8° Básico", letra: "A", sort_index: 10 },
    { id: "c7", nivel: "8° Básico", letra: "C", sort_index: 10 },
    { id: "c8", nivel: "8° Básico", letra: "B", sort_index: 10 },
    { id: "c9", nivel: "4° Medio", letra: "A", sort_index: 14 },
    { id: "c10", nivel: "1° Medio", letra: "A", sort_index: 11 },
];

// --- Componente Principal ---

export default function TeacherCourseAssignment() {
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [saving, setSaving] = useState(false);

    // Estado para las asignaciones (mapeo de teacherId -> set de courseIds)
    const [assignments, setAssignments] = useState<Record<string, Set<string>>>({
        "t1": new Set(["c1", "c2"]),
        "t2": new Set(["c6", "c8"]),
    });

    // --- Lógica de procesamiento de datos ---

    const sortedCourses = useMemo(() => {
        return [...MOCK_COURSES].sort((a, b) => {
            if (a.sort_index !== b.sort_index) {
                return a.sort_index - b.sort_index;
            }
            return a.letra.localeCompare(b.letra);
        });
    }, []);

    const filteredTeachers = useMemo(() => {
        return MOCK_TEACHERS.filter(t =>
            t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const selectedTeacher = useMemo(() =>
        MOCK_TEACHERS.find(t => t.id === selectedTeacherId),
        [selectedTeacherId]
    );

    const currentAssignedIds = useMemo(() =>
        selectedTeacherId ? assignments[selectedTeacherId] || new Set() : new Set<string>(),
        [selectedTeacherId, assignments]
    );

    // --- Handlers ---

    const toggleCourse = (courseId: string) => {
        if (!selectedTeacherId) return;

        setAssignments(prev => {
            const newSet = new Set(prev[selectedTeacherId] || []);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return { ...prev, [selectedTeacherId]: newSet };
        });
    };

    const handleSaveAssignments = async () => {
        if (!selectedTeacherId) return;

        setSaving(true);

        // Simulación de API
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log(`Guardando asignaciones para ${selectedTeacher?.full_name}:`, Array.from(currentAssignedIds));

        setSaving(false);
        alert(`¡Éxito! Asignaciones guardadas para ${selectedTeacher?.full_name}`);
    };

    return (
        <div className="flex flex-col h-[800px] w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-black/5">

            {/* HEADER DINÁMICO */}
            <header className="px-8 py-6 bg-gradient-to-r from-[#1B3C73] to-[#2A5298] text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <UserCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Panel de Asignación Docente</h1>
                        <p className="text-blue-100/70 text-sm font-medium">Gestión institucional de carga académica</p>
                    </div>
                </div>

                {selectedTeacherId && (
                    <button
                        onClick={handleSaveAssignments}
                        disabled={saving}
                        className="group flex items-center gap-2 px-6 py-3 bg-[#C87533] hover:bg-[#D98644] active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                        <span>{saving ? "Guardando..." : "Guardar Asignaciones"}</span>
                    </button>
                )}
            </header>

            {/* CUERPO DEL PANEL: MASTER-DETAIL */}
            <div className="flex flex-1 overflow-hidden bg-slate-50">

                {/* COLUMNA IZQUIERDA: MASTER (Profesores) */}
                <aside className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
                    <div className="p-5 border-b border-slate-100">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C87533] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar profesor por nombre o email..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#C87533]/10 focus:border-[#C87533] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-2 space-y-1">
                            {filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => {
                                    const isActive = selectedTeacherId === teacher.id;
                                    const teacherAssignmentsCount = assignments[teacher.id]?.size || 0;

                                    return (
                                        <button
                                            key={teacher.id}
                                            onClick={() => setSelectedTeacherId(teacher.id)}
                                            className={`w-full group flex items-center gap-4 p-4 rounded-2xl transition-all text-left
                        ${isActive
                                                    ? "bg-slate-50 border-l-4 border-l-[#C87533] shadow-sm"
                                                    : "hover:bg-slate-50/80 border-l-4 border-l-transparent text-slate-600"
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors
                        ${isActive ? "bg-[#C87533] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                                                {teacher.full_name.charAt(0)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-[15px] truncate ${isActive ? "text-[#1B3C73]" : "text-slate-700"}`}>
                                                    {teacher.full_name}
                                                </h3>
                                                <p className="text-xs text-slate-400 truncate font-medium">{teacher.email}</p>

                                                {teacherAssignmentsCount > 0 && (
                                                    <div className="mt-1 flex items-center gap-1.5 overflow-hidden">
                                                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                                                            {teacherAssignmentsCount} CURSOS
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <ChevronRight className={`shrink-0 transition-transform ${isActive ? "text-[#C87533] translate-x-1" : "text-slate-300 opacity-0 group-hover:opacity-100"}`} size={20} />
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="py-12 px-6 text-center">
                                    <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-300 mb-3 text-sm font-medium">
                                        No se encontraron resultados
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* COLUMNA DERECHA: DETAIL (Cursos) */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {!selectedTeacher ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 border-4 border-white shadow-xl">
                                <Users size={48} className="opacity-20" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-400">Selección de Profesor</h2>
                            <p className="max-w-xs text-sm mt-2 text-slate-400 font-medium">
                                Selecciona un docente de la lista para gestionar sus cursos y carga horaria.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar Superior del Detalle */}
                            <div className="px-10 py-8 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="px-2 py-0.5 bg-[#1B3C73]/10 text-[#1B3C73] text-[10px] font-bold rounded uppercase tracking-wider">Perfil Docente</span>
                                        <h2 className="text-2xl font-black text-[#1B3C73] tracking-tight">{selectedTeacher.full_name}</h2>
                                    </div>
                                    <p className="text-slate-500 font-medium flex items-center gap-2">
                                        <BookOpen size={16} className="text-[#C87533]" />
                                        Gestiona la malla de cursos asignados para el periodo actual.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-[#1B3C73] rounded-lg">
                                            <GraduationCap size={20} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Cursos</p>
                                            <span className="text-xl font-black text-[#1B3C73] leading-none">
                                                {currentAssignedIds.size}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Cursos con Checkboxes */}
                            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-10">
                                <div className="mb-6 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    <Filter size={14} />
                                    <span>Todos los Cursos Disponibles</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {sortedCourses.map((course) => {
                                        const isSelected = currentAssignedIds.has(course.id);

                                        return (
                                            <div
                                                key={course.id}
                                                onClick={() => toggleCourse(course.id)}
                                                className={`group relative cursor-pointer p-5 rounded-3xl border-2 transition-all duration-300 select-none
                          ${isSelected
                                                        ? "bg-white border-[#1B3C73] shadow-xl shadow-[#1B3C73]/5 translate-y-[-2px]"
                                                        : "bg-white/60 border-transparent hover:border-slate-200 hover:bg-white"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`p-3 rounded-2xl transition-colors ${isSelected ? "bg-[#1B3C73] text-white" : "bg-slate-100 text-slate-400 group-hover:text-[#1B3C73]"}`}>
                                                        <GraduationCap size={24} />
                                                    </div>

                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                            ${isSelected
                                                            ? "bg-[#C87533] border-[#C87533] scale-110 shadow-lg shadow-[#C87533]/20"
                                                            : "border-slate-200"
                                                        }`}>
                                                        {isSelected && <CheckCircle2 size={16} className="text-white" />}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className={`text-lg font-black transition-colors ${isSelected ? "text-[#1B3C73]" : "text-slate-700"}`}>
                                                        {course.nivel}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest
                              ${isSelected ? "bg-[#C87533]/10 text-[#C87533]" : "bg-slate-100 text-slate-400"}`}>
                                                            Sección {course.letra}
                                                        </span>
                                                        <span className="text-[10px] text-slate-300 font-medium">Index: {course.sort_index}</span>
                                                    </div>
                                                </div>

                                                {/* Indicador visual de selección en el borde inferior */}
                                                {isSelected && (
                                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#1B3C73] rounded-t-full"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
        </div>
    );
}
