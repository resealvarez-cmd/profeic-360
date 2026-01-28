"use client";
import { useState } from "react";
import {
    UploadCloud, FileText, CheckCircle, AlertCircle,
    Database, ShieldCheck, BookOpen
} from "lucide-react";

export default function ContextoPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("https://profeic-backend-484019506864.us-central1.run.app/upload-contexto", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Error al subir");
            }

            const data = await res.json();
            setStatus({ type: 'success', msg: `¡Éxito! ${data.message}` });
            setFile(null);
        } catch (error: any) {
            setStatus({ type: 'error', msg: `Error: ${error.message}` });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#1a2e3b] p-8 font-sans">
            <header className="max-w-4xl mx-auto mb-10 flex items-center gap-3">
                <div className="p-3 bg-[#2b546e] rounded-xl text-white shadow-lg">
                    <Database size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-[#1a2e3b]">Cerebro Institucional</h1>
                    <p className="text-slate-500 font-medium">Gestiona el conocimiento base (RICE, PEI, Reglamentos) para el Mentor IC.</p>
                </div>
            </header>

            <main className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-[#1a2e3b] p-6 text-white flex justify-between items-center">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <UploadCloud className="text-[#f2ae60]" /> Cargar Nuevo Documento
                        </h2>
                        <span className="text-xs bg-white/10 px-3 py-1 rounded-full">Solo PDF</span>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 transition-colors group relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileText size={32} />
                                </div>
                                {file ? (
                                    <div>
                                        <p className="font-bold text-[#1a2e3b] text-lg">{file.name}</p>
                                        <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-bold text-slate-600">Haz clic o arrastra un PDF aquí</p>
                                        <p className="text-xs text-slate-400 mt-1">Reglamentos, Protocolos, Manuales</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {status && (
                            <div className={`p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                {status.type === 'success' ? <CheckCircle className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                                <p className="text-sm font-medium">{status.msg}</p>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full py-4 bg-[#f2ae60] hover:bg-[#d99a50] text-[#1a2e3b] font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-[#1a2e3b] border-t-transparent rounded-full animate-spin"></div>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Database size={20} /> Ingestar Documento
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-3">
                        <ShieldCheck className="text-green-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-sm text-[#1a2e3b]">Datos Seguros</h3>
                            <p className="text-xs text-slate-500 mt-1">Procesamiento local y almacenamiento privado.</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-3">
                        <BookOpen className="text-blue-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-sm text-[#1a2e3b]">Aprendizaje Activo</h3>
                            <p className="text-xs text-slate-500 mt-1">El Mentor IC usará esto para responder.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}