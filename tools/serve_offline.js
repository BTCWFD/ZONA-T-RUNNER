/**
 * ZONA T RUNNER — Server minimo para la demo offline (web-runner/offline/)
 *
 * Por que existe: Chrome bloquea por CORS la carga de texturas WebGL cuando
 * el HTML se abre directo como file:// (aunque el archivo exista), asi que
 * abrir web-runner/offline/index.html con doble clic pierde las vallas
 * (billboards). Este server no necesita red/internet en absoluto -- solo
 * sirve archivos de disco por http://127.0.0.1, que Chrome sí trata como
 * origen valido para WebGL. Es la forma correcta de correr la demo 100%
 * offline (sin wifi, sin router, sin data/ -- el roster ya viene embebido
 * por tools/build_offline_demo.js).
 *
 * Uso:
 *   1. node tools/build_offline_demo.js   (regenera web-runner/offline/)
 *   2. node tools/serve_offline.js        (sirve esa carpeta)
 *   3. Abrir http://127.0.0.1:8090/ en el navegador del mismo equipo.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8090;
const PUBLIC_DIR = path.join(__dirname, '..', 'web-runner', 'offline');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.glb': 'model/gltf-binary',
    '.ico': 'image/x-icon'
};

if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('[serve_offline] no existe ' + PUBLIC_DIR + ' -- corre primero: node tools/build_offline_demo.js');
    process.exit(1);
}

function resolvePath(cleanUrl) {
    const decoded = decodeURIComponent(cleanUrl);
    const target = path.join(PUBLIC_DIR, decoded === '/' ? 'index.html' : decoded);
    return target.startsWith(PUBLIC_DIR) ? target : null;
}

const server = http.createServer((req, res) => {
    const cleanUrl = req.url.split('?')[0];
    const filePath = resolvePath(cleanUrl);
    if (!filePath) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not Found: ' + cleanUrl);
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
        res.end(content);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log('ZONA T RUNNER — demo offline en http://127.0.0.1:' + PORT + '/');
    console.log('  sirviendo: ' + PUBLIC_DIR);
    console.log('  sin red, sin /data/ -- roster embebido en el HTML.');
});
