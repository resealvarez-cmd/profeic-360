"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Save, UploadCloud, FileText, X } from "lucide-react";

export default function ImportarPMEModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [propuesta, setPropuesta] = useState<any | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfiles() {
      const { data: authUsers } = await supabase.from('authorized_users').select('email').in('role', ['admin', 'director', 'utp']);
      const emails = authUsers?.map(u => u.email) || [];
      const { data, error } = await supabase.from('profiles').select('id, full_name, email').in('email', emails).order('full_name');
      if (!error && data) {
        setProfiles(data);
      }
    }
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImportar = async () => {
    if (!selectedFile) {
      alert("Por favor, selecciona un documento (PDF, DOCX, XLSX o CSV).");
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/api/v1/mejora-continua/importar-documento`, {
        method: "POST",
        body: formData,
        // No enviamos Content-Type explícitamente, fetch lo genera con boundary automático
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al procesar el documento en el servidor");
      }
      
      const data = await res.json();
      setPropuesta(data);
    } catch (error: any) {
      console.error(error);
      alert(`Ocurrió un error al importar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardarMeta = async () => {
    if (!propuesta) return;
    setIsSaving(true);
    try {
      // 1. Insert Strategic Goal
      const { data: goalData, error: goalError } = await supabase
        .from("strategic_goals")
        .insert({
          title: propuesta.title,
          description: propuesta.description,
          status: "active",
          academic_year: new Date().getFullYear(),
        })
        .select()
        .single();
        
      if (goalError) throw goalError;
      const goalId = goalData.id;

      // 2. Iterate and insert Phases
      for (const phase of propuesta.phases) {
        const { data: phaseData, error: phaseError } = await supabase
          .from("implementation_phases")
          .insert({
            goal_id: goalId,
            title: phase.title,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
            status: "pending",
            leader_id: phase.leader_id || null, 
          })
          .select()
          .single();

        if (phaseError) throw phaseError;
        const phaseId = phaseData.id;

        // 3. Insert Indicators
        if (phase.indicators && phase.indicators.length > 0) {
          const indicatorsToInsert = phase.indicators.map((ind: any) => ({
            phase_id: phaseId,
            description: ind.description,
            target_value: ind.target_value,
            current_value: 0,
            metric_type: ind.metric_type,
            data_source: ind.data_source
          }));
          const { error: indError } = await supabase.from("indicators").insert(indicatorsToInsert);
          if (indError) throw indError;
        }

        // 4. Insert Enablers
        if (phase.enablers && phase.enablers.length > 0) {
          const enablersToInsert = phase.enablers.map((en: any) => ({
            phase_id: phaseId,
            description: en.description,
            resource_type: en.resource_type,
            status: "requested",
            estimated_cost: en.estimated_cost || 0
          }));
          const { error: enError } = await supabase.from("enablers").insert(enablersToInsert);
          if (enError) throw enError;
        }
      }

      alert("¡Meta estratégica importada con éxito!");
      setIsOpen(false);
      window.dispatchEvent(new Event('mejora-continua-updated'));

    } catch (error) {
      console.error("Error guardando en Supabase:", error);
      alert("Hubo un error al guardar la meta en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPropuesta(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
        setIsOpen(val);
        if(!val) handleReset();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 px-3 text-[11px] font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all rounded-lg gap-2">
          <UploadCloud className="w-3.5 h-3.5 text-sky-500" /> Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white p-0 rounded-xl border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Importar Plan Mejorando Juntos</DialogTitle>
          <DialogDescription>Carga y análisis de documentos institucionales para la generación automática de metas y fases.</DialogDescription>
        </DialogHeader>

        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[60px] rounded-full"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-sky-500/20 rounded-lg">
                        <UploadCloud className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Inteligencia Documental</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Automatización Mejorando Juntos</p>
                    </div>
                </div>
            </div>
        </div>
        
        {!propuesta ? (
          <div className="p-6 space-y-6">
            <div className={`group relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${selectedFile ? 'border-sky-400 bg-sky-50/50' : 'border-slate-100 hover:border-sky-200 bg-slate-50/30'}`}>
                <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.docx,.xlsx,.xls,.csv" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                
                {!selectedFile ? (
                    <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="p-5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
                            <UploadCloud className="w-10 h-10 text-sky-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-bold text-slate-700">Seleccionar Documento</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PDF • WORD • EXCEL</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-5 bg-white rounded-xl shadow-md text-sky-600 relative">
                            <FileText className="w-10 h-10" />
                            <button onClick={handleReset} className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-1.5 text-white hover:bg-rose-600 shadow-lg transition-all active:scale-90">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[300px]">{selectedFile.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • LISTO</p>
                        </div>
                    </div>
                )}
            </div>

            <Button 
                onClick={handleImportar} 
                className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold text-xs uppercase shadow-md transition-all active:scale-[0.98]"
                disabled={isLoading || !selectedFile}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
              {isLoading ? "ANALIZANDO ESTRUCTURA..." : "INICIAR ANÁLISIS ESTRATÉGICO"}
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-6 animate-in fade-in duration-300">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Objetivo General Detectado</Label>
                    <Input 
                        value={propuesta.title} 
                        onChange={(e) => setPropuesta({...propuesta, title: e.target.value})}
                        className="h-11 font-bold text-base text-slate-900 bg-slate-50 border-slate-200 focus:bg-white focus:ring-sky-500 rounded-lg px-4"
                    />
                </div>
                
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Descripción Estratégica</Label>
                    <Textarea 
                        value={propuesta.description}
                        onChange={(e) => setPropuesta({...propuesta, description: e.target.value})}
                        className="min-h-[80px] text-sm font-medium text-slate-700 bg-slate-50 border-slate-200 focus:bg-white focus:ring-sky-500 rounded-lg p-4 resize-none"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Fases Extraídas</h3>
                <div className="grid grid-cols-1 gap-3">
                    {propuesta.phases.map((phase: any, pIdx: number) => (
                        <div key={pIdx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Fase 0{pIdx + 1}</Label>
                                <Input 
                                    value={phase.title}
                                    onChange={(e) => {
                                        const newPhases = [...propuesta.phases];
                                        newPhases[pIdx].title = e.target.value;
                                        setPropuesta({...propuesta, phases: newPhases});
                                    }}
                                    className="h-10 text-sm font-bold text-slate-700 bg-white border-slate-200 rounded-lg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Líder sugerido</Label>
                                <select 
                                    className="w-full h-10 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
                                    value={phase.leader_id || ""}
                                    onChange={(e) => {
                                        const newPhases = [...propuesta.phases];
                                        newPhases[pIdx].leader_id = e.target.value;
                                        setPropuesta({...propuesta, phases: newPhases});
                                    }}
                                >
                                    <option value="">SELECCIONAR LÍDER</option>
                                    {profiles.map(p => (
                                        <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button 
                    variant="ghost" 
                    onClick={handleReset} 
                    disabled={isSaving}
                    className="flex-1 h-10 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                    Descartar
                </Button>
                <Button 
                    onClick={handleGuardarMeta} 
                    disabled={isSaving}
                    className="flex-[2] h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Confirmar e Integrar al Plan
                </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
