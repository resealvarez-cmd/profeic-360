"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle, CheckCircle2, XCircle, ChevronRight, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SmartEvaluation {
  status: "ok" | "mejorable" | "insuficiente";
  details: string;
}

interface SmartResponse {
  is_smart: boolean;
  score: number;
  evaluation: {
    specific: SmartEvaluation;
    measurable: SmartEvaluation;
    achievable: SmartEvaluation;
    relevant: SmartEvaluation;
    time_bound: SmartEvaluation;
  };
  suggestions: string[];
  rewritten_proposal: string;
}

interface Props {
  texto: string;
  tipo: "meta" | "indicador";
  contexto?: string;
  onApply: (newText: string) => void;
  className?: string;
}

async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function ValidarSmartButton({ texto, tipo, contexto, onApply, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof SmartResponse["evaluation"]>("specific");
  const [copied, setCopied] = useState(false);

  const handleValidate = async () => {
    if (!texto.trim()) {
      setError("Por favor escribe algún texto antes de validar.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/api/v1/pme/validar-smart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ tipo, texto, contexto }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.detail || `Error del servidor (${res.status})`);
      }

      const json: SmartResponse = await res.json();
      setResult(json);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "No se pudo conectar con el servicio de IA.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.rewritten_proposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusConfig = {
    ok: { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, text: "Cumple", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
    mejorable: { icon: <AlertCircle className="w-5 h-5 text-amber-500" />, text: "Mejorable", color: "text-amber-700 bg-amber-50 border-amber-100" },
    insuficiente: { icon: <XCircle className="w-5 h-5 text-rose-500" />, text: "Insuficiente", color: "text-rose-700 bg-rose-50 border-rose-100" },
  };

  const letterLabels = {
    specific: { letter: "S", label: "Específico", desc: "Specific" },
    measurable: { letter: "M", label: "Medible", desc: "Measurable" },
    achievable: { letter: "A", label: "Alcanzable", desc: "Achievable" },
    relevant: { letter: "R", label: "Relevante", desc: "Relevant" },
    time_bound: { letter: "T", label: "Temporal", desc: "Time-bound" },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) handleValidate(); }}>
      <DialogTrigger asChild>
        <Button
          type="button"
          disabled={!texto.trim()}
          className={`h-9 px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all gap-1.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shrink-0 ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Validar SMART
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px] bg-white border-none shadow-2xl p-0 rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight">Auditor de Calidad SMART</DialogTitle>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Análisis con Inteligencia Artificial</p>
          </div>
        </div>

        {/* Content View */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <div>
                <p className="text-sm font-bold text-slate-800">Evaluando con Gemini IA...</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Analizando alineación pedagógica, cuantificadores y plazos temporales.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <div>
                <p className="text-sm font-bold text-rose-800">No se pudo realizar el análisis</p>
                <p className="text-xs text-rose-600 mt-1">{error}</p>
              </div>
              <Button size="sm" onClick={handleValidate} className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs h-8">
                Reintentar
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 rounded-2xl shadow-inner">
                {/* Visual Gauge */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={result.score >= 80 ? "#10B981" : result.score >= 50 ? "#F59E0B" : "#EF4444"}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * result.score) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800 leading-none">{result.score}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">puntos</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-base font-extrabold text-slate-900">
                      {result.score >= 80 ? "¡Excelente estructura!" : result.score >= 50 ? "Requiere ajustes menores" : "Estructura insuficiente"}
                    </h4>
                    {result.is_smart ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                        SMART ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-rose-100 text-rose-700 uppercase tracking-wider border border-rose-200">
                        No SMART
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {result.score >= 80
                      ? `Este ${tipo} cumple con un alto estándar de especificación, factibilidad y temporalidad escolar.`
                      : `Este ${tipo} necesita mayor precisión. La IA ha detectado oportunidades clave de optimización.`}
                  </p>
                </div>
              </div>

              {/* SMART Tabs */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desglose por Criterio SMART</p>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-100 rounded-xl p-1">
                  {(Object.keys(letterLabels) as Array<keyof typeof letterLabels>).map((key) => {
                    const active = activeTab === key;
                    const evalData = result.evaluation[key];
                    const stateColor =
                      evalData.status === "ok"
                        ? "text-emerald-500"
                        : evalData.status === "mejorable"
                        ? "text-amber-500"
                        : "text-rose-500";
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex flex-col items-center py-2.5 rounded-lg transition-all ${
                          active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span className="text-lg font-black leading-none">{letterLabels[key].letter}</span>
                        <span className="text-[8px] font-bold mt-1 uppercase tracking-wider hidden sm:inline">{letterLabels[key].label}</span>
                        <div className="mt-1.5">{statusConfig[evalData.status].icon}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Tab content panel */}
                <div className={`p-4 rounded-xl border ${statusConfig[result.evaluation[activeTab].status].color} animate-in fade-in duration-200`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold uppercase">
                      Criterio: {letterLabels[activeTab].label} ({letterLabels[activeTab].desc})
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Estado: {statusConfig[result.evaluation[activeTab].status].text}
                    </span>
                  </div>
                  <p className="text-xs mt-2 leading-relaxed font-semibold">
                    {result.evaluation[activeTab].details}
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sugerencias para Optimizar</p>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                        <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="font-semibold">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Proposal */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Redacción SMART Sugerida por la IA</p>
                  <Button
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8 px-2.5 text-indigo-600 hover:bg-indigo-100/50 rounded-lg text-xs font-bold gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <p className="text-sm font-black text-slate-900 leading-relaxed bg-white border border-indigo-100 p-4 rounded-xl shadow-inner">
                  {result.rewritten_proposal}
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      onApply(result.rewritten_proposal);
                      setIsOpen(false);
                    }}
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
                  >
                    Aplicar Redacción SMART Soportada
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
