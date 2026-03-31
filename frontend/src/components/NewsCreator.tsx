"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone, Send, AlertCircle, ChevronDown, ChevronUp, Tag, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type NewsCreatorProps = {
    onNewsCreated: () => void;
    authorName: string;
};

const TAGS = [
    { value: "Información", label: "ℹ️ Información" },
    { value: "Aviso", label: "📢 Aviso" },
    { value: "Recordatorio", label: "⏰ Recordatorio" },
    { value: "Tarea", label: "✅ Tarea" },
    { value: "Evento", label: "🎉 Evento" },
];

export function NewsCreator({ onNewsCreated, authorName }: NewsCreatorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);
    const [tag, setTag] = useState("Información");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim()) {
            toast.error("El título y el mensaje son obligatorios.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/social/noticias`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    titulo: title,
                    cuerpo: body,
                    es_importante: isUrgent,
                    etiqueta: tag,
                    autor_id: authorName || "Dirección"
                })
            });

            if (res.ok) {
                toast.success("Noticia publicada con éxito.");
                setTitle("");
                setBody("");
                setIsUrgent(false);
                setTag("Información");
                setIsOpen(false); // Colapsar al terminar
                onNewsCreated();
            } else {
                toast.error("Error al publicar la noticia.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    // MODO COLAPSADO
    if (!isOpen) {
        return (
            <div className="w-full flex justify-end mb-4">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#1a2e3b] hover:bg-[#233d4d] text-white shadow-md transition-all hover:scale-105"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Anuncio Oficial
                </Button>
            </div>
        );
    }

    // MODO EXPANDIDO
    return (
        <Card className="w-full mb-8 border-slate-200 bg-slate-50/50 animate-in slide-in-from-top-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold text-[#1a2e3b] flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-[#f2ae60]" />
                        Redactar Anuncio
                    </CardTitle>
                    <CardDescription>
                        Visible para todos los docentes en el Muro de Noticias.
                    </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <ChevronUp className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Título del Anuncio"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="font-bold border-slate-300 focus:border-[#2b546e]"
                        />
                    </div>
                    <div className="w-48">
                        <Select value={tag} onValueChange={setTag}>
                            <SelectTrigger className="bg-white border-slate-300">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {TAGS.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Textarea
                    placeholder="Escribe el contenido del mensaje aquí..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[100px] border-slate-300 focus:border-[#2b546e]"
                />

                <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center space-x-2">
                        <Switch id="urgente" checked={isUrgent} onCheckedChange={setIsUrgent} />
                        <Label htmlFor="urgente" className="flex items-center gap-2 cursor-pointer">
                            <span className="font-bold text-sm text-slate-700">Marcar como URGENTE</span>
                            {isUrgent && <Badge variant="destructive" className="bg-red-500 text-[10px]"><AlertCircle className="w-3 h-3 mr-1" /> IMPORTANTE</Badge>}
                        </Label>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={loading} className="bg-[#1a2e3b] hover:bg-[#233d4d] text-white">
                            {loading ? "Publicando..." : (
                                <>
                                    <Send className="w-4 h-4 mr-2" /> Publicar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
