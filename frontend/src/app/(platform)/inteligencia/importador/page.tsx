"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { 
  UploadCloud, FileSpreadsheet, CheckCircle2, ArrowLeft, Database, Activity, RefreshCw 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ImportadorPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [stats, setStats] = useState<{ socio: number; conv: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        // Simulate counting stats
        let socioCount = 0;
        let convCount = 0;

        jsonData.forEach(row => {
          if (row["Área"] === "Aprendizaje Socioemocional") socioCount++;
          if (row["Área"] === "Convivencia") convCount++;
        });

        setStats({ socio: socioCount, conv: convCount });
        setParsedData(jsonData);
        toast.success("Archivo Excel analizado correctamente.");
      } catch (error) {
        console.error(error);
        toast.error("Error al procesar el archivo. Verifica que sea un formato válido.");
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleSaveToDB = () => {
    setIsSaving(true);
    
    // Simulating API call to save to Supabase
    setTimeout(() => {
      console.log("PAYLOAD LISTO PARA SUPABASE:", parsedData);
      setIsSaving(false);
      setSaved(true);
      toast.success("¡Datos guardados exitosamente en la base de datos!");
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/inteligencia" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Centro de Inteligencia
          </Link>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8 text-[#1B3C73]" /> Importador Mineduc DIA
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Actualiza automáticamente los paneles del colegio importando las planillas oficiales.</p>
        </div>
      </div>

      {!parsedData && !saved && (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300",
            isDragActive ? "border-[#1B3C73] bg-blue-50/50" : "border-slate-300 bg-white hover:border-[#1B3C73] hover:bg-slate-50"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className={cn("w-16 h-16 mx-auto mb-6 transition-colors", isDragActive ? "text-[#1B3C73]" : "text-slate-400")} />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Arrastra tu Resumen DIA aquí</h3>
          <p className="text-slate-500 font-medium mb-6">o haz clic para seleccionar un archivo (.xlsx, .csv)</p>
          
          <button className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all">
            Explorar archivos
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <RefreshCw className="w-12 h-12 text-[#1B3C73] mx-auto animate-spin mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Procesando estructura...</h3>
          <p className="text-slate-500">Identificando dimensiones e indicadores.</p>
        </div>
      )}

      {parsedData && !saved && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Archivo Analizado</h3>
              <p className="text-slate-500 font-medium text-sm">Validación de estructura completada con éxito.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" /> Registros Convivencia
              </h4>
              <p className="text-3xl font-black text-slate-700">{stats?.conv} <span className="text-sm font-medium text-slate-500 tracking-normal">filas</span></p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Registros Socioemocionales
              </h4>
              <p className="text-3xl font-black text-slate-700">{stats?.socio} <span className="text-sm font-medium text-slate-500 tracking-normal">filas</span></p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button 
              onClick={() => setParsedData(null)}
              className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveToDB}
              disabled={isSaving}
              className="px-8 py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
              {isSaving ? "Guardando..." : "Guardar en Base de Datos"}
            </button>
          </div>
        </div>
      )}

      {saved && (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full mb-6 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">¡Carga Completada!</h2>
          <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto">
            El Centro de Inteligencia Institucional ahora está sincronizado con la última data oficial. Todos los gráficos se han recalculado.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => { setParsedData(null); setSaved(false); }}
              className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Subir otro archivo
            </button>
            <Link 
              href="/inteligencia"
              className="px-8 py-3 font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-sm transition-all"
            >
              Ver Dashboard
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
