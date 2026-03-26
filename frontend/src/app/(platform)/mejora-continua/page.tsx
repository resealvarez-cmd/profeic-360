import MejoraContinuaDashboard from "@/components/mejora-continua/MejoraContinuaDashboard";

export const metadata = {
  title: "Mejorando Juntos | ProfeIC 360",
  description: "Plataforma colaborativa de mejora continua y gestión estratégica institucional. Mejorando Juntos — ProfeIC.",
};

export default function PMEPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <MejoraContinuaDashboard />
    </div>
  );
}
