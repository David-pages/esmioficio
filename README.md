# EsMiOficio

Plataforma web para encontrar profesionales de oficios confiables en México (albañiles, plomeros, electricistas, mecánicos y más), con enfoque inicial en Morelia, Michoacán.

## Características

- **Búsqueda y filtros** por oficio, estado, municipio, calificación y verificación.
- **Perfiles profesionales** con portafolio, trabajos recientes, zonas de cobertura y señales de confianza.
- **Reseñas verificadas**: solo clientes que contactaron o contrataron pueden reseñar.
- **Contacto por WhatsApp** con registro de actividad y desbloqueo de datos de contacto.
- **Bolsa de trabajo** (`/proyectos`): los clientes publican lo que necesitan.
- **Centro de seguridad**: reportes, mediación y niveles de verificación.
- **Panel de administración** (`/admin`): métricas, aprobación de oficios, verificación y moderación.
- **SEO**: páginas estáticas por categoría/perfil/blog, sitemap generado en build.

## Tecnologías

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite 6](https://vite.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (base de datos, autenticación y almacenamiento)
- [React Router 7](https://reactrouter.com/)
- [Playwright](https://playwright.dev/) (pruebas end-to-end)

## Ejecutar localmente

**Requisitos:** Node.js 18+

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env.local` basado en `.env.example` y completa tus credenciales de Supabase:

   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_ADMIN_WHATSAPP_NUMBER=521234567890
   ```

3. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   La app queda disponible en `http://localhost:3000`.

## Scripts

| Comando           | Descripción                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                               |
| `npm run build`   | Build de producción (regenera el sitemap antes)      |
| `npm run preview` | Sirve el build de producción localmente              |
| `npx tsc --noEmit` | Verificación de tipos                               |
| `npx playwright test` | Pruebas end-to-end (requiere servidor corriendo) |

## Base de datos

Los esquemas y políticas RLS de Supabase están en los archivos `supabase-*.sql` en la raíz del proyecto. Ejecútalos en el editor SQL de tu proyecto de Supabase:

- `supabase-trust-platform.sql` — plataforma de confianza (reportes, mediación, verificación)
- `supabase-reviews-rls.sql` — políticas de reseñas
- `supabase-client-dashboard.sql` — panel del cliente
- `supabase-admin-analytics.sql` — métricas del admin
- `supabase-production-fixes.sql` — correcciones de producción
- `supabase-security-hardening.sql` - RLS, rol admin y limites de acciones sensibles

### Error al cargar profesionales

Si la aplicacion indica que no puede cargar `professionals_public`:

1. Sustituye los valores de ejemplo de `.env.local` por la URL y la clave anonima reales de **Project Settings > API** en Supabase.
2. Ejecuta `supabase-production-fixes.sql` en el SQL Editor. Este script crea o actualiza `professionals_public` y concede lectura a `anon` y `authenticated`.
3. Ejecuta `supabase-security-hardening.sql` para habilitar las politicas RLS de las tablas sensibles.
4. Reinicia `npm run dev`, porque Vite solo carga las variables de entorno al iniciar.

Cuando Supabase no esta configurado, el entorno local usa los profesionales de ejemplo y no muestra una alerta de RLS.

## Notas de seguridad

- El panel `/admin` valida la sesion actual de Supabase y requiere `app_metadata.role = 'admin'`.
- Las acciones sensibles dependen de politicas RLS en Supabase; ejecuta `supabase-security-hardening.sql` antes de publicar.

- Nunca subas `.env.local` al repositorio (ya está en `.gitignore`).

## Estructura

```
├── App.tsx              # Componente principal, rutas y estado global
├── components/          # Componentes de UI (vistas, modales, tarjetas)
├── lib/                 # Lógica: supabase, confianza, analítica, métricas
├── e2e/                 # Pruebas end-to-end con Playwright
├── public/              # Estáticos (robots.txt, sitemap, redirects)
├── supabase-*.sql       # Esquemas y políticas de la base de datos
└── entredos/            # Proyecto separado (app Next.js independiente)
```
