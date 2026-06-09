# EsMiOficio - Guia visual e iconografica

## A) Resumen visual de la marca

EsMiOficio usa una identidad oscura, profesional y utilitaria, con superficies carbon y un acento dorado como senal de confianza, accion y valor. La experiencia se siente moderna, limpia y local: directorio serio de profesionales, no marketplace decorativo.

La marca transmite:

- Confianza practica: verificacion, resenas, trabajos reales y contacto directo.
- Cercania local: ubicacion, ciudad/municipio, oficios y actividad real.
- Profesionalismo accesible: UI sobria, botones claros, tarjetas escaneables.

Archivos fuente principales:

- `tailwind.config.cjs`: colores base y fuente.
- `index.html`: fuente Inter y Material Symbols Outlined.
- `index.css`: fondo base, badges y scrollbar.
- `components/Hero.tsx`: hero, buscador principal, CTA y chips.
- `components/Navbar.tsx`: marca, navegacion y botones de acceso.
- `components/SearchResults.tsx`: cards de profesionales, filtros, badges y CTAs.
- `components/Categories.tsx`: iconos de oficios.
- `components/FeaturedPros.tsx`: cards destacadas.
- `components/ClientDashboard.tsx` y `components/AdminDashboard.tsx`: paneles/dashboards.
- `components/Footer.tsx`: cierre visual de marca.
- `public/og-image.svg`: SVG promocional/OG con la misma paleta.

## B) Guia de estilo breve

### Paleta de colores

| Token | HEX | Uso principal |
|---|---:|---|
| Primario | `#E6B319` | CTAs, iconos clave, texto destacado, barras de metricas |
| Primario hover | `#D4A415` | Hover de botones principales |
| Secundario | `#2C2C2C` | Inputs, botones secundarios, superficies elevadas |
| Acento contacto | `#16A34A` | WhatsApp/contacto |
| Fondo | `#121212` | Fondo general |
| Superficie | `#1E1E1E` | Cards, modales, paneles |
| Superficie alterna | `#2C2C2C` | Inputs, subcards, botones neutros |
| Texto principal | `#FFFFFF` | Titulos, nombres, contenido principal |
| Texto secundario | `#9CA3AF` | Parrafos y ayudas |
| Texto suave | `#6B7280` | Labels, placeholders, metadata |
| Borde | `#333333` | Bordes de cards, inputs, paneles |
| Exito | `#22C55E` | Estados positivos |
| Advertencia | `#FACC15` | Pendientes, nivel, advertencias suaves |
| Error | `#EF4444` | Errores, reportes, eliminar |
| Info/verificacion | `#60A5FA` | Verificado, estados informativos |
| Overlay oscuro | `#000000CC` | Modales/backdrops |
| Hover neutro | `#FFFFFF1A` | Hover de botones secundarios |
| Borde primario suave | `#E6B31980` | Hover/bordes con transparencia |
| Disabled | `#FFFFFF99` | Se aplica por opacity 0.5/0.6, no como color fijo |

### Tipografia

Fuente principal: `Inter`, con fallback `sans-serif`.

Fuente secundaria: no existe una segunda fuente textual. Los iconos Material Symbols cargan su propia fuente.

| Uso | Clase frecuente | Tamano aprox. | Peso | Line-height |
|---|---|---:|---:|---:|
| Hero H1 | `text-4xl sm:text-6xl font-black` | 36px mobile / 60px desktop | 900 sintetico | 40px / 60px |
| H1 paneles | `text-3xl sm:text-4xl font-black` | 30px / 36px | 900 sintetico | 36px / 40px |
| H2 seccion | `text-2xl`, `text-3xl font-bold` | 24px / 30px | 700 | 32px / 36px |
| H3/Card title | `text-lg`, `text-xl font-bold` | 18px / 20px | 700 | 28px |
| Body | base / `text-sm` | 16px / 14px | 400-500 | 24px / 20px |
| Texto pequeno | `text-xs` | 12px | 500-800 | 16px |
| Etiquetas micro | `text-[10px] uppercase font-bold/black` | 10px | 700-900 | 12px |
| Botones | `text-sm`, `text-base font-bold/black` | 14px / 16px | 700-900 | 20px / 24px |

Nota: `index.html` carga Inter en pesos 300-800, pero varios componentes usan `font-black` equivalente a 900. El navegador puede sintetizar ese peso.

### Estilo visual general

- Tipo de diseno: moderno, oscuro, minimalista, operativo y profesional.
- Layout: mobile-first, contenedores `max-w-7xl` para secciones amplias y `max-w-5xl` para hero.
- Tarjetas: fondos `#1E1E1E`, bordes `#333333`, radio 16px, hover con borde dorado suave.
- Botones principales: fondo dorado `#E6B319`, texto oscuro `#121212`, bold/black, radio 8-12px, hover `#D4A415`, active scale 0.95.
- Botones secundarios: fondo `#2C2C2C` o transparente, borde `#333333`, texto blanco/gris, hover `#FFFFFF1A` o borde dorado.
- Formularios/inputs: fondo `#2C2C2C`, borde `#333333`, texto blanco, placeholder gris, focus dorado.
- Badges: pills redondeadas 9999px, microtipografia uppercase, fondos tintados con transparencia.
- Iconos: Material Symbols Outlined, minimalistas, geometricos, usualmente dorados o grises.
- Sombras: discretas, negras, `shadow-2xl` y `shadow-black/50` en modales/hero.
- Sensacion: confianza tecnica, utilidad local, seriedad sin sentirse fria.

### Componentes clave

| Componente | Rasgos visuales |
|---|---|
| Hero principal | Fondo oscuro con glow dorado y magenta muy suave, H1 grande, buscador en card carbon con sombra fuerte, CTA dorado. |
| Navbar | Sticky, `#121212E6` con blur, logo iconico `construction` dorado, botones compactos. |
| Cards profesionales | Card carbon, border gris, foto circular, badges, rating, stats, CTA dorado y WhatsApp verde. |
| Botones principales | Dorado, texto oscuro, peso alto, hover dorado mas oscuro, active scale. |
| Inputs/formularios | Altura 48-56px, fondo `#2C2C2C`, borde `#333333`, focus `#E6B319`. |
| Paneles/dashboards | Cards densas, bordes claros, tablas simples, labels micro uppercase, icono dorado por seccion. |
| Badges | Nivel amarillo, verificado azul, actividad neutra, estados con fondo tintado. |
| Footer | Fondo principal, borde superior, logo chico dorado, links grises con hover dorado. |

## Iconografia de EsMiOficio

Libreria principal: Google Material Symbols Outlined cargada en `index.html`.

Configuracion: `opsz=24`, `wght=400`, `FILL=0`, `GRAD=0`.

Libreria secundaria: `lucide-react`, usada puntualmente en `components/CategorySEOPage.tsx` con `MapPin`, `CheckCircle` y `Shield`.

SVG personalizado: `public/og-image.svg` usa un icono/mark de herramienta hecho con `<path>` dentro de un recuadro dorado.

Estilo de iconos de marca:

- Outline, rounded, minimalista.
- Tamano promedio UI: 18px-24px.
- Iconos de categorias: 30px.
- Empty states: 48px-60px.
- Color por defecto: dorado `#E6B319`; secundarios en gris `#6B7280`; verificacion azul `#60A5FA`; favoritos/error rojo `#EF4444`; WhatsApp verde `#16A34A`.

Nota de consistencia: algunos componentes aplican clase `fill-1` a Material Symbols, pero la fuente se carga con `FILL=0`. Si se quiere usar icono relleno real en el futuro, conviene definir una clase CSS con `font-variation-settings: 'FILL' 1`.

| Icono | Nombre tecnico | Libreria | Seccion donde aparece | Uso | Color | Tamano | Estilo |
|---|---|---|---|---|---|---|---|
| Construccion/logo | `construction` | Material Symbols | Navbar, Footer, oficios | Marca y oficio general | `#E6B319` | 14-30px | Outlined rounded |
| Proyectos | `dynamic_feed` | Material Symbols | Navbar, JobBoard | Acceso a proyectos | `#E6B319` | 18-24px | Outlined |
| Busqueda | `search` | Material Symbols | Hero, filtros, admin | Buscar oficios/profesionales | `#6B7280` / focus `#E6B319` | 20-24px | Outlined |
| Expandir | `expand_more` | Material Symbols | Selects | Dropdown | `#6B7280` | 24px | Outlined |
| Ubicacion actual | `my_location` | Material Symbols | Hero | Usar ubicacion | `#E6B319` | 18px | Outlined |
| Historial | `history` | Material Symbols | Hero | Busquedas recientes | `#D1D5DB` | 10px | Outlined |
| Agregar | `add_circle` | Material Symbols | Hero, busqueda, jobboard | Registrar/sugerir oficio | `#E6B319` | 18-24px | Outlined |
| Plomeria | `plumbing` | Material Symbols | Categorias | Oficio plomero | `#60A5FA` | 30px | Outlined |
| Electricidad | `electrical_services` | Material Symbols | Hero, categorias | Oficio/electricidad | `#FACC15` | 24-30px | Outlined |
| Carpinteria | `carpenter` | Material Symbols | Categorias | Oficio carpintero | `#D97706` | 30px | Outlined |
| Albanileria | `construction` | Material Symbols | Categorias | Oficio albanil | `#9CA3AF` | 30px | Outlined |
| Mecanica | `car_repair` | Material Symbols | Categorias | Oficio mecanico | `#F87171` | 30px | Outlined |
| Jardineria | `yard` | Material Symbols | Categorias | Oficio jardinero | `#4ADE80` | 30px | Outlined |
| Pintura | `format_paint` | Material Symbols | Hero, categorias | Pintura/servicio popular | `#C084FC` | 24-30px | Outlined |
| Herreria/reparacion | `build` | Material Symbols | Categorias | Oficio herrero | `#94A3B8` | 30px | Outlined |
| Cerrajeria | `lock` | Material Symbols | Categorias, auth | Seguridad/acceso | `#FEF08A` | 24-30px | Outlined |
| Fumigacion | `pest_control` | Material Symbols | Categorias | Fumigador | `#16A34A` | 30px | Outlined |
| Techos | `roofing` | Material Symbols | Hero, categorias | Impermeabilizar | `#93C5FD` | 24-30px | Outlined |
| Aire acondicionado | `ac_unit` | Material Symbols | Categorias | Tecnico A/C | `#22D3EE` | 30px | Outlined |
| Ventanas | `window` | Material Symbols | Categorias | Vidriero | `#DBEAFE` | 30px | Outlined |
| Tapiceria | `chair` | Material Symbols | Categorias | Tapicero | `#FB923C` | 30px | Outlined |
| Corte/costura | `content_cut` | Material Symbols | Categorias | Costurera/barbero | `#F472B6` / `#F59E0B` | 30px | Outlined |
| Mascotas | `pets` | Material Symbols | Categorias | Estilista canino | Variable | 30px | Outlined |
| Capas/pisos | `layers` | Material Symbols | Categorias | Pisos | `#A8A29E` | 30px | Outlined |
| Arquitectura | `architecture` | Material Symbols | Categorias | Tablaroquero | `#D4D4D8` | 30px | Outlined |
| Smartphone | `smartphone` | Material Symbols | Categorias | Tecnico celulares | `#818CF8` | 30px | Outlined |
| Computadora | `computer` | Material Symbols | Categorias | Tecnico PC | `#0EA5E9` | 30px | Outlined |
| Fletes | `local_shipping` | Material Symbols | Categorias | Mudanzas | `#F97316` | 30px | Outlined |
| Limpieza | `cleaning_services` | Material Symbols | Categorias | Limpieza | `#2DD4BF` | 30px | Outlined |
| Cocina | `restaurant` | Material Symbols | Categorias | Chef | `#EF4444` | 30px | Outlined |
| Reposteria | `cake` | Material Symbols | Categorias | Repostero | `#F9A8D4` | 30px | Outlined |
| Fotografia | `photo_camera` | Material Symbols | Categorias | Fotografo | `#A3A3A3` | 30px | Outlined |
| Albercas | `pool` | Material Symbols | Categorias | Mantenimiento albercas | `#06B6D4` | 30px | Outlined |
| Manufactura | `precision_manufacturing` | Material Symbols | Categorias | Soldador | `#EA580C` | 30px | Outlined |
| Autos | `local_car_wash`, `directions_car` | Material Symbols | Categorias | Lavado/chofer | `#3B82F6` / `#64748B` | 30px | Outlined |
| Salud | `medical_services` | Material Symbols | Categorias | Enfermeria | `#FCA5A5` | 30px | Outlined |
| Escuela | `school` | Material Symbols | Categorias | Tutor | `#EAB308` | 30px | Outlined |
| Verificacion | `verified` | Material Symbols | Cards, filtros, admin | Profesional verificado | `#60A5FA` | 18-20px | Outlined/intentado fill |
| Ubicacion | `location_on` | Material Symbols | Cards, perfil, featured | Ciudad/municipio | `#9CA3AF` / `#E6B319` | 14-18px | Outlined |
| Mapa/cobertura | `map` | Material Symbols | Cards, MexicoFocus | Estado/cobertura | `#E6B319` | 14-24px | Outlined |
| Confianza | `shield` | Material Symbols | Cards | Senal de confianza | `#E6B319` | 16px | Outlined |
| Tiempo | `schedule` | Material Symbols | Cards, perfil | Actividad/tiempo respuesta | `#E6B319` | 16px | Outlined |
| Pago | `payments` | Material Symbols | Cards | Precio aproximado | `#E6B319` | 16px | Outlined |
| Favoritos | `favorite` | Material Symbols | Navbar, cards | Guardados | `#EF4444` activo / `#6B7280` inactivo | 20-24px | Outlined/intentado fill |
| Comparar | `compare_arrows` | Material Symbols | SearchResults | Comparacion | `#E6B319` | 24px | Outlined |
| WhatsApp/contacto | `chat`, `forum`, `perm_phone_msg`, `contact_phone` | Material Symbols | ContactModal, perfil, dashboard | Contacto seguro | `#16A34A` o `#E6B319` | 18-24px | Outlined |
| Resena | `rate_review`, `reviews` | Material Symbols | Perfil, cliente, admin | Resenas | `#E6B319` | 18-24px | Outlined |
| Estrellas | `star emoji` | Emoji unicode | StarRating | Calificacion | Amarillo emoji nativo | 14-20px | Emoji |
| Seguridad | `security`, `lock_person`, `lock_open` | Material Symbols | Admin/auth/perfil | Seguridad y acceso | `#EF4444` / `#E6B319` | 24-36px | Outlined |
| Descargar | `download` | Material Symbols | Admin | Exportar CSV | `#E6B319` | 24px | Outlined |
| Editar | `edit`, `edit_note` | Material Symbols | Perfil, cliente, admin | Editar datos | `#E6B319` | 18-24px | Outlined |
| Cerrar/eliminar | `close`, `delete`, `delete_forever` | Material Symbols | Modales/admin | Cerrar o borrar | `#6B7280` / `#EF4444` | 18-24px | Outlined |
| Estado vacio | `search_off`, `heart_broken`, `work_off`, `inbox` | Material Symbols | Empty states | Sin datos/resultados | `#4B5563` | 48-60px | Outlined |
| SEO ubicacion | `MapPin` | Lucide | CategorySEOPage | Ubicacion SEO | `#E6B319` | 16px | Outline stroke |
| SEO check | `CheckCircle` | Lucide | CategorySEOPage | FAQ/check | `#E6B319` | 24px | Outline stroke |
| SEO confianza | `Shield` | Lucide | CategorySEOPage | Verificacion SEO | `#FFFFFF` sobre azul | 16px | Outline stroke |
| OG tool mark | custom path | SVG propio | public/og-image.svg | Imagen social | `#E6B319` / `#121212` | 84px mark | Solido geometrico |

## Recomendaciones de iconos para publicidad

| Concepto | Icono recomendado | Motivo |
|---|---|---|
| Busqueda de profesionales | `search` | Ya vive en el buscador principal. |
| Ubicacion | `location_on` o `my_location` | Refuerza ciudad, colonia y cercania. |
| Confianza | `shield` | Es el lenguaje visual de seguridad en cards. |
| Resenas | `rate_review`, `reviews`, estrellas | Conecta con reputacion comprobable. |
| Oficio | `construction`, `home_repair_service`, icono especifico del oficio | Mantiene asociacion con trabajo manual. |
| WhatsApp/contacto | `chat`, `forum`, `perm_phone_msg` | Contacto directo sin crear dependencia visual del logo de WhatsApp. |
| Verificacion | `verified` | Senal inmediata de profesional validado. |
| Cliente | `person`, `groups` | Util para piezas de comunidad/clientes. |
| Profesional | `badge`, `workspace_premium`, `construction` | Perfil profesional y experiencia. |
| Servicio realizado | `task_alt`, `check_circle`, `fact_check` | Cierre exitoso / trabajo terminado. |
| Emergencia | `bolt`, `notifications_active`, `support_agent` | Urgencia sin alarmismo excesivo. |
| Favoritos/guardados | `favorite`, `bookmark` | Reutilizar para guardados y seleccion. |

## D) Prompt maestro para imagenes publicitarias

Usa este prompt como base:

> Crea una imagen promocional para EsMiOficio, una plataforma mexicana para encontrar profesionales de oficios confiables. Mantener identidad visual dark mode moderna: fondo carbon `#121212`, tarjetas en `#1E1E1E`, superficies secundarias `#2C2C2C`, bordes finos `#333333`, acento dorado `#E6B319` y hover/acento secundario `#D4A415`. Usar tipografia estilo Inter, sans-serif, titulos bold/black, texto claro `#FFFFFF` y texto secundario `#9CA3AF`. Composicion limpia, profesional y mobile-first, con tarjetas de profesionales, rating, ubicacion y verificacion. Boton principal dorado con texto oscuro, boton de contacto verde `#16A34A`, badges pequenos redondeados y bordes suaves. Iconografia estilo Google Material Symbols Outlined: `search`, `location_on`, `shield`, `verified`, `rate_review`, `construction`, `chat`, `task_alt`, `bolt`, lineal, rounded, minimalista, usualmente en dorado. Transmitir confianza, cercania local, seguridad, transparencia y oficio profesional. Evitar fondos claros, colores pastel dominantes, exceso de gradientes o ilustraciones caricaturescas. La pieza debe sentirse como una extension natural de la web de EsMiOficio.

## Inconsistencias visuales detectadas

- Se usa `font-black` pero Inter se carga hasta peso 800; conviene cargar 900 si se quiere conservar ese peso exacto.
- `fill-1` se usa en algunos Material Symbols, pero la fuente esta cargada con `FILL=0`; visualmente puede no rellenar.
- `text-brown-400` aparece en un oficio, pero Tailwind no trae `brown` por defecto; ese color puede no aplicarse.
- La app mezcla Material Symbols con Lucide solo en `CategorySEOPage`; para publicidad conviene priorizar Material Symbols para mantener coherencia.
