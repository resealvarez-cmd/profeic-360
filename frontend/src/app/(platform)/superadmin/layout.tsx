"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Logo } from "@/components/Logo";
import { Loader2, Server, LogOut, LayoutDashboard, Home } from "lucide-react";
import Link from "next/link";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSuperAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            if (session.user.email !== "re.se.alvarez@gmail.com") {
                router.push("/dashboard");
                return;
            }

            setAuthorized(true);
        };
        checkSuperAdmin();
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
                <Loader2 className="w-12 h-12 animate-spin text-[#1B3C73] mb-4" />
                <h1 className="text-xl font-bold">Verificando acceso de sistema...</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {children}
        </div>
    );
}
