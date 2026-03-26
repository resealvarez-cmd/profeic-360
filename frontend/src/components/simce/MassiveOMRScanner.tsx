"use client";

import React, { useState, useRef } from "react";
import {
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
    Download,
    FileText,
    ChevronDown,
    ChevronRight,
    Search,
    Play
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface OMRResult {
    rut: string;
    answers: Record<string, string>;
    score?: number;
}

interface ScanItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'success' | 'error';
    results?: OMRResult[];
    errorMessage?: string;
}

export default function MassiveOMRScanner() {
    const [items, setItems] = useState<ScanItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const addFiles = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let files: FileList | null = null;
        if ('files' in e.target) files = e.target.files;
        else if ('dataTransfer' in e) files = e.dataTransfer.files;

        if (!files) return;

        const newItems: ScanItem[] = Array.from(files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            status: 'pending'
        }));
        setItems(prev => [...prev, ...newItems]);
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const processItem = async (item: ScanItem) => {
        updateItemStatus(item.id, 'processing');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMessage: "No hay sesión activa. Por favor, inicia sesión." } : i));
                return;
            }

            const formData = new FormData();
            formData.append("file", item.file);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutos de timeout para fotos 4K y red lenta

            const response = await fetch(`${API_BASE}/api/v1/omr/process`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${session.access_token}` },
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();
            if (response.ok) {
                // El backend actual solo devuelve un objeto, pero lo envolvemos en array para el 1:N futuro
                // Si el backend se actualiza para devolver una lista, se ajusta aquí.
                const results: OMRResult[] = [{
                    rut: data.rut || data.evaluation_instance_id || "Desconocido", // Usamos el ID de instancia como RUT temporal mientras el backend no extraiga RUT explícitamente
                    answers: data.answers
                }];
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success', results } : i));
            } else {
                console.error("400 ERROR BODY:", JSON.stringify(data, null, 2));
                setItems(prev => prev.map(i => i.id === item.id ? {
                    ...i,
                    status: 'error',
                    errorMessage: data.detail || JSON.stringify(data) || "Error de visión"
                } : i));
            }
        } catch (error: any) {
            console.error("DEBUG OMR ERROR:", error);
            const msg = error.name === 'AbortError' ? "Tiempo de espera agotado" : "Error de conexión/red";
            setItems(prev => prev.map(i => i.id === item.id ? {
                ...i,
                status: 'error',
                errorMessage: msg
            } : i));
        }
    };

    const updateItemStatus = (id: string, status: ScanItem['status']) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    };

    const processAll = async () => {
        const pending = items.filter(i => i.status === 'pending');
        if (pending.length === 0) return;

        setIsProcessing(true);
        toast.info(`Procesando ${pending.length} archivos...`);

        for (const item of pending) {
            await processItem(item);
        }

        setIsProcessing(false);
        // Verificar resultados finales
        // Usamos el callback de setItems para obtener el estado más reciente de 'items'
        // después de que todas las actualizaciones asíncronas de processItem se hayan procesado.
        setItems(currentItems => {
            const errors = currentItems.filter(i => i.status === 'error').length;
            const success = currentItems.filter(i => i.status === 'success').length;

            if (errors > 0) {
                toast.error(`Proceso finalizado. Éxitos: ${success}, Errores: ${errors}`);
            } else {
                toast.success("¡Todos los archivos procesados con éxito!");
            }
            return currentItems; // No modificamos el estado aquí, solo lo leemos para el toast
        });
    };

    const exportToCSV = () => {
        const successItems = items.filter(i => i.status === 'success' && i.results);
        if (successItems.length === 0) return;

        let csvContent = "\uFEFFArchivo,RUT,Pregunta,Respuesta\n";
        successItems.forEach(item => {
            item.results?.forEach(res => {
                Object.entries(res.answers).forEach(([q, ans]) => {
                    csvContent += `${item.file.name},${res.rut},${q},${ans || ""}\n`;
                });
            });
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `escaneo_omr_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen text-slate-800 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-[#1B3C73]">Escáner de Visión AI <span className="text-[#C87533]">ProfeIC</span></h1>
                        <p className="text-[11px] text-slate-500 font-medium">Corrección automatizada y masiva de evaluaciones SIMCE.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportToCSV}
                            disabled={!items.some(i => i.status === 'success')}
                            className="text-xs font-bold border border-slate-200 bg-white px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-40"
                        >
                            <Download size={14} /> Exportar CSV
                        </button>
                        <button
                            onClick={processAll}
                            disabled={isProcessing || !items.some(i => i.status === 'pending')}
                            className="text-xs font-bold bg-[#C87533] text-white px-6 py-2 rounded-lg shadow-sm hover:bg-[#B0652B] transition-transform flex items-center gap-2 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                            Procesar Lote
                        </button>
                    </div>
                </div>

                {/* Compact Dropzone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => { e.preventDefault(); addFiles(e as any); }}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 border border-dashed border-slate-300 bg-white rounded-xl flex items-center justify-center gap-4 cursor-pointer hover:border-[#1B3C73]/30 transition-all group"
                >
                    <div className="bg-slate-50 p-2 rounded-lg group-hover:bg-[#1B3C73]/5 transition-colors">
                        <Upload size={20} className="text-slate-400 group-hover:text-[#1B3C73]" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-600">Subir hojas de respuesta</p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Arrastra imágenes o archivos PDF con las respuestas del curso</p>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,.pdf" onChange={addFiles} />
                </div>

                {/* Results Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-3 text-[10px] font-black text-[#1B3C73] uppercase tracking-widest w-10"></th>
                                <th className="px-6 py-3 text-[10px] font-black text-[#1B3C73] uppercase tracking-widest">Archivo</th>
                                <th className="px-6 py-3 text-[10px] font-black text-[#1B3C73] uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-3 text-[10px] font-black text-[#1B3C73] uppercase tracking-widest text-center">Resultados</th>
                                <th className="px-6 py-3 text-[10px] font-black text-[#1B3C73] uppercase tracking-widest text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs italic">
                                        No hay archivos en la cola de procesamiento.
                                    </td>
                                </tr>
                            )}
                            {items.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className={`hover:bg-slate-50/50 transition-colors ${expandedIds.has(item.id) ? 'bg-slate-50/30' : ''}`}>
                                        <td className="px-6 py-3">
                                            {item.status === 'success' && (
                                                <button onClick={() => toggleExpand(item.id)} className="text-slate-400 hover:text-[#1B3C73]">
                                                    {expandedIds.has(item.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <FileText size={16} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700 truncate max-w-xs">{item.file.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex">
                                                {item.status === 'pending' && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Pendiente</span>}
                                                {item.status === 'processing' && (
                                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1">
                                                        <Loader2 size={10} className="animate-spin" /> Procesando
                                                    </span>
                                                )}
                                                {item.status === 'success' && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Éxito</span>}
                                                {item.status === 'error' && (
                                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1" title={item.errorMessage}>
                                                        <AlertCircle size={10} /> Error
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="text-xs font-mono font-bold text-[#1B3C73]">
                                                {item.results?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedIds.has(item.id) && item.results && (
                                        <tr className="bg-slate-50/50">
                                            <td colSpan={5} className="px-16 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {item.results.map((res, idx) => (
                                                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-[10px] font-black text-[#C87533] uppercase">RUT: {res.rut}</span>
                                                                <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                                                            </div>
                                                            <div className="grid grid-cols-5 gap-1">
                                                                {Object.entries(res.answers).slice(0, 10).map(([q, a]) => (
                                                                    <div key={q} className="bg-slate-50 border border-slate-100 rounded text-center py-1">
                                                                        <p className="text-[8px] text-slate-300 font-bold">{q}</p>
                                                                        <p className="text-[10px] font-black text-[#1B3C73] uppercase">{a || '-'}</p>
                                                                    </div>
                                                                ))}
                                                                {Object.keys(res.answers).length > 10 && (
                                                                    <div className="flex items-center justify-center text-[8px] font-bold text-slate-400 italic">
                                                                        +{Object.keys(res.answers).length - 10}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center gap-2 px-2">
                    <AlertCircle size={14} className="text-slate-400" />
                    <p className="text-[10px] text-slate-400 font-medium italic">
                        El motor ProfeIC procesa las hojas de forma segura. El RUT es extraído automáticamente de la hoja.
                    </p>
                </div>
            </div>
        </div>
    );
}
