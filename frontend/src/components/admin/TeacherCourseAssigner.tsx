"use client";

import React, { useState, useEffect } from "react";
import { Users, GraduationCap, Save, Loader2, UserCheck, ChevronRight, Search, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Teacher {
    id: string;
    full_name: string;
    email: string;
}

interface Course {
    id: string;
    nivel: string;
    letra: string;
    sort_index: number;
}

export default function TeacherCourseAssigner() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [assignedCourseIds, setAssignedCourseIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // 1. Fetch Teachers
            const teachersRes = await fetch(`${API_BASE}/api/v1/admin/teachers/`, {
                headers: { "Authorization": `Bearer ${session.access_token}` }
            });
            const teachersData = await teachersRes.json();
            setTeachers(teachersData);

            // 2. Fetch all Courses (using the enrollment directory logic)
            const coursesRes = await fetch(`${API_BASE}/api/v1/admin/enrollment/directory`, {
                headers: { "Authorization": `Bearer ${session.access_token}` }
            });
            const coursesData = await coursesRes.json();
            // Flatten the directory representation to a list of courses
            const flatCourses: Course[] = coursesData.directory.map((c: any) => ({
                id: c.id,
                nivel: c.nivel,
                letra: c.letra,
                sort_index: 0 // We'll assume the directory is already sorted
            }));
            setCourses(flatCourses);

        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos iniciales.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectTeacher = async (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_BASE}/api/v1/admin/teachers/${teacher.id}/courses`, {
                headers: { "Authorization": `Bearer ${session.access_token}` }
            });
            const courseIds = await res.json();
            setAssignedCourseIds(courseIds);
        } catch (error) {
            toast.error("Error al cargar cursos asignados.");
        }
    };

    const toggleCourse = (courseId: string) => {
        setAssignedCourseIds(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleSave = async () => {
        if (!selectedTeacher) return;
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_BASE}/api/v1/admin/teachers/${selectedTeacher.id}/assignments`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ course_ids: assignedCourseIds })
            });

            if (res.ok) {
                toast.success(`Asignación guardada para ${selectedTeacher.full_name}`);
            } else {
                toast.error("Error al guardar la asignación.");
            }
        } catch (error) {
            toast.error("Error de conexión.");
        } finally {
            setSaving(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[500px]">
                <Loader2 className="animate-spin text-[#C87533] mb-4" size={48} />
                <p className="text-slate-500 font-medium">Cargando gestión docente...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#1B3C73] p-2 rounded-xl">
                        <UserCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#1B3C73]">Asignación de Cursos</h2>
                        <p className="text-xs text-slate-500 font-medium font-mono">Teacher Assignment Manager</p>
                    </div>
                </div>

                {selectedTeacher && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#C87533] hover:bg-[#B0652B] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#C87533]/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Guardar Asignación
                    </button>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Columna Izquierda: Profesores */}
                <div className="w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/30">
                    <div className="p-4 border-b border-slate-100 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar profesor..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C87533]/20 focus:border-[#C87533] outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredTeachers.map((teacher) => (
                            <button
                                key={teacher.id}
                                onClick={() => handleSelectTeacher(teacher)}
                                className={`w-full text-left px-6 py-4 flex items-center justify-between transition-all border-b border-slate-50
                                    ${selectedTeacher?.id === teacher.id
                                        ? "bg-white border-l-4 border-l-[#C87533] text-[#1B3C73] shadow-inner"
                                        : "text-slate-600 hover:bg-slate-100/50"}`}
                            >
                                <div className="truncate">
                                    <p className={`font-bold text-sm ${selectedTeacher?.id === teacher.id ? "text-[#C87533]" : ""}`}>
                                        {teacher.full_name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate uppercase mt-0.5">{teacher.email}</p>
                                </div>
                                <ChevronRight size={16} className={selectedTeacher?.id === teacher.id ? "text-[#C87533]" : "text-slate-300"} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Columna Derecha: Selección de Cursos */}
                <div className="flex-1 bg-white overflow-y-auto">
                    {!selectedTeacher ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <Users size={64} className="opacity-10" />
                            <p className="font-medium">Selecciona un profesor de la lista</p>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[#1B3C73]">
                                        Cursos para {selectedTeacher.full_name}
                                    </h3>
                                    <p className="text-sm text-slate-500">Marca los cursos que este profesor gestionará.</p>
                                </div>
                                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                                    <span className="text-xs font-bold text-[#1B3C73]">
                                        {assignedCourseIds.length} Cursos seleccionados
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {courses.map((course) => {
                                    const isSelected = assignedCourseIds.includes(course.id);
                                    return (
                                        <button
                                            key={course.id}
                                            onClick={() => toggleCourse(course.id)}
                                            className={`p-4 rounded-2xl border transition-all flex items-center gap-3 text-left
                                                ${isSelected
                                                    ? "bg-[#1B3C73] border-[#1B3C73] text-white shadow-lg shadow-[#1B3C73]/10"
                                                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"}`}
                                        >
                                            <div className={`p-2 rounded-lg ${isSelected ? "bg-white/10" : "bg-slate-50"}`}>
                                                <GraduationCap size={20} className={isSelected ? "text-white" : "text-[#1B3C73]"} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm leading-tight">{course.nivel}</p>
                                                <p className={`text-[10px] uppercase tracking-wider font-extrabold ${isSelected ? "text-white/60" : "text-[#C87533]"}`}>
                                                    Letra {course.letra}
                                                </p>
                                            </div>
                                            {isSelected && <CheckCircle2 size={16} className="text-[#C87533]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
