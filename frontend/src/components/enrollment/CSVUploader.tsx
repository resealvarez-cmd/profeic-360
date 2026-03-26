"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface StudentRow {
    RUT: string;
    Nombres: string;
    Apellidos: string;
    Nivel: string;
    Letra: string;
}

export default function CSVUploader() {
    const [data, setData] = useState<StudentRow[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => {
                // Limpiar espacios y remover BOM (Byte Order Mark) si existe
                return header.trim().replace(/^\ufeff/, "");
            },
            complete: (results) => {
                const rawData = results.data as any[];

                // Mapeo flexible: buscar columnas sin importar mayúsculas/minúsculas
                const headers = (results.meta.fields || []).map(h => h.trim());

                const findHeader = (possibleNames: string[]) => {
                    return headers.find(h => possibleNames.some(p => p.toLowerCase() === h.toLowerCase()));
                };

                const colRut = findHeader(["RUT", "rut", "Identificación"]);
                const colNombres = findHeader(["Nombres", "Nombre", "nombres"]);
                const colApellidos = findHeader(["Apellidos", "Apellido", "apellidos"]);
                const colNivel = findHeader(["Nivel", "Curso", "nivel"]);
                const colLetra = findHeader(["Letra", "Sección", "letra"]);

                const missing = [];
                if (!colRut) missing.push("RUT");
                if (!colNombres) missing.push("Nombres");
                if (!colApellidos) missing.push("Apellidos");
                if (!colNivel) missing.push("Nivel");
                if (!colLetra) missing.push("Letra");

                if (missing.length > 0) {
                    toast.error(`CSV inválido. Faltan o no se reconocen columnas: ${missing.join(", ")}`);
                    setData([]);
                    setFileName(null);
                    return;
                }

                // Normalizar los datos al formato esperado por el componente y backend
                const normalizedData: StudentRow[] = rawData.map(row => ({
                    RUT: row[colRut!]?.toString().trim() || "",
                    Nombres: row[colNombres!]?.toString().trim() || "",
                    Apellidos: row[colApellidos!]?.toString().trim() || "",
                    Nivel: row[colNivel!]?.toString().trim() || "",
                    Letra: row[colLetra!]?.toString().trim() || ""
                })).filter(row => row.RUT !== ""); // Evitar filas vacías accidentales

                setData(normalizedData);
                toast.success(`${normalizedData.length} estudiantes detectados correctamente.`);
            },
            error: (error) => {
                toast.error("Error al leer el archivo CSV.");
                console.error(error);
            }
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
        },
        multiple: false
    });

    const handleConfirm = async () => {
        if (data.length === 0) return;
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Tu sesión ha expirado. Por favor reingresa.");
                setLoading(false);
                return;
            }

            // Normalizar keys para el backend (Pydantic espera minúsculas según el router)
            const payload = data.map(item => ({
                rut: item.RUT,
                nombres: item.Nombres,
                apellidos: item.Apellidos,
                nivel: item.Nivel,
                letra: item.Letra
            }));

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/v1/admin/enrollment/bulk-upload`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message || "Matrícula cargada exitosamente.");
                setData([]);
                setFileName(null);
            } else {
                throw new Error(result.detail || "Error al procesar la carga.");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const previewData = data.slice(0, 5);

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-[#1B3C73] mb-2 flex items-center gap-2">
                    <FileText className="text-[#C87533]" /> Carga Masiva de Matrícula
                </h2>
                <p className="text-slate-500 mb-6">
                    Sube un archivo CSV con las columnas: <span className="font-mono bg-slate-100 px-1 rounded text-sm">RUT, Nombres, Apellidos, Nivel, Letra</span>.
                </p>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                        ${isDragActive ? "border-[#C87533] bg-[#C87533]/5" : "border-slate-300 hover:border-[#1B3C73] hover:bg-slate-50"}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Upload className="text-slate-400" size={32} />
                        </div>
                        {fileName ? (
                            <div className="space-y-1">
                                <p className="font-semibold text-[#1B3C73]">{fileName}</p>
                                <p className="text-sm text-slate-500">{data.length} filas detectadas</p>
                            </div>
                        ) : (
                            <div>
                                <p className="font-semibold text-slate-700">Haz clic o arrastra tu archivo CSV aquí</p>
                                <p className="text-sm text-slate-400 mt-2">Sólo archivos .csv permitidos</p>
                            </div>
                        )}
                    </div>
                </div>

                {data.length > 0 && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-700">Previsualización (Primeras 5 filas)</h3>
                            <button
                                onClick={() => { setData([]); setFileName(null); }}
                                className="text-slate-400 hover:text-red-500 flex items-center gap-1 text-sm"
                            >
                                <X size={16} /> Cancelar
                            </button>
                        </div>

                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600 border-b">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold">RUT</th>
                                        <th className="px-4 py-2 font-semibold">Nombres</th>
                                        <th className="px-4 py-2 font-semibold">Apellidos</th>
                                        <th className="px-4 py-2 font-semibold">Nivel</th>
                                        <th className="px-4 py-2 font-semibold">Letra</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {previewData.map((row, idx) => (
                                        <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-2 font-mono text-xs text-slate-500">{row.RUT}</td>
                                            <td className="px-4 py-2 font-medium">{row.Nombres}</td>
                                            <td className="px-4 py-2 font-medium">{row.Apellidos}</td>
                                            <td className="px-4 py-2">{row.Nivel}</td>
                                            <td className="px-4 py-2">{row.Letra}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className={`w-full mt-6 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-[#1B3C73] hover:bg-[#1B3C73]/90 active:scale-95 shadow-blue-500/20"}`}
                        >
                            {loading ? (
                                <>Procesando Matrícula...</>
                            ) : (
                                <>
                                    <CheckCircle size={20} /> Confirmar Carga de {data.length} Alumnos
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
