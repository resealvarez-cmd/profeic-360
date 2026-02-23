import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle, XCircle, Loader2, File } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UploadZoneProps {
    onContextLoaded: (text: string, filename: string) => void;
}

export const UploadZone = ({ onContextLoaded }: UploadZoneProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [fileData, setFileData] = useState<{ filename: string; preview: string; charCount: number } | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (file.type !== "application/pdf") {
            setStatus("error");
            setErrorMessage("Por favor, sube solo archivos PDF.");
            return;
        }

        setStatus("uploading");
        setErrorMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/biblioteca/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error ${res.status}: ${res.statusText} \nDetalles: ${errorText}`);
            }

            const data = await res.json();

            setFileData({
                filename: data.filename,
                preview: data.extracted_text_preview,
                charCount: data.char_count
            });

            setStatus("success");
            setStatus("success");
            onContextLoaded(data.full_text || data.extracted_text_preview, data.filename); // Usamos full_text si existe

        } catch (e: any) {
            console.error(e);
            alert(`Error en la subida: ${e.message || e}`);
            setStatus("error");
            setErrorMessage("Hubo un error procesando el archivo. Intenta nuevamente.");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <motion.div
                layout
                onClick={() => status !== "uploading" && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-10 flex flex-col items-center justify-center gap-4 overflow-hidden bg-white/50 backdrop-blur-sm",
                    isDragging ? "border-[#f2ae60] bg-[#f2ae60]/5 scale-[1.02]" : "border-slate-200 hover:border-[#1a2e3b]/30 hover:bg-slate-50",
                    status === "uploading" && "opacity-50 pointer-events-none border-blue-200",
                    status === "success" && "border-green-200 bg-green-50/30"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                {/* CÍRCULO MÁGICO DE FONDO */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                )} />

                <AnimatePresence mode="wait">
                    {status === "uploading" ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-white p-4 rounded-full shadow-sm border border-slate-100">
                                    <Loader2 className="w-8 h-8 text-[#1a2e3b] animate-spin" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm font-bold text-[#1a2e3b] animate-pulse">Analizando Documento...</p>
                            <p className="text-xs text-slate-400">Extrayendo conocimientos</p>
                        </motion.div>
                    ) : status === "success" ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-green-700">¡Contexto Capturado!</p>
                            <p className="text-xs text-green-600/70">Haz click para cambiar el archivo</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center text-center space-y-3"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 mb-2",
                                isDragging ? "bg-[#f2ae60] text-white scale-110 rotate-3" : "bg-[#1a2e3b] text-white"
                            )}>
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1a2e3b]">
                                    {isDragging ? "¡Suéltalo aquí!" : "Arrastra tu PDF aquí"}
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">o haz click para explorar</p>
                            </div>
                            <div className="flex gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                                <span>PDF</span>
                                <span>•</span>
                                <span>Max 20MB</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {status === "error" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 bg-red-50 text-red-500 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-red-100 shadow-sm"
                    >
                        <XCircle size={14} /> {errorMessage}
                    </motion.div>
                )}
            </motion.div>

            {/* TARJETA DE RESULTADO (SUCCESS CARD) */}
            <AnimatePresence>
                {status === "success" && fileData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 20, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                                        <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1a2e3b] text-sm">{fileData.filename}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">{fileData.charCount} caracteres leídos</p>
                                    </div>
                                </div>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                    <CheckCircle size={12} /> Listo para usar
                                </div>
                            </div>

                            {/* Preview del Texto */}
                            <div className="p-5 bg-slate-50/30">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-2">
                                    <File size={12} /> Previsualización del contenido
                                </p>
                                <div className="bg-slate-100 rounded-xl p-4 text-xs text-slate-600 font-mono leading-relaxed border border-slate-200 shadow-inner">
                                    "{fileData.preview}"
                                </div>
                                <p className="text-center text-[10px] text-slate-300 mt-2 italic">
                                    La IA usará este texto base para generar tu evaluación.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
