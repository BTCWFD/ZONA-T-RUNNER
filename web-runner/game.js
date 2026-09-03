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

// --- 1. DATA-DRIVEN CONFIGURATION: 5 BOGOTÁ DJs ---
const DJS = [
    {
        id: "dj_fresar",
        name: "FRESAR",
        genre: "Industrial Techno",
        bpm: 138,
        color: "#ff0055",
        colorHex: 0xff0055,
        worldColor: 0x07040d,
        groundColor: 0x120a1b,
        neonColor: 0xff0055,
        synthFreq: 55, // A1
        promo: {
            title: "FRESAR — Residencia Viernes (Club Octava)",
            code: "FRESAR15",
            discount: "15% OFF Cover Viernes",
            venue: "Club Octava - Chapinero"
        }
    },
    {
        id: "dj_noctua",
        name: "NOCTUA",
        genre: "Melodic & Prog",
        bpm: 124,
        color: "#00ffff",
        colorHex: 0x00ffff,
        worldColor: 0x030d17,
        groundColor: 0x071b2d,
        neonColor: 0x00d9ff,
        synthFreq: 65.4, // C2
        promo: {
            title: "NOCTUA — Sunrise Session (Terraza Chapinero)",
            code: "NOCTUA2X1",
            discount: "2x1 en Entradas Early Bird",
            venue: "Terraza 85 - Calle 85"
        }
    },
    {
        id: "dj_camilo",
        name: "CAMILO B2B",
        genre: "Hardgroove",
        bpm: 142,
        color: "#ffaa00",
        colorHex: 0xffaa00,
        worldColor: 0x120c03,
        groundColor: 0x221706,
        neonColor: 0xffbb00,
        synthFreq: 73.4, // D2
        promo: {
            title: "BOGOTÁ HARDGROOVE VOL. 3",
            code: "GROOVE20",
            discount: "20% OFF Merchandising Oficial",
            venue: "Radio Estrella - Calle 64"
        }
    },
    {
        id: "dj_valeria",
        name: "VALERIA NEON",
        genre: "Acid & Minimal",
        bpm: 132,
        color: "#00ff66",
        colorHex: 0x00ff66,
        worldColor: 0x031206,
        groundColor: 0x08240d,
        neonColor: 0x39ff14,
        synthFreq: 49, // G1
        promo: {
            title: "VALERIA — Acid Night (Zona Rosa)",
            code: "ACIDNIGHT",
            discount: "Coctel de bienvenida gratis",
            venue: "Kaputt Club - Calle 72"
        }
    },
    {
        id: "dj_bogota_allstars",
        name: "ZONA T COLECTIVO",
        genre: "Underground House",
        bpm: 128,
        color: "#b000ff",
        colorHex: 0xb000ff,
        worldColor: 0x0d0317,
        groundColor: 0x1f0730,
        neonColor: 0xd400ff,
        synthFreq: 58.27, // A#1
        promo: {
            title: "FESTIVAL ZONA T 2026 — Preventa Exclusiva",
            code: "FESTZONAT",
            discount: "Pase VIP con 25% descuento",
            venue: "Chamorro City Hall - Autonorte"
        }
    }
];

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

        // Procedural Elements
        this.groundSegments = [];
        this.obstacles = [];
        this.collectibles = [];
        this.powerUpItems = [];
        this.rainParticles = null;
        this.billboards = [];
        this.lastSpawnZ = -10;

        // Input
        this.touchStartX = 0;
        this.touchStartY = 0;

        this.initDOM();
        this.initThree();
        this.initRain();
        this.bindEvents();
    }

    initDOM() {
        const djListEl = document.getElementById("dj-list");
        djListEl.innerHTML = "";

        DJS.forEach((dj, idx) => {
            const card = document.createElement("div");
            card.className = `dj-card ${idx === 0 ? "selected" : ""}`;
            card.dataset.id = dj.id;
            card.innerHTML = `
                <div class="dj-avatar" style="background: ${dj.color}22; color: ${dj.color}; border-color: ${dj.color}">
                    🎧
                </div>
                <div class="dj-name">${dj.name}</div>
                <div class="dj-genre">${dj.genre}</div>
                <div class="dj-bpm">${dj.bpm} BPM</div>
            `;
            card.addEventListener("click", () => this.selectDJ(dj, card));
            djListEl.appendChild(card);
        });

        document.getElementById("high-score-val").innerText = this.highScore;
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
        this.applyDJTheme();
    }

    applyDJTheme() {
        if (!this.scene) return;
        this.scene.background = new THREE.Color(this.selectedDJ.worldColor);
        this.scene.fog = new THREE.FogExp2(this.selectedDJ.worldColor, 0.014);

        if (this.playerMesh) {
            this.playerMesh.material.color.set(this.selectedDJ.color);
        }
    }

    initThree() {
        const canvas = document.getElementById("game-canvas");
        this.scene = new THREE.Scene();
        this.applyDJTheme();

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 220);
        this.camera.position.set(0, 4.6, -6.5);
        this.camera.lookAt(0, 2.1, 9);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(6, 18, 12);
        this.scene.add(dirLight);

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
            if (!this.isPaused) {
                this.update(dt);
            }
            this.renderer.render(this.scene, this.camera);
        };
        requestAnimationFrame(animate);
    }

    buildPlayerCharacter() {
        this.player = new THREE.Group();

        // Torso
        const torsoGeo = new THREE.BoxGeometry(0.9, 1.1, 0.5);
        const torsoMat = new THREE.MeshStandardMaterial({
            color: this.selectedDJ.color,
            roughness: 0.3,
            metalness: 0.5
        });
        this.playerMesh = new THREE.Mesh(torsoGeo, torsoMat);
        this.playerMesh.position.y = 1.35;
        this.player.add(this.playerMesh);

        // Head
        const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.8 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 0.95, 0);
        this.playerMesh.add(head);

        // DJ Headphones (Cup left & right + band)
        const cupGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
        const cupMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const leftCup = new THREE.Mesh(cupGeo, cupMat);
        leftCup.rotation.z = Math.PI / 2;
        leftCup.position.set(-0.32, 0, 0);
        head.add(leftCup);

        const rightCup = new THREE.Mesh(cupGeo, cupMat);
        rightCup.rotation.z = Math.PI / 2;
        rightCup.position.set(0.32, 0, 0);
        head.add(rightCup);

        // Visor
        const visorGeo = new THREE.BoxGeometry(0.48, 0.18, 0.15);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 0.05, 0.28);
        head.add(visor);

        // Limbs for running animation
        const limbMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.5 });

        // Left Leg
        const legGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const leftLeg = new THREE.Mesh(legGeo, limbMat);
        leftLeg.position.set(-0.25, 0.4, 0);
        this.player.add(leftLeg);
        this.limbs.leftLeg = leftLeg;

        // Right Leg
        const rightLeg = new THREE.Mesh(legGeo, limbMat);
        rightLeg.position.set(0.25, 0.4, 0);
        this.player.add(rightLeg);
        this.limbs.rightLeg = rightLeg;

        // Left Arm
        const armGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
        const leftArm = new THREE.Mesh(armGeo, limbMat);
        leftArm.position.set(-0.62, 1.35, 0);
        this.player.add(leftArm);
        this.limbs.leftArm = leftArm;

        // Right Arm
        const rightArm = new THREE.Mesh(armGeo, limbMat);
        rightArm.position.set(0.62, 1.35, 0);
        this.player.add(rightArm);
        this.limbs.rightArm = rightArm;

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
        // Neon rain atmosphere in Bogotá
        const rainCount = 1200;
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(rainCount * 3);

        for (let i = 0; i < rainCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 35;
            positions[i + 1] = Math.random() * 30;
            positions[i + 2] = (Math.random() - 0.5) * 80;
        }

        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const rainMat = new THREE.PointsMaterial({
            color: 0x4488cc,
            size: 0.15,
            transparent: true,
            opacity: 0.4
        });
        this.rainParticles = new THREE.Points(rainGeo, rainMat);
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
        this.lastSpawnZ = -10;

        for (let i = 0; i < 11; i++) {
            this.spawnTrackSegment(i < 3);
        }
    }

    spawnTrackSegment(isSafe) {
        const segLen = 28;
        const segment = new THREE.Group();
        segment.position.z = this.lastSpawnZ;

        // Asphalt Track
        const roadGeo = new THREE.PlaneGeometry(12, segLen);
        const roadMat = new THREE.MeshStandardMaterial({
            color: this.selectedDJ.groundColor,
            roughness: 0.75,
            metalness: 0.2
        });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.z = segLen / 2;
        segment.add(road);

        // Neon Lane Dividers
        [-this.laneDistance / 2, this.laneDistance / 2].forEach(x => {
            const lineGeo = new THREE.PlaneGeometry(0.18, segLen);
            const lineMat = new THREE.MeshBasicMaterial({ color: this.selectedDJ.neonColor });
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.02, segLen / 2);
            segment.add(line);
        });

        // Lateral club facade / buildings with windows
        [-7.2, 7.2].forEach(x => {
            const wallGeo = new THREE.BoxGeometry(1.8, 7.5, segLen);
            const wallMat = new THREE.MeshStandardMaterial({ color: 0x06060c, roughness: 0.95 });
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(x, 3.75, segLen / 2);
            segment.add(wall);

            // Architectural glowing strip
            const stripGeo = new THREE.BoxGeometry(0.25, 0.25, segLen);
            const stripMat = new THREE.MeshBasicMaterial({ color: this.selectedDJ.neonColor });
            const strip = new THREE.Mesh(stripGeo, stripMat);
            strip.position.set(x > 0 ? x - 0.9 : x + 0.9, 6.2, segLen / 2);
            segment.add(strip);
        });

        // Floating Event Billboards (Native advertising)
        if (!isSafe && Math.random() > 0.6) {
            const billboardGeo = new THREE.BoxGeometry(8, 2.4, 0.4);
            const billboardMat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? this.selectedDJ.neonColor : 0x00ffff
            });
            const billboard = new THREE.Mesh(billboardGeo, billboardMat);
            billboard.position.set(0, 6.2, segLen * 0.5);
            segment.add(billboard);
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
        if (this.speed < this.maxSpeed) {
            this.speed += 0.28 * dt;
        }

        // Forward motion
        this.player.position.z += this.speed * dt;

        // Rain loop follow player
        if (this.rainParticles) {
            this.rainParticles.position.z = this.player.position.z;
        }

        // Smooth Lane Swapping
        this.player.position.x = THREE.MathUtils.lerp(this.player.position.x, this.targetLaneX, 17 * dt);

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
            this.limbs.leftLeg.rotation.x = legAngle;
            this.limbs.rightLeg.rotation.x = -legAngle;
            this.limbs.leftArm.rotation.x = -legAngle * 0.8;
            this.limbs.rightArm.rotation.x = legAngle * 0.8;
        } else if (this.isJumping) {
            this.limbs.leftLeg.rotation.x = 0.4;
            this.limbs.rightLeg.rotation.x = 0.4;
            this.limbs.leftArm.rotation.x = -1.2;
            this.limbs.rightArm.rotation.x = -1.2;
        }

        // Camera Follow
        this.camera.position.z = this.player.position.z - 6.8;
        this.camera.position.x = this.player.position.x * 0.42;

        // Magnet attraction & Coin Rotation
        const pz = this.player.position.z;
        const px = this.player.position.x;

        this.collectibles.forEach(c => {
            if (!c.collected) {
                c.mesh.rotation.z += 4.5 * dt;

                // Magnet effect: attract coins within 14 units
                if (this.magnetTimer > 0) {
                    const dist = c.mesh.position.distanceTo(this.player.position);
                    if (dist < 14) {
                        c.mesh.position.lerp(this.player.position, 12 * dt);
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
                    return;
                }

                // Crash & Game Over
                this.gameOver();
                return;
            }
        }
    }

    // Input handlers
    moveLeft() {
        if (this.currentLane > -1) {
            this.currentLane--;
            this.targetLaneX = this.currentLane * this.laneDistance;
        }
    }

    moveRight() {
        if (this.currentLane < 1) {
            this.currentLane++;
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

    bindEvents() {
        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Keyboard Controls
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" || e.key === "p" || e.key === "P") {
                this.togglePause();
                return;
            }
            if (!this.isPlaying || this.isPaused) return;

            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.moveLeft();
            else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.moveRight();
            else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") this.jump();
            else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") this.slide();
        });

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
window.addEventListener("DOMContentLoaded", () => {
    new ZonaTRunnerGame();
});
