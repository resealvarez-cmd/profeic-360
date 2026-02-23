"use client";

import { useState } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

interface BotonGuardarProps {
    tipo: "PLANIFICACION" | "RUBRICA" | "EVALUACION" | "AUDITORIA" | "ESTRATEGIA" | "ELEVADOR" | "LECTURA";
    titulo?: string;
    asignatura?: string;
    nivel?: string;
    contenido: any;
}

export function BotonGuardar({ tipo, titulo = "", asignatura = "", nivel = "", contenido }: BotonGuardarProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Estados del formulario
    const [formTitulo, setFormTitulo] = useState(titulo);
    const [formAsignatura, setFormAsignatura] = useState(asignatura);
    const [formNivel, setFormNivel] = useState(nivel);

    const handleOpen = () => {
        setFormTitulo(titulo || `Nuevo recurso de ${tipo.toLowerCase()}`);
        setFormAsignatura(asignatura || "General");
        setFormNivel(nivel || "General");
        setSuccess(false);
        setOpen(true);
    };

    const handleSave = async () => {
        setLoading(true);
        console.log("💾 Intentando guardar...");

        try {
            // CAMBIO CLAVE: Usamos getSession en lugar de getUser
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session?.user) {
                console.error("❌ Error de sesión:", error);
                throw new Error("No se detectó la sesión. Por favor, recarga la página (F5) e inicia sesión.");
            }

            const userId = session.user.id;
            console.log("✅ Usuario detectado:", userId);

            const contenidoFinal = {
                ...contenido,
                titulo: formTitulo,
                asignatura: formAsignatura,
                nivel: formNivel
            };

            const payload = {
                user_id: userId,
                tipo: tipo,
                titulo: formTitulo,
                asignatura: formAsignatura,
                nivel: formNivel,
                contenido: contenidoFinal
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                console.error("❌ La variable de entorno NEXT_PUBLIC_API_URL no está configurada.");
                throw new Error("La configuración del servidor es incorrecta. Contacte a soporte.");
            }

            const response = await fetch(`${apiUrl}/biblioteca/save`, { // Usamos la URL de la variable de entorno
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Error al guardar en el servidor");

            setSuccess(true);
            setTimeout(() => setOpen(false), 1500);

        } catch (error: any) {
            console.error("Error detallado al guardar:", error);
            alert(error.message || "Error al guardar el recurso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={handleOpen} variant="outline" className="gap-2 border-[#2b546e] text-[#2b546e] hover:bg-[#2b546e] hover:text-white transition-all shadow-sm font-bold">
                <Save className="w-4 h-4" />
                Guardar
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 shadow-xl z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="text-[#1a2e3b]">Guardar en Biblioteca</DialogTitle>
                        <DialogDescription>
                            Confirma los detalles de tu recurso.
                        </DialogDescription>
                    </DialogHeader>

                    {success ? (
                        <div className="py-8 flex flex-col items-center justify-center text-green-600 animate-in zoom-in">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <Check className="w-7 h-7" />
                            </div>
                            <p className="font-bold">¡Guardado correctamente!</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="titulo" className="font-bold text-slate-600">Título</Label>
                                <Input id="titulo" value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)} className="focus-visible:ring-[#2b546e] text-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="asignatura" className="font-bold text-slate-600">Asignatura</Label>
                                    <Input id="asignatura" value={formAsignatura} onChange={(e) => setFormAsignatura(e.target.value)} className="text-slate-800" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="nivel" className="font-bold text-slate-600">Nivel</Label>
                                    <Input id="nivel" value={formNivel} onChange={(e) => setFormNivel(e.target.value)} className="text-slate-800" />
                                </div>
                            </div>
                        </div>
                    )}

                    {!success && (
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSave} disabled={loading} className="bg-[#2b546e] text-white hover:bg-[#1a2e3b]">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}