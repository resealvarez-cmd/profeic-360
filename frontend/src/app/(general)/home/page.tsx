import { Hero } from "@/components/landing/Hero";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { ModuleReviews } from "@/components/landing/ModuleReviews";
import { DemoVideo } from "@/components/landing/DemoVideo";

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-slate-50 font-sans selection:bg-[#f2ae60] selection:text-[#1a2e3b]">

            {/* 1. HERO SECTION */}
            <Hero />

            {/* 2. CARACTERÍSTICAS (BENTO GRID) */}
            <BentoFeatures />

            {/* 3. RESEÑAS DE MÓDULOS (NUEVO) */}
            <ModuleReviews />

            {/* 4. VIDEO DEMO */}
            <DemoVideo />

            {/* FOOTER SIMPLE */}
            <footer className="bg-[#1a2e3b] text-slate-400 py-12 text-center text-sm">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© 2026 Profe IC. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <span className="cursor-pointer hover:text-white transition-colors">Privacidad</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Términos</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Soporte</span>
                    </div>
                </div>
            </footer>

        </main>
    );
}