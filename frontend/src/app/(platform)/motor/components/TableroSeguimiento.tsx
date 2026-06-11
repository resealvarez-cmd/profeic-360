"use client";

import React, { useState } from "react";
import { JefeDepartamentoDashboard, KanbanItem } from "../types";
import { 
    Layout, 
    Plus, 
    ArrowRight, 
    ArrowLeft, 
    Check, 
    FileText, 
    User, 
    AlertTriangle, 
    Activity, 
    Award, 
    FileCheck,
    Sparkles,
    Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TableroSeguimientoProps {
    data: JefeDepartamentoDashboard;
    onMoveKanban: (hitoId: string, status: "Logrado" | "En proceso" | "Por hacer") => void;
    onAddBitacora: (titulo: string, evidencia: string) => void;
}

export default function TableroSeguimiento({
    data,
    onMoveKanban,
    onAddBitacora
}: TableroSeguimientoProps) {
    const [newTitle, setNewTitle] = useState<string>("");
    const [newEvidence, setNewEvidence] = useState<string>("");
    const [isAdding, setIsAdding] = useState<boolean>(false);

    // Estado local para rastrear qué tarjeta se está arrastrando
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const handleSubmitBitacora = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        
        onAddBitacora(newTitle.trim(), newEvidence.trim() || "N/A");
        setNewTitle("");
        setNewEvidence("");
        setIsAdding(false);
    };

    // Agrupar ítems por estado
    const porHacer = data.kanban_instruccional.filter(x => x.status === "Por hacer");
    const enProceso = data.kanban_instruccional.filter(x => x.status === "En proceso");
    const logrado = data.kanban_instruccional.filter(x => x.status === "Logrado");

    // Eventos del Drag and Drop Nativo
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("text/plain", id);
        setDraggingId(id);
    };

    const handleDragEnd = () => {
        setDraggingId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Permitir el Drop
    };

    const handleDrop = (e: React.DragEvent, newStatus: "Logrado" | "En proceso" | "Por hacer") => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain") || draggingId;
        if (id) {
            onMoveKanban(id, newStatus);
        }
        setDraggingId(null);
    };

    const renderColumn = (
        title: string, 
        items: KanbanItem[], 
        statusKey: "Logrado" | "En proceso" | "Por hacer",
        accentColor: string,
        glowColor: string
    ) => {
        return (
            <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, statusKey)}
                className={`flex-1 min-w-[280px] bg-white border border-slate-200/60 p-4 rounded-2xl flex flex-col gap-4 shadow-sm transition-all duration-300 ${
                    draggingId ? "ring-2 ring-dashed ring-slate-300 bg-slate-50" : ""
                }`}
            >
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2 font-mono">
                        <span className={`w-2.5 h-2.5 rounded-full ${accentColor} ${glowColor}`}></span>
                        {title}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold px-2 py-0.5 rounded-full border border-slate-200/60">
                        {items.length}
                    </span>
                </div>

                <div className="flex flex-col gap-3 min-h-[350px] transition-all">
                    <AnimatePresence mode="popLayout">
                        {items.length === 0 ? (
                            <motion.div 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 text-xs italic bg-slate-50"
                            >
                                <Sparkles className="w-5 h-5 text-slate-300 mb-1 animate-pulse" />
                                Arrastra hitos aquí
                            </motion.div>
                        ) : (
                            items.map((item) => {
                                // Obtener iniciales y prioridad basadas en el id
                                const isLogrado = statusKey === "Logrado";
                                const isEnProceso = statusKey === "En proceso";
                                const initials = item.id.includes("hito-1") ? "M.A." : item.id.includes("hito-2") ? "P.V." : "J.D.";
                                const priority = item.id.includes("hito-1") ? "Crítico" : item.id.includes("hito-2") ? "Alta" : "Media";

                                return (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        draggable
                                        onDragStart={(e: any) => handleDragStart(e, item.id)}
                                        onDragEnd={handleDragEnd}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98, rotate: -0.5 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                        className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 group relative overflow-hidden cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors"
                                    >
                                        {/* Línea lateral decorativa de estado */}
                                        <div className={`absolute left-0 inset-y-0 w-1.5 ${
                                            isLogrado ? "bg-emerald-500" : isEnProceso ? "bg-amber-500" : "bg-slate-300"
                                        }`}></div>

                                        <div className="flex flex-col gap-1.5 pl-1.5">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono border ${
                                                    priority === "Crítico" 
                                                        ? "bg-rose-50 text-rose-700 border-rose-200" 
                                                        : priority === "Alta"
                                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : "bg-slate-50 text-slate-600 border-slate-200"
                                                }`}>
                                                    {priority}
                                                </span>
                                                <div 
                                                    className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700 uppercase tracking-tight"
                                                    title={`Docente a cargo: ${initials}`}
                                                >
                                                    {initials}
                                                </div>
                                            </div>

                                            <span className="text-xs font-bold text-slate-800 leading-snug group-hover:text-black transition-colors">
                                                {item.titulo}
                                            </span>

                                            {item.evidencia && item.evidencia !== "N/A" && (
                                                <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-max mt-1">
                                                    <FileCheck className="w-3 h-3 text-emerald-600" /> Evidencia: {item.evidencia}
                                                </span>
                                            )}
                                        </div>

                                        {/* Controles de Transición Manuales (para accesibilidad / fallback táctil) */}
                                        <div className="flex items-center justify-end gap-1 mt-1 border-t border-slate-200/60 pt-2.5">
                                            {statusKey !== "Por hacer" && (
                                                <button 
                                                    onClick={() => onMoveKanban(item.id, isLogrado ? "En proceso" : "Por hacer")}
                                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                                    title="Mover a columna anterior"
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {statusKey !== "Logrado" && (
                                                <button 
                                                    onClick={() => onMoveKanban(item.id, statusKey === "Por hacer" ? "En proceso" : "Logrado")}
                                                    className="p-1 hover:bg-emerald-50 rounded text-emerald-600 hover:text-emerald-700 font-bold transition-all flex items-center gap-0.5 text-[9px]"
                                                    title="Avanzar estado"
                                                >
                                                    Avanzar <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {isLogrado && (
                                                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                                                    <Check className="w-3.5 h-3.5" /> Hito Logrado
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Cabecera del Tablero Premium */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                    <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                        <Layout className="w-5 h-5 text-[#1B3C73]" /> Kanban Didáctico de Asignatura: {data.departamento}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Registra y monitorea hitos didácticos vinculando obligatoriamente evidencias del aula escolar. ¡Arrastra las tarjetas para actualizarlas!</p>
                </div>

                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-[#1B3C73] hover:bg-[#142d57] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-250 flex items-center gap-1.5 shadow-md shadow-[#1B3C73]/20 shrink-0 font-mono"
                >
                    <Plus className="w-4 h-4" /> Registrar Hito en Bitácora
                </button>
            </div>

            {/* Registro en Bitácora de Aula (Hito rápido) */}
            {isAdding && (
                <form 
                    onSubmit={handleSubmitBitacora}
                    className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-end gap-4 animate-in slide-in-from-top-4 duration-200 shadow-sm"
                >
                    <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-xs font-bold text-slate-700 font-mono">Nombre del Hito Didáctico:</label>
                        <input 
                            type="text" 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Ej: Paso 4 - Práctica guiada con andamios de tracción..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#1B3C73] focus:border-[#1B3C73] focus:outline-none placeholder-slate-400"
                            required
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-xs font-bold text-slate-700 font-mono">Evidencia Vinculada:</label>
                        <input 
                            type="text" 
                            value={newEvidence}
                            onChange={(e) => setNewEvidence(e.target.value)}
                            placeholder="Ej: Guía de trabajo DOK2 impresa, captura de pantalla..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#1B3C73] focus:border-[#1B3C73] focus:outline-none placeholder-slate-400"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="flex-1 md:flex-none border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 md:flex-none bg-[#1B3C73] hover:bg-[#142d57] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#1B3C73]/20"
                        >
                            Guardar en Kanban
                        </button>
                    </div>
                </form>
            )}

            {/* Tres Columnas del Kanban con Drag and Drop */}
            <div className="flex flex-col lg:flex-row gap-6">
                {renderColumn("Por hacer (Backlog)", porHacer, "Por hacer", "bg-slate-400", "shadow-[0_0_8px_#94a3b8]")}
                {renderColumn("En proceso", enProceso, "En proceso", "bg-amber-500", "shadow-[0_0_10px_#f59e0b]")}
                {renderColumn("Logrado", logrado, "Logrado", "bg-emerald-500", "shadow-[0_0_10px_#10b981]")}
            </div>

            {/* Alertas de Asignatura (Jefe Depto) - Tabla Premium */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" /> Alertas Académicas de Asignatura
                </h4>
                <div className="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider font-mono">
                                <th className="p-3">Estudiante</th>
                                <th className="p-3">RUT</th>
                                <th className="p-3">Promedio Área</th>
                                <th className="p-3">Evidencia de Bloqueo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.alertas_academicas_depto.map((alert, idx) => (
                                <tr key={idx} className="text-xs border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-bold text-slate-800">{alert.nombre}</td>
                                    <td className="p-3 font-mono text-slate-500">{alert.rut}</td>
                                    <td className="p-3 font-mono text-rose-600 font-extrabold">{alert.promedio_area.toFixed(1)}</td>
                                    <td className="p-3 text-slate-600 font-medium italic">{alert.evidencia_bloqueo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
