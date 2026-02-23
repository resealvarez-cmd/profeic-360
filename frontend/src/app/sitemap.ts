import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://profeic.cl';

    // Static routes
    const routes = [
        '',
        '/login',
        '/biblioteca',
        '/planificador',
        '/analizador',
        '/rubricas',
        '/pruebas',
        '/mentor',
        '/elevador',
        '/inclus',
        '/comunidad',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
