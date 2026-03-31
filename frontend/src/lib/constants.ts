/**
 * constants.ts — Variables de entorno y configuración global del frontend.
 *
 * Centraliza la URL de la API para evitar definirla en cada componente y
 * prevenir inconsistencias entre módulos (e.g.: localhost vs 127.0.0.1).
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
