import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import StructuredData from "@/components/StructuredData";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const merriweather = Merriweather({
    weight: ['300', '400', '700', '900'],
    subsets: ["latin"],
    variable: "--font-merriweather",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "ProfeIC | Ecosistema Educativo",
        template: "%s | ProfeIC"
    },
    description: "Plataforma de Inteligencia Pedagógica para la Gestión de Aula, Planificación DUA y Liderazgo Instruccional. Potencia tu colegio con IA.",
    keywords: ["Educación", "IA Educativa", "Planificación", "DUA", "Gestión Escolar", "ProfeIC", "Evaluación Docente"],
    authors: [{ name: "ProfeIC Team" }],
    creator: "ProfeIC",
    manifest: "/manifest.json",
    openGraph: {
        type: "website",
        locale: "es_CL",
        url: "https://profeic.cl",
        title: "ProfeIC | Inteligencia Pedagógica",
        description: "Transforma la gestión educativa con herramientas de IA avanzadas. Planificación, Acompañamiento y Análisis de Datos.",
        siteName: "ProfeIC",
        images: [
            {
                url: "/og-image.png", // Asegúrate de tener esta imagen en public
                width: 1200,
                height: 630,
                alt: "ProfeIC Dashboard",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "ProfeIC | Ecosistema Educativo",
        description: "Inteligencia Artificial para potenciar el aprendizaje y la gestión escolar.",
        images: ["/og-image.png"],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#0F172A",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className={`${inter.variable} ${merriweather.variable}`}>
            <body className="bg-slate-900 text-cream-50 font-sans">
                {children}
                <StructuredData />
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}

import { Toaster } from "sonner";