import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                canvas: "#f2f1eb", // Crema Institucional
                surface: "#ffffff", // Blanco Puro
                navy: "#1a2e3b",    // Brand Primary
                steel: "#2a536d",   // Brand Secondary
                gold: "#f2ae60",    // Brand Accent
                main: "#1f2937",    // Text Main
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
            },
            backgroundImage: {
                'glass': 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
            }
        },
    },
    plugins: [],
};
export default config;