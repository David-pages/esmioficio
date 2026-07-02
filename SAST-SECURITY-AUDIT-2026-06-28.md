# Informe SAST de seguridad — EsMiOficio

**Fecha:** 2026-06-28  
**Alcance:** código fuente React/Vite, cliente Supabase, migraciones SQL, autenticación, autorización, Storage, configuración de despliegue y dependencias npm.  
**Metodología:** revisión estática orientada a OWASP Top 10, OWASP API Security Top 10 y controles específicos de Supabase/Postgres.  
**Limitación:** no se contó con acceso al proyecto Supabase desplegado; las políticas activas, Auth settings, CORS y asesores de seguridad del entorno remoto deben verificarse por separado.

## Resumen ejecutivo

Se confirmaron **6 vulnerabilidades**: 1 crítica, 3 altas, 1 media y 1 baja. El riesgo dominante está en la capa de datos. La única migración versionada no puede ejecutarse por un error de sintaxis; además, el diseño actual permite consultar en masa teléfonos con cualquier cuenta, fabricar reseñas “elegibles” sin completar un servicio y contaminar tablas de telemetría desde una sesión anónima.

El proyecto auditado **no usa Next.js**: es una SPA React 19 + Vite 6. Por ello no existen Server Components, SSR, Server Actions ni API Routes en el alcance actual. React escapa el texto interpolado y no se encontró `dangerouslySetInnerHTML`, `eval` ni construcción dinámica de código.

## Hallazgos

🛑 Vulnerabilidad: La migración de seguridad completa falla por SQL inválido

⚠️ Severidad: Crítica

📍 Ubicación: `supabase/migrations/20260627163000_initial_secure_architecture.sql:378`

🔍 Descripción: La política `job_posts_public_open` termina con `using(status='OPEN');` y omite el paréntesis de cierre de `using (...)`. En una migración transaccional, Postgres abortará el archivo completo. Una instalación limpia quedará sin las tablas, RLS, revocaciones, triggers de protección y políticas que este archivo pretende establecer. Si el despliegue continúa contra un esquema heredado, la aplicación puede operar bajo permisos anteriores y más débiles, creando una falsa sensación de protección. Esto corresponde a OWASP A05:2021 (Security Misconfiguration).

🛠️ Solución y Código: Corregir la política, ejecutar la migración en una base desechable y hacer que CI aplique todas las migraciones desde cero. No marcar la migración como aplicada manualmente.

```sql
create policy job_posts_public_open
on public.job_posts_public
for select
to anon, authenticated
using (status = 'OPEN');
```

Como control de CI, levantar Supabase local y ejecutar `supabase db reset`; el pipeline debe fallar ante cualquier error SQL.

---

🛑 Vulnerabilidad: Exposición masiva de teléfonos a cualquier usuario autenticado (BOLA)

⚠️ Severidad: Alta

📍 Ubicación: `supabase/migrations/20260627163000_initial_secure_architecture.sql:363, 379, 403, 406`

🔍 Descripción: Las políticas y `GRANT SELECT` permiten a cualquier rol `authenticated` leer todas las filas de `professional_contacts` y `job_post_contacts`. Un atacante sólo necesita registrar una cuenta y consultar directamente PostgREST, sin usar la interfaz ni los RPC de desbloqueo. Puede enumerar teléfonos de profesionales y clientes en bloque. Los RPC de las líneas 178–183 y 247–253 tampoco exigen relación, rol profesional, solicitud previa ni consentimiento: únicamente comprueban que exista un `auth.uid()`. Es OWASP API1:2023 (Broken Object Level Authorization) y exposición de datos personales.

🛠️ Solución y Código: Revocar el acceso directo a las tablas y exponer únicamente funciones con autorización contextual. El siguiente ejemplo permite leer el teléfono de una publicación abierta sólo a perfiles profesionales y evita enumerar la tabla:

```sql
drop policy if exists job_post_contacts_authenticated on public.job_post_contacts;
drop policy if exists professional_contacts_authenticated_read on public.professional_contacts;
revoke all on public.job_post_contacts, public.professional_contacts
from anon, authenticated;

create or replace function public.get_job_post_contact(p_job_post_id uuid)
returns table(phone_number text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.phone_number
  from public.job_post_contacts c
  join public.job_posts_public p on p.id = c.job_post_id
  join public.profiles me on me.id = (select auth.uid())
  where c.job_post_id = p_job_post_id
    and p.status = 'OPEN'
    and me.role = 'PRO';
$$;

revoke all on function public.get_job_post_contact(uuid) from public, anon;
grant execute on function public.get_job_post_contact(uuid) to authenticated;
```

Aplicar un control equivalente a `get_professional_contact`, ligado a una solicitud/contacto autorizado, y registrar el acceso para detección de scraping. Una función `security definer` debe conservar `search_path = ''`, usar nombres totalmente calificados y tener `EXECUTE` revocado de `PUBLIC`.

---

🛑 Vulnerabilidad: Reseñas fabricables sin contratación o servicio completado

⚠️ Severidad: Alta

📍 Ubicación: `supabase/migrations/20260627163000_initial_secure_architecture.sql:367, 370`; `App.tsx:303-349`

🔍 Descripción: Un cliente puede insertar por sí mismo una solicitud en estado `PENDING` (incluso `COMPLETED`, permitido explícitamente por la política) y la política de reseñas considera elegible cualquier solicitud `PENDING`, `QUOTED`, `CONFIRMED` o `COMPLETED`. La función cliente `ensureReviewEligibility` crea automáticamente una solicitud `PENDING` al contactar. Por tanto, cualquier cuenta puede elegir un profesional y publicar una reseña sin que el profesional confirme la relación. Esto permite manipulación de reputación positiva o negativa y rompe el control de integridad de negocio; es OWASP A01:2021 (Broken Access Control).

🛠️ Solución y Código: Permitir al cliente crear únicamente `PENDING` y aceptar reseñas sólo después de una transición server-side a `COMPLETED`. Idealmente, encapsular la creación de reseña en un RPC transaccional.

```sql
drop policy if exists service_requests_client_insert on public.service_requests;
create policy service_requests_client_insert
on public.service_requests for insert to authenticated
with check (
  client_id = (select auth.uid())
  and status = 'PENDING'
);

drop policy if exists reviews_eligible_insert on public.reviews;
create policy reviews_eligible_insert
on public.reviews for insert to authenticated
with check (
  author_id = (select auth.uid())
  and exists (
    select 1
    from public.service_requests s
    where s.client_id = (select auth.uid())
      and s.professional_id = reviews.professional_id
      and s.status = 'COMPLETED'
  )
);
```

Eliminar `ensureReviewEligibility` como creador automático de solicitudes; el contacto puede registrarse como evento, pero no debe conferir el derecho a reseñar.

---

🛑 Vulnerabilidad: Credenciales de prueba hardcodeadas y función de seeding incluida en producción

⚠️ Severidad: Alta

📍 Ubicación: `constants.ts:280-290`; `lib/seedData.ts:4-23`; `App.tsx:39, 1878`

🔍 Descripción: Dos correos y la contraseña compartida `Password123!` están incluidos en el bundle porque `App.tsx` importa el seeder. La herramienta intenta registrar esas cuentas o iniciar sesión si ya existen. Cualquier persona puede extraer las credenciales del JavaScript publicado e intentar acceder a cuentas de prueba que hayan sido creadas en producción. Además, una cuenta compartida impide atribución y revocación individual. Es OWASP A07:2021 (Identification and Authentication Failures).

🛠️ Solución y Código: Eliminar usuarios, contraseñas y seeding del frontend. Crear datos de desarrollo desde un script local no empaquetado, con credenciales aleatorias suministradas en ejecución y contra un proyecto local verificado.

```ts
// App.tsx: eliminar
// import { seedTestUsers } from './lib/seedData';
// y eliminar la acción onSeedData del panel de producción.

// scripts/seed-local.ts (no importado por la aplicación)
const email = process.env.SEED_USER_EMAIL;
const password = process.env.SEED_USER_PASSWORD;

if (process.env.SUPABASE_URL?.includes('localhost') !== true) {
  throw new Error('El seeding sólo está permitido contra Supabase local');
}
if (!email || !password || password.length < 16) {
  throw new Error('Define credenciales de seed fuertes y efímeras');
}
```

Buscar y eliminar las cuentas `usuario.normal@test.com` y `profesional.test@test.com` del proyecto remoto, revocar sus sesiones y revisar sus acciones.

---

🛑 Vulnerabilidad: Inserción anónima ilimitada en telemetría y feed público

⚠️ Severidad: Media

📍 Ubicación: `supabase/migrations/20260627163000_initial_secure_architecture.sql:387, 390, 410`; `supabase/migrations/20260627163000_initial_secure_architecture.sql:208-216`

🔍 Descripción: `anon` puede insertar directamente en `activity_events` y `analytics_events` sin límite por IP/sesión, sin restricción de longitud en varios textos/JSON y sin lista cerrada para `activity_events.type`. Cada actividad también dispara una escritura en `activity_events_public`, amplificando el consumo y contaminando un feed público. Un atacante con la publishable key —que legítimamente está en el bundle— puede automatizar millones de inserciones, aumentar costos y degradar datos operativos. Es OWASP API4:2023 (Unrestricted Resource Consumption).

🛠️ Solución y Código: Revocar inserción directa anónima, validar tamaños/tipos en SQL y enviar telemetría a una Edge Function con rate limiting por IP/dispositivo. Si debe conservarse el Data API, exigir sesión y aplicar límites fuertes:

```sql
revoke insert on public.activity_events, public.analytics_events from anon;
drop policy if exists activity_safe_insert on public.activity_events;
drop policy if exists analytics_safe_insert on public.analytics_events;

alter table public.activity_events
  add constraint activity_type_allowed
  check (type in ('profile_view', 'contact', 'search')),
  add constraint activity_text_limits
  check (
    char_length(coalesce(city, '')) <= 100
    and char_length(coalesce(zone, '')) <= 100
    and char_length(coalesce(trade, '')) <= 100
  );

alter table public.analytics_events
  add constraint analytics_metadata_size
  check (octet_length(metadata::text) <= 4096);
```

El rate limiting real no debe basarse sólo en `localStorage`; debe ejecutarse antes de llegar a Postgres o dentro de un RPC transaccional.

---

🛑 Vulnerabilidad: Política incompleta para archivos privados de evidencia

⚠️ Severidad: Baja

📍 Ubicación: `supabase/migrations/20260627163000_initial_secure_architecture.sql:447-448`

🔍 Descripción: El bucket privado `report-evidence` sólo define `INSERT` y `SELECT`; no existen políticas de `DELETE` ni un flujo explícito de retención. Un usuario que suba por error evidencia sensible no puede retirarla, mientras que los objetos pueden persistir indefinidamente aun si el reporte se elimina. También se autoriza lectura comparando segmentos del nombre del objeto, pero no se valida que ese path corresponda a un reporte real en el que el usuario sea parte. Un path mal formado o elegido por el uploader puede debilitar el modelo de acceso. Es una debilidad de privacidad y OWASP A01/A04.

🛠️ Solución y Código: Usar paths canónicos `report-id/user-id/uuid.ext`, comprobar la relación contra `reports` y definir borrado por propietario/admin junto con una política de retención.

```sql
drop policy if exists storage_report_select on storage.objects;
create policy storage_report_select
on storage.objects for select to authenticated
using (
  bucket_id = 'report-evidence'
  and exists (
    select 1 from public.reports r
    where r.id::text = split_part(name, '/', 1)
      and (
        r.user_id = (select auth.uid())
        or r.professional_id = (select auth.uid())
        or (select private.is_admin())
      )
  )
);

create policy storage_report_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'report-evidence'
  and (
    owner_id = (select auth.uid())::text
    or (select private.is_admin())
  )
);
```

## Controles revisados sin hallazgo explotable confirmado

- No se encontró `service_role`, secret key, token privado ni contraseña administrativa Supabase en el código. `VITE_SUPABASE_ANON_KEY`/publishable key es pública por diseño y la autorización debe depender de RLS.
- `.env.local` no está versionado y queda cubierto por `*.local`. `.env.production` contiene únicamente URL y publishable key, pero conviene ignorarlo para evitar que futuros secretos terminen en Git.
- El panel administrativo valida el usuario con `supabase.auth.getUser()` y `app_metadata.role`; la base usa una tabla privada `private.app_roles`. Las operaciones críticas siguen necesitando autorización SQL.
- Las vistas de seguridad de la migración declaran `security_invoker = true`; las funciones privilegiadas fijan `search_path = ''` y revocan `PUBLIC` en los casos revisados.
- Se encontraron CSP, HSTS, anti-framing, `nosniff`, Referrer Policy y Permissions Policy en Vercel/Netlify. En Vercel conviene añadir `base-uri 'self'` y `form-action 'self'` para igualar Netlify.
- No se observó CORS permisivo en el repositorio. La allowlist real de Supabase/Auth y URLs de redirección debe revisarse en Dashboard.
- `npm audit --json` reportó 0 vulnerabilidades conocidas en 214 dependencias al 2026-06-28; las versiones están fijadas y existe lockfile. Esto no cubre vulnerabilidades aún no publicadas ni código malicioso sin advisory.

## Prioridad de remediación

1. Corregir y probar la migración completa desde cero.
2. Revocar lectura directa de tablas de contactos y endurecer los RPC.
3. Cerrar la fabricación de reseñas y retirar las cuentas/credenciales de prueba.
4. Limitar telemetría y corregir el control de evidencia privada.
5. Verificar en el Supabase remoto: migraciones aplicadas, RLS habilitado, grants efectivos, Auth redirect allowlist, JWT expiry, Storage policies y Security/Performance Advisors.

## Validaciones ejecutadas

- `npm audit --json`: 0 vulnerabilidades conocidas.
- `npm run typecheck`: correcto.
- `npm run build`: correcto.
- Búsqueda SAST de secretos, sinks XSS, ejecución dinámica, almacenamiento de sesión, accesos Supabase, políticas RLS, funciones `security definer`, grants y configuración de cabeceras.
- Revisión del changelog vigente de Supabase para cambios incompatibles relevantes; no se identificó uno que invalide las correcciones propuestas.
