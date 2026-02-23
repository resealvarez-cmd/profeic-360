"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ChevronRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { PreObservation } from "@/components/360/PreObservation";
import { FocusMatrix } from "@/components/360/FocusMatrix";
import { Reflection } from "@/components/360/Reflection";

export default function ObservationPage({ params }: { params: { id: string } }) {
    const [cycle, setCycle] = useState<any>(null);
    const [lastCommitment, setLastCommitment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeStage, setActiveStage] = useState<'pre' | 'execution' | 'reflection'>('pre');

    // AI FLASH FEEDBACK STATE
    const [showFlashModal, setShowFlashModal] = useState(false);
    const [flashData, setFlashData] = useState<any>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Cycle Data
            const { data: cycleData, error } = await supabase
                .from('observation_cycles')
                .select('*, teacher:teacher_id(full_name)')
                .eq('id', params.id)
                .single();

            if (error || !cycleData) {
                // Mock Data for UI Development purposes if DB empty
                setCycle({
                    id: params.id || 'mock-id',
                    status: 'planned',
                    teacher: { full_name: 'Docente Demo' },
                    current_stage: 'pre' // Augmented field for UI
                });
                setLoading(false);
                return;
            }

            // Determine active stage based on status
            let stage: 'pre' | 'execution' | 'reflection' = 'pre';
            if (cycleData.status === 'in_progress') stage = 'execution';
            if (cycleData.status === 'completed') stage = 'reflection';

            setActiveStage(stage);
            setCycle(cycleData);

            // TRAJECTORY: Fetch Last Commitment (Older than this cycle)
            if (cycleData.teacher_id) {
                const { data: commitment } = await supabase
                    .from('commitments')
                    .select('*')
                    .eq('teacher_id', cycleData.teacher_id)
                    .lt('created_at', cycleData.created_at)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (commitment) setLastCommitment(commitment);
            }

            setLoading(false);
        };

        fetchData();
    }, [params.id]);

    const handleSave = async (stage: string, data: any) => {
        setLoading(true);
        console.log(`Saving ${stage}:`, data);

        try {
            // 1. Save Stage Data
            const { error: dataError } = await supabase
                .from('observation_data')
                .upsert({
                    cycle_id: cycle.id,
                    stage: stage,
                    content: data
                }, { onConflict: 'cycle_id, stage' });

            if (dataError) throw dataError;

            // 2. Determine Next Status
            let nextStatus = cycle.status;
            if (stage === 'pre') nextStatus = 'in_progress';
            // Execution keeps it in_progress usually, or moves to next step logically
            if (stage === 'reflection') nextStatus = 'completed';

            // 3. Update Cycle Status
            if (nextStatus !== cycle.status) {
                const { error: statusError } = await supabase
                    .from('observation_cycles')
                    .update({ status: nextStatus, updated_at: new Date() })
                    .eq('id', cycle.id);

                if (statusError) throw statusError;
            }

            // 4. SPECIAL LOGIC: Create Commitment on Reflection
            if (stage === 'reflection') {
                if (data.agreements) {
                    const { error: commitmentError } = await supabase
                        .from('commitments')
                        .insert({
                            cycle_id: cycle.id,
                            teacher_id: cycle.teacher_id,
                            description: data.agreements,
                            status: 'pending' // Default status for next cycle
                        });

                    if (commitmentError) throw commitmentError;
                }

                // --- TRIGGER AI FLASH FEEDBACK ---
                try {
                    const response = await fetch('http://127.0.0.1:8000/acompanamiento/flash-feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            cycle_id: cycle.id,
                            reflection_text: data.metacognition
                        })
                    });

                    if (response.ok) {
                        const aiResult = await response.json();
                        setFlashData(aiResult);
                        setShowFlashModal(true);
                        setLoading(false);
                        return; // Stop here to show modal, don't alert or redirect yet
                    } else {
                        console.error("AI Feedback Error:", await response.text());
                    }
                } catch (aiError) {
                    console.error("AI Connection Error:", aiError);
                }
            }

            // 5. Update Local State (If not reflection or if AI failed)
            setCycle({ ...cycle, status: nextStatus });

            if (stage === 'pre') setActiveStage('execution');
            if (stage === 'execution') setActiveStage('reflection');

            if (stage !== 'reflection') {
                alert("¡Datos guardados exitosamente!");
            } else {
                // If we are here, it means AI failed or we just want to close.
                // But normally we return early if AI succeeds.
                alert("Ciclo cerrado exitosamente.");
                router.push('/acompanamiento/dashboard');
            }

        } catch (error: any) {
            console.error("Error saving data:", error);
            alert("Error al guardar: " + error.message);
        } finally {
            if (!showFlashModal) setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Cargando ciclo...</div>;

    const tabs: Array<'pre' | 'execution' | 'reflection'> = ['pre', 'execution', 'reflection'];

    // WORKFLOW BLOCKING LOGIC (PEDAGOGICAL RIGOR)
    const isStageDisabled = (stage: string) => {
        if (stage === 'pre') return false; // Always accessible

        // EXECUTION BLOCK: Requires Pre-Observation Data (Focus & Support)
        if (stage === 'execution') {
            const preData = cycle?.observation_data?.find((d: any) => d.stage === 'pre')?.content;
            const hasFocus = preData?.focus && preData?.focus.length > 5;
            const hasSupport = preData?.support_req && preData?.support_req.length > 5;

            // If data is missing, BLOCK IT
            if (!hasFocus || !hasSupport) return true;

            return false; // Allow if Pre is done
        }

        // REFLECTION BLOCK: Requires Execution to be done (implied by cycle status or data presence)
        if (stage === 'reflection') {
            // Strict: Can't reflect if not executed or if cycle isn't advanced enough
            const exeData = cycle?.observation_data?.find((d: any) => d.stage === 'execution');
            return !exeData && cycle?.status !== 'completed';
        }

        return false;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-[#1a2e3b]">
            {/* Header de Navegación */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link href="/acompanamiento/dashboard" className="hover:text-[#1a2e3b] flex items-center gap-1 transition-colors">
                            <LayoutDashboard size={16} />
                            Dashboard
                        </Link>
                        <ChevronRight size={14} />
                        <span className="font-semibold text-[#1a2e3b]">Observación a {cycle?.teacher?.full_name}</span>
                    </div>

                    <div className="flex bg-slate-100 rounded-lg p-1">
                        {tabs.map((s) => {
                            const disabled = isStageDisabled(s);
                            let title = "";
                            if (disabled) {
                                if (s === 'execution') title = "Completa la Pre-Observación (Foco y Apoyo) para desbloquear.";
                                if (s === 'reflection') title = "Debes completar la Ejecución o terminar el ciclo.";
                            }

                            return (
                                <button
                                    key={s}
                                    onClick={() => !disabled && setActiveStage(s)}
                                    disabled={disabled}
                                    title={title}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wide flex items-center gap-2 ${activeStage === s
                                        ? 'bg-white text-[#2b546e] shadow-sm'
                                        : disabled
                                            ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                                            : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {disabled && <span className="text-[10px]">🔒</span>}
                                    {s === 'pre' ? 'Pre' : s === 'execution' ? 'Ejecución' : 'Reflexión'}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="max-w-6xl mx-auto p-6 md:p-10">
                {activeStage === 'pre' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PreObservation
                            onSubmit={(data: any) => handleSave('pre', data)}
                            lastCommitment={lastCommitment}
                        />
                    </div>
                )}

                {activeStage === 'execution' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <FocusMatrix
                            onSubmit={(data: any) => handleSave('execution', data)}
                            lastCommitment={lastCommitment}
                        />
                    </div>
                )}

                {activeStage === 'reflection' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Reflection onSubmit={(data: any) => handleSave('reflection', data)} />
                    </div>
                )}
                {/* Modal Flash Feedback */}
                {showFlashModal && flashData && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in-50 duration-300">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-tr from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                                    <span className="text-3xl">✨</span>
                                </div>
                                <h3 className="text-2xl font-black text-[#1a2e3b]">Flash Feedback</h3>
                                <p className="text-slate-500 font-medium">Análisis Instantáneo de IA</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 text-4xl">💪</div>
                                    <h4 className="font-bold text-purple-700 text-sm mb-1">FORTALEZA OCULTA</h4>
                                    <p className="text-[#1a2e3b] font-medium leading-relaxed">
                                        "{flashData.superpower}"
                                    </p>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10 text-4xl">🚀</div>
                                    <h4 className="font-bold text-amber-700 text-sm mb-1">DESAFÍO PARA MAÑANA</h4>
                                    <p className="text-[#1a2e3b] font-medium leading-relaxed">
                                        "{flashData.challenge}"
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowFlashModal(false);
                                    router.push('/acompanamiento/dashboard');
                                }}
                                className="w-full bg-[#1a2e3b] text-white py-4 rounded-xl font-bold hover:bg-[#2b546e] transition-all"
                            >
                                Entendido, Cerrar Observación
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
