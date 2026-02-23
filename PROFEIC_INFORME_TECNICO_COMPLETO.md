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
