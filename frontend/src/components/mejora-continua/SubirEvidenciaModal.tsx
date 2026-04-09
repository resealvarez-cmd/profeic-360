"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, X, CheckCircle2 } from "lucide-react";

interface Props {
  phaseId: string;
  goalId: string;
  onSuccess?: () => void;
}

export default function SubirEvidenciaModal({ phaseId, goalId, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión activa");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session.user.id}/${Date.now()}_${fileName}`;

      // 1. Subir a Storage (Bucket: pme_evidencias)
      const { error: uploadError } = await supabase.storage
        .from('pme_evidencias')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Registrar en la tabla pme_evidences
      const { error: dbError } = await supabase
        .from('pme_evidences')
        .insert({
          phase_id: phaseId,
          goal_id: goalId,
          file_path: filePath,
          file_name: file.name,
          uploaded_by: session.user.id
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setFile(null);
      if (onSuccess) onSuccess();
      setTimeout(() => setIsOpen(false), 1500);
    } catch (error: any) {
      console.error("Error al subir evidencia:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[10px] font-black text-violet-700 hover:bg-violet-50 border border-violet-200 rounded-lg gap-1.5 transition-all active:scale-95">
          <Upload className="w-3 h-3" /> Cargar Documento de Gestión
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">Cargar Documento de Gestión</DialogTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Trazabilidad y Cumplimiento PME</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          {!success ? (
            <div className="space-y-6">
              <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${file ? 'border-blue-400 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'}`}>
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileChange}
                />
                {!file ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Seleccionar Archivo</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PDF, DOCX, IMG</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 text-left bg-white p-4 rounded-xl shadow-sm">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo Documento...
                  </>
                ) : (
                  "Iniciar Carga"
                )}
              </Button>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">¡Carga Exitosa!</h3>
                <p className="text-sm font-medium text-slate-500">La evidencia ha sido vinculada correctamente.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
