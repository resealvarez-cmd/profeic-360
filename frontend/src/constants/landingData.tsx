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
        title: "Monitorización PME",
        icon: <LayoutDashboard className="text-blue-500" />,
        bg: "bg-blue-50",
        desc: "Visualización dinámica de metas y acciones. Gestión de subactividades con responsables asignados para asegurar el cumplimiento del Plan de Mejora Educativa."
    },
    {
        title: "Evaluación SIMCE de Alta Precisión",
        icon: <Target className="text-orange-500" />,
        bg: "bg-orange-50",
        desc: "Diseño de instrumentos con estímulos visuales complejos y algoritmos de varianza dimensional para medir habilidades reales, no solo memoria."
    },
    {
        title: "Analítica Predictiva 360",
        icon: <BarChart3 className="text-emerald-500" />,
        bg: "bg-emerald-50",
        desc: "Dashboards de impacto que traducen el uso de la plataforma en datos accionables para intervenciones pedagógicas oportunas."
    },
    {
        title: "Motor OMR ProfeIC",
        icon: <ScanFace className="text-purple-500" />,
        bg: "bg-purple-50",
        desc: "Reconocimiento óptico de alta precisión para la corrección masiva de pruebas con total privacidad institucional."
    }
];

export const features360 = [
    { title: "Visión Panorámica", icon: <Layers size={24} />, desc: "Monitoreo basado en evidencia para movilizar la mejora." },
    { title: "Detección de Apoyos", icon: <Target size={24} />, desc: "Identifica dónde tu equipo necesita soporte pedagógico real." },
    { title: "Bitácora", icon: <BookOpen size={24} />, desc: "Un portafolio vivo que celebra las trayectorias docentes." },
    { title: "Feedback", icon: <MessageSquare size={24} />, desc: "Genera espacios de diálogo reflexivo basados en evidencia." },
];



