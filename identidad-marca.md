# Guía de Identidad de Marca para Publicidad con IA

> **Marca:** EsMiOficio · **Versión:** 1.0 · **Fecha:** 2026-06-21
> **Uso:** Documento de contexto para modelos de IA generativa de imágenes y publicidad (redes sociales, flyers, banners, historias, anuncios y posts).
>
> **Fuentes analizadas:** `tailwind.config.cjs`, `index.css`, `index.html`, `metadata.json`, `public/og-image.svg`, `iconography-guide.md`, `components/Hero.tsx`, `components/AboutUs.tsx`, `components/Footer.tsx`, `components/MexicoFocus.tsx`, `constants.ts` y demás componentes del directorio `components/`.
>
> Todo dato marcado como **(Inferido)** es una interpretación de diseño, no una afirmación literal de la página. Lo marcado como **No identificado** no aparece en el código analizado.

---

## 1. Resumen de la marca

**EsMiOficio** es una plataforma web mexicana para encontrar profesionales de oficios confiables (albañiles, plomeros, electricistas, mecánicos, carpinteros, pintores y más de 30 oficios). Nace en **Morelia, Michoacán**, con vocación de expandirse a todo México (cubre los 32 estados y sus municipios).

| Atributo | Descripción |
|---|---|
| **Nombre** | EsMiOficio (también "EsMiOficio México") |
| **Qué ofrece** | Directorio y red de profesionales de oficios con perfiles, portafolio, reseñas verificadas y contacto directo por WhatsApp. |
| **Público objetivo** | Dos lados: **(1) Clientes** — personas que necesitan resolver un problema del hogar/negocio (fugas, apagones, pintura, reparaciones), normalmente con urgencia y deseo de confianza. **(2) Profesionales** — trabajadores de oficios que buscan presencia digital sin complicaciones técnicas para conseguir más clientes. |
| **Propuesta de valor** | Conectar de forma **confiable, transparente y local** a clientes con profesionales verificados, con reseñas reales y trato directo sin intermediarios ni comisiones ocultas. |
| **Personalidad de marca** | Confiable, práctica, cercana, honesta, profesional pero accesible, con orgullo local mexicano. |
| **Sensación que transmite** | Seguridad, tranquilidad, seriedad sin frialdad, "alguien de confianza cerca de ti". |
| **Nivel de formalidad** | Medio. Profesional y serio, pero con tuteo y lenguaje cotidiano. No corporativo-acartonado ni informal-juvenil. |
| **Diferenciador principal** | **Confianza verificable + enfoque local**: reseñas que solo deja quien realmente contactó/contrató, señales de verificación, cobertura por estado/municipio/colonia y centro de seguridad (reportes y mediación). |

**Frases de marca textuales:**
- "Conectando comunidades en todo México con talento local de confianza a través de la transparencia."
- "Revalorizando el trabajo honesto y conectando a la comunidad de Michoacán."
- "Nuestra misión es dignificar y digitalizar los oficios tradicionales, creando un puente confiable entre los profesionales locales y las personas que necesitan sus servicios."
- "Hecho con orgullo para México."

---

## 2. Análisis de la página web

- **Tipo de sitio:** Aplicación web (React + Tailwind), **dark mode** nativo (`<html class="dark">`, `theme-color #121212`), mobile-first.
- **Estructura de la home:** Hero con buscador prominente (oficio + estado + municipio + botón) → accesos rápidos a necesidades populares → categorías de oficios con iconos → profesionales destacados → enfoque México (cobertura) → testimonios → centro de seguridad/confianza → footer.
- **Jerarquía de textos:** Titular grande y contundente (`font-black`, hasta 60px) → subtítulo descriptivo en gris claro → tarjetas escaneables con nombre, oficio, rating, ubicación y verificación.
- **Patrón visual dominante:** Tarjetas oscuras (`#1E1E1E`) con borde fino (`#333333`), acento dorado en CTAs e iconos clave, badges tipo pill (nivel amarillo, verificado azul), foto de profesional circular.
- **Llamados a la acción (CTA) principales:** "Buscar profesional", "Registrar mi oficio", "Usar mi ubicación", contacto por WhatsApp (verde).
- **Tono de comunicación:** Directo, orientado a resolver, con verbos de acción ("Busca, revisa trabajos reales y contacta…").
- **Tipo de imágenes:** Fotografías reales de profesionales (avatares tipo retrato, fuente Unsplash en datos de ejemplo). No usa ilustraciones caricaturescas.
- **Iconografía:** Google **Material Symbols Outlined** (lineal, rounded, minimalista), un mark propio de herramienta en `og-image.svg`, y `lucide-react` puntual.

---

## 3. Identidad visual

**Estilo general:** moderno · oscuro (dark mode) · minimalista · profesional · utilitario · local mexicano. **No** premium-lujo, **no** infantil, **no** corporativo frío.

### Colores principales

| Uso | Color | HEX | Descripción |
|---|---|---|---|
| Acento primario | 🟡 Dorado | `#E6B319` | CTAs, iconos clave, texto destacado, barras de métricas. Es **la firma de la marca** (confianza, acción, valor). |
| Primario hover | 🟡 Dorado oscuro | `#D4A415` | Estado hover de botones principales. |
| Fondo general | ⬛ Carbón | `#121212` | Fondo base de toda la interfaz. |
| Superficie | ⬛ Grafito | `#1E1E1E` | Cards, modales, paneles. |
| Superficie alterna | ⬛ Gris oscuro | `#2C2C2C` | Inputs, subcards, botones neutros. |
| Borde | ▪️ Gris | `#333333` | Bordes finos de cards, inputs y paneles. |
| Texto principal | ⬜ Blanco | `#FFFFFF` | Títulos, nombres, contenido principal. |

### Colores secundarios

| Uso | Color | HEX | Descripción |
|---|---|---|---|
| Texto secundario | Gris claro | `#9CA3AF` | Párrafos, descripciones, ayudas. |
| Texto suave / metadata | Gris medio | `#6B7280` | Labels, placeholders, datos menores. |
| Contacto / WhatsApp | 🟢 Verde | `#16A34A` | Botón de contacto y acciones de WhatsApp. |
| Éxito | 🟢 Verde claro | `#22C55E` | Estados positivos, trabajo completado. |
| Verificación / info | 🔵 Azul | `#60A5FA` | Badge "Verificado", estados informativos. |
| Advertencia / nivel | 🟡 Amarillo | `#FACC15` | Badge de nivel, pendientes, advertencias suaves. |
| Error / reporte | 🔴 Rojo | `#EF4444` | Errores, favoritos activos, eliminar, reportes. |
| Glow secundario (hero) | 🌸 Magenta tenue | `#831843` aprox. (`bg-pink-900`) | Resplandor decorativo muy sutil en el hero, baja opacidad. |

> Los colores por oficio (azul plomería, amarillo electricidad, ámbar carpintería, etc.) existen en la app pero son **acentos de categoría**, no colores de marca. Para publicidad, mantener el dorado como acento dominante.

### Combinaciones recomendadas

- **Fondo carbón `#121212` + texto blanco `#FFFFFF` + acento dorado `#E6B319`** → combinación maestra de marca.
- **Card `#1E1E1E` + borde `#333333` + título blanco + dato gris `#9CA3AF`** → tarjetas y módulos.
- **Botón dorado `#E6B319` + texto carbón `#121212`** → CTA principal (texto oscuro sobre dorado, nunca texto blanco sobre dorado).
- **Botón / badge verde `#16A34A`** → exclusivamente para contacto/WhatsApp.

### Combinaciones que se deben evitar

- Fondos claros o blancos como base (rompe el dark mode de la marca).
- Texto blanco directamente sobre dorado (bajo contraste; el dorado lleva texto oscuro).
- Dorado como color de fondo de áreas grandes (es **acento**, no relleno masivo).
- Mezclar muchos colores de oficio a la vez como protagonistas (satura y le quita seriedad).
- Degradados llamativos, neón o pasteles dominantes.

---

## 4. Tipografías

| Rol | Fuente | Notas |
|---|---|---|
| **Principal** | **Inter** (sans-serif) | Cargada en pesos 300–800 desde Google Fonts. Única familia textual de la marca. |
| Secundaria | No identificada | No existe una segunda familia textual; los iconos usan su propia fuente (Material Symbols). |
| Iconos | Material Symbols Outlined | `opsz=24, wght=400, FILL=0, GRAD=0`. |
| Recomendada si Inter no está disponible | (Inferido) Geist, Plus Jakarta Sans, Manrope o Helvetica/Arial | Sustitutos neutros, geométricos, sans-serif. |

**Pesos y jerarquía:**

| Uso | Peso | Tamaño aprox. | Estilo |
|---|---|---|---|
| Títulos hero (H1) | `font-black` (800–900) | 36px móvil / 60px desktop | Bold contundente, *tracking* ajustado. |
| Títulos de sección (H2) | Bold (700) | 24–30px | — |
| Títulos de tarjeta (H3) | Bold (700) | 18–20px | — |
| Cuerpo de texto | Regular/Medium (400–500) | 14–16px | Gris claro. |
| Botones | Bold/Black (700–800) | 14–16px | Mayúscula inicial, no todo mayúsculas. |
| Etiquetas micro / badges | Bold/Black (700–900) | 10–12px | `UPPERCASE`, pill. |

**Uso recomendado:** títulos en **Inter Black/Bold** y blanco (con la palabra clave en dorado); cuerpo en **Inter Regular** gris claro; botones en **Inter Bold**; badges en mayúsculas pequeñas.

---

## 5. Estilo gráfico

- **Composición:** limpia, ordenada, mobile-first, mucho aire negativo sobre fondo oscuro. Contenedores centrados (`max-w-7xl` / `max-w-5xl`).
- **Tarjetas / secciones:** fondo `#1E1E1E`, borde `#333333`, **esquinas redondeadas 16px** (`rounded-2xl`), hover con borde dorado suave. Sombras discretas y negras (`shadow-2xl`, `shadow-black/50`).
- **Botones:**
  - *Principal:* dorado `#E6B319`, texto carbón, bold, radio 8–12px, hover `#D4A415`, micro-animación `active:scale-95`.
  - *Secundario:* fondo `#2C2C2C` o transparente, borde `#333333`, texto blanco/gris, hover claro.
  - *Contacto:* verde `#16A34A`.
- **Inputs / formularios:** altura 48–56px, fondo `#2C2C2C`, borde `#333333`, placeholder gris, foco con borde dorado.
- **Badges:** pills (`border-radius: 9999px`), microtipografía en mayúsculas, fondo tintado translúcido (ej. dorado al 12%, azul al 12%).
- **Efectos:** resplandores (glow) muy sutiles dorado y magenta detrás del hero con `blur` fuerte y baja opacidad (~20%). Sin degradados llamativos.
- **Iconos:** Material Symbols Outlined — lineales, rounded, minimalistas; por defecto dorados, grises los secundarios, azul verificación, verde WhatsApp, rojo error.
- **Fotografías:** retratos reales de profesionales (preferente circular para avatares), trabajo manual real. Estilo documental/auténtico, no stock acartonado ni caricatura.
- **Fondos recomendados:** carbón liso `#121212` o `#1E1E1E`, opcionalmente con glow dorado sutil o textura técnica muy discreta.

**Mark de marca:** cuadrado dorado redondeado (`#E6B319`, radio ~18px) con un icono de **herramienta** (llave/destornillador) en negativo carbón `#121212`. El icono de UI asociado es `construction`.

---

## 6. Tono de comunicación

- **Cómo habla la marca:** cercana pero seria, en **tú**, español de México neutro. Orientada a resolver el problema del usuario con claridad y rapidez.
- **Palabras frecuentes:** confianza, confiable, profesional, oficio, verificado, reseñas, cerca de ti, local, seguridad, transparencia, comunidad, honesto, talento local, WhatsApp.
- **Frases clave reales:**
  - "Encuentra profesionales confiables cerca de ti."
  - "Busca, revisa trabajos reales y contacta por WhatsApp con más seguridad."
  - "Encuentra oficio por zona, confianza y tipo de trabajo."
  - "Hecho para contratar en México."
  - "Sin intermediarios ocultos ni comisiones sorpresa."
- **Nivel de cercanía:** alto pero respetuoso. Habla como un vecino confiable que te recomienda a alguien bueno.
- **Emociones a provocar:** tranquilidad, confianza, alivio ("ya encontré a alguien bueno"), orgullo local.
- **Lenguaje a evitar:** tecnicismos corporativos, promesas exageradas, jerga juvenil/slang excesivo, lenguaje alarmista o de miedo, anglicismos innecesarios, tono frío o impersonal.

---

## 7. Mensajes clave

**Beneficios principales:**
- Encuentras profesionales **confiables y verificados** cerca de ti.
- Ves **trabajos reales y reseñas** antes de contratar.
- Contactas **directo por WhatsApp**, sin intermediarios ni comisiones.
- Cobertura **local**: por estado, municipio y colonia.
- Centro de seguridad: reportes, mediación y niveles de verificación.

**Problemas que resuelve:**
- La dificultad de encontrar un buen albañil/plomero/mecánico de confianza, sobre todo en urgencias.
- La limitación del "boca en boca".
- La incertidumbre de no saber si un profesional es serio o si su trabajo es bueno.
- Para el profesional: falta de presencia digital sin saber de tecnología.

**Promesas comerciales:**
- "Profesionales confiables, verificados y cerca de ti."
- "Reseñas reales de clientes reales."
- "Trato y pago directos, sin comisiones ocultas."

---

## 8. Llamados a la acción

**CTA para botones (textos cortos):**
- `Buscar profesional`
- `Registrar mi oficio`
- `Usar mi ubicación`
- `Contactar por WhatsApp`
- `Ver perfil`
- `Publicar lo que necesito`

**Frases para encabezados:**
- "Encuentra profesionales confiables cerca de ti."
- "El oficio que necesitas, alguien de confianza cerca."
- "Tu próximo plomero, electricista o albañil de confianza está aquí."
- "Hecho para contratar en México."

**Frases cortas para anuncios:**
- "¿Una fuga? ¿Un apagón? Encuentra al experto de confianza hoy."
- "Reseñas reales. Profesionales verificados. Cerca de ti."
- "Sin intermediarios. Sin comisiones ocultas. Solo talento local."
- "¿Eres profesional de un oficio? Consigue más clientes en tu zona."

**Frases para posts de redes sociales:**
- "Encontrar un buen plomero ya no es cuestión de suerte 🔧 Busca por zona, mira reseñas reales y contacta directo. #EsMiOficio"
- "Detrás de cada oficio hay alguien que se la rifa. Lo conectamos con quien lo necesita. 🇲🇽"
- "Verificado ✅ Reseñado ⭐ Cerca de ti 📍 Así contratas con EsMiOficio."

---

## 9. Reglas visuales para publicidad

**Qué debe aparecer siempre:**
- Fondo oscuro carbón (`#121212` / `#1E1E1E`).
- Acento dorado `#E6B319` (en CTA, icono clave o detalle).
- Logotipo / palabra **EsMiOficio** y/o el mark de herramienta dorado.
- Sensación de confianza local mexicana.

**Qué puede variar:**
- El oficio protagonista (plomero, electricista, pintor, mecánico, etc.) y su color de categoría como acento secundario puntual.
- La ciudad/zona mencionada.
- Fotografía vs. composición gráfica con iconos.
- El glow decorativo (dorado/magenta) sutil de fondo.

**Qué NO debe aparecer:**
- Fondos blancos o claros como base.
- Ilustraciones caricaturescas, 3D cartoon o mascotas infantiles.
- Degradados saturados, neón o paletas pastel dominantes.
- Texto blanco sobre dorado.
- Logos de terceros (incluido el logo oficial de WhatsApp; usar icono de chat/teléfono genérico en verde).
- Tono alarmista, sexualizado o estereotipos negativos del trabajo manual.

**Especificaciones obligatorias:**
- **Estilo visual:** dark mode moderno, minimalista, profesional, utilitario.
- **Estilo de imagen recomendado:** fotografía realista y auténtica de profesionales de oficio en su contexto laboral, **o** composición gráfica tipo UI (cards oscuras + iconos lineales dorados).
- **Personas / objetos / escenas sugeridas:** trabajadores reales mexicanos (plomero con herramienta, electricista en panel, pintor con rodillo, mecánico, albañil), herramientas, manos trabajando, hogares y negocios locales. Diversidad de edades y géneros.
- **Nivel de realismo:** alto (fotorrealista) en piezas con personas; flat/lineal limpio en piezas de iconografía UI.
- **Iluminación:** cálida y direccional, con destellos dorados; sombras profundas sobre fondo oscuro; estilo cinematográfico sobrio.
- **Encuadre:** limpio, con espacio negativo para texto; primeros planos de personas o manos; planos medios de trabajo real. Composición equilibrada, jerárquica.

---

## 10. Formatos recomendados para redes sociales

| Formato | Relación de aspecto | Uso |
|---|---|---|
| Post cuadrado | **1:1** (1080×1080) | Feed de Instagram/Facebook. |
| Anuncio vertical | **4:5** (1080×1350) | Feed vertical, mayor presencia. |
| Historia / Reel | **9:16** (1080×1920) | Stories, Reels, TikTok, status. |
| Banner horizontal | **16:9** (1200×675) | Web, YouTube, display, OpenGraph (1200×630). |
| Flyer | **3:4 / A4** | Impreso o digital descargable. |

---

## 11. Prompts base para generar imágenes

> Copiar y pegar. Sustituir `[OFICIO]`, `[CIUDAD]` y `[TEXTO]` según la campaña. Todos asumen la identidad EsMiOficio: dark mode carbón + acento dorado + Inter + confianza local.

### Post cuadrado 1:1
```
Anuncio publicitario para EsMiOficio, plataforma mexicana de profesionales de oficios confiables. Formato cuadrado 1:1. Fotografía realista y cálida de un [OFICIO] mexicano trabajando con sus herramientas, sonrisa profesional y confiada. Fondo oscuro carbón #121212 con un sutil resplandor dorado. Paleta dark mode: fondo #121212, superficies #1E1E1E, acento dorado #E6B319. Composición limpia y minimalista con espacio negativo para un titular corto en tipografía sans-serif estilo Inter, blanca con una palabra en dorado. Pequeño badge dorado de "Verificado". Iluminación cinematográfica direccional, sombras profundas, estética profesional y de confianza local. Sin texto adicional, sin logos de terceros. --ar 1:1
```

### Anuncio vertical 4:5
```
Pieza vertical 4:5 para EsMiOficio (red de oficios de confianza en México). Mockup de interfaz dark mode: tarjeta de profesional sobre fondo carbón #121212, card #1E1E1E con borde fino #333333 y esquinas redondeadas, foto circular de un [OFICIO], nombre, estrellas de calificación en dorado, etiqueta "Verificado" azul y botón dorado #E6B319 con texto oscuro "Contactar". Acento dorado como protagonista, iconos lineales estilo Material Symbols. Tipografía Inter bold. Estilo moderno, minimalista, profesional, confiable. Espacio superior para titular. Iluminación suave con glow dorado. --ar 4:5
```

### Historia 9:16
```
Historia vertical 9:16 a pantalla completa para EsMiOficio. Fondo carbón #121212 con resplandor dorado #E6B319 difuso en una esquina. Primer plano de las manos de un [OFICIO] trabajando (llave de plomero / cables / rodillo de pintura), realismo fotográfico, iluminación cálida cinematográfica. Amplio espacio libre en el tercio superior e inferior para texto y CTA. Estética dark mode premium pero accesible, sensación de confianza y cercanía local mexicana. Sin texto incrustado, dejar zonas limpias para overlays. --ar 9:16
```

### Banner horizontal 16:9
```
Banner horizontal 16:9 para EsMiOficio, directorio de profesionales de oficios en México. Lado izquierdo: espacio para titular en tipografía Inter black blanca con palabra clave en dorado #E6B319 y un botón dorado. Lado derecho: collage sobrio de profesionales de oficio (plomero, electricista, pintor, albañil) sobre fondo carbón #121212. Iconos lineales dorados estilo Material Symbols (search, location_on, shield, verified). Composición equilibrada, minimalista, dark mode, profesional y confiable. --ar 16:9
```

### Flyer promocional
```
Flyer promocional vertical para EsMiOficio. Fondo carbón #121212 con marco y detalles dorados #E6B319. Arriba: mark de marca, un cuadrado dorado redondeado con icono de herramienta en negativo. Centro: fotografía realista de un profesional de oficio mexicano de confianza. Zona inferior con bloque para CTA "Busca profesionales confiables cerca de ti" y un botón dorado. Iconografía de confianza: escudo, verificado, estrellas, ubicación. Estilo moderno, limpio, dark mode, jerárquico, con espacio claro para textos. Tipografía sans-serif bold. --ar 3:4
```

### Imagen sin texto
```
Imagen publicitaria sin ningún texto para EsMiOficio. Retrato cinematográfico de un [OFICIO] mexicano con sus herramientas, expresión confiable y profesional, sobre fondo oscuro carbón #121212 con sutil glow dorado #E6B319. Iluminación cálida direccional, sombras profundas, realismo fotográfico, estética dark mode profesional. Composición centrada y limpia. Absolutamente sin texto, sin letras, sin watermark, sin logos. --ar 1:1
```

### Imagen con espacio para texto
```
Imagen base para anuncio de EsMiOficio con amplia zona vacía para texto. Fondo carbón #121212 con degradado sutil hacia #1E1E1E y un resplandor dorado #E6B319 suave en una esquina. A un lado, fotografía realista de un profesional de oficio; el resto del lienzo limpio y oscuro como área de copy. Composición tipo cartel minimalista dark mode, equilibrada, con jerarquía clara. Iluminación cálida sobria. Sin texto incrustado. --ar 4:5
```

---

## 12. Prompt negativo

```
fondo blanco, fondo claro, colores pastel dominantes, neón, degradados saturados, estilo caricatura, cartoon, 3D infantil, ilustración cómica, mascota, clipart, baja resolución, borroso, deformado, manos deformes, texto incomprensible, letras mal escritas, watermark, logos de marcas reales, logo de WhatsApp, exceso de elementos, saturación excesiva, estética corporativa fría, stock genérico acartonado, brillo plástico, sexualización, estereotipos negativos, desorden visual, tipografías con serifa, look retro vintage
```

---

## 13. Checklist antes de generar publicidad

- [ ] ¿El fondo es oscuro (carbón `#121212` / `#1E1E1E`)?
- [ ] ¿El acento dorado `#E6B319` está presente (CTA, icono o detalle)?
- [ ] ¿La tipografía es sans-serif tipo **Inter**, bold para títulos?
- [ ] ¿El CTA dorado lleva texto oscuro (no blanco)?
- [ ] ¿Hay una señal de confianza visible (verificado, estrellas, escudo, reseña)?
- [ ] ¿Se menciona o sugiere lo **local/mexicano** (ciudad, zona, "México")?
- [ ] ¿Las personas y oficios se ven auténticos y dignos, no estereotipados?
- [ ] ¿Hay espacio limpio para el texto/copy?
- [ ] ¿Los iconos son lineales/outline (estilo Material Symbols)?
- [ ] ¿Se evitan fondos claros, pasteles, caricaturas y logos de terceros?
- [ ] ¿El tono se siente confiable, cercano y profesional (no frío ni alarmista)?

---

## 14. Recomendaciones finales

- El **dorado sobre carbón** es el ADN visual: si una pieza no lo tiene, no es EsMiOficio.
- Trata el dorado como **acento**, nunca como relleno masivo: gana fuerza cuando es escaso.
- Prioriza **fotografía auténtica** de trabajadores reales mexicanos; humaniza el oficio con dignidad.
- Mantén la **confianza verificable** en el centro del mensaje (reseñas reales, verificación, sin comisiones ocultas).
- Refuerza siempre lo **local** ("cerca de ti", nombre de ciudad/colonia).
- Para WhatsApp usa **verde `#16A34A` + icono genérico de chat/teléfono**, no el logo oficial.
- Conserva consistencia de iconografía (Material Symbols Outlined) en toda la línea gráfica.
- Menos es más: composición limpia, un solo titular contundente, un solo CTA.

---

## ⚡ Identidad rápida para pegar en modelos de IA

```
Marca: EsMiOficio — plataforma mexicana de profesionales de oficios confiables (plomeros, electricistas, albañiles, pintores, mecánicos...). Público: clientes que buscan ayuda local de confianza y profesionales de oficio que quieren más clientes.
Estilo: dark mode moderno, minimalista, profesional, utilitario, con orgullo local mexicano.
Colores: fondo carbón #121212 y superficies #1E1E1E/#2C2C2C, bordes #333333, acento DORADO #E6B319 (firma de marca), texto blanco #FFFFFF y gris #9CA3AF, verde WhatsApp #16A34A, azul verificación #60A5FA.
Tipografía: Inter (sans-serif), títulos bold/black; CTA dorado con texto oscuro.
Tono: cercano, confiable, directo, en "tú", honesto, nunca frío ni alarmista.
Imagen: fotografía realista de oficios mexicanos o cards UI oscuras con iconos lineales (Material Symbols), iluminación cálida con glow dorado, espacio limpio para texto.
Reglas: siempre fondo oscuro + acento dorado + señal de confianza + enfoque local. Nunca fondos blancos, pasteles, caricaturas, neón ni logos de terceros.
Formatos: 1:1, 4:5, 9:16, 16:9.
```
