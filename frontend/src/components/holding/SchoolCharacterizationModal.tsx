"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Save, Loader2, Users, TrendingUp, AlertCircle, 
  HelpCircle, Percent, GraduationCap, Building2 
} from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SchoolCharacterization {
    id: string;
    name: string;
    attendance_avg: number;
    enrollment_count: number;
    priority_pct: number;
    priority_count: number;
    preferred_pct: number;
    preferred_count: number;
    pie_neet_count: number;
    pie_neep_count: number;
    socioeconomic_level: string;
}

interface Props {
    school: SchoolCharacterization;
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export const SchoolCharacterizationModal: React.FC<Props> = ({ 
    school, 
    isOpen, 
    onClose, 
    onSaved 
}) => {
    const [form, setForm] = useState<Partial<SchoolCharacterization>>({
        attendance_avg: school.attendance_avg || 0,
        enrollment_count: school.enrollment_count || 0,
        priority_pct: school.priority_pct || 0,
        priority_count: school.priority_count || 0,
        preferred_pct: school.preferred_pct || 0,
        preferred_count: school.preferred_count || 0,
        pie_neet_count: school.pie_neet_count || 0,
        pie_neep_count: school.pie_neep_count || 0,
        socioeconomic_level: school.socioeconomic_level || "",
    });
    const [saving, setSaving] = useState(false);

    // Calculate PIE percentage automatically
    const pieCount = (form.pie_neet_count || 0) + (form.pie_neep_count || 0);
    const piePct = form.enrollment_count ? ((pieCount / form.enrollment_count) * 100).toFixed(1) : "0";

    // Auto-calculate percentages for Vulnerability
    useEffect(() => {
        if (form.enrollment_count && form.enrollment_count > 0) {
            const pPct = ((form.priority_count || 0) / form.enrollment_count) * 100;
            const prePct = ((form.preferred_count || 0) / form.enrollment_count) * 100;
            setForm(prev => ({ 
                ...prev, 
                priority_pct: parseFloat(pPct.toFixed(1)),
                preferred_pct: parseFloat(prePct.toFixed(1))
            }));
        }
    }, [form.priority_count, form.preferred_count, form.enrollment_count]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('schools')
                .update({
                    attendance_avg: form.attendance_avg,
                    enrollment_count: form.enrollment_count,
                    priority_pct: form.priority_pct,
                    priority_count: form.priority_count,
                    preferred_pct: form.preferred_pct,
                    preferred_count: form.preferred_count,
                    pie_neet_count: form.pie_neet_count,
                    pie_neep_count: form.pie_neep_count,
                    socioeconomic_level: form.socioeconomic_level,
                })
                .eq('id', school.id);

            if (error) throw error;
            toast.success("Caracterización actualizada correctamente ✓");
            onSaved();
            onClose();
        } catch (error: any) {
            console.error("Error saving characterization:", error);
            toast.error("Error al guardar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-slate-900 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Building2 size={24} className="text-blue-400" />
                        </div>
                        <DialogTitle className="text-2xl font-black">{school.name}</DialogTitle>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        Caracterización de la Matrícula y Entorno
                    </p>
                </DialogHeader>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Sección: Matrícula y Asistencia */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Users size={14} /> Matrícula y Asistencia
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Cant. Alumnos (Matrícula)</Label>
                                <Input 
                                    type="number" 
                                    value={form.enrollment_count}
                                    onChange={e => setForm({...form, enrollment_count: parseInt(e.target.value) || 0})}
                                    className="rounded-xl bg-slate-50 border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">% Asistencia Promedio</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        step="0.1"
                                        value={form.attendance_avg}
                                        onChange={e => setForm({...form, attendance_avg: parseFloat(e.target.value) || 0})}
                                        className="rounded-xl bg-slate-50 border-slate-200 pr-8 text-slate-900"
                                    />
                                    <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Vulnerabilidad */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <TrendingUp size={14} /> Vulnerabilidad y Nivel Socioeconómico
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <Label className="text-xs font-bold text-slate-700">Can. Prioritarios (SEP)</Label>
                                    <span className="text-[10px] font-black text-blue-600">{form.priority_pct}%</span>
                                </div>
                                <Input 
                                    type="number" 
                                    value={form.priority_count}
                                    onChange={e => setForm({...form, priority_count: parseInt(e.target.value) || 0})}
                                    className="rounded-xl bg-slate-50 border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <Label className="text-xs font-bold text-slate-700">Can. Preferentes</Label>
                                    <span className="text-[10px] font-black text-blue-600">{form.preferred_pct}%</span>
                                </div>
                                <Input 
                                    type="number" 
                                    value={form.preferred_count}
                                    onChange={e => setForm({...form, preferred_count: parseInt(e.target.value) || 0})}
                                    className="rounded-xl bg-slate-50 border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Nivel Socioeconómico</Label>
                                <select 
                                    value={form.socioeconomic_level}
                                    onChange={e => setForm({...form, socioeconomic_level: e.target.value})}
                                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Seleccione nivel...</option>
                                    <option value="Bajo">Bajo</option>
                                    <option value="Medio-Bajo">Medio-Bajo</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Medio-Alto">Medio-Alto</option>
                                    <option value="Alto">Alto</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección: PIE / NEE */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <GraduationCap size={14} /> Programa Integración (PIE)
                            </h3>
                            <div className="px-3 py-1 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
                                <span className="text-[10px] font-black text-blue-600">Total PIE: {piePct}%</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Cant. Estudiantes NEET (Transitorios)</Label>
                                <Input 
                                    type="number" 
                                    value={form.pie_neet_count}
                                    onChange={e => setForm({...form, pie_neet_count: parseInt(e.target.value) || 0})}
                                    className="rounded-xl bg-slate-50 border-slate-200 text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-700">Cant. Estudiantes NEEP (Permanentes)</Label>
                                <Input 
                                    type="number" 
                                    value={form.pie_neep_count}
                                    onChange={e => setForm({...form, pie_neep_count: parseInt(e.target.value) || 0})}
                                    className="rounded-xl bg-slate-50 border-slate-200 text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                            Estos datos son cruciales para que la IA de ProfeIC genere estrategias pedagógicas y metas PME contextualizadas a la realidad socio-educativa de este establecimiento.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-8 border-t border-slate-100 bg-slate-50/50">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancelar</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="rounded-xl bg-[#1B3C73] hover:bg-[#132c54] text-white font-bold px-8"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                        Guardar Caracterización
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
