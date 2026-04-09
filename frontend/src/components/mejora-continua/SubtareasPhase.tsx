"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PhaseTask } from "@/types/mejora_continua";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  User, 
  Layers, 
  Calendar,
  AlertTriangle,
  Clock,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  phaseId: string;
  profiles: any[];
}

export default function SubtareasPhase({ phaseId, profiles }: Props) {
  const { isDirectivo } = useAuth();
  const canEdit = isDirectivo;
  const [tasks, setTasks] = useState<PhaseTask[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [phaseId]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("phase_tasks")
      .select("*")
      .eq("phase_id", phaseId)
      .order("created_at", { ascending: true });
    
    if (!error && data) setTasks(data);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("phase_tasks")
        .insert({
          phase_id: phaseId,
          title: newTaskTitle,
          assignee_id: newAssignee || null,
          due_date: newDueDate || null,
          status: "pending"
        });
      
      if (!error) {
        setNewTaskTitle("");
        setNewAssignee("");
        setNewDueDate("");
        setIsAdding(false);
        fetchTasks();
        window.dispatchEvent(new Event('mejora-continua-updated'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    const { error } = await supabase.from("phase_tasks").update(updates).eq("id", id);
    if (!error) {
        fetchTasks();
        window.dispatchEvent(new Event('mejora-continua-updated'));
        setEditingTaskId(null);
    }
  };

  const toggleTaskStatus = async (task: PhaseTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { status: newStatus });
  };

  const deleteTask = async (id: string) => {
    if (!confirm("¿Eliminar esta acción?")) return;
    const { error } = await supabase.from("phase_tasks").delete().eq("id", id);
    if (!error) fetchTasks();
  };

  const getProfileName = (id?: string) => {
    if (!id) return "Sin asignar";
    const p = profiles.find(pr => pr.id === id);
    return p ? (p.full_name || p.email) : "Desconocido";
  };

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'VENCIDO', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: <AlertTriangle size={10} /> };
    if (diffDays <= 15) return { label: `${diffDays} DÍAS`, color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <Clock size={10} /> };
    return { label: `Faltan ${diffDays} días`, color: 'text-slate-400 bg-slate-50 border-slate-100', icon: <Calendar size={10} /> };
  };

  return (
    <div className="space-y-4">
      <div 
        className="flex items-center justify-between group/header cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-blue-200">
            <Layers className={`w-3.5 h-3.5 ${isExpanded ? 'text-blue-600' : 'text-slate-400'}`} />
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              Acciones de Fase
            </h4>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
        <div className="flex items-center gap-2">
            {tasks.length > 0 && (
                <div className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-lg">
                    <span className="text-[9px] font-black text-blue-600 uppercase">
                        {tasks.filter(t => t.status === 'completed').length} / {tasks.length} COMPLETADAS
                    </span>
                </div>
            )}
            {canEdit && (
                <Button 
                    onClick={(e) => { e.stopPropagation(); setIsAdding(!isAdding); if(!isExpanded) setIsExpanded(true); }} 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-[10px] font-black text-blue-600 hover:bg-blue-50"
                >
                    {isAdding ? "CANCELAR" : "+ ACCIÓN"}
                </Button>
            )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {isAdding && (
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xl space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción de la Acción</label>
                    <Input 
                        autoFocus
                        placeholder="Ej: Implementar bitácora de asistencia digital..." 
                        className="h-11 bg-slate-50 border-slate-200 text-slate-900 font-bold rounded-xl px-4 focus:bg-white"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Responsable</label>
                        <select 
                            className="w-full h-11 px-4 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                            value={newAssignee}
                            onChange={(e) => setNewAssignee(e.target.value)}
                        >
                            <option value="">SIN ASIGNAR</option>
                            {profiles.filter(p => ['admin', 'director', 'utp', 'sostenedor'].includes(p.role?.toLowerCase())).map(p => (
                                <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plazo de Entrega</label>
                        <Input 
                            type="date"
                            className="h-11 bg-slate-50 border-slate-200 text-xs font-bold text-slate-900 rounded-xl px-4 focus:bg-white"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                        />
                    </div>
                </div>
                <Button 
                    onClick={handleAddTask} 
                    disabled={loading || !newTaskTitle}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20"
                >
                    {loading ? "PROCESANDO..." : "AGREGAR ACCIÓN ESTRATÉGICA"}
                </Button>
            </div>
          )}

          <div className="space-y-2">
            {tasks.length === 0 && !isAdding && (
              <div className="p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
                 <Circle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin acciones programadas</p>
              </div>
            )}
            {tasks.map(task => {
                const dueStatus = getDueDateStatus(task.due_date);
                const isEditing = editingTaskId === task.id;

                return (
                    <div key={task.id} className={`group flex flex-col p-3 rounded-xl border transition-all duration-200 ${task.status === 'completed' ? 'bg-slate-50/50 border-transparent shadow-none opacity-60' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <button onClick={() => toggleTaskStatus(task)} className="shrink-0 transition-all active:scale-90">
                                    {task.status === 'completed' ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-slate-200 group-hover:text-blue-500" />
                                    )}
                                </button>
                                <div className="flex flex-col min-w-0">
                                    <span className={`text-xs font-black leading-tight truncate ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                        {task.title}
                                    </span>
                                    <div className="flex items-center gap-2.5 mt-1">
                                        <div className="flex items-center gap-1">
                                            <User className="w-2.5 h-2.5 text-slate-300" />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight truncate">
                                                {getProfileName(task.assignee_id)}
                                            </span>
                                        </div>
                                        {dueStatus && task.status !== 'completed' && !isEditing && (
                                            <button 
                                                onClick={() => canEdit && setEditingTaskId(task.id)} 
                                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-tighter ${dueStatus.color} ${canEdit ? 'hover:bg-white' : 'cursor-default transition-none'} transition-colors`}
                                            >
                                                {dueStatus.icon}
                                                {dueStatus.label}
                                            </button>
                                        )}
                                        {task.due_date && task.status === 'completed' && (
                                            <span className="text-[8px] font-bold text-slate-300 uppercase">LOGRADA EL {new Date(task.due_date).toLocaleDateString('es-CL')}</span>
                                        )}
                                        {!task.due_date && !isEditing && (
                                            <button 
                                                onClick={() => canEdit && setEditingTaskId(task.id)} 
                                                className={`text-[8px] font-bold text-slate-300 uppercase ${canEdit ? 'hover:text-blue-500' : 'cursor-default'} transition-colors`}
                                            >
                                                {canEdit ? '+ ASIGNAR PLAZO' : 'SIN PLAZO'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {canEdit && (
                                <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {isEditing && (
                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 animate-in slide-in-from-top-1">
                                <Input 
                                    type="date"
                                    className="h-8 text-[10px] font-bold border-slate-200 bg-slate-50 w-32"
                                    defaultValue={task.due_date || ""}
                                    onBlur={(e) => updateTask(task.id, { due_date: e.target.value || null })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') updateTask(task.id, { due_date: (e.target as HTMLInputElement).value || null });
                                        if (e.key === 'Escape') setEditingTaskId(null);
                                    }}
                                    autoFocus
                                />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ENTER PARA GUARDAR</span>
                            </div>
                        )}
                    </div>
                );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
