"use client";

import {
    Target,
    LayoutDashboard,
    BarChart3,
    ScanFace,
    Layers,
    BookOpen,
    MessageSquare,
} from 'lucide-react';
import React from 'react';

export const modules = [
    {
        title: "Monitorización PME & Finanzas",
        icon: <LayoutDashboard className="text-blue-500" />,
        bg: "bg-blue-50",
        desc: "Correlación en tiempo real entre inversión financiera (SEP) y avance estratégico. Scorecard de salud institucional para una toma de decisiones en 5 segundos."
    },
    {
        title: "Analítica Predictiva 360",
        icon: <BarChart3 className="text-emerald-500" />,
        bg: "bg-emerald-50",
        desc: "Dashboards de impacto que transforman el uso de la plataforma en alertas tempranas de riesgo académico y sugerencias de intervención pedagógica."
    },
    {
        title: "Motor OMR & Visión IA",
        icon: <ScanFace className="text-purple-500" />,
        bg: "bg-purple-50",
        desc: "Reconocimiento óptico de alta precisión para corrección masiva. Integración inmediata con el portafolio docente para feedback basado en evidencia."
    }
];

export const features360 = [
    { title: "Visión Panorámica", icon: <Layers size={24} />, desc: "Monitoreo basado en evidencia para movilizar la mejora." },
    { title: "Detección de Apoyos", icon: <Target size={24} />, desc: "Identifica dónde tu equipo necesita soporte pedagógico real." },
    { title: "Bitácora", icon: <BookOpen size={24} />, desc: "Un portafolio vivo que celebra las trayectorias docentes." },
    { title: "Feedback", icon: <MessageSquare size={24} />, desc: "Genera espacios de diálogo reflexivo basados en evidencia." },
];



