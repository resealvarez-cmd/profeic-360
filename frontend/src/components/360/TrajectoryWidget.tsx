"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export function TrajectoryWidget({ commitment }: { commitment: any }) {
    const [status, setStatus] = useState<string>(commitment?.status || 'pending');
    const [saving, setSaving] = useState(false);

    if (!commitment) {
        return (
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-sm italic">
                Sin compromisos registrados previamente. (Inicio de Trayectoria)
            </div>
        );
    }

    const handleMarkStatus = async (newStatus: 'achieved' | 'missed' | 'partial') => {
        if (!commitment.id) {
            toast.error("No se pudo identificar el compromiso.");
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase
                .from('commitments')
                .update({ status: newStatus })
                .eq('id', commitment.id);

            if (error) throw error;

            setStatus(newStatus);
            const labels: Record<string, string> = {
                achieved: '✅ Marcado como Logrado',
                partial: '⚠️ Marcado como Parcialmente Logrado',
                missed: '❌ Marcado como No Logrado'
            };
            toast.success(labels[newStatus]);
        } catch (err: any) {
            toast.error("Error al actualizar compromiso: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const statusConfig: Record<string, { label: string; bg: string; text: string; icon: JSX.Element }> = {
        achieved: {
            label: 'Logrado ✅',
            bg: 'bg-green-50 border-green-200',
            text: 'text-green-700',
            icon: <CheckCircle2 size={14} className="text-green-600" />
        },
        partial: {
            label: 'Parcialmente Logrado ⚠️',
            bg: 'bg-amber-50 border-amber-200',
            text: 'text-amber-700',
            icon: <AlertCircle size={14} className="text-amber-600" />
        },
        missed: {
            label: 'No Logrado ❌',
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-700',
            icon: <XCircle size={14} className="text-red-600" />
        },
        pending: {
            label: 'Pendiente de evaluación',
            bg: 'bg-orange-50 border-orange-200',
            text: 'text-orange-700',
            icon: <AlertCircle size={14} className="text-orange-500" />
        }
    };

    const current = statusConfig[status] || statusConfig.pending;

    return (
        <div className={`mb-8 p-6 rounded-2xl border-2 relative overflow-hidden shadow-sm transition-all duration-300 ${current.bg}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <BookOpen size={100} className="text-slate-800" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h3 className={`font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2 ${current.text}`}>
                        {current.icon}
                        Trayectoria: Compromiso del Ciclo Anterior
                    </h3>
                    <p className="text-[#1a2e3b] font-medium text-base italic leading-relaxed">
                        "{commitment.description}"
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {commitment.created_at
                            ? `Registrado el ${new Date(commitment.created_at).toLocaleDateString('es-CL')}`
                            : ''}
                    </p>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${current.bg} ${current.text}`}>
                    {current.label}
                </span>
            </div>

            {/* Evaluación del compromiso */}
            {status === 'pending' ? (
                <div className="mt-4 pt-4 border-t border-orange-200/60">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                        ¿El docente cumplió este compromiso?
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleMarkStatus('achieved')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Sí, lo logró
                        </button>
                        <button
                            onClick={() => handleMarkStatus('partial')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <AlertCircle size={14} />}
                            Parcialmente
                        </button>
                        <button
                            onClick={() => handleMarkStatus('missed')}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={14} />}
                            No lo logró
                        </button>
                    </div>
                </div>
            ) : (
                // Si ya está evaluado, mostrar botón para cambiar
                <div className="mt-3 pt-3 border-t border-slate-200/40">
                    <button
                        onClick={() => setStatus('pending')}
                        className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                    >
                        ← Cambiar evaluación
                    </button>
                </div>
            )}
        </div>
    );
}
