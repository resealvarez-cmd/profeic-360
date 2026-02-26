"use client";
import { useState, useRef, useEffect } from "react";
import {
    Send, Bot, Sparkles, Trash2,
    BookHeart, GraduationCap, Scale, MessageSquare, User
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/telemetry";

import { supabase } from "@/lib/supabaseClient"; // <--- Import Supabase

interface Message {
    role: "user" | "ai";
    content: string;
}

const SUGGESTIONS = [
    {
        icon: BookHeart,
        title: "Oración del Día",
        prompt: "Hola Mentor. Necesito una breve oración y una reflexión pedagógica basada en el Evangelio de hoy para iniciar mi clase."
    },
    {
        icon: GraduationCap,
        title: "Estrategias DUA",
        prompt: "Dame 3 estrategias DUA concretas (Representación, Acción, Motivación) para enseñar un contenido difícil a un curso diverso."
    },
    {
        icon: Scale,
        title: "Decreto 67",
        prompt: "¿Cómo puedo aplicar la evaluación formativa según el Decreto 67 para evitar el agobio de corregir tantas calificaciones?"
    },
    {
        icon: MessageSquare,
        title: "Convivencia",
        prompt: "Tengo un conflicto entre estudiantes. ¿Cómo puedo abordarlo desde un enfoque formativo y de resolución pacífica?"
    }
];

export default function MentorPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState("Colega"); // <--- Nuevo Estado
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // EFECTO: Cargar nombre del usuario
    useEffect(() => {
        trackEvent({ eventName: 'page_view', module: 'mentor' });
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Leemos nombre del metadata o perfiles
                const nombre = user.user_metadata?.full_name?.split(" ")[0] || "Profe";
                setUserName(nombre);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    const enviar = async (texto = input) => {
        if (!texto.trim()) return;

        const userMsg: Message = { role: "user", content: texto };
        const newHistory = [...messages, userMsg];

        setMessages(newHistory);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/chat-mentor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: newHistory,
                    user_name: userName // <--- Enviamos el nombre
                })
            });
            const data = await res.json();
            setMessages([...newHistory, { role: "ai", content: data.response }]);

            // Telemetry: Generation Success (Mentor chat completion)
            trackEvent({
                eventName: 'generation_success',
                module: 'mentor',
                metadata: {
                    chat_length: newHistory.length + 1
                }
            });
        } catch (e) {
            setMessages([...newHistory, { role: "ai", content: "Error de conexión. Intenta nuevamente." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            enviar();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#f0f4f8] text-[#1a2e3b] font-sans">

            {/* Header - Más limpio */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#2b546e] to-[#1a2e3b] rounded-xl text-white shadow-md">
                        <Bot size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[#1a2e3b]">Mentor IC</h1>
                        <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Colegio Madre Paulina</p>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([])}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                    title="Limpiar Chat"
                >
                    <Trash2 size={18} />
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="max-w-2xl w-full text-center space-y-8">
                            <div className="inline-block p-4 rounded-full bg-white shadow-sm mb-4">
                                <Sparkles className="w-12 h-12 text-[#f2ae60]" />
                            </div>

                            <h2 className="text-3xl font-extrabold text-[#1a2e3b] tracking-tight">
                                Hola, <span className="text-[#f2ae60]">Director</span>
                            </h2>
                            <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                                Tu asistente experto en normativa, pedagogía y pastoral está listo. ¿Por dónde empezamos hoy?
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left px-4">
                                {SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => enviar(s.prompt)}
                                        className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-[#f2ae60]/50 hover:-translate-y-0.5 transition-all group flex gap-4 items-start"
                                    >
                                        <div className="p-2 rounded-lg bg-blue-50 text-[#2b546e] group-hover:bg-[#f2ae60] group-hover:text-white transition-colors">
                                            <s.icon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-[#1a2e3b] mb-1">{s.title}</h3>
                                            <p className="text-xs text-slate-400 leading-snug">{s.prompt}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={cn("flex w-full gap-4", msg.role === "user" ? "justify-end" : "justify-start")}>

                            {/* Avatar IA */}
                            {msg.role === "ai" && (
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                    <Bot size={16} className="text-[#2b546e]" />
                                </div>
                            )}

                            {/* Globo de Texto */}
                            <div className={cn(
                                "relative px-6 py-4 max-w-2xl shadow-sm text-[15px] leading-7",
                                msg.role === "user"
                                    ? "bg-[#1a2e3b] text-white rounded-2xl rounded-tr-sm" // Azul elegante
                                    : "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm" // Blanco limpio
                            )}>
                                <div className={cn("prose prose-sm max-w-none", msg.role === "user" ? "prose-invert" : "prose-slate")}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>

                            {/* Avatar Usuario */}
                            {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-[#f2ae60] flex items-center justify-center shrink-0 mt-1 shadow-sm text-[#1a2e3b]">
                                    <User size={16} />
                                </div>
                            )}
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex justify-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                            <Bot size={16} className="text-[#2b546e]" />
                        </div>
                        <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-[#f2ae60] rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-[#f2ae60] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-[#f2ae60] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Flotante y Moderno */}
            <div className="p-4 md:p-6 bg-transparent">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-[#f2ae60]/30 transition-all">
                    <textarea
                        ref={textareaRef}
                        className="w-full bg-transparent border-none px-4 py-3 text-sm focus:ring-0 resize-none max-h-[150px] placeholder:text-slate-400 text-slate-700 leading-relaxed"
                        placeholder="Escribe tu consulta o pide un consejo..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        rows={1}
                    />
                    <button
                        onClick={() => enviar()}
                        disabled={!input.trim() || loading}
                        className="bg-[#1a2e3b] hover:bg-[#f2ae60] hover:text-[#1a2e3b] text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                    Mentor IC utiliza IA y documentos institucionales. Verifica la información sensible.
                </p>
            </div>
        </div>
    );
}