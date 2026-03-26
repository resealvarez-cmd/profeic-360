"use client";

import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
    onTranscription: (text: string) => void;
}

export function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
    const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing'>('idle');
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await handleTranscription(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setStatus('recording');
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("No se pudo acceder al micrófono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && status === 'recording') {
            mediaRecorderRef.current.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            setStatus('transcribing');
        }
    };

    const handleTranscription = async (blob: Blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'observation.webm');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const response = await fetch(`${API_URL}/acompanamiento/transcribe`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Error en la transcripción");

            const data = await response.json();
            if (data.text) {
                onTranscription(data.text);
                toast.success("Voz transcrita exitosamente");
            }
        } catch (err) {
            console.error("Transcription error:", err);
            toast.error("Error al procesar la nota de voz.");
        } finally {
            setStatus('idle');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (status === 'transcribing') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg animate-pulse">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Escuchando...</span>
            </div>
        );
    }

    if (status === 'recording') {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-600" />
                    <span className="text-[10px] font-black tabular-nums">{formatTime(recordingTime)}</span>
                </div>
                <button
                    onClick={stopRecording}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    title="Detener grabación"
                >
                    <Square size={16} fill="currentColor" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={startRecording}
            className="p-2.5 text-slate-400 hover:text-[#1B3C73] hover:bg-slate-100 rounded-xl transition-all group relative"
            title="Añadir nota de voz"
        >
            <Mic size={18} className="group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border border-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}
