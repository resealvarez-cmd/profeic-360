"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, Copy, Sparkles, BookOpen, User, Clock, Heart, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type FeedCardProps = {
    item: any;
    onClone: (item: any) => void;
    isCloning: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function FeedCard({ item, onClone, isCloning }: FeedCardProps) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0); // Mock por ahora o traer de DB
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    // Efecto para cargar comentarios si se abre
    useEffect(() => {
        if (showComments && comments.length === 0) {
            fetchComments();
        }
    }, [showComments]);

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const res = await fetch(`${API_URL}/social/comentarios/${item.id}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleLike = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("Inicia sesión para interactuar");
            return;
        }

        // Optimistic UI
        const prevLiked = liked;
        const prevCount = likesCount;
        setLiked(!liked);
        setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

        try {
            await fetch(`${API_URL}/social/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recurso_id: item.id, usuario_id: session.user.id })
            });
        } catch (e) {
            // Revert
            setLiked(prevLiked);
            setLikesCount(prevCount);
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const tempComment = {
                id: Date.now(),
                usuario_nombre: session.user.email?.split("@")[0] || "Tú", // Fallback name
                contenido: newComment,
                created_at: new Date().toISOString()
            };

            // Optimistic append
            setComments([...comments, tempComment]);
            setNewComment("");

            await fetch(`${API_URL}/social/comentar`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recurso_id: item.id,
                    usuario_id: session.user.id,
                    usuario_nombre: tempComment.usuario_nombre,
                    contenido: tempComment.contenido
                })
            });

        } catch (e) {
            toast.error("Error al comentar");
        }
    };

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-[#f2ae60]/50 overflow-hidden relative bg-white flex flex-col h-full">
            <div className={`absolute top-0 left-0 w-1 h-full ${item.type === 'planificacion' ? 'bg-[#2b546e]' : 'bg-[#f2ae60]'}`}></div>

            <CardHeader className="pb-3 pl-6">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className={`${item.type === 'planificacion' ? 'bg-blue-50 text-[#2b546e]' : 'bg-orange-50 text-[#f2ae60]'} border-0 font-bold uppercase tracking-wider text-[10px]`}>
                        {item.type}
                    </Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
                    </span>
                </div>
                <CardTitle className="text-xl font-bold text-slate-800 leading-snug group-hover:text-[#2b546e] transition-colors line-clamp-2 min-h-[3.5rem]">
                    {item.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1 font-medium">
                    <User className="w-4 h-4 text-slate-400" /> {item.author || "Profe IC"}
                </CardDescription>
            </CardHeader>

            <CardContent className="pb-6 pl-6 flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                    {item.level && <Badge variant="outline" className="border-slate-200 text-slate-600 font-medium">{item.level}</Badge>}
                    {item.subject && <Badge variant="outline" className="border-slate-200 text-slate-600 font-medium">{item.subject}</Badge>}
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {item.description}
                </p>
            </CardContent>

            {/* ZONA SOCIAL */}
            {showComments && (
                <div className="bg-slate-50 p-4 border-t border-b border-slate-100 animate-in slide-in-from-top-2">
                    <ScrollArea className="h-32 mb-3 pr-2">
                        {loadingComments && <p className="text-xs text-slate-400">Cargando...</p>}
                        {comments.map((c: any) => (
                            <div key={c.id} className="mb-2 text-sm">
                                <span className="font-bold text-[#2b546e] mr-2">{c.usuario_nombre}:</span>
                                <span className="text-slate-700">{c.contenido}</span>
                            </div>
                        ))}
                        {!loadingComments && comments.length === 0 && <p className="text-xs text-slate-400 italic">Sé el primero en comentar...</p>}
                    </ScrollArea>
                    <div className="flex gap-2">
                        <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escribe un comentario..."
                            className="h-8 text-xs bg-white"
                        />
                        <Button size="icon" onClick={handleSendComment} className="h-8 w-8 bg-[#2b546e] text-white"><Send className="w-3 h-3" /></Button>
                    </div>
                </div>
            )}

            <CardFooter className="bg-slate-50 border-t p-3 pl-6 flex justify-between items-center gap-2">
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={handleLike} className={`hover:bg-red-50 ${liked ? 'text-red-500' : 'text-slate-400'}`}>
                        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowComments(!showComments)} className={`hover:bg-blue-50 ${showComments ? 'text-[#2b546e]' : 'text-slate-400'}`}>
                        <MessageCircle className="w-5 h-5" />
                    </Button>
                </div>

                <Button
                    onClick={() => onClone(item)}
                    disabled={isCloning}
                    className={`${item.type === 'planificacion' ? 'bg-[#2b546e]' : 'bg-[#f2ae60]'} text-white hover:brightness-110 font-bold text-xs h-9 px-4`}
                >
                    {isCloning ? <Sparkles className="w-3 h-3 animate-spin mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    Clonar
                </Button>

                {item.file_url && (
                    <Button
                        onClick={() => window.open(item.file_url, '_blank')}
                        className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs h-9 px-4 ml-2"
                    >
                        <Download className="w-3 h-3 mr-1" />
                        Archivo
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
