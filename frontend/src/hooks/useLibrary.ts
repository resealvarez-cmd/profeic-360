import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useLibrary() {
    const [isSaving, setIsSaving] = useState(false);

    const saveResource = async ({
        title,
        type,
        grade,
        subject,
        content
    }: {
        title: string;
        type: string;
        grade: string;
        subject: string;
        content: any;
    }) => {
        setIsSaving(true);
        try {
            // 1. Obtener usuario actual
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No hay sesión activa");

            // 2. Guardar en Supabase
            const { error } = await supabase.from('library').insert({
                user_id: session.user.id,
                title,
                type,
                grade,
                subject,
                content, // Guardamos el JSON completo (la estructura del planificador, rúbrica, etc)
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error("Error guardando:", error);
            return { success: false, error };
        } finally {
            setIsSaving(false);
        }
    };

    return { saveResource, isSaving };
}