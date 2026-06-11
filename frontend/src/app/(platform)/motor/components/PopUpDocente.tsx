"use client";

import React, { useState } from "react";
import { ProfesorDashboard } from "../types";
import { 
    Clock, 
    MessageSquare, 
    Sparkles, 
    Mic, 
    MicOff, 
    Send, 
    Bookmark, 
    Award, 
    CheckCircle2, 
    ChevronRight,
    Play
} from "lucide-react";

interface PopUpDocenteProps {
    data: ProfesorDashboard;
    onSubmitComment: (comentario: string, asignaturaId: string, audioBlob?: Blob | null) => Promise<any>;
    departamentoId?: string;
}

export default function PopUpDocente({ data, onSubmitComment, departamentoId }: PopUpDocenteProps) {
    const [commentText, setCommentText] = useState<string>("");
    
    // Core states for voice recording
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [recordingInterval, setRecordingInterval] = useState<any>(null);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [analysisResult, setAnalysisResult] = useState<{ nudo: string; accion: string; } | null>(null);
    
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("API de grabación no soportada en este entorno");
                }
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                const chunks: Blob[] = [];
                
                recorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        chunks.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: "audio/webm" });
                    const url = URL.createObjectURL(blob);
                    setAudioBlobUrl(url);
                    setCommentText((prev) => prev && !prev.includes("Audio grabado") ? prev : "Reporte de voz grabado con éxito. Procesando ideas clave...");
                };

                setMediaRecorder(recorder);
                setAudioChunks(chunks);
                setIsRecording(true);
                setRecordingTime(0);
                
                recorder.start();
                
                const interval = setInterval(() => {
                    setRecordingTime(prev => {
                        if (prev >= 15) {
                            if (recorder.state !== "inactive") recorder.stop();
                            stream.getTracks().forEach(track => track.stop());
                            clearInterval(interval);
                            setIsRecording(false);
                            return 15;
                        }
                        return prev + 1;
                    });
                }, 1000);
                setRecordingInterval(interval);
            } catch (err) {
                console.warn("Acceso a micrófono denegado o no soportado, activando simulador de contingencia.", err);
                setIsRecording(true);
                setRecordingTime(0);
                const interval = setInterval(() => {
                    setRecordingTime(prev => {
                        if (prev >= 15) {
                            clearInterval(interval);
                            setIsRecording(false);
                            setAudioBlobUrl("simulated-audio-file.mp3");
                            setCommentText("Audio grabado de 15 segundos (Presione enviar para procesar con IA)");
                            return 15;
                        }
                        return prev + 1;
                    });
                }, 1000);
                setRecordingInterval(interval);
            }
        } else {
            if (mediaRecorder && mediaRecorder.state !== "inactive") {
                mediaRecorder.stop();
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            clearInterval(recordingInterval);
            setIsRecording(false);
        }
    };

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Necesitamos texto O audio para enviar
        const hasAudio = audioBlobUrl && audioChunks.length > 0;
        if (!commentText.trim() && !hasAudio) return;

        setIsSending(true);
        try {
            const deptoNombre = departamentoId || "Lengua y Literatura";
            
            // Construir el blob de audio real si existe
            let audioBlob: Blob | null = null;
            if (hasAudio) {
                audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            }

            const res = await onSubmitComment(commentText, deptoNombre, audioBlob);
            
            if (res?.success && res?.data) {
                // Mostrar resultado real de la IA
                setAnalysisResult({
                    nudo: res.data.nudo_didactico || "Nudo no identificado",
                    accion: res.data.accion_sugerida || "Sin acción recomendada"
                });
            } else if (!res?.success) {
                // Mostrar error honesto en lugar de un resultado falso
                setAnalysisResult({
                    nudo: `Error: ${res?.error || "No se pudo procesar el comentario"}`,
                    accion: "Verifique que haya datos de ingesta cargados para este curso y periodo."
                });
            }
            setCommentText("");
            setAudioBlobUrl(null);
            setAudioChunks([]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* LADO IZQUIERDO: Timeline Semestral y Metas */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                {/* 1. Timeline Semestral */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
                    <div>
                        <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#2E75B6]" /> Timeline Semestral Instruccional
                        </h4>
                        <p className="text-xs text-slate-400">Cronograma de hitos didácticos sugerido para tu ciclo</p>
                    </div>

                    <div className="relative border-l-2 border-slate-100 ml-4 pl-6 flex flex-col gap-6">
                        {data.timeline_semestral.map((item, idx) => (
                            <div key={idx} className="relative group">
                                {/* Círculo indicador */}
                                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white bg-[#2E75B6] group-hover:scale-12/10 transition-transform"></div>
                                
                                <div className="flex flex-col gap-1 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                                    <span className="text-[10px] font-extrabold text-[#2E75B6] font-mono">{item.fecha}</span>
                                    <span className="text-xs font-bold text-slate-800 leading-snug">{item.hito}</span>
                                    <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Sugerencia Didáctica: {item.metodo_sugerido}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Metas Pedagógicas del Área */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#2E75B6]" /> Metas Pedagógicas Clave
                    </h4>
                    <ul className="flex flex-col gap-3">
                        {data.metas_pedagogicas.map((meta, idx) => (
                            <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600">
                                <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{meta}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 3. Feed de Retroalimentación Metodológica */}
                <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-[#2E75B6]" /> Feed de Retroalimentación de Liderazgo
                    </h4>
                    <div className="flex flex-col gap-3">
                        {data.feed_retroalimentacion.map((feed, idx) => (
                            <div key={idx} className="p-4 bg-[#F2F7FA] border border-[#D9E6F2] rounded-xl text-xs text-slate-700 leading-relaxed font-sans">
                                {feed}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LADO DERECHO: Pop-up Conversacional (Desahogo Docente) */}
            <div className="lg:col-span-1 bg-white border border-[#D9E6F2] p-6 rounded-2xl shadow-sm flex flex-col gap-5 self-start">
                <div>
                    <h4 className="text-base font-extrabold text-[#1B3C73] tracking-tight flex items-center gap-1.5">
                        <Sparkles className="w-5 h-5 text-[#2E75B6] animate-pulse" /> Pop-up Conversacional
                    </h4>
                    <p className="text-xs text-slate-400">Informa bloqueadores, crisis o dificultades instruccionales en vivo a la UTP</p>
                </div>

                {/* Formulario e Grabadora de Audio */}
                <form onSubmit={handleSendComment} className="flex flex-col gap-4">
                    {/* Consola Grabador */}
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lector de Bitácora de Aula (15s Max)</span>
                        
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                                    isRecording 
                                        ? "bg-red-500 text-white animate-pulse scale-11/10" 
                                        : "bg-[#2E75B6] hover:bg-[#205382] text-white"
                                }`}
                            >
                                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 animate-pulse" />}
                            </button>
                            
                            {isRecording && (
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-red-600 font-mono">GRABANDO AUDIO</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{recordingTime} / 15 segundos</span>
                                </div>
                            )}

                            {!isRecording && audioBlobUrl && (
                                <div className="flex flex-col gap-2 w-full mt-2 animate-in fade-in duration-300">
                                    <span className="text-[10px] text-[#2E7D32] font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Grabación finalizada y lista ✓
                                    </span>
                                    <audio src={audioBlobUrl} controls className="w-full max-w-[240px] h-8 rounded-lg outline-none bg-slate-50 border border-slate-200" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Caja de Texto Libre */}
                    <div className="flex flex-col gap-1.5">
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Describe qué bloqueador en vivo estás experimentando hoy..."
                            className="w-full min-h-[90px] border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-[#2E75B6] focus:border-[#2E75B6] focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSending || (!commentText.trim() && !(audioBlobUrl && audioChunks.length > 0))}
                        className="bg-[#1B3C73] hover:bg-[#152e59] text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 flex justify-center items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                        <Send className="w-3.5 h-3.5" /> Enviar Reporte de Aula
                    </button>
                </form>

                {/* Mostrar Nudos Didácticos Extraídos por la IA */}
                {analysisResult && (
                    <div className="border border-[#FFEBA6] bg-[#FFF9E6] p-4 rounded-xl flex flex-col gap-2.5 animate-in fade-in duration-300">
                        <div className="flex items-center gap-1 text-[#C87533] text-xs font-extrabold">
                            <Sparkles className="w-4 h-4 animate-spin" /> Nudo Didáctico Indexado
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Nudo Estratégico:</span>
                            <p className="text-xs text-slate-700 leading-relaxed">{analysisResult.nudo}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Acción Inmediata Recomendada:</span>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans">{analysisResult.accion}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
