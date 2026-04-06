import HoldingDashboard from "@/components/holding/HoldingDashboard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function HoldingPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 italic text-slate-400">
        <Loader2 className="animate-spin mb-4" />
        Sincronizando red de colegios...
      </div>
    }>
      <HoldingDashboard />
    </Suspense>
  );
}
