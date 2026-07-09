/* Service worker: deja la app disponible sin internet.
   Sube el número de versión cuando cambies index.html para que
   los teléfonos descarguen la versión nueva. */
const CACHE = "agenda-creditos-v1";
const ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(enCache =>
      enCache ||
      fetch(e.request)
        .then(resp => {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
          return resp;
        })
        .catch(() => caches.match("./index.html"))
    )
  );
});
