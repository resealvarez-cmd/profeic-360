"use client";

import React from "react";
import Link from "next/link";
import SimceTestGenerator from "@/components/SimceTestGenerator";
import { ScanLine } from "lucide-react";

export default function SimceTeacherPage() {
    return (
        <div className="relative">
            <SimceTestGenerator />

            {/* Acceso rápido al escáner OMR */}
            <div className="flex justify-center pb-8 -mt-2">
                <Link
                    href="/simce/escanear"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#C87533] transition-colors"
                >
                    <ScanLine size={14} />
                    ¿Ya tienes hojas respondidas? Ir al Escáner OMR →
                </Link>
            </div>
        </div>
    );
}

