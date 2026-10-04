/**
 * ZONA T RUNNER — Service Worker
 *
 * Resuelve el gap de docs/TEST_LOG.md (2026-09-10): el plan de 90 dias declara
 * "modo demo 100% offline con service worker" como mitigacion del riesgo de
 * CREDIBILIDAD OPERATIVA, pero no existia ningun service worker en el repo.
 *
 * Estrategia:
 *  - Estaticos pesados (three.js, imagenes) -> cache-first, se sirven instantaneo
 *    y sobreviven sin red una vez visitados con conexion.
 *  - Codigo propio (index.html, game.js) -> network-first con fallback a cache:
 *    un deploy nuevo se ve en la siguiente carga. Con cache-first los jugadores
 *    que ya habian entrado se quedaban con el game.js viejo hasta que alguien
 *    subiera CACHE_VERSION a mano.
 *  - /data/djs/roster.json -> network-first con fallback a cache: si hay red,
 *    siempre se usa el roster mas fresco (fuente unica de verdad); si no hay
 *    red, se sirve la ultima copia vista. Esto es DISTINTO del fallback
 *    "roster embebido" (ver roster.embedded.js / web-runner/offline/): ese es
 *    para abrir el juego SIN servidor en absoluto (file:// o sin server.js);
 *    este service worker es para cuando SI hubo servidor al menos una vez y
 *    la red se cae despues (el caso tipico: wifi del club se cae a mitad de set).
 *
 * Subir CACHE_VERSION cada vez que cambien los assets del shell listados abajo,
 * para forzar a los clientes a refrescar el cache viejo.
 */

const CACHE_VERSION = 'zonat-shell-v3';

const SHELL_ASSETS = [
    './',
    './index.html',
    './game.js',
    './three.min.js',
    './logo_transparent.png',
    './logo.jpg',
    './molecular_avatar.jpg',
    './assets/avatars/dj_fresar.jpg',
    './assets/avatars/dj_letal.jpg',
    './assets/avatars/dj_nunez.jpg',
    './assets/avatars/dj_tatan.jpg',
    './assets/avatars/dj_noctua.jpg',
    './assets/avatars/dj_camilo.jpg',
    './assets/avatars/dj_valeria.jpg',
    './assets/avatars/dj_bogota_allstars.jpg',
    './assets/avatars/dj_sthep.jpg',
    './assets/avatars/dj_camila_leuro.jpg',
    './assets/billboards/valla_baum.jpg',
    './assets/billboards/valla_octava.jpg',
    './assets/billboards/valla_andino.jpg',
    './assets/billboards/valla_andresdc.jpg',
    './assets/billboards/valla_redbull.jpg',
    './assets/billboards/valla_zonat_pass.jpg'
];

const ROSTER_URL_SUFFIX = '/data/djs/roster.json';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            // addAll aborta todo si UN solo asset falla; los agregamos uno por uno
            // para que un asset faltante no tumbe el precache completo.
            return Promise.all(
                SHELL_ASSETS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn('[ZonaT SW] no se pudo precachear', url, err);
                    })
                )
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_VERSION)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // Roster y codigo propio: network-first, fallback a cache (lo mas fresco cuando
    // hay red, la ultima version conocida cuando no la hay).
    const isOwnCode = req.mode === 'navigate' || /\/(index\.html|game\.js)$/.test(url.pathname);
    if (url.pathname.endsWith(ROSTER_URL_SUFFIX) || isOwnCode) {
        event.respondWith(
            // cache: 'no-cache' obliga a revalidar con el servidor: GitHub Pages manda
            // max-age=600 y sin esto un deploy tardaba hasta 10 minutos en verse.
            fetch(req, { cache: 'no-cache' })
                .then((res) => {
                    if (res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
                    }
                    return res;
                })
                .catch(() => caches.match(req, { ignoreSearch: true }))
        );
        return;
    }

    // Todo lo demas (three.js, imagenes): cache-first, red como respaldo.
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                const copy = res.clone();
                caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
                return res;
            }).catch(() => cached);
        })
    );
});
