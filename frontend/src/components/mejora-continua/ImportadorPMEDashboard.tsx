"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Loader2,
  DollarSign,
  Building2,
  Target,
  AlertTriangle,
  RefreshCcw,
  Landmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  TrendingUp,
  Eye,
  Save,
  Edit3,
  X,
  CheckCircle2,
} from "lucide-react";
import { Label } from "@/components/ui/label";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EstrategiaItem {
  dimension: string;
  objetivo: string;
  estrategia: string;
}

interface PMEData {
  identidad?: { vision?: string; mision?: string; sellos?: string[] };
  recursos?: { total?: number; sep?: number; pie?: number };
  estrategias?: EstrategiaItem[];
  diagnostico?: { fortalezas?: string[]; oportunidades_mejora?: string[] };
}

// ─── Componente auxiliar: Panel Colapsable ─────────────────────────────────────

function CollapseSection({
  icon,
  title,
  badge,
  defaultOpen = false,
  accent = "blue",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string | number;
  defaultOpen?: boolean;
  accent?: "blue" | "amber" | "emerald" | "rose" | "slate";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const accents: Record<string, string> = {
    blue:    "text-blue-600   bg-blue-50   border-blue-200",
    amber:   "text-amber-600  bg-amber-50  border-amber-200",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
    rose:    "text-rose-600   bg-rose-50   border-rose-200",
    slate:   "text-slate-600  bg-slate-50  border-slate-200",
  };

  return (
    <div className={`bg-white rounded-2xl border ${open ? "border-slate-200 shadow-md" : "border-slate-100 shadow-sm"} overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${accents[accent]} transition-colors`}>
            {icon}
          </div>
          <span className="font-black text-slate-800 text-sm sm:text-base">{title}</span>
          {badge !== undefined && (
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${accents[accent]}`}>
              {badge}
            </span>
          )}
        </div>
        <div className={`p-1 rounded-lg transition-all ${open ? "text-slate-700 bg-slate-100" : "text-slate-400"}`}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ImportadorPMEDashboard() {
  const [data, setData] = useState<PMEData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Merging Logic ───
  const mergeData = (newData: PMEData) => {
    setData((prev) => {
      if (!prev) return newData;
      
      return {
        // Identidad: Sobrescribir si hay nuevo, mantener si no
        identidad: {
          vision: (newData.identidad?.vision && newData.identidad?.vision !== "No especificada") ? newData.identidad?.vision : prev.identidad?.vision,
          mision: (newData.identidad?.mision && newData.identidad?.mision !== "No especificada") ? newData.identidad?.mision : prev.identidad?.mision,
          sellos: Array.from(new Set([...(prev.identidad?.sellos || []), ...(newData.identidad?.sellos || [])])),
        },
        // Recursos: Sobrescribir si vienen
        recursos: {
          total: newData.recursos?.total || prev.recursos?.total,
          sep: newData.recursos?.sep || prev.recursos?.sep,
          pie: newData.recursos?.pie || prev.recursos?.pie,
        },
        // Estrategias: Anexar nuevas (evitando duplicados por objetivo)
        estrategias: [
          ...(prev.estrategias || []),
          ...(newData.estrategias || []).filter(n => !prev.estrategias?.some(p => p.objetivo === n.objetivo))
        ],
        // Diagnóstico: Anexar viñetas únicas
        diagnostico: {
          fortalezas: Array.from(new Set([...(prev.diagnostico?.fortalezas || []), ...(newData.diagnostico?.fortalezas || [])])),
          oportunidades_mejora: Array.from(new Set([...(prev.diagnostico?.oportunidades_mejora || []), ...(newData.diagnostico?.oportunidades_mejora || [])])),
        }
      };
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    setError(null);
    setSuccess(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    for (let i = 0; i < files.length; i++) {
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        const file = files[i];
        
        try {
          const formData = new FormData();
          formData.append("file", file);
          
          const res = await fetch(`${baseUrl}/api/v1/pme/importar-documento`, {
            method: "POST",
            body: formData,
          });
          
          const responseData = await res.json();
          if (!res.ok) throw new Error(responseData.message || `Error en archivo ${file.name}`);
          
          mergeData(responseData);
        } catch (err: any) {
          console.error(`Error procesando ${file.name}:`, err);
          setError(prev => (prev ? prev + " | " : "") + `Fallo en ${file.name}: ${err.message}`);
        }
    }

    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });
  };

  const handleConsolidar = async () => {
    if (!data) return;
    setIsConsolidating(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${baseUrl}/api/v1/pme/consolidar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al consolidar.");
      
      setSuccess("¡Plan PME consolidado exitosamente en el sistema!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConsolidating(false);
    }
  };

  // ─── Render Helpers ───
  const formatMoney = (n: number = 0) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);

  if (!data && !isUploading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="w-full max-w-xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              Importador Inteligente Acumulativo
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              Construye tu PME 360
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-10">
              Sube uno o varios documentos. Nuestra IA irá completando la visión, misión y estrategias automáticamente.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files) processFiles(e.dataTransfer.files); }}
              className={`
                relative w-full p-20 rounded-3xl border-2 border-dashed cursor-pointer
                transition-all duration-300 text-center group
                ${isDragging ? "border-amber-500 bg-amber-50/60 scale-[1.02]" : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-xl"}
              `}
            >
              <div className="flex flex-col items-center gap-5">
                <div className={`p-6 rounded-2xl transition-all duration-300 shadow-sm ${isDragging ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"}`}>
                  {isUploading ? <Loader2 className="w-12 h-12 animate-spin" /> : <UploadCloud className="w-12 h-12" />}
                </div>
                <div>
                  <p className="text-xl font-black text-slate-800 mb-1 tracking-tight">
                    {isUploading ? `Analizando (${uploadProgress.current}/${uploadProgress.total})...` : "Sube tus reportes PDF"}
                  </p>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">
                    {isUploading ? "No cierres esta pestaña" : "Arrastra uno o varios archivos aquí"}
                  </p>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" multiple onChange={(e) => e.target.files && processFiles(e.target.files)} />
            </div>
            
            {error && <p className="mt-4 text-sm font-bold text-rose-600">{error}</p>}
        </div>
      </div>
    );
  }

  const estrategias = data?.estrategias || [];
  const dimensiones = Array.from(new Set(estrategias.map((s) => s.dimension)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 pb-20">
      
      {/* ── Cabecera ── */}
      <div className="bg-slate-900 px-8 pt-10 pb-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Landmark className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-xs font-black uppercase tracking-[0.2em]">Analítica Institucional de Calidad</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Consolidación del PME</h1>
            <p className="text-slate-400 font-medium text-sm mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> {estrategias.length} Acciones Extraídas</span>
              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
              <span>Modo Acumulativo Activo</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
               className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white text-sm font-bold backdrop-blur transition-all disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {isUploading ? `Analizando ${uploadProgress.current}/${uploadProgress.total}` : "Subir más archivos"}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" multiple onChange={(e) => e.target.files && processFiles(e.target.files)} />
          </div>
        </div>
      </div>

      {/* ── KPIs (Recursos) ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-10 mb-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Presupuesto SEP", value: data?.recursos?.sep, field: 'sep', icon: <DollarSign className="w-5 h-5" /> },
            { label: "Presupuesto PIE", value: data?.recursos?.pie, field: 'pie', icon: <DollarSign className="w-5 h-5" /> },
            { label: "Total Proyectado", value: (data?.recursos?.sep || 0) + (data?.recursos?.pie || 0), icon: <TrendingUp className="w-5 h-5" />, readOnly: true },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl border shadow-xl p-6 flex items-center gap-4 group hover:shadow-2xl transition-all">
              <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl border border-slate-100">{kpi.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{kpi.label}</p>
                {kpi.readOnly ? (
                  <p className="text-xl font-black text-slate-900 truncate">{formatMoney(kpi.value)}</p>
                ) : (
                  <input 
                    type="number"
                    className="w-full text-xl font-black text-slate-900 bg-transparent focus:outline-none focus:ring-0 appearance-none border-b-2 border-transparent focus:border-amber-400 transition-all font-mono"
                    value={kpi.value || 0}
                    onChange={(e) => {
                      if (!data) return;
                      const val = parseInt(e.target.value) || 0;
                      setData({ ...data, recursos: { ...data.recursos, [kpi.field!]: val, total: (kpi.field === 'sep' ? val + (data.recursos?.pie || 0) : (data.recursos?.sep || 0) + val) } });
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="max-w-5xl mx-auto px-6 space-y-4">
        
        {isUploading && (
          <div className="bg-blue-600 px-6 py-4 rounded-2xl text-white flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-bold text-sm uppercase tracking-wider">
                Analizando contexto de documentos ({uploadProgress.current} de {uploadProgress.total})...
              </span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-center gap-4 text-emerald-800 animate-in zoom-in-95 duration-500 shadow-sm mb-6">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <p className="font-black text-sm">{success}</p>
          </div>
        )}

        {/* ── Identidad ── */}
        <CollapseSection icon={<Building2 className="w-4 h-4" />} title="Identidad Institucional" defaultOpen accent="blue">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {(['vision', 'mision'] as const).map((field) => (
              <div key={field} className="relative group">
                <div onClick={() => setEditingId(field)} className={`bg-slate-50/50 border border-slate-100 rounded-2xl p-6 transition-all cursor-pointer hover:bg-white hover:shadow-lg ${editingId === field ? 'ring-2 ring-blue-500 bg-white shadow-xl scale-[1.01]' : ''}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                       {field === 'vision' ? <Eye className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />} {field === 'vision' ? 'Visión' : 'Misión'}
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors">
                      {editingId === field ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Edit3 className="w-4 h-4" />}
                    </button>
                  </div>
                  {editingId === field ? (
                    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        autoFocus
                        className="w-full h-48 p-4 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-0 focus:border-blue-500 outline-none resize-none leading-relaxed"
                        value={field === 'vision' ? data?.identidad?.vision : data?.identidad?.mision}
                        onChange={(e) => {
                            if (!data) return;
                            setData({ ...data, identidad: { ...(data.identidad || {}), [field]: e.target.value } });
                        }}
                      />
                      <button onClick={() => setEditingId(null)} className="w-full py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg">Finalizar Edición</button>
                    </div>
                  ) : (
                    <p className="text-slate-700 font-medium text-sm leading-relaxed italic line-clamp-6 min-h-[100px]">
                      "{field === 'vision' ? data?.identidad?.vision : data?.identidad?.mision}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
             <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Sellos Institucionales</Label>
             <div className="flex flex-wrap gap-2">
                {data?.identidad?.sellos?.map((sello, idx) => (
                  <div key={idx} className="group relative bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-3 hover:border-blue-400 hover:shadow-md transition-all">
                    <input 
                      className="text-xs font-black text-slate-700 bg-transparent focus:outline-none min-w-[120px]"
                      value={sello}
                      onChange={(e) => {
                        if (!data) return;
                        const newSellos = [...(data.identidad?.sellos || [])];
                        newSellos[idx] = e.target.value;
                        setData({...data, identidad: {...(data.identidad || {}), sellos: newSellos}});
                      }}
                    />
                    <X className="w-4 h-4 text-slate-300 hover:text-rose-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all" onClick={() => {
                        if (!data) return;
                        const newSellos = data.identidad?.sellos?.filter((_, i) => i !== idx);
                        setData({...data, identidad: {...(data.identidad || {}), sellos: newSellos}});
                    }} />
                  </div>
                ))}
                <button 
                  onClick={() => {
                      if (!data) return;
                      setData({...data, identidad: {...(data.identidad || {}), sellos: [...(data.identidad?.sellos || []), "Nuevo Sello"]}});
                  }}
                  className="px-5 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all"
                >
                  + Añadir Sello
                </button>
             </div>
          </div>
        </CollapseSection>

        {/* ── Diagnóstico ── */}
        <CollapseSection icon={<AlertTriangle className="w-4 h-4" />} title="Diagnóstico Institucional" accent="rose">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {(['fortalezas', 'oportunidades_mejora'] as const).map((type) => (
                <div key={type} className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                    {type === 'fortalezas' ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {type === 'fortalezas' ? 'Fortalezas' : 'Oportunidades de Mejora'}
                  </Label>
                  <div className="space-y-3">
                    {(data?.diagnostico?.[type] || []).map((item, idx) => {
                      const uid = `diag-${type}-${idx}`;
                      const isEditing = editingId === uid;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setEditingId(uid)}
                          className={`
                            relative flex flex-col gap-2 p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-sm
                            ${isEditing ? "border-rose-400 ring-2 ring-rose-100 shadow-xl" : "border-slate-100 hover:border-rose-200 hover:shadow-md hover:translate-x-1"}
                          `}
                        >
                          {isEditing ? (
                            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                              <textarea 
                                autoFocus
                                className="w-full text-sm font-medium text-slate-600 bg-transparent focus:outline-none resize-none min-h-[80px] leading-relaxed"
                                value={item}
                                onChange={(e) => {
                                  if (!data) return;
                                  const newDiag = {...(data.diagnostico || { fortalezas: [], oportunidades_mejora: [] })};
                                  const list = [...(newDiag[type] || [])];
                                  list[idx] = e.target.value;
                                  newDiag[type] = list;
                                  setData({...data, diagnostico: newDiag});
                                }}
                              />
                              <div className="flex justify-between items-center">
                                <button onClick={() => {
                                   if (!data) return;
                                   const newDiag = {...(data.diagnostico || { fortalezas: [], oportunidades_mejora: [] })};
                                   const list = (newDiag[type] || []).filter((_, i) => i !== idx);
                                   newDiag[type] = list;
                                   setData({...data, diagnostico: newDiag});
                                   setEditingId(null);
                                }} className="text-xs font-bold text-rose-600 hover:underline">Eliminar punto</button>
                                <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Cerrar</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start gap-4">
                              <p className="text-xs font-semibold text-slate-600 leading-relaxed">{item}</p>
                              <Edit3 className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button 
                      onClick={() => {
                        if (!data) return;
                        const newDiag = {...(data.diagnostico || { fortalezas: [], oportunidades_mejora: [] })};
                        const list = [...(newDiag[type] || []), "Nuevo punto de diagnóstico..."];
                        newDiag[type] = list;
                        setData({...data, diagnostico: newDiag});
                        setEditingId(`diag-${type}-${list.length - 1}`);
                      }}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-all"
                    >
                      + Agregar {type === 'fortalezas' ? 'Fortaleza' : 'Oportunidad'}
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </CollapseSection>

        {/* ── Estrategias ── */}
        {dimensiones.map((dim, dI) => {
          const items = estrategias.filter((s) => s.dimension === dim);
          return (
            <CollapseSection key={dI} icon={<Target className="w-4 h-4" />} title={dim} badge={items.length} defaultOpen={dI === 0} accent="amber">
              <div className="space-y-4 mt-6">
                {items.map((estr, eI) => {
                  const uid = `estr-${dim}-${eI}`;
                  const isEditing = editingId === uid;
                  return (
                    <div 
                      key={eI} 
                      onClick={() => setEditingId(uid)}
                      className={`
                        bg-white border rounded-3xl p-6 group transition-all cursor-pointer
                        ${isEditing ? "border-amber-400 ring-4 ring-amber-50 shadow-2xl scale-[1.01]" : "border-slate-100 hover:border-amber-200 hover:shadow-xl hover:translate-y-[-2px]"}
                      `}
                    >
                      {isEditing ? (
                        <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Objetivo de la Dimensión</Label>
                            <textarea 
                              autoFocus
                              className="w-full font-black text-slate-900 text-lg leading-tight focus:outline-none resize-none min-h-[60px] bg-amber-50/20 p-2 rounded-xl"
                              value={estr.objetivo}
                              onChange={(e) => {
                                if (!data) return;
                                const newEstrat = [...(data.estrategias || [])];
                                const idxInAll = data.estrategias?.indexOf(estr) ?? -1;
                                if (idxInAll !== -1) {
                                    newEstrat[idxInAll].objetivo = e.target.value;
                                    setData({...data, estrategias: newEstrat});
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Acción Estratégica PME</Label>
                             <textarea 
                               className="w-full text-base font-medium text-slate-600 bg-white p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none min-h-[120px] leading-relaxed shadow-inner"
                               value={estr.estrategia}
                               onChange={(e) => {
                                 if (!data) return;
                                 const newEstrat = [...(data.estrategias || [])];
                                 const idxInAll = data.estrategias?.indexOf(estr) ?? -1;
                                 if (idxInAll !== -1) {
                                     newEstrat[idxInAll].estrategia = e.target.value;
                                     setData({...data, estrategias: newEstrat});
                                 }
                               }}
                             />
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <button onClick={() => {
                                if (!data) return;
                                setData({...data, estrategias: (data.estrategias || []).filter(s => s !== estr)});
                                setEditingId(null);
                            }} className="text-sm font-bold text-rose-600 hover:underline">Eliminar esta acción</button>
                            <button onClick={() => setEditingId(null)} className="px-8 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black shadow-lg">Hecho</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-10">
                          <div className="space-y-4">
                            <h5 className="font-black text-slate-900 text-base leading-tight group-hover:text-amber-600 transition-colors">{estr.objetivo}</h5>
                            <p className="text-sm font-medium text-slate-500 border-l-4 border-slate-200 pl-4 py-1 italic leading-relaxed line-clamp-3">
                                {estr.estrategia}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
                             <Edit3 className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CollapseSection>
          );
        })}

        {/* ── Consolidar ── */}
        <div className="pt-20 pb-20 flex flex-col items-center">
            <button 
              onClick={handleConsolidar}
              disabled={isConsolidating || !!success}
              className={`
                group flex items-center justify-center gap-4 px-20 py-7 rounded-full text-white text-2xl font-black tracking-tight shadow-3xl transition-all active:scale-95
                ${success ? 'bg-emerald-500/50 cursor-not-allowed' : 'bg-slate-900 hover:bg-black hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)]'}
              `}
            >
              {isConsolidating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Save className="w-8 h-8" />}
              {success ? "PLAN OFICIAL CONSOLIDADO" : "Consolidar como Plan Oficial 2026"}
            </button>
            <p className="text-slate-400 text-xs font-black uppercase mt-8 tracking-[0.4em] animate-pulse">Guardar todos los ajustes en la plataforma institucional</p>
        </div>

      </div>
    </div>
  );
}
