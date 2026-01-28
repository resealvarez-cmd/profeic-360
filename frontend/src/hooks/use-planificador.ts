// frontend/src/hooks/use-planificador.ts
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { configSchema, ConfigFormValues, PlanificacionClase, EstrategiaPropuesta } from '@/types/planificador';

export const usePlanificador = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Estados para almacenar la respuesta de la IA
    const [estrategia, setEstrategia] = useState<EstrategiaPropuesta | null>(null);
    const [planificacion, setPlanificacion] = useState<PlanificacionClase[] | null>(null);

    const form = useForm<ConfigFormValues>({
        resolver: zodResolver(configSchema),
        defaultValues: {
            nivel: "",
            asignatura: "",
            oa: "",
            actitud: "",
        },
    });

    // Función para conectar con tu Backend (FastAPI)
    const generarPlanificacion = async (data: ConfigFormValues) => {
        setLoading(true);
        try {
            // NOTA: Ajusta la URL si tu puerto cambió
            const response = await fetch('https://profeic-backend-484019506864.us-central1.run.app/api/probar-gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    curso: data.nivel, // Mapeamos los campos
                    objetivo: `${data.oa} - Enfasis actitudinal: ${data.actitud}`
                }),
            });

            const result = await response.json();

            if (result.mensaje_ia) {
                // Asignamos los datos que vienen del backend
                setEstrategia(result.mensaje_ia.estrategia);
                setPlanificacion(result.mensaje_ia.clases);
                setStep(2); // Avanzamos al paso de revisión
            }
        } catch (error) {
            console.error("Error conectando con el Director:", error);
            alert("Error al conectar con el servidor. Revisa que el backend esté corriendo.");
        } finally {
            setLoading(false);
        }
    };

    const aprobarEstrategia = () => {
        setStep(3); // Vamos al paso final (Ver las clases)
    };

    const resetear = () => {
        setStep(1);
        setEstrategia(null);
        setPlanificacion(null);
        form.reset();
    };

    return {
        step,
        form,
        loading,
        estrategia,
        planificacion,
        generarPlanificacion,
        aprobarEstrategia,
        resetear
    };
};