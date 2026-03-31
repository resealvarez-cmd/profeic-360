"use client";

import { useEffect, useState } from "react";
import { Megaphone, Calendar, AlertCircle, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type NewsItem = {
    id: string;
    titulo: string;
    cuerpo: string;
    es_importante: boolean;
    created_at: string;
    autor_id: string;
    etiqueta?: string; // Nuevo campo opcional
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getTagColor = (tag: string) => {
    switch (tag) {
        case "Aviso": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "Tarea": return "bg-green-100 text-green-800 border-green-200";
        case "Recordatorio": return "bg-blue-100 text-blue-800 border-blue-200";
        case "Evento": return "bg-purple-100 text-purple-800 border-purple-200";
        default: return "bg-slate-100 text-slate-800 border-slate-200"; // Información
    }
};

export function NewsWall() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch(`${API_URL}/social/noticias`);
            if (res.ok) {
                const data = await res.json();
                setNews(data);
            }
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full mb-8 border-l-4 border-l-[#f2ae60] bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-[#2b546e] text-lg font-bold">
                    <Megaphone className="w-5 h-5 text-[#f2ae60]" />
                    Muro de Noticias
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[250px]">
                    <div className="flex flex-col">
                        {loading ? (
                            <div className="p-6 text-center text-slate-400 animate-pulse">Cargando anuncios...</div>
                        ) : news.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-slate-500 font-medium">No hay noticias recientes del Equipo Directivo.</p>
                                <p className="text-xs text-slate-400 mt-1">¡Mantente atento a las novedades!</p>
                            </div>
                        ) : (
                            news.map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-5 border-b last:border-0 hover:bg-slate-50 transition-colors ${item.es_importante ? 'bg-orange-50/50' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {item.es_importante && (
                                                    <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 font-bold flex items-center gap-1 text-[10px]">
                                                        <AlertCircle className="w-3 h-3" /> URGENTE
                                                    </Badge>
                                                )}
                                                {item.etiqueta && (
                                                    <Badge variant="outline" className={`${getTagColor(item.etiqueta)} font-medium text-[10px]`}>
                                                        {item.etiqueta}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className={`font-bold text-base ${item.es_importante ? 'text-red-700' : 'text-slate-800'}`}>
                                                {item.titulo}
                                            </h3>
                                        </div>
                                        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-full border shadow-sm">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {item.cuerpo}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
