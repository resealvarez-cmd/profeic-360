import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#1B3C73]">
            <Loader2 className="w-10 h-10 animate-spin text-[#C87533] mb-4" />
            <p className="font-bold text-sm tracking-widest uppercase animate-pulse">Cargando Panel 360°...</p>
        </div>
    );
}
