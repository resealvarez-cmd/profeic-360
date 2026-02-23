'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Share2, Copy, Sparkles, BookOpen, User, Clock, Search, Heart, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FeedCard } from "@/components/FeedCard";

type CommunityItem = {
    id: number;
    type: string;
    title: string;
    description: string;
    author: string;
    level: string;
    subject: string;
    created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CommunityPage() {
    const [feed, setFeed] = useState<CommunityItem[]>([]);
    const [filteredFeed, setFilteredFeed] = useState<CommunityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [cloningId, setCloningId] = useState<number | null>(null);

    useEffect(() => {
        fetchFeed();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredFeed(feed);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredFeed(feed.filter(item =>
                item.title.toLowerCase().includes(lower) ||
                item.description.includes(lower) ||
                item.subject?.toLowerCase().includes(lower)
            ));
        }
    }, [searchTerm, feed]);

    const fetchFeed = async () => {
        try {
            const res = await fetch(`${API_URL}/community/feed`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setFeed(data);
                setFilteredFeed(data);
            }
        } catch (error) {
            console.error("Error fetching feed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClone = async (item: CommunityItem) => {
        setCloningId(item.id);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                alert("Debes iniciar sesión para clonar recursos.");
                return;
            }

            const res = await fetch(`${API_URL}/community/clone`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resource_type: item.type,
                    resource_id: item.id,
                    new_author_id: session.user.id
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`¡Recurso clonado con éxito!`, {
                    description: "Lo encontrarás en tu Dashboard personal."
                });
                alert("✨ ¡Recurso clonado! Lo encontrarás en tu Dashboard."); // Fallback
            } else {
                alert("Error al clonar el recurso.");
            }
        } catch (e) {
            console.error(e);
            alert("Error de conexión.");
        } finally {
            setCloningId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* HEADLINE */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in fade-in slide-in-from-top-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#2b546e] tracking-tight">Sala de Profesores</h1>
                        <p className="text-lg text-slate-500 mt-2 font-medium">
                            Comunidad colaborativa del Colegio Madre Paulina. Comparte y reutiliza.
                        </p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            className="pl-10 h-12 bg-white border-slate-200 shadow-sm focus:ring-[#f2ae60]"
                            placeholder="Buscar por asignatura, nivel o contenido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* FEED GRID */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white rounded-xl border border-slate-100 shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {filteredFeed.map((item) => (
                            <FeedCard
                                key={`${item.type}-${item.id}`}
                                item={item}
                                onClone={handleClone}
                                isCloning={cloningId === item.id}
                            />
                        ))}
                    </div>
                )}

                {!loading && filteredFeed.length === 0 && (
                    <div className="text-center py-20">
                        <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400">No se encontraron recursos</h3>
                        <p className="text-slate-400">Intenta buscar con otros términos.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
