"use client";

import { Save } from "lucide-react";

export function TrajectoryWidget({ commitment }: { commitment: any }) {
    if (!commitment) {
        return (
            <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-400 text-sm italic">
                Sin compromisos registrados previamente. (Inicio de Trayectoria)
            </div>
        );
    }

    return (
        <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Save size={100} className="text-[#C87533]" />
            </div>
            <h3 className="text-[#C87533] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                <Save size={14} /> Trayectoria: Compromiso Anterior
            </h3>
            <p className="text-[#1a2e3b] font-medium text-lg italic leading-relaxed">
                "{commitment.description}"
            </p>
            <div className="flex items-center gap-2 mt-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${commitment.status === 'achieved' ? 'bg-green-100 text-green-700' :
                        commitment.status === 'missed' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                    }`}>
                    {commitment.status === 'achieved' ? 'Logrado' : commitment.status === 'missed' ? 'No Logrado' : 'Pendiente'}
                </span>
                <span className="text-xs text-orange-400 font-medium">Verificar en sala</span>
            </div>
        </div>
    );
}
