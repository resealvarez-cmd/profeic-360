"use client";
import { useState } from "react";
// Eliminamos useRouter porque usaremos redirección nativa del navegador
// import { useRouter } from "next/navigation"; 
import Image from "next/image"; 
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient"; 

export default function LoginPage() {
    // const router = useRouter(); // <--- Desactivado para usar redirección fuerte
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [errorMsg, setErrorMsg] = useState("");
    const [buttonText, setButtonText] = useState("Ingresar"); // Estado para feedback visual

    const handleAuth = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            if (isRegistering) {
                // --- REGISTRO ---
                const { error: signUpError } = await supabase.auth.signUp({
                    email: form.email,
                    password: form.password,
                });
                if (signUpError) throw signUpError;
                
                alert("Cuenta creada. Por favor revisa tu correo para confirmar.");
                setIsRegistering(false);
                setLoading(false);
                return;

            } else {
                // --- LOGIN ---
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: form.email,
                    password: form.password,
                });
                
                if (signInError) throw signInError;

                // ¡ÉXITO!
                console.log("✅ Login correcto. Sesión iniciada.");
                setButtonText("¡Bienvenido! Redirigiendo..."); // Feedback inmediato

                // RESPALDO: Guardamos también en localStorage por si acaso
                if (data.session) {
                    localStorage.setItem("profeic_token", data.session.access_token);
                }

                // 🔥 LA SOLUCIÓN CLAVE: Redirección nativa (Hard Redirect).
                // Esto fuerza a recargar la página destino leyendo la sesión desde cero.
                window.location.href = "/planificador"; 
            }

        } catch (error: any) {
            console.error("Error auth:", error);
            setErrorMsg(error.message || "Credenciales incorrectas");
            setLoading(false); // Solo quitamos loading si hubo error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative font-sans">

            {/* EL ARCO SUPERIOR OSCURO */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-[#1a2e3b] rounded-b-[100%] scale-x-125 z-0 shadow-xl"></div>

            {/* TARJETA FLOTANTE */}
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 relative">

                {/* LOGO OFICIAL FLOTANTE */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                    <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-50 overflow-hidden relative">
                        <Image
                            src="/logo.png"
                            alt="Insignia Colegio Madre Paulina"
                            fill
                            className="object-contain p-2"
                            priority
                        />
                    </div>
                </div>

                <div className="mt-10 text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-[#1a2e3b] mb-1">ProfeIC Suite</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Plataforma Colegio Madre Paulina</p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg text-center animate-pulse">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Correo Institucional</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[#1a2e3b] font-medium focus:ring-2 focus:ring-[#1a2e3b] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                placeholder="docente@madrepaulina.cl"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Contraseña</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[#1a2e3b] font-medium focus:ring-2 focus:ring-[#1a2e3b] focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-[#1a2e3b] text-white font-bold rounded-xl shadow-lg hover:bg-[#233d4d] hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                             <span className="flex items-center gap-2">
                                {buttonText === "Ingresar" ? "Procesando..." : buttonText}
                             </span>
                        ) : (
                            <>
                                {isRegistering ? "Crear Cuenta" : "Ingresar"}
                                <ArrowRightIcon className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <p className="text-xs text-gray-400 mb-2">
                        {isRegistering ? "¿Ya tienes acceso?" : "¿Eres nuevo en el sistema?"}
                    </p>
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-[#1a2e3b] font-bold text-sm hover:underline"
                    >
                        {isRegistering ? "Iniciar Sesión" : "Crear una cuenta nueva"}
                    </button>
                </div>
            </div>

            <p className="absolute bottom-6 text-gray-400/50 text-xs font-medium">
                © 2025 Dirección Colegio Madre Paulina
            </p>
        </div>
    );
}