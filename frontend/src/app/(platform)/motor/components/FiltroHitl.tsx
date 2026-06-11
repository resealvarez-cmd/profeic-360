"use client";

import React, { useState } from "react";
import { CoordinadorDashboard, AlumnoDobleRiesgo } from "../types";

const normalizeRut = (rut: string): string => {
    if (!rut) return "";
    return rut.replace(/[^0-9Kk]/g, "").toUpperCase().trim();
};
import { 
    Sliders, 
    Sparkles, 
    Activity, 
    BookOpen, 
    AlertTriangle, 
    Grid, 
    User, 
    Clock, 
    Shield, 
    Lock, 
    ArrowRight, 
    X, 
    FileText, 
    Award,
    Check
} from "lucide-react";

interface FiltroHitlProps {
    data: CoordinadorDashboard;
    onUpdateHITL: (umbrales: { asistencia_limite: number, peso_atrasos: number }, contexto: string) => Promise<any>;
    onGenerateRoadmap: () => Promise<any>;
    onFetchDrillDown: () => Promise<any>;
    drillDownData: any;
    isDrillDownLoading: boolean;
    isRoadmapGenerating: boolean;
    roadmap: any;
}

export default function FiltroHitl({
    data,
    onUpdateHITL,
    onGenerateRoadmap,
    onFetchDrillDown,
    drillDownData,
    isDrillDownLoading,
    isRoadmapGenerating,
    roadmap
}: FiltroHitlProps) {
    const [asistenciaLim, setAsistenciaLim] = useState<number>(data.consola_umbrales.asistencia_limite);
    const [pesoAtr, setPesoAtr] = useState<number>(data.consola_umbrales.peso_atrasos);
    const [contextoText, setContextoText] = useState<string>("");
    
    // Estado del Drawer (Zoom Clínico)
    const [selectedStudent, setSelectedStudent] = useState<AlumnoDobleRiesgo | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    
    const [isSuccessMsg, setIsSuccessMsg] = useState<string>("");

    const handleSaveHITL = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contextoText.trim()) {
            alert("Por favor ingresa un contexto cualitativo (licencias médicas, crisis familiares, etc.)");
            return;
        }
        await onUpdateHITL({ asistencia_limite: asistenciaLim, peso_atrasos: pesoAtr }, contextoText);
        setIsSuccessMsg("Umbrales y notas guardados exitosamente.");
        setTimeout(() => setIsSuccessMsg(""), 3000);
    };

    const handleOpenDrillDown = async (student: AlumnoDobleRiesgo) => {
        setSelectedStudent(student);
        setIsDrawerOpen(true);
        await onFetchDrillDown();
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300 relative text-slate-800">
            {/* LADO IZQUIERDO: Consola de Calibración Humana (Coordinador) */}
            <div className="xl:col-span-1 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-5 self-start text-slate-800 transition-all duration-300 hover:shadow-md">
                <div>
                    <h4 className="text-base font-extrabold text-[#10B981] tracking-tight flex items-center gap-1.5 uppercase font-sans">
                        <Sliders className="w-5 h-5 text-[#10B981]" /> Consola de Calibración
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Calibración dinámica de umbrales con validación cualitativa y pedagógica obligatoria</p>
                </div>

                <form onSubmit={handleSaveHITL} className="flex flex-col gap-5">
                    {/* Slider Asistencia Límite */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">Asistencia Límite de Alerta:</span>
                            <span className="font-mono font-extrabold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">{asistenciaLim}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="70" 
                            max="95" 
                            value={asistenciaLim}
                            onChange={(e) => setAsistenciaLim(parseInt(e.target.value))}
                            className="w-full accent-[#10B981] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none" 
                        />
                        <span className="text-[9px] text-slate-400 leading-relaxed">Porcentaje de asistencia mínimo para encender Doble Riesgo</span>
                    </div>

                    {/* Slider Peso Atrasos */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600">Ponderador de Atraso Crítico:</span>
                            <span className="font-mono font-extrabold text-[#D97706] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{pesoAtr.toFixed(1)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            value={pesoAtr}
                            onChange={(e) => setPesoAtr(parseFloat(e.target.value))}
                            className="w-full accent-[#D97706] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none" 
                        />
                        <span className="text-[9px] text-slate-400 leading-relaxed">Peso relativo de las llegadas tarde en la correlación de riesgo</span>
                    </div>

                    {/* Notas de Contexto del Coordinador */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            Anotación de Contexto UTP <span className="text-rose-500 font-extrabold">*</span>
                        </label>
                        <textarea
                            value={contextoText}
                            onChange={(e) => setContextoText(e.target.value)}
                            placeholder="Ej: Licencias médicas justificadas de Lenguaje. Dos estudiantes con problemas de habitabilidad o vulnerabilidad SEP reportados por tutor..."
                            className="w-full min-h-[90px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] focus:outline-none placeholder-slate-400"
                            required
                        />
                        <span className="text-[9px] text-slate-400 leading-relaxed">Registro cualitativo de variables no académicas obligatorio</span>
                    </div>

                    {isSuccessMsg && (
                        <div className="text-xs bg-emerald-500/10 text-[#10B981] p-2.5 rounded-lg font-bold border border-emerald-500/20 shadow-sm animate-pulse">
                            {isSuccessMsg}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="bg-[#10B981] hover:bg-[#0d9488] text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex justify-center items-center shadow-lg shadow-emerald-900/10 active:scale-95 border-0 cursor-pointer"
                    >
                        Guardar Calibración de Umbrales
                    </button>
                </form>

                <hr className="border-slate-100 my-2" />

                {/* Generador de Roadmap IA */}
                <div className="flex flex-col gap-3">
                    <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-tight">Plan de Conducción IA</h5>
                    <p className="text-[9px] text-slate-500 leading-relaxed">Diseña el Roadmap Instruccional y plan de reenseñanza por departamento basado en 7 pasos didácticos</p>
                    <button
                        onClick={onGenerateRoadmap}
                        disabled={isRoadmapGenerating}
                        className="w-full bg-[#C87533] hover:bg-[#ac6329] text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/10 disabled:opacity-50 active:scale-95 border-0 cursor-pointer"
                    >
                        {isRoadmapGenerating ? "Generando Roadmap..." : (
                            <>
                                <Sparkles className="w-4 h-4 text-amber-250 animate-pulse" /> Generar Plan de Reenseñanza
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* LADO DERECHO: Heatmap de Departamentos y Nómina de Alumnos */}
            <div className="xl:col-span-2 flex flex-col gap-6">
                {/* 1. Heatmap de Asignaturas/Departamentos */}
                <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4 text-slate-800 transition-all duration-300 hover:shadow-md">
                    <div>
                        <h4 className="text-base font-extrabold text-[#10B981] tracking-tight flex items-center gap-1.5 uppercase font-sans">
                            <Grid className="w-5 h-5 text-[#10B981]" /> Heatmap de Departamentos
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">Consola de monitoreo de alertas agregadas por departamento</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(data.heatmap_departamentos).map(([materia, info], idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden transition-all hover:scale-[1.02] duration-300">
                                {/* Color superior de estado de alerta */}
                                <div className={`absolute top-0 inset-x-0 h-1.5 ${
                                    info.promedio < 4.5 ? "bg-rose-500 shadow-[0_0_8px_#F43F5E]" : "bg-[#10B981] shadow-[0_0_8px_#10B981]"
                                }`}></div>
                                
                                <span className="text-xs font-extrabold text-slate-700 truncate font-sans">{materia}</span>
                                
                                <div className="flex justify-between items-center mt-1 text-[11px]">
                                    <span className="text-slate-500">Promedio:</span>
                                    <span className={`font-bold font-mono ${info.promedio < 4.5 ? "text-rose-600" : "text-[#10B981]"}`}>{info.promedio.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500">Atrasos:</span>
                                    <span className="font-bold text-slate-600">{info.atrasos_mins} min</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500">Anotaciones:</span>
                                    <span className="font-bold text-rose-600 font-mono">{info.anotaciones}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Nómina de Alumnos en Doble Riesgo */}
                <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex flex-col gap-4 text-slate-800 transition-all duration-300 hover:shadow-md">
                    <div>
                        <h4 className="text-base font-extrabold text-rose-550 tracking-tight flex items-center gap-1.5 uppercase font-sans">
                            <Activity className="w-5 h-5 text-rose-550 animate-pulse" /> Nómina de Alumnos en Doble Riesgo
                        </h4>
                        <p className="text-xs text-slate-555 font-medium">Estudiantes que combinan asistencia insuficiente (&lt;85%) y rezago académico. Haz clic para zoom clínico.</p>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-inner">
                        <table className="w-full text-left border-collapse bg-white">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                                    <th className="p-3">Estudiante</th>
                                    <th className="p-3">RUT</th>
                                    <th className="p-3">Asistencia</th>
                                    <th className="p-3">Promedio</th>
                                    <th className="p-3">Atraso Mins</th>
                                    <th className="p-3">Camuflaje</th>
                                    <th className="p-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.alumnos_doble_riesgo_detalle.map((student, idx) => (
                                    <tr 
                                        key={idx} 
                                        onClick={() => handleOpenDrillDown(student)}
                                        className="text-xs hover:bg-slate-50/80 border-b border-slate-100 transition-all cursor-pointer group"
                                    >
                                        <td className="p-3 font-bold text-slate-700 flex items-center gap-2">
                                            <div className="w-6 h-6 bg-rose-50/50 text-rose-600 rounded-full flex items-center justify-center font-bold text-[10px] border border-rose-200">
                                                {student.nombre[0]}
                                            </div>
                                            {student.nombre}
                                        </td>
                                        <td className="p-3 font-mono text-slate-500">{student.rut}</td>
                                        <td className="p-3 font-mono text-rose-600 font-bold">{student.asistencia}%</td>
                                        <td className="p-3 font-mono text-rose-600 font-bold">{student.promedio.toFixed(1)}</td>
                                        <td className="p-3 font-mono text-slate-600">{student.atraso_minutos} min</td>
                                        <td className="p-3">
                                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                                student.indice_camuflaje > 0.5 
                                                    ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            }`}>
                                                {student.indice_camuflaje > 0.5 ? "Alto" : "Bajo"}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right text-xs font-bold text-[#10B981] group-hover:underline flex justify-end items-center gap-0.5 transition-colors">
                                            Zoom Clínico <ArrowRight className="w-3.5 h-3.5" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* SECCIÓN ROADMAP GENERADO: Se muestra si existe y no está generando */}
            {roadmap && (
                <div className="xl:col-span-3 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-5 animate-in fade-in duration-500 text-slate-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-base font-extrabold text-[#10B981] tracking-tight flex items-center gap-2 uppercase font-sans">
                                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                                {roadmap.titulo_roadmap}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">Roadmap didáctico estratégico y plan de reenseñanza sugerido por la IA de ProfeIC</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                        {/* Camuflaje y Convivencia */}
                        <div className="flex flex-col gap-4">
                            {/* Camuflaje Cognitivo */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded border border-rose-250 uppercase tracking-wide">
                                        Camuflaje Cognitivo
                                    </span>
                                    <span className="text-xs font-bold text-slate-600">Brecha SIMCE vs Notas</span>
                                </div>
                                <p className="text-xs text-slate-550 font-medium italic leading-relaxed">
                                    {roadmap.diagnostico_camuflaje.deteccion_brecha}
                                </p>
                                <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                                    {roadmap.diagnostico_camuflaje.explicacion}
                                </p>
                            </div>

                            {/* Convivencia */}
                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded border border-amber-200 uppercase w-max tracking-wide">
                                    Convivencia e IDPS
                                </span>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    {roadmap.analisis_convivencia_aula.nudos_criticos}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {roadmap.analisis_convivencia_aula.bloqueadores_identificados.map((b: string, i: number) => (
                                        <span key={i} className="text-[9px] bg-slate-200 text-slate-600 border border-slate-300 font-bold px-2 py-0.5 rounded-full">
                                            {b}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Secuencia Didáctica de 7 Pasos */}
                        <div className="flex flex-col gap-4">
                            <span className="text-xs font-extrabold text-slate-700 uppercase tracking-tight flex items-center gap-1.5 font-sans">
                                <Award className="w-5 h-5 text-[#10B981]" /> Propuesta de Secuencia Didáctica
                            </span>
                            
                            <div className="max-h-[300px] overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                                {Object.entries(roadmap.roadmap_secuencia_didactica.pasos).map(([paso, desc], i) => (
                                    <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex gap-2 shadow-sm">
                                        <div className="w-5 h-5 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-extrabold text-[10px] shrink-0 border border-[#10B981]/25">
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{paso.replace("paso_", "").replace("_", " ")}</span>
                                            <p className="text-xs text-slate-600 leading-relaxed font-sans">{desc as string}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LATERAL DRAWER (Zoom Clínico) */}
            {isDrawerOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    {/* Background overlay click close */}
                    <div className="flex-1" onClick={() => setIsDrawerOpen(false)}></div>
                    
                    {/* Drawer Content */}
                    <div className="w-full max-w-lg bg-white/95 border-l border-slate-200 backdrop-blur-lg h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right-4 duration-300 overflow-y-auto text-slate-800">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 shadow-sm">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-800 tracking-tight font-sans">Zoom Clínico: {selectedStudent.nombre}</h3>
                                    <p className="text-[10px] text-slate-500 font-mono">RUT: {selectedStudent.rut} | Período: {data.periodo_id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsDrawerOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-850 transition-colors border-0 bg-transparent cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {isDrillDownLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                                <Activity className="w-8 h-8 animate-spin text-[#10B981]" />
                                <p className="text-xs text-slate-500 font-medium font-sans">Extrayendo datos de la bitácora docente...</p>
                            </div>
                        ) : drillDownData ? (
                            <div className="flex flex-col gap-6 mt-6">
                                {/* Atrasos Netos */}
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-xs font-extrabold text-slate-700 uppercase flex items-center gap-1.5 font-sans">
                                        <Clock className="w-4 h-4 text-amber-500" /> Atrasos Netos Acumulados
                                    </h4>
                                    <div className="bg-slate-55 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Tiempo de Inasistencia Inversa</p>
                                            <p className="text-lg font-extrabold text-slate-800 font-mono mt-0.5">{selectedStudent.atraso_minutos} minutos</p>
                                        </div>
                                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded border border-amber-200 font-mono">
                                            {(selectedStudent.atraso_minutos / 60).toFixed(1)} horas perdidas
                                        </span>
                                    </div>
                                </div>

                                {/* Anotaciones RICE */}
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-xs font-extrabold text-slate-700 uppercase flex items-center gap-1.5 font-sans">
                                        <AlertTriangle className="w-4 h-4 text-rose-500" /> Anotaciones RICE Registradas
                                    </h4>
                                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                                        {drillDownData.anotaciones_rice.filter((x: any) => normalizeRut(x.rut) === normalizeRut(selectedStudent.rut)).length === 0 ? (
                                            <p className="text-xs text-slate-500 italic pl-1 font-sans">No registra anotaciones de convivencia este periodo.</p>
                                        ) : (
                                            drillDownData.anotaciones_rice
                                                .filter((x: any) => normalizeRut(x.rut) === normalizeRut(selectedStudent.rut))
                                                .map((anot: any, i: number) => (
                                                    <div key={i} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex flex-col gap-1.5 relative overflow-hidden pl-5 hover:bg-slate-50 transition-all duration-300">
                                                        <div className={`absolute left-0 inset-y-0 w-2.5 ${
                                                            anot.gravedad === "Gravísima" ? "bg-rose-500 shadow-[0_0_6px_#F43F5E]" : anot.gravedad === "Grave" ? "bg-amber-600 shadow-[0_0_6px_#D97706]" : "bg-sky-500"
                                                        }`}></div>
                                                        <div className="flex justify-between items-center text-[9px] uppercase tracking-wide">
                                                            <span className="font-extrabold text-slate-500">{anot.tipo}</span>
                                                            <span className={`font-bold ${
                                                                anot.gravedad === "Gravísima" ? "text-rose-600" : anot.gravedad === "Grave" ? "text-amber-600" : "text-sky-600"
                                                            }`}>
                                                                RICE {anot.gravedad}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-650 font-medium leading-relaxed font-sans">{anot.motivo}</p>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                </div>

                                {/* Reactivos Evaluaciones */}
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-xs font-extrabold text-slate-700 uppercase flex items-center gap-1.5 font-sans">
                                        <Award className="w-4 h-4 text-sky-500" /> Desempeño Evaluaciones e Ítems
                                    </h4>
                                    <div className="flex flex-col gap-2 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30">
                                        {drillDownData.reactivos_pruebas.map((req: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <div className="flex flex-col gap-0.5 font-sans">
                                                    <span className="text-xs font-bold text-slate-700">{req.item} <span className="text-[10px] text-slate-450 font-normal">({req.oa})</span></span>
                                                    <span className="text-[8px] font-extrabold text-[#10B981] uppercase tracking-wider">DOK {req.dok_level}</span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="text-xs font-mono font-bold text-slate-700">{req.porcentaje_logro}%</span>
                                                    <span className={`w-2 h-2 rounded-full ${
                                                        req.alerta_rezago ? "bg-rose-500 shadow-[0_0_6px_#F43F5E] animate-pulse" : "bg-[#10B981]"
                                                    }`}></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
