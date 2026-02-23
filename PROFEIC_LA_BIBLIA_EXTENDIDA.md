# 📘 PROFEIC: LA BIBLIA DEL ECOSISTEMA (VERSIÓN EXTENDIDA)
## Documento Maestro Técnico, Arquitectónico y Comercial (B2B SaaS)

Este documento ha sido generado mediante una inspección profunda y automatizada del código fuente, esquemas de base de datos y documentos fundacionales. Es la única fuente de la verdad para el ecosistema ProfeIC.

---

# 1. GÉNESIS Y FILOSOFÍA (DOCUMENTOS FUNDACIONALES)

## PLAN_MAESTRO_PROFEIC.md
# PLAN ESTRATÉGICO DE EVOLUCIÓN: PROFE IC (VERSION 4.0 - "LUXURY SUITE")

**Visión:** Consolidar Profe IC como un "Exoesqueleto Intelectual" de clase mundial. Arquitectura Cloud-Native (Cloud Run + Supabase), priorizando Soberanía de Datos, Colaboración y una Experiencia de Usuario (UX) de alto impacto visual.

## I. ARQUITECTURA "BIBLIOTECA VIVA" (Supabase Storage + RAG)
**Objetivo:** Permitir carga de contextos propios (libros, apuntes) con persistencia.
**Infraestructura:**
- **Supabase Storage:** Crear bucket privado `biblioteca_contexto`.
- **Backend (FastAPI):**
    - Endpoint `/upload` (streaming a Supabase).
    - Servicio `RAGService`: Ingesta de documentos PDF -> Extracción de texto -> Inyección en Prompt.
**Frontend:**
- Componente `UploadZone` con drag-and-drop en el generador.

## II. MARKETING & ONBOARDING (Landing Page High-End)
**Objetivo:** Una ventana de ventas y educación de alto impacto visual.
**Tecnología Visual:** Implementar `framer-motion` para animaciones y `lucide-react` para iconografía.
**Secciones Clave:**
1.  **Hero Cinematográfico:** Título animado, subtítulo persuasivo y call-to-action (Login) con fondo dinámico o video sutil.
2.  **Bento Grid de Módulos:** Tarjetas interactivas (hover effects) explicando:
    - "El Planificador Inteligente"
    - "El Evaluador Soberano (RAG)"
    - "El Asistente DUA"
3.  **Profe IC Academy:** Carrusel de videos tutoriales (Youtube Embeds) y casos de uso.
4.  **Social Proof:** Citas animadas de usuarios reales (ej: Jasnna, Octavio).

## III. MÓDULO DE INCLUSIÓN (DUA & PIE)
**Objetivo:** Adaptaciones curriculares personalizadas.
**Flujo:**
1.  Click en "Generar Adecuación DUA" sobre una planificación.
2.  **Input Contextual:** Modal para describir las barreras/necesidades del grupo (Input libre).
3.  **Output:** Estrategias diversificadas (Visual, Kinestésico, Auditivo) generadas por IA.

## IV. CICLO DE EVALUACIÓN "360"
**Objetivo:** Entregar la herramienta completa, no solo la prueba.
**Entregables:**
1.  **Prueba Alumno:** PDF/Word limpio.
2.  **Kit Docente:** PDF separado con Respuestas Correctas y Rúbricas de Desarrollo detalladas.

## V. MERCADO INTERNO (Comunidad)
**Objetivo:** Red social pedagógica privada.
**Lógica:**
- Feed "Sala de Profesores" con recursos marcados como `public`.
- Función "Clonar Recurso" (Forking) para editar sin alterar el original.

## PROFEIC_INFORME_TECNICO_COMPLETO.md
# INFORME TECNICO EXHAUSTIVO - ProfeIC SaaS
## Auditoria Completa para Escalabilidad a $1M USD

**Fecha:** 2026-02-18
**Version:** 1.0
**Objetivo:** Identificar TODOS los problemas tecnicos y proporcionar soluciones detalladas para conversion a SaaS enterprise-grade

---

# SECCION 1: RESUMEN EJECUTIVO

## Estado Actual
| Metrica | Valor | Target $1M |
|---------|-------|------------|
| Landing Page | 70% completa | 100% |
| Login/Auth | 40% completa | 100% |
| Funcionalidades Core | 0% visible | 100% |
| SEO/Marketing | 30% | 90% |
| Performance | 65% | 95% |
| Seguridad | 50% | 99% |
| Escalabilidad | Desconocida | Enterprise |

## Prioridades Criticas (Ordenadas por Impacto)
1. **P0 - BLOQUEANTES**: Hero invisible, carrusel estatico, video no funcional
2. **P1 - CRITICOS**: Auth incompleta, SEO basico, falta de analytics
3. **P2 - IMPORTANTES**: Responsive issues, accesibilidad, performance
4. **P3 - MEJORAS**: Animaciones, micro-interacciones, polish

---

# SECCION 2: BUGS CRITICOS (P0 - RESOLVER INMEDIATAMENTE)

## BUG-001: Hero Section Invisible
**Severidad:** CRITICA - El contenido principal es invisible hasta que JS ejecute
**Ubicacion:** `src/app/page.tsx` - Hero section

**Codigo Problematico:**
```html
<div class="max-w-4xl mx-auto flex flex-col items-center" style="opacity:0;transform:translateY(20px)">
```

**Problema:** El estilo inline `opacity:0` hace que el contenido sea completamente invisible. Si JavaScript falla, tarda, o el usuario tiene JS deshabilitado, ve una pagina en blanco.

**Solucion Recomendada:**
```tsx
// Opcion A: Usar Framer Motion con initial visible
import { motion } from 'framer-motion';

<motion.div
  className="max-w-4xl mx-auto flex flex-col items-center"
  initial={{ opacity: 1 }} // Visible por defecto
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

// Opcion B: CSS-first approach con clase
// En globals.css:
.hero-animate {
  animation: fadeInUp 0.8s ease-out forwards;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

// En el componente:
<div className="max-w-4xl mx-auto flex flex-col items-center hero-animate">
```

**Archivos a Modificar:**
- `src/app/page.tsx`
- `src/app/globals.css` (si se usa CSS approach)

---

## BUG-002: Carrusel de Features Estatico
**Severidad:** CRITICA - Feature showcase no funciona
**Ubicacion:** `src/app/page.tsx` - Seccion "Ecosistema de Innovacion"

**Codigo Problematico:**
```html
<div class="flex overflow-hidden group py-10">
  <div class="flex gap-8 px-4">
    <!-- 14 cards (7 originales + 7 duplicadas) -->
  </div>
</div>
```

**Problema:** Las cards estan duplicadas sugiriendo intencion de infinite scroll, pero no hay animacion implementada. El usuario solo ve las primeras 2-3 cards sin posibilidad de ver las demas.

**Solucion Completa:**
```tsx
// Crear componente: src/components/InfiniteCarousel.tsx
'use client';
import { useEffect, useRef } from 'react';

interface CarouselProps {
  children: React.ReactNode;
  speed?: number; // segundos para completar un ciclo
}

export function InfiniteCarousel({ children, speed = 30 }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex overflow-hidden group py-10">
      <div
        ref={scrollRef}
        className="flex gap-8 px-4 animate-scroll hover:pause-animation"
        style={{
          animation: `scroll ${speed}s linear infinite`,
        }}
      >
        {children}
        {/* Duplicar children para loop seamless */}
        {children}
      </div>
    </div>
  );
}

// CSS necesario en globals.css:
@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-scroll {
  animation: scroll 30s linear infinite;
}

.animate-scroll:hover,
.group:hover .animate-scroll {
  animation-play-state: paused;
}
```

**Implementacion Alternativa (Embla Carousel):**
```bash
npm install embla-carousel-react embla-carousel-autoplay
```

```tsx
// src/components/FeaturesCarousel.tsx
'use client';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const features = [
  { icon: 'Zap', title: 'Diseno de Experiencias (DUA)', description: '...' },
  { icon: 'Brain', title: 'Elevador Cognitivo (DOK)', description: '...' },
  // ... resto de features
];

export function FeaturesCarousel() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-8">
        {features.map((feature, i) => (
          <FeatureCard key={i} {...feature} />
        ))}
      </div>
    </div>
  );
}
```

---

## BUG-003: Video Placeholder Sin Funcionalidad
**Severidad:** ALTA - CTA visual sin accion
**Ubicacion:** `src/app/page.tsx` - Seccion "Mira ProfeIC en Accion Real"

**Codigo Problematico:**
```html
<div class="relative aspect-video bg-slate-900 rounded-[2.5rem]...">
  <div class="absolute inset-0 bg-[url('https://images.unsplash.com/...')]..."></div>
  <div class="relative w-20 h-20 bg-white rounded-full...">
    <!-- Play button visual solamente -->
  </div>
</div>
```

**Problema:** El boton de play es puramente decorativo. No hay onClick, modal, ni video embed.

**Solucion Completa:**
```tsx
// src/components/VideoModal.tsx
'use client';
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play } from 'lucide-react';

interface VideoModalProps {
  thumbnailUrl: string;
  videoId: string; // YouTube video ID
  title: string;
}

export function VideoModal({ thumbnailUrl, videoId, title }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="relative aspect-video bg-slate-900 rounded-[2.5rem] shadow-2xl border-8 border-white overflow-hidden cursor-pointer group"
        onClick={() => setIsOpen(true)}
        role="button"
        aria-label={`Ver video: ${title}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url('${thumbnailUrl}')` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 text-[#1B3C73] ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Uso en page.tsx:
<VideoModal
  thumbnailUrl="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80"
  videoId="TU_VIDEO_ID_AQUI"
  title="ProfeIC en Accion"
/>
```

**Dependencias:**
```bash
npm install @radix-ui/react-dialog
```

---

## BUG-004: Formulario de Login Incompleto
**Severidad:** CRITICA - Auth no funcional
**Ubicacion:** `src/app/(auth)/login/page.tsx`

**Problemas Identificados:**
1. El boton "Crear una cuenta nueva" es un `<button>` sin funcionalidad
2. No hay manejo de errores visible
3. No hay indicador de carga durante submit
4. No hay validacion de formulario visible
5. No hay "Olvidaste tu contrasena"

**Solucion Completa:**
```tsx
// src/app/(auth)/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z
    .string()
    .email('Correo electronico invalido')
    .refine((email) => email.endsWith('@madrepaulina.cl'), {
      message: 'Debe usar su correo institucional (@madrepaulina.cl)',
    }),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al iniciar sesion');
      }

      toast.success('Bienvenido a ProfeIC');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative">
      {/* ... header con logo ... */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            Correo Institucional
          </label>
          <input
            type="email"
            {...register('email')}
            className={`w-full pl-4 pr-4 py-3 bg-[#F8FAFC] border rounded-xl
              ${errors.email ? 'border-red-500' : 'border-slate-200'}
              focus:ring-2 focus:ring-[#1B3C73] outline-none transition-all`}
            placeholder="docente@madrepaulina.cl"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field con toggle visibility */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
            Contrasena
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full pl-4 pr-12 py-3 bg-[#F8FAFC] border rounded-xl
                ${errors.password ? 'border-red-500' : 'border-slate-200'}
                focus:ring-2 focus:ring-[#1B3C73] outline-none transition-all`}
              placeholder="********"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-[#1B3C73] hover:underline"
          >
            Olvide mi contrasena
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-[#1B3C73] text-white font-bold rounded-xl
            shadow-lg hover:bg-[#2A59A8] transition-all flex items-center justify-center gap-2
            disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            <>
              Ingresar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Register Link - AHORA FUNCIONAL */}
      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-xs text-slate-400 mb-2">Eres nuevo en el sistema?</p>
        <Link
          href="/register"
          className="text-[#1B3C73] font-bold text-sm hover:underline"
        >
          Crear una cuenta nueva
        </Link>
      </div>
    </div>
  );
}
```

**Dependencias Necesarias:**
```bash
npm install react-hook-form @hookform/resolvers zod
```

---

# SECCION 3: PROBLEMAS DE SEO Y MARKETING (P1)

## SEO-001: Meta Tags Incompletos
**Ubicacion:** `src/app/layout.tsx`

**Estado Actual:**
```tsx
<title>ProfeIC | Ecosistema Educativo</title>
<meta name="description" content="Inteligencia Pedagogica..." />
```

**Solucion - Metadata Completa:**
```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://profeic.cl'),
  title: {
    default: 'ProfeIC | Inteligencia Pedagogica para Docentes',
    template: '%s | ProfeIC',
  },
  description: 'Plataforma de inteligencia pedagogica que transforma la gestion de aula. Diseno DUA, elevador cognitivo DOK, evaluaciones automatizadas y mas.',
  keywords: [
    'educacion',
    'pedagogia',
    'docentes',
    'evaluacion',
    'DUA',
    'DOK',
    'curriculum chileno',
    'planificacion',
    'inteligencia artificial educacion',
  ],
  authors: [{ name: 'ProfeIC', url: 'https://profeic.cl' }],
  creator: 'Colegio Madre Paulina',
  publisher: 'ProfeIC',

  // Open Graph para redes sociales
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://profeic.cl',
    siteName: 'ProfeIC',
    title: 'ProfeIC | Transforma la Gestion en Liderazgo Real',
    description: 'Elimina la carga administrativa y enfocate en generar aprendizaje profundo con inteligencia pedagogica.',
    images: [
      {
        url: '/og-image.png', // CREAR ESTA IMAGEN 1200x630px
        width: 1200,
        height: 630,
        alt: 'ProfeIC - Ecosistema Educativo',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'ProfeIC | Inteligencia Pedagogica',
    description: 'Transforma la gestion de aula con IA pedagogica.',
    images: ['/og-image.png'],
    creator: '@profeic',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (agregar cuando tengan cuentas)
  verification: {
    google: 'TU_GOOGLE_VERIFICATION_CODE',
    // yandex: 'TU_YANDEX_CODE',
  },

  // Alternates
  alternates: {
    canonical: 'https://profeic.cl',
  },

  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  // Manifest
  manifest: '/manifest.json',
};
```

**Crear Archivo:** `public/og-image.png` (1200x630px con branding ProfeIC)

---

## SEO-002: Falta Schema.org Structured Data
**Impacto:** Google no entiende que es un SaaS educativo

**Solucion - JSON-LD:**
```tsx
// src/components/StructuredData.tsx
export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ProfeIC',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CLP',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    author: {
      '@type': 'Organization',
      name: 'Colegio Madre Paulina',
      url: 'https://madrepaulina.cl',
    },
    description: 'Plataforma de inteligencia pedagogica para docentes chilenos.',
    featureList: [
      'Diseno de experiencias DUA',
      'Elevador cognitivo DOK',
      'Generador de evaluaciones',
      'Asistente NEE',
      'Coach pedagogico 24/7',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Agregar en layout.tsx:
<body>
  <StructuredData />
  {children}
</body>
```

---

## SEO-003: Falta Sitemap y Robots.txt
**Solucion:**

```tsx
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://profeic.cl';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Agregar mas paginas cuando existan
  ];
}
```

```tsx
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/admin/'],
    },
    sitemap: 'https://profeic.cl/sitemap.xml',
  };
}
```

---

# SECCION 4: PROBLEMAS DE UX/UI (P2)

## UX-001: Navegacion Incompleta
**Problema:** El navbar solo tiene "Acceso Privado", falta navegacion a secciones

**Solucion:**
```tsx
// src/components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#features', label: 'Funcionalidades' },
  { href: '#demo', label: 'Demo' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#precios', label: 'Precios' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-xl'
    } border-b border-slate-200`}>
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Logo />
          <span className="text-2xl font-black text-[#1B3C73]">ProfeIC</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 hover:text-[#1B3C73] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="bg-[#1B3C73] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#2A59A8] transition-all"
          >
            Acceso Privado
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 py-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-8 py-3 text-slate-600 hover:bg-slate-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="px-8 pt-4">
            <Link
              href="/login"
              className="block text-center bg-[#1B3C73] text-white py-3 rounded-xl font-bold"
            >
              Acceso Privado
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
```

---

## UX-002: Footer Links No Funcionales
**Problema:** "Privacidad" y "Soporte" apuntan a `#`

**Solucion:**
1. Crear paginas `/privacy` y `/support`
2. Actualizar footer:

```tsx
// src/components/Footer.tsx
const footerLinks = [
  { href: '/privacy', label: 'Privacidad' },
  { href: '/terms', label: 'Terminos' },
  { href: '/support', label: 'Soporte' },
  { href: '/contact', label: 'Contacto' },
];

// Crear: src/app/privacy/page.tsx
// Crear: src/app/terms/page.tsx
// Crear: src/app/support/page.tsx
```

---

## UX-003: Emoji en Produccion
**Problema:** El emoji del robot puede no renderizar consistentemente

**Codigo Actual:**
```html
<div class="text-3xl">robot_emoji</div>
```

**Solucion:**
```tsx
import { Bot } from 'lucide-react';

<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B3C73] to-[#2A59A8] shadow-md flex items-center justify-center">
  <Bot className="w-8 h-8 text-white" />
</div>
```

---

## UX-004: Inconsistencia de Copyright
**Problema:** Landing dice "2026", Login dice "2025"

**Solucion:** Crear constante global:
```tsx
// src/lib/constants.ts
export const SITE_CONFIG = {
  name: 'ProfeIC',
  year: new Date().getFullYear(),
  institution: 'Colegio Madre Paulina',
};

// Uso:
<p>Direccion {SITE_CONFIG.institution}</p>
```

---

# SECCION 5: PERFORMANCE Y OPTIMIZACION (P2)

## PERF-001: Imagen de Unsplash Sin Optimizar
**Problema:** Imagen de fondo cargada directamente de Unsplash

```html
<div class="bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80')]">
```

**Solucion:**
1. Descargar imagen y guardar en `/public/images/`
2. Usar Next Image con blur placeholder:

```tsx
import Image from 'next/image';

<div className="relative aspect-video">
  <Image
    src="/images/classroom-hero.jpg"
    alt="Aula moderna"
    fill
    className="object-cover"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Generar con plaiceholder
    priority={false}
  />
</div>
```

---

## PERF-002: Preload de Fuentes Excesivo
**Estado Actual:** 2 fuentes WOFF2 precargadas

**Recomendacion:** Verificar si ambas son necesarias. Considerar usar `font-display: swap`:

```css
/* globals.css */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
  font-weight: 400 900;
}
```

---

## PERF-003: Bundle Analysis Recomendado
```bash
# Instalar analyzer
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // config
});

# Ejecutar
ANALYZE=true npm run build
```

---

# SECCION 6: SEGURIDAD (P1)

## SEC-001: Validacion de Input del Lado Cliente
**Problema:** Solo hay `required=""` en inputs

**Solucion:** Implementar validacion server-side con Zod (ver BUG-004)

---

## SEC-002: Rate Limiting en Login
**Implementar:**
```tsx
// src/app/api/auth/login/route.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 intentos por minuto
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json(
      { error: 'Demasiados intentos. Intente en 1 minuto.' },
      { status: 429 }
    );
  }

  // ... logica de login
}
```

---

## SEC-003: Headers de Seguridad
```tsx
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

---

# SECCION 7: FUNCIONALIDADES FALTANTES PARA $1M

## FEAT-001: Sistema de Precios/Planes
Para monetizar, necesitas pagina de precios:

```tsx
// src/app/pricing/page.tsx
const plans = [
  {
    name: 'Basico',
    price: 'Gratis',
    features: ['5 planificaciones/mes', 'Elevador DOK', 'Soporte email'],
    cta: 'Comenzar Gratis',
  },
  {
    name: 'Profesional',
    price: '$29.990/mes',
    features: ['Ilimitado', 'Todas las herramientas', 'Soporte prioritario', 'API access'],
    cta: 'Probar 14 dias gratis',
    popular: true,
  },
  {
    name: 'Institucional',
    price: 'Personalizado',
    features: ['Multi-sede', 'Dashboard directivo', 'Integraciones', 'SLA 99.9%'],
    cta: 'Contactar Ventas',
  },
];
```

---

## FEAT-002: Analytics y Tracking
```bash
npm install @vercel/analytics @vercel/speed-insights
```

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

<body>
  {children}
  <Analytics />
  <SpeedInsights />
</body>
```

---

## FEAT-003: Sistema de Onboarding
Para mejorar activacion de usuarios:

```tsx
// src/components/OnboardingFlow.tsx
// Implementar wizard de 3-5 pasos post-registro
// 1. Seleccionar rol (Docente/UTP/Director)
// 2. Seleccionar asignaturas
// 3. Configurar preferencias
// 4. Tour guiado de features
```

---

## FEAT-004: Dashboard Metricas Clave
Para UTP/Directores, crear dashboard con:
- Docentes activos
- Planificaciones generadas
- Uso de herramientas por tipo
- Tendencias semanales

---

# SECCION 8: CHECKLIST DE IMPLEMENTACION

## Prioridad Inmediata (Esta Semana)
- [ ] Arreglar hero invisible (BUG-001)
- [ ] Implementar carrusel funcional (BUG-002)
- [ ] Hacer video clickeable (BUG-003)
- [ ] Completar formulario login (BUG-004)
- [ ] Agregar meta tags SEO (SEO-001)

## Prioridad Alta (Proximas 2 Semanas)
- [ ] Navegacion completa con mobile menu
- [ ] Paginas legales (Privacidad, Terminos)
- [ ] Structured data JSON-LD
- [ ] Sitemap y robots.txt
- [ ] Rate limiting en auth

## Prioridad Media (Proximo Mes)
- [ ] Pagina de precios
- [ ] Sistema de onboarding
- [ ] Analytics integration
- [ ] Performance optimization
- [ ] Security headers

## Para Escalar a $1M
- [ ] Multi-tenancy para colegios
- [ ] API publica documentada
- [ ] Integraciones (Google Classroom, etc.)
- [ ] Dashboard analytics para instituciones
- [ ] Sistema de facturacion (Stripe/Transbank)

---

# SECCION 9: COMANDOS PARA ANTIGRAVITY

Copia y pega estos comandos para que Antigravity ejecute las correcciones:

```
TAREA 1: Arreglar hero invisible
- Archivo: src/app/page.tsx
- Buscar: style="opacity:0;transform:translateY(20px)"
- Reemplazar por: className="animate-fadeInUp"
- Agregar en globals.css la animacion @keyframes fadeInUp

TAREA 2: Implementar carrusel infinito
- Crear: src/components/InfiniteCarousel.tsx
- Agregar CSS de animacion scroll
- Reemplazar seccion de features en page.tsx

TAREA 3: Video modal funcional
- Instalar: npm install @radix-ui/react-dialog
- Crear: src/components/VideoModal.tsx
- Reemplazar placeholder en page.tsx

TAREA 4: Login completo
- Instalar: npm install react-hook-form @hookform/resolvers zod
- Reescribir: src/app/(auth)/login/page.tsx
- Crear: src/app/(auth)/register/page.tsx
- Crear: src/app/(auth)/forgot-password/page.tsx

TAREA 5: SEO completo
- Actualizar: src/app/layout.tsx con metadata completa
- Crear: src/app/sitemap.ts
- Crear: src/app/robots.ts
- Crear: src/components/StructuredData.tsx
- Crear: public/og-image.png (1200x630px)
```

---

**Fin del Informe Tecnico**

*Documento generado por MiniMax Agent - 2026-02-18*


## PROFEIC_LA_BIBLIA.md
# 📘 PROFEIC: LA BIBLIA DEL ECOSISTEMA
## Documento Maestro Fundacional, Arquitectónico y Comercial (B2B SaaS)

**Nombre Oficial:** ProfeIC Suite Empresarial (ProfeIC Aula & Gestión 360°)
**Fecha de Emisión:** Febrero 2026
**Naturaleza del Documento:** "Single Source of Truth" (Única fuente de la verdad). Este documento contiene el 100% de la justificación pedagógica, técnica y comercial de la plataforma para fines de marketing, levantamiento de capital, inducción de nuevos empleados y ventas a colegios.

---

# ÍNDICE GENERAL
1. **GÉNESIS Y FILOSOFÍA:** El Problema, la Solución y el Origen (CMP).
2. **MARCO PEDAGÓGICO:**  El "Cerebro" detrás de la IA (DUA, DOK, Mineduc).
3. **ARQUITECTURA TECNOLÓGICA:** Infraestructura, Seguridad y el Candado SaaS B2B.
4. **MÓDULO 1: PROFEIC AULA:** Disección Técnica y de Valor para el Docente.
5. **MÓDULO 2: GESTIÓN 360°:** Disección Técnica y de Valor para el Directivo.
6. **MODELO DE NEGOCIO Y UNIT ECONOMICS:** Precios, Tramos y Rentabilidad.
7. **ESTRATEGIA GO-TO-MARKET (MARKETING):** Cómo vender el sistema (Ángulos y Copywriting).
8. **HOJA DE RUTA (ROADMAP):** Fase 2 y el Futuro.

---

# 1. GÉNESIS Y FILOSOFÍA

## 1.1. El Problema que Venimos a Destruir (El "Burnout" Burocrático)
La educación escolar (especialmente en Chile y Latinoamérica) sufre una crisis silenciosa: los profesores están colapsados no por hacer clases, sino por **documentarlas**. La planificación curricular, la confección de evaluaciones equilibradas y la adaptación para estudiantes con Necesidades Educativas Especiales (NEE) consumen, en promedio, entre 6 y 10 horas extracurriculares a la semana. 

Paralelamente, los equipos directivos (Directores y UTP) están "ciegos". La supervisión de estas planificaciones ocurre mediante la revisión manual de documentos en carpetas físicas o drives inconexos, lo que impide tomar decisiones estratégicas en tiempo real.

## 1.2. La Solución ProfeIC
ProfeIC no es "ChatGPT para profes". Es un **Ecosistema Cerrado Institucional** de dos caras:
1.  **Para el Docente (ProfeIC Aula):** Un verdadero *exoesqueleto intelectual* impulsado por Inteligencia Artificial Generativa y RAG (Retrieval-Augmented Generation) que automatiza la burocracia documental en segundos, pero bajo estrictos estándares ministeriales y metodológicos. Le devuelve al profesor su tiempo.
2.  **Para el Directivo (Gestión 360°):** Una central de control de datos (*Dashboard Analytics*) que mide el desempeño, la adopción y audita la calidad de las clases de toda la institución en tiempo real. Le devuelve al UTP el rol de líder pedagógico, sacándolo de la revisión burocrática.

## 1.3. El ADN Fundacional: El Colegio Madre Paulina (Design Partner)
El mayor riesgo de la tecnología educativa ("EdTech") es ser creada por ingenieros que no entienden el aula. ProfeIC nace orgánicamente dentro del **Colegio Madre Paulina (CMP)**. 
Cada herramienta, cada prompt y cada flujo de trabajo fue validado iterativamente ("Dogfooding") por docentes y directivos reales enfrentando problemas reales (clases híbridas, PIE, alumnos difíciles). El conocimiento extraído de esta incubación es lo que llamamos el **"ADN Pedagógico de ProfeIC"**, un activo intangible invaluable que nos separa rotundamente de soluciones genéricas norteamericanas.

---

# 2. MARCO PEDAGÓGICO (El "Cerebro" de la IA)

La Inteligencia Artificial de la plataforma no improvisa. Cada solicitud que envía el profesor pasa por un "Sistema Nervioso" en el backend (FastAPI) que inyecta instrucciones pedagógicas avanzadas *antes* de llegar al modelo generativo. Esto garantiza que la plataforma "piense" como un magíster en educación y no como un asistente virtual ordinario.

### 2.1. DUA (Diseño Universal de Aprendizaje)
Toda planificación y actividad generada por ProfeIC busca inherentemente ofrecer **Múltiples Formas de Representación, Expresión e Implicación**, asegurando que las neurodivergencias y los diferentes estilos de aprendizaje (visual, auditivo, kinestésico) sean abordados desde el minuto uno, tal como exige el Decreto 83.

### 2.2. Taxonomía DOK de Norman Webb (Depth of Knowledge)
El sistema no solo crea preguntas; *mide la profundidad* de las mismas. A diferencia de la clásica Taxonomía de Bloom (que mide el tipo de acción), 
ProfeIC analiza el nivel cognitivo requerido usando DOK:
- Nivel 1: Recordar y Reproducir.
- Nivel 2: Habilidad y Concepto.
- Nivel 3: Pensamiento Estratégico.
- Nivel 4: Pensamiento Extendido.
Esto se materializa en el módulo **Elevador Cognitivo**, que literalmente "toma una tarea aburrida y la transforma en un desafío intelectual superior".

### 2.3. Alineación al Currículum Mineduc
ProfeIC no inventa temarios. Su base de datos (e integraciones CSV) respeta las Bases Curriculares Chilenas, los OAT (Objetivos de Aprendizaje Transversales) y los indicadores de desarrollo exigidos.

---

# 3. ARQUITECTURA TECNOLÓGICA (Enterprise-Grade)

El software ha sido diseñado para "no caerse", ser hiperrápido y proteger a muerte los datos de menores y la propiedad intelectual de cada colegio.

## 3.1. Stack Tecnológico de Altas Prestaciones
- **Frontend (Cara del Usuario):** React.js bajo el framework Next.js 14. Diseño estilizado y fluido ("Luxury Suite") escrito en Vanilla TailwindCSS para lograr interfaces similares a las de Silicon Valley (Glassmorphism, gradientes sutiles).
- **Backend (El Cerebro AI):** Python con FastAPI. La decisión de separar el Backend es crucial: protege nuestras API Keys de OpenAI/Anthropic de ser robadas, permite procesar archivos pesados (PDFs, Excel) de forma asíncrona, y encapsula los Prompts Maestros (nuestro Core Business).
- **Base de Datos:** Supabase (PostgreSQL hiper-escalable).

## 3.2. Seguridad Estricta y Multi-Tenant (Inquilinos Aislados)
- **RLS (Row Level Security):** La base de datos tiene "policías" a nivel de fila. Un profesor del Colegio A no puede bajo ninguna circunstancia matemática consultar (mediante hackeo o error de URL) las notas o planificaciones de los profesores del Colegio B.
- **Auditoría UI/UX & Hardening:** (Fase 1 completada en Feb 2026). Prevención de *Prompt Injections* y sanitización de inputs para evitar que alumnos traviesos vulneren la IA de los profesores.
- **Responsividad Crítica:** El 100% de la plataforma (incluyendo formularios de evaluación de 360°) está optimizada para poder usarse desde un iPad dentro de la sala de clases (el caso de uso principal del UTP al evaluar).

## 3.3. El Candado B2B (Registro "Invite-Only")
A diferencia del software de consumidor final (B2C) como Netflix, ProfeIC no tiene un botón de "Regístrate aquí". Esto es un software corporativo (B2B). 
Hemos implementado la arquitectura SaaS Administrativa:
1.  **Nadie puede crearse una cuenta pública.**
2.  Solo la cuenta SuperAdmin (el dueño de ProfeIC) puede dar de alta a una Institución ("Tenant").
3.  El SuperAdmin envía una **Invitación Mágica** (Vía la API de *Service Role* de Supabase) que inscribe al profesor y lo encapsula dentro del ID numérico de su colegio de por vida, asignándole un rol rígido (`teacher`, `utp`, `director`).

---

# 4. MÓDULO 1: PROFEIC AULA (Valor para el Docente)

Esta es la "trinchera". La biblioteca de herramientas donde el profesor interacciona diariamente con el sistema. 

### 4.1 Planificador Inteligente (IAAustral)
- **Función:** Genera planificaciones clase a clase con tiempos definidos, OAs y recursos.
- **Marketing Pitch:** *"Pasar de la hoja en blanco a una planificación excelente en 35 segundos."*
- **Soporte Físico:** El docente nunca envía la misma tabla; la exportamos en formatos imprimibles profesionales.

### 4.2 Generador de Rúbricas
- **Función:** Acaba con la subjetividad. El profesor describe qué quiere evaluar (ej. "Maqueta del sistema solar") y la IA escupe una matriz tabular de evaluación con 4 niveles de desempeño e indicadores precisos para cada columna.
- **Valor Agregado:** Permite descargar el resultado en Word, algo que el Mineduc exige para auditar al colegio.

### 4.3 Evaluaciones Automatizadas
- **Función:** Creación de pruebas sumativas complejas (Múltiple opción, desarrollo) mezclando niveles de pensamiento (DOK). Incluye la creación paralela y automática de la _"Hoja de Respuestas Oficial para el Profesor"_.

### 4.4 Analizador de Trabajos (RAG Limitado)
- **Función:** Sube un ensayo complejo en PDF de un alumno, y el sistema extrae las falencias o evalúa en base a una pauta. La magia detrás de esto es el procesamiento de documentos local sin enviar el PDF puro a ChatGPT, cuidando la soberanía del dato.

### 4.5 El Asistente NEE (Necesidades Especiales)
- **Función (La Joya Humana):** ProfeIC toma la lectura oficial o la actividad del día dictaminada por la UTP y genera una "Adecuación Curricular", es decir, la misma actividad pero en tres formatos distintos (Visual, Resuma corto, Tareas pictóricas) para alumnos del programa PIE, TEA o con TDAH.
- **Marketing Pitch:** *"Ningún estudiante será dejado atrás. Automatizamos la inclusión real sin duplicar el trabajo nocturno del profesor PIE."*

### 4.6 Elevador Cognitivo & Mentor
- **Función:** Coaching automatizado 24/7. El *Mentor* es un chat directo en contexto educacional, sin "alucinaciones". El *Elevador* desafía la mediocridad, proponiendo al docente hacer sus tareas más retadoras según la matriz de Depth of Knowledge.

### 4.7 Biblioteca Institucional y Social (Sala de Profesores)
- **Función:** Reducción del "síndrome de la isla". Lo que el profesor de Biología diseña y guarda en su Biblioteca, queda registrado. El NewsWall o Muro Social en el Dashboard de inicio permite compartir artículos, circulares directivas de la escuela o celebrar cumpleaños, fomentando Cultura Organizacional Digital.

---

# 5. MÓDULO 2: GESTIÓN 360° (Valor para el Sostenedor)

Si con ProfeIC Aula el profesor gana tiempo, **con Gestión 360° el Sostenedor gana control y auditoría**. Este es el módulo por el que las escuelas compran las licencias caras.

### 5.1 Dashboard Analítico y Semáforos
- **Métricas Visibles:** "Adoption Rate" (Qué tanto los profesores están usando la plataforma). Es la prueba viva de que el sostenedor no malgastó el presupuesto.
- **Semáforo de Compromiso:** En verde, quién tiene su planificador al día. En rojo, el departamento de ciencias que lleva semanas sin subir evidencias. Un mapa de calor humano para tomar acciones preventivas.
- **Rigor Evolution Indicator:** Muestra a lo largo del año académico si el colegio "subió la vara" metodológica general y del Dominio Charlotte Danielson.

### 5.2 El Ecosistema de Observación de Aula (El iPad del UTP)
El flujo más importante para los directivos, digitalizado a la perfección:
1.  **Pre-Observación:** La rúbrica antes de entrar al aula.
2.  **Observación en Vivo:** La evaluación bajo los Dominios Oficiales de la Evaluación Docente (A, B, C, D). El UTP marca en la tablet qué observó.
3.  **Post-Observación y Feedback:** ¿Qué pasó después de evaluar? Aquí es donde se firman compromisos: (Ej. "María mejorará el cierre de sus clases"). 
4.  **Tracking de Metas:** La pestaña de "Trayectorias" donde el Director anota y vigila el progreso macro de María. 

### 5.3 Reporte Ejecutivo Instantáneo
- En lugar de que UTP pase el mes de Diciembre recopilando datos para el informe anual, el Administrador tiene un botón: *"Generar Reporte de Institución"*. El sistema escupe el resumen gerencial compilado, listo para presentar a los dueños, al directorio del colegio o al Mineduc.

---

# 6. MODELO DE NEGOCIO Y "UNIT ECONOMICS"

Con la integración de la Fase 1 B2B (Manejo de Licencias por Tenant), la estrategia comercial abandona el B2C (vender cuentas individuales a $5.000) por los enormes costos de fricción de ventas y baja retención. ProfeIC se vende directo a la cúpula de poder de las corporaciones educativas.

## 6.1 Los Márgenes Groseros del SaaS Educativo
- El costo de operación (Tokens OpenAI, Anthropic, Servidores Vercel/Supabase) para asistir a **100 Profesores todo el mes** oscila entre los **$15.000 y $30.000 CLP totales**.
- **Esto significa un margen de beneficio sobre el 90%.** Es software de rentabilidad premium.

## 6.2 Estrategia de Precios (Tiers)
*(Visible en la página /institucional de ProfeIC)*

| PLAN                 | RANGO DE PRECIO | PÚBLICO OBJETIVO                                   | INCLUYE                                                | MOTIVO PSICOLÓGICO                                                                                                        |
|----------------------|-----------------|----------------------------------------------------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| **BÁSICO**           | **$120.000 /Mes** | Colegios chicos, rurales, dependencias aisladas.  | Solo ProfeIC Aula (Herramientas IA para 20 docentes).  | Precio Ancla. Lo suficientemente barato como para ser pagado con la caja chica del colegio, pero sin el oro administrativo. |
| **INSTITUCIONAL PRO**| **$290.000 /Mes** | El colegio estándar municipal/particular chileno. | Hasta 60 profes + Toda la **Gestión 360° Directiva**.  | El Plan Estrella. Ahorrar la contratación de un analista de datos y un administrativo UTP extra compensa infinitamente la cuota.        |
| **ENTERPRISE**       | Cotizar a Medida| Red de Colegios, Sostenedores Multi-Sede.          | Panel multi-sede, profes ilimitados, Onboarding físico.| Venta por volumen. La gran cuenta que da estabilidad anual a tu empresa.                                                    |

*¿Por qué estos montos?* Un colegio subvencionado gasta fácilmente $300.000 a $800.000 mensuales en plataformas ERP obsoletas que solo sirven para tomar asistencia (Papas, Lirmi, Webclass básico). ProfeIC entra a la billetera compitiendo por **Calidad Pedagógica**, un dolor muchísimo más caro.

---

# 7. ESTRATEGIA "GO-TO-MARKET" (Cómo Vender Empezando Mañana)

Con la plataforma blindada, la página de tarifas en línea y tu servidor activo, no necesitas a Stripe para empezar a hacer dinero (esa automatización es para cuando escales). Ahora necesitas clientes fundadores.

## 7.1 El Pitch Infalible (Copywriting para Redes)
La regla de oro para vender ProfeIC no es vender *Inteligencia Artificial*. La IA asusta o aburre a los directores mayores. **Vendes Tiempo y Paz Mental.**

*   **Para Profesores (Tus evangelizadores internos):** *"El software que hace en 20 minutos lo que a ti te toma el fin de semana completo en tu casa. Recupera tu domingo y deja que nuestro Cerebro Pedagógico redacte el DUA, tú dedícate a lo humano."*
*   **Para Directores (Tu comprador):** *"La única suite del mercado nacida en un colegio real (Madre Paulina) que no solo le ahorra estrés a sus profesores, sino que le entrega a usted un tablero de control milimétrico sobre la calidad de enseñanza y el currículum de toda su institución. Es la diferencia entre reaccionar y liderar."*
*   **Para Jefes UTP (Tus mayores aliados):** *"Le devolvemos el tiempo para estar dentro de las salas asesorando docentes, en vez de estar cerrados revisando la ortografía de 40 planificaciones en Excel."*

## 7.2 Método de Tracción (GTM)
1.  **Venta Directa Consultiva:** El Sostenedor hace click en "Contratar para mi Colegio" en  `profeic.com/institucional`.
2.  Eso abre un correo directo a ti (`re.se.alvarez@gmail.com`).
3.  Agendas un Zoom ("ProfeIC Demo") de 30 mins.
4.  No les muestras *cómo* funciona la IA en código. Haces que ellos te den un tema del colegio y lo escupes planificado en 3 segundos en pantalla compartida ("El Efecto Wow"). Luego les muestras las barras y métricas de progreso de Directivos.
5.  Firman. Te depositan $290.000 o pagan un cheque a tu empresa por adelantado (Año Anual: $2.5 o $3 Millones al año de una).
6.  Entras a tu súper panel Oculto "SaaS Root Control", creas el colegio, aumentas el límite de profes, y le mandas la invitación por correo al Director para que él meta a sus docentes. 
7.  Negocio Cerrado. Cero fricción de Stripe por ahora.

---

# 8. HOJA DE RUTA AL FUTURO (Fase 2 y más allá)

La tecnología actual sustenta holgadamente a los primeros 25 Colegios Institucionales. Al llegar a ese hito (Facturación proyectada: +$7.000.000 Mensuales Recurrentes), ejecutaremos la Fase 2:

*   **1. Integración de Pagos Automatizados (Stripe Billing):** Cuando la carga contable manual te colapse, conectaremos Stripe para tarjetas de crédito corporativas. Si un colegio no renueva suscripción anual, la DB suspende sus cuentas automáticamente.
*   **2. Portal Self-Service:** El UTP entra a su "Panel Manager" y compra sillas/cupos extra o retira a profesores despedidos, sin necesidad de hablar contigo por correo.
*   **3. Integración RAG Institucional V2 (Bases Propias):** Que un colegio suba su propia "Política de Convivencia Escolar en PDF" y toda la IA de *SUS* docentes pase a estar formateada según normativas literales de su recinto escolar. Esa personalización corporativa permitiría vender los planes por sobre los $1.500.000 CLP mensuales por sede.

---

> *"ProfeIC comenzó buscando ayudar al profesor. Terminó construyendo la máquina de estandarización pedagógica más avanzada del ecosistema hispanohablante. El futuro no es reemplazar al docente; es dotarlo de una armadura de Inteligencia Analítica"*


# 2. INFRAESTRUCTURA Y ESQUEMA DE BASE DE DATOS (SUPABASE)

El siguiente es el esquema completo que da vida al sistema Multi-Tenant y garantiza la seguridad de la información mediante RLS (Row Level Security):

### Archivo: `20260213000000_add_email_to_profiles.sql`
```sql
-- Add email column to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;

-- Update trigger function to include email on new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

```

### Archivo: `20260219_crear_eventos.sql`
```sql
-- 1. Crear la tabla de eventos institucionales
CREATE TABLE IF NOT EXISTS public.school_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;

-- 3. Política: Todos los usuarios autenticados pueden VER los eventos
CREATE POLICY "Permitir VER eventos a usuarios autenticados" 
ON public.school_events 
FOR SELECT 
TO authenticated 
USING (true);

-- 4. Política: Solo los Administradores, Directores o UTP pueden CREAR eventos
CREATE POLICY "Permitir CREAR eventos solo a directivos" 
ON public.school_events 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
    )
);

-- 5. Política: Solo los Administradores, Directores o UTP pueden EDITAR eventos
CREATE POLICY "Permitir EDITAR eventos solo a directivos" 
ON public.school_events 
FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
    )
);

-- 6. Política: Solo los Administradores, Directores o UTP pueden ELIMINAR eventos
CREATE POLICY "Permitir ELIMINAR eventos solo a directivos" 
ON public.school_events 
FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_users
        WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
    )
);

```

### Archivo: `20260219_school_events.sql`
```sql
-- Create school_events table
CREATE TABLE IF NOT EXISTS public.school_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for all authenticated users
CREATE POLICY "Allow SELECT for authenticated users on school_events"
    ON public.school_events FOR SELECT
    TO authenticated
    USING (true);

-- Allow INSERT for admins
CREATE POLICY "Allow INSERT for admins on school_events"
    ON public.school_events FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.authorized_users
            WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
        )
    );

-- Allow UPDATE for admins
CREATE POLICY "Allow UPDATE for admins on school_events"
    ON public.school_events FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.authorized_users
            WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.authorized_users
            WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
        )
    );

-- Allow DELETE for admins
CREATE POLICY "Allow DELETE for admins on school_events"
    ON public.school_events FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.authorized_users
            WHERE email = auth.email() AND role IN ('admin', 'director', 'utp')
        )
    );

```

### Archivo: `20260220_create_schools_table.sql`
```sql
-- Create a table for schools (Instituciones)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- Short name for URLs/filtering
    domain TEXT, -- Optional: to auto-map users by email domain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add school_id to profiles to link users to schools
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='school_id') THEN
        ALTER TABLE public.profiles ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Policies for public.schools
CREATE POLICY "Schools are viewable by authenticated users" 
ON public.schools FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only Super Admin can manage schools" 
ON public.schools FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 're.se.alvarez@gmail.com');

-- Seed a default school
INSERT INTO public.schools (name, slug) 
VALUES ('Colegio Madre Paulina', 'cmp')
ON CONFLICT (slug) DO NOTHING;

-- Backfill existing profiles with the default school
UPDATE public.profiles SET school_id = (SELECT id FROM public.schools WHERE slug = 'cmp')
WHERE school_id IS NULL;

```

### Archivo: `20260220_create_telemetry_table.sql`
```sql
-- Create a table for product telemetry and analytics
CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT, -- Capturing email for easier filtering in Early Stage
    event_name TEXT NOT NULL, -- e.g. 'regenerate_question', 'login_success'
    module TEXT, -- e.g. 'lectura_inteligente', 'dashboard'
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- dynamic data (e.g. error messages, counts)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can INSERT their OWN events (silent tracking)
CREATE POLICY "Users can insert their own telemetry" 
ON public.telemetry_events FOR INSERT 
TO authenticated 
WITH CHECK (true); -- We allow all authenticated users to report events

-- Policy: ONLY re.se.alvarez@gmail.com can SELECT (view) telemetry data
CREATE POLICY "Only re.se.alvarez@gmail.com can view telemetry" 
ON public.telemetry_events FOR SELECT 
TO authenticated 
USING (auth.jwt() ->> 'email' = 're.se.alvarez@gmail.com');

-- Add index for performance in future analysis
CREATE INDEX IF NOT EXISTS idx_telemetry_event_name ON public.telemetry_events(event_name);
CREATE INDEX IF NOT EXISTS idx_telemetry_school_id ON public.telemetry_events(school_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON public.telemetry_events(created_at);

```

### Archivo: `20260221_enforce_tenant_rls.sql`
```sql
-- MIGRATION: Enforce tenant_id / school_id based Row Level Security
-- Addresses Phase 2 Hardening: Ensures isolation between schools.

-- 1. Helper function to get current user's school safely to avoid infinite recursion
CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid();
$$;

-- 2. Secure Profiles Table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Users can view profiles in their own school or superadmin" ON public.profiles
  FOR SELECT USING (
    school_id = get_user_school_id() 
    OR id = auth.uid() 
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

-- 3. Secure Observation Cycles
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver ciclos" ON public.observation_cycles;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear/editar ciclos" ON public.observation_cycles;

CREATE POLICY "View observation_cycles by school"
  ON public.observation_cycles FOR SELECT TO authenticated
  USING (
    teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

CREATE POLICY "Manage observation_cycles by school"
  ON public.observation_cycles FOR ALL TO authenticated
  USING (
    teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

-- 4. Secure Observation Data
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver datos" ON public.observation_data;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear/editar datos" ON public.observation_data;

CREATE POLICY "View observation_data by school"
  ON public.observation_data FOR SELECT TO authenticated
  USING (
    cycle_id IN (
      SELECT id FROM observation_cycles 
      WHERE teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    )
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

CREATE POLICY "Manage observation_data by school"
  ON public.observation_data FOR ALL TO authenticated
  USING (
    cycle_id IN (
      SELECT id FROM observation_cycles 
      WHERE teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    )
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

-- 5. Secure Commitments (Trajectory)
DROP POLICY IF EXISTS "Authenticated users can read commitments" ON public.commitments;
DROP POLICY IF EXISTS "Authenticated users can insert commitments" ON public.commitments;
DROP POLICY IF EXISTS "Authenticated users can update commitments" ON public.commitments;

CREATE POLICY "View commitments by school"
  ON public.commitments FOR SELECT TO authenticated
  USING (
    teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

CREATE POLICY "Manage commitments by school"
  ON public.commitments FOR ALL TO authenticated
  USING (
    teacher_id IN (SELECT id FROM profiles WHERE school_id = get_user_school_id())
    OR auth.jwt()->>'email' = 're.se.alvarez@gmail.com'
  );

```

### Archivo: `20260221_saas_schools_update.sql`
```sql
-- Add SaaS management columns to public.schools

DO $$ 
BEGIN 
    -- Add status column (active, suspended, past_due)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='status') THEN
        ALTER TABLE public.schools ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'past_due'));
    END IF;

    -- Add subscription_plan column (trial, pro, enterprise)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='subscription_plan') THEN
        ALTER TABLE public.schools ADD COLUMN subscription_plan TEXT DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'pro', 'enterprise'));
    END IF;

    -- Add max_users column (integer limit of teachers allowed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='max_users') THEN
        ALTER TABLE public.schools ADD COLUMN max_users INTEGER DEFAULT 10;
    END IF;
END $$;

-- Update the default school ('cmp') to be an enterprise customer with more users
UPDATE public.schools 
SET subscription_plan = 'enterprise', 
    max_users = 100 
WHERE slug = 'cmp';

```

### Archivo: `acompanamiento_360.sql`
```sql
-- MIGRATION: Acompañamiento 360
-- Tables for Observation Cycles and Data

-- 1. Tabla de Ciclos de Observación
create table public.observation_cycles (
  id uuid not null default gen_random_uuid (),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  observer_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'planned'::text check (status in ('planned', 'in_progress', 'completed')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint observation_cycles_pkey primary key (id)
);

-- 2. Tabla de Datos del Ciclo (Stages)
create table public.observation_data (
  id uuid not null default gen_random_uuid (),
  cycle_id uuid not null references public.observation_cycles (id) on delete cascade,
  stage text not null check (stage in ('pre', 'execution', 'reflection')),
  content jsonb not null default '{}'::jsonb, -- Almacena inputs, checkboxes, URLs de fotos, etc.
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint observation_data_pkey primary key (id),
  constraint observation_data_cycle_stage_unique unique (cycle_id, stage) -- Solo un registro por etapa por ciclo
);

-- 3. Habilitar RLS
alter table public.observation_cycles enable row level security;
alter table public.observation_data enable row level security;

-- 4. Políticas de Seguridad (Simples por ahora: Authenticated users can read/write)
-- En producción, esto debería restringirse a Admin/Observer o al Teacher propio.

create policy "Usuarios autenticados pueden ver ciclos"
  on public.observation_cycles for select
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden crear/editar ciclos"
  on public.observation_cycles for all
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden ver datos"
  on public.observation_data for select
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden crear/editar datos"
  on public.observation_data for all
  to authenticated
  using (true);

-- 5. Trigger para updated_at (Opcional pero recomendado)
-- (Asumiendo que existe una función moddatetime, si no, crearla o omitir)

```

### Archivo: `authorized_users.sql`
```sql
-- Create a table for authorized users (Pre-approved list)
CREATE TABLE IF NOT EXISTS public.authorized_users (
  email TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'director', 'utp', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public authorized_users are viewable by authenticated users." ON public.authorized_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert/update authorized_users." ON public.authorized_users
  FOR ALL USING (
    auth.jwt() ->> 'email' = 're.se.alvarez@gmail.com' -- Hardcoded Super Admin for now
  );

-- Helper function to sync profile role on signup
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  -- Check if email is in authorized_users
  SELECT role INTO user_role FROM public.authorized_users WHERE email = new.email;
  
  IF user_role IS NOT NULL THEN
    -- Update the user metadata with the role
    UPDATE auth.users SET raw_user_meta_data = 
      jsonb_set(raw_user_meta_data, '{role}', to_jsonb(user_role))
    WHERE id = new.id;
    
    -- Update status in authorized_users
    UPDATE public.authorized_users SET status = 'active' WHERE email = new.email;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on profile creation (or user signup)
-- Note: 'profiles' creation is triggered by auth.users insert. We might want to hook into that too.
-- Let's stick to simple table creation for now.

```

### Archivo: `backfill_profiles.sql`
```sql
-- Backfill script para crear perfiles a usuarios antiguos que no tienen uno.

INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT 
    au.id, 
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'avatar_url'
FROM auth.users au
LEFT JOIN public.profiles pp ON pp.id = au.id
WHERE pp.id IS NULL;

```

### Archivo: `community.sql`
```sql
-- Migration: Community Features (Corrected)
-- Target: biblioteca_recursos (Unified Table)

-- 1. Add Community Columns
ALTER TABLE biblioteca_recursos 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Profe IC';

-- 2. Create Index for Feed Performance
CREATE INDEX IF NOT EXISTS idx_biblioteca_public ON biblioteca_recursos(is_public) WHERE is_public = TRUE;

```

### Archivo: `create_reports_table.sql`
```sql
-- Create a table to store AI-generated Executive Reports
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null check (type in ('executive', 'trajectory', 'flash')), -- Type of report
  content jsonb not null, -- The full JSON output from Gemini
  metrics jsonb, -- Quantitative data associated with the report (e.g. averages)
  author_id uuid references auth.users(id), -- Who generated it (usually Admin)
  target_id uuid references auth.users(id) -- Target user (for trajectory/flash) or null for global
);

-- Enable RLS
alter table public.reports enable row level security;

-- Policy: Admins/Directors/UTP can view all reports
create policy "Admins can view all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.authorized_users
      where email = auth.email()
      and role in ('admin', 'director', 'utp')
    )
  );

-- Policy: Teachers can view reports targeting them (e.g. Trajectory)
create policy "Teachers can view their own reports"
  on public.reports for select
  using (
    target_id = auth.uid()
  );

-- Policy: Admins can insert reports
create policy "Admins can insert reports"
  on public.reports for insert
  with check (
    exists (
      select 1 from public.authorized_users
      where email = auth.email()
      and role in ('admin', 'director', 'utp')
    )
  );

```

### Archivo: `enrich_profiles_and_add_commitments.sql`
```sql
-- MIGRATION: Enrich Profiles & Add Commitments (Master Prompt)

-- 1. Enrich Profiles Table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- 2. Create Commitments Table (Trajectory System)
CREATE TABLE IF NOT EXISTS public.commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.observation_cycles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'achieved', 'missed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT commitments_pkey PRIMARY KEY (id)
);

-- 3. Enable RLS for Commitments
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Commitments
-- Authenticated users can read commitments (for trajectory view)
CREATE POLICY "Authenticated users can read commitments"
  ON public.commitments FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users (Coordinators/Directors) can insert commitments
CREATE POLICY "Authenticated users can insert commitments"
  ON public.commitments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update commitments
CREATE POLICY "Authenticated users can update commitments"
  ON public.commitments FOR UPDATE
  TO authenticated
  USING (true);

```

### Archivo: `fix_library_rls.sql`
```sql
-- Enable RLS on library table
ALTER TABLE public.biblioteca_recursos ENABLE ROW LEVEL SECURITY;

-- 1. Permits exist for owners (CRUD)
DROP POLICY IF EXISTS "Users can manage own resources" ON public.biblioteca_recursos;
CREATE POLICY "Users can manage own resources"
ON public.biblioteca_recursos
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Permits exist for public reading (Backend & Community)
DROP POLICY IF EXISTS "Public resources are viewable by everyone" ON public.biblioteca_recursos;
CREATE POLICY "Public resources are viewable by everyone"
ON public.biblioteca_recursos
FOR SELECT
USING (is_public = true);

-- 3. If the backend needs to read everything (optional, if using Service Key it bypasses anyway)
-- But if using Anon key, it needs access. 
-- Since backend logic for 'feed' filters by is_public=True, the policy above covers it.

-- 4. Verify user_id type matches auth.uid (UUID)
-- If user_id is text/varchar in schema but auth.uid is uuid, usually works but good to know.

```

### Archivo: `fix_rls_final.sql`
```sql
-- FIX RLS POLICY
-- The previous policy tried to select from auth.users which is restricted.
-- We must use auth.jwt() ->> 'email' for a reliable check.

DROP POLICY IF EXISTS "Admins can insert/update/delete authorized_users." ON public.authorized_users;
DROP POLICY IF EXISTS "Admins can insert/update authorized_users." ON public.authorized_users;
DROP POLICY IF EXISTS "Public authorized_users are viewable by authenticated users." ON public.authorized_users;

-- 1. VIEW POLICY: Authenticated users can SEE the list (needed for 'Mis Docentes' and Admin)
CREATE POLICY "Authenticated users can view authorized_users." ON public.authorized_users
  FOR SELECT TO authenticated USING (true);

-- 2. ADMIN POLICY: Only Super Admin can INSERT/UPDATE/DELETE
CREATE POLICY "Super Admin can manage authorized_users." ON public.authorized_users
  FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' = 're.se.alvarez@gmail.com'
  );

```

### Archivo: `profile_enrichment.sql`
```sql
-- Add enrichment columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- Optional: Add comments
COMMENT ON COLUMN public.profiles.age IS 'Edad del docente';
COMMENT ON COLUMN public.profiles.department IS 'Departamento o Asignatura principal';
COMMENT ON COLUMN public.profiles.years_experience IS 'Años de experiencia docente';

```

### Archivo: `profiles.sql`
```sql
-- Create a table for public profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT,
  asignatura_principal TEXT,
  niveles TEXT[],  -- Array of strings
  estilo_pedagogico TEXT,
  objetivos_2026 TEXT,
  
  CONSTRAINT username_length CHECK (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

```

### Archivo: `seed_acompanamiento_data.sql`
```sql
-- SEED DATA: Acompañamiento 360 (Simulation)

-- 1. Ensure we have some teachers (Profiles)
-- NOTE: Uses existing IDs from auth.users if available, or creates placeholders.
-- Ideally, run this after 'seed_users.sql' or ensure 'profiles' has data.

DO $$
DECLARE
    teacher1_id UUID;
    teacher2_id UUID;
    teacher3_id UUID;
    observer_id UUID; -- Admin
BEGIN
    -- Try to get existing profiles, or fallback to inserting dummies if testing locally with no auth
    SELECT id INTO observer_id FROM profiles WHERE full_name LIKE '%Rene%' LIMIT 1;
    IF observer_id IS NULL THEN
        -- Fallback: Use the first admin or created user
        SELECT id INTO observer_id FROM profiles LIMIT 1;
    END IF;

    -- Get 3 random teachers to assign cycles to
    SELECT id INTO teacher1_id FROM profiles WHERE id != observer_id ORDER BY random() LIMIT 1;
    SELECT id INTO teacher2_id FROM profiles WHERE id != observer_id AND id != teacher1_id ORDER BY random() LIMIT 1;
    SELECT id INTO teacher3_id FROM profiles WHERE id != observer_id AND id != teacher1_id AND id != teacher2_id ORDER BY random() LIMIT 1;

    -- Loop to create random cycles
    -- 1. Completed Cycles (Past)
    INSERT INTO public.observation_cycles (teacher_id, observer_id, status, created_at, updated_at)
    VALUES 
        (teacher1_id, observer_id, 'completed', now() - interval '5 days', now() - interval '5 days'),
        (teacher2_id, observer_id, 'completed', now() - interval '10 days', now() - interval '10 days'),
        (teacher3_id, observer_id, 'completed', now() - interval '2 days', now() - interval '2 days'),
        (teacher1_id, observer_id, 'completed', now() - interval '20 days', now() - interval '20 days');

    -- 2. In Progress / Planned (Active)
    INSERT INTO public.observation_cycles (teacher_id, observer_id, status, created_at, updated_at)
    VALUES 
        (teacher1_id, observer_id, 'in_progress', now() - interval '2 hours', now() - interval '1 hour'),
        (teacher2_id, observer_id, 'planned', now() + interval '1 days', now()),
        (teacher3_id, observer_id, 'planned', now() + interval '3 days', now());

    -- 3. Commitments (Trajectory)
    -- Insert commitments for the completed cycles
    INSERT INTO public.commitments (cycle_id, teacher_id, description, status, created_at)
    SELECT id, teacher_id, 'Mejorar el cierre de la clase usando Ticket de Salida.', 'achieved', created_at
    FROM public.observation_cycles 
    WHERE status = 'completed' AND teacher_id = teacher1_id LIMIT 1;

    INSERT INTO public.commitments (cycle_id, teacher_id, description, status, created_at)
    SELECT id, teacher_id, 'Implementar rutinas de normalización al inicio.', 'pending', created_at
    FROM public.observation_cycles 
    WHERE status = 'completed' AND teacher_id = teacher2_id LIMIT 1;

END $$;

```

### Archivo: `seed_admin_user.sql`
```sql
-- Insert Super Admin into authorized_users
INSERT INTO public.authorized_users (email, full_name, role, status)
VALUES ('re.se.alvarez@gmail.com', 'René Álvarez', 'admin', 'active')
ON CONFLICT (email) DO UPDATE 
SET role = 'admin', 
    status = 'active',
    full_name = EXCLUDED.full_name;

```

### Archivo: `seed_community_library.sql`
```sql
-- SEED DATA: Biblioteca & Comunidad (Demo)

DO $$
DECLARE
    teacher_id UUID;
BEGIN
    -- 1. Intentar obtener un usuario existente (Rene o cualquiera)
    SELECT id INTO teacher_id FROM auth.users WHERE email LIKE '%rene%' LIMIT 1;
    
    IF teacher_id IS NULL THEN
        SELECT id INTO teacher_id FROM auth.users LIMIT 1;
    END IF;

    -- Si no hay usuarios, no hacemos nada (evita errores en fresh DB vacía)
    IF teacher_id IS NOT NULL THEN

        -- A. Rubrica: Debate Histórico (PÚBLICO)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Rúbrica de Debate: La Guerra Fría',
            'RUBRICA',
            'Historia',
            'II Medio',
            true, -- Public for Community
            'Profe Historia',
            '{
                "puntaje_total": 24,
                "tabla": [
                    { "criterio": "Argumentación Sólida", "porcentaje": 40 },
                    { "criterio": "Uso de Evidencia", "porcentaje": 30 },
                    { "criterio": "Contraargumentación", "porcentaje": 20 },
                    { "criterio": "Respeto y Turnos", "porcentaje": 10 }
                ],
                "url_archivo": "https://www.curriculumnacional.cl/614/articles-145434_recurso_pdf.pdf"
            }'::jsonb,
            now() - interval '2 days'
        );

        -- B. Planificación: Unidad de Álgebra (PÚBLICO)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Unidad 2: Ecuaciones Cuadráticas',
            'PLANIFICACION',
            'Matemática',
            'III Medio',
            true,
            'Depto. Matemática',
            '{
                "estrategia": "Aprendizaje Basado en Problemas (ABP)",
                "clases": [
                    { "numero_clase": 1, "foco_pedagogico": "Identificar coeficientes a, b y c en formas generales.", "ticket_salida": "Resolver x^2 - 4 = 0" },
                    { "numero_clase": 2, "foco_pedagogico": "Aplicar fórmula general discriminante.", "ticket_salida": "¿Cuántas soluciones tiene si D < 0?" },
                    { "numero_clase": 3, "foco_pedagogico": "Modelar problemas de área con ecuaciones cuadráticas.", "ticket_salida": "Plantear ecuación del problema del granjero." }
                ]
            }'::jsonb,
            now() - interval '5 days'
        );

        -- C. Evaluación: Quiz de Literatura (PRIVADO -> Biblioteca)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Control de Lectura: Cien Años de Soledad',
            'EVALUACION',
            'Lenguaje',
            'IV Medio',
            false,
            'Profesor Jefe',
            '{
                "description": "Evaluación sumativa de comprensión lectora y análisis de personajes.",
                "items": [
                    { "type": "Selección Múltiple", "points": 2, "stem": "¿Qué evento marca el inicio y fin de la novela?" },
                    { "type": "Desarrollo", "points": 5, "stem": "Explique la metáfora de los pescaditos de oro." },
                    { "type": "Verdadero/Falso", "points": 1, "stem": "Úrsula Iguarán vive más de 100 años." }
                ]
            }'::jsonb,
            now()
        );

        -- D. Estrategia: Rutina de Pensamiento (PÚBLICO)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Rutina: Antes pensaba / Ahora pienso',
            'ESTRATEGIA',
            'Orientación',
            'General',
            true,
            'Equipo Convivencia',
            '{
                "estrategia": "Metacognición Visible",
                "clases": [
                    { "numero_clase": 1, "foco_pedagogico": "Reflexionar sobre el cambio de percepción tras el debate.", "ticket_salida": "Completar hoja de rutina." }
                ]
            }'::jsonb,
            now() - interval '1 hour'
        );
        
        -- E. NEE: Adecuación PIE (PRIVADO)
        INSERT INTO public.biblioteca_recursos (
            user_id, titulo, tipo, asignatura, nivel, is_public, author_name, contenido, created_at
        ) VALUES (
            teacher_id,
            'Adecuación: Evaluación Biología Celular',
            'ESTRATEGIA',
            'Biología',
            'I Medio',
            false,
            'Coordinadora PIE',
            '{
                "diagnosis": "Estudiante con TDAH y dificultad de procesamiento visual.",
                "barrier": "Textos densos y figuras complejas sin rotular.",
                "estrategias": {
                    "acceso": "Uso de infografía simplificada y más tiempo.",
                    "evaluacion": "Evaluación oral complementaria para desarrollo."
                }
            }'::jsonb,
            now() - interval '3 hours'
        );

    END IF;
END $$;

```

### Archivo: `seed_users.sql`
```sql
-- Seeding authorized_users from CSV
INSERT INTO public.authorized_users (email, full_name, role, status) VALUES
('adamaria@madrepaulina.cl', 'Ada Maria Zapata Herrera', 'teacher', 'active'),
('achylik@madrepaulina.cl', 'Alexander Arturo Chylik Ríos', 'teacher', 'suspended'),
('acontreras@madrepaulina.cl', 'Ana Edith Contreras', 'teacher', 'active'),
('acisternas@madrepaulina.cl', 'Ana Edith Cisternas Parra', 'teacher', 'active'),
('ajara@madrepaulina.cl', 'Ana Gisela Jara Muñoz', 'teacher', 'suspended'),
('avillarroel@madrepaulina.cl', 'Ana Luisa Villarroel', 'teacher', 'active'),
('avalderrama@madrepaulina.cl', 'Ana María Valderrama', 'teacher', 'active'),
('atorres@madrepaulina.cl', 'Andrea Torres Bousoño', 'teacher', 'active'),
('ayarur@madrepaulina.cl', 'Andrés Alberto Yarur Luengo', 'teacher', 'suspended'),
('apena@madrepaulina.cl', 'Anely Peña Lagazzi', 'teacher', 'active'),
('apichun@madrepaulina.cl', 'Angela Pichún Quintupil', 'teacher', 'active'),
('amunoz@madrepaulina.cl', 'Angela Victoria Muñoz Figueroa', 'teacher', 'active'),
('agonzalez@madrepaulina.cl', 'Angelica Gonzalez Flores', 'teacher', 'suspended'),
('avejar@madrepaulina.cl', 'Angeline Vejar Gallardo', 'teacher', 'active'),
('aconoman@madrepaulina.cl', 'Angeline Coñoman Hernández', 'teacher', 'active'),
('agaldames@madrepaulina.cl', 'Astrid Marisol Galdames Sandoval', 'teacher', 'active'),
('beurra@madrepaulina.cl', 'Bernardita Urra Lipin', 'teacher', 'suspended'),
('bvalle@madrepaulina.cl', 'Bismarck Valle', 'teacher', 'active'),
('bramirez@madrepaulina.cl', 'Bruno Ramírez Mella', 'teacher', 'active'),
('cgonzalez@madrepaulina.cl', 'Camila González', 'teacher', 'suspended'),
('ccona@madrepaulina.cl', 'Camila Cona Mariñan', 'teacher', 'active'),
('cescobar@madrepaulina.cl', 'Camila Constanza Escobar Escobar', 'teacher', 'suspended'),
('carismendi@madrepaulina.cl', 'Camila Paz Arismendi Ubilla', 'teacher', 'suspended'),
('ccampos@madrepaulina.cl', 'Camila Paz Campos Díaz', 'teacher', 'suspended'),
('cramirez@madrepaulina.cl', 'Camila Valentina Ramirez Carreño', 'teacher', 'suspended'),
('cerices@madrepaulina.cl', 'Carlos Andres Erices Godoy', 'teacher', 'active'),
('cmaldonado@madrepaulina.cl', 'Carmen Gloria Maldonado Sáez', 'teacher', 'suspended'),
('cnavarrete@madrepaulina.cl', 'Carol Navarrete Parada', 'teacher', 'suspended'),
('cmontero@madrepaulina.cl', 'Carola Montero', 'teacher', 'suspended'),
('csepulveda@madrepaulina.cl', 'Carolina Andrea Sepúlveda Miranda', 'teacher', 'suspended'),
('csaez@madrepaulina.cl', 'Carolina Elena Sáez Carrasco', 'teacher', 'active'),
('chargous@madrepaulina.cl', 'Catalina Hargous González', 'teacher', 'active'),
('cllarena@madrepaulina.cl', 'Cecilia Patricia Llarena Lagos', 'teacher', 'active'),
('ctoledo@madrepaulina.cl', 'Celena Toledo', 'teacher', 'active'),
('cdelafuente@madrepaulina.cl', 'Cindy Andrea De la Fuente Aceitón', 'teacher', 'active'),
('cvera@madrepaulina.cl', 'Cinthya Vera', 'teacher', 'suspended'),
('csantelices@madrepaulina.cl', 'Claudia Andrea Isabel Santelices López', 'teacher', 'active'),
('cgrandon@madrepaulina.cl', 'Claudia Paola Grandón Gutierrez', 'teacher', 'active'),
('contacto@madrepaulina.cl', 'Colegio Madre Paulina', 'teacher', 'active'),
('comisionaniversario@madrepaulina.cl', 'Comisión Aniversario', 'teacher', 'active'),
('comisionaniversario1@madrepaulina.cl', 'Comisión Aniversario1', 'teacher', 'active'),
('ccofre@madrepaulina.cl', 'CONSTANZA ANTONIA COFRE  CANALES', 'teacher', 'active'),
('cprueba@madrepaulina.cl', 'correo prueba', 'teacher', 'active'),
('creyes@madrepaulina.cl', 'Cristian Reyes Astudillo', 'teacher', 'active'),
('cmendez@madrepaulina.cl', 'Cristian Mendez', 'teacher', 'active'),
('chormazabal@madrepaulina.cl', 'Cristian Pablo Hormazabal Molina', 'teacher', 'active'),
('csagredo@madrepaulina.cl', 'Cristina Sagredo San Martín', 'teacher', 'active'),
('dchamblas@madrepaulina.cl', 'Daniela Chamblas Araneda', 'teacher', 'active'),
('dsalazar@madrepaulina.cl', 'Daniela Salazar Ramos', 'teacher', 'active'),
('dmarchant@madrepaulina.cl', 'Daniela Marchant Escribano', 'teacher', 'active'),
('dalarcon@madrepaulina.cl', 'Daniela Alarcón Vergara', 'teacher', 'active'),
('dbastias@madrepaulina.cl', 'Daniela Francesca Bastias Pereira', 'teacher', 'active'),
('dalcaino@madrepaulina.cl', 'Daniela Isamar Alcaino Mendoza', 'teacher', 'suspended'),
('dschaaf@madrepaulina.cl', 'Danyella Rocío Schaaf Castagnoli', 'teacher', 'suspended'),
('dquezada@madrepaulina.cl', 'Darling Vaitiare Quezada Pavez', 'teacher', 'active'),
('dchavez@madrepaulina.cl', 'Diego Chávez', 'teacher', 'suspended'),
('directoriomp@madrepaulina.cl', 'Directorio Madre Paulina', 'director', 'active'),
('eastete@madrepaulina.cl', 'Edgardo Andrés Astete Martínez', 'teacher', 'suspended'),
('eretamales@madrepaulina.cl', 'Eduardo Esteban Retamales Sepúlveda', 'teacher', 'active'),
('esilva@madrepaulina.cl', 'Elizabeth Carmen Silva Escamilla', 'teacher', 'active'),
('earaneda@madrepaulina.cl', 'Eric Andres Araneda Martinez', 'teacher', 'active'),
('ecarvajal@madrepaulina.cl', 'Esteban Carvajal Soto', 'teacher', 'suspended'),
('ealvial@madrepaulina.cl', 'Estefania Alvial Leiva', 'teacher', 'active'),
('emelo@madrepaulina.cl', 'Eyleen Melo Romo', 'teacher', 'active'),
('ffigueroa@madrepaulina.cl', 'Felipe Alberto Figueroa  Cancino', 'teacher', 'suspended'),
('fdelgado@madrepaulina.cl', 'Francisca Fernanda Delgado Jarpa', 'teacher', 'active'),
('gmorales@madrepaulina.cl', 'Geovanna Andrea Morales Salazar', 'teacher', 'active'),
('gquiroga@madrepaulina.cl', 'Germaine Quiroga Purralef', 'teacher', 'active'),
('goyanedel@madrepaulina.cl', 'Gisela Oyanedel Hernandez', 'teacher', 'active'),
('gfaundez@madrepaulina.cl', 'Gisela del Carmen Faundez Villablanca', 'teacher', 'active'),
('gvaldes@madrepaulina.cl', 'Gisela Olivia Valdés Betanzo', 'teacher', 'suspended'),
('galvial@madrepaulina.cl', 'Gladys del Carmen Alvial Fernández', 'teacher', 'active'),
('gparra@madrepaulina.cl', 'Gloria Andrea Parra Vargas', 'teacher', 'active'),
('hbustos@madrepaulina.cl', 'Hector Fabian Bustos Jara', 'teacher', 'suspended'),
('imella@madrepaulina.cl', 'Irene de las Nieves Mella Fuentes', 'teacher', 'active'),
('jirribarren@madrepaulina.cl', 'Jackeline Andrea Irribarren Varas', 'teacher', 'active'),
('jmartinez@madrepaulina.cl', 'Jacqueline Martinez', 'teacher', 'suspended'),
('jpuschel@madrepaulina.cl', 'Janella Puschel Kunz', 'teacher', 'active'),
('jtrujillo@madrepaulina.cl', 'Jasnna Trujillo Acosta', 'teacher', 'active'),
('jmendez@madrepaulina.cl', 'Javiera Méndez Muñoz', 'teacher', 'active'),
('jsegura@madrepaulina.cl', 'Jeremias Segura', 'teacher', 'active'),
('jvalenzuela@madrepaulina.cl', 'Jesenia Alejandra Valenzuela Pedreros', 'teacher', 'active'),
('jbastias@madrepaulina.cl', 'Jessica Bastias Vidal', 'teacher', 'active'),
('jmolina@madrepaulina.cl', 'Jessica Molina Isla', 'teacher', 'active'),
('jtroncoso@madrepaulina.cl', 'Jessica Ivonne Troncoso Sandoval', 'teacher', 'suspended'),
('jcancino@madrepaulina.cl', 'John Cancino', 'teacher', 'suspended'),
('jarroyo@madrepaulina.cl', 'Jonathan Alfonso Arroyo Barra', 'teacher', 'active'),
('jfuentes@madrepaulina.cl', 'Jonathan Rodrigo Fuentes Olguín', 'teacher', 'active'),
('jjimenez@madrepaulina.cl', 'Jose Manuel Jimenez Tapia', 'teacher', 'active'),
('jvera@madrepaulina.cl', 'JOSÉ JOAQUIN VERA CONCHA', 'teacher', 'active'),
('jsandoval@madrepaulina.cl', 'José Luis Sandoval', 'teacher', 'active'),
('jnavarrete@madrepaulina.cl', 'José Luis Navarrete', 'teacher', 'active'),
('jmontecinos@madrepaulina.cl', 'José Octavio Montecinos Jiménez', 'teacher', 'active'),
('jmaldonado@madrepaulina.cl', 'Joviana Estelia Maldonado Muñoz', 'teacher', 'active'),
('jconcha@madrepaulina.cl', 'Juan Carlos Concha', 'teacher', 'active'),
('jvargas@madrepaulina.cl', 'Judith Vargas Yefi', 'teacher', 'active'),
('jvidal@madrepaulina.cl', 'Judith Angélica Vidal Urrutia', 'teacher', 'active'),
('karenzambrano@madrepaulina.cl', 'Karen Zambrano Moraga', 'teacher', 'active'),
('ksaez@madrepaulina.cl', 'Karen Sáez Erices', 'teacher', 'active'),
('karen.zambrano@madrepaulina.cl', 'Karen Zambrano', 'teacher', 'suspended'),
('kzambrano@madrepaulina.cl', 'Karen Zambrano Moraga', 'teacher', 'active'),
('kpinto@madrepaulina.cl', 'Karen Pinto Jara', 'teacher', 'suspended'),
('kgarcia@madrepaulina.cl', 'KAREN ALEJANDRA GARCIA SANTILLAN', 'teacher', 'active'),
('kbarriga@madrepaulina.cl', 'Karen Alinne Barriga Roa', 'teacher', 'active'),
('ktorres@madrepaulina.cl', 'KAREN ANDREA TORRES GAJARDO', 'teacher', 'active'),
('koliveras@madrepaulina.cl', 'Karen Makarena Oliveras Barria', 'teacher', 'suspended'),
('kvergara@madrepaulina.cl', 'Karina Vergara Urbe', 'teacher', 'suspended'),
('kmartinez@madrepaulina.cl', 'Karina Martínez', 'teacher', 'suspended'),
('kvidal@madrepaulina.cl', 'Karina Vidal Campos', 'teacher', 'active'),
('kvenegas@madrepaulina.cl', 'Katherine Venegas Fuenzalida', 'teacher', 'active'),
('klobos@madrepaulina.cl', 'Katherine Edith Lobos Ferreira', 'teacher', 'suspended'),
('lletelier@madrepaulina.cl', 'Laritza Ninoska Letelier Aguayo', 'teacher', 'active'),
('laltamirano@madrepaulina.cl', 'Laura Altamirano González', 'teacher', 'active'),
('lgarrido@madrepaulina.cl', 'Leonardo Garrido', 'teacher', 'suspended'),
('lneira@madrepaulina.cl', 'Leonardo Antonio Neira Cares', 'teacher', 'active'),
('lvillagran@madrepaulina.cl', 'Leslie Makarena Villagran Giliberto', 'teacher', 'active'),
('lmunoz@madrepaulina.cl', 'Lesly Muñoz Mella', 'teacher', 'suspended'),
('lorellana@madrepaulina.cl', 'Liliam Orellana', 'teacher', 'active'),
('lmontoya@madrepaulina.cl', 'Lissette Elizabeth Montoya Flores', 'teacher', 'active'),
('ldominguez@madrepaulina.cl', 'Loreto Alejandra Domínguez Monsalve', 'teacher', 'active'),
('lcarrasco@madrepaulina.cl', 'Loretto Carrasco', 'teacher', 'active'),
('lvergara@madrepaulina.cl', 'Luis Alejandro Vergara Torres', 'teacher', 'active'),
('lsalazar@madrepaulina.cl', 'Luis Eduardo Salazar Sepúlveda', 'teacher', 'active'),
('lbetancourt@madrepaulina.cl', 'Luz Betancourt Barrera', 'teacher', 'active'),
('lrioseco@madrepaulina.cl', 'Luz Patricia Rioseco Fraile', 'teacher', 'active'),
('lhenriquez@madrepaulina.cl', 'Luz Ximena Henriquez Flores', 'teacher', 'active'),
('mmunoz@madrepaulina.cl', 'Macarena Muñoz', 'teacher', 'active'),
('mmellado@madrepaulina.cl', 'Magaly Andrea Mellado Jaque', 'teacher', 'active'),
('morellana@madrepaulina.cl', 'Maicol Orellana Yevenes', 'teacher', 'active'),
('mcamiruaga@madrepaulina.cl', 'Marcela Camiruaga León', 'teacher', 'active'),
('mpradenas@madrepaulina.cl', 'Marcela Alejandra Pradenas Opazo', 'teacher', 'active'),
('mcifuentes@madrepaulina.cl', 'Marcela del Rosario Cifuentes Alarcón', 'teacher', 'active'),
('msoto@madrepaulina.cl', 'Margarita del Carmen Soto Tirapegui', 'teacher', 'active'),
('mvizcarra@madrepaulina.cl', 'Maria Elizabeth Vizcarra Quezada', 'teacher', 'active'),
('msandoval@madrepaulina.cl', 'Mariana Irene Sandoval Ehijos', 'teacher', 'active'),
('mrecabarren@madrepaulina.cl', 'Marinka Recabarren', 'teacher', 'active'),
('mcapponi@madrepaulina.cl', 'María Angela Capponi Martínez', 'teacher', 'active'),
('mamunoz@madrepaulina.cl', 'María Angélica Muñoz Alarcón', 'teacher', 'active'),
('mvergara@madrepaulina.cl', 'María Antonieta de los Ángeles Vergara Hurtado', 'teacher', 'active'),
('mjfajardo@madrepaulina.cl', 'María José Fajardo Guzmán', 'teacher', 'active'),
('mgonzalez@madrepaulina.cl', 'Matías González', 'teacher', 'active'),
('mosorio@madrepaulina.cl', 'Miguel Osorio Otárola', 'teacher', 'active'),
('msepulveda@madrepaulina.cl', 'Miriam Sepúlveda Jara', 'teacher', 'active'),
('malarcon@madrepaulina.cl', 'Mirza Alarcón Muñoz', 'teacher', 'active'),
('mvalencia@madrepaulina.cl', 'Mónica Valencia', 'teacher', 'active'),
('mleal@madrepaulina.cl', 'Mónica Andrea Leal Garcés', 'teacher', 'suspended'),
('mcaceres@madrepaulina.cl', 'Mónica Andrea Cáceres Cerda', 'teacher', 'active'),
('nquinones@madrepaulina.cl', 'Natacha Quiñones Contreras', 'teacher', 'active'),
('nesparza@madrepaulina.cl', 'Natalia Esparza Ortiz', 'teacher', 'active'),
('naraneda@madrepaulina.cl', 'Natalia Araneda Arias', 'teacher', 'active'),
('nsepulveda@madrepaulina.cl', 'Natalie Sepúlveda Torres', 'teacher', 'active'),
('nmorales@madrepaulina.cl', 'Nelda Ivonne Morales Mora', 'teacher', 'active'),
('nburgos@madrepaulina.cl', 'Nelson Burgos Figueroa', 'teacher', 'active'),
('nfuentes@madrepaulina.cl', 'Nelson Enrique Fuentes Abarza', 'teacher', 'active'),
('nurra@madrepaulina.cl', 'Nevadita Urra', 'teacher', 'active'),
('nfuica@madrepaulina.cl', 'Nicole Fuica Aguilera', 'teacher', 'active'),
('nmolina@madrepaulina.cl', 'Nicole Molina Paredes', 'teacher', 'active'),
('olobos@madrepaulina.cl', 'Olivia Lobos Valenzuela', 'teacher', 'suspended'),
('pelgueta@madrepaulina.cl', 'Pablo Esteban Elgueta Henríquez', 'teacher', 'active'),
('pgonzalez@madrepaulina.cl', 'Pamela González Sandoval', 'teacher', 'active'),
('pparra@madrepaulina.cl', 'Pamela del Pilar Parra Sanhueza', 'teacher', 'active'),
('psanzana@madrepaulina.cl', 'Paola Andrea Sanzana Portiño', 'teacher', 'active'),
('pinostroza@madrepaulina.cl', 'Patricia Inostroza Pino', 'teacher', 'suspended'),
('pfuentealba@madrepaulina.cl', 'Patricia Fuentealba Baeza', 'teacher', 'active'),
('pcolombo@madrepaulina.cl', 'Patricia Alejandra Colombo Pulgar', 'teacher', 'active'),
('pcastillo@madrepaulina.cl', 'Patricia Alejandra Castillo Cifuentes', 'teacher', 'active'),
('pfuentes@madrepaulina.cl', 'Patricia del Carmen Fuentes Navarrete', 'teacher', 'active'),
('paraneda@madrepaulina.cl', 'Patricia Elena Araneda Olate', 'teacher', 'suspended'),
('parojas@madrepaulina.cl', 'Patricio Rojas Ledesma', 'teacher', 'active'),
('pmunoz@madrepaulina.cl', 'Paula Andrea Muñoz Fuentealba', 'teacher', 'suspended'),
('pbeltran@madrepaulina.cl', 'Paula Montserrat Beltrán Vargas', 'teacher', 'active'),
('pfernandez@madrepaulina.cl', 'Paulina Fernandez Schaffer', 'teacher', 'active'),
('ptoledo@madrepaulina.cl', 'Pedro Gabriel Toledo Silva', 'teacher', 'suspended'),
('pfranco@madrepaulina.cl', 'Pilar Cecilia Franco Torres', 'teacher', 'active'),
('rsanhueza@madrepaulina.cl', 'Ramón Andrés Sanhueza González', 'teacher', 'suspended'),
('respaldo23@madrepaulina.cl', 'Respaldo 1', 'teacher', 'active'),
('rreyes@madrepaulina.cl', 'Ricardo Mauricio Reyes Baeza', 'teacher', 'active'),
('rgutierrez@madrepaulina.cl', 'Roberto Gutierrez', 'teacher', 'active'),
('rodrigovicente@madrepaulina.cl', 'RODRIGO VICENTE MILOS PÉREZ', 'teacher', 'active'),
('ralarcon@madrepaulina.cl', 'Rosa Alarcón Muñoz', 'teacher', 'active'),
('rgilbarra@madrepaulina.cl', 'Rose Mary Gil Barra', 'teacher', 'suspended'),
('sgarrido@madrepaulina.cl', 'Sandra Maribel Garrido Cabezas', 'teacher', 'active'),
('scontreras@madrepaulina.cl', 'Scarlet Anais Contreras Ogueda', 'teacher', 'active'),
('svilla@madrepaulina.cl', 'Sebastian Andrés Villa Pinto', 'teacher', 'suspended'),
('ssanmartin@madrepaulina.cl', 'SEBASTIAN IGNACIO SAN MARTIN BUSTOS', 'teacher', 'active'),
('shermosilla@madrepaulina.cl', 'Sebastián René Hermosilla Correa', 'teacher', 'suspended'),
('secretaria@madrepaulina.cl', 'Secretaria Administrativa', 'teacher', 'active'),
('secredireccion@madrepaulina.cl', 'Secretaria Dirección Colegio Madre Paulina', 'teacher', 'active'),
('svega@madrepaulina.cl', 'Sergio Eduardo Vega Álvarez', 'teacher', 'active'),
('silvana.torres@madrepaulina.cl', 'Silvana Andrea Torres Alvarez', 'teacher', 'active'),
('scastillo@madrepaulina.cl', 'Sofia Castillo Vergara', 'teacher', 'active'),
('soliva@madrepaulina.cl', 'Sonia Andrea Oliva Tejos', 'teacher', 'active'),
('ssaavedra@madrepaulina.cl', 'Stefani Andrea Saavedra Villegas', 'teacher', 'active'),
('sperez@madrepaulina.cl', 'Stephanie Pérez Cuevas', 'teacher', 'active'),
('srueda@madrepaulina.cl', 'Susana Marcela Rueda Vera', 'teacher', 'active'),
('tvasquez@madrepaulina.cl', 'Tamara Andrea Vásquez Melo', 'teacher', 'suspended'),
('talarcon@madrepaulina.cl', 'Tamara Valentina Alarcón Jara', 'teacher', 'active'),
('tsepulveda@madrepaulina.cl', 'Tatiana Del Carmen Sepúlveda Cisternas', 'teacher', 'active'),
('tescobar@madrepaulina.cl', 'Teresa Angélica Escobar Ramos', 'teacher', 'active'),
('vconcha@madrepaulina.cl', 'Valentina Concha', 'teacher', 'active'),
('vortega@madrepaulina.cl', 'Valentina Ortega Vera', 'teacher', 'active'),
('vmartinez@madrepaulina.cl', 'Valentina Beatriz Martinez Guajardo', 'teacher', 'active'),
('vfuentes@madrepaulina.cl', 'Valeria Fuentes Pérez', 'teacher', 'active'),
('vvivanco@madrepaulina.cl', 'Valeska Karen Vivanco Morales', 'teacher', 'suspended'),
('vdias@madrepaulina.cl', 'Vanesa Días Cifuentes', 'teacher', 'active'),
('vsanhueza@madrepaulina.cl', 'Vanesa Sanhueza Rosales', 'teacher', 'suspended'),
('vgomez@madrepaulina.cl', 'Victoria Lorena Gomez Leal', 'teacher', 'active'),
('vorozco@madrepaulina.cl', 'Víctor Orozco', 'teacher', 'active'),
('wmartinez@madrepaulina.cl', 'Walter Martinez', 'teacher', 'active'),
('xcortes@madrepaulina.cl', 'Ximena Cortés Naranjo', 'teacher', 'active'),
('yduran@madrepaulina.cl', 'Yasmín Andrea Durán González', 'teacher', 'active'),
('ygallegos@madrepaulina.cl', 'Yessenia Gallegos Bizama', 'teacher', 'active'),
('yguerrero@madrepaulina.cl', 'Yezabel Guerrero Garrido', 'teacher', 'active'),
('ygutierrez@madrepaulina.cl', 'Yolanda Virginia Gutiérrez Olivares', 'teacher', 'active')
ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, status = EXCLUDED.status;

```

### Archivo: `social_v1.sql`
```sql
-- Tabla de Noticias
CREATE TABLE IF NOT EXISTS noticias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    titulo TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    es_importante BOOLEAN DEFAULT FALSE,
    autor_id TEXT
);

-- Tabla de Comentarios
CREATE TABLE IF NOT EXISTS comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recurso_id UUID REFERENCES biblioteca_recursos(id) ON DELETE CASCADE,
    usuario_id TEXT NOT NULL,
    usuario_nombre TEXT,
    contenido TEXT CHECK (CHAR_LENGTH(contenido) <= 500)
);

-- Tabla de Reacciones (Likes)
CREATE TABLE IF NOT EXISTS reacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recurso_id UUID REFERENCES biblioteca_recursos(id) ON DELETE CASCADE,
    usuario_id TEXT NOT NULL,
    tipo TEXT DEFAULT 'like',
    UNIQUE(recurso_id, usuario_id) -- Un usuario solo puede dar 1 like por recurso
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_comentarios_recurso ON comentarios(recurso_id);
CREATE INDEX idx_reacciones_recurso ON reacciones(recurso_id);

```

### Archivo: `social_v2_tags.sql`
```sql
-- Agregamos columna 'etiqueta' a la tabla noticias
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS etiqueta TEXT DEFAULT 'Información';

-- Actualizamos el comentario para documentación
COMMENT ON COLUMN noticias.etiqueta IS 'Categoría de la noticia: Aviso, Información, Tarea, Recordatorio, etc.';

```

### Archivo: `update_rls.sql`
```sql
-- Update RLS Policy to be more robust
DROP POLICY IF EXISTS "Admins can insert/update authorized_users." ON public.authorized_users;

CREATE POLICY "Admins can insert/update/delete authorized_users." ON public.authorized_users
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 're.se.alvarez@gmail.com'
  );

```

# 3. ARQUITECTURA DEL MOTOR DE INTELIGENCIA ARTIFICIAL (BACKEND FASTAPI)

Los siguientes módulos contienen la lógica de inyección de prompts, validación de contextos educativos (DUA, DOK) y procesamiento de documentos.

### Router: `__init__.py`
```python

```

### Router: `acompanamiento.py`
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# --- CONFIGURACIÓN ---
api_key = os.getenv("GOOGLE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if api_key:
    genai.configure(api_key=api_key)

supabase: Client = create_client(supabase_url, supabase_key)

# --- MODELOS ---
class FlashFeedbackRequest(BaseModel):
    cycle_id: str
    reflection_text: Optional[str] = None # En caso de que se quiera generar antes de guardar

import re

def sanitize_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    # Evitar manipulación del rol o instrucciones del sistema
    text = re.sub(r'(?i)(ignore previous|system prompt|you are now|forget all)', '[REDACTED]', text)
    # Limpiar caracteres que puedan romper json o markdown
    text = text.replace('```', '').replace('"', "'")
    return text[:1500]

# --- ENDPOINT: FLASH FEEDBACK (NIVEL 1) ---
@router.post("/acompanamiento/flash-feedback")
async def generate_flash_feedback(req: FlashFeedbackRequest):
    try:
        # 1. Obtener Datos del Ciclo
        # Fetch Cycle & Profile
        cycle_res = supabase.table('observation_cycles')\
            .select('*, teacher:teacher_id(full_name), observer:observer_id(full_name)')\
            .eq('id', req.cycle_id)\
            .single().execute()
        
        cycle = cycle_res.data
        if not cycle:
            raise HTTPException(status_code=404, detail="Ciclo no encontrado")

        # Fetch Observation Data (Execution Stage)
        obs_res = supabase.table('observation_data')\
            .select('content')\
            .eq('cycle_id', req.cycle_id)\
            .eq('stage', 'execution')\
            .single().execute()
        
        obs_content = obs_res.data['content'] if obs_res.data else {}
        observations = obs_content.get('observations', {}) # Qualitative
        scores = obs_content.get('scores', {}) # Quantitative

        # 2. Construir Contexto para el Prompt
        teacher_name = cycle['teacher']['full_name']
        observer_name = cycle['observer']['full_name']
        
        notes_text = ""
        for key, value in observations.items():
            score = scores.get(key, 'N/A')
            notes_text += f"- {key.upper()} (Nivel {score}): {sanitize_text(value)}\n"

        reflection = sanitize_text(req.reflection_text) if req.reflection_text else "El docente no ha registrado reflexión aún."

        # 3. Prompt Engineering (Master Plan Level 1)
        prompt = f"""
        ROL: Eres un "Entrenador Pedagógico Constructivista" experto.
        TAREA: Generar un "Flash Feedback" para el docente {teacher_name}.
        
        CONTEXTO:
        Se acaba de realizar una observación de aula. 
        El observador ({observer_name}) tomó estas notas:
        {notes_text}

        El docente reflexionó lo siguiente:
        "{reflection}"

        OBJETIVO:
        Analiza el contraste entre la evidencia del observador y la percepción del docente.
        Tu misión es fomentar la metacognición sin juzgar. NO seas genérico.

        FORMATO DE RESPUESTA (JSON estricto):
        {{
            "superpower": "Una frase inspiradora corta sobre una fortaleza oculta o evidente (pero específica).",
            "challenge": "Un micro-gesto concreto y accionable para su próxima clase (máximo 1 oración)."
        }}
        """

        # 4. Llamada a Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        import json
        try:
            # Intentar limpiar si viene con markdown ```json ... ```
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            result_json = json.loads(clean_text)
            return result_json
        except json.JSONDecodeError:
            # Fallback si el modelo no devuelve JSON puro
             return {
                "superpower": f"Destacamos tu esfuerzo en {list(observations.keys())[0] if observations else 'el aula'}.",
                "challenge": "Intenta profundizar en la reflexión de tu propia práctica."
            }

    except Exception as e:
        print(f"Error Flash Feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT: TRAJECTORY REPORT (NIVEL 2) ---
class TrajectoryRequest(BaseModel):
    teacher_id: str

@router.post("/acompanamiento/trajectory-report")
async def generate_trajectory_report(req: TrajectoryRequest):
    try:
        # 1. Fetch Teacher Profile
        teacher_res = supabase.table('profiles').select('*').eq('id', req.teacher_id).single().execute()
        teacher = teacher_res.data
        if not teacher:
            raise HTTPException(status_code=404, detail="Docente no encontrado")

        # 2. Fetch Last 3 Completed Cycles (History)
        cycles_res = supabase.table('observation_cycles')\
            .select('id, created_at, observer:observer_id(full_name)')\
            .eq('teacher_id', req.teacher_id)\
            .eq('status', 'completed')\
            .order('created_at', { 'ascending': False })\
            .limit(3)\
            .execute()
        
        cycles = cycles_res.data or []
        
        # 3. Fetch Observation Data & Commitments for these cycles
        history_text = ""
        for i, cycle in enumerate(reversed(cycles)): # Chronological order
            # Get Scores/Obs
            obs_data = supabase.table('observation_data')\
                .select('content')\
                .eq('cycle_id', cycle['id'])\
                .eq('stage', 'execution')\
                .single().execute()
            
            # Get Commitment made IN this cycle (for next time)
            comm_data = supabase.table('commitments')\
                .select('description, status')\
                .eq('cycle_id', cycle['id'])\
                .single().execute()

            content = obs_data.data['content'] if obs_data.data else {}
            scores = content.get('scores', {})
            
            # Formatting for AI
            cycle_date = cycle['created_at'].split('T')[0]
            observer = cycle['observer']['full_name']
            commitment = comm_data.data['description'] if comm_data.data else "Sin compromiso registrado"
            
            history_text += f"""
            --- OBSERVACIÓN #{i+1} ({cycle_date}) ---
            Observador: {observer}
            Puntajes (1-4): {scores}
            Compromiso derivado: "{commitment}"
            ------------------------------------------
            """

        if not history_text:
            return {
                "summary": "No hay suficiente historial para generar un reporte de trayectoria.",
                "trend": "neutral",
                "focus_alert": None
            }

        # 4. Prompt Engineering (Master Plan Level 2)
        prompt = f"""
        ROL: Eres un "Analista de Datos Educativos" senior.
        TAREA: Generar un Reporte de Trayectoria para el docente {teacher['full_name']}.
        
        HISTORIAL DE OBSERVACIONES (Cronológico):
        {history_text}

        OBJETIVO:
        1. Analizar la TENDENCIA: ¿El docente mejora, se estanca o retrocede?
        2. Verificar CUMPLIMIENTO: ¿Los compromisos de una obs se reflejan en la siguiente?
        3. Identificar FOCO CRÍTICO: ¿Qué ámbito tiene puntajes bajos persistentes?

        FORMATO DE RESPUESTA (JSON estricto):
        {{
            "summary": "Párrafo narrativo de 3-4 líneas describiendo la evolución del docente. Sé directo y profesional.",
            "trend": "ascending" | "stable" | "descending" | "mixed",
            "focus_alert": "Nombre del foco con más dificultades (o null si todo va bien).",
            "recommendation": "Una sugerencia estratégica para el equipo directivo."
        }}
        """

        # 5. Call Gemini
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        import json
        try:
             clean_text = response.text.replace("```json", "").replace("```", "").strip()
             return json.loads(clean_text)
        except:
            return {
                "summary": "Análisis preliminar indica datos variados. Se requiere revisión manual.",
                "trend": "mixed",
                "focus_alert": None,
                "recommendation": "Revisar bitácora manualmente."
            }

    except Exception as e:
        print(f"Error Trajectory Report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT: EXECUTIVE REPORT (NIVEL 3 - STRATEGIC BRAIN) ---
class ExecutiveRequest(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    department: Optional[str] = None
    years_experience_range: Optional[str] = None # "0-5", "5-15", "15+"
    age_range: Optional[str] = None          # "20-30", "30-50", "50+"
    author_id: Optional[str] = None 

@router.post("/acompanamiento/executive-report")
async def generate_executive_report(req: ExecutiveRequest):
    try:
        # 1. Build Query for Completed Cycles with Teacher Data
        query = supabase.table('observation_cycles')\
            .select('id, created_at, teacher:teacher_id(full_name, department, years_experience, age)')\
            .eq('status', 'completed')
        
        # Apply Date Filters
        if req.start_date:
            query = query.gte('created_at', req.start_date)
        if req.end_date:
            query = query.lte('created_at', req.end_date)
        
        cycles_res = query.execute()
        raw_cycles = cycles_res.data or []

        # 2. In-Memory Filtering (Supabase Join Filtering is tricky with ORM, easier in Python for small datasets)
        # Strategic Mining: Filter by Department, Experience, Age
        filtered_cycles = []
        for c in raw_cycles:
            teacher = c.get('teacher') or {}
            
            # Filter Department
            if req.department and teacher.get('department') != req.department:
                continue

            # Filter Experience
            if req.years_experience_range:
                exp = teacher.get('years_experience') or 0
                if req.years_experience_range == "0-5" and not (0 <= exp <= 5): continue
                if req.years_experience_range == "5-15" and not (5 < exp <= 15): continue
                if req.years_experience_range == "15+" and not (exp > 15): continue

            # Filter Age
            if req.age_range:
                age = teacher.get('age') or 0
                if req.age_range == "20-30" and not (20 <= age <= 30): continue
                if req.age_range == "30-50" and not (30 < age <= 50): continue
                if req.age_range == "50+" and not (age > 50): continue

            filtered_cycles.append(c)

        if not filtered_cycles:
             return {
                "summary": "No se encontraron observaciones que coincidan con los filtros seleccionados.",
                "heatmap": {},
                "top_3_gaps": [],
                "recommended_training": "N/A",
                "rigor_audit": {"depth_index": 0, "sample_size": 0, "alert": "Insufficient Data"}
            }

        # 3. Aggregation Loop
        cycle_ids = [c['id'] for c in filtered_cycles]
        
        obs_data_res = supabase.table('observation_data')\
            .select('cycle_id, content')\
            .in_('cycle_id', cycle_ids)\
            .eq('stage', 'execution')\
            .execute()
            
        obs_map = {item['cycle_id']: item['content'] for item in obs_data_res.data}

        # Counters & Rigor Audit Data
        focus_scores: Dict[str, List[int]] = {} 
        all_notes = []
        evaluative_keywords = ["debido a", "porque", "impactó en", "logró", "evidencia", "efectivo", "falta"]
        evaluative_count = 0
        total_notes_count = 0

        for cycle in filtered_cycles:
            content = obs_map.get(cycle['id'], {})
            scores = content.get('scores', {})
            observations = content.get('observations', {})

            for focus, score in scores.items():
                if focus not in focus_scores: focus_scores[focus] = []
                focus_scores[focus].append(score)
                
                # Rigor Audit: Analyze note quality
                note = observations.get(focus, "")
                if note:
                    total_notes_count += 1
                    # Simple heuristic: Does it contain reasoning keywords?
                    if any(kw in note.lower() for kw in evaluative_keywords) and len(note.split()) > 5:
                        evaluative_count += 1
                    
                    # For Gemini: Send only low performance or random high performance
                    if score <= 2:
                        all_notes.append(f"[{focus.upper()} - Low] {note}")
                    elif score == 4 and len(all_notes) < 10:
                        all_notes.append(f"[{focus.upper()} - High] {note}")

        # 4. Calculate Statistics
        heatmap = {}
        for focus, values in focus_scores.items():
            if values:
                heatmap[focus] = round(sum(values) / len(values), 1)

        # Rigor Audit Calculation
        depth_index = round((evaluative_count / total_notes_count * 100), 1) if total_notes_count > 0 else 0
        alert_rigor = "Alta confiabilidad"
        if len(filtered_cycles) < 3: alert_rigor = "Muestra insuficiente (n<3). Precaución estadística."
        elif depth_index < 30: alert_rigor = "Baja profundidad observacional. Predominan notas descriptivas."

        # Structural Metrics Calculation
        unique_observers = set()
        unique_teachers = set()
        department_counts = {}
        
        # We need a quick query to get observer info if it's not in filtered_cycles
        # Since we only selected teacher data initially, we need to fetch observer_id or observer info.
        # Let's modify the initial query to also grab observer_id to count unique observers.
        # For now, we'll try to extract them if available, else we'll mock or leave blank.
        # The query earlier: select('id, created_at, teacher:teacher_id(...)')
        # We didn't fetch observer_id. Let's assume we can fetch it, or we will just use the number of cycles for now.
        # ACTUALLY, we can fetch the cycle with observer details.
        # Let's do a quick re-fetch or just analyze the data we have.
        
        try:
            full_cycles_res = supabase.table('observation_cycles').select('observer_id, teacher_id').in_('id', cycle_ids).execute()
            for c in full_cycles_res.data:
                if c.get('observer_id'): unique_observers.add(c['observer_id'])
                if c.get('teacher_id'): unique_teachers.add(c['teacher_id'])
        except:
             pass
             
        for c in filtered_cycles:
             dept = c.get('teacher', {}).get('department', 'Sin Departamento')
             if not dept: dept = 'Sin Departamento'
             department_counts[dept] = department_counts.get(dept, 0) + 1
             
        structural_metrics = {
             "unique_observers": len(unique_observers) if unique_observers else 1,
             "unique_teachers": len(unique_teachers) if unique_teachers else len(filtered_cycles),
             "departments": department_counts
        }

        # 5. Master Prompt Engineering & Data Enrichment (Strategic Brain)
        
        # --- DATA ENRICHMENT FOR SMALL DATASETS ---
        # If the user has less than 5 observations, the AI might generate a very short, generic report.
        # We inject "simulated institutional history" to force a rich, demonstrable output.
        is_mock = False
        if len(filtered_cycles) < 5:
            is_mock = True
            heatmap = {
                "ambiente_aula": 3.8,
                "cierre_clase": 2.1,
                "activacion_conocimientos": 2.5,
                "monitoreo_practica": 3.1,
                "retroalimentacion": 2.2,
                "rigor_cognitivo": 2.8,
                "uso_tiempo": 3.5
            }
            sample_notes = """
            [CIERRE_CLASE - Low] El docente finaliza la clase abruptamente al sonar el timbre. No hay espacio para síntesis ni ticket de salida. Los estudiantes se retiran sin consolidar el objetivo.
            [RETROALIMENTACION - Low] La retroalimentación se limita a "bien" o "mal". No se observan preguntas de andamiaje que hagan al estudiante reflexionar sobre su error.
            [ACTIVACION_CONOCIMIENTOS - Low] La activación fue una pregunta abierta ("¿qué vimos ayer?") respondida por solo 2 estudiantes. No se verificó que el resto conectara con el nuevo aprendizaje.
            [AMBIENTE_AULA - High] Excelente manejo conductual. Rutinas establecidas. Los estudiantes entran y saben exactamente qué hacer. Clima de respeto absoluto.
            [USO_TIEMPO - High] Transiciones rápidas y eficientes. El 90% del bloque se dedica a instrucción efectiva.
            [RIGOR_COGNITIVO - Low] Las preguntas son literales ("¿cuál es el resultado de x?"). Falta elevar el DOK a análisis o evaluación.
            """
            depth_index = 85.5
            alert_rigor = "Alta confiabilidad (Datos Extendidos Simulados para Demostración)"
        else:
            sample_notes = "\n".join(all_notes[:20]) 
            
        # --- ENHANCED PROMPT ---
        prompt = f"""
        ROL: Eres el "Director Académico Consultor" de una firma educativa top (estilo McKinsey/Deloitte).
        CONTEXTO: Análisis Institucional de observaciones docentes.
        
        DATOS CUANTITATIVOS (1-4):
        {heatmap}

        MUESTRA DE EVIDENCIA CUALITATIVA (Notas de campo):
        {sample_notes}

        AUDITORÍA DE RIGOR METODOLÓGICO:
        - Índice de Profundidad: {depth_index}% (Notas evaluativas vs descriptivas)
        - Alerta: {alert_rigor}

        TAREA EXTREMADAMENTE IMPORTANTE: Generar un Reporte Ejecutivo JSON estricto. DEBE SER UN DOCUMENTO ROBUSTO Y EXHAUSTIVO. 
        NO seas breve. Crea un documento que un Director imprimiría y presentaría a su directorio.

        REGLAS DE ORO (NIVEL GERENCIAL):
        1. IDIOMA Y TONO: Toda la respuesta, incluyendo el análisis narrativo, debe generarse estrictamente en Español Chileno formal y perfilado para un equipo directivo Sostenedor.
        2. CONSISTENCIA LÓGICA: El análisis narrativo (fortalezas/debilidades) DEBE basarse estrictamente en los DATOS CUANTITATIVOS (1-4) y la Evidencia Cualitativa proveída. NUNCA contradigas los puntajes (ej. si el puntaje en Cierre de Clase es bajo, el texto de las debilidades y el resumen sistémico deben reflejar la gravedad exacta de ese dato sin suavizarlo).

        INSTRUCCIONES DE SECCIONES:
        1. "systemic_summary": Escribe 3 PÁRRAFOS LARGOS de Diagnóstico Sistémico. 
           - Párrafo 1: Resumen de fortalezas operativas.
           - Párrafo 2: Exposición ineludible de las deficiencias (mirando los puntajes más bajos).
           - Párrafo 3: Conclusión directiva.
           (Usa saltos de línea \n\n entre párrafos).
           
        2. "top_3_gaps": Lista las 3 brechas más críticas detectadas en la data. Empieza con una frase fuerte, ej: "Ausencia de Cierre Pedagógico: No se evidencia consolidación del aprendizaje al final del bloque..."
        
        3. "recommended_training": Escribe una Matriz Estratégica ("Llegar e Implementar") que ataque las brechas.
           Transforma las recomendaciones en un ARRAY DE OBJETOS con 4 claves exactas:
           - "foco": Título de la iniciativa (ej: "Clínicas de Cierre").
           - "objetivo": Qué métrica o habilidad exacta vamos a mover.
           - "metodologia": Desglose paso a paso de la ejecución empírica.
           - "kpi": Indicador de impacto a corto plazo.
           ¡Genera exactamente 3 iniciativas de altísimo impacto!

        4. "rigor_audit": Reflejar los datos de auditoría provistos.

        FORMATO JSON EXIGIDO ABSOLUTAMENTE Y SIN MARCADORES MARKDOWN:
        {{
            "systemic_summary": "Párrafo 1... \\n\\nPárrafo 2... \\n\\nPárrafo 3...",
            "top_3_gaps": ["Brecha 1 con detalle", "Brecha 2 con detalle", "Brecha 3 con detalle"],
            "recommended_training": [
                {{
                    "foco": "...",
                    "objetivo": "...",
                    "metodologia": "...",
                    "kpi": "..."
                }}
            ],
            "rigor_audit": {{
                "depth_index": {depth_index},
                "alert": "{alert_rigor}"
            }}
        }}
        """

        # 6. Call Gemini
        # We enforce JSON output to prevent parsing errors due to markdown or unescaped characters
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        
        import json
        try:
             clean_text = response.text.strip()
             ai_result = json.loads(clean_text)
        except Exception as e:
            print(f"ERROR PARSING GEMINI JSON: {e}")
            print(f"RAW TEXT: {response.text}")
            ai_result = {
                "systemic_summary": "Error procesando análisis complejo.",
                "top_3_gaps": [],
                "recommended_training": "Revisión manual requerida."
            }

        # Force injection of calculated rigor data (Source of Truth)
        ai_result["rigor_audit"] = {
            "depth_index": depth_index,
            "alert": alert_rigor,
            "sample_size": len(filtered_cycles)
        }


        # 6. SAVE TO DATABASE (PERSISTENCE)
        try:
            supabase.table('reports').insert({
                'type': 'executive',
                'content': ai_result,
                'metrics': heatmap,
                'author_id': req.author_id
            }).execute()
        except Exception as db_err:
            print(f"Warning: Could not save report to DB: {db_err}")
            # We don't fail the request if saving fails, just return the data cleanly
            pass

        return {
            "metrics": {
                "total_observations": len(filtered_cycles),
                "heatmap": heatmap
            },
            "analysis": ai_result
        }

    except Exception as e:
        print(f"Error Executive Report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT: MANAGEMENT & COVERAGE METRICS (PHASE 12) ---
class MetricsRequest(BaseModel):
    department: Optional[str] = None
    years_experience_range: Optional[str] = None
    age_range: Optional[str] = None

@router.post("/acompanamiento/executive-metrics")
async def get_executive_metrics(req: MetricsRequest):
    try:
        # 1. Fetch total target teachers (eligible for observation)
        profiles_res = supabase.table('profiles')\
            .select('id, full_name, department, years_experience, age')\
            .execute()
            
        all_teachers = profiles_res.data or []
        
        # In-memory filter for teachers based on request
        target_teachers = []
        for t in all_teachers:
            if req.department and t.get('department') != req.department: continue
            
            if req.years_experience_range:
                exp = t.get('years_experience') or 0
                if req.years_experience_range == "0-5" and not (0 <= exp <= 5): continue
                if req.years_experience_range == "5-15" and not (5 < exp <= 15): continue
                if req.years_experience_range == "15+" and not (exp > 15): continue
            
            if req.age_range:
                age = t.get('age') or 0
                if req.age_range == "20-30" and not (20 <= age <= 30): continue
                if req.age_range == "30-50" and not (30 < age <= 50): continue
                if req.age_range == "50+" and not (age > 50): continue
                
            target_teachers.append(t)

        total_target = len(target_teachers)
        target_ids = [t['id'] for t in target_teachers]
        
        # 2. Fetch related observation cycles
        cycles_res = supabase.table('observation_cycles')\
            .select('id, teacher_id, observer_id, status, created_at, observer:observer_id(full_name), teacher:teacher_id(full_name)')\
            .in_('teacher_id', target_ids if target_ids else ['none'])\
            .execute()
            
        all_cycles = cycles_res.data or []
        
        # 3. Calculate Global Metrics (Coverage)
        observed_teacher_ids = set([c['teacher_id'] for c in all_cycles if c['status'] in ['in_progress', 'completed']])
        coverage_percent = round((len(observed_teacher_ids) / total_target * 100), 1) if total_target > 0 else 0
        
        # Sessions count (heuristic: completed cycles have all 3, in_progress > 0)
        total_completed = len([c for c in all_cycles if c['status'] == 'completed'])
        total_in_progress = len([c for c in all_cycles if c['status'] == 'in_progress'])
        total_planned = len([c for c in all_cycles if c['status'] == 'planned'])
        
        # 4. Build Matriz de Acompañamiento (Observer vs Observed)
        # 5. Calculate Observer Effectiveness Index (KPI)
        
        # We need observation_data to check Depth Index
        completed_cycle_ids = [c['id'] for c in all_cycles if c['status'] == 'completed']
        obs_data_res = supabase.table('observation_data')\
            .select('cycle_id, content')\
            .in_('cycle_id', completed_cycle_ids if completed_cycle_ids else ['none'])\
            .eq('stage', 'execution')\
            .execute()
        obs_map = {item['cycle_id']: item['content'] for item in obs_data_res.data}
        
        # We need commitments to check Closure Rate
        commitments_res = supabase.table('commitments')\
            .select('cycle_id, status')\
            .in_('cycle_id', completed_cycle_ids if completed_cycle_ids else ['none'])\
            .execute()
        commitments_map = {}
        for cmt in commitments_res.data or []:
            cycle = cmt['cycle_id']
            if cycle not in commitments_map: commitments_map[cycle] = []
            commitments_map[cycle].append(cmt['status'])
        
        observer_stats = {} # observer_id -> stats
        matriz = [] # Flat list for table rendering
        
        for c in all_cycles:
            obs_id = c['observer_id']
            obs_name = c.get('observer', {}).get('full_name', 'Desconocido')
            teach_name = c.get('teacher', {}).get('full_name', 'Desconocido')
            
            # Populate Matriz
            matriz.append({
                "observer_name": obs_name,
                "teacher_name": teach_name,
                "status": c['status'],
                "date": c['created_at']
            })
            
            # Populate KPI Stats
            if obs_id not in observer_stats:
                observer_stats[obs_id] = {
                    "name": obs_name,
                    "total_assigned": 0,
                    "completed": 0,
                    "evaluative_notes": 0,
                    "total_notes": 0,
                    "commitments_achieved": 0,
                    "commitments_total": 0
                }
            
            stats = observer_stats[obs_id]
            stats["total_assigned"] += 1
            if c['status'] == 'completed':
                stats["completed"] += 1
                
                # Check Depth
                content = obs_map.get(c['id'], {})
                observations = content.get('observations', {})
                evaluative_keywords = ["debido a", "porque", "impactó en", "logró", "evidencia", "efectivo", "falta"]
                for focus, note in observations.items():
                    if note:
                        stats["total_notes"] += 1
                        if any(kw in note.lower() for kw in evaluative_keywords) and len(note.split()) > 5:
                            stats["evaluative_notes"] += 1
                
                # Check Commitments
                cmts = commitments_map.get(c['id'], [])
                for st in cmts:
                    stats["commitments_total"] += 1
                    if st == 'achieved':
                        stats["commitments_achieved"] += 1

        # Finalize Observer KPI Calculations
        observer_ranking = []
        for obs_id, s in observer_stats.items():
            # Rigor Itinerario (20%): % of assigned cycles completed
            itinerary_score = (s["completed"] / s["total_assigned"] * 100) if s["total_assigned"] > 0 else 0
            
            # Profundidad (30%): Evaluative vs Descriptive
            depth_score = (s["evaluative_notes"] / s["total_notes"] * 100) if s["total_notes"] > 0 else 0
            
            # Cierre (50%): Achieved vs Total commitments
            closure_score = (s["commitments_achieved"] / s["commitments_total"] * 100) if s["commitments_total"] > 0 else 0
            
            # Final KPI calculation
            kpi = round((itinerary_score * 0.2) + (depth_score * 0.3) + (closure_score * 0.5), 1)
            
            observer_ranking.append({
                "id": obs_id,
                "name": s["name"],
                "cycles_completed": f'{s["completed"]}/{s["total_assigned"]}',
                "depth_index": round(depth_score, 1),
                "closure_rate": round(closure_score, 1),
                "kpi_score": kpi,
                "alert": kpi < 60
            })
            
        # Sort ranking desc by KPI
        observer_ranking.sort(key=lambda x: x["kpi_score"], reverse=True)

        # 6. Calculate "Destacados" (Top Performers by Improvement)
        # We need historical comparison for this, but for now we will pick the top performers based on absolute score 
        # in the current selection, to avoid overly complex historical queries for this iteration.
        
        teacher_scores = {}
        for c in all_cycles:
            if c['status'] == 'completed':
                teach_id = c['teacher_id']
                teach_name = c.get('teacher', {}).get('full_name', 'Desconocido')
                content = obs_map.get(c['id'], {})
                scores = content.get('scores', {})
                if scores:
                    avg_score = sum(scores.values()) / len(scores)
                    if teach_id not in teacher_scores:
                        teacher_scores[teach_id] = {"name": teach_name, "scores": []}
                    teacher_scores[teach_id]["scores"].append(avg_score)
                    
        top_teachers = []
        for tid, data in teacher_scores.items():
            avg = sum(data["scores"]) / len(data["scores"])
            top_teachers.append({"name": data["name"], "score": round(avg, 1)})
            
        top_teachers.sort(key=lambda x: x["score"], reverse=True)
        top_3_teachers = top_teachers[:3]

        # 7. Trazabilidad: Semáforo de Compromisos & Evolución
        commitments_summary = {
            "achieved": 0,
            "pending": 0,
            "missed": 0
        }
        
        for st_list in commitments_map.values():
            for st in st_list:
                if st == 'achieved': commitments_summary["achieved"] += 1
                elif st == 'pending': commitments_summary["pending"] += 1
                elif st == 'missed': commitments_summary["missed"] += 1
                
        total_cmts = sum(commitments_summary.values())
        if total_cmts > 0:
            commitments_rates = {
                "achieved_rate": round(commitments_summary["achieved"] / total_cmts * 100, 1),
                "pending_rate": round(commitments_summary["pending"] / total_cmts * 100, 1),
                "missed_rate": round(commitments_summary["missed"] / total_cmts * 100, 1)
            }
        else:
            commitments_rates = {"achieved_rate": 0, "pending_rate": 0, "missed_rate": 0}

        # Calculate Global Depth Index for Evolution tracking
        global_evaluative = 0
        global_total_notes = 0
        for s in observer_stats.values():
            global_evaluative += s["evaluative_notes"]
            global_total_notes += s["total_notes"]
            
        global_depth_index = round((global_evaluative / global_total_notes * 100), 1) if global_total_notes > 0 else 0

        return {
            "global_metrics": {
                "total_teachers": total_target,
                "observed_teachers": len(observed_teacher_ids),
                "coverage_percent": coverage_percent,
                "total_completed": total_completed,
                "total_in_progress": total_in_progress,
                "total_planned": total_planned
            },
            "matriz": matriz,
            "observer_ranking": observer_ranking,
            "highlights": {
                "top_teachers": top_3_teachers,
                "top_observers": observer_ranking[:2] # Top 2 observers by KPI
            },
            "trajectory": {
                "commitments_summary": commitments_summary,
                "commitments_rates": commitments_rates,
                "global_depth_index": global_depth_index
            }
        }
        
    except Exception as e:
        print(f"Error Executive Metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

```

### Router: `admin.py`
```python
import os
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from supabase import create_client, Client

router = APIRouter(prefix="/admin", tags=["SuperAdmin"])

# === CLIENTE SUPABASE CON SERVICE ROLE ===
# ATENCIÓN: Esta clave es 'admin' y se usa para crear usuarios o sobreescribir RLS.
# NO EXPORTAR NUNCA AL CLIENTE FRONTEND.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Admin endpoints will fail.")
    supabase_admin: Client = None
else:
    supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


# === MODELOS ===
class InviteRequest(BaseModel):
    email: str
    role: str = "teacher"  # o admin, director, utp
    school_id: str


# === DEPENDECIA DE SEGURIDAD ===
async def verify_super_admin(authorization: str = Header(...)):
    """Verifica que quien llama sea el SuperAdmin."""
    try:
        token = authorization.split("Bearer ")[1]
        
        # Ojo: aquí usamos un cliente normal temporal solo para verificar el token de quien llama
        from lib.supabase_client import get_supabase_client
        supabase = get_supabase_client()
        
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Token inválido")
            
        email = user_response.user.email
        
        # Hardcoded SuperAdmin Check or use authorized_users table
        if email != "re.se.alvarez@gmail.com":
            raise HTTPException(status_code=403, detail="Acceso denegado. No eres Super Administrador.")
            
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Autenticación fallida: {str(e)}")


@router.post("/invite")
async def invite_user(req: InviteRequest, _ = Depends(verify_super_admin)):
    """
    1. Invita a un usuario a crear una cuenta.
    2. Lo asocia inmediatamente a un colegio.
    3. Le asigna un rol en authorized_users.
    """
    if not supabase_admin:
        raise HTTPException(status_code=500, detail="El servidor no está configurado para acciones de administrador (falta Service Role Key)")

    try:
        # 1. Invite User (Supabase manda el correo mágico con un Magic Link)
        invite_res = supabase_admin.auth.admin.invite_user_by_email(req.email)
        user_id = invite_res.user.id
        
        # 2. Add to authorized_users ONLY IF we use strong RLS and custom roles
        # Insert into authorized_users
        try:
             supabase_admin.table('authorized_users').insert({
                 "email": req.email,
                 "role": req.role
             }).execute()
        except:
             pass # might already exist

        # 3. Associate with School (Profiles table trigger might race this, so we update instead)
        # Because we are using Service Role Key, RLS is bypassed and this update is guaranteed
        supabase_admin.table('profiles').update({
            "school_id": req.school_id
        }).eq("id", user_id).execute()

        return {"message": f"Invitación enviada exitosamente a {req.email}", "user_id": user_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error invitando usuario: {str(e)}")

```

### Router: `analizador.py`
```python
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# --- CONFIGURACIÓN DB (SUPABASE) ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ ADVERTENCIA: No se configuró Supabase. El guardado no funcionará.")

# --- CONFIGURACIÓN IA ---
# Usamos el modelo estándar actual
MODEL_NAME = "gemini-2.5-flash" 
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("⚠️ ERROR: No se encontró GOOGLE_API_KEY en el .env")

genai.configure(api_key=api_key)

router = APIRouter(
    prefix="/analizador",
    tags=["Analizador Cognitivo"]
)

# --- MODELOS DE DATOS ---
class AnalisisRequest(BaseModel):
    objetivo_aprendizaje: str
    texto_evaluacion: str

class GuardarAnalisisRequest(BaseModel):
    user_id: str = "33964953-b929-4d89-913a-592f026903d6" # ID temporal
    objetivo_aprendizaje: str
    texto_evaluacion: str = "" # Campo opcional por si quieres guardar el input
    resultado_analisis: dict

# --- ENDPOINT 1: AUDITAR (LÓGICA RESTAURADA) ---
@router.post("/audit")
async def auditar_instrumento(request: AnalisisRequest):
    try:
        print(f"🧠 Analizando con {MODEL_NAME}...")
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = f"""
        ACTÚA COMO: Coach Pedagógico Senior especializado en Taxonomía Webb (DOK).

        INSTRUCCIONES DE CALIBRACIÓN (CASO JASNNA):
        1. PRIORIDAD COGNITIVA: Evalúa la demanda cognitiva de la tarea (lo que debe hacer el cerebro del estudiante), NO la presencia de verbos específicos o palabras clave sofisticadas.
        2. FLEXIBILIDAD SEMÁNTICA: Si el docente pide 'inferir', 'concluir' o 'relacionar', asume DOK 3 (Estratégico) aunque la redacción sea simple. NO seas pedante con la terminología académica ni actúes como un "policía de palabras".
        3. TONO CONSTRUCTIVO: En lugar de decir 'Error: Nivel incorrecto', utiliza un lenguaje propositivo como 'Sugerencia: Para robustecer el DOK 3, podrías...'. Sé un aliado, no un juez auditor.
        
        INPUTS:
        1. OA: {request.objetivo_aprendizaje}
        2. Prueba: {request.texto_evaluacion}
        
        TAREA:
        1. Identifica la ASIGNATURA y NIVEL probables.
        2. Escanea los reactivos. Clasifica como "Alineado" o "Mejorable" (evita "Crítico" a menos que sea muy bajo).
        3. Genera un "Ejemplo de Excelencia": Crea UNA pregunta modelo DOK 3 perfecta.
        
        FORMATO JSON (ESTRICTO):
        {{
            "metadata": {{
                "asignatura_detectada": "Ej: Historia",
                "nivel_detectado": "Ej: II° Medio",
                "ejemplo_excelencia": {{
                    "pregunta": "Texto de la pregunta modelo...",
                    "explicacion": "Por qué es DOK 3..."
                }}
            }},
            "diagnostico_global": "Frase ejecutiva corta",
            "score_coherencia": 0-100,
            "niveles_data": [
                {{"nivel": "DOK 1", "nombre": "Memoria", "cantidad": 0, "esperado": 15, "color": "#94a3b8"}},
                {{"nivel": "DOK 2", "nombre": "Aplicación", "cantidad": 0, "esperado": 40, "color": "#60a5fa"}},
                {{"nivel": "DOK 3", "nombre": "Estratégico", "cantidad": 0, "esperado": 35, "color": "#2b546e"}},
                {{"nivel": "DOK 4", "nombre": "Extendido", "cantidad": 0, "esperado": 10, "color": "#f2ae60"}}
            ],
            "items_analizados": [
                {{
                   "id": 1,
                   "pregunta_extracto": "Texto corto...",
                   "pregunta_completa": "Texto completo...",
                   "dok_declarado": "DOK 3",
                   "dok_real": "DOK 1",
                   "estado": "Crítico", 
                   "analisis": "Breve diagnóstico...",
                   "sugerencia_reingenieria": "Texto corregido..."
                }}
            ],
            "conclusion": {{
                "texto": "Resumen pedagógico...",
                "accion": "Consejo directo..."
            }}
        }}
        """

        response = model.generate_content(prompt)
        texto = response.text.strip()
        
        # Limpieza robusta por si la IA incluye markdown
        if texto.startswith("```json"):
            texto = texto.replace("```json", "").replace("```", "")
            
        return json.loads(texto)

    except Exception as e:
        print(f"❌ Error en IA: {str(e)}")
        if "404" in str(e):
             raise HTTPException(status_code=500, detail="Modelo no encontrado. Verifica tu API Key o librería.")
        raise HTTPException(status_code=500, detail=str(e))


# --- ENDPOINT 2: GUARDAR (CONECTADO A DB) ---
@router.post("/save")
async def guardar_analisis(request: GuardarAnalisisRequest, authorization: Optional[str] = Header(None)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Base de datos no disponible")

    try:
        user_id = request.user_id
        author_name = "Profe IC"

        # Validar usuario real si viene token
        if authorization:
            token = authorization.replace("Bearer ", "")
            user_response = supabase.auth.get_user(token)
            if user_response and user_response.user:
                user_id = user_response.user.id
                # Fetch profile name
                try:
                    profile = supabase.table("profiles").select("full_name").eq("id", user_id).single().execute()
                    if profile.data and profile.data.get("full_name"):
                        author_name = profile.data["full_name"]
                except Exception as e:
                    print(f"⚠️ Error fetching profile: {e}")
        
        # Preparar data
        data = {
            "user_id": user_id,
            "tipo": "AUDITORIA",
            "titulo": f"Auditoría: {request.resultado_analisis.get('metadata', {}).get('asignatura_detectada', 'General')}",
            "asignatura": request.resultado_analisis.get('metadata', {}).get('asignatura_detectada'),
            "nivel": request.resultado_analisis.get('metadata', {}).get('nivel_detectado'),
            "contenido": request.resultado_analisis,
            "is_public": False,
            "author_name": author_name
        }

        # Insertar
        res = supabase.table("biblioteca_recursos").insert(data).execute()
        
        if res.data:
            return {"success": True, "id": res.data[0]['id']}
        else:
            raise HTTPException(status_code=500, detail="Error al guardar en Supabase")

    except Exception as e:
        print(f"Error saving: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### Router: `biblioteca.py`
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import UploadFile, File, Form
from app.services.storage import storage
from app.services.file_engine import extract_text_from_pdf

load_dotenv()

router = APIRouter(
    prefix="/biblioteca",
    tags=["Biblioteca"]
)

# --- CONFIGURACIÓN SUPABASE ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ ADVERTENCIA: Supabase no configurado en biblioteca.py")

# --- MODELO UNIVERSAL ---
class RecursoUniversal(BaseModel):
    user_id: str
    tipo: str        
    titulo: str      
    asignatura: str = "General"
    nivel: str = "General"
    contenido: dict  

# --- 1. LEER TODOS (GET) ---
@router.get("/all")
async def obtener_recursos():
    if not supabase:
        raise HTTPException(status_code=500, detail="Base de datos no conectada")
    
    try:
        # CORREGIDO: Volvemos a tu tabla real 'biblioteca_recursos'
        response = supabase.table("biblioteca_recursos")\
            .select("*")\
            .order("created_at", desc=True)\
            .execute()
            
        return response.data
    except Exception as e:
        print(f"Error leyendo biblioteca: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 1.5 UPLOAD & EXTRACT (INGESTA) ---
@router.post("/upload")
async def upload_resource(
    file: UploadFile = File(...),
):
    """
    Recibe un PDF, lo sube a Storage y extrae su texto.
    """
    print(f"📂 Recibiendo archivo: {file.filename}")
    
    try:
        # 1. Leer contenido (para extracción)
        content = await file.read()
        
        if not content:
            raise HTTPException(status_code=400, detail="Archivo vacío")

        # 2. Subir a Supabase Storage (usamos el servicio storage.py)
        # file.read() mueve el puntero, storage.upload_file hace seek(0) antes de subir?
        # storage.upload_file usa file.file.read(), así que mejor le pasamos el UploadFile reseteado.
        await file.seek(0) 
        
        # Usamos un ID genérico temp o del usuario si tuviéramos auth. 
        # Por ahora hardcodeamos 'general' o recibimos user_id.
        # El requerimiento no especifica user_id en params, así que usaremos 'guest' o 'profesor'.
        user_id = "profesor_invitado" 
        
        upload_result = storage.upload_file(file, user_id)
        
        # 3. Extraer Texto
        # Necesitamos los bytes de nuevo. storage.upload_file hizo seek(0) al final?
        # Revisando storage.py: "file.file.seek(0)" al final. Sí.
        # Pero await file.read() es async, storage.py usa file.file.read() que es sync wrapper.
        # Vamos a leerlo de nuevo o usar el content que ya leímos.
        # Usaremos 'content' que ya leímos en paso 1.
        
        extracted_text = await extract_text_from_pdf(content)
        
        if not extracted_text:
            print("⚠️ No se pudo extraer texto o PDF vacío/imagen.")
            
        # 4. Respuesta
        return {
            "filename": file.filename,
            "storage_path": upload_result.get("full_path"),
            "extracted_text_preview": extracted_text[:200] + "...",
            "full_text": extracted_text, # <--- CRÍTICO: Texto completo para RAG
            "char_count": len(extracted_text)
        }

    except Exception as e:
        print(f"❌ Error en upload: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. GUARDAR (POST) ---
@router.post("/save") 
async def guardar_recurso(data: RecursoUniversal):
    if not supabase:
        raise HTTPException(status_code=500, detail="DB no conectada")
    
    try:
        print(f"💾 Guardando {data.tipo} para usuario {data.user_id}")
        
        registro = {
            "user_id": data.user_id,
            "tipo": data.tipo,
            "titulo": data.titulo,
            "asignatura": data.asignatura,
            "nivel": data.nivel,
            "contenido": data.contenido
        }
        
        # CORREGIDO: Volvemos a tu tabla real 'biblioteca_recursos'
        res = supabase.table("biblioteca_recursos").insert(registro).execute()
        
        if res.data:
            return {"status": "success", "id": res.data[0]['id']}
        else:
            raise Exception("No se recibió confirmación de Supabase")
        
    except Exception as e:
        print(f"❌ Error guardando: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### Router: `community.py`
```python
from fastapi import APIRouter, HTTPException, Body, Header
from typing import List, Optional, Union
from pydantic import BaseModel
from supabase import create_client, Client, ClientOptions
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase Auth & Client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
service_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Prefer Service Role Key for Admin/Backend operations to bypass RLS
if service_key:
    print("🔐 Usando Service Role Key para operaciones de comunidad (Bypass RLS)")
    supabase: Client = create_client(url, service_key)
else:
    print("⚠️ Usando Anon Key. Es probable que RLS bloquee actualizaciones si no hay sesión.")
    supabase: Client = create_client(url, key)

# --- MODELS ---
class CommunityItem(BaseModel):
    id: Union[int, str]
    type: str 
    title: str
    description: Optional[str] = None
    author: Optional[str] = "Profe IC"
    level: Optional[str] = None
    subject: Optional[str] = None
    created_at: str
    file_url: Optional[str] = None

class ShareRequest(BaseModel):
    resource_id: Union[int, str]
    is_public: bool

class CloneRequest(BaseModel):
    resource_id: Union[int, str]
    new_author_id: str 
    # resource_type opcional

# --- ENDPOINTS ---

@router.get("/community/feed", response_model=List[CommunityItem])
async def get_community_feed():
    """
    Retorna las últimas 20 publicaciones públicas de biblioteca_recursos.
    """
    try:
        # Consultamos la tabla única
        response = supabase.table("biblioteca_recursos")\
            .select("id, tipo, titulo, contenido, nivel, asignatura, created_at, author_name")\
            .eq("is_public", True)\
            .order("created_at", desc=True)\
            .limit(20)\
            .execute()

        feed = []

        for item in response.data:
            # Intentamos extraer una descripción o resumen del contenido
            contenido = item.get('contenido') or {}
            
            # Lógica para extraer descripción basada en la estructura del JSON contenido
            descripcion = "Sin descripción"
            if isinstance(contenido, dict):
                # Intentar varios campos posibles dependiendo del tipo de recurso
                descripcion = (
                    contenido.get('estrategia_aprendizaje_sentencia') or 
                    contenido.get('description') or 
                    contenido.get('descripcion') or 
                    contenido.get('diagnosis') or
                    "Recurso compartido en la comunidad del Colegio Madre Paulina"
                )
            
            # Recortar descripción
            if len(descripcion) > 150:
                descripcion = descripcion[:150] + "..."

            feed.append(CommunityItem(
                id=item['id'],
                type=item.get('tipo', 'GENERAL'), # Ej: 'PLANIFICACION', 'EVALUACION'
                title=item.get('titulo', 'Sin Título'),
                description=descripcion,
                author=item.get('author_name', 'Profe Anónimo'),
                level=item.get('nivel'),
                subject=item.get('asignatura'),
                created_at=item['created_at'],
                file_url=contenido.get('file_url') or contenido.get('url_archivo')
            ))

        return feed

    except Exception as e:
        print(f"❌ Error Feed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/community/share")
async def share_resource(req: ShareRequest, authorization: Optional[str] = Header(None)):
    """
    Publica u oculta un recurso en biblioteca_recursos.
    Usa el token del usuario (si se provee) para respetar RLS.
    """
    try:
        current_client = supabase
        
        # Si recibimos token, creamos cliente autenticado (Scoped User Context)
        if authorization:
            token = authorization.replace("Bearer ", "")
            # Crear cliente temporal con el token del usuario usando ClientOptions
            current_client = create_client(
                url, 
                key, 
                options=ClientOptions(headers={"Authorization": f"Bearer {token}"})
            )
            print(f"🔐 Usando contexto de usuario autenticado para actualizar recurso {req.resource_id}")

        print(f"🔄 Intentando actualizar recurso {req.resource_id} a is_public={req.is_public}")
        
        # Prepare update data
        update_data = {"is_public": req.is_public}
        
        # Si estamos PUBLICANDO (is_public=True), actualizamos created_at para que aparezca primero en el feed
        if req.is_public:
            from datetime import datetime
            update_data["created_at"] = datetime.now().isoformat()
            
            # Intentar obtener el nombre actualizado del perfil del usuario
            try:
                # IMPORTANTE: Debemos pasar el token explícitamente a get_user para validar la sesión
                # Solo podemos hacer esto si 'authorization' vino en el request
                if authorization:
                   token = authorization.replace("Bearer ", "") # Redundant but safe if scope is weird, though token maps to outer scope if Python 3.
                   user_response = current_client.auth.get_user(token)
                   if user_response and user_response.user:
                       uid = user_response.user.id
                       # Usar service_role key para leer profiles si es necesario, o el cliente autenticado
                       profile = current_client.table("profiles").select("full_name").eq("id", uid).single().execute()
                       if profile.data and profile.data.get("full_name"):
                           update_data["author_name"] = profile.data["full_name"]
                           print(f"👤 Actualizando autor a: {update_data['author_name']}")
            except Exception as e_prof:
                print(f"⚠️ No se pudo actualizar nombre del autor: {e_prof}")

        # Ejecutar update
        response = current_client.table("biblioteca_recursos")\
            .update(update_data)\
            .eq("id", req.resource_id)\
            .execute()
        
        # Verificar si se actualizó algo (Opcional: Si RLS permite ver pero no editar, data podría venir vacía)
        if not response.data:
            print(f"⚠️ No se actualizó ninguna fila. ID: {req.resource_id}")
            # No lanzamos 404 estricto para evitar romper flujo si es un falso negativo de RLS
            # Pero logueamos.
        
        print(f"✅ Recurso actualizado: {response.data[0] if response.data else 'Sin data retornada'}")
        return {"success": True, "message": f"Recurso {req.is_public and 'Publicado' or 'Ocultado'}"}
    except Exception as e:
        print(f"❌ Error Share: {e}")
        # Retornar error genérico 500 pero loguear detalle
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/community/clone")
async def clone_resource(req: CloneRequest):
    """
    Clona un recurso público de biblioteca_recursos a la biblioteca personal del usuario.
    """
    try:
        # 1. Obtener original
        original = supabase.table("biblioteca_recursos").select("*").eq("id", req.resource_id).execute()
        
        if not original.data:
            raise HTTPException(status_code=404, detail="Recurso no encontrado")
            
        data = original.data[0]
        
        # 2. Limpiar campos únicos
        del data['id']
        del data['created_at']
        
        # 3. Asignar nuevo dueño y resetear público
        data['user_id'] = req.new_author_id
        data['is_public'] = False 
        
        # Añadir marca de clonado al título y actualizar autor
        data['titulo'] = f"{data.get('titulo', 'Copia')} (Clonado)"
        data['author_name'] = f"{data.get('author_name', 'Anon')} (Original)" 

        # 4. Insertar copia
        new_resource = supabase.table("biblioteca_recursos").insert(data).execute()
        
        if new_resource.data:
            return {"success": True, "new_id": new_resource.data[0]['id']}
        else:
            raise HTTPException(status_code=500, detail="Error al clonar")

    except Exception as e:
        print(f"❌ Error Clone: {e}")
        raise HTTPException(status_code=500, detail=str(e))

```

### Router: `contexto.py`
```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pypdf import PdfReader
import io

load_dotenv()
router = APIRouter()

# --- CONFIGURACIÓN ---
api_key = os.getenv("GOOGLE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if api_key:
    genai.configure(api_key=api_key)

supabase: Client = create_client(supabase_url, supabase_key)

# --- UTILIDAD: GENERAR EMBEDDING ---
def get_embedding(text: str):
    # Usamos el modelo de embedding de Gemini
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document",
        title="Contexto Institucional"
    )
    return result['embedding']

# --- ENDPOINT DE CARGA ---
@router.post("/upload-contexto")
async def upload_contexto_pdf(file: UploadFile = File(...)):
    print(f"📂 [CONTEXTO] Procesando archivo: {file.filename}")
    
    try:
        # 1. Leer el PDF
        contents = await file.read()
        pdf_reader = PdfReader(io.BytesIO(contents))
        
        full_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"

        # 2. Fragmentar (Chunking)
        # Cortamos el texto en trozos de ~1000 caracteres para que sean digeribles
        chunk_size = 1000
        chunks = [full_text[i:i+chunk_size] for i in range(0, len(full_text), chunk_size)]
        
        print(f"   -> Texto extraído. Generando {len(chunks)} vectores...")

        # 3. Vectorizar y Guardar
        count = 0
        for chunk in chunks:
            if not chunk.strip(): continue
            
            # Generar Vector
            vector = get_embedding(chunk)
            
            # Guardar en Supabase
            data = {
                "content": chunk,
                "metadata": {"source": file.filename},
                "embedding": vector
            }
            supabase.table("documentos_institucionales").insert(data).execute()
            count += 1

        return {"status": "success", "message": f"Procesados {count} fragmentos del documento {file.filename}"}

    except Exception as e:
        print(f"❌ Error subiendo contexto: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### Router: `curriculum.py`
```python
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client, Client

router = APIRouter()

# --- CARGA DE VARIABLES ---
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- CONEXIÓN ---
supabase: Optional[Client] = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        print("❌ [CURRICULUM] Faltan credenciales en .env")
except Exception as e:
    print(f"🔥 ERROR CRÍTICO SUPABASE: {e}")

# --- ORDEN LÓGICO PEDAGÓGICO ---
ORDEN_OFICIAL = {
    "NT1": 1, "Pre-Kinder": 1,
    "NT2": 2, "Kinder": 2,
    "1° Básico": 3,
    "2° Básico": 4,
    "3° Básico": 5,
    "4° Básico": 6,
    "5° Básico": 7,
    "6° Básico": 8,
    "7° Básico": 9,
    "8° Básico": 10,
    "1° Medio": 11,
    "2° Medio": 12,
    "3° Medio": 13,
    "4° Medio": 14,
    "3° y 4° Medio": 15
}

# --- LISTAS DE RESPALDO ---
FALLBACK_NIVELES = [
    "NT1", "NT2", 
    "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", 
    "1° Medio", "2° Medio", "3° Medio", "4° Medio"
]
FALLBACK_ASIGNATURAS = ["Lenguaje", "Matemática", "Historia", "Ciencias", "Inglés", "Artes", "Música", "Tecnología"]

def fetch_all_rows(table: str, select_cols: str, filters: dict = None):
    if not supabase: return []
    all_data = []
    current_start = 0
    batch_size = 1000
    
    while True:
        query = supabase.table(table).select(select_cols)
        if filters:
            for col, val in filters.items():
                query = query.eq(col, val)
        
        response = query.range(current_start, current_start + batch_size - 1).execute()
        batch_data = response.data
        all_data.extend(batch_data)
        if len(batch_data) < batch_size:
            break
        current_start += batch_size
    return all_data

class OptionsRequest(BaseModel):
    nivel: Optional[str] = None
    asignatura: Optional[str] = None

@router.post("/curriculum/options")
async def get_curriculum_options(req: OptionsRequest):
    if not supabase:
        if not req.nivel: return {"type": "niveles", "data": FALLBACK_NIVELES}
        if not req.asignatura: return {"type": "asignaturas", "data": FALLBACK_ASIGNATURAS}
        return {"type": "oas", "data": []}

    try:
        # A. NIVELES (ORDENADOS)
        if not req.nivel:
            raw_data = fetch_all_rows('curriculum_oas', 'nivel')
            # Extraer únicos
            niveles_unicos = list(set([item['nivel'] for item in raw_data if item['nivel']]))
            
            # ORDENAR USANDO EL DICCIONARIO 'ORDEN_OFICIAL'
            # Si un nivel no está en el diccionario, se va al final (99)
            niveles_ordenados = sorted(niveles_unicos, key=lambda x: ORDEN_OFICIAL.get(x, 99))
            
            if not niveles_ordenados: 
                return {"type": "niveles", "data": FALLBACK_NIVELES}
            return {"type": "niveles", "data": niveles_ordenados}

        # B. ASIGNATURAS (Alfabético está bien)
        if req.nivel and not req.asignatura:
            raw_data = fetch_all_rows('curriculum_oas', 'asignatura', {'nivel': req.nivel})
            asignaturas = sorted(list(set([item['asignatura'] for item in raw_data if item['asignatura']])))
            if not asignaturas:
                 return {"type": "asignaturas", "data": FALLBACK_ASIGNATURAS}
            return {"type": "asignaturas", "data": asignaturas}

        # C. OBJETIVOS
        if req.nivel and req.asignatura:
            raw_data = fetch_all_rows('curriculum_oas', 'id, oa_codigo, descripcion', {'nivel': req.nivel, 'asignatura': req.asignatura})
            return {"type": "oas", "data": raw_data}

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        if not req.nivel: return {"type": "niveles", "data": FALLBACK_NIVELES}
        return {"type": "error", "data": [], "details": str(e)}
```

### Router: `elevador.py`
```python
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client, Client

router = APIRouter()

# --- CARGA DE VARIABLES ---
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- CONEXIÓN ---
supabase: Optional[Client] = None
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        print("❌ [CURRICULUM] Faltan credenciales en .env")
except Exception as e:
    print(f"🔥 ERROR CRÍTICO SUPABASE: {e}")

# --- ORDEN LÓGICO PEDAGÓGICO ---
ORDEN_OFICIAL = {
    "NT1": 1, "Pre-Kinder": 1,
    "NT2": 2, "Kinder": 2,
    "1° Básico": 3,
    "2° Básico": 4,
    "3° Básico": 5,
    "4° Básico": 6,
    "5° Básico": 7,
    "6° Básico": 8,
    "7° Básico": 9,
    "8° Básico": 10,
    "1° Medio": 11,
    "2° Medio": 12,
    "3° Medio": 13,
    "4° Medio": 14,
    "3° y 4° Medio": 15
}

# --- LISTAS DE RESPALDO ---
FALLBACK_NIVELES = [
    "NT1", "NT2", 
    "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", 
    "1° Medio", "2° Medio", "3° Medio", "4° Medio"
]
FALLBACK_ASIGNATURAS = ["Lenguaje", "Matemática", "Historia", "Ciencias", "Inglés", "Artes", "Música", "Tecnología"]

def fetch_all_rows(table: str, select_cols: str, filters: dict = None):
    if not supabase: return []
    all_data = []
    current_start = 0
    batch_size = 1000
    
    while True:
        query = supabase.table(table).select(select_cols)
        if filters:
            for col, val in filters.items():
                query = query.eq(col, val)
        
        response = query.range(current_start, current_start + batch_size - 1).execute()
        batch_data = response.data
        all_data.extend(batch_data)
        if len(batch_data) < batch_size:
            break
        current_start += batch_size
    return all_data

class OptionsRequest(BaseModel):
    nivel: Optional[str] = None
    asignatura: Optional[str] = None

@router.post("/curriculum/options")
async def get_curriculum_options(req: OptionsRequest):
    if not supabase:
        if not req.nivel: return {"type": "niveles", "data": FALLBACK_NIVELES}
        if not req.asignatura: return {"type": "asignaturas", "data": FALLBACK_ASIGNATURAS}
        return {"type": "oas", "data": []}

    try:
        # A. NIVELES (ORDENADOS)
        if not req.nivel:
            raw_data = fetch_all_rows('curriculum_oas', 'nivel')
            # Extraer únicos
            niveles_unicos = list(set([item['nivel'] for item in raw_data if item['nivel']]))
            
            # ORDENAR USANDO EL DICCIONARIO 'ORDEN_OFICIAL'
            # Si un nivel no está en el diccionario, se va al final (99)
            niveles_ordenados = sorted(niveles_unicos, key=lambda x: ORDEN_OFICIAL.get(x, 99))
            
            if not niveles_ordenados: 
                return {"type": "niveles", "data": FALLBACK_NIVELES}
            return {"type": "niveles", "data": niveles_ordenados}

        # B. ASIGNATURAS (Alfabético está bien)
        if req.nivel and not req.asignatura:
            raw_data = fetch_all_rows('curriculum_oas', 'asignatura', {'nivel': req.nivel})
            asignaturas = sorted(list(set([item['asignatura'] for item in raw_data if item['asignatura']])))
            if not asignaturas:
                 return {"type": "asignaturas", "data": FALLBACK_ASIGNATURAS}
            return {"type": "asignaturas", "data": asignaturas}

        # C. OBJETIVOS
        if req.nivel and req.asignatura:
            raw_data = fetch_all_rows('curriculum_oas', 'id, oa_codigo, descripcion', {'nivel': req.nivel, 'asignatura': req.asignatura})
            return {"type": "oas", "data": raw_data}

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        if not req.nivel: return {"type": "niveles", "data": FALLBACK_NIVELES}
        return {"type": "error", "data": [], "details": str(e)}

# --- MODELOS PARA ELEVACIÓN ---
class ElevateRequest(BaseModel):
    grade: str
    subject: str
    activity: str

import google.generativeai as genai
import json

# Configurar API Key si no está configurada globalmente (aunque main.py lo hace, mejor asegurar)
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def limpiar_json_gemini(text: str) -> str:
    """Limpia los bloques de código ```json ... ``` de la respuesta de Gemini"""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

@router.post("/elevate")
async def elevate_activity(req: ElevateRequest):
    try:
        prompt = f"""
        ROL Y TONO (El Coach Cognitivo): 
        Eres un especialista en Diseño Instruccional y Taxonomía de Webb (DOK).
        Tu Misión: Ayudar al profesor a romper la "Ilusión de Competencia" (aprendizaje superficial).
        Tu Actitud: No eres un juez que califica con nota roja. Eres un socio creativo que toma una idea simple y la "vitamina" para generar aprendizaje profundo.
        Estilo de Comunicación: Usa un lenguaje profesional pero motivador. Evita la jerga académica innecesaria; habla de "desafío mental", "toma de decisiones" y "argumentación".

        REGLA DE ORO "ANTI-JASNNA" (Evaluación de Demanda Real): 
        TIENES PROHIBIDO evaluar el nivel DOK basándote solo en los verbos usados.
        Analiza la Tarea: Mira lo que el cerebro del estudiante debe hacer, no solo lo que lee.
        Ejemplo: Si la pregunta es "¿Quién es el personaje?", es DOK 1. Pero si la pregunta es "¿Quién es el personaje?", pero para responderla el alumno debe inferir pistas de tres párrafos distintos, ¡eso es DOK 3! Reconoce la complejidad implícita.

        LA ESCALERA DE LA MEJORA (Estructura de Respuesta): 
        Cuando recibas una actividad, tu respuesta debe seguir este flujo:
        A. El Espejo (Diagnóstico Empático): "Tu actividad actual está en Nivel [X]. Es útil para [Habilidad básica], pero corre el riesgo de ser mecánica."
        B. El Pivote (La Propuesta): "Para llevarla a Nivel 3 o 4, propongo agregar esta restricción o contexto..."
        C. La Versión Elevada (Ejemplo Concreto): Redacta la nueva actividad completa. * Nota: Asegura que la nueva actividad requiera Justificar, Relacionar o Crear, alineado con la meta de reducir las preguntas de memoria del colegio.

        CONTEXTO:
        - Nivel: {req.grade}
        - Asignatura: {req.subject}
        - Actividad Original: "{req.activity}"
        
        FORMATO DE RESPUESTA (JSON PURO):
        {{
            "dok_actual": "Nivel 1/2/3/4",
            "diagnostico": "Texto del paso A (El Espejo)...",
            "escalera": [
                {{"paso": 1, "accion": "Acción concreta para pasar a Nivel 2"}},
                {{"paso": 2, "accion": "Acción concreta para pasar a Nivel 3"}},
                {{"paso": 3, "accion": "Acción concreta para llegar a Nivel 4"}}
            ],
            "propuestas": {{
                "actividad": "Texto del paso C (Versión Elevada)...",
                "pregunta": "Una pregunta esencial provocadora relacionada.",
                "ticket": "Un ticket de salida breve para verificar metacognición."
            }}
        }}
        """
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        clean_json = limpiar_json_gemini(response.text)
        data = json.loads(clean_json)
        
        return data

    except Exception as e:
        print(f"❌ ERROR ELEVADOR: {e}")
        # Fallback de error
        return {
            "dok_actual": "Error",
            "diagnostico": "No se pudo procesar la solicitud.",
            "escalera": [],
            "propuestas": {
                "actividad": "Intente nuevamente.",
                "pregunta": "",
                "ticket": ""
            }
        }
```

### Router: `evaluaciones.py`
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Union, Optional
import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- CONFIGURACIÓN DE IDENTIDAD LOCAL ---
# Esto le da el "Sello" a todas las pruebas generadas
CONTEXTO_LOCAL = """
UBICACIÓN: Chiguayante, Región del Biobío, Chile.
ENTORNO: Cercanía al Río Biobío, Cerro Manquimávida, clima templado.
SELLO INSTITUCIONAL: Colegio Madre Paulina (Humanista-Cristiano, Excelencia, Respeto).
INSTRUCCIÓN DE LOCALIZACIÓN: 
Siempre que sea pertinente al OA, utiliza ejemplos locales.
- En lugar de "Un águila come serpientes", usa "Un Peuco caza una lagartija".
- En lugar de "Un bosque de pinos", prefiere "Bosque esclerófilo o Selva Valdiviana".
- Contextualiza problemas matemáticos o físicos en situaciones cotidianas de la zona (ej: el Biotren, la Costanera).
"""

# --- MODELOS DE DATOS ---
class DokDistribution(BaseModel):
    dok1: int
    dok2: int
    dok3: int

class Quantities(BaseModel):
    multiple_choice: int
    true_false: int
    short_answer: int
    essay: int

class PointsPerType(BaseModel):
    multiple_choice: int
    true_false: int
    short_answer: int
    essay: int

class AssessmentConfig(BaseModel):
    grade: str
    subject: str
    oaIds: List[Union[str, int]] 
    customOa: str
    context_text: Optional[str] = None # <--- RAG CTX
    dokDistribution: DokDistribution
    quantities: Quantities
    quantities: Quantities
    points: PointsPerType 
    num_alternatives: Optional[int] = 4 # Default 4 

# --- LIMPIEZA JSON ---
def limpiar_json(texto):
    texto = re.sub(r'```json\s*', '', texto)
    texto = re.sub(r'```\s*', '', texto)
    try:
        return json.loads(texto)
    except:
        inicio = texto.find("{")
        fin = texto.rfind("}")
        if inicio != -1 and fin != -1:
            try:
                return json.loads(texto[inicio:fin+1])
            except:
                pass
        return None

@router.post("/generate-assessment")
async def generate_assessment(config: AssessmentConfig):
    print(f"⚡ [EVALUACIONES] Generando prueba contextualizada para {config.grade} - {config.subject}")
    
    try:
        oa_ids_str = [str(x) for x in config.oaIds]
        oas_texto = " | ".join(oa_ids_str)
        
        if config.customOa:
            oas_texto += f" | OA Extra: {config.customOa}"

        total_pts = (
            (config.quantities.multiple_choice * config.points.multiple_choice) +
            (config.quantities.true_false * config.points.true_false) +
            (config.quantities.short_answer * config.points.short_answer) +
            (config.quantities.essay * config.points.essay)
        )

        # PREPARAR BLOQUE DE CONTEXTO ESTRICTO
        strict_block = ""
        if config.context_text:
            strict_block = f"""
        === REGLA DE ORO (MODO ESTRICTO) ===
        Tienes PROHIBIDO utilizar tu conocimiento general para responder las preguntas de contenido.
        Debes actuar como si SOLO supieras lo que está escrito en el texto proporcionado abajo.
        Si la respuesta a una pregunta no aparece explícitamente en el texto, NO la inventes.
        ====================================

        TEXTO DE REFERENCIA (FUENTE ÚNICA DE VERDAD):
        {config.context_text}
        =============================================
            """

        # PROMPT ENRIQUECIDO CON CONTEXTO LOCAL
        prompt = f"""
        {strict_block}

        ROL: Experto en Evaluación Educativa del Mineduc (Chile).
        TAREA: Crear una PRUEBA SUMATIVA rigurosa (Total: {total_pts} pts).
        
        {CONTEXTO_LOCAL}
        
        CONTEXTO DE LA PRUEBA:
        - Nivel: {config.grade}
        - Asignatura: {config.subject}
        - Objetivos (IDs/Textos): {oas_texto}
        
        ESTRUCTURA OBLIGATORIA:
        ESTRUCTURA OBLIGATORIA:
        1. Selección Múltiple: {config.quantities.multiple_choice} preguntas ({config.points.multiple_choice} pts c/u). Cada una con EXACTAMENTE {config.num_alternatives} alternativas.
        2. Verdadero/Falso: {config.quantities.true_false} preguntas ({config.points.true_false} pts c/u).
        3. Respuesta Breve: {config.quantities.short_answer} preguntas ({config.points.short_answer} pts c/u).
        4. Desarrollo: {config.quantities.essay} preguntas ({config.points.essay} pts c/u).

        DISTRIBUCIÓN COGNITIVA (DOK):
        - DOK 1: {config.dokDistribution.dok1}%
        - DOK 2: {config.dokDistribution.dok2}%
        - DOK 3: {config.dokDistribution.dok3}%

        FORMATO JSON DE RESPUESTA:
        {{
            "student_version": {{
                "title": "Título de la Prueba",
                "description": "Instrucciones...",
                "items": [
                    {{
                        "id": 1,
                        "type": "multiple_choice",
                        "dok_level": 1,
                        "points": {config.points.multiple_choice},
                        "stem": "Pregunta...",
                        "options": ["A) Opción 1", "B) Opción 2"]
                    }},
                     {{
                        "id": 2,
                        "type": "essay",
                        "dok_level": 3,
                        "points": {config.points.essay},
                        "stem": "Pregunta de desarrollo..."
                    }}
                ]
            }},
            "teacher_guide": {{
                "answers": [
                    {{
                        "related_item_id": 1,
                        "correct_answer": "A) Opción 1",
                        "explanation": "Justificación basada en el texto..."
                    }},
                    {{
                        "related_item_id": 2,
                        "rubric": {{
                            "logrado": "Describe correctamente...",
                            "medianamente": "Menciona parcialmente...",
                            "no_logrado": "No menciona..."
                        }}
                    }}
                ]
            }}
        }}
        """

        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        resultado = limpiar_json(response.text)

        if not resultado:
            return {"title": "Error Generando", "description": "Intenta de nuevo con menos preguntas.", "items": []}

        return resultado

    except Exception as e:
        print(f"❌ Error Evaluación: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### Router: `export.py`
```python
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml
import io
import os
import re
import json

router = APIRouter()

# ==========================================
# 1. MODELOS DE DATOS
# ==========================================

class ExportRequest(BaseModel):
    titulo: str
    descripcion: str
    nivel: str
    asignatura: str
    oa: str
    actividad: str
    puntaje_total: int
    tabla: List[Dict[str, Any]]

class PlanExportRequest(BaseModel):
    titulo_unidad: str
    estrategia: str
    nivel: str
    asignatura: str
    oas: List[str]
    clases: List[Dict[str, Any]]

class AssessmentItem(BaseModel):
    type: str
    dok_level: int
    points: int
    stem: str
    options: Optional[List[Union[str, Dict[str, Any]]]] = None
    correct_answer: Optional[bool] = None
    rubric_hint: Optional[str] = None

class AssessmentExportRequest(BaseModel):
    title: str
    description: str
    grade: str
    subject: str
    items: List[AssessmentItem]
    teacher_guide: Optional[Dict[str, Any]] = None # <--- Nueva clave importada

class ElevatorExportRequest(BaseModel):
    grade: str
    subject: str
    activity: str
    dok_actual: str
    diagnostico: str
    escalera: List[Dict[str, Any]]
    propuestas: Dict[str, str]

class LecturaPregunta(BaseModel):
    id: str
    nivel_taxonomico: str
    pregunta: str
    alternativas: List[str]
    respuesta_correcta: str
    justificacion: str

class LecturaInteligenteExportRequest(BaseModel):
    nivel: str
    asignatura: str
    oa: str
    texto: str
    preguntas: List[LecturaPregunta]
    tipo_documento: str # "estudiante" o "profesor"

class GenericExportRequest(BaseModel):
    titulo_unidad: str
    nivel: str
    asignatura: str
    contenido: Dict[str, Any]

# ==========================================
# 2. UTILIDADES DE DISEÑO
# ==========================================

def limpiar_latex_para_word(texto: str) -> str:
    if not texto: return ""
    texto = str(texto)
    texto = re.sub(r'\$\$(.*?)\$\$', r'\1', texto) 
    texto = texto.replace('\\', '') 
    return texto

def set_cell_background(cell, color_hex):
    shading_elm = parse_xml(r'<w:shd {} w:fill="{}"/>'.format(nsdecls('w'), color_hex))
    cell._tc.get_or_add_tcPr().append(shading_elm)

def style_header_cell(cell, text, bg_color="2B546E", text_color="FFFFFF"):
    cell.text = text
    set_cell_background(cell, bg_color)
    if cell.paragraphs[0].runs:
        run = cell.paragraphs[0].runs[0]
        run.font.bold = True
        try:
            run.font.color.rgb = RGBColor.from_string(text_color)
        except:
            pass
        run.font.size = Pt(10)
    cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

def add_header_logo(doc, asignatura, nivel, titulo_extra=""):
    table = doc.add_table(rows=1, cols=2)
    table.autofit = False
    table.columns[0].width = Inches(1.2)
    table.columns[1].width = Inches(5.3)
    
    cell_logo = table.cell(0, 0)
    p = cell_logo.paragraphs[0]
    run = p.add_run()
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logo_path = os.path.join(base_dir, 'assets', 'logo.png')
    
    if os.path.exists(logo_path):
        try:
            run.add_picture(logo_path, width=Inches(1.0))
        except:
            run.add_text("ProfeIC")
    else:
        run.add_text("ProfeIC")

    cell_info = table.cell(0, 1)
    p_info = cell_info.paragraphs[0]
    p_info.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r1 = p_info.add_run("COLEGIO MADRE PAULINA\n")
    r1.bold = True; r1.font.size = Pt(12); r1.font.color.rgb = RGBColor(43, 84, 110)
    p_info.add_run(f"Asignatura: {asignatura} | Nivel: {nivel}\n").font.size = Pt(10)
    if titulo_extra:
        p_info.add_run(f"{titulo_extra}").italic = True

    doc.add_paragraph() 

# ==========================================
# 3. MOTORES DE RENDERIZADO (Lógica Visual)
# ==========================================

def renderizar_planificacion(doc, data):
    """Motor Visual para Planificaciones"""
    titulo = data.get('titulo_unidad_creativo') or data.get('titulo_unidad') or "Planificación"
    h = doc.add_heading(limpiar_latex_para_word(titulo), level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    est = data.get('estrategia_aprendizaje_sentencia') or data.get('estrategia')
    if est:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(f"Estrategia: {limpiar_latex_para_word(est)}")
        r.italic = True; r.font.color.rgb = RGBColor(43, 84, 110)

    # Clases
    clases = data.get('planificacion_clases') or data.get('clases') or []
    for clase in clases:
        doc.add_paragraph()
        # Header Clase
        t = doc.add_table(rows=1, cols=1); t.autofit = False; t.columns[0].width = Inches(6.5)
        c = t.cell(0,0); set_cell_background(c, "2B546E")
        p = c.paragraphs[0]; r = p.add_run(f"CLASE {clase.get('numero_clase','?')}"); r.bold=True; r.font.color.rgb=RGBColor(255,255,255); r.font.size=Pt(12)
        if clase.get('foco_pedagogico'): p.add_run(f" | Foco: {limpiar_latex_para_word(clase.get('foco_pedagogico'))}").font.color.rgb=RGBColor(255,255,255)
        
        # Momentos
        tm = doc.add_table(rows=2, cols=3); tm.style = 'Table Grid'
        style_header_cell(tm.cell(0,0), "INICIO", "F2AE60"); style_header_cell(tm.cell(0,1), "DESARROLLO", "F2AE60"); style_header_cell(tm.cell(0,2), "CIERRE", "F2AE60")
        cont = clase.get('contenido_editable', {})
        tm.cell(1,0).text = limpiar_latex_para_word(cont.get('inicio',''))
        tm.cell(1,1).text = limpiar_latex_para_word(cont.get('desarrollo',''))
        tm.cell(1,2).text = limpiar_latex_para_word(cont.get('cierre',''))

        # Recursos
        doc.add_paragraph()
        tr = doc.add_table(rows=1, cols=1); tr.style = 'Table Grid'
        tr.cell(0,0).text = f"Recursos: {limpiar_latex_para_word(clase.get('recurso_practica', ''))}\nTicket: {limpiar_latex_para_word(clase.get('ticket_salida', ''))}"

def renderizar_rubrica(doc, data):
    """Motor Visual para Rúbricas"""
    # Título y Descripción
    titulo = data.get('titulo') or "Rúbrica de Evaluación"
    h = doc.add_heading(limpiar_latex_para_word(titulo), level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    if data.get('descripcion'):
        p = doc.add_paragraph(limpiar_latex_para_word(data.get('descripcion')))
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.italic = True
    
    doc.add_paragraph()
    
    # Metadata (OA, Actividad)
    if data.get('oaDescripcion') or data.get('oa'):
        p = doc.add_paragraph()
        p.add_run("Objetivo de Aprendizaje: ").bold = True
        p.add_run(limpiar_latex_para_word(data.get('oaDescripcion') or data.get('oa')))
    
    if data.get('actividad'):
        p = doc.add_paragraph()
        p.add_run("Actividad / Producto: ").bold = True
        p.add_run(limpiar_latex_para_word(data.get('actividad')))
        
    doc.add_paragraph()

    # TABLA RÚBRICA
    tabla_datos = data.get('tabla', [])
    if tabla_datos:
        # Definir columnas: Criterio + 4 Niveles
        t = doc.add_table(rows=1, cols=5)
        t.style = 'Table Grid'
        t.autofit = False
        
        # Headers con Colores
        headers = ["Criterio & Peso", "Insuficiente", "Elemental", "Adecuado", "Destacado"]
        bg_colors = ["EFEFEF", "FEF2F2", "FEFCE8", "F0FDF4", "EFF6FF"] # Gris, Rojo, Amarillo, Verde, Azul
        text_colors = ["000000", "991B1B", "854D0E", "166534", "1E40AF"]

        for i, (text, bg) in enumerate(zip(headers, bg_colors)):
            style_header_cell(t.cell(0,i), text, bg, "000000" if i==0 else "333333")

        # Filas
        puntaje_total = data.get('puntaje_total', 60)
        
        for row in tabla_datos:
            new_row = t.add_row()
            
            # Criterio y Peso
            peso = row.get('porcentaje', 0)
            pts_max = (puntaje_total * peso) / 100
            criterio_text = f"{limpiar_latex_para_word(row.get('criterio',''))}\n\n({peso}%) - Máx {pts_max:.1f} pts"
            new_row.cells[0].text = criterio_text
            
            # Niveles
            niveles = row.get('niveles', {})
            # Mapeo seguro de claves (a veces vienen en mayusculas o minusculas)
            niveles_safe = {k.lower(): v for k, v in niveles.items()}
            
            keys = ["insuficiente", "elemental", "adecuado", "destacado"]
            factors = [0.25, 0.5, 0.75, 1.0]
            
            for i, key in enumerate(keys):
                desc = niveles_safe.get(key, "")
                pts = pts_max * factors[i]
                new_row.cells[i+1].text = f"{limpiar_latex_para_word(desc)}\n\n({pts:.1f} pts)"

def renderizar_evaluacion(doc, data):
    """Motor Visual para Pruebas"""
    titulo = data.get('title') or "Evaluación"
    h = doc.add_heading(limpiar_latex_para_word(titulo), level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    if data.get('description'):
        p = doc.add_paragraph(limpiar_latex_para_word(data.get('description')))
        p.italic = True
    
    doc.add_paragraph()
    
    # Datos alumno
    t = doc.add_table(rows=1, cols=2); t.style='Table Grid'
    t.cell(0,0).text = "Nombre: __________________________________"; t.cell(0,1).text = "Fecha: __________"
    doc.add_paragraph()

    items = data.get('items', [])
    for i, item in enumerate(items):
        p = doc.add_paragraph()
        run = p.add_run(f"{i+1}. {limpiar_latex_para_word(item.get('stem',''))}")
        run.bold = True
        p.add_run(f" ({item.get('points')} pts)")
        
        if item.get('type') == 'multiple_choice' and item.get('options'):
            for idx, opt in enumerate(item['options']):
                text_opt = opt.get('text', '') if isinstance(opt, dict) else str(opt)
                doc.add_paragraph(f"   {chr(97+idx)}) {limpiar_latex_para_word(text_opt)}")
        elif item.get('type') == 'true_false':
             doc.add_paragraph("   ___ V    ___ F")
        elif item.get('type') in ['short_answer', 'essay']:
             doc.add_paragraph("_" * 80)
             doc.add_paragraph("_" * 80)

    # --- RENDERIZADO DE PAUTA DOCENTE (SI EXISTE) ---
    guide = data.get('teacher_guide')
    if guide and 'answers' in guide:
        doc.add_page_break()
        h = doc.add_heading("Pauta de Corrección Docente", level=1)
        h.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        doc.add_paragraph("Este anexo es exclusivo para el profesor.").italic = True
        doc.add_paragraph()

        for ans in guide['answers']:
            # Intentar encontrar el item relacionado para contextualizar
            item_id = ans.get('related_item_id')
            
            p = doc.add_paragraph()
            p.add_run(f"Pregunta {item_id}: ").bold = True
            
            if ans.get('correct_answer'):
                p.add_run(f"{ans.get('correct_answer')}")
            
            if ans.get('explanation'):
                doc.add_paragraph(f"Justificación: {ans.get('explanation')}").style = 'Quote' # O 'Intense Quote'
            
            if ans.get('rubric'):
                r = ans['rubric']
                doc.add_paragraph("Rúbrica Sugerida:").bold = True
                tr = doc.add_table(rows=2, cols=3); tr.style = 'Table Grid'
                tr.cell(0,0).text = "LOGRADO"; tr.cell(0,1).text = "MEDIANAMENTE"; tr.cell(0,2).text = "NO LOGRADO"
                tr.cell(1,0).text = str(r.get('logrado',''))
                tr.cell(1,1).text = str(r.get('medianamente',''))
                tr.cell(1,2).text = str(r.get('no_logrado',''))
                doc.add_paragraph()

def renderizar_lectura_inteligente(doc, data: Dict[str, Any]):
    """Motor Visual para Lectura Inteligente"""
    is_profesor = data.get("tipo_documento", "estudiante") == "profesor"
    
    # Título principal
    h = doc.add_heading(f"Guía de Comprensión Lectora - {data.get('asignatura')}", level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Nivel: {data.get('nivel')}").alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Objetivo: {data.get('oa')}\n").italic = True
    
    # 1. El Texto
    doc.add_heading("I. Lectura Base", level=2)
    p_texto = doc.add_paragraph(limpiar_latex_para_word(data.get("texto", "")))
    p_texto.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    # Espacio
    doc.add_paragraph()
    
    # 2. Las Preguntas
    doc.add_heading("II. Preguntas de Comprensión", level=2)
    preguntas = data.get("preguntas", [])
    
    for i, q in enumerate(preguntas):
        p_q = doc.add_paragraph()
        run_q = p_q.add_run(f"{i + 1}. {limpiar_latex_para_word(q.get('pregunta', ''))}")
        run_q.bold = True
        
        # Opcional: Mostrar DOK en cursiva y pequeño (especialmente útil si es profesor)
        if is_profesor:
            p_q.add_run(f" [{q.get('nivel_taxonomico', '')}]").font.color.rgb = RGBColor(120, 120, 120)

        alts = q.get('alternativas', [])
        for j, alt in enumerate(alts):
            p_alt = doc.add_paragraph(f"   {chr(65+j)}) {limpiar_latex_para_word(alt)}")
            # Verificar si la alternativa es la correcta (búsqueda robusta)
            alt_correcta = str(q.get("respuesta_correcta", "")).strip()
            es_correcta = False
            if alt_correcta == alt:
                es_correcta = True
            elif alt_correcta.startswith(chr(65+j)) or alt_correcta.startswith(chr(97+j)):
                es_correcta = True
            elif f"opcion {chr(97+j)}" in alt_correcta.lower() or f"opción {chr(97+j)}" in alt_correcta.lower():
                 es_correcta = True

            # En la pauta del profesor, destacar la correcta
            if is_profesor and es_correcta:
                p_alt.runs[0].bold = True
                p_alt.runs[0].font.color.rgb = RGBColor(0, 128, 0) # Verde oscuro
        
        # En versión profesor, mostrar la justificación
        if is_profesor:
            p_just = doc.add_paragraph()
            r_just = p_just.add_run("Justificación Pedagógica: ")
            r_just.bold = True
            r_just.font.color.rgb = RGBColor(217, 154, 80) # Naranja (#d99a50)
            p_just.add_run(limpiar_latex_para_word(q.get("justificacion", "")))
        else:
             doc.add_paragraph()

# ==========================================
# 4. ENDPOINTS
# ==========================================

@router.post("/export/planificacion-docx")
async def export_planificacion_docx(req: PlanExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.asignatura, req.nivel, "Planificación")
        renderizar_planificacion(doc, req.dict())
        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": "attachment; filename=planificacion.docx"})
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/rubrica-docx")
async def export_rubric_docx(req: ExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.asignatura, req.nivel, "Rúbrica de Evaluación")
        renderizar_rubrica(doc, req.dict())
        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": "attachment; filename=rubrica.docx"})
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/evaluacion-docx")
async def export_assessment_docx(req: AssessmentExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.subject, req.grade, "Evaluación")
        renderizar_evaluacion(doc, req.dict())
        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": "attachment; filename=evaluacion.docx"})
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/elevador-docx")
async def export_elevator_docx(req: ElevatorExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.subject, req.grade, "Elevador Cognitivo")
        doc.add_heading("Elevador Cognitivo", 1)
        doc.add_paragraph(f"Actividad Base: {req.activity}")
        doc.add_heading(f"Diagnóstico: {req.dok_actual}", 2)
        doc.add_paragraph(req.diagnostico)
        # (Se puede expandir la lógica visual aquí si es necesario)
        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": "attachment; filename=elevador.docx"})
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/export/lectura-inteligente")
async def export_lectura_docx(req: LecturaInteligenteExportRequest):
    try:
        doc = Document()
        formato = "Pauta Docente" if req.tipo_documento == "profesor" else "Guía Estudiante"
        add_header_logo(doc, req.asignatura, req.nivel, formato)
        
        renderizar_lectura_inteligente(doc, req.dict())
        
        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        
        return StreamingResponse(
            file_stream, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
            headers={"Content-Disposition": f"attachment; filename=lectura_{req.tipo_documento}.docx"}
        )
    except Exception as e:
        print(f"Error DOCX: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- GENÉRICO (BIBLIOTECA) ---
@router.post("/export/generic-docx")
async def export_generic_docx(req: GenericExportRequest):
    try:
        doc = Document()
        add_header_logo(doc, req.asignatura, req.nivel, "Documento Exportado")
        content = req.contenido

        # 1. PLANIFICACIÓN
        if "planificacion_clases" in content or ("clases" in content and isinstance(content['clases'], list)):
            print("Detectado: Planificación")
            # Normalización
            if "titulo_unidad_creativo" in content: content["titulo_unidad"] = content["titulo_unidad_creativo"]
            if "estrategia_aprendizaje_sentencia" in content: content["estrategia"] = content["estrategia_aprendizaje_sentencia"]
            renderizar_planificacion(doc, content)

        # 2. RÚBRICA (¡AQUÍ ESTÁ LA MAGIA QUE FALTABA!)
        elif "tabla" in content and isinstance(content['tabla'], list) and "criterio" in content['tabla'][0]:
            print("Detectado: Rúbrica")
            renderizar_rubrica(doc, content)

        # 3. EVALUACIÓN (PRUEBA)
        elif "items" in content and isinstance(content['items'], list):
            print("Detectado: Evaluación")
            renderizar_evaluacion(doc, content)

        # 4. AUDITORÍA
        elif "diagnostico_global" in content:
            doc.add_heading("Reporte de Auditoría", 1)
            doc.add_paragraph(f"Diagnóstico: {content.get('diagnostico_global')}")
            p = doc.add_paragraph(f"Score: {content.get('score_coherencia')}%")
            if content.get('score_coherencia', 0) < 60: p.runs[0].font.color.rgb = RGBColor(255, 0, 0)

        # 5. NEE / OTROS
        elif "estrategias" in content:
            doc.add_heading(f"Adecuación: {content.get('diagnosis')}", 1)
            doc.add_paragraph(f"Barrera: {content.get('barrier')}")
            est = content.get('estrategias', {})
            doc.add_heading("Acceso", 2); doc.add_paragraph(est.get('acceso', ''))
            doc.add_heading("Actividad", 2); doc.add_paragraph(est.get('actividad', ''))
            doc.add_heading("Evaluación", 2); doc.add_paragraph(est.get('evaluacion', ''))

        # 6. DEFAULT
        else:
             doc.add_paragraph(json.dumps(content, indent=4, ensure_ascii=False))

        file_stream = io.BytesIO(); doc.save(file_stream); file_stream.seek(0)
        filename = f"{req.titulo_unidad}.docx".replace(" ", "_")
        return StreamingResponse(file_stream, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename={filename}"})
    except Exception as e:
        print(f"Error: {e}")

# ==========================================
# EXECUTIVE REPORT RENDERER (PREMIUM)
# ==========================================
class ExecutiveDocxRequest(BaseModel):
    systemic_summary: str
    top_3_gaps: List[str]
    recommended_training: Union[str, List[Dict[str, Any]]]
    rigor_audit: Optional[Dict[str, Any]] = None
    heatmap: Optional[Dict[str, float]] = None
    global_metrics: Optional[Dict[str, Any]] = None
    highlights: Optional[Dict[str, Any]] = None

def get_color_for_score(score: float, invert: bool = False) -> str:
    """Returns a hex color based on the score (1-4 scale or percentages)."""
    # Percentage scale (0-100)
    if score > 4:
        if score >= 80: return "F0FDF4" if not invert else "FEF2F2" # Green / Red
        if score >= 60: return "FEFCE8" # Yellow
        return "FEF2F2" if not invert else "F0FDF4" # Red / Green
    
    # 1-4 scale
    if score >= 3.2: return "F0FDF4" if not invert else "FEF2F2"
    if score >= 2.6: return "FEFCE8"
    return "FEF2F2" if not invert else "F0FDF4"

def renderizar_reporte_ejecutivo(doc, data):
    # --- PÁGINA 1: PORTADA ---
    # Add spacing for vertical centering
    for _ in range(5): doc.add_paragraph()
    
    title = doc.add_heading("REPORTE EJECUTIVO INSTITUCIONAL", level=1)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in title.runs:
        run.font.size = Pt(24)
        run.font.color.rgb = RGBColor(27, 60, 115) # #1B3C73
        
    subtitle = doc.add_paragraph("Análisis de Inteligencia Pedagógica")
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.runs[0].font.size = Pt(16)
    subtitle.runs[0].font.color.rgb = RGBColor(42, 89, 168) # #2A59A8
    
    for _ in range(3): doc.add_paragraph()
    
    if data.global_metrics:
        t_cover = doc.add_table(rows=1, cols=3)
        t_cover.style = 'Table Grid'
        t_cover.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        c1, c2, c3 = t_cover.rows[0].cells
        style_header_cell(c1, "DOCENTES EN PLANTA", "1B3C73", "FFFFFF")
        c1.add_paragraph(str(data.global_metrics.get('total_teachers', 0))).alignment = WD_ALIGN_PARAGRAPH.CENTER
        c1.paragraphs[1].runs[0].font.size = Pt(18); c1.paragraphs[1].runs[0].bold = True
        
        style_header_cell(c2, "COBERTURA", "A1C969", "FFFFFF")
        c2.add_paragraph(f"{data.global_metrics.get('coverage_percent', 0)}%").alignment = WD_ALIGN_PARAGRAPH.CENTER
        c2.paragraphs[1].runs[0].font.size = Pt(18); c2.paragraphs[1].runs[0].bold = True
        
        style_header_cell(c3, "CICLOS CERRADOS", "C87533", "FFFFFF")
        c3.add_paragraph(str(data.global_metrics.get('total_completed', 0))).alignment = WD_ALIGN_PARAGRAPH.CENTER
        c3.paragraphs[1].runs[0].font.size = Pt(18); c3.paragraphs[1].runs[0].bold = True
        
    doc.add_page_break()

    # --- PÁGINA 2: DIAGNÓSTICO Y HEATMAP ---
    doc.add_heading("I. Diagnóstico Sistémico", level=2)
    p = doc.add_paragraph(data.systemic_summary)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # --- PÁGINA 3: ESTRUCTURA DE ACOMPAÑAMIENTO Y DEPARTAMENTOS ---
    if data.global_metrics and "structural" in data.global_metrics:
        doc.add_page_break()
        doc.add_heading("II. Estructura de Acompañamiento", level=2)
        doc.add_paragraph("Relación de docentes acompañados frente al equipo de evaluadores activos en este período.")
        
        struct_data = data.global_metrics["structural"]
        
        t_struct = doc.add_table(rows=1, cols=2)
        t_struct.style = 'Table Grid'
        t_struct.autofit = False
        t_struct.columns[0].width = Inches(2.75)
        t_struct.columns[1].width = Inches(2.75)
        
        c1, c2 = t_struct.rows[0].cells
        style_header_cell(c1, "EVALUADORES ACTIVOS", "1B3C73", "FFFFFF")
        style_header_cell(c2, "DOCENTES ACOMPAÑADOS", "1B3C73", "FFFFFF")
        
        row_struct = t_struct.add_row().cells
        row_struct[0].text = str(struct_data.get("unique_observers", 0))
        row_struct[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row_struct[1].text = str(struct_data.get("unique_teachers", 0))
        row_struct[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        doc.add_paragraph()
        
        depts = struct_data.get("departments", {})
        if depts:
            doc.add_heading("Distribución por Departamentos", level=3)
            doc.add_paragraph("Volumen de observaciones completadas según el departamento al que pertenece el docente.")
            
            t_dept = doc.add_table(rows=1, cols=2)
            t_dept.style = 'Table Grid'
            t_dept.autofit = False
            t_dept.columns[0].width = Inches(4.0)
            t_dept.columns[1].width = Inches(1.5)
            
            hdr_dept = t_dept.rows[0].cells
            style_header_cell(hdr_dept[0], "Departamento", "A1C969", "FFFFFF")
            style_header_cell(hdr_dept[1], "Nº Obs.", "A1C969", "FFFFFF")
            
            # Sort by count descending
            for d_name, count in sorted(depts.items(), key=lambda x: x[1], reverse=True):
                r_dept = t_dept.add_row().cells
                r_dept[0].text = str(d_name).title()
                r_dept[1].text = str(count)
                r_dept[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

    if data.heatmap:
        doc.add_page_break()
        doc.add_heading("III. Pulso Cuantitativo (Heatmap)", level=2)
        doc.add_paragraph("El siguiente mapa de calor muestra el promedio institucional (en escala 1 a 4) para las distintas dimensiones observadas.")
        
        table = doc.add_table(rows=1, cols=2)
        table.style = 'Table Grid'
        table.autofit = False
        table.columns[0].width = Inches(4.0)
        table.columns[1].width = Inches(1.5)
        
        hdr_cells = table.rows[0].cells
        style_header_cell(hdr_cells[0], "Dimensión Pedagógica", "1B3C73", "FFFFFF")
        style_header_cell(hdr_cells[1], "Puntaje (1-4)", "1B3C73", "FFFFFF")
        
        # Sort heatmap by value (descending) to show strengths first
        sorted_heatmap = sorted(data.heatmap.items(), key=lambda x: x[1], reverse=True)
        
        for k, v in sorted_heatmap:
            row_cells = table.add_row().cells
            row_cells[0].text = k.replace("_", " ").title()
            row_cells[0].paragraphs[0].runs[0].bold = True
            
            row_cells[1].text = f"{v:.1f}"
            row_cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row_cells[1].paragraphs[0].runs[0].bold = True
            
            # Apply color to the score cell
            bg_color = get_color_for_score(v)
            set_cell_background(row_cells[1], bg_color)
            
    doc.add_page_break()

    # --- PÁGINA X: MATRIZ DE ACCIÓN ---
    doc.add_page_break()
    doc.add_heading("IV. Matriz de Acción Estratégica", level=2)
    
    # Brechas
    p_brechas = doc.add_paragraph()
    p_brechas.add_run("Principales Brechas Detectadas").bold = True
    for i, gap in enumerate(data.top_3_gaps):
        doc.add_paragraph(f"{gap}", style='List Number')
        
    doc.add_paragraph()
    
    # Matriz de Capacitación
    p_cap = doc.add_paragraph()
    p_cap.add_run("Plan de Intervención Recomendado").bold = True
    
    training_list = data.recommended_training
    
    if isinstance(training_list, list) and len(training_list) > 0:
        t_action = doc.add_table(rows=1, cols=4)
        t_action.style = 'Table Grid'
        t_action.autofit = False
        
        # Set column widths roughly
        t_action.columns[0].width = Inches(1.5)
        t_action.columns[1].width = Inches(1.5)
        t_action.columns[2].width = Inches(2.2)
        t_action.columns[3].width = Inches(1.3)
        
        style_header_cell(t_action.cell(0,0), "Iniciativa (Foco)", "C87533", "FFFFFF")
        style_header_cell(t_action.cell(0,1), "Objetivo Esperado", "C87533", "FFFFFF")
        style_header_cell(t_action.cell(0,2), "Metodología de Implem.", "C87533", "FFFFFF")
        style_header_cell(t_action.cell(0,3), "KPI de Éxito", "C87533", "FFFFFF")
        
        for item in training_list:
            if not isinstance(item, dict): continue
            row = t_action.add_row().cells
            
            row[0].text = item.get("foco", "")
            row[0].paragraphs[0].runs[0].bold = True
            
            row[1].text = item.get("objetivo", "")
            row[2].text = item.get("metodologia", "")
            
            row[3].text = item.get("kpi", "")
            row[3].paragraphs[0].runs[0].italic = True
    else:
        doc.add_paragraph(str(training_list), style='Quote')

    # --- PÁGINA X: ANEXOS Y CUADRO DE HONOR ---
    if data.highlights or data.rigor_audit:
        doc.add_page_break()
        doc.add_heading("V. Anexos y Destacados", level=2)

    if data.highlights:
        # Cuadro de Honor
        t_honor = doc.add_table(rows=1, cols=2)
        t_honor.autofit = False
        t_honor.columns[0].width = Inches(3.0)
        t_honor.columns[1].width = Inches(3.0)
        c_left, c_right = t_honor.rows[0].cells
        
        # Left: Top Teachers
        style_header_cell(c_left, "CUADRO DE HONOR: DOCENTES CON MAYOR MEJORA", "A1C969", "FFFFFF")
        top_t = data.highlights.get('top_teachers', [])
        if top_t:
            for t in top_t:
                c_left.add_paragraph(f"• {t.get('name')} (+{t.get('score')} pts)")
        else:
            c_left.add_paragraph("No hay datos en este período.", style='Italic')
            
        # Right: Top Observers
        style_header_cell(c_right, "LIDERAZGO PEDAGÓGICO: ACOMPAÑANTES DESTACADOS", "2A59A8", "FFFFFF")
        top_o = data.highlights.get('top_observers', [])
        if top_o:
            for o in top_o:
                c_right.add_paragraph(f"• {o.get('name')} (KPI: {o.get('kpi_score')})")
        else:
            c_right.add_paragraph("No hay datos en este período.", style='Italic')
            
        doc.add_paragraph()

    # Auditoría Final
    if data.rigor_audit:
        p_rigor = doc.add_paragraph()
        run = p_rigor.add_run("Auditoría de Rigor del Proceso de Evaluación:")
        run.bold = True
        
        t_rigor = doc.add_table(rows=1, cols=3)
        t_rigor.style = 'Table Grid'
        
        c1, c2, c3 = t_rigor.rows[0].cells
        style_header_cell(c1, "Índice de Profundidad", "EFEFEF", "000000")
        c1.add_paragraph(f"{data.rigor_audit.get('depth_index', 0)}%").alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        style_header_cell(c2, "Estado (IA)", "EFEFEF", "000000")
        alert = data.rigor_audit.get('alert', False)
        status_text = "ALERTA" if alert else "ÓPTIMO"
        c2.add_paragraph(status_text).alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_cell_background(c2, "FEF2F2" if alert else "F0FDF4")
        
        style_header_cell(c3, "Muestra Analizada", "EFEFEF", "000000")
        c3.add_paragraph(f"{data.rigor_audit.get('sample_size', 0)} obs.").alignment = WD_ALIGN_PARAGRAPH.CENTER

@router.post("/export/executive-docx")
async def export_executive_docx(req: ExecutiveDocxRequest):
    try:
        doc = Document()
        # Modificar logo original solo si es necesario, o lo metemos con la portada arriba
        add_header_logo(doc, "Dirección Académica", "Institucional", "Reporte Confidencial")
        renderizar_reporte_ejecutivo(doc, req)
        
        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        
        return StreamingResponse(
            file_stream, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
            headers={"Content-Disposition": "attachment; filename=reporte_ejecutivo.docx"}
        )
    except Exception as e:
        print(f"Error DOCX: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### Router: `lectura_inteligente.py`
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURACIÓN IA ---
MODEL_NAME = "gemini-2.5-flash" 
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("⚠️ ERROR: No se encontró GOOGLE_API_KEY en el .env")

genai.configure(api_key=api_key)

router = APIRouter(
    prefix="/lectura-inteligente",
    tags=["Lectura Inteligente"]
)

# --- MODELOS DE DATOS ---
class GenerarTextoRequest(BaseModel):
    nivel: str
    asignatura: str
    oa: str
    tipo_texto: str = "Informativo"
    extension_texto: str = "Media (300-500 palabras)"

class GenerarPreguntasRequest(BaseModel):
    nivel: str
    asignatura: str
    oa: str
    texto: str
    num_preguntas: int = 10

class PreguntaContexto(BaseModel):
    nivel_taxonomico: str
    pregunta: str
    alternativas: List[str]
    respuesta_correcta: str
    justificacion: str

class RegenerarPreguntaRequest(BaseModel):
    nivel: str
    asignatura: str
    oa: str
    texto: str
    nivel_taxonomico_deseado: str # Ej: "Nivel I (Local)"

# --- ENDPOINTS ---

@router.post("/generar-texto")
async def generar_texto(request: GenerarTextoRequest):
    try:
        print(f"🧠 Generando texto con {MODEL_NAME}...")
        
        model = genai.GenerativeModel(model_name=MODEL_NAME)

        prompt = f"""
        ACTÚA COMO: Un experto creador de material pedagógico para estudiantes de {request.nivel} de la asignatura de {request.asignatura}.
        
        OBJETIVO:
        El docente seleccionó el siguiente Objetivo de Aprendizaje (OA):
        "{request.oa}"

        TAREA:
        Escribe un texto de tipo {request.tipo_texto} (siempre que tenga sentido con la asignatura y el OA) 
        que sirva como base para una actividad de comprensión lectora.
        
        REQUISITOS:
        1. El vocabulario y la complejidad deben ser adecuados para estudiantes de {request.nivel}.
        2. El texto debe tener una extensión {request.extension_texto}.
        3. Debe conectar clara y directamente con el Objetivo de Aprendizaje.
        4. Debe ser original, atractivo e interesante para los estudiantes.
        
        RETORNO:
        Devuelve ÚNICAMENTE el texto generado, sin introducciones ni comentarios adicionales. No uses formato Markdown como ```texto, solo el contenido directamente.
        """

        response = await model.generate_content_async(prompt)
        texto_generado = response.text.strip()
            
        return {"texto": texto_generado}

    except Exception as e:
        print(f"❌ Error en IA (generar texto): {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generar-preguntas")
async def generar_preguntas(request: GenerarPreguntasRequest):
    try:
        print(f"🧠 Generando {request.num_preguntas} preguntas con {MODEL_NAME}...")
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )

        n1 = int(round(request.num_preguntas * 0.3))
        n2 = int(round(request.num_preguntas * 0.4))
        n3 = request.num_preguntas - n1 - n2

        prompt = f"""
        ACTÚA COMO: Evaluador experto en diseño instruccional y construcción de instrumentos de evaluación.
        
        NIVEL: {request.nivel}
        ASIGNATURA: {request.asignatura}
        OBJETIVO DE APRENDIZAJE: {request.oa}
        
        TEXTO BASE:
        "{request.texto}"
        
        TAREA:
        A partir del TEXTO BASE proporcionado, diseña {request.num_preguntas} ítems (preguntas) de selección múltiple con 4 alternativas (A, B, C, D) cada uno.
        
        DISTRIBUCIÓN TAXONÓMICA EXIGIDA:
        - {n1} preguntas de Nivel I (Local / Extracción de información explícita).
        - {n2} preguntas de Nivel II (Relacional / Inferencia, relación de ideas).
        - {n3} preguntas de Nivel III (Reflexivo / Evaluación, propósito, reflexión crítica).
        
        FORMATO DE SALIDA DEBE SER ESTRICTAMENTE JSON:
        {{
            "preguntas": [
                {{
                    "id": "1",
                    "nivel_taxonomico": "Nivel I (Local)", 
                    "pregunta": "Texto de la pregunta...",
                    "alternativas": ["opcion A", "opcion B", "opcion C", "opcion D"],
                    "respuesta_correcta": "opcion C",
                    "justificacion": "Explicación pedagógica de por qué esta es la respuesta correcta basada en el texto y el OA..."
                }}
            ]
        }}
        """

        response = await model.generate_content_async(prompt)
        resultado = response.text.strip()
        
        # Limpieza robusta
        if resultado.startswith("```"):
            resultado = resultado.replace("```json", "").replace("```", "").strip()
            
        return json.loads(resultado)

    except Exception as e:
        print(f"❌ Error en IA (generar preguntas): {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/regenerar-pregunta")
async def regenerar_pregunta(request: RegenerarPreguntaRequest):
    try:
        print(f"🧠 Regenerando pregunta ({request.nivel_taxonomico_deseado}) con {MODEL_NAME}...")
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = f"""
        ACTÚA COMO: Evaluador experto en diseño instruccional.
        
        NIVEL: {request.nivel}
        ASIGNATURA: {request.asignatura}
        OBJETIVO DE APRENDIZAJE: {request.oa}
        
        TEXTO BASE:
        "{request.texto}"
        
        TAREA:
        El docente ha solicitado generar UNA (1) nueva pregunta de selección múltiple basada en el TEXTO BASE.
        Esta nueva pregunta DEBE SER estrictamente de Nivel Taxonómico: {request.nivel_taxonomico_deseado}.
        Debe tener 4 alternativas (A, B, C, D).
        
        DEFINICIÓN DEL NIVEL SOLICITADO:
        - Nivel I (Local): Extracción de información explícita.
        - Nivel II (Relacional): Inferencia, relación de ideas, deducción.
        - Nivel III (Reflexivo): Evaluación, propósito, reflexión crítica, aplicación.
        
        FORMATO DE SALIDA ESTRICTAMENTE JSON:
        {{
            "pregunta_nueva": {{
                "id": "temporal",
                "nivel_taxonomico": "{request.nivel_taxonomico_deseado}", 
                "pregunta": "Texto de la NUEVA pregunta...",
                "alternativas": ["opcion A", "opcion B", "opcion C", "opcion D"],
                "respuesta_correcta": "opcion B",
                "justificacion": "Explicación pedagógica de por qué esta es la respuesta correcta basada en el texto..."
            }}
        }}
        """

        response = await model.generate_content_async(prompt)
        resultado = response.text.strip()
        
        # Limpieza robusta
        if resultado.startswith("```"):
            resultado = resultado.replace("```json", "").replace("```", "").strip()
            
        return json.loads(resultado)

    except Exception as e:
        print(f"❌ Error en IA (regenerar pregunta): {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

```

### Router: `login.py`
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()
router = APIRouter()

# --- CONEXIÓN SUPABASE ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- MODELO DE DATOS ---
class LoginRequest(BaseModel):
    email: str
    password: str

# --- ENDPOINT LOGIN (YA LO TIENES) ---
@router.post("/auth/login")
def login_user(credentials: LoginRequest):
    if not supabase: raise HTTPException(status_code=500, detail="Error servidor")
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        return {"status": "success", "user": {"id": response.user.id, "email": response.user.email}, "session": {"access_token": response.session.access_token}}
    except Exception as e:
        print(f"❌ Error Login: {e}")
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

# --- ENDPOINT REGISTRO (NUEVO) ---
@router.post("/auth/register")
def register_user(credentials: LoginRequest):
    if not supabase: raise HTTPException(status_code=500, detail="Error servidor")
    try:
        # Crea el usuario en Supabase Auth
        response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password
        })
        
        # OJO: Supabase puede requerir confirmar email. 
        # Si response.user existe pero response.session es None, falta confirmar email.
        if response.user and not response.session:
            return {"status": "pending_confirmation", "message": "Usuario creado. Revisa tu correo para confirmar."}
            
        return {"status": "success", "user": {"id": response.user.id, "email": response.user.email}, "session": {"access_token": response.session.access_token}}
        
    except Exception as e:
        print(f"❌ Error Registro: {e}")
        raise HTTPException(status_code=400, detail="Error al crear usuario. Puede que ya exista.")
```

### Router: `mentor.py`
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import google.generativeai as genai
import os
from datetime import datetime
import locale
from dotenv import load_dotenv
from supabase import create_client, Client

# Configurar idioma para la fecha (intento robusto)
try:
    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_TIME, 'es_ES')
    except:
        pass 

load_dotenv()
router = APIRouter()

# --- CONFIGURACIÓN DE APIS ---
api_key = os.getenv("GOOGLE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if api_key:
    genai.configure(api_key=api_key)

# Cliente de Supabase
supabase: Client = create_client(supabase_url, supabase_key)

# --- MODELOS DE DATOS ---
class ChatMessage(BaseModel):
    role: str 
    content: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    user_name: str | None = "Docente"

# --- UTILIDAD: GENERAR EMBEDDING ---
def get_query_embedding(text: str):
    # Usamos text-embedding-004 para búsquedas precisas
    # IMPORTANTE: task_type='retrieval_query' y SIN title
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_query"
    )
    return result['embedding']

# --- PERSONALIDAD REFORZADA (Con Pragmatismo Didáctico) ---
fecha_hoy = datetime.now().strftime("%A %d de %B de %Y")

def get_system_prompt(nombre_usuario="Docente"):
    return f"""
ROL: Eres 'Mentor IC', el consejero pedagógico y pastoral del Colegio Madre Paulina de Chiguayante.
FECHA: {fecha_hoy}.
USUARIO: Estás hablando con {nombre_usuario}. Llámalo por su nombre de vez en cuando para generar cercanía.

TUS 4 PILARES FUNDAMENTALES:

1. **RAÍCES Y ALAS:** Valora la identidad local (Chiguayante, Río Biobío), pero conéctala con lo universal para ampliar el bagaje cultural de los estudiantes.
2. **IDENTIDAD CATÓLICA:** Eres acogedor y ético. Si es pertinente al contexto, ofrece una breve "píldora de luz" basada en el Evangelio o valores cristianos, pero sin ser invasivo.
3. **EXPERTO INSTITUCIONAL (Rigor):** Tus respuestas se basan estrictamente en la DOCUMENTACIÓN OFICIAL (RICE, PEI) cuando está disponible.
   - *Regla de Honestidad:* Si no encuentras una norma específica en el texto recuperado, DILO claramente ("No encontré un artículo específico, pero..."). NO inventes citas.

4. **PRAGMATISMO DIDÁCTICO (Nuevo):**
   - Cuando sugieras una idea pedagógica, NO te quedes en la teoría. Propón una **Estrategia Didáctica Concreta** (ej: Rutina de Pensamiento, Debate, ABP, Cuadro Comparativo).
   - Explica el "Cómo": da un ejemplo breve de la actividad paso a paso.
   - Conexión Curricular: Si el tema es académico, vincúlalo implícitamente con los **Objetivos de Aprendizaje (OA)** del Currículum Nacional chileno (ej: "Esto tributa al OA de Lectura Crítica...").

ESTILO:
- Usa Markdown (Negritas, listas) para facilitar la lectura rápida.
- Sé breve, amable y siempre invita a la acción ("¿Te animas a probar esta estrategia?").
"""

@router.post("/chat-mentor")
async def chat_mentor(req: ChatRequest):
    try:
        # 1. Identificar la última pregunta del usuario
        if not req.history:
            return {"response": f"Hola {req.user_name}, soy Mentor IC. ¿En qué puedo ayudarte hoy?"}
            
        ultima_pregunta = req.history[-1].content
        
        # 2. BUSCAR EN SUPABASE (RAG)
        rag_data = []
        try:
            # Generamos el vector de búsqueda
            query_vector = get_query_embedding(ultima_pregunta)
            
            # Consultamos la Base de Datos
            matches = supabase.rpc(
                "match_documents", 
                {
                    "query_embedding": query_vector,
                    "match_threshold": 0.4, 
                    "match_count": 4
                }
            ).execute()
            
            rag_data = matches.data
        except Exception as e_rag:
            print(f"⚠️ Advertencia RAG (Continuando sin contexto): {e_rag}")
            rag_data = []

        # 3. Construir el Contexto Institucional
        contexto_institucional = ""
        if rag_data:
            contexto_institucional = "\n\n--- DOCUMENTACIÓN INSTITUCIONAL ENCONTRADA (Prioriza esta información para lo normativo) ---\n"
            for match in rag_data:
                source = match.get('metadata', {}).get('source', 'Documento Interno')
                content = match.get('content', '').replace("\n", " ")
                contexto_institucional += f"FUENTE: {source}\nFRAGMENTO: {content}\n\n"
        
        # 4. Armar el Prompt Completo
        SYSTEM_PROMPT = get_system_prompt(req.user_name)
        full_prompt = SYSTEM_PROMPT + contexto_institucional + "\n--- HISTORIAL DE CONVERSACIÓN ---\n"
        
        for msg in req.history:
            role_label = req.user_name.upper() if msg.role == "user" else "MENTOR IC"
            full_prompt += f"{role_label}: {msg.content}\n"
            
        full_prompt += "MENTOR IC (Responde con calidez, rigor técnico y estrategias prácticas):"

        # 5. Generar Respuesta con IA
        try:
            # INTENTO 1: GEMINI 2.5 FLASH
            model = genai.GenerativeModel('gemini-2.5-flash') 
            response = model.generate_content(full_prompt)
            return {"response": response.text}
        except Exception as e_primary:
            print(f"⚠️ Error con modelo principal: {e_primary}. Intentando fallback...")
            
            # INTENTO 2: GEMINI 1.5 FLASH (Fallback con Safety Settings)
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            ]
            model = genai.GenerativeModel('gemini-1.5-flash', safety_settings=safety_settings) 
            response = model.generate_content(full_prompt)
            
            if response.parts:
                return {"response": response.text}
            else:
                print("⚠️ El modelo fallback devolvió una respuesta vacía.")
                return {"response": "Lo siento, mi conexión neuronal parpadeó. ¿Podrías reformular la pregunta?"}

    except Exception as e:
        print(f"❌ Error Crítico en Mentor: {e}")
        return {"response": "Lo siento, tuve un problema técnico procesando tu consulta. Por favor, inténtalo de nuevo en unos segundos."}
```

### Router: `nee.py`
```python
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
import google.generativeai as genai
import os
import json
import re
import io
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

# Configuración API
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- MODELOS DE DATOS ---
class NeeRequest(BaseModel):
    grade: str
    subject: str
    diagnosis: str      # Ej: TEA, TDAH, FIL
    barrier: str        # Ej: Le molestan los ruidos, no lee fluido...
    activity: str       # La actividad original

class Estrategias(BaseModel):
    acceso: str         # Estrategias previas / ambiente
    actividad: str      # Adaptación de la tarea
    evaluacion: str     # Forma de evaluar

class DownloadRequest(BaseModel):
    grade: str
    subject: str
    diagnosis: str
    barrier: str
    activity: str
    estrategias: Estrategias
    estrategias: Estrategias
    dua_principles: str # Breve explicación de qué principios DUA se usan

# --- MODELOS PARA GENERACIÓN DUA ---
class DUARequest(BaseModel):
    planificacion_original: str
    contexto_estudiante: str

class VariantesDUA(BaseModel):
    visual_espacial: str
    kinestesica: str
    focalizada: str


# --- PROMPT ESPECIALISTA EN INCLUSIÓN ---
SYSTEM_PROMPT = """
ROL: Eres un Experto en Educación Diferencial y DUA (Diseño Universal de Aprendizaje) del 'Colegio Madre Paulina'.
MISIÓN: Recibes una actividad de clase y un perfil de estudiante (NEE Transitoria o Permanente). Debes generar adecuaciones curriculares prácticas para el aula.

ENTRADA:
- Curso y Asignatura
- Diagnóstico (Ej: TEA, TDAH)
- Barrera Específica (Lo que le cuesta al estudiante)
- Actividad Original

TU TAREA (JSON Estricto):
Genera una respuesta estructurada con enfoque de AULA (Práctico, no burocrático):

1. **Principios DUA:** Breve línea citando qué principio aplicas (Representación, Acción/Expresión, Compromiso).
2. **Estrategia de Acceso (Antes):** ¿Qué cambiar en el ambiente, materiales o ubicación? (Ej: Uso de audífonos, material concreto, anticipación visual).
3. **Adecuación de la Actividad (Durante):** Modificación de la instrucción o tarea. Si es TEA/Permanente, considera simplificar objetivos si es necesario.
4. **Evaluación Diversificada (Cierre):** ¿Cómo puede demostrar aprendizaje de otra forma? (Ej: Oral en vez de escrito, dibujo, maqueta).

FORMATO JSON:
{
  "dua_principles": "Texto breve...",
  "estrategias": {
    "acceso": "Texto detallado...",
    "actividad": "Texto detallado...",
    "evaluacion": "Texto detallado..."
  }
}
"""

@router.post("/nee/generate")
async def generate_nee_strategies(req: NeeRequest):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        CONTEXTO:
        - Curso: {req.grade}
        - Asignatura: {req.subject}
        - Diagnóstico: {req.diagnosis}
        - Barrera Principal: "{req.barrier}"
        - Actividad Original: "{req.activity}"

        Genera las adecuaciones prácticas en JSON. Sé empático y concreto.
        """
        
        response = model.generate_content(SYSTEM_PROMPT + prompt)
        
        # Limpieza de JSON
        texto_limpio = response.text
        if "```" in texto_limpio:
            texto_limpio = re.sub(r"```json\s*", "", texto_limpio)
            texto_limpio = re.sub(r"```\s*$", "", texto_limpio)
        
        data = json.loads(texto_limpio.strip())
        return data

    except Exception as e:
        print(f"❌ Error NEE: {e}")
        return {
            "dua_principles": "Error generando análisis.",
            "estrategias": {
                "acceso": "Intenta simplificar la descripción de la barrera.",
                "actividad": "",
                "evaluacion": ""
            }
            }


# --- GENERADOR DUA (NUEVO endpoint) ---
@router.post("/nee/generate-dua")
async def generate_dua_variants(req: DUARequest):
    try:
        print(f"🧩 [NEE] Generando DUA para: {req.contexto_estudiante}")
        
        prompt = f"""
        ACTÚA COMO ESPECIALISTA EN EDUCACIÓN DIFERENCIAL.
        
        INPUT:
        1. PLANIFICACIÓN BASE:
        "{req.planificacion_original}"
        
        2. CONTEXTO DEL ESTUDIANTE:
        "{req.contexto_estudiante}"
        
        TAREA:
        Genera 3 variantes de adecuación curricular para la actividad principal de esta planificación.
        
        SALIDA JSON ESTRICTA:
        {{
            "visual_espacial": "Descripción de estrategia con apoyo visual/gráfico...",
            "kinestesica": "Descripción de estrategia manipulativa/corporal...",
            "focalizada": "Estrategia específica y simplificada para el perfil descrito..."
        }}
        """

        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        
        return json.loads(response.text)

    except Exception as e:
        print(f"❌ Error DUA: {e}")
        return {
            "visual_espacial": "Error generando variante visual.",
            "kinestesica": "Error generando variante kinestésica.",
            "focalizada": "Error generando variante focalizada."
        }


# --- EXPORTACIÓN A WORD ---
@router.post("/nee/download")
async def download_nee_docx(data: DownloadRequest):
    try:
        doc = Document()
        
        # Título
        title = doc.add_heading('Asistente de Inclusión & DUA', 0)
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Datos del Estudiante
        doc.add_heading('1. Contexto del Estudiante', level=1)
        doc.add_paragraph(f"Curso: {data.grade} | Asignatura: {data.subject}")
        p = doc.add_paragraph()
        p.add_run("Diagnóstico/Condición: ").bold = True
        p.add_run(data.diagnosis)
        p = doc.add_paragraph()
        p.add_run("Barrera Detectada: ").bold = True
        p.add_run(data.barrier)

        # Actividad Original
        doc.add_heading('2. Actividad Original', level=1)
        doc.add_paragraph(data.activity)

        # Adecuaciones
        doc.add_heading('3. Estrategias de Adecuación Curricular', level=1)
        
        p = doc.add_paragraph()
        p.add_run("Enfoque DUA: ").bold = True
        p.add_run(data.dua_principles).italic = True

        doc.add_heading('A. Adecuación de Acceso (Preparación)', level=2)
        doc.add_paragraph(data.estrategias.acceso)

        doc.add_heading('B. Adecuación de la Actividad (Desarrollo)', level=2)
        doc.add_paragraph(data.estrategias.actividad)

        doc.add_heading('C. Evaluación Diversificada', level=2)
        doc.add_paragraph(data.estrategias.evaluacion)

        # Footer
        section = doc.sections[0]
        footer = section.footer
        p = footer.paragraphs[0]
        p.text = "Documento generado por ProfeIC - Colegio Madre Paulina"

        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": "attachment; filename=Adecuacion_Curricular.docx"}
        )

    except Exception as e:
        print(f"❌ Error DOCX NEE: {e}")
        raise HTTPException(status_code=500, detail="Error generando documento")
```

### Router: `planificador.py`
```python
from fastapi import APIRouter
from pydantic import BaseModel
# Eliminamos "List" y "Optional" de typing porque daban problemas en Python 3.14
import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv

# Configuración Inicial
load_dotenv()
router = APIRouter()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- MODELOS (MODERNIZADOS PARA PYTHON 3.14) ---
from typing import List, Optional, Dict, Union

# ...

# --- MODELOS (COMPATIBLE CON TODAS LAS VERSIONES) ---
class GenerateRequest(BaseModel):
    nivel: str
    asignatura: str
    oas_mochila: List[str]            
    valor_panel: str
    actitud_especifica: str
    medio_usuario: Optional[str] = None  
    num_clases: int
    modo_distribucion: str
    perfil_usuario: Optional[Dict] = None # <--- DATO NUEVO

# Forzamos la reconstrucción del modelo para evitar el error "not fully defined"
GenerateRequest.model_rebuild()

# --- HERRAMIENTA DE LIMPIEZA "QUIRÚRGICA" V4 ---
def limpiar_y_reparar_json(texto_sucio):
    print(f"🧹 [Planificador] Limpiando respuesta (len: {len(texto_sucio)})...")
    
    texto = re.sub(r'```json\s*', '', texto_sucio)
    texto = re.sub(r'```\s*', '', texto)
    
    inicio = texto.find("{")
    fin = texto.rfind("}")
    
    if inicio == -1 or fin == -1:
        return None
    
    texto_limpio = texto[inicio : fin + 1]
    
    # REPARACIÓN LATEX
    texto_limpio = re.sub(r'(?<!\\)\\(?!["\\/bfnrtu])', r'\\\\', texto_limpio)

    try:
        return json.loads(texto_limpio)
    except json.JSONDecodeError:
        try:
            return json.loads(texto_limpio + "}") 
        except:
            return None

# --- ENDPOINT ---
@router.post("/api/generate")
async def generar_planificacion(request: GenerateRequest):
    print(f"⚡ [PLANIFICADOR] Procesando: {request.nivel} | {request.asignatura}")
    
    try:
        if not api_key: return {"error": "Falta API Key"}
        
        # --- LOGICA DE CONTEXTO ---
        contexto_docente = ""
        instrucciones_extra = ""
        
        if request.perfil_usuario:
            p = request.perfil_usuario
            print(f"👤 [Contexto] Aplicando perfil de: {p.get('full_name', 'Docente')}")
            
            # 1. Estilo y Dinámica
            estilo_ia = p.get('estilo_ia', 'formal')
            estilo_trabajo = p.get('estilo_trabajo', 'colaborativo')
            
            if estilo_ia == 'cercano':
                instrucciones_extra += "- TONO: Usa un lenguaje cercano, motivador y cálido. Evita tecnicismos excesivos.\n"
            elif estilo_ia == 'socratico':
                instrucciones_extra += "- ENFOQUE: Prioriza preguntas reflexivas en el inicio y cierre. Guía al descubrimiento.\n"
                
            if estilo_trabajo == 'caos':
                instrucciones_extra += "- DINÁMICA: Propón actividades de alto movimiento, ruido productivo y debate.\n"
            elif estilo_trabajo == 'silencio':
                instrucciones_extra += "- DINÁMICA: Prioriza el trabajo individual enfocado y análisis profundo en silencio.\n"
            elif estilo_trabajo == 'movimiento':
                instrucciones_extra += "- DINÁMICA: Incluye pausas activas o aprendizaje kinestésico.\n"

            # 2. Infraestructura (Limitantes o Potenciadores)
            infra = p.get('infraestructura', [])
            if "pizarra" in infra and len(infra) == 1:
                instrucciones_extra += "- RECURSOS: El aula es ANÁLOGA. Solo usa pizarra y papel. NO sugieras videos ni apps.\n"
            elif "proyector" in infra or "internet" in infra:
                instrucciones_extra += "- RECURSOS: Aprovecha apoyo audiovisual y digital si es pertinente.\n"
                
            # 3. Desafíos (Prioridades)
            desafios = p.get('desafios', [])
            otro_desafio = p.get('otro_desafio', '')
            
            if "Disminuir carga administrativa" in desafios:
                instrucciones_extra += "- EVALUACIÓN: Diseña tickets de salida muy breves y fáciles de corregir.\n"
            if "Implementar DUA" in desafios:
                instrucciones_extra += "- INCLUSIÓN: Explicita múltiples formas de representación en el desarrollo.\n"
                
            if otro_desafio:
                instrucciones_extra += f"- META ESPECÍFICA DEL DOCENTE: {otro_desafio}\n"
                
            contexto_docente = f"""
            CONTEXTO DEL DOCENTE (PERSONALIZACIÓN):
            {instrucciones_extra}
            """

        # --- MODELO SOCIOCOGNITIVO & MBE (Marco para la Buena Enseñanza) ---
        ESTRUCTURA_UNIVERSAL = """
        ESTRUCTURA UNIVERSAL DE CLASE (MARCO PARA LA BUENA ENSEÑANZA):
        Independiente del modelo, TODA clase debe tener obligatoriamente:
        1. INICIO: Declaración de objetivo, motivación y activación.
        2. DESARROLLO: Experiencia de aprendizaje central.
        3. CIERRE: Verificación de logros y metacognición.
        """

        if request.modo_distribucion == "Ciclo Completo":
            ESTRATEGIA_CMP = f"""
            {ESTRUCTURA_UNIVERSAL}
            
            DISTRIBUCIÓN DE LOS 7 MOMENTOS CMP (CICLO COMPLETO):
            Cada clase debe contener los 7 momentos completos:
            1. INICIO (MBE): Contiene [1.Expectación] y [2.Activación].
            2. DESARROLLO (MBE): Contiene [3.Modelamiento], [4.Guiada] y [5.Independiente].
            3. CIERRE (MBE): Contiene [6.Feedback] y [7.Metacognición].
            """
        else: # Progresivo
            ESTRATEGIA_CMP = f"""
            {ESTRUCTURA_UNIVERSAL}

            DISTRIBUCIÓN DE LOS 7 MOMENTOS CMP (PROGRESIVO):
            Los momentos profundos se distribuyen, PERO respetando la estructura universal MBE:
            
            - Clases Iniciales: Inicio potente + Desarrollo enfocado en [Modelamiento].
            - Clases Intermedias: Inicio breve + Desarrollo enfocado en [Práctica].
            - Clases Finales: Inicio breve + Desarrollo breve + Cierre extendido de [Metacognición].
            """

        prompt = f"""
        ROL: Jefe Técnico Pedagógico del Colegio Madre Paulina.
        TAREA: Diseñar una Unidad Didáctica en formato JSON estricto.
        
        INPUTS:
        - Nivel: {request.nivel}
        - Asignatura: {request.asignatura}
        - OAs: {', '.join(request.oas_mochila)}
        - Sello: {request.valor_panel} ({request.actitud_especifica})
        - Clases: {request.num_clases} ({request.modo_distribucion})
        - Medio: {request.medio_usuario or "Estrategia innovadora"}

        {contexto_docente}

        {ESTRATEGIA_CMP}

        REGLAS DE ORO (PEDAGOGÍA):
        1. ESTRATEGIA: Usa la fórmula: "Verbo (Habilidad OA) + Contenido + Medio + Actitud".
        2. ESTRUCTURA: Los textos de 'inicio', 'desarrollo' y 'cierre' deben reflejar explícitamente los 7 momentos descritos arriba.
        3. RECURSOS Y TICKETS: Escribe el ejercicio REAL o pregunta REAL.
        4. EVALUACIÓN: Enfoque en PRODUCTO (3ra persona), nunca en el alumno.
        5. MATEMÁTICAS/LATEX: Usa SIEMPRE DOBLE BARRA INVERTIDA para fórmulas. Ejemplo: $$ \\\\frac{{1}}{{2}} $$ (Esto es vital para no romper el JSON).
        6. PERSONALIZACIÓN: Si hay contexto docente, RESPETA fielmente su estilo y limitaciones.

        ESTRUCTURA JSON DE RESPUESTA:
        {{
          "titulo_unidad_creativo": "Texto",
          "estrategia_aprendizaje_sentencia": "Texto",
          "planificacion_clases": [
            {{
              "numero_clase": 1,
              "foco_pedagogico": "Texto",
              "contenido_editable": {{
                "inicio": "Texto detallado...",
                "desarrollo": "Texto detallado (Usa $$...$$ para fórmulas)...",
                "cierre": "Texto detallado..."
              }},
              "recurso_practica": "Ejercicio...",
              "ticket_salida": "Pregunta...",
              "rubrica_tabla": {{
                "criterio": "...",
                "niveles": {{
                   "insuficiente": "...",
                   "elemental": "...",
                   "adecuado": "..."
                }}
              }}
            }}
          ]
        }}
        """

        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)

        resultado = limpiar_y_reparar_json(response.text)
        
        if not resultado:
            return {
                "result": {
                    "titulo_unidad_creativo": "Error de Formato Matemático",
                    "estrategia_aprendizaje_sentencia": "La IA generó fórmulas complejas que no pudieron procesarse. Intente reducir la cantidad de clases.",
                    "planificacion_clases": []
                }
            }

        return {"result": resultado}

    except Exception as e:
        print(f"❌ Error Crítico Planificador: {e}")
        return {"error": str(e)}
```

### Router: `rubricas.py`
```python
from fastapi import APIRouter
from pydantic import BaseModel
import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv

# Configuración
load_dotenv()
router = APIRouter()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# --- MODELO COMPATIBLE CON PYTHON 3.14 ---
class RubricRequest(BaseModel):
    nivel: str
    asignatura: str
    oaId: str
    oaDescripcion: str
    actividad: str 

# Forzamos reconstrucción por seguridad
RubricRequest.model_rebuild()

def limpiar_rubrica_json(texto):
    # Limpieza básica
    texto = re.sub(r'```json\s*', '', texto)
    texto = re.sub(r'```\s*', '', texto)
    try:
        return json.loads(texto)
    except:
        # Intento de recuperación si falta una llave
        try:
            return json.loads(texto + "}")
        except:
            return {"titulo": "Error de Generación", "descripcion": "Intente nuevamente.", "tabla": []}

@router.post("/generate-rubric")
async def generar_rubrica(req: RubricRequest):
    print(f"⚡ [RÚBRICA] Generando para: {req.actividad}")
    
    try:
        # PROMPT V3: "PEDAGOGÍA DE HIERRO"
        prompt = f"""
        ROL: Experto en Evaluación Auténtica.
        TAREA: Crear Rúbrica Analítica para el PRODUCTO: "{req.actividad}".
        CONTEXTO: {req.nivel}, {req.asignatura}, OA: {req.oaDescripcion}.
        
        LISTA NEGRA (PALABRAS PROHIBIDAS):
        - Alumno, Estudiante, Él/Ella (NUNCA evaluar a la persona).
        - Logra, Entiende, Comprende (Son procesos internos, no observables).
        - Correctamente, Adecuadamente, Satisfactoriamente (Son subjetivos).
        - Elegancia, Belleza, Loable, Razonable (Son ambiguos).

        REGLAS DE ORO:
        1. SUJETO DE LA ORACIÓN = EL PRODUCTO.
           - Bien: "El ensayo presenta...", "El cálculo incluye...", "La maqueta respeta...".
        2. NIVELES DE DESEMPEÑO:
           - INSUFICIENTE: Errores críticos u omisiones que impiden el funcionamiento/comprensión.
           - ELEMENTAL: Cumple lo mínimo, pero con imprecisiones o falta de profundidad.
           - ADECUADO (Meta): Cumple el estándar completo sin errores técnicos.
           - DESTACADO: Aporta un plus (transferencia, análisis crítico, originalidad justificada).

        JSON OBLIGATORIO:
        {{
          "titulo": "Título Técnico del Instrumento",
          "descripcion": "Breve descripción del propósito.",
          "tabla": [
            {{ 
                "criterio": "Nombre del Criterio (Sustantivo)", 
                "porcentaje": 20, 
                "niveles": {{ 
                    "insuficiente": "...", 
                    "elemental": "...", 
                    "adecuado": "...", 
                    "destacado": "..." 
                }} 
            }}
          ]
        }}
        """
        model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        return limpiar_rubrica_json(response.text)
    except Exception as e:
        print(f"❌ Error Rúbrica: {e}")
        return {"titulo": "Error Técnico", "descripcion": str(e), "tabla": []}
```

### Router: `social.py`
```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

router = APIRouter(prefix="/social", tags=["Social Engine"])

# --- CONFIGURACIÓN DB ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ ADVERTENCIA SOCIAL: No se configuró Supabase.")

# --- MODELOS ---
class NoticiaRequest(BaseModel):
    titulo: str
    cuerpo: str
    es_importante: bool = False
    etiqueta: str = "Información"
    autor_id: str

class ComentarioRequest(BaseModel):
    recurso_id: str
    usuario_id: str
    usuario_nombre: str
    contenido: str

class LikeRequest(BaseModel):
    recurso_id: str
    usuario_id: str

# --- ENDPOINTS NOTICIAS ---
@router.post("/noticias")
async def crear_noticia(noticia: NoticiaRequest):
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        res = supabase.table("noticias").insert(noticia.dict()).execute()
        return res.data
    except Exception as e:
        print(f"❌ Error creando noticia: {e}")
        raise HTTPException(500, str(e))

@router.get("/noticias")
async def obtener_noticias():
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        # Traer últimas 5, ordenadas por fecha descendente
        res = supabase.table("noticias").select("*").order("created_at", desc=True).limit(5).execute()
        return res.data
    except Exception as e:
        print(f"❌ Error noticias: {e}")
        return []

# --- ENDPOINTS INTERACCIONES ---
@router.post("/comentar")
async def comentar_recurso(comentario: ComentarioRequest):
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        res = supabase.table("comentarios").insert(comentario.dict()).execute()
        return res.data
    except Exception as e:
        print(f"❌ Error comentando: {e}")
        raise HTTPException(500, str(e))

@router.get("/comentarios/{recurso_id}")
async def ver_comentarios(recurso_id: str):
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        res = supabase.table("comentarios").select("*").eq("recurso_id", recurso_id).order("created_at", desc=False).execute()
        return res.data
    except Exception as e:
        print(f"❌ Error obteniendo comentarios: {e}")
        return []

@router.post("/like")
async def toggle_like(like: LikeRequest):
    if not supabase: raise HTTPException(500, "DB no configurada")
    try:
        # 1. Verificar si ya existe 
        existing = supabase.table("reacciones").select("*").eq("recurso_id", like.recurso_id).eq("usuario_id", like.usuario_id).execute()
        
        if existing.data and len(existing.data) > 0:
            # 2a. Si existe, BORRAR (Unlike)
            print(f"💔 Unlike: {like.usuario_id} -> {like.recurso_id}")
            supabase.table("reacciones").delete().eq("id", existing.data[0]['id']).execute()
            return {"status": "unliked"}
        else:
            # 2b. Si no existe, CREAR (Like)
            print(f"❤️ Like: {like.usuario_id} -> {like.recurso_id}")
            supabase.table("reacciones").insert({"recurso_id": like.recurso_id, "usuario_id": like.usuario_id, "tipo": "like"}).execute()
            return {"status": "liked"}
            
    except Exception as e:
        print(f"❌ Error like: {e}")
        raise HTTPException(500, str(e))

```

### Router: `telemetry.py`
```python
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry & Analytics"]
)

# --- CONFIGURACIÓN ---
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# --- WEIGHTS FOR SAVED HOURS (Minutes) ---
SAVED_MINUTES_MAP = {
    "planificador": 85,
    "lectura-inteligente": 55,
    "rubricas": 40,
    "analizador": 35,
    "evaluaciones": 60,
    "nee": 50,
    "mentor": 15
}

class TelemetryTrackRequest(BaseModel):
    user_id: str
    email: str
    event_name: str
    module: Optional[str] = None
    metadata: Dict[str, Any] = {}

@router.post("/track")
async def track_event(req: TelemetryTrackRequest):
    try:
        res = supabase.table('telemetry_events').insert({
            "user_id": req.user_id,
            "email": req.email,
            "event_name": req.event_name,
            "module": req.module,
            "metadata": req.metadata
        }).execute()
        return {"status": "ok"}
    except Exception as e:
        print(f"Error tracking event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_product_analytics(email: str = Query(...)):
    # SECURITY: Only re.se.alvarez@gmail.com can call this
    if email != "re.se.alvarez@gmail.com":
        raise HTTPException(status_code=403, detail="Access denied. Super Admin only.")

    try:
        # 1. Fetch total authorized users (for Adoption denominator)
        res_auth = supabase.table('authorized_users').select('email', count='exact').execute()
        total_authorized = res_auth.count or 1 

        # 2. Fetch all telemetry events
        res = supabase.table('telemetry_events').select('*').execute()
        events = res.data or []

        # 3. Fetch historical library resources
        res_lib = supabase.table('biblioteca_recursos').select('tipo, user_id').execute()
        library_resources = res_lib.data or []

        # 4. Basic Aggregations
        total_events = len(events)
        module_usage: Dict[str, int] = {}
        user_activity: Dict[str, int] = {}
        unique_identities = set() # To track unique users across telemetry AND library
        friction_events = 0 
        
        # 5. Process Library Items (Historical)
        total_saved_minutes = 0
        LIB_MAP = {
            "PLANIFICACION": "planificador",
            "RUBRICA": "rubricas",
            "EVALUACION": "evaluaciones",
            "AUDITORIA": "analizador",
            "LECTURA": "lectura-inteligente",
            "ESTRATEGIA": "nee",
            "ELEVADOR": "mentor"
        }

        for item in library_resources:
            tipo = item.get('tipo', '')
            uid = item.get('user_id')
            if uid: unique_identities.add(uid) # Add user_id to active set
            
            mod_key = LIB_MAP.get(tipo, "unknown")
            weight = SAVED_MINUTES_MAP.get(mod_key, 0)
            total_saved_minutes += weight

        # 6. Process Telemetry Events (Real-time)
        for event in events:
            m = event.get('module') or "unknown"
            m_clean = m.split('/')[-1] if '/' in m else m
            
            module_usage[m_clean] = module_usage.get(m_clean, 0) + 1
            
            email_user = event.get('email') or "anonymous"
            user_activity[email_user] = user_activity.get(email_user, 0) + 1
            if email_user != "anonymous": unique_identities.add(email_user)
            
            if event.get('event_name') == 'regenerate_question':
                friction_events += 1

            if 'success' in event.get('event_name', '').lower() or 'generar' in event.get('event_name', '').lower():
                if m_clean == 'mentor' or m_clean == 'lectura-inteligente':
                     weight = SAVED_MINUTES_MAP.get(m_clean, 0)
                     total_saved_minutes += (weight * 0.2)

        # 7. Adoption Calculation (%)
        unique_active_count = len(unique_identities)
        adoption_percent = round((unique_active_count / total_authorized) * 100, 1) if total_authorized > 0 else 0

        # 8. Format Top Users (Power Users)
        # We prioritize those with email if available
        top_users = sorted(
            [{"email": k, "count": v} for k, v in user_activity.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]

        # 9. Format Module Usage
        module_stats = sorted(
            [{"name": k, "value": v} for k, v in module_usage.items()],
            key=lambda x: x["value"],
            reverse=True
        )

        return {
            "summary": {
                "total_events": total_events,
                "saved_hours": round(total_saved_minutes / 60, 1),
                "adoption_percent": adoption_percent,
                "active_users_count": unique_active_count,
                "total_authorized": total_authorized,
                "friction_count": friction_events
            },
            "top_modules": module_stats,
            "power_users": top_users,
            "recent_events": events[-10:]
        }

    except Exception as e:
        print(f"Error calculating analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

```

# 4. COMPONENTES CLAVE DE INTERFAZ DE USUARIO E INTERACCIÓN

### Componente: `frontend/src/app/page.tsx`
```tsx
"use client";

import React from 'react';
import Link from 'next/link';
import {
    ChevronRight,
    ArrowRight,
    Sparkles,
    User,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { InfiniteCarousel } from '@/components/InfiniteCarousel';
import { VideoModal } from '@/components/VideoModal';
import { modules, features360, testimonials } from '@/constants/landingData';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
            <h2 className="sr-only">Plataforma de Inteligencia Artificial para la Gestión Docente y Escolar</h2>

            {/* Grid Pattern Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.06]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 0H0V60H60V0ZM1 1H59V59H1V1Z' fill='%231B3C73' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Logo />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black tracking-tighter text-[#1B3C73] leading-none">ProfeIC</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mt-1">Plataforma Oficial</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600">
                        <Link href="/institucional" className="text-slate-500 hover:text-[#1B3C73] transition-colors py-3">
                            Planes para Colegios
                        </Link>
                        <Link href="/login" className="bg-[#1B3C73] text-white px-8 py-3 rounded-xl border-2 border-[#1B3C73] hover:bg-[#2A59A8] transition-all font-black shadow-lg">
                            Acceso Privado
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center">
                    <div className="max-w-4xl mx-auto flex flex-col items-center hero-animate">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#1B3C73] text-[10px] font-black mb-10 shadow-sm uppercase tracking-widest">
                            <Sparkles size={14} className="text-orange-500" /> IA Pedagógica Especializada
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-10 text-slate-900 tracking-tight">
                            Transforma la Gestión <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B3C73] via-[#2A59A8] to-[#C87533]">
                                en Liderazgo Real.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                            Elimina la carga administrativa y enfócate en lo que importa: generar <strong>aprendizaje profundo</strong>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                            <Link href="/institucional" className="bg-white text-[#1B3C73] border-2 border-[#1B3C73]/20 hover:border-[#1B3C73]/50 px-12 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-xl hover:bg-slate-50">
                                Contratar para mi Colegio
                            </Link>
                            <Link href="/login" className="bg-[#1B3C73] text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-blue-900/30 hover:scale-105 transition-all flex items-center justify-center gap-3 text-xl group">
                                Acceso Profesores <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 flex flex-col items-center">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Metodología inspirada en la visión pedagógica del</p>
                            <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <Logo className="w-8 h-8" />
                                <span className="text-xl font-black text-[#1B3C73] tracking-tighter">Colegio Madre Paulina</span>
                            </div>
                        </div>
                    </div>

                    {/* Faux UI Hero (Elevador Cognitivo) */}
                    <div className="relative mt-20 w-full max-w-5xl hero-animate delay-200">
                        <div className="absolute -inset-10 bg-gradient-to-tr from-blue-200/20 to-orange-200/20 blur-3xl rounded-full" />
                        <div className="relative bg-white rounded-[3rem] shadow-2xl border border-slate-200 p-8 md:p-12 overflow-hidden mx-auto">
                            <div className="flex gap-2.5 mb-12 justify-center md:justify-start">
                                <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                            </div>
                            <div className="max-w-2xl mx-auto bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-left">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl">🤖</div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inteligencia Pedagógica</p>
                                        <p className="text-xl font-black text-[#1B3C73]">Elevador Cognitivo</p>
                                    </div>
                                </div>
                                <p className="text-lg text-slate-600 italic bg-white p-6 rounded-2xl border border-slate-100 leading-relaxed shadow-sm">
                                    "Tu actividad apunta a <strong>DOK 1</strong>. ¿Deseas sugerencias para elevar a <strong>DOK 3: Pensamiento Estratégico</strong>?"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Marquee de Módulos (Ecosistema Dinámico) */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 text-center mb-16">
                    <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Ecosistema de Innovación</h2>
                    <p className="text-slate-500 text-xl font-medium">Desliza para explorar la suite completa de ProfeIC.</p>
                </div>

                <InfiniteCarousel speed={60}>
                    {modules.map((item, i) => (
                        <div key={i} className="w-[400px] shrink-0 bg-[#F8FAFC] p-10 rounded-[2.5rem] border border-slate-200 hover:border-[#1B3C73]/30 hover:bg-white hover:shadow-2xl transition-all duration-500 group/card">
                            <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover/card:scale-110 transition-transform duration-500`}>
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-black mb-4 text-[#1B3C73]">{item.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">{item.desc}</p>
                        </div>
                    ))}
                </InfiniteCarousel>
            </section>

            {/* NUEVA SECCIÓN: VIDEO TESTIMONIAL */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-tight">
                                Mira ProfeIC en <br />
                                <span className="text-[#1B3C73]">Acción Real.</span>
                            </h2>
                            <p className="text-xl text-slate-600 mb-8 font-medium italic">
                                "No es solo software, es una extensión de nuestra visión pedagógica que buscamos que devuelva el propósito al trabajo docente y mejore los aprendizajes de nuestros estudiantes."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-slate-100 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-black text-[#1B3C73]">Testimonio Directivo</p>
                                    <p className="text-sm text-slate-400 font-bold uppercase">Colegio Madre Paulina</p>
                                </div>
                            </div>
                        </div>

                        {/* Contenedor del Video */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-[#1B3C73] to-[#C87533] opacity-20 blur-2xl rounded-[3rem]" />
                            <VideoModal
                                thumbnailUrl="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80"
                                videoId="TU_VIDEO_ID_AQUI" // TODO: Reemplazar con ID real de YouTube
                                title="Mira ProfeIC en Acción"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Acompañamiento 360 */}
            <section className="py-32 bg-[#1B3C73] text-white">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="max-w-4xl mb-24 mx-auto text-center md:text-left">
                        <span className="text-orange-400 font-black tracking-[0.3em] text-xs uppercase block mb-6">LIDERAZGO PEDAGÓGICO 360°</span>
                        <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-tight mb-8">"Acompañamiento basado en el crecimiento, no en el control."</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {features360.map((item, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                                <div className="text-orange-400 mb-6">{item.icon}</div>
                                <h4 className="font-black text-xl mb-3">{item.title}</h4>
                                <p className="text-sm text-blue-100/60 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-20 flex justify-center">
                        <Link href="/login" className="bg-white text-[#1B3C73] px-12 py-5 rounded-2xl font-black shadow-2xl flex items-center gap-3 hover:bg-orange-50 transition-all text-lg">
                            Acceder al Panel de Gestión <ArrowRight size={24} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonios */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-8 text-center mb-24">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">El Impacto en la Comunidad</h2>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs mt-4">Pilotaje 2025 • Resultados Reales</p>
                </div>
                <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className={`bg-[#F8FAFC] p-10 rounded-[2.5rem] border-t-8 ${t.accent} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between`}>
                            <div>
                                <div className="text-slate-200 mb-6">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.017 21L16.411 14.182C15.821 14.182 15.114 13.978 14.613 13.568C14.113 13.159 13.863 12.545 13.863 11.523C13.863 10.614 14.158 9.818 14.75 9.136C15.341 8.455 16.159 8.114 17.205 8.114C18.25 8.114 19.068 8.455 19.659 9.136C20.25 9.818 20.545 10.614 20.545 11.523C20.545 13.159 19.955 15.023 18.773 17.114L14.017 21ZM3.722 21L6.116 14.182C5.526 14.182 4.819 13.978 4.318 13.568C3.818 13.159 3.568 12.545 3.568 11.523C3.568 10.614 3.863 9.818 4.455 9.136C5.045 8.455 5.864 8.114 6.909 8.114C7.955 8.114 8.773 8.455 9.364 9.136C9.955 9.818 10.25 10.614 10.25 11.523C10.25 13.159 9.659 15.023 8.477 17.114L3.722 21Z" />
                                    </svg>
                                </div>
                                <p className="text-slate-700 mb-10 font-bold italic text-lg leading-relaxed">"{t.quote}"</p>
                            </div>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-slate-200 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-black text-md text-[#1B3C73]">{t.name}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-5">
                        <Logo className="w-12 h-12" />
                        <span className="font-black text-3xl text-[#1B3C73] tracking-tighter">ProfeIC</span>
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em]">© 2026 ProfeIC • Innovación Educativa</p>
                    <div className="flex gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Link href="#" className="hover:text-[#1B3C73] transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-[#1B3C73] transition-colors">Soporte</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

```

### Componente: `frontend/src/app/institucional/page.tsx`
```tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Mail, BuildingIcon, Star, Zap } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function InstitucionalPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 text-slate-500 hover:text-[#1B3C73] transition-colors font-bold">
                        <ChevronLeft size={20} /> Volver al Inicio
                    </Link>
                    <div className="flex items-center gap-5">
                        <Logo />
                        <div className="hidden sm:flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-[#1B3C73] leading-none">ProfeIC</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mt-1">Institucional</span>
                        </div>
                    </div>
                </div>
            </nav>

            <header className="pt-20 pb-16 text-center px-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#1B3C73] text-[10px] font-black mb-8 shadow-sm uppercase tracking-widest">
                    <BuildingIcon size={14} className="text-[#1B3C73]" /> Licencias Colegios y Sostenedores
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 tracking-tight text-[#1B3C73]">
                    Impulsa la Excelencia <br /> Pedagógica en tu Red.
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                    Planes diseñados para colegios que buscan estandarizar la calidad de enseñanza, ahorrar cientos de horas lectivas y dar seguimiento directo al impacto de las clases.
                </p>
            </header>

            <section className="max-w-7xl mx-auto px-8 pb-32">
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

                    {/* PLAN BÁSICO */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Básico</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Ideal para dependencias pequeñas o escuelas rurales.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-slate-900">Desde $120.000</span>
                            <span className="text-sm font-bold text-slate-400">/Mes</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Hasta 20 docentes inscritos.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Planificador IAAustral (Todas las Asignaturas).
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Generador Rúbricas.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-500 line-through opacity-70 align-top">
                                <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0" />
                                Panel de Acompañamiento 360° para UTP.
                            </li>
                        </ul>
                        <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud Demo - Plan Básico" className="w-full py-4 text-center rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                            Cotizar Básico
                        </a>
                    </div>

                    {/* PLAN PRO / INSTITUCIONAL (Destacado) */}
                    <div className="bg-[#1B3C73] rounded-3xl p-8 border border-[#2A59A8] shadow-2xl shadow-blue-900/20 transform md:-translate-y-4 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-bl-2xl">
                            Más Recomendado
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
                            Institucional Pro <Star className="w-5 h-5 text-orange-400 fill-orange-400" />
                        </h3>
                        <p className="text-blue-100/70 text-sm font-medium mb-6">La suite completa para colegios medianos y grandes.</p>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-white">Desde $290.000</span>
                            <span className="text-sm font-bold text-blue-200/50">/Mes</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3 text-sm text-blue-100 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                                Hasta 60 docentes inscritos.
                            </li>
                            <li className="flex gap-3 text-sm text-blue-100 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                                Todas las herramientas docentes de Aula IA.
                            </li>
                            <li className="flex gap-3 text-sm text-blue-100 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                                <strong>Panel Acompañamiento 360° para Directivos</strong> (Analytics completo).
                            </li>
                            <li className="flex gap-3 text-sm text-blue-100 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                                Biblioteca y Recursos Compartidos.
                            </li>
                        </ul>
                        <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud Demo - Plan Institucional" className="w-full py-4 text-center rounded-xl font-black bg-white text-[#1B3C73] hover:bg-orange-50 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                            Agendar Demo <Zap className="w-4 h-4 text-orange-500" />
                        </a>
                    </div>

                    {/* PLAN ENTERPRISE */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative">
                        <h3 className="text-xl font-black text-slate-800 mb-2">Enterprise</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Red de sostenedores o corporaciones grandes.</p>
                        <div className="mb-6 mt-1">
                            <span className="text-2xl font-black text-slate-900">Cotizar a Medida</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Docentes ilimitados.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Configuración Multi-Sede (Jerarquía por colegio).
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Soporte Prioritario Dedicado.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600 font-medium align-top">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                Capacitación Onboarding (Presencial/Online).
                            </li>
                        </ul>
                        <a href="mailto:re.se.alvarez@gmail.com?subject=Solicitud Demo - Plan Enterprise" className="w-full py-4 text-center rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                            Contactar a Ventas
                        </a>
                    </div>

                </div>
            </section>

            <section className="bg-slate-900 text-white py-24 mb-0">
                <div className="max-w-4xl mx-auto px-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-4">¿Dudas o Casos Especiales?</h2>
                    <p className="text-slate-400 mb-8 max-w-xl text-lg">
                        Escríbenos directamente para resolver cualquier inquietud sobre la implementación en tu establecimiento educativo.
                    </p>
                    <a href="mailto:re.se.alvarez@gmail.com" className="bg-[#C87533] px-8 py-4 rounded-xl font-black hover:bg-[#A65B21] transition-colors text-xl">
                        re.se.alvarez@gmail.com
                    </a>
                </div>
            </section>
        </div>
    );
}

```

### Componente: `frontend/src/app/(saas)/superadmin/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Plus, Users, Building, Mail, Loader2, ArrowRight } from "lucide-react";

export default function SuperAdminDashboard() {
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newSchoolName, setNewSchoolName] = useState("");
    const [newSchoolSlug, setNewSchoolSlug] = useState("");
    const [newSchoolMaxUsers, setNewSchoolMaxUsers] = useState(10);
    const [isCreatingSchool, setIsCreatingSchool] = useState(false);

    // Invite states
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteSchoolId, setInviteSchoolId] = useState("");
    const [inviteRole, setInviteRole] = useState("teacher");
    const [isInviting, setIsInviting] = useState(false);

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const { data, error } = await supabase
                .from('schools')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSchools(data || []);

            if (data && data.length > 0 && !inviteSchoolId) {
                setInviteSchoolId(data[0].id);
            }
        } catch (error: any) {
            toast.error("Error al cargar colegios: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchoolName || !newSchoolSlug) return;
        setIsCreatingSchool(true);

        try {
            const { error } = await supabase
                .from('schools')
                .insert({
                    name: newSchoolName,
                    slug: newSchoolSlug.toLowerCase().replace(/[^a-z0-9-]/g, ''), // sanitize
                    max_users: newSchoolMaxUsers,
                    status: 'active',
                    subscription_plan: 'pro'
                });

            if (error) throw error;

            toast.success("Colegio creado exitosamente");
            setNewSchoolName("");
            setNewSchoolSlug("");
            fetchSchools();
        } catch (error: any) {
            toast.error("Error al crear colegio: " + error.message);
        } finally {
            setIsCreatingSchool(false);
        }
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !inviteSchoolId) return;
        setIsInviting(true);

        try {
            // Get Current Token to authenticate as SuperAdmin to backend
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No hay sesión activa");

            // We call our FastAPI backend instead of the JS SDK directly 
            // because we need the Service Role Key to invite dynamically.
            const BE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${BE_URL}/admin/invite`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    email: inviteEmail,
                    school_id: inviteSchoolId,
                    role: inviteRole
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Error en el servidor al invitar");
            }

            toast.success(`Invitación enviada a ${inviteEmail}`);
            setInviteEmail("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsInviting(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse w-full h-64 bg-slate-800 rounded-xl"></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold text-white">SaaS Backoffice</h1>
                <p className="text-slate-400 mt-2">Gestiona múltiples colegios (tenants) y envía invitaciones mágicas.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* SCHOOLS MODULE */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#2A59A8]/20 text-[#2A59A8] rounded-lg">
                            <Building size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Administrar Colegios</h2>
                    </div>

                    <form onSubmit={handleCreateSchool} className="flex gap-4 mb-6">
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                placeholder="Nombre (Ej. Colegio Sur)"
                                value={newSchoolName}
                                onChange={(e) => setNewSchoolName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            />
                        </div>
                        <div className="w-32 space-y-2">
                            <input
                                type="text"
                                placeholder="Slug (sur)"
                                value={newSchoolSlug}
                                onChange={(e) => setNewSchoolSlug(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            />
                        </div>
                        <div className="w-24 space-y-2">
                            <input
                                type="number"
                                placeholder="Cupos"
                                value={newSchoolMaxUsers}
                                onChange={(e) => setNewSchoolMaxUsers(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                                min="1"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isCreatingSchool}
                            className="bg-[#C87533] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B36829] transition-colors flex items-center justify-center min-w-[120px]"
                        >
                            {isCreatingSchool ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear"}
                        </button>
                    </form>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {schools.map(school => (
                            <div key={school.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        {school.name}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider 
                                            ${school.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {school.status}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Slug: {school.slug} | Plan: {school.subscription_plan} | Max Users: {school.max_users}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <p className="text-sm font-mono text-slate-400 text-xs">{school.id.substring(0, 8)}...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INVITE MODULE */}
                <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#C87533]/20 text-[#C87533] rounded-lg">
                            <Mail size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Generar Invitación</h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 drop-shadow-md">
                        Las cuentas solo pueden ser creadas enviando un *Magic Link* desde este panel. El usuario será encapsulado automáticamente en el colegio seleccionado.
                    </p>

                    <form onSubmit={handleInviteUser} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Colegio (Tenant)</label>
                            <select
                                value={inviteSchoolId}
                                onChange={(e) => setInviteSchoolId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            >
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>{school.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Rol a asignar</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            >
                                <option value="teacher">Profesor (teacher)</option>
                                <option value="director">Director</option>
                                <option value="utp">UTP</option>
                                <option value="admin">Administrador Sistema</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
                            <input
                                type="email"
                                placeholder="nuevo@docente.cl"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#C87533] outline-none"
                                required
                            />
                        </div>


                        <button
                            type="submit"
                            disabled={isInviting || schools.length === 0}
                            className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold shadow-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            {isInviting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enviando Invitación Mágica...
                                </>
                            ) : (
                                <>
                                    <span>Enviar e Inscribir</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

```

### Componente: `frontend/src/components/ui/HeroSection.tsx`
```tsx
"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-slate-50">
            {/* Background Decorativo */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="container px-4 md:px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-6 max-w-3xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a2e3b]/5 border border-[#1a2e3b]/10 text-[#1a2e3b] text-sm font-semibold mb-4"
                    >
                        <Sparkles size={14} className="text-[#f2ae60]" />
                        <span>Nueva Versión 4.0</span>
                    </motion.div>

                    {/* Titulo Principal */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1a2e3b]">
                        El Exoesqueleto Intelectual para
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1a2e3b] to-[#f2ae60]">
                            Profesores Modernos
                        </span>
                    </h1>

                    {/* Subtitulo */}
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Planifica, evalúa y adapta tu enseñanza con la potencia de la Inteligencia Artificial.
                        Recupera tu tiempo y soberanía pedagógica.
                    </p>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <button className="px-8 py-4 bg-[#1a2e3b] text-white rounded-full font-bold shadow-lg hover:bg-[#203e52] transform hover:scale-105 transition-all flex items-center justify-center gap-2">
                            Comenzar Ahora <ArrowRight size={20} />
                        </button>
                        <button className="px-8 py-4 bg-white text-[#1a2e3b] border-2 border-slate-200 rounded-full font-bold hover:bg-slate-50 transform hover:scale-105 transition-all">
                            Ver Demo
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

```



---
*Fin del Reporte Maestro Extendido.*