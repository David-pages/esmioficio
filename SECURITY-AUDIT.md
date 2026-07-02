# 🔐 Informe de Seguridad SAST — EsMiOficio

**Fecha:** 2026-06-27
**Stack:** Vite + React 19 + TypeScript + Supabase · SPA estática sin servidor propio
**Metodología:** Análisis Estático de Código (SAST) basado en OWASP Top 10

---

## 📋 Resumen Ejecutivo

| # | Vulnerabilidad | Severidad | Acción |
|---|---|---|---|
| 1 | Secretos reales en `.env.local` expuestos en el repositorio | 🔴 Crítica | Rotar keys inmediatamente |
| 2 | Contraseña de admin visible en el bundle JS público | 🟠 Alta | Migrar a auth server-side |
| 3 | Sin cabeceras de seguridad HTTP (CSP, HSTS, X-Frame) | 🟠 Alta | Crear `vercel.json` |
| 4 | Tablas de Supabase sin políticas RLS auditadas | 🟡 Media | Aplicar RLS en todas las tablas |
| 5 | Sin rate limiting en acciones críticas del usuario | 🟡 Media | Policy SQL + bloqueo frontend |
| 6 | Open Redirect potencial en OAuth `redirectTo` | 🟡 Media | Sanitizar URL de redirect |
| 7 | Eliminación de reseñas sin policy RLS de administrador | 🟡 Media | Agregar policy DELETE en BD |
| 8 | Dependencias con rango amplio `^` en package.json | 🔵 Baja | Usar `npm ci` + `npm audit` |

---

## 🔍 Hallazgos Detallados

---

### 🛑 Vulnerabilidad 1: Secretos y Credenciales reales expuestas

**⚠️ Severidad: Crítica**

**📍 Ubicación:** `.env.local` — líneas 1-3

**🔍 Descripción:**
El archivo `.env.local` contiene la URL real de Supabase, la anon key JWT
real y la contraseña de administrador en texto plano. Si este archivo fue
comiteado en Git antes de agregar la regla `*.local` al `.gitignore`, quedó
grabado en el historial del repositorio para siempre y cualquier persona con
acceso al repo de GitHub puede verlo.

Con esas credenciales un atacante puede:
- Usar la `VITE_SUPABASE_ANON_KEY` para hacer queries directas a Supabase
  desde Postman o la consola del navegador, saltándose completamente la UI.
- Decodificar el JWT en `jwt.io` para inspeccionar el `ref` y el `role`
  del proyecto.
- Usar la `VITE_ADMIN_PASSWORD` para entrar al panel `/admin` directamente.

```
# .env.local — PROBLEMA: credenciales reales comprometidas
VITE_SUPABASE_URL=https://[tu-proyecto].supabase.co   ← URL real del proyecto
VITE_SUPABASE_ANON_KEY=eyJhbGci...                    ← JWT real, visible para todos
VITE_ADMIN_PASSWORD=...                                ← contraseña real del admin
```

**🛠️ Solución y Código:**

**Paso 1 — Verificar si el archivo fue subido alguna vez a git:**
```bash
git log --all --full-history -- .env.local
```
Si aparece algún commit en la salida, el secreto está comprometido en el historial.

**Paso 2 — Rotar las credenciales de inmediato en Supabase:**
- Ir a: Supabase Dashboard → Settings → API → **Regenerate anon key**
- Cambiar `VITE_ADMIN_PASSWORD` a una nueva contraseña segura en `.env.local`

**Paso 3 — Eliminar el archivo del historial de git si fue subido:**
```bash
# Borrar el archivo de todo el historial de commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar la actualización del repositorio remoto
git push origin --force --all
```

**Paso 4 — Confirmar que `.gitignore` excluye el archivo (ya lo hace):**
```
# .gitignore — esta regla ya existe, verificar que esté presente
*.local
```

---

### 🛑 Vulnerabilidad 2: Contraseña de administrador visible en el bundle del navegador

**⚠️ Severidad: Alta**

**📍 Ubicación:** `App.tsx` — línea 1524, función `handleAdminLogin`

**🔍 Descripción:**
Las variables `VITE_*` en Vite se incrustan directamente en el JavaScript
compilado que se sirve al navegador. Esto significa que **cualquier usuario**
puede abrir Chrome DevTools → Sources → buscar `VITE_ADMIN_PASSWORD` y leer
la contraseña del panel de administración en texto plano, sin ningún
conocimiento técnico especial.

El problema es más grave porque el panel admin ejecuta operaciones reales en
la base de datos que tienen consecuencias permanentes:

```typescript
// App.tsx:1524 — PROBLEMA: la contraseña queda grabada en el JS público
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
if (adminPassword && password === adminPassword) {
  setIsAdminAuthenticated(true);
  // ↑ esto solo oculta la UI, no protege la base de datos
  sessionStorage.setItem('esmiOficio_admin', 'true');
  return true;
}

// Estas operaciones tienen efecto REAL en la BD aunque el "login" sea visual:
// App.tsx:1574 — cambia el estado de verificación de un profesional
supabase.from('professionals').update({ verified: newStatus }).eq('id', id);

// App.tsx:1599 — borra una reseña de forma permanente
supabase.from('reviews').delete().eq('id', reviewId);
```

Un atacante que extraiga la contraseña del bundle puede autenticarse en el
panel, verificar/desverificar profesionales o borrar reseñas a voluntad.

**🛠️ Solución y Código:**

La autenticación del panel admin debe hacerse con Supabase Auth usando un
rol de administrador grabado en los metadatos del usuario JWT, no con una
contraseña fija en el código del navegador.

**Paso 1 — Asignar el rol admin en Supabase SQL Editor (una sola vez):**
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'tu-email-administrador@ejemplo.com';
```

**Paso 2 — Reemplazar `handleAdminLogin` en `App.tsx`:**
```typescript
// App.tsx — SOLUCIÓN: verificar el rol en el JWT del usuario autenticado
const handleAdminLogin = async (): Promise<boolean> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    showToast('Debes iniciar sesión para acceder al panel.', 'error');
    return false;
  }

  const isAdmin = user.app_metadata?.role === 'admin';
  if (isAdmin) {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('esmiOficio_admin', 'true');
    showToast('Sesión de administrador iniciada', 'info');
    return true;
  }

  showToast('No tienes permisos de administrador.', 'error');
  return false;
};
```

**Paso 3 — Proteger las operaciones sensibles con RLS en Supabase:**
```sql
-- Solo administradores pueden cambiar el campo verified de un profesional
CREATE POLICY "Solo admins actualizan verified"
ON public.professionals
FOR UPDATE TO authenticated
USING (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
```

---

### 🛑 Vulnerabilidad 3: Ausencia de cabeceras de seguridad HTTP

**⚠️ Severidad: Alta**

**📍 Ubicación:** `index.html` (sin meta CSP) · raíz del proyecto (sin `vercel.json`)

**🔍 Descripción:**
El proyecto no configura ninguna cabecera de seguridad HTTP, lo que abre
múltiples vectores de ataque simultáneamente:

- **Sin Content-Security-Policy (CSP):** Si un atacante logra inyectar
  cualquier script (XSS), puede cargar código externo arbitrario, robar
  el token JWT de Supabase del `localStorage` y enviarlo a su servidor.
  El sitio ya carga recursos de `fonts.googleapis.com`, `fonts.gstatic.com`
  e `images.unsplash.com` sin restricción de origen de scripts.

- **Sin `X-Frame-Options` / `frame-ancestors`:** El sitio puede ser embebido
  en un `<iframe>` invisible por un atacante. Con esa técnica (clickjacking),
  puede engañar a un administrador autenticado para que haga clic sin saberlo
  en "Verificar profesional" o "Eliminar reseña".

- **Sin `Strict-Transport-Security` (HSTS):** La primera visita HTTP (antes
  del redirect a HTTPS) puede ser interceptada por un atacante en la misma
  red Wi-Fi (ataque MITM).

- **Sin `X-Content-Type-Options`:** El navegador puede ejecutar archivos
  como scripts aunque su `Content-Type` no sea `text/javascript`.

**🛠️ Solución y Código:**

Crear el archivo `vercel.json` en la raíz del proyecto con todas las
cabeceras necesarias:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none';"
        }
      ]
    }
  ]
}
```

Verificar las cabeceras después del deploy:
```bash
curl -I https://esmioficio.mx
# Debes ver X-Frame-Options, Content-Security-Policy, etc. en la respuesta
```

También puedes pegar la URL en **https://securityheaders.com** para obtener
un reporte visual con calificación A/B/C/D/E/F.

---

### 🛑 Vulnerabilidad 4: Tablas de Supabase sin políticas RLS auditadas

**⚠️ Severidad: Media**

**📍 Ubicación:** `lib/supabaseClient.ts` líneas 3-4 · `App.tsx` línea 170 · archivos SQL del proyecto

**🔍 Descripción:**
La `VITE_SUPABASE_ANON_KEY` es visible en el bundle del navegador (esto es
normal en SPAs con Supabase), pero el riesgo real ocurre cuando hay tablas
**sin Row Level Security activado**. En ese caso, cualquier persona puede
hacer queries directas a la API REST de Supabase sin pasar por la aplicación:

```bash
# Un atacante puede ejecutar esto desde cualquier terminal
curl 'https://[tu-proyecto].supabase.co/rest/v1/trade_requests' \
  -H 'apikey: [anon-key-visible-en-el-bundle]' \
  -H 'Authorization: Bearer [anon-key-visible-en-el-bundle]'
```

Los archivos SQL incluidos en el proyecto (`supabase-reviews-rls.sql`,
`supabase-production-fixes.sql`) solo definen políticas para la tabla
`reviews`. Las tablas `trade_requests`, `activity_events`, `analytics_events`,
`client_contact_events` y `client_saved_professionals` no tienen políticas
RLS visibles en el código del proyecto.

Adicionalmente, `App.tsx:170` tiene un fallback que accede directamente a la
tabla `professionals` (no a la vista segura `professionals_public`) si la
vista falla, potencialmente exponiendo columnas sensibles como `phone` y
`email` a cualquier usuario anónimo.

**🛠️ Solución y Código:**

**Paso 1 — Auditar qué tablas no tienen RLS en Supabase SQL Editor:**
```sql
-- Esta query devuelve todas las tablas públicas sin ninguna política RLS
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT DISTINCT tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  )
ORDER BY tablename;
```

**Paso 2 — Aplicar RLS a las tablas identificadas:**
```sql
-- trade_requests: lectura pública de aprobadas, escritura solo autenticados
ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera lee solicitudes aprobadas"
ON public.trade_requests FOR SELECT
USING (status = 'APPROVED');

CREATE POLICY "Autenticados crean solicitudes"
ON public.trade_requests FOR INSERT TO authenticated
WITH CHECK (true);

-- activity_events: solo insertar, nunca leer desde el cliente
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo insertar eventos de actividad"
ON public.activity_events FOR INSERT TO authenticated
WITH CHECK (true);

-- analytics_events: igual, solo escritura
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo insertar eventos de analytics"
ON public.analytics_events FOR INSERT TO authenticated
WITH CHECK (true);

-- client_saved_professionals: cada cliente solo ve y gestiona los suyos
ALTER TABLE public.client_saved_professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes ven sus propios guardados"
ON public.client_saved_professionals FOR SELECT TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Clientes gestionan sus propios guardados"
ON public.client_saved_professionals FOR ALL TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());
```

**Paso 3 — Asegurarse de que el fallback en App.tsx use la vista segura:**
```typescript
// App.tsx:154 — la vista professionals_public solo expone columnas públicas
// Asegurarse de que la vista esté creada en Supabase con las columnas correctas
// y que NO incluya phone ni email

// Si el fallback a la tabla directa es necesario, agregar solo columnas seguras:
const tableFallbackResponse = await supabase
  .from('professionals')
  .select('id,name,trade,location,municipality,state,rating,reviews_count,image_url,verified,description,years_experience');
  // ↑ Nunca incluir phone ni email en una query pública
```

---

### 🛑 Vulnerabilidad 5: Sin rate limiting en acciones críticas

**⚠️ Severidad: Media**

**📍 Ubicación:** `App.tsx:1341` (`handleRequestQuote`) · `App.tsx:1188` (`handleAddReview`) · `components/AdminDashboard.tsx:259` (login admin)

**🔍 Descripción:**
La única protección contra acciones duplicadas es un `Set` en memoria
(`pendingOperations`) que **se reinicia con cada recarga de página**. Un
usuario malintencionado puede:

1. Abrir la página en 10 pestañas y generar 10 `service_requests` para el
   mismo profesional en segundos, saturando su bandeja de solicitudes.

2. Llamar `ensureReviewEligibility` directamente desde la consola del
   navegador para crear un `service_request` con estado `PENDING` y así
   habilitarse para publicar una reseña sin haber contactado nunca al
   profesional real.

3. Hacer fuerza bruta al login de `/admin` enviando contraseñas en un bucle,
   ya que no hay bloqueo por intentos fallidos.

```typescript
// App.tsx:286 — PROBLEMA: la protección solo vive en memoria y se pierde al recargar
const [pendingOperations] = useState<Set<string>>(new Set());

// Un atacante puede simplemente abrir una nueva pestaña para evitar esta protección
if (pendingOperations.has(opKey)) return;
pendingOperations.add(opKey);
```

**🛠️ Solución y Código:**

**En Supabase — limitar solicitudes por cliente por hora (nivel de base de datos):**
```sql
-- Política que impide más de 3 solicitudes al mismo profesional en 1 hora
CREATE POLICY "Limitar service_requests por hora"
ON public.service_requests
FOR INSERT TO authenticated
WITH CHECK (
  (
    SELECT COUNT(*)
    FROM public.service_requests
    WHERE client_id = auth.uid()
      AND professional_id = NEW.professional_id
      AND created_at > NOW() - INTERVAL '1 hour'
  ) < 3
);
```

**En el frontend — bloquear el login de admin tras 5 intentos fallidos:**
```typescript
// components/AdminDashboard.tsx — agregar estado de bloqueo temporal
const [loginAttempts, setLoginAttempts] = useState(0);
const [lockedUntil, setLockedUntil] = useState(0);

const handleLoginSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Verificar si el usuario está bloqueado temporalmente
  if (Date.now() < lockedUntil) {
    const secsLeft = Math.ceil((lockedUntil - Date.now()) / 1000);
    setError(`Demasiados intentos. Espera ${secsLeft} segundos.`);
    return;
  }

  if (onLogin(password)) {
    setError('');
    setPassword('');
    setLoginAttempts(0);
  } else {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);

    // Bloquear 30 segundos después de 5 intentos fallidos
    if (newAttempts >= 5) {
      setLockedUntil(Date.now() + 30_000);
      setError('Demasiados intentos. Panel bloqueado por 30 segundos.');
    } else {
      setError(`Contraseña incorrecta (intento ${newAttempts} de 5)`);
    }
  }
};
```

---

### 🛑 Vulnerabilidad 6: Open Redirect potencial en OAuth `redirectTo`

**⚠️ Severidad: Media**

**📍 Ubicación:** `components/AuthModal.tsx` — líneas 46-55, función `handleGoogleSignIn`

**🔍 Descripción:**
El flujo de autenticación con Google usa `window.location.href` completo como
URL de redirección post-login. Esta URL incluye todos los query params actuales
de la página sin ningún tipo de validación o sanitización:

```typescript
// AuthModal.tsx:48 — PROBLEMA: usa window.location.href sin filtrar
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.href  // ← incluye ?cualquier=parametro en la URL
  }
});
```

Un atacante puede construir una URL maliciosa como:
```
https://esmioficio.mx/?callback=https://sitio-de-phishing.com
```

Y enviarla a usuarios por correo o redes sociales. Aunque Supabase valida
que el dominio base esté en la whitelist de URLs permitidas, pasar parámetros
innecesarios al `redirectTo` amplía innecesariamente la superficie de ataque
y puede ser combinado con otras vulnerabilidades.

**🛠️ Solución y Código:**

```typescript
// components/AuthModal.tsx — SOLUCIÓN: usar solo origen + ruta, sin query params
const handleGoogleSignIn = async () => {
  setError(null);
  setIsVerifying(true);

  // Construir un redirect seguro: solo el origen y la ruta actual, sin params externos
  const safeRedirect = `${window.location.origin}${window.location.pathname}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: safeRedirect  // ← nunca incluye query params potencialmente maliciosos
    }
  });

  if (error) {
    setError(error.message);
    setIsVerifying(false);
  }
};
```

---

### 🛑 Vulnerabilidad 7: Eliminación de reseñas sin policy RLS de administrador

**⚠️ Severidad: Media**

**📍 Ubicación:** `App.tsx` — línea 1599, función `handleDeleteReview` · `supabase-reviews-rls.sql`

**🔍 Descripción:**
La función `handleDeleteReview` ejecuta un `DELETE` directo en Supabase usando
únicamente el `reviewId`, sin ningún tipo de verificación de rol en el servidor:

```typescript
// App.tsx:1599 — PROBLEMA: sin verificación de rol; cualquier usuario autenticado
// puede llamar esto directamente desde la consola del navegador
const { error } = await supabase
  .from('reviews')
  .delete()
  .eq('id', reviewId);  // ← solo filtra por ID, no verifica quién es el que borra
```

El archivo `supabase-reviews-rls.sql` define políticas para `SELECT`, `INSERT`
y `UPDATE`, pero **no define ninguna política `FOR DELETE`**. En Supabase,
cuando no existe una política para una operación específica, esa operación
queda **bloqueada por defecto** si RLS está activo. Sin embargo, si RLS no
está activo en la tabla o si se desactiva accidentalmente, cualquier usuario
autenticado puede borrar reseñas de cualquier profesional.

**🛠️ Solución y Código:**

**Agregar la policy DELETE explícita en Supabase SQL Editor:**
```sql
-- Eliminar la policy anterior si existe
DROP POLICY IF EXISTS "Authors or admins can delete reviews" ON public.reviews;

-- Solo el autor de la reseña puede borrar la suya propia,
-- o un administrador puede borrar cualquier reseña
CREATE POLICY "Authors or admins can delete reviews"
ON public.reviews
FOR DELETE TO authenticated
USING (
  -- El autor puede eliminar su propia reseña
  author_id = auth.uid()
  OR
  -- Un admin puede eliminar cualquier reseña
  (
    SELECT raw_app_meta_data->>'role'
    FROM auth.users
    WHERE id = auth.uid()
  ) = 'admin'
);
```

**Verificar que RLS esté activo en la tabla reviews:**
```sql
-- Verificar el estado de RLS en la tabla
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'reviews' AND relnamespace = 'public'::regnamespace;

-- Si relrowsecurity es false, activarlo:
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
```

---

### 🛑 Vulnerabilidad 8: Dependencias con rango amplio `^` en package.json

**⚠️ Severidad: Baja**

**📍 Ubicación:** `package.json` — todas las entradas de `dependencies` y `devDependencies`

**🔍 Descripción:**
Todas las dependencias del proyecto usan el prefijo `^` (caret), que permite
que `npm install` instale automáticamente cualquier versión minor y patch
nuevas sin aprobación explícita:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.89.0",
    "react": "^19.2.3",
    "react-router-dom": "^7.13.2",
    "gsap": "^3.15.0"
  }
}
```

Si algún paquete publica una versión comprometida (ataque de supply chain),
el próximo `npm install` en el servidor de CI/CD de Vercel podría instalarla
automáticamente y desplegar código malicioso a producción sin que nadie
lo note. Este tipo de ataque ha ocurrido con paquetes populares de npm en
el pasado (event-stream, ua-parser-js, colors, etc.).

**🛠️ Solución y Código:**

**Paso 1 — Usar `npm ci` en el pipeline de despliegue (instala exactamente lo del lock):**
```bash
# En lugar de npm install (que puede actualizar versiones):
npm ci
```

**Paso 2 — Agregar auditoría de seguridad como parte del proceso de build:**
```json
{
  "scripts": {
    "prebuild": "npm audit --audit-level=high && node generate-sitemap.js",
    "build": "vite build"
  }
}
```

**Paso 3 — Fijar versiones exactas para las dependencias más críticas:**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "2.89.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-router-dom": "7.13.2"
  }
}
```

**Paso 4 — Revisar vulnerabilidades conocidas ahora mismo:**
```bash
npm audit
# Si hay vulnerabilidades críticas:
npm audit fix
```

---

## ✅ Plan de Acción Priorizado

### 🔴 Inmediato — Hoy mismo

```
1. Ejecutar: git log --all --full-history -- .env.local
   → Si muestra commits: rotar la anon key en Supabase Dashboard → Settings → API
2. Cambiar VITE_ADMIN_PASSWORD en .env.local a una nueva contraseña
3. Agregar la policy DELETE de reseñas en Supabase SQL Editor (Vulnerabilidad 7)
```

### 🟠 Esta semana — Antes del siguiente deploy

```
4. Crear vercel.json con las cabeceras de seguridad HTTP (Vulnerabilidad 3)
5. Corregir el redirectTo del OAuth en AuthModal.tsx (Vulnerabilidad 6)
6. Auditar tablas sin RLS con la query SQL provista (Vulnerabilidad 4)
7. Agregar el bloqueo por intentos en el login de admin (Vulnerabilidad 5)
```

### 🟡 Antes del lanzamiento en producción

```
8. Migrar la autenticación del panel admin a roles de Supabase Auth (Vulnerabilidad 2)
9. Agregar npm ci y npm audit al pipeline de despliegue (Vulnerabilidad 8)
10. Aplicar el rate limiting de service_requests a nivel de RLS (Vulnerabilidad 5)
```

---

*Informe generado el 2026-06-27 · EsMiOficio Security Audit v1.1*
*Analista: Claude Sonnet 4.6 (AppSec SAST) · Basado en OWASP Top 10 2021*
