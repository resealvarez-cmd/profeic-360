import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // SaaS Enterprise Palette
                "slate-900": "#0F172A", // Deep Navy Background
                "navy-950": "#050A14",  // Deep Tech Luxury Background
                "slate-800": "#1E293B", // Card Background
                "copper-500": "#C87533", // Primary Accent
                "copper-400": "#E08E45", // Hover Accent
                "cream-50": "#F8F9FA",   // Text Light

                // Legacy Aliases (to prevent breaking existing UI immediately)
                canvas: "#f2f1eb",
                surface: "#ffffff",
                navy: "#1a2e3b",
                steel: "#2a536d",
                gold: "#f2ae60",
                main: "#1f2937",
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                serif: ['var(--font-merriweather)', 'serif'],
            },
            backgroundImage: {
                'glass-dark': 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(30, 41, 59, 0.9) 100%)',
                'glass-light': 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }
        },
    },
    plugins: [],
};
export default config;