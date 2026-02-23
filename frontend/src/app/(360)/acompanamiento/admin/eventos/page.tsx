"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Calendar, Clock, Trash2, Edit2, Info } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminEventos() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [eventType, setEventType] = useState("Reunión");

    // Auth state
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        checkAuthAndFetchEvents();
    }, []);

    const checkAuthAndFetchEvents = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/login");
            return;
        }

        // Verify admin/director role
        const { data: authUser } = await supabase
            .from('authorized_users')
            .select('role')
            .eq('email', session.user.email)
            .single();

        if (!authUser || !['admin', 'director', 'utp'].includes(authUser.role)) {
            toast.error("No tienes permisos para ver esta página.");
            router.push("/acompanamiento/dashboard");
            return;
        }

        setUserProfile(session.user);
        fetchEvents();
    };

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('school_events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) {
            console.error("Error fetching events:", error);
            toast.error("Error al cargar los eventos");
        } else {
            setEvents(data || []);
        }
        setLoading(false);
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !eventDate || !eventTime) {
            toast.error("Completa los campos obligatorios");
            return;
        }

        // Combine date and time
        const combinedDateTime = new Date(`${eventDate}T${eventTime}`);

        const { error } = await supabase
            .from('school_events')
            .insert([
                {
                    title,
                    description,
                    event_date: combinedDateTime.toISOString(),
                    type: eventType,
                    creator_id: userProfile.id
                }
            ]);

        if (error) {
            console.error("Error creating event:", error);
            toast.error("No se pudo crear el evento");
        } else {
            toast.success("Evento creado exitosamente");
            setIsModalOpen(false);
            resetForm();
            fetchEvents();
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) return;

        const { error } = await supabase
            .from('school_events')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Error al eliminar el evento");
        } else {
            toast.success("Evento eliminado");
            fetchEvents();
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setEventDate("");
        setEventTime("");
        setEventType("Reunión");
    };

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#1a2e3b]">Gestión de Eventos</h1>
                    <p className="text-slate-500 mt-1">Programa hitos y reuniones para que los profesores los vean en su panel general.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#C87533] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#b0652a] transition-colors shadow-md shadow-orange-900/10"
                >
                    <Plus size={20} />
                    Crear Evento
                </button>
            </div>

            {/* List of Events */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-[#C87533] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-[#C87533]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1a2e3b] mb-2">No hay eventos programados</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Al crear un evento aquí, se mostrará automáticamente en la pestaña "Social" del panel principal de todos los profesores.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const evtDate = new Date(event.event_date);
                        const isPast = evtDate < new Date();

                        return (
                            <div key={event.id} className={`bg-white rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${isPast ? 'border-slate-200 opacity-60' : 'border-orange-100'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${event.type === 'Hito' ? 'bg-purple-100 text-purple-700' :
                                        event.type === 'Reunión' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                        {event.type}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeleteEvent(event.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-[#1a2e3b] mb-2 line-clamp-2">{event.title}</h3>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar size={14} className={isPast ? "text-slate-400" : "text-[#C87533]"} />
                                        <span className="font-medium">{evtDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Clock size={14} className={isPast ? "text-slate-400" : "text-[#C87533]"} />
                                        <span>{evtDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs</span>
                                    </div>
                                </div>

                                {event.description && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Event Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-xl font-bold text-[#1a2e3b]">Nuevo Evento Institucional</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <Trash2 size={24} className="hidden" /> {/* Spacer */}
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Título del Evento *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ej: Consejo de Evaluación Semestral"
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#C87533] focus:ring-1 focus:ring-[#C87533]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Fecha *</label>
                                        <input
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#C87533]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Hora *</label>
                                        <input
                                            type="time"
                                            value={eventTime}
                                            onChange={(e) => setEventTime(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#C87533]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Evento</label>
                                    <select
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#C87533]"
                                    >
                                        <option value="Reunión">Reunión</option>
                                        <option value="Hito">Hito Institucional</option>
                                        <option value="Celebración">Celebración</option>
                                        <option value="Capacitación">Capacitación</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Descripción / Enlace (Opcional)</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Lugar de la reunión, enlace de Meet, pauta..."
                                        rows={3}
                                        className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#C87533] resize-none"
                                    />
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-800 mt-2">
                                    <Info className="flex-shrink-0 w-5 h-5 text-blue-500" />
                                    <p>Este evento será visible para <b>todos los profesores</b> en la pantalla principal de Aula (pestaña Social).</p>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 rounded-xl font-bold bg-[#C87533] text-white hover:bg-[#b0652a] transition-colors"
                                    >
                                        Publicar Evento
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
