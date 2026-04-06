"use client";

import { useState } from "react";
import { Send, Target, CheckCircle2, Mic, Square, Trash2, Play, Pause, Loader2 } from "lucide-react";
import { TrajectoryWidget } from "./TrajectoryWidget";

const CURRICULAR_TAGS = [
    { id: 'paso1_activacion', label: '1. Activación de Conocimientos' },
    { id: 'paso2_desafio', label: '2. Desafío Cognitivo' },
    { id: 'paso3_modelamiento', label: '3. Modelamiento Experto' },
    { id: 'paso4_practica_guiada', label: '4. Práctica Guiada' },
    { id: 'paso5_practica_independiente', label: '5. Práctica Independiente' },
    { id: 'paso6_feedback', label: '6. Retroalimentación Formativa' },
    { id: 'paso7_extension', label: '7. Desafío de Extensión' }
];

const CONVIVENCIA_TAGS = [
    { id: 'conv1_clima', label: '1. Clima de Aula y Normas' },
    { id: 'conv2_contencion', label: '2. Contención y Regulación Emocional' },
    { id: 'conv3_conflictos', label: '3. Resolución de Conflictos' },
    { id: 'conv4_participacion', label: '4. Participación Equitativa e Inclusión' },
    { id: 'conv5_refuerzo', label: '5. Refuerzo Positivo y Motivación' },
    { id: 'conv6_colaborativo', label: '6. Trabajo Colaborativo' }
];

export function PreObservation({ onSubmit, initialData = {}, lastCommitment, rubricType = 'curricular' }: any) {
    const activeTags = rubricType === 'convivencia' ? CONVIVENCIA_TAGS : CURRICULAR_TAGS;
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData.selected_tags || []);
    const [contextNote, setContextNote] = useState(initialData.context_note || "");
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(initialData.audio_url || null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const toggleTag = (id: string) => {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter(t => t !== id));
        } else if (selectedTags.length < 2) {
            setSelectedTags([...selectedTags, id]);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioURL(url);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing mic:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSubmit = () => {
        onSubmit({
            selected_tags: selectedTags,
            context_note: contextNote,
            audio_url: audioURL // In a real app, we'd upload this to S3/Supabase Storage first
        });
    };

    return (
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
            {/* TRAJECTORY SYSTEM */}
            <TrajectoryWidget commitment={lastCommitment} />

            <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <h2 className="text-2xl font-bold text-[#1a2e3b] flex items-center gap-3">
                    <Target className="text-[#f2ae60]" size={28} />
                    Acuerdo de Acompañamiento
                </h2>
                <p className="mt-2 text-sm text-slate-500 font-medium">
                    Declara tu FOCO DE OBSERVACIÓN seleccionando hasta 2 de {rubricType === 'convivencia' ? 'las Dimensiones de Convivencia Educativa' : 'los Pasos del Aprendizaje Profundo'} donde te gustaría recibir mayor retroalimentación.
                </p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-black text-[#2b546e] mb-4 uppercase tracking-wider">
                        1. Foco Principal (Selecciona hasta 2)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
                                        ${isSelected 
                                            ? 'border-[#C87533] bg-orange-50 shadow-md transform -translate-y-1' 
                                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                                        }
                                        ${!isSelected && selectedTags.length >= 2 ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                    disabled={!isSelected && selectedTags.length >= 2}
                                >
                                    <span className={`font-semibold text-sm ${isSelected ? 'text-[#C87533]' : 'text-slate-600'}`}>
                                        {tag.label}
                                    </span>
                                    {isSelected && (
                                        <CheckCircle2 className="text-[#C87533]" size={20} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <label className="block text-sm font-black text-[#2b546e] mb-2 uppercase tracking-wider">
                        2. Contexto Adicional (Opcional)
                    </label>
                    <span className="block text-xs font-normal text-slate-400 mb-3">
                        {rubricType === 'convivencia' 
                            ? '¿Existe alguna dinámica de grupo, situación conflictiva reciente o caso particular que deba conocer antes de entrar al aula?'
                            : '¿Algo más que el acompañante deba saber? (Ej: Curso muy agitado después de recreo)'}
                    </span>
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={contextNote}
                            onChange={(e) => setContextNote(e.target.value)}
                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#1B3C73] focus:border-transparent min-h-[100px] text-sm text-slate-700 placeholder:text-slate-300 transition-all"
                            placeholder="Escribe aquí un contexto breve..."
                        />
                        
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {isRecording ? (
                                <button 
                                    onClick={stopRecording}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold animate-pulse"
                                >
                                    <Square size={14} /> Detener Grabación
                                </button>
                            ) : (
                                <button 
                                    onClick={startRecording}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1B3C73] text-white rounded-xl text-xs font-bold hover:bg-[#2A59A8] transition-all"
                                >
                                    <Mic size={14} /> Grabar Nota de Voz
                                </button>
                            )}

                            {audioURL && (
                                <div className="flex items-center gap-3 flex-1">
                                    <audio src={audioURL} controls className="h-8 flex-1" />
                                    <button 
                                        onClick={() => { setAudioURL(null); setAudioBlob(null); }}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                            
                            {!audioURL && !isRecording && (
                                <p className="text-[10px] text-slate-400 font-medium italic">O captura una nota de voz rápida para mayor detalle.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <button
                    onClick={handleSubmit}
                    disabled={selectedTags.length === 0}
                    className="px-8 py-4 rounded-xl bg-[#1a2e3b] text-white hover:bg-[#2b546e] font-black flex items-center gap-2 shadow-lg shadow-blue-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                >
                    <Send size={18} />
                    Confirmar Foco y Acuerdo
                </button>
            </div>
        </div>
    );
}
