"use client";

import React, { useState, useEffect } from "react";
import { Users, GraduationCap, Search, Loader2, ChevronDown, Hash, UserCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Student {
    rut: string;
    nombres: string;
    apellidos: string;
}

interface CourseWithStudents {
    id: string;
    nivel: string;
    letra: string;
    students: Student[];
}

export default function StudentDirectory() {
    const [courses, setCourses] = useState<CourseWithStudents[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");

    const fetchDirectory = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Usamos 127.0.0.1 para evitar problemas de resolución de localhost en algunos entornos Mac
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${apiBase}/api/v1/admin/enrollment/directory`, {
                headers: {
                    "Authorization": `Bearer ${session.access_token}`
                }
            });

            const result = await response.json();
            if (response.ok) {
                // El backend ya devuelve una lista ordenada: result.directory
                const directoryData: CourseWithStudents[] = result.directory;
                setCourses(directoryData);

                // Expandir el primero por defecto
                if (directoryData.length > 0) {
                    setExpandedCourses(new Set([directoryData[0].id]));
                }
            } else {
                toast.error("No se pudo cargar el directorio de estudiantes.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión al cargar la matrícula.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDirectory();
    }, []);

    const toggleExpand = (courseId: string) => {
        const next = new Set(expandedCourses);
        if (next.has(courseId)) {
            next.delete(courseId);
        } else {
            next.add(courseId);
        }
        setExpandedCourses(next);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="animate-spin text-[#C87533] mb-4" size={32} />
                <p className="text-slate-500 font-medium">Cargando nómina de estudiantes...</p>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#1B3C73]">Sin datos de matrícula</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm italic">
                    Utiliza la zona de carga arriba para subir tu archivo CSV de estudiantes.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#1B3C73] p-2 rounded-xl">
                        <Users className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#1B3C73]">Nómina Institucional</h2>
                        <p className="text-xs text-slate-500 font-medium">{courses.length} Cursos detectados</p>
                    </div>
                </div>

                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar estudiante o RUT..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C87533]/20 focus:border-[#C87533] outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {courses.map((course) => {
                    const isExpanded = expandedCourses.has(course.id);
                    const filteredStudents = course.students.filter(s =>
                        s.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.rut.includes(searchTerm)
                    );

                    if (searchTerm && filteredStudents.length === 0) return null;

                    return (
                        <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <button
                                onClick={() => toggleExpand(course.id)}
                                className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl transition-colors ${isExpanded ? "bg-[#C87533] text-white" : "bg-blue-50 text-[#1B3C73]"}`}>
                                        <GraduationCap size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`font-bold transition-colors ${isExpanded ? "text-[#C87533]" : "text-[#1B3C73]"}`}>
                                            {course.nivel} {course.letra}
                                        </h3>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                            Curso ID: {course.id.split('-')[0]}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                                        {course.students.length} Alumnos
                                    </span>
                                    <ChevronDown
                                        size={20}
                                        className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-slate-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-500">
                                                <tr>
                                                    <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[10px]">RUT</th>
                                                    <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[10px]">Apellidos</th>
                                                    <th className="px-6 py-3 font-semibold uppercase tracking-wider text-[10px]">Nombres</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredStudents.length > 0 ? (
                                                    filteredStudents.map((student) => (
                                                        <tr key={student.rut} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                                <div className="flex items-center gap-2">
                                                                    <Hash size={12} className="text-slate-300" />
                                                                    {student.rut}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-bold text-slate-700 uppercase text-xs">
                                                                    {student.apellidos}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="text-slate-600 flex items-center gap-2">
                                                                    <UserCircle2 size={14} className="text-slate-300" />
                                                                    {student.nombres}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic bg-white">
                                                            No hay estudiantes que coincidan con la búsqueda.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
