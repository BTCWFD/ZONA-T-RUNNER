/**
 * ZONA T RUNNER — Core 3D Endless Runner Engine (Three.js)
 * Implements: 3 lanes, jump, slide, procedural track, 5 Bogotá DJs,
 * beat-synced synthesizer audio, obstacles, collectible tokens, and native ads.
 */

// --- 1. DATA-DRIVEN CONFIGURATION: 5 BOGOTÁ DJs ---
const DJS = [
    {
        id: "dj_fresar",
        name: "FRESAR",
        genre: "Industrial Techno",
        bpm: 138,
        color: "#ff0055",
        worldColor: 0x0a0510,
        groundColor: 0x180d24,
        neonColor: 0xff0055,
        synthFreq: 55, // Deep techno bass note A1
        promo: {
            title: "FRESAR — Residencia Viernes (Club Octava)",
            code: "FRESAR15",
            discount: "15% OFF Cover Viernes"
        }
    },
    {
        id: "dj_noctua",
        name: "NOCTUA",
        genre: "Melodic & Prog",
        bpm: 124,
        color: "#00ffff",
        worldColor: 0x051220,
        groundColor: 0x09223a,
        neonColor: 0x00d9ff,
        synthFreq: 65.4, // C2
        promo: {
            title: "NOCTUA — Sunrise Session (Terraza Chapinero)",
            code: "NOCTUA2X1",
            discount: "2x1 en Entradas Early Bird"
        }
    },
    {
        id: "dj_camilo",
        name: "CAMILO B2B",
        genre: "Hardgroove",
        bpm: 142,
        color: "#ffcc00",
        worldColor: 0x141005,
        groundColor: 0x2e2308,
        neonColor: 0xffaa00,
        synthFreq: 73.4, // D2
        promo: {
            title: "BOGOTÁ HARDGROOVE VOL. 3",
            code: "GROOVE20",
            discount: "20% OFF Merchandising Oficial"
        }
    },
    {
        id: "dj_valeria",
        name: "VALERIA NEON",
        genre: "Acid & Minimal",
        bpm: 132,
        color: "#00ff66",
        worldColor: 0x051408,
        groundColor: 0x0b2910,
        neonColor: 0x39ff14,
        synthFreq: 49, // G1
        promo: {
            title: "VALERIA — Acid Night (Zona Rosa)",
            code: "ACIDNIGHT",
            discount: "Coctel de bienvenida gratis"
        }
    },
    {
        id: "dj_bogota_allstars",
        name: "ZONA T COLECTIVO",
        genre: "Underground House",
        bpm: 128,
        color: "#b000ff",
        worldColor: 0x100518,
        groundColor: 0x240938,
        neonColor: 0xd400ff,
        synthFreq: 58.27, // A#1
        promo: {
            title: "FESTIVAL ZONA T 2026 — Preventa Exclusiva",
            code: "FESTZONAT",
            discount: "Pase VIP con 25% descuento"
        }
    }
];

// --- 2. AUDIO SYNTHESIZER (PROCEDURAL TECHNO BEAT) ---
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.bpm = 130;
        this.step = 0;
        this.timer = null;
        this.synthFreq = 55;
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

    tick() {
        if (!this.isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;

        // Kick drum on every 4th 16th note (quarters)
        if (this.step % 4 === 0) {
            this.playKick(now);
        }

        // Off-beat Hi-hat on 2nd and 4th 16th note
        if (this.step % 4 === 2) {
            this.playHiHat(now);
        }

        // Rolling bass synth on every 16th note with filter
        this.playBass(now, this.step);

        this.step = (this.step + 1) % 16;
    }

    playKick(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);
        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    playHiHat(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "highpass" in osc ? "sine" : "triangle";
        osc.frequency.setValueAtTime(8000, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
    }

    playBass(t, step) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "sawtooth";
        const note = step % 8 === 0 ? this.synthFreq : this.synthFreq * 1.5;
        osc.frequency.setValueAtTime(note, t);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(350, t);
        filter.frequency.exponentialRampToValueAtTime(80, t + 0.08);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.09);
    }

    playCoinSound() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.setValueAtTime(1318.51, t + 0.06); // E6
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
    }

    playCrashSound() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
    }
}

// --- 3. MAIN GAME STATE & ENGINE ---
class ZonaTRunnerGame {
    constructor() {
        this.selectedDJ = DJS[0];
        this.audio = new AudioEngine();

        // Gameplay state
        this.isPlaying = false;
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.speed = 22; // units per second
        this.maxSpeed = 48;
        this.currentLane = 0; // -1, 0, 1
        this.targetLaneX = 0;
        this.laneDistance = 3.2;

        // Jump & Slide
        this.isJumping = false;
        this.isSliding = false;
        this.verticalVelocity = 0;
        this.gravity = -45;
        this.jumpForce = 15;
        this.slideTimer = 0;

        // Three.js variables
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.playerMesh = null;
        this.groundSegments = [];
        this.obstacles = [];
        this.collectibles = [];
        this.billboards = [];
        this.lastSpawnZ = 0;

        // Touch tracking
        this.touchStartX = 0;
        this.touchStartY = 0;

        this.initDOM();
        this.initThree();
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

        document.getElementById("btn-start-run").addEventListener("click", () => this.startRun());
        document.getElementById("btn-restart").addEventListener("click", () => this.startRun());
        document.getElementById("btn-change-dj").addEventListener("click", () => {
            document.getElementById("screen-gameover").classList.add("hidden");
            document.getElementById("screen-start").classList.remove("hidden");
        });
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
        this.scene.fog = new THREE.FogExp2(this.selectedDJ.worldColor, 0.015);

        // Update player color
        if (this.playerMesh) {
            this.playerMesh.material.color.set(this.selectedDJ.color);
        }
    }

    initThree() {
        const canvas = document.getElementById("game-canvas");
        this.scene = new THREE.Scene();
        this.applyDJTheme();

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 4.5, -6.5);
        this.camera.lookAt(0, 2, 8);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Ambient and Directional Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 15, 10);
        this.scene.add(dirLight);

        // Player Avatar (Stylized Runner)
        this.player = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(1.2, 1.8, 1);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: this.selectedDJ.color,
            roughness: 0.3,
            metalness: 0.6
        });
        this.playerMesh = new THREE.Mesh(bodyGeo, bodyMat);
        this.playerMesh.position.y = 0.9;
        this.player.add(this.playerMesh);

        // Glowing visor (Bogotá cyber club aesthetic)
        const visorGeo = new THREE.BoxGeometry(0.9, 0.3, 0.2);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.4, 0.5);
        this.player.add(visor);

        this.scene.add(this.player);

        // Spawn initial road
        this.resetWorld();

        // Animation Loop
        let lastTime = performance.now();
        const animate = (now) => {
            requestAnimationFrame(animate);
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;
            this.update(dt);
            this.renderer.render(this.scene, this.camera);
        };
        requestAnimationFrame(animate);
    }

    resetWorld() {
        // Clear previous entities
        this.groundSegments.forEach(s => this.scene.remove(s));
        this.obstacles.forEach(o => this.scene.remove(o.mesh));
        this.collectibles.forEach(c => this.scene.remove(c.mesh));
        this.billboards.forEach(b => this.scene.remove(b));

        this.groundSegments = [];
        this.obstacles = [];
        this.collectibles = [];
        this.billboards = [];
        this.lastSpawnZ = -10;

        // Build 12 road segments forward
        for (let i = 0; i < 10; i++) {
            this.spawnTrackSegment(i < 3); // safe zone at beginning
        }
    }

    spawnTrackSegment(isSafe) {
        const segLen = 25;
        const segment = new THREE.Group();
        segment.position.z = this.lastSpawnZ;

        // Road Surface (3 Lanes)
        const roadGeo = new THREE.PlaneGeometry(11, segLen);
        const roadMat = new THREE.MeshStandardMaterial({
            color: this.selectedDJ.groundColor,
            roughness: 0.8
        });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.z = segLen / 2;
        segment.add(road);

        // Neon Lane Dividers
        [-this.laneDistance / 2, this.laneDistance / 2].forEach(x => {
            const lineGeo = new THREE.PlaneGeometry(0.15, segLen);
            const lineMat = new THREE.MeshBasicMaterial({ color: this.selectedDJ.neonColor });
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.02, segLen / 2);
            segment.add(line);
        });

        // Bogotá Urban Backdrop: club walls and neon lights
        [-6.5, 6.5].forEach(x => {
            const wallGeo = new THREE.BoxGeometry(1.5, 6, segLen);
            const wallMat = new THREE.MeshStandardMaterial({ color: 0x080811, roughness: 0.9 });
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(x, 3, segLen / 2);
            segment.add(wall);

            // Emissive neon signs
            if (Math.random() > 0.4) {
                const signGeo = new THREE.BoxGeometry(0.2, 1.2, 4);
                const signMat = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? this.selectedDJ.neonColor : 0x00ffff
                });
                const sign = new THREE.Mesh(signGeo, signMat);
                sign.position.set(x > 0 ? x - 0.7 : x + 0.7, 3.5, segLen / 2);
                segment.add(sign);
            }
        });

        this.scene.add(segment);
        this.groundSegments.push(segment);

        // Spawn Obstacles and Collectibles if not safe
        if (!isSafe) {
            const laneChoices = [-1, 0, 1];
            const obstacleLane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
            const spawnZ = this.lastSpawnZ + (segLen * 0.5) + (Math.random() * 6 - 3);

            // Obstacle types: low (must jump), high barrier (must slide), or speaker stack
            const obsType = Math.random();
            let obsMesh, typeName;

            if (obsType < 0.4) {
                // Low obstacle (jump over) - Subwoofer / Cable trunk
                const geo = new THREE.BoxGeometry(2.4, 0.8, 1);
                const mat = new THREE.MeshStandardMaterial({ color: 0xff2200, roughness: 0.4 });
                obsMesh = new THREE.Mesh(geo, mat);
                obsMesh.position.set(obstacleLane * this.laneDistance, 0.4, spawnZ);
                typeName = "low";
            } else if (obsType < 0.75) {
                // High obstacle (slide under) - Laser beam / Club Truss
                const geo = new THREE.BoxGeometry(2.6, 0.5, 0.8);
                const mat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
                obsMesh = new THREE.Mesh(geo, mat);
                obsMesh.position.set(obstacleLane * this.laneDistance, 2.3, spawnZ);
                typeName = "high";
            } else {
                // Full obstacle (must dodge left/right) - Speaker stack
                const geo = new THREE.BoxGeometry(2.2, 3, 1.2);
                const mat = new THREE.MeshStandardMaterial({ color: 0x222222 });
                obsMesh = new THREE.Mesh(geo, mat);
                obsMesh.position.set(obstacleLane * this.laneDistance, 1.5, spawnZ);
                typeName = "block";
            }

            this.scene.add(obsMesh);
            this.obstacles.push({ mesh: obsMesh, lane: obstacleLane, type: typeName, z: spawnZ });

            // Collectible Tokens on another lane
            const coinLane = laneChoices.find(l => l !== obstacleLane) || 0;
            for (let c = 0; c < 3; c++) {
                const coinGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
                const coinMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
                const coinMesh = new THREE.Mesh(coinGeo, coinMat);
                coinMesh.rotation.x = Math.PI / 2;
                coinMesh.position.set(coinLane * this.laneDistance, 1.1, spawnZ - 3 + (c * 2));
                this.scene.add(coinMesh);
                this.collectibles.push({ mesh: coinMesh, collected: false });
            }
        }

        this.lastSpawnZ += segLen;
    }

    startRun() {
        this.isPlaying = true;
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.speed = 22;
        this.currentLane = 0;
        this.targetLaneX = 0;
        this.player.position.set(0, 0, 0);
        this.verticalVelocity = 0;
        this.isJumping = false;
        this.isSliding = false;

        document.getElementById("screen-start").classList.add("hidden");
        document.getElementById("screen-gameover").classList.add("hidden");
        document.getElementById("hud").classList.remove("hidden");

        // Display current DJ's native ad in-game
        const banner = document.getElementById("in-game-banner");
        banner.classList.remove("hidden");
        document.getElementById("banner-content").innerText = `${this.selectedDJ.promo.title} | ${this.selectedDJ.promo.discount} | Cód: ${this.selectedDJ.promo.code}`;

        this.resetWorld();
        this.applyDJTheme();
        this.audio.start(this.selectedDJ.bpm, this.selectedDJ.synthFreq);
    }

    gameOver() {
        this.isPlaying = false;
        this.audio.stop();
        this.audio.playCrashSound();

        document.getElementById("hud").classList.add("hidden");
        document.getElementById("in-game-banner").classList.add("hidden");
        document.getElementById("screen-gameover").classList.remove("hidden");

        document.getElementById("final-score").innerText = Math.floor(this.score);
        document.getElementById("final-distance").innerText = `${Math.floor(this.distance)}m`;

        // Native promotion reward attribution
        document.getElementById("promo-offer-text").innerText = this.selectedDJ.promo.title;
        document.getElementById("promo-code-text").innerText = `Usa el código: ${this.selectedDJ.promo.code} (${this.selectedDJ.promo.discount})`;
    }

    update(dt) {
        if (!this.isPlaying) return;

        // Progress distance and score
        this.distance += this.speed * dt;
        this.score += this.speed * dt * 1.5;
        if (this.speed < this.maxSpeed) {
            this.speed += 0.25 * dt; // progressive acceleration
        }

        // Move player forward
        this.player.position.z += this.speed * dt;

        // Smooth horizontal lane transition
        this.player.position.x = THREE.MathUtils.lerp(this.player.position.x, this.targetLaneX, 16 * dt);

        // Jump Physics
        if (this.isJumping) {
            this.player.position.y += this.verticalVelocity * dt;
            this.verticalVelocity += this.gravity * dt;
            if (this.player.position.y <= 0) {
                this.player.position.y = 0;
                this.isJumping = false;
            }
        }

        // Slide timer
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.playerMesh.scale.set(1, 1, 1);
                this.playerMesh.position.y = 0.9;
            }
        }

        // Camera follow (3rd person)
        this.camera.position.z = this.player.position.z - 6.5;
        this.camera.position.x = this.player.position.x * 0.4;

        // Rotate collectible coins
        this.collectibles.forEach(c => {
            if (!c.collected) {
                c.mesh.rotation.z += 4 * dt;
            }
        });

        // Check Collisions
        this.checkCollisions();

        // Spawn new track segments and cleanup behind
        if (this.player.position.z + 120 > this.lastSpawnZ) {
            this.spawnTrackSegment(false);
        }

        // Recycle passed segments
        if (this.groundSegments.length > 0 && this.groundSegments[0].position.z + 35 < this.player.position.z) {
            const oldSeg = this.groundSegments.shift();
            this.scene.remove(oldSeg);
        }

        // Update HUD
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
            if (!c.collected && Math.abs(c.mesh.position.z - pz) < 1.2 && Math.abs(c.mesh.position.x - px) < 1.2) {
                c.collected = true;
                this.scene.remove(c.mesh);
                this.coins += 1;
                this.score += 50;
                this.audio.playCoinSound();
            }
        }

        // Check Obstacles
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];
            const dz = Math.abs(obs.mesh.position.z - pz);
            const dx = Math.abs(obs.mesh.position.x - px);

            if (dz < 1.0 && dx < 1.1) {
                // Check if dodging via jump or slide
                if (obs.type === "low" && py > 1.2) {
                    continue; // Jumped over successfully!
                }
                if (obs.type === "high" && this.isSliding) {
                    continue; // Slid under successfully!
                }
                // Crash!
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
            this.playerMesh.position.y = 0.4;
            if (this.isJumping) {
                this.verticalVelocity = -this.jumpForce * 1.5; // fast drop
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
            if (!this.isPlaying) return;
            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.moveLeft();
            else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.moveRight();
            else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") this.jump();
            else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") this.slide();
        });

        // Touch Swipe Controls
        window.addEventListener("touchstart", (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener("touchend", (e) => {
            if (!this.isPlaying) return;
            const deltaX = e.changedTouches[0].clientX - this.touchStartX;
            const deltaY = e.changedTouches[0].clientY - this.touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) this.moveRight();
                else if (deltaX < -30) this.moveLeft();
            } else {
                if (deltaY < -30) this.jump();
                else if (deltaY > 30) this.slide();
            }
        }, { passive: true });
    }
}

// Start Game Instance
window.addEventListener("DOMContentLoaded", () => {
    new ZonaTRunnerGame();
});
