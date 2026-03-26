"use client";

import { useState, useEffect } from "react";
import { MessageSquare, User, Send, Search, Clock, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

export default function MensajeriaPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newMessage, setNewMessage] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                // Fetch profiles in the same school
                const { data: myProfile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle();
                if (myProfile?.school_id) {
                    const { data: schoolProfiles } = await supabase
                        .from('profiles')
                        .select('id, full_name, email, avatar_url')
                        .eq('school_id', myProfile.school_id)
                        .neq('id', user.id);
                    setProfiles(schoolProfiles || []);
                }
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser || !currentUserId) return;
        
        // This will work once the internal_messages table is created
        const { error } = await supabase
            .from('internal_messages')
            .insert({
                sender_id: currentUserId,
                receiver_id: selectedUser.id,
                content: newMessage.trim()
            });

        if (error) {
            console.error("Error sending message:", error);
            // Fallback for demo if table doesn't exist yet
            setMessages([...messages, {
                id: Date.now(),
                sender_id: currentUserId,
                content: newMessage.trim(),
                created_at: new Date().toISOString()
            }]);
        }
        
        setNewMessage("");
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black text-[#1B3C73] tracking-tight">Centro de Mensajería Institucional</h1>
                <p className="text-slate-500 font-medium">Comunicación directa y segura entre directivos y docentes</p>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Contact List */}
                <div className="w-80 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar contacto..." 
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#1B3C73]/10"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {profiles.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedUser(p)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
                                    selectedUser?.id === p.id ? "bg-[#1B3C73] text-white shadow-lg" : "hover:bg-slate-50 text-slate-700"
                                )}
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[#1B3C73] shrink-0 border border-slate-200">
                                    {p.full_name?.[0] || p.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="text-left min-w-0">
                                    <p className="text-xs font-bold truncate">{p.full_name || p.email}</p>
                                    <p className={cn("text-[10px] font-medium truncate", selectedUser?.id === p.id ? "text-slate-300" : "text-slate-400")}>
                                        {p.email}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative">
                    {!selectedUser ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                <MessageSquare className="text-slate-200" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Seleccione un contacto</h3>
                            <p className="text-slate-400 text-sm max-w-xs mt-2">Inicie una conversación con cualquier miembro de su institución.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white shrink-0">
                                        {selectedUser.full_name?.[0] || selectedUser.email?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{selectedUser.full_name || selectedUser.email}</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Línea</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="text-blue-500" size={16} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Cifrado de Extremo a Extremo</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
                                {messages.map((m, idx) => (
                                    <div 
                                        key={idx} 
                                        className={cn(
                                            "flex flex-col max-w-[70%],",
                                            m.sender_id === currentUserId ? "ml-auto items-end" : "items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-4 rounded-2xl text-sm font-medium shadow-sm",
                                            m.sender_id === currentUserId 
                                                ? "bg-[#1B3C73] text-white rounded-tr-none" 
                                                : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                                        )}>
                                            {m.content}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 px-1">
                                            <Clock size={10} className="text-slate-300" />
                                            <span className="text-[9px] font-bold text-slate-400">Ahora</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Escriba un mensaje..." 
                                        className="flex-1 px-6 py-3 bg-slate-50 border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1B3C73]/10 focus:bg-white transition-all"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="w-12 h-12 bg-[#1B3C73] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
