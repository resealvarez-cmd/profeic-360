"use client";

import {
    MessageSquare,
    Target,
    BookOpen,
    Zap,
    Scale,
    Brain,
    PlusCircle,
    ClipboardCheck,
    Layers
} from 'lucide-react';
import React from 'react';

export const modules = [
    {
        title: "Diseño de Experiencias (DUA)",
        icon: <Zap className="text-orange-500" />,
        bg: "bg-orange-50",
        desc: "Recupera tus fines de semana. Genera secuencias innovadoras y diversificadas en minutos, no en horas, alineadas 100% al PEI."
    },
    {
        title: "Elevador Cognitivo (DOK)",
        icon: <Brain className="text-blue-500" />,
        bg: "bg-blue-50",
        desc: "Deja de trabajar más, empieza a trabajar más profundo. Transforma tareas rutinarias en desafíos de alta demanda cognitiva al instante."
    },
    {
        title: "Analizador de Instrumentos",
        icon: <Scale className="text-emerald-500" />,
        bg: "bg-emerald-50",
        desc: "Revisión técnica instantánea. Detecta sesgos y recibe sugerencias de mejora antes de aplicar cualquier prueba."
    },
    {
        title: "Asistente NEE / Inclusión",
        icon: <PlusCircle className="text-purple-500" />,
        bg: "bg-purple-50",
        desc: "Atiende la diversidad sin agobio administrativo. Adecuaciones curriculares precisas que respetan el perfil de cada estudiante."
    },
    {
        title: "Coach Pedagógico 24/7",
        icon: <MessageSquare className="text-amber-500" />,
        bg: "bg-amber-50",
        desc: "¿Dudas con la innovación? Tu mentor personal resuelve bloqueos creativos y dudas del PEI en cualquier momento."
    },
    {
        title: "Generador de Evaluaciones",
        icon: <ClipboardCheck className="text-slate-500" />,
        bg: "bg-slate-50",
        desc: "Calidad técnica asegurada. Reactivos precisos que miden lo que realmente importa, sin errores de diseño."
    },
    {
        title: "Constructor de Rúbricas",
        icon: <Layers className="text-indigo-500" />,
        bg: "bg-indigo-50",
        desc: "Transparencia absoluta. Diseña criterios de evaluación claros que los estudiantes entienden y facilitan tu corrección."
    }
];

export const features360 = [
    { title: "Visión Panorámica", icon: <Layers size={24} />, desc: "Monitoreo basado en evidencia para movilizar la mejora." },
    { title: "Detección de Apoyos", icon: <Target size={24} />, desc: "Identifica dónde tu equipo necesita soporte pedagógico real." },
    { title: "Bitácora", icon: <BookOpen size={24} />, desc: "Un portafolio vivo que celebra las trayectorias docentes." },
    { title: "Feedback", icon: <MessageSquare size={24} />, desc: "Genera espacios de diálogo reflexivo basados en evidencia." },
];

export const testimonials = [
    {
        name: "Camila Soto",
        role: "Prof. Lenguaje",
        accent: "border-blue-500",
        quote: "Antes pasaba horas con el formato. Ahora me centro en la calidad de las preguntas.",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
    },
    {
        name: "Javier Pérez",
        role: "Prof. Historia",
        accent: "border-orange-500",
        quote: "Las sugerencias DUA son increíblemente pertinentes. No es teoría, es aula real.",
        imageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
    },
    {
        name: "Ana Rojas",
        role: "Prof. Ciencias",
        accent: "border-emerald-500",
        quote: "ProfeIC me sacó de la zona de confort. Pasé de preguntas de memoria a diseño profundo.",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
    },
    {
        name: "Rodrigo Matus",
        role: "Jefe UTP",
        accent: "border-[#1B3C73]",
        quote: "Decisiones basadas en datos reales. La visión panorámica es simplemente una joya.",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
    },
];
