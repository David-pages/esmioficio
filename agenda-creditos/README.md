# 📒 Agenda de Créditos — Renovaciones

Proyecto **independiente** para dar seguimiento a clientes de crédito y saber en qué momento
ofrecerles la **renovación** (al 30% de avance) o un **crédito nuevo** (cuando terminan de pagar).

Es un solo archivo (`index.html`): no necesita instalación, servidor ni internet para funcionar.
Ábrelo en el navegador de tu computadora o celular y listo.

## Cómo usarla

1. Abre `index.html` en tu navegador (doble clic, o súbela a Vercel/Netlify/GitHub Pages para usarla desde el celular con una liga).
2. Activa las notificaciones cuando la app te lo pida.
3. Registra a tus clientes con el botón **＋**.

## Instalarla en el iPhone (funciona sin internet)

La app es una PWA: se instala como app y después ya no necesita internet.

1. Sube la carpeta a una liga (Vercel/Netlify) o usa la liga ya publicada.
2. En el iPhone, abre la liga en **Safari** (tiene que ser Safari).
3. Toca el botón **Compartir** (el cuadrito con la flecha hacia arriba).
4. Elige **"Agregar a pantalla de inicio"** y confirma.
5. Listo: aparece el ícono 📒 "Créditos" junto a tus demás apps.

Desde ese momento:
- Se abre a pantalla completa como cualquier app.
- **Funciona sin internet** (el service worker guarda la app en el teléfono).
- Los datos viven **solo en tu iPhone**; no se envían a ningún servidor.
- Internet solo se usa al abrir el chat de WhatsApp o Google Calendar.

> ⚠️ En iPhone, los datos de la app instalada se guardan aparte de los de Safari.
> Usa siempre la app instalada (el ícono) para que todo quede en un solo lugar,
> y descarga respaldos desde Ajustes de vez en cuando.

## Qué hace

### Registro de clientes
- Nombre, **cliente único**, teléfono (10 dígitos), tipo (nuevo / recompra).
- Monto del crédito y plazo: **13, 26, 39, 52, 80, 100, 110, 120, 128, 142 o 154 semanas**.
- Crédito disponible para renovación (ej. "hasta $70,000").
- Para créditos **que ya van avanzados**: captura las semanas pagadas actuales y a partir de ahí
  el avance corre solo, semana a semana. Para créditos nuevos basta la fecha de inicio.

### Notificación al 30%
- Cuando un cliente llega al **30% de avance**, aparece en el panel como **"Por contactar"**
  y recibes una notificación del navegador (una sola vez por crédito, sin repetirse).
- Cuando un cliente **liquida** (100%), te avisa para ofrecerle un crédito nuevo.
- En los clientes "En curso" se muestra la **fecha estimada** en la que podrás ofrecerles la renovación.

### WhatsApp directo
- Botón **💬 WhatsApp** que abre un chat directo al número del cliente con un mensaje ya escrito
  invitando a renovar (o a tramitar un crédito nuevo si ya liquidó).
- Los mensajes son **editables** en Ajustes; puedes usar `{nombre}` y `{disponible_texto}`.

### Seguimiento sin hostigar
- Al enviar un mensaje, el cliente pasa a **"En espera"** y no se vuelve a sugerir hasta que pasen
  los días de espera configurados (14 por defecto, ajustable en Ajustes).
- Puedes marcar **"No le interesa"** para sacarlo del seguimiento (y reactivarlo cuando quieras).

### Agenda de citas
- Si el cliente se interesa, botón **📅 Agendar cita** con fecha, hora y nota.
- Pestaña **Agenda** con las citas agrupadas por día, aviso de citas pasadas sin cerrar,
  y botón para pasar la cita a **Google Calendar**.
- Al concretarse, botón **"✔ Renovó / crédito nuevo"**: cierra el crédito anterior y arranca
  el seguimiento del nuevo desde cero (guardando el historial del cliente).

## Dónde se guardan los datos

En el navegador del dispositivo donde uses la app (localStorage). Nada sale a internet.
Por eso:

- **Descarga respaldos** desde Ajustes → "Descargar respaldo" con regularidad.
- Con el archivo de respaldo puedes restaurar los datos o pasarlos a otro dispositivo.
- No uses el modo incógnito (ahí los datos se borran al cerrar).

## Limitaciones a saber

- Las notificaciones del navegador llegan **mientras la app está abierta** (déjala en una pestaña).
  Aunque no la abras en días, al abrirla el panel te muestra al instante todos los clientes que
  llegaron al 30% o liquidaron mientras tanto.
- El avance se calcula por semanas transcurridas; si un cliente se atrasa en pagos, edita su ficha
  y corrige las "semanas pagadas".

La app incluye un cliente de ejemplo (Tania Yadira Renedo Cabrera) para que veas cómo funciona;
edítalo o elimínalo cuando quieras.
