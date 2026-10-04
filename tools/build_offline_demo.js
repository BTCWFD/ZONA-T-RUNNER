/**
 * ZONA T RUNNER — Build de demo 100% offline
 *
 * Genera web-runner/offline/ : una copia autocontenida del juego con el
 * roster EMBEBIDO (window.__ZONAT_ROSTER__) para abrirse sin server.js y sin
 * red — el escenario real de un club sin wifi confiable. NO reemplaza al
 * server.js de desarrollo: ese sigue siendo el flujo normal, que lee
 * data/djs/roster.json en caliente (fuente unica de verdad). Esta carpeta es
 * un ARTEFACTO GENERADO — no se edita a mano, se regenera corriendo este
 * script cada vez que cambie data/djs/roster.json o los assets del shell.
 *
 * Uso:  node tools/build_offline_demo.js
 * Salida: web-runner/offline/index.html + copia de game.js, three.min.js y
 *         los assets referenciados (avatares, vallas, logo).
 *
 * Por que game.js no necesita cambios: loadRoster() en web-runner/game.js ya
 * revisa window.__ZONAT_ROSTER__ ANTES de intentar fetch, precisamente para
 * este caso (ver el comentario "fallback duro para demos en un club sin red").
 * Lo que faltaba (ver docs/TEST_LOG.md, 2026-09-10) era quien definiera esa
 * variable — este script es lo que la define, en una copia separada para no
 * arriesgar que el server.js normal sirva datos viejos por accidente.
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'web-runner');
const OUT_DIR = path.join(SRC_DIR, 'offline');
const ROSTER_PATH = path.join(ROOT_DIR, 'data', 'djs', 'roster.json');

// Assets que el shell offline necesita (mismo listado que sw.js SHELL_ASSETS,
// menos el propio index.html/game.js/three.min.js que se copian aparte).
const ASSET_FILES = [
    'logo_transparent.png',
    'logo.jpg',
    'molecular_avatar.jpg',
    path.join('assets', 'avatars', 'dj_fresar.jpg'),
    path.join('assets', 'avatars', 'dj_letal.jpg'),
    path.join('assets', 'avatars', 'dj_nunez.jpg'),
    path.join('assets', 'avatars', 'dj_tatan.jpg'),
    path.join('assets', 'avatars', 'dj_noctua.jpg'),
    path.join('assets', 'avatars', 'dj_camilo.jpg'),
    path.join('assets', 'avatars', 'dj_valeria.jpg'),
    path.join('assets', 'avatars', 'dj_bogota_allstars.jpg'),
    path.join('assets', 'avatars', 'dj_sthep.jpg'),
    path.join('assets', 'avatars', 'dj_camila_leuro.jpg'),
    path.join('assets', 'billboards', 'valla_baum.jpg'),
    path.join('assets', 'billboards', 'valla_octava.jpg'),
    path.join('assets', 'billboards', 'valla_andino.jpg'),
    path.join('assets', 'billboards', 'valla_andresdc.jpg'),
    path.join('assets', 'billboards', 'valla_redbull.jpg'),
    path.join('assets', 'billboards', 'valla_zonat_pass.jpg')
];

function copyFile(relPath) {
    const src = path.join(SRC_DIR, relPath);
    const dest = path.join(OUT_DIR, relPath);
    if (!fs.existsSync(src)) {
        console.warn('[build_offline_demo] falta asset (se omite):', relPath);
        return false;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return true;
}

function main() {
    if (!fs.existsSync(ROSTER_PATH)) {
        console.error('[build_offline_demo] no existe', ROSTER_PATH);
        process.exit(1);
    }
    const rosterRaw = fs.readFileSync(ROSTER_PATH, 'utf8');
    // Valida que sea JSON antes de embeberlo.
    const rosterData = JSON.parse(rosterRaw);

    fs.mkdirSync(OUT_DIR, { recursive: true });

    // 1. game.js y three.min.js se copian tal cual.
    copyFile('game.js');
    copyFile('three.min.js');

    // 2. Assets referenciados.
    let copied = 0;
    for (const rel of ASSET_FILES) {
        if (copyFile(rel)) copied++;
    }

    // 3. index.html con el roster embebido inyectado antes de <script src="game.js">.
    const indexSrc = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');
    const embedTag =
        '    <!-- GENERADO por tools/build_offline_demo.js — no editar a mano. -->\n' +
        '    <script>\n' +
        '        window.__ZONAT_ROSTER__ = ' + JSON.stringify(rosterData) + ';\n' +
        '    </script>\n' +
        '    <script src="game.js"></script>';

    if (!indexSrc.includes('<script src="game.js"></script>')) {
        console.error('[build_offline_demo] no se encontro el marcador <script src="game.js"></script> en index.html; revisa el archivo fuente.');
        process.exit(1);
    }
    const offlineHtml = indexSrc.replace('<script src="game.js"></script>', embedTag);
    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), offlineHtml, 'utf8');

    console.log('[build_offline_demo] OK — ' + rosterData.djs.length + ' DJs embebidos, ' + copied + '/' + ASSET_FILES.length + ' assets copiados.');
    console.log('[build_offline_demo] salida: ' + OUT_DIR);
    console.log('[build_offline_demo] abrir web-runner/offline/index.html directo desde el navegador (file://) o desde cualquier host estatico, sin server.js.');
}

main();
