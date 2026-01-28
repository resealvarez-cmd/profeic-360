import { redirect } from "next/navigation";

export default function Home() {
    // Redirige a todos los visitantes de la raíz hacia el login
    redirect("/login");
}