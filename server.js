/**
 * ZONA T RUNNER — Dev server
 * Sirve el prototipo web (web-runner/) y expone /data/ desde la raiz del repo,
 * para que el juego lea el roster canonico en data/djs/roster.json.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'web-runner');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.fbx': 'application/octet-stream',
    '.ogg': 'audio/ogg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ico': 'image/x-icon'
};

/** Resuelve la URL a un archivo, bloqueando path traversal fuera de los directorios servidos. */
function resolvePath(cleanUrl) {
    const decoded = decodeURIComponent(cleanUrl);
    if (decoded.startsWith('/data/')) {
        const target = path.join(DATA_DIR, decoded.slice('/data/'.length));
        return target.startsWith(DATA_DIR + path.sep) ? target : null;
    }
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

let currentPort = parseInt(process.env.PORT, 10) || 8080;

function startServer(port) {
    server.listen(port, () => {
        console.log(`ZONA T RUNNER — http://localhost:${port}/ (o http://127.0.0.1:${port}/)`);
        console.log(`  juego : ${PUBLIC_DIR}`);
        console.log(`  datos : ${DATA_DIR} -> /data/`);
    });
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !process.env.PORT) {
        console.log(`Puerto ${currentPort} ocupado. Probando puerto ${currentPort + 1}...`);
        currentPort++;
        startServer(currentPort);
    } else {
        console.error('Error al iniciar el servidor:', err);
    }
});

startServer(currentPort);

