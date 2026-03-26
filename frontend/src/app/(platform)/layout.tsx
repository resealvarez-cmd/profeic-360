"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import UnifiedSidebar from "@/components/shared/UnifiedSidebar";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import NextTopLoader from "nextjs-toploader";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isLoading, user, sidebarCollapsed } = useAuth();

    // Early return for not authenticated - but in Next.js it's better to use middleware
    // However, we stay consistent with current app logic.
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8 text-[#1B3C73]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-[#C87533] rounded-full animate-spin"></div>
                    <p className="font-bold text-slate-400 font-sans tracking-tight">Sincronizando sesión...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans overflow-hidden select-none">
            <NextTopLoader color="#1B3C73" showSpinner={false} />
            {/* El Sidebar siempre está presente tras el login */}
            <UnifiedSidebar />
            
            <main className={cn(
                "flex-1 relative bg-[#F8FAFC] overflow-y-auto md:pt-0 pt-16 transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "md:ml-20" : "md:ml-64"
            )}>
                {/* Contenido Dinámico con Skeleton Loader nativo de Next.js */}
                <div className="p-4 md:p-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
