"use client";

import React, { useState } from "react";
import { useMotorData } from "./hooks/useMotorData";
import DashboardMaestro from "./components/DashboardMaestro";
import FiltroHitl from "./components/FiltroHitl";
import TableroSeguimiento from "./components/TableroSeguimiento";
import PopUpDocente from "./components/PopUpDocente";
import { 
    TrendingUp, 
    AlertTriangle, 
    UserCheck, 
    Users, 
    UploadCloud, 
    CheckCircle, 
    Clock, 
    BookOpen, 
    UserX, 
    Database, 
    FileText, 
    Calendar, 
    MessageSquare,
    RefreshCw,
    Upload,
    FileSpreadsheet,
    Sparkles,
    HelpCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function MotorPage() {
    const {
        periodoId,
        setPeriodoId,
        cursoId,
        setCursoId,
        asignaturaId,
        setAsignaturaId,
        activeRole,
        corteTemporal,
        setCorteTemporal,
        evolucionData,
        isEvolucionLoading,
        isLoading,
        filtrosData,
        filtrosLoading,
        asignaturasDisponibles,
        directorData,
        coordinadorData,
        jefeData,
        profesorData,
        drillDownData,
        isDrillDownLoading,
        fetchDrillDownDetails,
        desgloseData,
        roadmap,
        isRoadmapGenerating,
        triggerGenerateRoadmap,
        uploadFiles,
        updateUmbralesHITL,
        submitDocenteComentario,
        moveKanbanHitoOptimistic,
        addInputBitacora,
        supabaseActive,
        runSystemMigration
    } = useMotorData();

    // Estados locales para carga de archivos
    const [fileCal, setFileCal] = useState<File | null>(null);
    const [fileAtr, setFileAtr] = useState<File | null>(null);
    const [fileAno, setFileAno] = useState<File | null>(null);
    const [fileAsi, setFileAsi] = useState<File | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleIngestion = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const res = await uploadFiles(fileCal, fileAtr, fileAno, fileAsi, asignaturaId, corteTemporal);
        if (res.success) {
            setUploadSuccess(true);
            setFileCal(null);
            setFileAtr(null);
            setFileAno(null);
            setFileAsi(null);
            setTimeout(() => setUploadSuccess(false), 3000);
        } else {
            setUploadError(res.error || "Ocurrió un error al procesar los archivos.");
        }
    };

    const { isSuperAdmin, user } = useAuth();

    return (
        <div className="flex flex-col gap-6 w-full pb-12 animate-in fade-in duration-500 text-slate-800">
            {/* Filtros Globales del Módulo (Período, Nivel/Curso, Asignatura) */}
            <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Periodo */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Período</span>
                        <select 
                            value={periodoId}
                            onChange={(e) => setPeriodoId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1B3C73] focus:ring-1 focus:ring-[#1B3C73]"
                        >
                            <option value="2026-S1">2026 - Semestre 1</option>
                            <option value="2026-S2">2026 - Semestre 2</option>
                            <option value="2025-S2">2025 - Semestre 2</option>
                        </select>
                    </div>

                    {/* Nivel / Curso - DINÁMICO */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Nivel / Curso</span>
                        <select 
                            value={cursoId}
                            onChange={(e) => setCursoId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1B3C73] focus:ring-1 focus:ring-[#1B3C73]"
                            disabled={filtrosLoading}
                        >
                            {filtrosLoading ? (
                                <option>Cargando niveles...</option>
                            ) : (
                                filtrosData?.niveles.map((nivel) => (
                                    <option key={nivel} value={nivel}>
                                        {nivel === "Todos" ? "Visión Global (Todo el Colegio)" : nivel}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Asignatura - DINÁMICO (encadenado al nivel) */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Asignatura Escolar</span>
                        <select 
                            value={asignaturaId}
                            onChange={(e) => setAsignaturaId(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1B3C73] focus:ring-1 focus:ring-[#1B3C73] max-w-[280px]"
                            disabled={filtrosLoading || asignaturasDisponibles.length === 0}
                        >
                            {filtrosLoading ? (
                                <option>Cargando asignaturas...</option>
                            ) : (
                                asignaturasDisponibles.map((asig) => (
                                    <option key={asig} value={asig}>
                                        {asig === "Todos" ? "Todas las Asignaturas" : asig}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Corte Temporal */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Corte Temporal</span>
                        <select 
                            value={corteTemporal}
                            onChange={(e) => setCorteTemporal(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#1B3C73] focus:ring-1 focus:ring-[#1B3C73]"
                        >
                            <option value="General">General / Consolidado</option>
                            <option value="Semana 1">Mayo - Semana 1</option>
                            <option value="Semana 2">Mayo - Semana 2</option>
                            <option value="Semana 3">Mayo - Semana 3</option>
                            <option value="Semana 4">Mayo - Semana 4</option>
                        </select>
                    </div>
                </div>

                {supabaseActive ? (
                    <div className="text-xs text-[#10B981] font-bold bg-[#E6FDF5] px-4 py-2 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                        </span>
                        Datos sincronizados en tiempo real ✓
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="text-xs text-[#D97706] font-bold bg-[#FFFBEB] px-4 py-2 rounded-xl border border-amber-200 flex items-center gap-1.5 shadow-sm">
                            <Database className="w-5 h-5 text-emerald-500 shrink-0" />
                            Conexión limitada — algunos datos pueden no estar actualizados
                        </div>
                        {isSuperAdmin && (activeRole === "director" || activeRole === "coordinador") && (
                            <button
                                onClick={runSystemMigration}
                                className="bg-[#C87533] hover:bg-[#ac6329] text-white text-[10px] font-extrabold px-3.5 py-2 rounded-xl transition-all shadow-sm uppercase tracking-wider border-0 cursor-pointer"
                            >
                                Sincronizar Base de Datos
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Banner de estado: sin datos reales para el filtro seleccionado */}
            {!isLoading && (
                (activeRole === "director" && directorData === null) ||
                (activeRole === "coordinador" && coordinadorData === null) ||
                (activeRole === "jefe_departamento" && jefeData === null) ||
                (activeRole === "profesor" && profesorData === null)
            ) && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 text-xs text-slate-700 shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <AlertTriangle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-extrabold text-slate-600">Sin datos para este filtro:</span> No hay registros de ingesta para el período, nivel/curso y asignatura seleccionados. Cambie los filtros o suba archivos de calificaciones, atrasos y anotaciones a través de la ingesta del Coordinador.
                    </div>
                </div>
            )}

            {/* Ingesta de Archivos: Disponible solo para el Coordinador/UTP en su respectivo Dashboard */}
            {activeRole === "coordinador" && (
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    
                    {uploadSuccess && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">¡Ingesta Procesada!</h3>
                            <p className="text-sm font-bold text-slate-500 mt-1">El Motor Predictivo ha actualizado el estado del curso.</p>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center z-10">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 tracking-tight">
                                <UploadCloud className="w-5 h-5 text-emerald-600" />
                                Carga de Datos Académicos
                            </h2>
                            <p className="text-sm text-slate-555 max-w-2xl">
                                Sube los archivos originales (Excel o HTML descargado de Edufácil). El sistema procesará automáticamente los indicadores preventivos y el acompañamiento para <strong className="text-[#1B3C73] font-semibold">{asignaturaId || "la asignatura seleccionada"}</strong>.
                            </p>
                            {uploadError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-bold mt-2 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div>{uploadError}</div>
                                </div>
                            )}
                        </div>
                        {uploadSuccess && (
                            <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-right-4 shadow-sm">
                                <CheckCircle className="w-4 h-4" /> Datos cargados exitosamente ✓
                            </div>
                        )}
                    </div>
 
                    <form onSubmit={handleIngestion} className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-4 mt-2 z-10">
                        {/* CAJA 1: CALIFICACIONES */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Calificaciones (Excel/HTML)
                            </label>
                            <input 
                                type="file" 
                                accept=".xls,.xlsx,.html" 
                                onChange={(e) => setFileCal(e.target.files ? e.target.files[0] : null)}
                                className="text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-50 file:text-[#1B3C73] hover:file:bg-slate-100 cursor-pointer text-slate-650 transition-colors w-full"
                            />
                        </div>

                        {/* CAJA 2: ATRASOS */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Atrasos (Excel)
                            </label>
                            <input 
                                type="file" 
                                accept=".xls,.xlsx" 
                                onChange={(e) => setFileAtr(e.target.files ? e.target.files[0] : null)}
                                className="text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-50 file:text-[#1B3C73] hover:file:bg-slate-100 cursor-pointer text-slate-650 transition-colors w-full"
                            />
                        </div>

                        {/* CAJA 3: ASISTENCIA */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Asistencia (Excel)
                            </label>
                            <input 
                                type="file" 
                                accept=".xls,.xlsx" 
                                onChange={(e) => setFileAsi(e.target.files ? e.target.files[0] : null)}
                                className="text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-50 file:text-[#1B3C73] hover:file:bg-slate-100 cursor-pointer text-slate-650 transition-colors w-full"
                            />
                        </div>

                        {/* CAJA 4: ANOTACIONES */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Anotaciones (Excel)
                            </label>
                            <input 
                                type="file" 
                                accept=".xls,.xlsx" 
                                onChange={(e) => setFileAno(e.target.files ? e.target.files[0] : null)}
                                className="text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-bold file:bg-slate-50 file:text-[#1B3C73] hover:file:bg-slate-100 cursor-pointer text-slate-650 transition-colors w-full"
                            />
                        </div>

                        {/* BOTÓN SUBMIT */}
                        <div className="flex items-end xl:col-span-1 md:col-span-4 col-span-1">
                            <button 
                                type="submit" 
                                disabled={isLoading || (!fileCal && !fileAtr && !fileAno && !fileAsi)}
                                className="w-full bg-[#1B3C73] hover:bg-[#142d57] text-white shadow-md shadow-[#1B3C73]/20 hover:shadow-lg rounded-xl px-4 py-2.5 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] border-0 cursor-pointer"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Database className="w-4 h-4" /> Procesar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Renderización Dinámica Condicionada al Rol (RBAC) */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl min-h-[40vh] shadow-sm">
                    <RefreshCw className="w-10 h-10 animate-spin text-[#1B3C73] mb-3" />
                    <p className="text-slate-500 font-bold tracking-tight text-sm">Cargando datos del panel...</p>
                </div>
            ) : (
                <>
                    {activeRole === "director" && directorData && (
                        <DashboardMaestro data={directorData} evolucionData={evolucionData} desgloseData={desgloseData} />
                    )}

                    {activeRole === "coordinador" && coordinadorData && (
                        <FiltroHitl 
                            data={coordinadorData} 
                            onUpdateHITL={updateUmbralesHITL}
                            onGenerateRoadmap={triggerGenerateRoadmap}
                            onFetchDrillDown={fetchDrillDownDetails}
                            drillDownData={drillDownData}
                            isDrillDownLoading={isDrillDownLoading}
                            isRoadmapGenerating={isRoadmapGenerating}
                            roadmap={roadmap}
                        />
                    )}

                    {activeRole === "jefe_departamento" && jefeData && (
                        <TableroSeguimiento 
                            data={jefeData} 
                            onMoveKanban={moveKanbanHitoOptimistic}
                            onAddBitacora={addInputBitacora}
                        />
                    )}

                    {activeRole === "profesor" && profesorData && (
                        <PopUpDocente 
                            data={profesorData} 
                            onSubmitComment={submitDocenteComentario}
                            departamentoId={asignaturaId}
                        />
                    )}
                </>
            )}
        </div>
    );
}
