"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Bell, ArrowRight, X } from "lucide-react";

interface PendingCycle { id: string; teacher_name: string; days_blocked: number; }
interface Props { userId: string; isObserver?: boolean; }

export function PendingReflectionBanner({ userId, isObserver = false }: Props) {
    const [pending, setPending] = useState<PendingCycle[]>([]);
    const [dismissed, setDismissed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const field = isObserver ? 'observer_id' : 'teacher_id';
                const { data: cycles } = await supabase
                    .from('observation_cycles')
                    .select('id, created_at, teacher_id, updated_at')
                    .eq('status', 'in_progress')
                    .eq(field, userId);
                if (!cycles || cycles.length === 0) return;

                const cycleIds = cycles.map((c: any) => c.id);
                const { data: obsData } = await supabase
                    .from('observation_data').select('cycle_id, stage').in('cycle_id', cycleIds);

                const pendingCycles = cycles.filter((cycle: any) => {
                    const stages = (obsData || []).filter((d: any) => d.cycle_id === cycle.id).map((d: any) => d.stage);
                    return stages.includes('execution') && !stages.includes('reflection');
                });
                if (pendingCycles.length === 0) return;

                const teacherIds = [...new Set(pendingCycles.map((c: any) => c.teacher_id))] as string[];
                const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', teacherIds);

                setPending(pendingCycles.map((cycle: any) => {
                    const profile = profiles?.find((p: any) => p.id === cycle.teacher_id);
                    const days = Math.max(0, Math.floor((Date.now() - new Date(cycle.updated_at || cycle.created_at).getTime()) / 86400000));
                    return { id: cycle.id, teacher_name: profile?.full_name || 'Docente', days_blocked: days };
                }));
            } catch (e) { console.error('PendingReflectionBanner:', e); }
        };
        fetchPending();
    }, [userId, isObserver]);

    if (pending.length === 0 || dismissed) return null;
    const isMultiple = pending.length > 1;

    return (
        <div className="relative mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
            <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 text-amber-400 hover:text-amber-600">
                <X size={14} />
            </button>
            <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl shrink-0">
                    <Bell size={18} className="text-amber-600 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                    {isObserver ? (
                        <>
                            <p className="text-sm font-black text-amber-800">
                                {isMultiple ? `${pending.length} ciclos esperan reflexión docente` : `Ciclo de ${pending[0].teacher_name} espera reflexión`}
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                {isMultiple
                                    ? 'Estos acompañamientos no se contabilizarán en métricas hasta que el docente complete su reflexión o cierres manualmente.'
                                    : `Lleva ${pending[0].days_blocked} día${pending[0].days_blocked !== 1 ? 's' : ''} sin cerrar. Puedes cerrarlo manualmente desde la página del ciclo.`}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {pending.slice(0, 3).map((c) => (
                                    <button key={c.id} onClick={() => router.push(`/acompanamiento/observacion/${c.id}`)}
                                        className="flex items-center gap-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg transition-colors">
                                        {c.teacher_name} <span className="text-amber-500 mx-1">· {c.days_blocked}d</span> <ArrowRight size={10} />
                                    </button>
                                ))}
                                {pending.length > 3 && <span className="text-[11px] text-amber-500 font-bold px-2 py-1.5">+{pending.length - 3} más</span>}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-black text-amber-800">
                                {isMultiple ? `Tienes ${pending.length} reflexiones pendientes` : 'Tienes una reflexión de acompañamiento pendiente'}
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                Tu acompañamiento no quedará registrado en métricas hasta que completes la reflexión final del ciclo.
                            </p>
                            <button onClick={() => router.push(`/acompanamiento/observacion/${pending[0].id}`)}
                                className="mt-3 flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors">
                                Completar reflexión ahora <ArrowRight size={13} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
