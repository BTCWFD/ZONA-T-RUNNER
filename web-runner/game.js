/**
 * ZONA T RUNNER — Core 3D Endless Runner Engine (Three.js)
 * High Polish Version:
 * - 3D procedural cyberpunk Bogotá aesthetics (neon rain, glowing club billboards, asphalt reflections)
 * - 3D Character model with headphones, limbs, running stride, jump and roll animations
 * - 3 Power-ups: Magnet (absorbs tokens), Shield (breaks obstacles), Fever Beat (x3 multiplier & invincibility)
 * - Sfx & Synthesizer: 4-layer stems (Kick, Sub-bass, Percussion, Arpeggiator Lead)
 * - Floating 3D Billboards for real Bogotá nightlife events
 * - In-game Pause (ESC / P), High Score persistence (LocalStorage)
 */

// --- 1. DATA-DRIVEN CONFIGURATION ---
// El roster NO vive aqui. Fuente unica de verdad: /data/djs/roster.json (schema: data/djs/dj_schema.json).
// Para agregar o editar un DJ, edita ese JSON; el web-runner y Unity leen el mismo archivo.
const ROSTER_URLS = ["/data/djs/roster.json", "../data/djs/roster.json", "data/djs/roster.json"];

let DJS = [];

const hexToInt = (h, fallback) => {
    if (typeof h !== "string") return fallback;
    const n = parseInt(h.replace("#", ""), 16);
    return Number.isNaN(n) ? fallback : n;
};

/** Adapta un DJ del schema canonico a la forma plana que consume el motor 3D. */
function adaptDJ(dj) {
    const vi = dj.visualIdentity || {};
    const world = dj.world || {};
    const music = dj.music || {};
    const promo = (dj.promotions || [])[0] || null;
    return {
        id: dj.id,
        name: dj.name,
        genre: dj.genre,
        bpm: music.bpm || 128,
        color: vi.primaryColor || "#00ffff",
        colorHex: hexToInt(vi.primaryColor, 0x00ffff),
        worldColor: hexToInt(world.fogColor, 0x050510),
        groundColor: hexToInt(world.groundColor, 0x0a0a18),
        neonColor: hexToInt(vi.accentColor, 0x00ffff),
        avatar: (dj.character || {}).avatar || null,
        isFemale: !!(dj.character || {}).isFemale,
        synthFreq: music.synthFreq || 55,
        ability: (dj.stats || {}).abilityName || null,
        abilityDescription: (dj.stats || {}).abilityDescription || null,
        residencies: dj.residencies || [],
        promo: promo ? {
            title: promo.title,
            code: promo.code,
            discount: promo.discount,
            venue: promo.venue
        } : null
    };
}

/** Carga el roster canonico. Prueba varias rutas para funcionar servido o embebido. */
async function loadRoster() {
    // Roster embebido: la build offline lo trae dentro, sin fetch ni servidor.
    // Es el fallback duro para demos en un club sin red.
    if (typeof window !== "undefined" && window.__ZONAT_ROSTER__) {
        const embedded = window.__ZONAT_ROSTER__;
        const embList = Array.isArray(embedded) ? embedded : embedded.djs;
        if (Array.isArray(embList) && embList.length > 0) {
            console.log("[ZonaT] Roster embebido (" + embList.length + " DJs)");
            return embList.map(adaptDJ);
        }
    }

    let lastError = null;
    for (const url of ROSTER_URLS) {
        try {
            const res = await fetch(url, { cache: "no-cache" });
            if (!res.ok) { lastError = new Error(url + " -> HTTP " + res.status); continue; }
            const data = await res.json();
            const list = Array.isArray(data) ? data : data.djs;
            if (!Array.isArray(list) || list.length === 0) {
                lastError = new Error(url + " -> roster vacio");
                continue;
            }
            console.log("[ZonaT] Roster cargado desde " + url + " (" + list.length + " DJs)");
            return list.map(adaptDJ);
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError || new Error("No se pudo cargar el roster");
}

// --- 2. AUDIO SYNTHESIZER: 4-LAYER REALTIME STEMS ---
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.bpm = 130;
        this.step = 0;
        this.timer = null;
        this.synthFreq = 55;
        this.feverActive = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    start(bpm, synthFreq) {
        this.init();
        this.bpm = bpm;
        this.synthFreq = synthFreq;
        this.isPlaying = true;
        this.step = 0;

        const interval = (60 / this.bpm / 4) * 1000; // 16th notes
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.tick(), interval);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) clearInterval(this.timer);
    }

    setFever(active) {
        this.feverActive = active;
    }

    tick() {
        if (!this.isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Stem 1: Kick drum on 4/4 beats
        if (this.step % 4 === 0) {
            this.playKick(now);
        }

        // Stem 2: Open Hi-Hat on off-beats (step 2, 6, 10, 14) + Closed Hat
        if (this.step % 4 === 2) {
            this.playOpenHat(now);
        } else {
            this.playClosedHat(now);
        }

        // Stem 3: Rolling Sub-Bassline
        this.playBass(now, this.step);

        // Stem 4: Fever Mode Arpeggio
        if (this.feverActive && this.step % 2 === 0) {
            this.playArp(now, this.step);
        }

        this.step = (this.step + 1) % 16;
    }

    playKick(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.09);
        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
    }

    playClosedHat(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "highpass" in osc ? "sine" : "triangle";
        osc.frequency.setValueAtTime(9000, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.03);
    }

    playOpenHat(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(7500, t);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    playBass(t, step) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "sawtooth";
        const noteFactor = (step === 6 || step === 14) ? 1.334 : (step === 8 ? 1.5 : 1.0);
        osc.frequency.setValueAtTime(this.synthFreq * noteFactor, t);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(this.feverActive ? 650 : 380, t);
        filter.frequency.exponentialRampToValueAtTime(90, t + 0.08);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.09);
    }

    playArp(t, step) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        const arpeggioNotes = [this.synthFreq * 4, this.synthFreq * 5, this.synthFreq * 6, this.synthFreq * 8];
        const pitch = arpeggioNotes[(step / 2) % arpeggioNotes.length];
        osc.frequency.setValueAtTime(pitch, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    }

    playCoinSound() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.50, t); // C6
        osc.frequency.setValueAtTime(1318.51, t + 0.05); // E6
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.16);
    }

    playPowerUpSound() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.25);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.28);
    }

    playShieldBreakSound() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.2);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
    }

    playCrashSound() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.38);
    }
}

// --- 2b. AVATARES 3D DE LOS DJs ---
// Cada DJ tiene un "look" (pelo, ropa, neon, accesorios) que replica su imagen de
// assets/avatars/. La camara sigue al corredor desde atras, asi que los rasgos que
// identifican a cada DJ (pelo, espalda de la chaqueta, audifonos, props) estan
// pensados para leerse en esa vista; el frente tambien se modela para que coincida.
const AV = {
    // glow: autoiluminacion del propio color, para que la ropa oscura no se pierda contra la calle
    // sin tener que sumar luces a la escena.
    std: (color, roughness = 0.55, metalness = 0.08, glow = 0.45) =>
        new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive: color, emissiveIntensity: glow }),
    neon: (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity }),
    box: (w, h, d = 0.03) => new THREE.BoxGeometry(w, h, d),
    cyl: (rt, rb, h, seg = 12, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open),
    sph: (r, ws = 16, hs = 12) => new THREE.SphereGeometry(r, ws, hs),
    cap: (r, theta) => new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, theta),
    torus: (r, tube, arc = Math.PI * 2) => new THREE.TorusGeometry(r, tube, 8, 24, arc),
    cone: (r, h, seg = 8) => new THREE.ConeGeometry(r, h, seg),
    // Caja con la base y/o la tapa escaladas: da torsos y abrigos con forma.
    taper(w, h, d, botX = 1, botZ = 1, topX = 1, topZ = 1) {
        const g = new THREE.BoxGeometry(w, h, d);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const top = p.getY(i) > 0;
            p.setX(i, p.getX(i) * (top ? topX : botX));
            p.setZ(i, p.getZ(i) * (top ? topZ : botZ));
        }
        g.computeVertexNormals();
        return g;
    },
    put(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.rotation.set(rx, ry, rz);
        parent.add(m);
        return m;
    }
};

const DJ_LOOKS = {
    // FRESAR: visor rojo, chaqueta tactica negra con correas y ribetes rojos.
    dj_fresar: {
        hair: "quiff", gloves: true, headphones: null,
        palette: { skin: 0xd9a27e, hair: 0x1a1216, top: 0x1b161d, pants: 0x131118, shoes: 0x0e0d12, neon: 0xff1040, neon2: 0x35e0ff },
        decor(c) {
            AV.put(c.body, AV.cyl(0.16, 0.2, 0.17, 12, true), c.m.topD, 0, 0.64, 0);
            AV.put(c.body, AV.torus(0.162, 0.016), c.m.neon, 0, 0.725, 0, Math.PI / 2);
            [c.zf, c.zb].forEach(z => {
                [-1, 1].forEach(s => AV.put(c.body, AV.box(0.06, 0.82), c.m.neon, s * 0.2, 0.13, z));
                AV.put(c.body, AV.box(0.46, 0.05), c.m.neon, 0, 0.3, z);
            });
            AV.put(c.body, AV.box(0.24, 0.1), c.m.neon, 0, 0.45, c.zb);
            [c.armL, c.armR].forEach(a => {
                AV.put(a, AV.torus(0.125, 0.016), c.m.neon, 0, -0.14, 0, Math.PI / 2);
                AV.put(a, AV.torus(0.105, 0.014), c.m.neon, 0, -0.5, 0, Math.PI / 2);
            });
            AV.put(c.armL, AV.cyl(0.108, 0.098, 0.2, 10), c.m.dark, 0, -0.4, 0);
            [-0.34, -0.4, -0.46].forEach(y => AV.put(c.armL, AV.torus(0.112, 0.008), c.m.neon2, 0, y, 0, Math.PI / 2));
            AV.put(c.head, AV.box(0.5, 0.1, 0.14), c.m.neon, 0, 0.04, 0.2);
            [-1, 1].forEach(s => AV.put(c.head, AV.box(0.03, 0.07, 0.34), c.m.neon, s * 0.255, 0.04, 0.05));
            [c.legL, c.legR].forEach(l => {
                AV.put(l, AV.torus(0.132, 0.012), c.m.neon, 0, -0.36, 0, Math.PI / 2);
                AV.put(l, AV.box(0.03, 0.24), c.m.neon, 0, -0.18, -0.145);
            });
            c.game.fresarLight = c.accent;
        }
    },
    // NOCTUA: chaqueta con capucha y plumas-circuito cian en los hombros, audifonos plateados al cuello.
    dj_noctua: {
        hair: "crop",
        headphones: { mode: "neck", cup: 0xc9d1da, ring: 0x00e5ff },
        palette: { skin: 0xc48a66, hair: 0x15110f, top: 0x171c24, pants: 0x12151c, shoes: 0x0f1116, neon: 0x19f0e0, neon2: 0x00b8ff },
        decor(c) {
            const hood = AV.put(c.body, AV.sph(0.21, 14, 10), c.m.top, 0, 0.5, -0.27);
            hood.scale.set(1.35, 0.85, 0.75);
            [c.zf, c.zb].forEach(z => [-1, 1].forEach(s => {
                for (let k = 0; k < 5; k++) {
                    AV.put(c.body, AV.box(0.034, 0.38 - k * 0.05), c.m.neon, s * (0.1 + k * 0.062), 0.3 - k * 0.028, z, 0, 0, s * (0.1 + k * 0.14));
                }
            }));
            [c.armL, c.armR].forEach((a, i) => {
                const s = i ? 1 : -1;
                for (let k = 0; k < 3; k++) AV.put(a, AV.box(0.03, 0.15, 0.03), c.m.neon, s * 0.115, -0.08 - k * 0.11, -0.05 + k * 0.05, 0, 0, s * 0.25);
            });
            AV.put(c.body, AV.cone(0.05, 0.1, 4), c.m.metal, 0, 0.36, c.zf + 0.02, Math.PI);
        }
    },
    // CAMILO B2B: bomber de cuero con glifos naranja, pelo rizado, barba, cadena dorada.
    dj_camilo: {
        hair: "curly", beard: true, topRough: 0.28, topMetal: 0.25,
        headphones: { mode: "on", cup: 0x18181c, ring: 0xffb020 },
        palette: { skin: 0xc48a62, hair: 0x1c120c, top: 0x2b1d15, pants: 0x15151a, shoes: 0x14110f, neon: 0xff7a00, neon2: 0xffc23a },
        decor(c) {
            AV.put(c.body, AV.box(0.66, 0.1, 0.4), c.m.dark, 0, -0.34, 0);
            [c.zf, c.zb].forEach(z => [-1, 1].forEach(s => {
                AV.put(c.body, AV.box(0.05, 0.36), c.m.neon, s * 0.25, 0.2, z);
                AV.put(c.body, AV.box(0.13, 0.045), c.m.neon, s * 0.185, 0.2, z);
                AV.put(c.body, AV.box(0.045, 0.22), c.m.neon, s * 0.12, 0.2, z);
            }));
            [c.armL, c.armR].forEach((a, i) => {
                const s = i ? 1 : -1;
                [-0.06, 0, 0.06].forEach(z => AV.put(a, AV.box(0.03, 0.5, 0.025), c.m.neon, s * 0.118, -0.36, z));
                AV.put(a, AV.cyl(0.1, 0.1, 0.07, 10), c.m.dark, 0, -0.64, 0);
            });
            const chain = AV.put(c.body, AV.torus(0.17, 0.014), AV.std(0xe8b63a, 0.25, 0.8), 0, 0.5, 0.09, 1.15);
            chain.scale.set(1, 1.25, 1);
        }
    },
    // VALERIA NEON: bob con mechas verdes y visor, chaqueta corta con franjas verdes.
    dj_valeria: {
        female: true, hair: "bob", midriff: true, topRough: 0.3, topMetal: 0.2,
        headphones: { mode: "neck", cup: 0x16161a, ring: 0x39ff14 },
        palette: { skin: 0xc99a78, hair: 0x101012, streak: 0x39ff14, top: 0x15171a, pants: 0x121316, shoes: 0x0f1013, neon: 0x2dff4f, neon2: 0x9dff00 },
        decor(c) {
            AV.put(c.body, AV.cyl(0.15, 0.185, 0.15, 12, true), c.m.topD, 0, 0.63, 0);
            [c.armL, c.armR].forEach((a, i) => {
                const s = i ? 1 : -1;
                AV.put(a, AV.box(0.03, 0.62, 0.07), c.m.neon, s * 0.088, -0.34, 0);
            });
            [-1, 1].forEach(s => {
                AV.put(c.body, AV.box(0.2, 0.055), c.m.neon, s * 0.17, 0.33, c.zf);
                AV.put(c.body, AV.box(0.045, 0.46), c.m.neon, s * 0.24, 0.26, c.zb, 0, 0, s * 0.1);
            });
            AV.put(c.body, AV.box(0.5, 0.055), c.m.neon, 0, 0.42, c.zb);
            AV.put(c.body, AV.box(0.56, 0.07, 0.35), c.m.dark, 0, 0.0, 0);
            AV.put(c.head, AV.box(0.42, 0.06, 0.28), AV.neon(0x55ff55, 0.7), 0, 0.2, 0.09, -0.22);
        }
    },
    // ZONA T COLECTIVO: chaqueta deportiva negra con lineas de neon violeta.
    dj_bogota_allstars: {
        hair: "quiff",
        headphones: { mode: "neck", cup: 0x17161c, ring: 0x3a3542 },
        palette: { skin: 0xd9a886, hair: 0x1f1611, top: 0x16141d, pants: 0x121118, shoes: 0x0f0e14, neon: 0xd060ff, neon2: 0xa040ff },
        decor(c) {
            AV.put(c.body, AV.cyl(0.16, 0.2, 0.16, 12, true), c.m.topD, 0, 0.64, 0);
            [c.zf, c.zb].forEach(z => {
                AV.put(c.body, AV.box(0.74, 0.04), c.m.neon, 0, 0.24, z);
                AV.put(c.body, AV.box(0.62, 0.03), c.m.neon, 0, -0.33, z * 0.92);
            });
            AV.put(c.body, AV.box(0.03, 0.92), c.m.neon, 0, 0.1, c.zf);
            [-1, 1].forEach(s => AV.put(c.body, AV.box(0.035, 0.32), c.m.neon, s * 0.22, 0.42, c.zb, 0, 0, -s * 0.95));
            [c.armL, c.armR].forEach(a => AV.put(a, AV.torus(0.128, 0.018), c.m.neon, 0, -0.23, 0, Math.PI / 2));
            [c.legL, c.legR].forEach((l, i) => {
                const s = i ? 1 : -1;
                AV.put(l, AV.box(0.03, 0.3, 0.03), c.m.neon, s * 0.135, -0.18, 0);
            });
        }
    },
    // LETAL: traje de latex negro, pelo negro largo con mechas rojas, violin de neon violeta.
    dj_letal: {
        female: true, hair: "long", boots: true, topRough: 0.16, topMetal: 0.5,
        headphones: null,
        palette: { skin: 0xe0b090, hair: 0x0c0a0e, streak: 0xc21a34, top: 0x121019, pants: 0x121019, shoes: 0x0b0a0f, neon: 0xcc33ff, neon2: 0x8f5bff },
        decor(c) {
            const belt = AV.put(c.body, AV.torus(0.29, 0.016), c.m.neon, 0, -0.17, 0, Math.PI / 2);
            belt.scale.set(1, 0.62, 1);
            [-1, 1].forEach(s => {
                AV.put(c.body, AV.box(0.03, 0.2), c.m.neon, s * 0.2, 0.3, c.zb);
                AV.put(c.body, AV.box(0.03, 0.14), c.m.neon, s * 0.13, 0.05, c.zb);
                AV.put(c.body, AV.box(0.03, 0.16), c.m.neon, s * 0.2, 0.26, c.zf);
            });
            [c.armL, c.armR].forEach((a, i) => {
                const s = i ? 1 : -1;
                AV.put(a, AV.box(0.03, 0.2, 0.03), c.m.neon, s * 0.088, -0.42, 0);
                AV.put(a, AV.cyl(0.082, 0.078, 0.12, 10), c.m.dark, 0, -0.62, 0);
            });
            [c.legL, c.legR].forEach((l, i) => {
                const s = i ? 1 : -1;
                AV.put(l, AV.torus(0.125, 0.02), c.m.dark, 0, -0.2, 0, Math.PI / 2);
                AV.put(l, AV.box(0.07, 0.16, 0.16), c.m.dark, s * 0.14, -0.26, 0);
                AV.put(l, AV.box(0.03, 0.1, 0.03), c.m.neon, s * 0.18, -0.26, 0);
            });
            // Violin electrico en la mano izquierda y arco en la derecha
            const violin = new THREE.Group();
            violin.position.set(-0.04, -0.72, 0.06);
            violin.rotation.set(-1.15, 0, 0.25);
            c.armL.add(violin);
            const glass = AV.neon(0xb44dff, 0.55);
            const lower = AV.put(violin, AV.cyl(0.13, 0.13, 0.035, 18), glass, 0, 0.08, 0, Math.PI / 2);
            const upper = AV.put(violin, AV.cyl(0.1, 0.1, 0.035, 18), glass, 0, 0.26, 0, Math.PI / 2);
            lower.scale.set(1, 1, 1.15);
            upper.scale.set(1, 1, 1.1);
            AV.put(violin, AV.torus(0.13, 0.012), c.m.neon, 0, 0.08, 0).scale.set(1, 1.15, 1);
            AV.put(violin, AV.torus(0.1, 0.012), c.m.neon, 0, 0.26, 0).scale.set(1, 1.1, 1);
            AV.put(violin, AV.box(0.035, 0.42, 0.035), c.m.neon, 0, 0.55, 0);
            AV.put(violin, AV.sph(0.04, 8, 6), c.m.neon, 0, 0.78, 0);
            AV.put(c.armR, AV.cyl(0.011, 0.011, 0.78, 6), c.m.neon, 0.03, -0.72, 0.2, 1.25, 0, 0);
        }
    },
    // DJ NUÑEZ "El Toro en Llamas": hoodie negro con el toro, cargo, botas y fuego en el pie derecho.
    dj_nunez: {
        hair: "fade", beard: true, boots: true, bulk: 1.08,
        headphones: { mode: "neck", cup: 0x1b1b20, ring: 0xc9d1da },
        palette: { skin: 0xb9805c, hair: 0x14100d, top: 0x18181d, pants: 0x1c1c22, shoes: 0x2a1d14, neon: 0xff5a00, neon2: 0xffc400 },
        decor(c) {
            const hood = AV.put(c.body, AV.sph(0.22, 14, 10), c.m.top, 0, 0.5, -0.29);
            hood.scale.set(1.4, 0.9, 0.8);
            AV.put(c.body, AV.box(0.5, 0.2, 0.05), c.m.dark, 0, -0.2, c.zf);
            const cream = AV.neon(0xffd9a0);
            [c.zf, c.zb].forEach(z => {
                AV.put(c.body, AV.taper(0.2, 0.2, 0.03, 0.55), c.m.neon, 0, 0.22, z);
                [-1, 1].forEach(s => {
                    AV.put(c.body, AV.box(0.15, 0.045), c.m.neon, s * 0.16, 0.32, z, 0, 0, s * 0.5);
                    AV.put(c.body, AV.box(0.045, 0.1), c.m.neon2, s * 0.235, 0.4, z, 0, 0, -s * 0.15);
                });
                AV.put(c.body, AV.box(0.4, 0.035), cream, 0, 0.05, z);
                AV.put(c.body, AV.box(0.26, 0.025), c.m.neon, 0, -0.01, z);
            });
            [-1, 1].forEach(s => AV.put(c.body, AV.cyl(0.012, 0.012, 0.22, 6), cream, s * 0.07, 0.42, c.zf + 0.02));
            [c.legL, c.legR].forEach((l, i) => {
                const s = i ? 1 : -1;
                AV.put(l, AV.box(0.1, 0.2, 0.2), c.m.pants, s * 0.14, -0.3, 0);
            });
            // Fuego en el pie derecho (el cuarto tiempo lo enciende desde update)
            const outer = AV.neon(0xff5a00, 0.85), inner = AV.neon(0xffd24a, 0.95);
            AV.put(c.legR, AV.cone(0.13, 0.42, 8), outer, 0, -0.62, -0.18, -0.55);
            AV.put(c.legR, AV.cone(0.075, 0.3, 8), inner, 0, -0.66, -0.16, -0.55);
            AV.put(c.legR, AV.cone(0.09, 0.3, 8), outer, 0.1, -0.7, 0.0, -0.3, 0, -0.35);
            AV.put(c.legR, AV.cone(0.08, 0.26, 8), outer, -0.09, -0.72, 0.06, -0.2, 0, 0.35);
            c.accent.position.set(0.25, 0.35, -0.35);
            c.accent.color.setHex(0xff4400);
            c.game.flameLight = c.accent;
        }
    },
    // DJ TATAN: bomber negro con circuitos verdes y una onda de audio en la espalda.
    dj_tatan: {
        hair: "quiff", beard: true,
        headphones: { mode: "neck", cup: 0x15161b, ring: 0x35e0ff },
        palette: { skin: 0xc98f68, hair: 0x15110f, top: 0x161a22, pants: 0x101218, shoes: 0x0e1014, neon: 0x1dff7a, neon2: 0x35d0ff },
        decor(c) {
            [0.08, 0.17, 0.3, 0.42, 0.54, 0.42, 0.3, 0.17, 0.08].forEach((h, i) =>
                AV.put(c.body, AV.box(0.036, h), i % 2 ? c.m.neon2 : c.m.neon, (i - 4) * 0.06, 0.08, c.zb));
            [-1, 1].forEach(s => [0.06, 0.14, 0.22, 0.14, 0.06].forEach((h, i) =>
                AV.put(c.body, AV.box(0.026, h), s < 0 ? c.m.neon : c.m.neon2, s * 0.2 + (i - 2) * 0.04, 0.14, c.zf)));
            [c.zf, c.zb].forEach(z => [-1, 1].forEach(s => {
                AV.put(c.body, AV.box(0.03, 0.2), c.m.neon, s * 0.33, 0.44, z);
                AV.put(c.body, AV.box(0.1, 0.03), c.m.neon, s * 0.295, 0.35, z);
                AV.put(c.body, AV.box(0.03, 0.2), c.m.neon, s * 0.27, -0.2, z);
                AV.put(c.body, AV.box(0.1, 0.03), c.m.neon2, s * 0.235, -0.11, z);
            }));
            AV.put(c.body, AV.box(0.03, 0.9), c.m.neon2, 0, 0.1, c.zf);
            AV.put(c.body, AV.box(0.66, 0.09, 0.4), c.m.dark, 0, -0.34, 0);
            [c.armL, c.armR].forEach((a, i) => {
                const s = i ? 1 : -1;
                AV.put(a, AV.box(0.03, 0.3, 0.03), c.m.neon, s * 0.12, -0.2, 0);
                AV.put(a, AV.box(0.03, 0.03, 0.12), c.m.neon, s * 0.115, -0.36, 0.045);
                AV.put(a, AV.box(0.03, 0.2, 0.03), c.m.neon2, s * 0.108, -0.47, 0.09);
            });
            AV.put(c.body, AV.cone(0.04, 0.08, 4), c.m.metal, 0, 0.36, c.zf + 0.02, Math.PI);
            c.game.tatanLight = c.accent;
        }
    },
    // DJ MOLECULAR: traje cromado con el monograma de picos y la molecula en la espalda.
    dj_molecular: {
        hair: "none", helmet: true, gloves: true, topRough: 0.25, topMetal: 0.45, glow: 0.25,
        headphones: null,
        palette: { skin: 0xb9c3cf, hair: 0xb9c3cf, top: 0x8f9aa8, pants: 0x6c7684, shoes: 0x555e6a, neon: 0x00e5ff, neon2: 0xffffff },
        decor(c) {
            AV.put(c.head, AV.box(0.44, 0.1, 0.16), c.m.neon, 0, 0.03, 0.19);
            AV.put(c.head, AV.torus(0.262, 0.014), c.m.neon, 0, 0.03, 0, Math.PI / 2);
            [c.zf, c.zb].forEach(z => {
                [[-0.24, 0.4], [-0.1, -0.4], [0.1, 0.4], [0.24, -0.4]].forEach(([x, rz]) =>
                    AV.put(c.body, AV.box(0.04, 0.4), c.m.neon, x, 0.22, z, 0, 0, -rz));
            });
            const orbit = AV.put(c.body, AV.torus(0.36, 0.013), c.m.neon, 0, 0.12, c.zb - 0.02, 0, 0, 0.3);
            orbit.scale.set(1, 0.3, 1);
            const atoms = [[0.14, -0.14], [0.28, -0.05], [0.28, -0.26]];
            atoms.forEach(([x, y]) => AV.put(c.body, AV.sph(0.05, 10, 8), c.m.neon2, x, y, c.zb - 0.02));
            AV.put(c.body, AV.box(0.16, 0.022), c.m.neon, 0.21, -0.095, c.zb - 0.01, 0, 0, 0.57);
            AV.put(c.body, AV.box(0.16, 0.022), c.m.neon, 0.21, -0.2, c.zb - 0.01, 0, 0, -0.7);
            [c.armL, c.armR].forEach(a => AV.put(a, AV.torus(0.125, 0.014), c.m.neon, 0, -0.3, 0, Math.PI / 2));
            [c.legL, c.legR].forEach(l => AV.put(l, AV.torus(0.125, 0.012), c.m.neon, 0, -0.4, 0, Math.PI / 2));
        }
    },
    // DJ STHEP: chaqueta entallada con ribetes rosa, pelo largo ondulado con mechas rosa, microfono.
    dj_sthep: {
        female: true, hair: "wavy", topRough: 0.4, topMetal: 0.15,
        headphones: { mode: "neck", cup: 0x17161a, ring: 0x3b3640 },
        palette: { skin: 0xd09c7a, hair: 0x20130d, streak: 0xff3d9a, top: 0x17141a, pants: 0x121116, shoes: 0x100f13, neon: 0xff3d9a, neon2: 0xff8cc6 },
        decor(c) {
            AV.put(c.body, AV.box(0.04, 0.58), c.m.neon, 0, 0.27, c.zf);
            [-1, 1].forEach(s => {
                AV.put(c.body, AV.box(0.04, 0.52), c.m.neon, s * 0.16, 0.3, c.zf, 0, 0, -s * 0.4);
                AV.put(c.body, AV.box(0.04, 0.56), c.m.neon, s * 0.15, 0.27, c.zb, 0, 0, s * 0.12);
            });
            const belt = AV.put(c.body, AV.torus(0.262, 0.016), c.m.neon, 0, -0.02, 0, Math.PI / 2);
            belt.scale.set(1, 0.62, 1);
            [c.armL, c.armR].forEach((a, i) => {
                const s = i ? 1 : -1;
                AV.put(a, AV.box(0.03, 0.62, 0.06), c.m.neon, s * 0.088, -0.34, 0);
            });
            // Microfono magenta en la mano derecha
            const mic = new THREE.Group();
            mic.position.set(0, -0.74, 0.05);
            mic.rotation.set(1.2, 0, 0);
            c.armR.add(mic);
            AV.put(mic, AV.cyl(0.03, 0.024, 0.22, 10), AV.std(0xb0127a, 0.3, 0.5), 0, 0.02, 0);
            AV.put(mic, AV.sph(0.058, 12, 10), c.m.neon, 0, 0.17, 0);
        }
    },
    // CAMILA LEURO: abrigo negro largo con costuras lila, cuello alto, mono bajo y anillos hipnoticos.
    dj_camila_leuro: {
        female: true, hair: "bun", turtleneck: true, topRough: 0.6, topMetal: 0.05,
        headphones: { mode: "neck", cup: 0x151419, ring: 0x35303b },
        palette: { skin: 0xc9967a, hair: 0x1b1512, top: 0x17151d, pants: 0x121116, shoes: 0x0f0e13, neon: 0xcaa0ff, neon2: 0xe9d5ff },
        decor(c) {
            AV.put(c.body, AV.box(0.86, 0.09, 0.36), c.m.top, 0, 0.56, 0);
            AV.put(c.body, AV.taper(0.6, 0.64, 0.4, 1.14, 1.12), c.m.top, 0, -0.5, 0);
            [-1, 1].forEach(s => {
                AV.put(c.body, AV.box(0.02, 1.34), c.m.neon, s * 0.18, -0.12, c.zb - 0.03, 0, 0, s * 0.03);
                AV.put(c.body, AV.box(0.02, 0.5), c.m.neon, s * 0.11, 0.32, c.zf + 0.005, 0, 0, s * 0.28);
                AV.put(c.body, AV.box(0.02, 0.72), c.m.neon, s * 0.05, -0.46, c.zf + 0.03);
            });
            [c.armL, c.armR].forEach((a, i) => {
                const s = i ? 1 : -1;
                AV.put(a, AV.box(0.02, 0.6, 0.02), c.m.neon, s * 0.09, -0.34, -0.03);
            });
            [0.11, 0.19, 0.27].forEach(r => AV.put(c.body, AV.torus(r, 0.011), c.m.neon2, 0, 0.2, c.zb - 0.035));
        }
    }
};

// Look generico para DJs nuevos que todavia no tienen uno propio: chaqueta oscura con su color.
function getDJLook(dj) {
    if (DJ_LOOKS[dj.id]) return DJ_LOOKS[dj.id];
    const neon = dj.neonColor || dj.colorHex || 0x00ffff;
    return {
        female: !!dj.isFemale, hair: dj.isFemale ? "long" : "crop",
        headphones: { mode: "neck", cup: 0x17171c, ring: neon },
        palette: { skin: 0xd0a07c, hair: 0x1a1412, top: 0x171820, pants: 0x121218, shoes: 0x0f0f14, neon, neon2: neon },
        decor(c) {
            [c.zf, c.zb].forEach(z => AV.put(c.body, AV.box(0.5, 0.045), c.m.neon, 0, 0.26, z));
            AV.put(c.body, AV.box(0.035, 0.6), c.m.neon, 0, 0.1, c.zb);
            [c.armL, c.armR].forEach((a, i) => AV.put(a, AV.box(0.03, 0.5, 0.05), c.m.neon, (i ? 1 : -1) * 0.1, -0.34, 0));
        }
    };
}

function avBuildHair(c, look) {
    const head = c.head, H = c.m.hair, P = look.palette;
    const streak = P.streak !== undefined ? AV.neon(P.streak) : null;
    const cap = (r, theta, tilt, y = 0.03) => {
        const m = AV.put(head, AV.cap(r, theta), H, 0, y, -0.012, tilt, 0, 0);
        m.scale.set(0.97, 1.1, 1.03);
        return m;
    };
    switch (look.hair) {
        case "none":
            break;
        case "fade":
            cap(0.268, Math.PI * 0.4, -0.3);
            break;
        case "quiff":
            cap(0.276, Math.PI * 0.56, -0.42);
            AV.put(head, AV.box(0.32, 0.13, 0.24), H, 0, 0.28, 0.07, -0.3);
            break;
        case "curly":
            cap(0.276, Math.PI * 0.56, -0.4);
            for (let i = 0; i < 18; i++) {
                const phi = i * 2.399, th = 0.15 + (i / 17) * 1.1;
                const x = 0.275 * Math.sin(th) * Math.cos(phi);
                const z = 0.275 * Math.sin(th) * Math.sin(phi);
                if (z > 0.1 && th > 0.75) continue; // deja libre la cara
                AV.put(head, AV.sph(0.09, 8, 6), H, x, 0.3 * Math.cos(th) + 0.04, z - 0.01);
            }
            break;
        case "bob": {
            cap(0.288, Math.PI * 0.5, -0.2);
            const gap = 0.85; // media abertura (rad) que deja la cara libre
            const curtain = AV.put(head, new THREE.CylinderGeometry(0.288, 0.305, 0.42, 18, 1, true, gap, Math.PI * 2 - gap * 2), c.m.hairD, 0, -0.13, 0);
            curtain.scale.set(0.97, 1, 1.03);
            AV.put(head, AV.box(0.38, 0.1, 0.05), H, 0, 0.13, 0.25);
            if (streak) {
                [1.15, 1.75, 2.55, Math.PI, 3.73, 4.53, 5.13].forEach(a =>
                    AV.put(head, AV.box(0.055, 0.42, 0.02), streak, 0.3 * Math.sin(a), -0.13, 0.31 * Math.cos(a), 0, a, 0));
                AV.put(head, AV.box(0.1, 0.1, 0.02), streak, 0.1, 0.13, 0.278);
            }
            break;
        }
        case "long": {
            cap(0.286, Math.PI * 0.56, -0.3);
            AV.put(head, AV.taper(0.5, 1.02, 0.14, 0.82), H, 0, -0.5, -0.2, 0.05);
            [-1, 1].forEach(s => AV.put(head, AV.box(0.09, 0.64, 0.1), H, s * 0.238, -0.34, 0.07));
            if (streak) {
                [-0.15, 0.13].forEach(x => AV.put(head, AV.box(0.05, 0.94, 0.02), streak, x, -0.5, -0.292, 0.05));
                [-1, 1].forEach(s => AV.put(head, AV.box(0.035, 0.6, 0.02), streak, s * 0.26, -0.34, 0.125));
            }
            break;
        }
        case "wavy": {
            cap(0.288, Math.PI * 0.56, -0.3);
            for (let k = 0; k < 5; k++) {
                const w = AV.put(head, AV.sph(0.2, 12, 8), H, (k % 2 ? 0.05 : -0.05), -0.1 - k * 0.2, -0.2);
                w.scale.set(1.3 - k * 0.05, 0.8, 0.55);
                if (streak && k > 0) {
                    const st = AV.put(head, AV.sph(0.07, 8, 6), streak, (k % 2 ? -0.16 : 0.17), -0.1 - k * 0.2, -0.275);
                    st.scale.set(0.45, 2.3, 0.4);
                }
            }
            [-1, 1].forEach(s => {
                for (let k = 0; k < 3; k++) {
                    const lock = AV.put(head, AV.sph(0.09, 10, 8), k === 1 && streak ? streak : H, s * (0.24 + (k % 2) * 0.02), -0.14 - k * 0.19, 0.06);
                    lock.scale.set(0.8, 1.4, 0.9);
                }
            });
            break;
        }
        case "bun":
            cap(0.272, Math.PI * 0.62, -0.5);
            AV.put(head, AV.sph(0.105, 12, 10), H, 0, -0.07, -0.275);
            break;
        default: // "crop"
            cap(0.276, Math.PI * 0.56, -0.42);
    }
}

function buildDJAvatar(game, look) {
    const P = look.palette;
    const fem = !!look.female;
    const bulk = look.bulk || 1;
    const topRough = look.topRough !== undefined ? look.topRough : 0.5;
    const topMetal = look.topMetal !== undefined ? look.topMetal : 0.12;
    const glow = look.glow !== undefined ? look.glow : 0.9;
    const m = {
        // La calle tiene muchas luces de neon: la piel se atenua para que no se queme a blanco.
        skin: AV.std(new THREE.Color(P.skin).multiplyScalar(0.46), 0.75, 0.0, 0.08),
        hair: AV.std(P.hair, 0.6, 0.05, 0.45),
        top: AV.std(P.top, topRough, topMetal, glow),
        pants: AV.std(P.pants, 0.6, 0.08, glow),
        shoes: AV.std(P.shoes, 0.5, 0.1, glow),
        dark: AV.std(0x0e0e13, 0.45, 0.2, 0.8),
        metal: AV.std(0xc4ccd6, 0.3, 0.6),
        neon: AV.neon(P.neon),
        neon2: AV.neon(P.neon2 !== undefined ? P.neon2 : P.neon)
    };
    m.hairD = m.hair.clone();
    m.hairD.side = THREE.DoubleSide;
    m.topD = m.top.clone();
    m.topD.side = THREE.DoubleSide;
    if (look.helmet) m.skin = AV.std(P.skin, 0.22, 0.5, 0.2);

    // Tronco: playerMesh es el grupo que update() aplasta al deslizarse.
    const body = new THREE.Group();
    body.position.y = 1.35;
    game.player.add(body);
    game.playerMesh = body;

    const sw = fem ? 0.36 : 0.4 * bulk;
    const zf = fem ? 0.205 : 0.225 * bulk;
    const zb = -zf;
    if (fem) {
        AV.put(body, AV.taper(0.72, 0.6, 0.38, 0.72, 0.85), m.top, 0, 0.275, 0);
        AV.put(body, AV.box(0.5, 0.18, 0.31), look.midriff ? m.skin : m.top, 0, -0.1, 0);
        AV.put(body, AV.taper(0.6, 0.42, 0.36, 1, 1, 0.84, 0.88), m.pants, 0, -0.39, 0);
    } else {
        AV.put(body, AV.taper(0.8 * bulk, 0.95, 0.42 * bulk, 0.76, 0.88), m.top, 0, 0.1, 0);
        AV.put(body, AV.box(0.62, 0.28, 0.36), m.pants, 0, -0.47, 0);
    }
    AV.put(body, AV.cyl(0.1, 0.125, 0.2, 12), look.turtleneck ? m.top : m.skin, 0, 0.65, 0);

    const mkArm = (s) => {
        const pivot = new THREE.Group();
        pivot.position.set(s * (sw + 0.1), 0.47, 0);
        body.add(pivot);
        const r = fem ? 0.085 : 0.108 * bulk;
        AV.put(pivot, AV.sph(r * 1.25, 12, 10), m.top, 0, 0, 0);
        AV.put(pivot, AV.cyl(r, r * 0.82, 0.66, 10), m.top, 0, -0.34, 0);
        AV.put(pivot, AV.sph(r * 0.95, 10, 8), look.gloves ? m.dark : m.skin, 0, -0.72, 0);
        return pivot;
    };
    const armL = mkArm(-1), armR = mkArm(1);
    game.limbs.leftArm = armL;
    game.limbs.rightArm = armR;

    const mkLeg = (s) => {
        const pivot = new THREE.Group();
        pivot.position.set(s * (fem ? 0.17 : 0.21), 0.86, 0);
        game.player.add(pivot);
        const r = fem ? 0.125 : 0.145;
        AV.put(pivot, AV.cyl(r, r * 0.72, 0.74, 10), m.pants, 0, -0.37, 0);
        const bootH = look.boots ? 0.27 : 0.14;
        AV.put(pivot, AV.box(0.2, bootH, 0.36), m.shoes, 0, -0.815 + bootH / 2, 0.05);
        AV.put(pivot, AV.box(0.21, 0.045, 0.38), m.neon, 0, -0.8375, 0.05);
        return pivot;
    };
    const legL = mkLeg(-1), legR = mkLeg(1);
    game.limbs.leftLeg = legL;
    game.limbs.rightLeg = legR;

    // Cabeza
    const head = new THREE.Group();
    head.position.set(0, 1.0, 0.01);
    head.scale.setScalar(fem ? 1.1 : 1.14);
    body.add(head);
    const skull = AV.put(head, AV.sph(0.26, 18, 14), m.skin);
    skull.scale.set(0.94, 1.1, 1.0);
    if (!look.helmet) {
        [-1, 1].forEach(s => AV.put(head, AV.box(0.07, 0.035, 0.03), m.dark, s * 0.095, 0.03, 0.238));
        if (look.beard || look.stubble) {
            const beard = AV.put(head, AV.sph(0.238, 14, 10), m.hair, 0, -0.175, 0.04);
            beard.scale.set(0.86, look.beard ? 0.44 : 0.34, 0.9);
        }
    }

    const c = { game, body, head, armL, armR, legL, legR, m, zf, zb, accent: null };
    avBuildHair(c, look);

    // Audifonos
    const hp = look.headphones;
    if (hp) {
        const cupMat = AV.std(hp.cup, 0.35, 0.4);
        const ringMat = AV.neon(hp.ring);
        if (hp.mode === "neck") {
            AV.put(body, AV.torus(0.2, 0.03, Math.PI), cupMat, 0, 0.6, -0.02, -Math.PI / 2);
            [-1, 1].forEach(s => {
                AV.put(body, AV.cyl(0.105, 0.105, 0.08, 16), cupMat, s * 0.21, 0.58, 0.03, 0, 0, Math.PI / 2);
                AV.put(body, AV.cyl(0.07, 0.07, 0.095, 16), ringMat, s * 0.21, 0.58, 0.03, 0, 0, Math.PI / 2);
            });
        } else {
            AV.put(head, AV.torus(0.288, 0.028, Math.PI), cupMat, 0, 0.0, 0);
            [-1, 1].forEach(s => {
                AV.put(head, AV.cyl(0.115, 0.115, 0.09, 16), cupMat, s * 0.275, -0.01, 0, 0, 0, Math.PI / 2);
                AV.put(head, AV.cyl(0.075, 0.075, 0.105, 16), ringMat, s * 0.275, -0.01, 0, 0, 0, Math.PI / 2);
            });
        }
    }

    // Una sola luz de acento del color del DJ, detras del corredor (lado de la camara).
    const accent = new THREE.PointLight(P.neon, 0.7, 7, 1.5);
    accent.position.set(0, 1.9, -2.4);
    game.player.add(accent);
    c.accent = accent;

    if (look.decor) look.decor(c);
    return c;
}

// --- 3. MAIN GAME CONTROLLER ---
class ZonaTRunnerGame {
    constructor() {
        this.selectedDJ = DJS[0];
        this.audio = new AudioEngine();

        // High Score
        this.highScore = parseInt(localStorage.getItem("zonat_highscore") || "0", 10);

        // Gameplay State
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.speed = 24;
        this.maxSpeed = 52;
        this.currentLane = 0; // -1, 0, 1
        this.targetLaneX = 0;
        this.laneDistance = 3.3;

        // Jump & Slide Physics
        this.isJumping = false;
        this.isSliding = false;
        this.verticalVelocity = 0;
        this.gravity = -46;
        this.jumpForce = 15.5;
        this.slideTimer = 0;

        // Power-Ups
        this.hasShield = false;
        this.magnetTimer = 0;
        this.feverTimer = 0;

        // Three.js Systems
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.playerMesh = null;
        this.shieldMesh = null;
        this.limbs = {};
        this.runAnimTime = 0;

        // Procedural Elements & Billboards
        this.groundSegments = [];
        this.obstacles = [];
        this.collectibles = [];
        this.powerUpItems = [];
        this.rainParticles = null;
        this.billboards = [];
        this.lastSpawnZ = -10;

        // Texture Loader for Real Zona T Billboards
        this.textureLoader = new THREE.TextureLoader();
        this.billboardTextures = [
            this.textureLoader.load("assets/billboards/valla_baum.jpg"),
            this.textureLoader.load("assets/billboards/valla_octava.jpg"),
            this.textureLoader.load("assets/billboards/valla_andino.jpg"),
            this.textureLoader.load("assets/billboards/valla_andresdc.jpg"),
            this.textureLoader.load("assets/billboards/valla_redbull.jpg"),
            this.textureLoader.load("assets/billboards/valla_zonat_pass.jpg")
        ];
        this.billboardCycle = 0;

        // Input
        this.touchStartX = 0;
        this.touchStartY = 0;

        this.initDOM();
        this.initThree();
        this.initRain();
        this.bindEvents();

        // Query parameters for automation and testing (?dj=dj_nunez&autostart=1)
        const urlParams = new URLSearchParams(window.location.search);
        const djParam = urlParams.get("dj");
        if (djParam) {
            const matchedDJ = DJS.find(d => d.id === djParam);
            if (matchedDJ) {
                const cardEl = document.querySelector(`.dj-card[data-id="${matchedDJ.id}"]`);
                if (cardEl) this.selectDJ(matchedDJ, cardEl);
            }
        }
        if (urlParams.get("autostart") === "1") {
            setTimeout(() => {
                const startBtn = document.getElementById("btn-start-run");
                if (startBtn) startBtn.click();
            }, 400);
        }
    }

    initDOM() {
        const djListEl = document.getElementById("dj-list");
        djListEl.innerHTML = "";

        // En pantallas tactiles no hay teclado: se explican los gestos.
        const hint = document.getElementById("controls-hint");
        if (hint && window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
            hint.textContent = "CONTROLES: desliza ⬅️ ➡️ para cambiar de carril • ⬆️ saltar • ⬇️ deslizarte";
        }

        DJS.forEach((dj, idx) => {
            const card = document.createElement("div");
            card.className = `dj-card ${idx === 0 ? "selected" : ""}`;
            card.dataset.id = dj.id;

            const avatarContent = dj.avatar
                ? `<img src="${dj.avatar}" alt="${dj.name}" style="width:100%; height:100%; object-fit:cover; object-position:top; border-radius:8px;">`
                : `<span style="font-size:2rem;">🎧</span>`;

            card.innerHTML = `
                <div class="dj-avatar" style="background: ${dj.color}22; border-color: ${dj.color}; overflow:hidden; padding:0;">
                    ${avatarContent}
                </div>
                <div class="dj-name" style="color:${dj.color}">${dj.name}</div>
                <div class="dj-genre">${dj.genre}</div>
                <div class="dj-bpm">${dj.bpm} BPM</div>
            `;
            card.addEventListener("click", () => this.selectDJ(dj, card));
            djListEl.appendChild(card);
        });

        document.getElementById("high-score-val").innerText = this.highScore;
        this.updateHudAvatar();
        document.getElementById("btn-start-run").addEventListener("click", () => this.startRun());
        document.getElementById("btn-restart").addEventListener("click", () => this.startRun());
        document.getElementById("btn-change-dj").addEventListener("click", () => {
            document.getElementById("screen-gameover").classList.add("hidden");
            document.getElementById("screen-start").classList.remove("hidden");
        });

        // Pause overlay
        const pauseBtn = document.getElementById("btn-resume");
        if (pauseBtn) {
            pauseBtn.addEventListener("click", () => this.togglePause());
        }
    }

    selectDJ(dj, cardEl) {
        this.selectedDJ = dj;
        document.querySelectorAll(".dj-card").forEach(c => c.classList.remove("selected"));
        cardEl.classList.add("selected");
        document.getElementById("hud-dj-name").innerText = dj.name;
        document.getElementById("hud-dj-name").style.color = dj.color;
        this.updateHudAvatar();
        const bpmTag = document.getElementById("hud-bpm-tag");
        if (bpmTag) bpmTag.innerText = `BEAT ${dj.bpm} BPM`;
        this.applyDJTheme();
    }

    // Miniatura del avatar (la misma imagen de la tarjeta) junto a "DJ Activo".
    updateHudAvatar() {
        const nameEl = document.getElementById("hud-dj-name");
        if (!nameEl) return;
        let img = document.getElementById("hud-dj-avatar");
        if (!img) {
            const stat = nameEl.parentNode;
            const textWrap = document.createElement("div");
            while (stat.firstChild) textWrap.appendChild(stat.firstChild);
            img = document.createElement("img");
            img.id = "hud-dj-avatar";
            img.alt = "";
            img.style.cssText = "width:clamp(30px,5vw,46px);height:clamp(30px,5vw,46px);border-radius:50%;" +
                "object-fit:cover;object-position:top;border:2px solid currentColor;flex:none;";
            stat.style.display = "flex";
            stat.style.alignItems = "center";
            stat.style.justifyContent = "flex-end";
            stat.style.gap = "10px";
            stat.appendChild(textWrap);
            stat.appendChild(img);
        }
        const dj = this.selectedDJ;
        img.style.color = dj.color;
        img.style.display = dj.avatar ? "block" : "none";
        if (dj.avatar) img.src = dj.avatar;
    }

    applyDJTheme() {
        if (!this.scene) return;
        // Cyberpunk Bogotá midnight navy atmosphere (Image 2 style)
        const skyColor = 0x060913;
        this.scene.background = new THREE.Color(skyColor);
        this.scene.fog = new THREE.FogExp2(0x0a0614, 0.012);

        if (this.player) {
            const posX = this.player.position.x;
            const posY = this.player.position.y;
            const posZ = this.player.position.z;
            this.scene.remove(this.player);
            this.player.traverse(o => {
                if (o.geometry) o.geometry.dispose();
                if (o.material) o.material.dispose();
            });
            this.buildPlayerCharacter();
            this.player.position.set(posX, posY, posZ);
        }
    }

    initCyberpunkAssets() {
        this.cyberpunkTextures = {};

        // 1. BAUM FESTIVAL LED Megascreen (Matching Image 2 exactly)
        this.cyberpunkTextures.baum = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 512;
            const ctx = canvas.getContext("2d");

            // Cosmic midnight background
            const bgGrad = ctx.createLinearGradient(0, 0, 1024, 512);
            bgGrad.addColorStop(0, "#030611");
            bgGrad.addColorStop(0.5, "#080c26");
            bgGrad.addColorStop(1, "#030614");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 1024, 512);

            // Magenta & Cyan Energy Aura/Wisps (like Image 2)
            ctx.save();
            const radCyan = ctx.createRadialGradient(280, 256, 10, 280, 256, 260);
            radCyan.addColorStop(0, "rgba(0, 255, 235, 0.9)");
            radCyan.addColorStop(0.4, "rgba(0, 190, 255, 0.45)");
            radCyan.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = radCyan;
            ctx.fillRect(50, 20, 500, 472);

            const radMag = ctx.createRadialGradient(744, 256, 10, 744, 256, 260);
            radMag.addColorStop(0, "rgba(255, 0, 170, 0.9)");
            radMag.addColorStop(0.4, "rgba(200, 0, 230, 0.45)");
            radMag.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = radMag;
            ctx.fillRect(474, 20, 500, 472);
            ctx.restore();

            // Concentric Glowing Neon Portal Circle
            ctx.save();
            ctx.lineWidth = 16;
            ctx.shadowBlur = 32;
            ctx.shadowColor = "#00ffff";
            const ringGrad = ctx.createLinearGradient(320, 100, 704, 412);
            ringGrad.addColorStop(0, "#00ffff");
            ringGrad.addColorStop(0.4, "#ffffff");
            ringGrad.addColorStop(1, "#ff0099");
            ctx.strokeStyle = ringGrad;
            ctx.beginPath();
            ctx.arc(512, 256, 155, 0, Math.PI * 2);
            ctx.stroke();

            // White hot core
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#ffffff";
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.restore();

            // Bold Typography: "BAUM" and "FESTIVAL"
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 24;
            ctx.font = '900 86px "Arial Black", "Montserrat", sans-serif';
            ctx.fillText("BAUM", 512, 222);

            ctx.font = '800 42px "Arial Black", "Montserrat", sans-serif';
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 18;
            ctx.fillText("FESTIVAL", 512, 302);
            ctx.restore();

            // Digital LED Scanlines
            ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
            for (let y = 0; y < 512; y += 4) {
                ctx.fillRect(0, y, 1024, 2);
            }

            // Outer Neon Border
            ctx.strokeStyle = "#00e5ff";
            ctx.lineWidth = 8;
            ctx.strokeRect(6, 6, 1012, 500);

            const tex = new THREE.CanvasTexture(canvas);
            return tex;
        })();

        // 2. CLUB OCTAVA Sign (Matching Image 2 left facade)
        
        // --- TEXTURAS DINÁMICAS DE LOS NUEVOS CLUBES ---
        this.cyberpunkTextures.l1fe = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024; canvas.height = 256;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(10, 2, 22, 0.95)";
            ctx.fillRect(0, 0, 1024, 256);
            ctx.strokeStyle = "#a855f7"; ctx.lineWidth = 10;
            ctx.shadowColor = "#c084fc"; ctx.shadowBlur = 35;
            ctx.strokeRect(10, 14, 1004, 228);
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = '900 100px "Arial Black", sans-serif';
            ctx.shadowColor = "#d946ef"; ctx.shadowBlur = 45;
            ctx.fillStyle = "#ffffff";
            ctx.fillText("L1FE • BUNKER", 512, 128);
            return new THREE.CanvasTexture(canvas);
        })();

        this.cyberpunkTextures.chula = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024; canvas.height = 256;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(24, 4, 16, 0.95)";
            ctx.fillRect(0, 0, 1024, 256);
            ctx.strokeStyle = "#ff007f"; ctx.lineWidth = 10;
            ctx.shadowColor = "#ff007f"; ctx.shadowBlur = 35;
            ctx.strokeRect(10, 14, 1004, 228);
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = '900 110px "Arial Black", sans-serif';
            ctx.shadowColor = "#ff007f"; ctx.shadowBlur = 45;
            ctx.fillStyle = "#ffffff";
            ctx.fillText("LA CHULA ZONA T", 512, 128);
            return new THREE.CanvasTexture(canvas);
        })();

        this.cyberpunkTextures.capri = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024; canvas.height = 256;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(22, 18, 4, 0.95)";
            ctx.fillRect(0, 0, 1024, 256);
            ctx.strokeStyle = "#eab308"; ctx.lineWidth = 10;
            ctx.shadowColor = "#facc15"; ctx.shadowBlur = 35;
            ctx.strokeRect(10, 14, 1004, 228);
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = '900 115px "Arial Black", sans-serif';
            ctx.shadowColor = "#fde047"; ctx.shadowBlur = 45;
            ctx.fillStyle = "#ffffff";
            ctx.fillText("CAPRI CLUB VIP", 512, 128);
            return new THREE.CanvasTexture(canvas);
        })();

        this.cyberpunkTextures.malaflor = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024; canvas.height = 256;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(4, 20, 14, 0.95)";
            ctx.fillRect(0, 0, 1024, 256);
            ctx.strokeStyle = "#10b981"; ctx.lineWidth = 10;
            ctx.shadowColor = "#34d399"; ctx.shadowBlur = 35;
            ctx.strokeRect(10, 14, 1004, 228);
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = '900 110px "Arial Black", sans-serif';
            ctx.shadowColor = "#6ee7b7"; ctx.shadowBlur = 45;
            ctx.fillStyle = "#ffffff";
            ctx.fillText("MALAFLOR", 512, 128);
            return new THREE.CanvasTexture(canvas);
        })();

        this.cyberpunkTextures.monoBandido = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024; canvas.height = 256;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(24, 12, 4, 0.95)";
            ctx.fillRect(0, 0, 1024, 256);
            ctx.strokeStyle = "#f97316"; ctx.lineWidth = 10;
            ctx.shadowColor = "#fb923c"; ctx.shadowBlur = 35;
            ctx.strokeRect(10, 14, 1004, 228);
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = '900 100px "Arial Black", sans-serif';
            ctx.shadowColor = "#fdba74"; ctx.shadowBlur = 45;
            ctx.fillStyle = "#ffffff";
            ctx.fillText("EL MONO BANDIDO", 512, 128);
            return new THREE.CanvasTexture(canvas);
        })();

        this.cyberpunkTextures.afterhouse = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024; canvas.height = 256;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(16, 2, 28, 0.95)";
            ctx.fillRect(0, 0, 1024, 256);
            ctx.strokeStyle = "#c026d3"; ctx.lineWidth = 10;
            ctx.shadowColor = "#e879f9"; ctx.shadowBlur = 35;
            ctx.strokeRect(10, 14, 1004, 228);
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = '900 105px "Arial Black", sans-serif';
            ctx.shadowColor = "#f0abfc"; ctx.shadowBlur = 45;
            ctx.fillStyle = "#ffffff";
            ctx.fillText("AFTERHOUSE BOGOTÁ", 512, 128);
            return new THREE.CanvasTexture(canvas);
        })();

        this.cyberpunkTextures.ratonClub = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024; canvas.height = 256;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "rgba(24, 4, 4, 0.95)";
            ctx.fillRect(0, 0, 1024, 256);
            ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 10;
            ctx.shadowColor = "#f87171"; ctx.shadowBlur = 35;
            ctx.strokeRect(10, 14, 1004, 228);
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = '900 110px "Arial Black", sans-serif';
            ctx.shadowColor = "#facc15"; ctx.shadowBlur = 45;
            ctx.fillStyle = "#ffffff";
            ctx.fillText("RATÓN CLUB", 512, 128);
            return new THREE.CanvasTexture(canvas);
        })();

        this.cyberpunkTextures.octava = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 256;
            const ctx = canvas.getContext("2d");

            // Deep glossy plate backing
            ctx.fillStyle = "rgba(4, 8, 16, 0.96)";
            ctx.fillRect(0, 0, 1024, 256);

            // Double Cyan Neon Border
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 10;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 35;
            ctx.strokeRect(10, 14, 1004, 228);

            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ffffff";
            ctx.shadowBlur = 12;
            ctx.strokeRect(18, 22, 988, 212);

            // Intense Neon Outline Letters: "CLUB OCTAVA"
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = '900 114px "Arial Black", "Montserrat", sans-serif';

            // Outer cyan bloom
            ctx.shadowColor = "#00f0ff";
            ctx.shadowBlur = 50;
            ctx.strokeStyle = "#00f0ff";
            ctx.lineWidth = 22;
            ctx.strokeText("CLUB OCTAVA", 512, 128);

            // Medium electric glow
            ctx.shadowBlur = 22;
            ctx.strokeStyle = "#80ffff";
            ctx.lineWidth = 10;
            ctx.strokeText("CLUB OCTAVA", 512, 128);

            // Core pure white tube
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ffffff";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("CLUB OCTAVA", 512, 128);

            return new THREE.CanvasTexture(canvas);
        })();

        // 3. ANDRÉS D.C. Sign (Matching Image 2 colorful brick sign)
        this.cyberpunkTextures.andresDC = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 256;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "rgba(12, 6, 6, 0.95)";
            ctx.fillRect(0, 0, 1024, 256);

            ctx.strokeStyle = "#ff4400";
            ctx.lineWidth = 10;
            ctx.shadowColor = "#ff5500";
            ctx.shadowBlur = 30;
            ctx.strokeRect(10, 14, 1004, 228);

            const text = "ANDRÉS D.C.";
            const colors = ["#ff2244", "#ff8800", "#ffdd00", "#00ff66", "#00d9ff", "#ff0099", "#ffcc00", "#ffea00", "#00ffff", "#ff2244", "#ffea00"];

            ctx.font = '900 110px "Arial Black", "Impact", sans-serif';
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            let startX = 115;
            const stepX = 79;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const col = colors[i % colors.length];
                const cx = startX + (i * stepX);

                ctx.shadowColor = col;
                ctx.shadowBlur = 42;
                ctx.fillStyle = col;
                ctx.fillText(char, cx, 128);

                ctx.shadowBlur = 12;
                ctx.shadowColor = "#ffffff";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(char, cx, 128);
            }

            return new THREE.CanvasTexture(canvas);
        })();

        // 4. BAUM CLUB Sign (Purple/Magenta club sign)
        this.cyberpunkTextures.baumClub = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 256;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "rgba(12, 4, 18, 0.92)";
            ctx.fillRect(0, 0, 1024, 256);

            ctx.strokeStyle = "#d400ff";
            ctx.lineWidth = 8;
            ctx.shadowColor = "#d400ff";
            ctx.shadowBlur = 28;
            ctx.strokeRect(12, 16, 1000, 224);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = '900 92px "Arial Black", "Montserrat", sans-serif';

            ctx.shadowColor = "#d400ff";
            ctx.shadowBlur = 36;
            ctx.fillStyle = "#ff00dd";
            ctx.fillText("BAUM CLUB", 512, 128);

            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ffffff";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("BAUM CLUB", 512, 128);

            return new THREE.CanvasTexture(canvas);
        })();

        // 5. KAPUTT Club Sign (Acid lime green)
        this.cyberpunkTextures.kaputt = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 256;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "rgba(4, 14, 8, 0.92)";
            ctx.fillRect(0, 0, 1024, 256);

            ctx.strokeStyle = "#39ff14";
            ctx.lineWidth = 8;
            ctx.shadowColor = "#39ff14";
            ctx.shadowBlur = 28;
            ctx.strokeRect(12, 16, 1000, 224);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = '900 96px "Arial Black", "Montserrat", sans-serif';

            ctx.shadowColor = "#39ff14";
            ctx.shadowBlur = 36;
            ctx.fillStyle = "#39ff14";
            ctx.fillText("KAPUTT", 512, 128);

            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ffffff";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("KAPUTT", 512, 128);

            return new THREE.CanvasTexture(canvas);
        })();

        // 6. Storefront Windows & Cocktails Signage
        this.cyberpunkTextures.storefronts = [
            (() => {
                const canvas = document.createElement("canvas");
                canvas.width = 512;
                canvas.height = 256;
                const ctx = canvas.getContext("2d");
                const grad = ctx.createLinearGradient(0, 0, 512, 256);
                grad.addColorStop(0, "#2c0e04");
                grad.addColorStop(1, "#521d0a");
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 512, 256);
                ctx.strokeStyle = "#0d0f17";
                ctx.lineWidth = 8;
                ctx.strokeRect(0, 0, 512, 256);
                ctx.strokeRect(256, 0, 2, 256);
                ctx.font = '800 48px "Arial Black", sans-serif';
                ctx.textAlign = "center";
                ctx.shadowColor = "#ffaa00";
                ctx.shadowBlur = 20;
                ctx.fillStyle = "#ffdd44";
                ctx.fillText("COCKTAILS & BEATS", 256, 128);
                return new THREE.CanvasTexture(canvas);
            })(),
            (() => {
                const canvas = document.createElement("canvas");
                canvas.width = 512;
                canvas.height = 256;
                const ctx = canvas.getContext("2d");
                const grad = ctx.createLinearGradient(0, 0, 512, 256);
                grad.addColorStop(0, "#081b2a");
                grad.addColorStop(1, "#142c44");
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 512, 256);
                ctx.strokeStyle = "#0d0f17";
                ctx.lineWidth = 8;
                ctx.strokeRect(0, 0, 512, 256);
                ctx.strokeRect(256, 0, 2, 256);
                ctx.font = '800 48px "Arial Black", sans-serif';
                ctx.textAlign = "center";
                ctx.shadowColor = "#00e5ff";
                ctx.shadowBlur = 20;
                ctx.fillStyle = "#00ffff";
                ctx.fillText("TECHNO RECORD STORE", 256, 128);
                return new THREE.CanvasTexture(canvas);
            })(),
            (() => {
                const canvas = document.createElement("canvas");
                canvas.width = 512;
                canvas.height = 256;
                const ctx = canvas.getContext("2d");
                const grad = ctx.createLinearGradient(0, 0, 512, 256);
                grad.addColorStop(0, "#2a041f");
                grad.addColorStop(1, "#440932");
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 512, 256);
                ctx.strokeStyle = "#0d0f17";
                ctx.lineWidth = 8;
                ctx.strokeRect(0, 0, 512, 256);
                ctx.font = '800 52px "Arial Black", sans-serif';
                ctx.textAlign = "center";
                ctx.shadowColor = "#ff00aa";
                ctx.shadowBlur = 20;
                ctx.fillStyle = "#ff0099";
                ctx.fillText("ZONA T VIP CLUB", 256, 128);
                return new THREE.CanvasTexture(canvas);
            })()
        ];

        // 7. Authentic Bogotá Terracotta Brick Texture
        this.cyberpunkTextures.brick = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#1e1614";
            ctx.fillRect(0, 0, 512, 512);

            const rows = 16;
            const cols = 8;
            const rowH = 512 / rows;
            const colW = 512 / cols;
            const brickTones = ["#7c2b1e", "#8b3424", "#662218", "#993d2b", "#5c1d14", "#a1422f", "#732a1d"];

            for (let r = 0; r < rows; r++) {
                const y = r * rowH;
                const offsetX = (r % 2 === 0) ? 0 : (colW / 2);
                for (let c = -1; c <= cols + 1; c++) {
                    const x = c * colW + offsetX;
                    ctx.fillStyle = brickTones[Math.floor(Math.random() * brickTones.length)];
                    ctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
                    ctx.fillRect(x + 2, y + rowH - 5, colW - 4, 3);
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(2, 4);
            return tex;
        })();

        // 8. Skyscraper Windows Texture
        this.cyberpunkTextures.windows = (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#0c111c";
            ctx.fillRect(0, 0, 512, 512);

            const rows = 12;
            const cols = 8;
            const rw = 512 / cols;
            const rh = 512 / rows;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const rnd = Math.random();
                    if (rnd < 0.28) {
                        ctx.fillStyle = "rgba(255, 230, 160, 0.85)";
                    } else if (rnd < 0.44) {
                        ctx.fillStyle = "rgba(0, 230, 255, 0.8)";
                    } else if (rnd < 0.52) {
                        ctx.fillStyle = "rgba(255, 0, 128, 0.75)";
                    } else {
                        ctx.fillStyle = "rgba(16, 24, 38, 0.9)";
                    }
                    ctx.fillRect(c * rw + 6, r * rh + 6, rw - 12, rh - 12);
                }
            }
            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(1, 3);
            return tex;
        })();
    }

    initThree() {
        const canvas = document.getElementById("game-canvas");
        this.scene = new THREE.Scene();
        this.applyDJTheme();

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 240);
        this.camera.position.set(0, 4.4, -6.5);
        this.camera.lookAt(0, 2.7, 18);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Atmospheric Cyberpunk Lights
        const ambient = new THREE.AmbientLight(0x28324a, 0.9);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0x7c9bc2, 0.85);
        dirLight.position.set(8, 24, 12);
        this.scene.add(dirLight);

        // Procedural Cyberpunk Assets & Neon Signs
        this.initCyberpunkAssets();

        // 3D Player Character Assembly
        this.buildPlayerCharacter();

        // Spawn initial road
        this.resetWorld();

        // Animation Loop
        let lastTime = performance.now();
        const animate = (now) => {
            requestAnimationFrame(animate);
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;
            this.pollGamepad();
            if (!this.isPaused) {
                this.update(dt);
            }
            this.renderer.render(this.scene, this.camera);
        };
        requestAnimationFrame(animate);
    }

    buildPlayerCharacter() {
        this.player = new THREE.Group();
        this.limbs = {};
        this.tatanLight = null;
        this.fresarLight = null;
        this.flameLight = null;

        // Modelo procedural del DJ seleccionado (ver DJ_LOOKS / buildDJAvatar).
        buildDJAvatar(this, getDJLook(this.selectedDJ));
        this.player.scale.setScalar(1.1);

        // Shield Bubble Visualizer
        const shieldGeo = new THREE.SphereGeometry(1.6, 24, 24);
        const shieldMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.35,
            wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.shieldMesh.position.y = 1.2;
        this.shieldMesh.visible = false;
        this.player.add(this.shieldMesh);

        this.scene.add(this.player);
    }

    initRain() {
        // Neon rain & club mist atmosphere in Bogotá
        const rainCount = 2000;
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(rainCount * 3);
        const velocities = new Float32Array(rainCount);

        for (let i = 0; i < rainCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 45;
            positions[i + 1] = Math.random() * 35;
            positions[i + 2] = (Math.random() - 0.5) * 110;
            velocities[i / 3] = 25 + Math.random() * 20;
        }

        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const rainMat = new THREE.PointsMaterial({
            color: 0x00f3ff,
            size: 0.22,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        this.rainParticles = new THREE.Points(rainGeo, rainMat);
        this.rainVelocities = velocities;
        this.scene.add(this.rainParticles);
    }

    resetWorld() {
        this.groundSegments.forEach(s => this.scene.remove(s));
        this.obstacles.forEach(o => this.scene.remove(o.mesh));
        this.collectibles.forEach(c => this.scene.remove(c.mesh));
        this.powerUpItems.forEach(p => this.scene.remove(p.mesh));
        this.billboards.forEach(b => this.scene.remove(b));

        this.groundSegments = [];
        this.obstacles = [];
        this.collectibles = [];
        this.powerUpItems = [];
        this.billboards = [];
        this.lastSpawnZ = -14;
        this.segmentCount = 0;

        for (let i = 0; i < 11; i++) {
            this.spawnTrackSegment(i < 3);
        }
    }

    spawnTrackSegment(isSafe) {
        const segLen = 28;
        const segment = new THREE.Group();
        segment.position.z = this.lastSpawnZ;
        const segIndex = this.segmentCount++;

        // 1. Bogotá Zona T Wet Asphalt Roadway (Image 2 Style)
        const streetWidth = 10.4;
        const roadGeo = new THREE.PlaneGeometry(streetWidth, segLen);
        const roadMat = new THREE.MeshStandardMaterial({
            color: 0x070a10,
            roughness: 0.1,
            metalness: 0.72
        });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.z = segLen / 2;
        segment.add(road);

        // Double Solid Yellow Center Line (Image 2 Key Feature)
        [-0.15, 0.15].forEach(x => {
            const lineGeo = new THREE.PlaneGeometry(0.12, segLen);
            const lineMat = new THREE.MeshBasicMaterial({ color: 0xffd000 });
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.025, segLen / 2);
            segment.add(line);
        });

        // Glowing Electric Cyan Curb Strips (Image 2 Key Feature along both curbs)
        [-4.95, 4.95].forEach(x => {
            const stripGeo = new THREE.PlaneGeometry(0.24, segLen);
            const stripMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
            const strip = new THREE.Mesh(stripGeo, stripMat);
            strip.rotation.x = -Math.PI / 2;
            strip.position.set(x, 0.035, segLen / 2);
            segment.add(strip);
        });

        // 2. Zona T Sidewalks (Andenes anchos con Bolardos Bogotanos negros y Farolas)
        const paverMat = new THREE.MeshStandardMaterial({ color: 0x1a1e27, roughness: 0.6 });
        const curbMat = new THREE.MeshStandardMaterial({ color: 0x2b323c, roughness: 0.5 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x111317, metalness: 0.85, roughness: 0.2 });

        [-7.6, 7.6].forEach(sideX => {
            // Sidewalk Pavers
            const swGeo = new THREE.BoxGeometry(4.8, 0.22, segLen);
            const sidewalk = new THREE.Mesh(swGeo, paverMat);
            sidewalk.position.set(sideX, 0.11, segLen / 2);
            segment.add(sidewalk);

            // Curb Border
            const curbEdgeX = sideX > 0 ? 5.15 : -5.15;
            const curbGeo = new THREE.BoxGeometry(0.28, 0.26, segLen);
            const curb = new THREE.Mesh(curbGeo, curbMat);
            curb.position.set(curbEdgeX, 0.13, segLen / 2);
            segment.add(curb);

            // Typical Bogotá Security Bollards (Bolardos cilíndricos negros con franja reflectiva)
            for (let bz = 3.5; bz < segLen; bz += 5.2) {
                const bGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.82, 12);
                const bollard = new THREE.Mesh(bGeo, metalMat);
                const bx = sideX > 0 ? 5.5 : -5.5;
                bollard.position.set(bx, 0.45, bz);
                segment.add(bollard);

                // Reflective white top ring on bollard (like Image 2)
                const ringGeo = new THREE.CylinderGeometry(0.122, 0.122, 0.08, 12);
                const ringMat = new THREE.MeshBasicMaterial({ color: 0xe0e6ed });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.set(bx, 0.78, bz);
                segment.add(ring);
            }
        });

        // 3. Cyberpunk Nightclub Architecture & Glowing Neon Signs (Image 2 Key Elements!)
        const brickMat = new THREE.MeshStandardMaterial({
            map: this.cyberpunkTextures.brick,
            roughness: 0.85
        });
        const windowMat = new THREE.MeshBasicMaterial({
            map: this.cyberpunkTextures.windows
        });

        // =========================================================================
        // SCREEN LEFT (+X = +11.8): DINÁMICA DE LOS 10 CLUBES Y SPOTS DE LA ZONA T
        // Rotación continua de: Octava, Andrés D.C., L1FE, La Chula, Capri, Malaflor, Mono Bandido, Afterhouse, Ratón Club
        // =========================================================================
        const leftHalfLen = segLen / 2; // 14m por fachada

        const venuesPool = [
            { name: "CLUB OCTAVA", tex: this.cyberpunkTextures.octava, color: 0x00ffff, hasCanopy: true },
            { name: "ANDRÉS D.C.", tex: this.cyberpunkTextures.andresDC, color: 0xff5500, hasCanopy: true },
            { name: "L1FE BOGOTÁ", tex: this.cyberpunkTextures.l1fe, color: 0xa855f7, hasCanopy: true },
            { name: "LA CHULA ZONA T", tex: this.cyberpunkTextures.chula, color: 0xff007f, hasCanopy: false },
            { name: "CAPRI CLUB VIP", tex: this.cyberpunkTextures.capri, color: 0xeab308, hasCanopy: true },
            { name: "MALAFLOR", tex: this.cyberpunkTextures.malaflor, color: 0x10b981, hasCanopy: false },
            { name: "EL MONO BANDIDO", tex: this.cyberpunkTextures.monoBandido, color: 0xf97316, hasCanopy: true },
            { name: "AFTERHOUSE", tex: this.cyberpunkTextures.afterhouse, color: 0xc026d3, hasCanopy: true },
            { name: "RATÓN CLUB", tex: this.cyberpunkTextures.ratonClub, color: 0xef4444, hasCanopy: false }
        ];

        // Generar 2 discotecas por segmento
        [0, 1].forEach(subIdx => {
            const venue = venuesPool[(segIndex * 2 + subIdx) % venuesPool.length];
            const bldgZ = leftHalfLen * (subIdx + 0.5);
            const bldgHeight = 22 + (subIdx * 2);
            const bldg = new THREE.Group();
            bldg.position.set(11.8, bldgHeight / 2, bldgZ);

            // Cuerpo de ladrillo
            const bBody = new THREE.Mesh(new THREE.BoxGeometry(6.6, bldgHeight, leftHalfLen), brickMat);
            bldg.add(bBody);

            // Ventanas
            const bWin = new THREE.Mesh(new THREE.PlaneGeometry(leftHalfLen - 1.5, bldgHeight - 8), windowMat);
            bWin.rotation.y = -Math.PI / 2;
            bWin.position.set(-3.32, 3.2, 0);
            bldg.add(bWin);

            // Letrero Neón del Club
            const signGeo = new THREE.PlaneGeometry(6.6, 1.8);
            const signMat = new THREE.MeshBasicMaterial({ map: venue.tex, side: THREE.DoubleSide });
            const sign = new THREE.Mesh(signGeo, signMat);

            // Marquesina extendida hacia el andén
            const canopyGeo = new THREE.BoxGeometry(4.5, 0.5, 9.6);
            const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0a0e14, metalness: 0.9, roughness: 0.25 });
            const canopy = new THREE.Mesh(canopyGeo, canopyMat);
            canopy.position.set(-4.8, 4.2 - (bldgHeight / 2), 0);
            bldg.add(canopy);

            // Letrero gigante perpendicular cruzando el andén hacia la calle (VISIBLE PARA EL CORREDOR)
            const signFrontGeo = new THREE.PlaneGeometry(8.2, 2.2);
            const signFrontMat = new THREE.MeshBasicMaterial({ map: venue.tex, side: THREE.DoubleSide });
            const signFront = new THREE.Mesh(signFrontGeo, signFrontMat);
            signFront.rotation.y = Math.PI * 0.92; // Ligeramente angulado hacia el jugador
            signFront.position.set(-4.9, 5.8 - (bldgHeight / 2), -4.5);
            bldg.add(signFront);

            // Letrero en la fachada superior iluminado
            const signWallGeo = new THREE.PlaneGeometry(9.5, 2.4);
            const signWall = new THREE.Mesh(signWallGeo, signFrontMat);
            signWall.rotation.y = -Math.PI / 2; // Paralelo a la fachada
            signWall.position.set(-3.35, 9.5 - (bldgHeight / 2), 0);
            bldg.add(signWall);

            // Luz volumétrica del club iluminando la pista
            const clubLight = new THREE.PointLight(venue.color, 4.0, 24);
            clubLight.position.set(5.8, 4.2, bldgZ);
            segment.add(clubLight);

            segment.add(bldg);
        });

        // =========================================================================
        // SCREEN RIGHT (-X = -11.8): COMMERCIAL BRICK BUILDINGS & NEON STOREFRONTS (Like Image 2)
        // =========================================================================
        const rightBldgHeight = 25 + (Math.cos(segIndex * 1.7) * 4);
        const rightBldg = new THREE.Group();
        rightBldg.position.set(-11.8, rightBldgHeight / 2, segLen / 2); // -X is SCREEN RIGHT

        const rightBodyGeo = new THREE.BoxGeometry(6.6, rightBldgHeight, segLen);
        const rightBody = new THREE.Mesh(rightBodyGeo, brickMat);
        rightBldg.add(rightBody);

        // Windows Upper Rows
        const rightWinGeo = new THREE.PlaneGeometry(segLen - 2, rightBldgHeight - 8);
        const rightWin = new THREE.Mesh(rightWinGeo, windowMat);
        rightWin.rotation.y = Math.PI / 2; // Facing street (+X)
        rightWin.position.set(3.32, 3.5, 0);
        rightBldg.add(rightWin);

        // Multiple Ground Floor Illuminated Storefronts / Club vitrinas along street
        [-leftHalfLen * 0.5, leftHalfLen * 0.5].forEach((sfZ, sidx) => {
            const sfGeo = new THREE.PlaneGeometry(5.8, 3.4);
            const sfTex = this.cyberpunkTextures.storefronts[(segIndex + sidx) % 3];
            const sf = new THREE.Mesh(sfGeo, new THREE.MeshBasicMaterial({ map: sfTex }));
            sf.rotation.y = Math.PI / 2;
            sf.position.set(3.34, 1.8 - (rightBldgHeight / 2), sfZ);
            rightBldg.add(sf);

            // Discotecas en la acera derecha rotando también
            const rightVenues = [this.cyberpunkTextures.capri, this.cyberpunkTextures.monoBandido, this.cyberpunkTextures.afterhouse, this.cyberpunkTextures.ratonClub, this.cyberpunkTextures.chula, this.cyberpunkTextures.malaflor];
            const rSignGeo = new THREE.PlaneGeometry(7.2, 2.0);
            const rSignTex = rightVenues[(segIndex + sidx) % rightVenues.length];
            const rSign = new THREE.Mesh(rSignGeo, new THREE.MeshBasicMaterial({ map: rSignTex, side: THREE.DoubleSide }));
            rSign.rotation.y = Math.PI * 0.08; // Angulado hacia el frente del corredor
            rSign.position.set(4.5, 5.0 - (rightBldgHeight / 2), sfZ - 2.5);
            rightBldg.add(rSign);

            const rWallSign = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 2.2), new THREE.MeshBasicMaterial({ map: rSignTex, side: THREE.DoubleSide }));
            rWallSign.rotation.y = Math.PI / 2;
            rWallSign.position.set(3.35, 8.8 - (rightBldgHeight / 2), sfZ);
            rightBldg.add(rWallSign);
        });

        const rightLight = new THREE.PointLight((segIndex % 2 === 0) ? 0xcc00ff : 0x00ffcc, 2.5, 18);
        rightLight.position.set(-5.8, 3.8, segLen / 2);
        segment.add(rightLight);

        segment.add(rightBldg);

        // =========================================================================
        // 4. 🏙️ OVERHEAD SPACE-FRAME GANTRY WITH "BAUM FESTIVAL" MEGASCREEN (Image 2 Key Focal Point)
        // Spans between Club Octava and Andrés D.C. or across the avenue
        // =========================================================================
        if (segIndex % 3 === 1) {
            const billboardGroup = new THREE.Group();
            billboardGroup.position.set(0, 0, segLen * 0.5);

            // Heavy Steel Lattice Pylons (Left & Right Sidewalks: ±6.0)
            [-6.0, 6.0].forEach(px => {
                const pylonGeo = new THREE.BoxGeometry(0.55, 9.6, 0.55);
                const pylon = new THREE.Mesh(pylonGeo, metalMat);
                pylon.position.set(px, 4.8, 0);
                billboardGroup.add(pylon);

                // Diagonal lattice braces
                const strutGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.6, 6);
                const strut = new THREE.Mesh(strutGeo, metalMat);
                strut.position.set(px > 0 ? px + 0.9 : px - 0.9, 3.9, 0);
                strut.rotation.z = px > 0 ? -0.42 : 0.42;
                billboardGroup.add(strut);
            });

            // Top Horizontal Space-Frame Lattice Trusses
            const topTrussGeo = new THREE.BoxGeometry(13.2, 0.6, 0.6);
            const topTruss = new THREE.Mesh(topTrussGeo, metalMat);
            topTruss.position.set(0, 9.0, 0);
            billboardGroup.add(topTruss);

            const bottomTrussGeo = new THREE.BoxGeometry(13.2, 0.45, 0.45);
            const bottomTruss = new THREE.Mesh(bottomTrussGeo, metalMat);
            bottomTruss.position.set(0, 4.6, 0);
            billboardGroup.add(bottomTruss);

            // Monumental LED Display Screen Box
            const screenFrameGeo = new THREE.BoxGeometry(10.2, 4.4, 0.45);
            const screenFrameMat = new THREE.MeshStandardMaterial({ color: 0x05070d, metalness: 0.85, roughness: 0.2 });
            const screenFrame = new THREE.Mesh(screenFrameGeo, screenFrameMat);
            screenFrame.position.set(0, 6.8, 0);
            billboardGroup.add(screenFrame);

            // Front High-Res Digital Display Surface: BAUM FESTIVAL (Faces oncoming player: -Z)
            const screenTex = this.cyberpunkTextures.baum;
            const screenFaceGeo = new THREE.PlaneGeometry(9.8, 4.0);
            const screenFaceMat = new THREE.MeshBasicMaterial({
                map: screenTex,
                side: THREE.DoubleSide
            });
            const screenFace = new THREE.Mesh(screenFaceGeo, screenFaceMat);
            screenFace.position.set(0, 6.8, -0.25);
            screenFace.rotation.y = Math.PI; // Faces toward oncoming runner
            billboardGroup.add(screenFace);

            // Glowing Neon Bezel Trims (Top & Bottom of screen)
            [-2.05, 2.05].forEach(ny => {
                const trimGeo = new THREE.BoxGeometry(10.2, 0.1, 0.5);
                const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
                const trim = new THREE.Mesh(trimGeo, trimMat);
                trim.position.set(0, 6.8 + ny, 0);
                billboardGroup.add(trim);
            });

            // Downward PointLight illuminating the road & runner
            const bbLight = new THREE.PointLight(0x00e5ff, 2.8, 18);
            bbLight.position.set(0, 4.8, 0);
            billboardGroup.add(bbLight);

            segment.add(billboardGroup);
        }

        // 5. Atmospheric Overhead Sky Lasers
        if (segIndex % 2 === 0) {
            const laserMat = new THREE.LineBasicMaterial({
                color: (segIndex % 4 === 0) ? 0x00ffff : 0xff0088,
                transparent: true,
                opacity: 0.65
            });
            const points = [
                new THREE.Vector3(-14, 18, 0),
                new THREE.Vector3(14, 15, segLen)
            ];
            const laserGeo = new THREE.BufferGeometry().setFromPoints(points);
            const laser = new THREE.Line(laserGeo, laserMat);
            segment.add(laser);
        }

        this.scene.add(segment);
        this.groundSegments.push(segment);

        // Obstacles & Power-ups
        if (!isSafe) {
            const laneChoices = [-1, 0, 1];
            const obstacleLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
            const spawnZ = this.lastSpawnZ + (segLen * 0.5) + (Math.random() * 6 - 3);

            const obsRand = Math.random();
            let obsMesh, typeName;

            if (obsRand < 0.4) {
                // Low obstacle (jump): Sound Subwoofer
                const geo = new THREE.BoxGeometry(2.4, 0.9, 1.2);
                const mat = new THREE.MeshStandardMaterial({ color: 0xd92600, roughness: 0.4 });
                obsMesh = new THREE.Mesh(geo, mat);
                obsMesh.position.set(obstacleLane * this.laneDistance, 0.45, spawnZ);
                typeName = "low";
            } else if (obsRand < 0.75) {
                // High obstacle (slide): Club Laser Truss
                const geo = new THREE.BoxGeometry(2.6, 0.55, 0.8);
                const mat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
                obsMesh = new THREE.Mesh(geo, mat);
                obsMesh.position.set(obstacleLane * this.laneDistance, 2.35, spawnZ);
                typeName = "high";
            } else {
                // Block obstacle (dodge): Stage Speaker Wall
                const geo = new THREE.BoxGeometry(2.3, 3.2, 1.4);
                const mat = new THREE.MeshStandardMaterial({ color: 0x1f1f2e, metalness: 0.5 });
                obsMesh = new THREE.Mesh(geo, mat);
                obsMesh.position.set(obstacleLane * this.laneDistance, 1.6, spawnZ);
                typeName = "block";
            }

            this.scene.add(obsMesh);
            this.obstacles.push({ mesh: obsMesh, lane: obstacleLane, type: typeName, z: spawnZ });

            // Tokens in another lane
            const availableLanes = laneChoices.filter(l => l !== obstacleLane);
            const coinLane = availableLanes[0];
            for (let c = 0; c < 3; c++) {
                const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16);
                const coinMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, metalness: 0.8, roughness: 0.2 });
                const coinMesh = new THREE.Mesh(coinGeo, coinMat);
                coinMesh.rotation.x = Math.PI / 2;
                coinMesh.position.set(coinLane * this.laneDistance, 1.1, spawnZ - 4 + (c * 2.2));
                this.scene.add(coinMesh);
                this.collectibles.push({ mesh: coinMesh, collected: false });
            }

            // Occasional Power-Up (Shield, Magnet, Fever)
            if (availableLanes.length > 1 && Math.random() < 0.35) {
                const puLane = availableLanes[1];
                const puTypes = ["shield", "magnet", "fever"];
                const chosenType = puTypes[Math.floor(Math.random() * puTypes.length)];

                const puGeo = new THREE.OctahedronGeometry(0.65, 0);
                let puColor = 0x00ffcc;
                if (chosenType === "magnet") puColor = 0xff00bb;
                if (chosenType === "fever") puColor = 0xffaa00;

                const puMat = new THREE.MeshBasicMaterial({ color: puColor, wireframe: true });
                const puMesh = new THREE.Mesh(puGeo, puMat);
                puMesh.position.set(puLane * this.laneDistance, 1.4, spawnZ);
                this.scene.add(puMesh);
                this.powerUpItems.push({ mesh: puMesh, type: chosenType, collected: false });
            }
        }

        this.lastSpawnZ += segLen;
    }

    startRun() {
        document.body.classList.add("glitch-flash");
        setTimeout(() => {
            document.body.classList.remove("glitch-flash");
        }, 300);
        
        this.shakeTime = 0; // Initialize screen shake
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.speed = 24;
        this.currentLane = 0;
        this.targetLaneX = 0;
        this.verticalVelocity = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.hasShield = false;
        this.shieldMesh.visible = false;
        this.magnetTimer = 0;
        this.feverTimer = 0;
        this.audio.setFever(false);

        // Character Starting Special Ability
        if (this.selectedDJ && this.selectedDJ.id === "dj_tatan") {
            this.hasShield = true;
            this.shieldMesh.visible = true;
        }

        this.player.position.set(0, 0, 0);

        document.getElementById("screen-start").classList.add("hidden");
        document.getElementById("screen-gameover").classList.add("hidden");
        document.getElementById("screen-pause").classList.add("hidden");
        document.getElementById("hud").classList.remove("hidden");

        // Native promo banner
        const banner = document.getElementById("in-game-banner");
        banner.classList.remove("hidden");
        document.getElementById("banner-content").innerText = `${this.selectedDJ.promo.title} | ${this.selectedDJ.promo.discount} (Cód: ${this.selectedDJ.promo.code})`;

        this.resetWorld();
        this.applyDJTheme();
        this.audio.start(this.selectedDJ.bpm, this.selectedDJ.synthFreq);
    }

    togglePause() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;
        const pauseOverlay = document.getElementById("screen-pause");
        if (this.isPaused) {
            pauseOverlay.classList.remove("hidden");
            this.audio.stop();
        } else {
            pauseOverlay.classList.add("hidden");
            this.audio.start(this.selectedDJ.bpm, this.selectedDJ.synthFreq);
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.audio.stop();
        this.audio.playCrashSound();

        document.getElementById("hud").classList.add("hidden");
        document.getElementById("in-game-banner").classList.add("hidden");
        document.getElementById("screen-gameover").classList.remove("hidden");

        const finalScore = Math.floor(this.score);
        document.getElementById("final-score").innerText = finalScore;
        document.getElementById("final-distance").innerText = `${Math.floor(this.distance)}m`;

        // Update High Score
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem("zonat_highscore", this.highScore.toString());
            document.getElementById("high-score-val").innerText = this.highScore;
        }

        // Attribution reward
        document.getElementById("promo-offer-text").innerText = this.selectedDJ.promo.title;
        document.getElementById("promo-code-text").innerText = `Usa el código: ${this.selectedDJ.promo.code} (${this.selectedDJ.promo.discount})`;
    }

    update(dt) {
        if (!this.isPlaying) return;

        // Multipliers
        const multiplier = this.feverTimer > 0 ? 3 : 1;
        document.getElementById("hud-multiplier").innerText = `x${multiplier}`;

        // Timers
        if (this.feverTimer > 0) {
            this.feverTimer -= dt;
            if (this.feverTimer <= 0) {
                this.audio.setFever(false);
            }
        }
        if (this.magnetTimer > 0) {
            this.magnetTimer -= dt;
        }

        // Distance & Acceleration
        this.distance += this.speed * dt;
        this.score += this.speed * dt * 1.5 * multiplier;
        
        // Dynamic Difficulty: increase max speed as distance grows
        let calculatedMax = 52 + (this.distance / 1000);
        if (this.selectedDJ && this.selectedDJ.id === "dj_fresar" && this.feverTimer > 0) {
            calculatedMax *= 1.15; // 15% Overdrive Visor bonus!
        }
        this.maxSpeed = calculatedMax;

        if (this.speed < this.maxSpeed) {
            this.speed += 0.35 * dt; // Faster acceleration
        }

        // Live Speedometer Telemetry (EXXO Runner Style)
        const speedKmH = Math.round(this.speed * 3.6);
        const speedEl = document.getElementById("hud-speed");
        if (speedEl) {
            speedEl.innerHTML = `${speedKmH} <span style="font-size: 0.7rem; color: #8890a6;">KM/H</span>`;
        }

        // Forward motion
        this.player.position.z += this.speed * dt;

        // Rain loop follow player
        if (this.rainParticles) {
            this.rainParticles.position.z = this.player.position.z;
        }

        // Smooth Lane Swapping & Dynamic Lean (EXXO Runner banking physics)
        this.player.position.x = THREE.MathUtils.lerp(this.player.position.x, this.targetLaneX, 17 * dt);
        const laneOffset = this.targetLaneX - this.player.position.x;
        this.player.rotation.z = THREE.MathUtils.lerp(this.player.rotation.z, -laneOffset * 0.14, 14 * dt);

        // Jump Physics
        if (this.isJumping) {
            this.player.position.y += this.verticalVelocity * dt;
            this.verticalVelocity += this.gravity * dt;
            if (this.player.position.y <= 0) {
                this.player.position.y = 0;
                this.isJumping = false;
            }
        }

        // Slide Timer
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.playerMesh.scale.set(1, 1, 1);
                this.playerMesh.position.y = 1.35;
            }
        }

        // Running Stride Animation (Legs & Arms swinging)
        if (!this.isJumping && !this.isSliding) {
            this.runAnimTime += dt * this.speed * 0.7;
            const legAngle = Math.sin(this.runAnimTime) * 0.75;
            if (this.limbs.leftLeg) this.limbs.leftLeg.rotation.x = legAngle;
            if (this.limbs.rightLeg) this.limbs.rightLeg.rotation.x = -legAngle;
            if (this.limbs.leftArm) this.limbs.leftArm.rotation.x = -legAngle * 0.8;
            if (this.limbs.rightArm) this.limbs.rightArm.rotation.x = legAngle * 0.8;
        }

        // 🌧️ Bogotá Cyberpunk Rain animation
        if (this.rainParticles) {
            const pos = this.rainParticles.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] -= this.rainVelocities[i / 3] * dt;
                if (pos[i + 1] < 0) {
                    pos[i + 1] = 32;
                    pos[i + 2] = this.player.position.z + (Math.random() - 0.2) * 90;
                }
            }
            this.rainParticles.geometry.attributes.position.needsUpdate = true;
        } else if (this.isJumping) {
            if (this.limbs.leftLeg) this.limbs.leftLeg.rotation.x = 0.4;
            if (this.limbs.rightLeg) this.limbs.rightLeg.rotation.x = 0.4;
            if (this.limbs.leftArm) this.limbs.leftArm.rotation.x = -1.2;
            if (this.limbs.rightArm) this.limbs.rightArm.rotation.x = -1.2;
        }

        // 🐂🔥 DJ NUÑEZ: "EL TORO EN LLAMAS" 1-2-3-4 FLAMING STOMP COMPÁS
        if (this.selectedDJ.id === "dj_nunez" && this.flameLight) {
            const beatTime = this.runAnimTime * 2.2;
            const beatSub = beatTime % 1.0;
            const beatIndex = Math.floor(beatTime % 4) + 1; // 1, 2, 3, 4
            const flamePulse = (1.0 - beatSub) * 2.6 + 0.9;
            this.flameLight.intensity = flamePulse;
            if (beatIndex === 4) {
                this.flameLight.color.setHex(0xffcc00); // 4th beat explosion!
                if (beatSub < 0.25) {
                    this.obstacles.forEach(obs => {
                        if (obs.type === "low" && !obs.destroyed) {
                            const distZ = obs.mesh.position.z - this.player.position.z;
                            const distX = Math.abs(obs.mesh.position.x - this.player.position.x);
                            if (distZ > 0 && distZ < 7.0 && distX < 1.8) {
                                obs.destroyed = true;
                                obs.mesh.visible = false;
                                this.createExplosion(obs.mesh.position, 0xff7700);
                            }
                        }
                    });
                }
            } else {
                this.flameLight.color.setHex(0xff4400);
            }
        }

        // 💚 DJ TATÁN / CALVIN PARRA: OCTAVA PULSE LIGHTS
        if (this.selectedDJ.id === "dj_tatan" && this.tatanLight) {
            const beatPulse = (Math.sin(this.runAnimTime * 2.5) + 1.0) * 0.9 + 0.8;
            this.tatanLight.intensity = beatPulse;
        }

        // 🔴 DJ FRESAR: OVERDRIVE AUDIO SPECTRUM VISOR FLICKER
        if (this.selectedDJ.id === "dj_fresar" && this.fresarLight) {
            const visorFlicker = (Math.sin(this.runAnimTime * 4.5) + 1.0) * 1.1 + 1.0;
            this.fresarLight.intensity = visorFlicker;
        }

        // Animated Obstacles (Subwoofers pulse)
        this.obstacles.forEach(obs => {
            if (obs.type === "low") {
                const pulse = 1.0 + Math.sin(this.runAnimTime * 4.0) * 0.15;
                obs.mesh.scale.set(pulse, pulse, pulse);
            }
        });

        // Camera Follow & Dynamic Speed FOV Warp (Image 2 Perspective)
        // Un poco mas atras y picada hacia abajo: el corredor queda completo por encima
        // del banner de promo en vez de perder las piernas detras de el.
        // En vertical (telefono) la camara se aleja, sube y abre el angulo para que
        // sigan entrando los tres carriles en una pantalla angosta. k: 0 horizontal, 1 vertical.
        const k = this.portraitFactor();
        this.camera.position.z = this.player.position.z - (6.3 + 3.2 * k);
        this.camera.position.x = this.player.position.x * (0.38 + 0.22 * k);
        this.camera.position.y = 3.75 + 2.35 * k;

        // Screen Shake
        if (this.shakeTime > 0) {
            this.shakeTime -= dt;
            const amt = this.shakeTime * 1.5;
            this.camera.position.x += (Math.random() - 0.5) * amt;
            this.camera.position.y += (Math.random() - 0.5) * amt;
        }
        this.camera.lookAt(this.player.position.x * (0.2 + 0.3 * k), 0.4 + 0.5 * k, this.player.position.z + 22 - 6 * k);
        const targetFOV = 64 + 16 * k + (this.speed / this.maxSpeed) * (12 - 6 * k);
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 3.5 * dt);
        this.camera.updateProjectionMatrix();

        // Magnet attraction & Coin Rotation
        const pz = this.player.position.z;
        const px = this.player.position.x;

        this.collectibles.forEach(c => {
            if (!c.collected) {
                c.mesh.rotation.z += 4.5 * dt;

                // Magnet effect: attract coins
                let magnetRange = 0;
                if (this.magnetTimer > 0) {
                    magnetRange = (this.selectedDJ && this.selectedDJ.id === "dj_fresar" && this.feverTimer > 0) ? 22 : 14;
                } else if (this.selectedDJ && this.selectedDJ.id === "dj_letal") {
                    magnetRange = 8.5; // Passive permanent electromagnetic violin pull!
                }
                if (magnetRange > 0) {
                    const dist = c.mesh.position.distanceTo(this.player.position);
                    if (dist < magnetRange) {
                        c.mesh.position.lerp(this.player.position, 14 * dt);
                    }
                }
            }
        });

        // Rotate Power-up Items
        this.powerUpItems.forEach(p => {
            if (!p.collected) {
                p.mesh.rotation.y += 3.5 * dt;
                p.mesh.rotation.x += 2 * dt;
            }
        });

        // Shield pulse
        if (this.hasShield) {
            this.shieldMesh.rotation.y += 2 * dt;
        }

        // Check Collisions
        this.checkCollisions();

        // Spawn new segments
        if (this.player.position.z + 130 > this.lastSpawnZ) {
            this.spawnTrackSegment(false);
        }

        // Recycle past segments
        if (this.groundSegments.length > 0 && this.groundSegments[0].position.z + 35 < this.player.position.z) {
            const oldSeg = this.groundSegments.shift();
            this.scene.remove(oldSeg);
        }

        // HUD Update
        document.getElementById("hud-score").innerText = Math.floor(this.score);
        document.getElementById("hud-coins").innerText = this.coins;
    }

    checkCollisions() {
        const pz = this.player.position.z;
        const px = this.player.position.x;
        const py = this.player.position.y;

        // Check Coins
        for (let i = 0; i < this.collectibles.length; i++) {
            const c = this.collectibles[i];
            if (!c.collected && Math.abs(c.mesh.position.z - pz) < 1.3 && Math.abs(c.mesh.position.x - px) < 1.3) {
                c.collected = true;
                this.scene.remove(c.mesh);
                this.coins += 1;
                this.score += 60;
                this.audio.playCoinSound();
            }
        }

        // Check Power-Ups
        for (let i = 0; i < this.powerUpItems.length; i++) {
            const p = this.powerUpItems[i];
            if (!p.collected && Math.abs(p.mesh.position.z - pz) < 1.4 && Math.abs(p.mesh.position.x - px) < 1.4) {
                p.collected = true;
                this.scene.remove(p.mesh);
                this.audio.playPowerUpSound();

                if (p.type === "shield") {
                    this.hasShield = true;
                    this.shieldMesh.visible = true;
                } else if (p.type === "magnet") {
                    this.magnetTimer = 10.0;
                } else if (p.type === "fever") {
                    this.feverTimer = 8.0;
                    this.audio.setFever(true);
                }
            }
        }

        // Check Obstacles
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            const dz = Math.abs(obs.mesh.position.z - pz);
            const dx = Math.abs(obs.mesh.position.x - px);

            if (dz < 1.1 && dx < 1.2) {
                // Successful dodge via jump/slide
                if (obs.type === "low" && py > 1.2) continue;
                if (obs.type === "high" && this.isSliding) continue;

                // Fever mode breaks obstacles automatically
                if (this.feverTimer > 0) {
                    this.scene.remove(obs.mesh);
                    this.obstacles.splice(i, 1);
                    this.audio.playShieldBreakSound();
                    this.score += 200;
                    return;
                }

                // Shield absorbs 1 hit
                if (this.hasShield) {
                    this.hasShield = false;
                    this.shieldMesh.visible = false;
                    this.scene.remove(obs.mesh);
                    this.obstacles.splice(i, 1);
                    this.audio.playShieldBreakSound();
                    this.shakeTime = 0.4;
                    return;
                }

                // Crash & Game Over
                this.shakeTime = 0.8;
                this.gameOver();
                return;
            }
        }
    }

    // 0 en pantallas horizontales, sube hasta 1 cuando la pantalla es vertical (telefono).
    portraitFactor() {
        const aspect = window.innerWidth / window.innerHeight;
        return aspect >= 1 ? 0 : Math.min(1, (1 - aspect) / 0.45);
    }

    // Input handlers
    // La camara mira hacia +Z, asi que +X del mundo queda a la IZQUIERDA de la
    // pantalla: el carril +1 es el izquierdo. (Antes estaba al reves y la flecha o
    // el gesto hacia la derecha movian al corredor hacia la izquierda.)
    moveLeft() {
        if (this.currentLane < 1) {
            this.currentLane++;
            this.targetLaneX = this.currentLane * this.laneDistance;
        }
    }

    moveRight() {
        if (this.currentLane > -1) {
            this.currentLane--;
            this.targetLaneX = this.currentLane * this.laneDistance;
        }
    }

    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.verticalVelocity = this.jumpForce;
        }
    }

    slide() {
        if (!this.isSliding) {
            this.isSliding = true;
            this.slideTimer = 0.65;
            this.playerMesh.scale.set(1, 0.45, 1);
            this.playerMesh.position.y = 0.55;
            if (this.isJumping) {
                this.verticalVelocity = -this.jumpForce * 1.6;
            }
        }
    }

    /**
     * Gamepad (PC / mando). Se sondea cada frame porque la Gamepad API no emite eventos
     * de botones. Guarda el estado previo para disparar solo en el flanco de subida.
     */
    pollGamepad() {
        if (!navigator.getGamepads) return;
        const pads = navigator.getGamepads();
        let pad = null;
        for (const p of pads) { if (p && p.connected) { pad = p; break; } }
        if (!pad) { this.gamepadPrev = null; return; }

        const AXIS_DEAD = 0.55;
        const lx = pad.axes[0] || 0;
        const ly = pad.axes[1] || 0;
        const btn = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);

        const now = {
            left:  btn(14) || lx < -AXIS_DEAD,
            right: btn(15) || lx > AXIS_DEAD,
            up:    btn(12) || btn(0) || ly < -AXIS_DEAD,   // D-pad arriba, A/Cross, stick arriba
            down:  btn(13) || btn(1) || ly > AXIS_DEAD,    // D-pad abajo, B/Circle, stick abajo
            pause: btn(9) || btn(8)                        // Start / Select
        };
        const prev = this.gamepadPrev || { left: false, right: false, up: false, down: false, pause: false };
        const pressed = (key) => now[key] && !prev[key];

        if (pressed("pause")) this.togglePause();
        if (!this.isPlaying) {
            if (pressed("up")) {
                const b = document.getElementById("btn-restart");
                const restartVisible = b && !b.closest(".hidden");
                (restartVisible ? b : document.getElementById("btn-start-run")).click();
            }
        } else if (!this.isPaused) {
            if (pressed("left")) this.moveLeft();
            if (pressed("right")) this.moveRight();
            if (pressed("up")) this.jump();
            if (pressed("down")) this.slide();
        }
        this.gamepadPrev = now;
    }

    bindEvents() {
        window.addEventListener("gamepadconnected", (e) => {
            console.log("[ZonaT] Mando conectado:", e.gamepad.id);
        });

        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Teclado (PC) — ver docs/PLATAFORMAS_Y_CONTROLES.md
        const SCROLL_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
        window.addEventListener("keydown", (e) => {
            if (e.repeat) return;
            // El navegador hace scroll con flechas y espacio: se bloquea para no mover la pagina.
            if (SCROLL_KEYS.includes(e.key)) e.preventDefault();

            const k = e.key.toLowerCase();

            if (e.key === "Escape" || k === "p") {
                this.togglePause();
                return;
            }

            // Fuera de partida: Enter/Espacio arranca, R reinicia.
            if (!this.isPlaying) {
                if (e.key === "Enter" || e.key === " " || k === "r") {
                    const btn = document.getElementById("btn-restart");
                    const restartVisible = btn && !btn.closest(".hidden");
                    (restartVisible ? btn : document.getElementById("btn-start-run")).click();
                }
                return;
            }
            if (this.isPaused) return;

            if (e.key === "ArrowLeft" || k === "a") this.moveLeft();
            else if (e.key === "ArrowRight" || k === "d") this.moveRight();
            else if (e.key === "ArrowUp" || k === "w" || e.key === " ") this.jump();
            else if (e.key === "ArrowDown" || k === "s") this.slide();
        }, { passive: false });

        // Touch Gestures
        window.addEventListener("touchstart", (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener("touchend", (e) => {
            if (!this.isPlaying || this.isPaused) return;
            const deltaX = e.changedTouches[0].clientX - this.touchStartX;
            const deltaY = e.changedTouches[0].clientY - this.touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 25) this.moveRight();
                else if (deltaX < -25) this.moveLeft();
            } else {
                if (deltaY < -25) this.jump();
                else if (deltaY > 25) this.slide();
            }
        }, { passive: true });
    }
}

// Start Game
window.addEventListener("DOMContentLoaded", async () => {
    try {
        DJS = await loadRoster();
    } catch (err) {
        console.error("[ZonaT] Error cargando el roster:", err);
        document.body.insertAdjacentHTML("afterbegin",
            '<div style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;' +
            'justify-content:center;background:#08040f;color:#ff0055;font-family:system-ui,sans-serif;' +
            'text-align:center;padding:2rem;line-height:1.6">' +
            '<div><h2>No se pudo cargar el roster de DJs</h2>' +
            '<p style="color:#9aa">Se esperaba <code>/data/djs/roster.json</code>.<br>' +
            'Arranca el juego con <code>node server.js</code> desde la raiz del repo.</p></div></div>');
        return;
    }
    window.ZONAT_GAME = new ZonaTRunnerGame();
});
