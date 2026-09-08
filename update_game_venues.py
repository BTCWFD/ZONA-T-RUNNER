import re

file_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\web-runner\game.js"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Definición de texturas de neón dinámicas en Canvas para los nuevos clubes
new_textures = '''
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
'''

insert_pos = code.find("this.cyberpunkTextures.octava =")
code = code[:insert_pos] + new_textures + "\n        " + code[insert_pos:]

# 2. Reemplazo del bloque de fachadas en spawnTrackSegment para rotar entre los 10 clubes
old_facades = '''        // =========================================================================
        // SCREEN LEFT (+X = +11.8): THE ICONIC BOGOTÁ NIGHTCLUBS (CLUB OCTAVA & ANDRÉS D.C.)
        // In Image 2, Club Octava is in foreground and Andrés D.C. is directly next to it!
        // =========================================================================
        const leftHalfLen = segLen / 2; // 14m per facade

        // --- SUB-FACADE 1: CLUB OCTAVA (z from 0 to 14) ---
        {
            const octBldgHeight = 22;
            const octBldg = new THREE.Group();
            octBldg.position.set(11.8, octBldgHeight / 2, leftHalfLen * 0.5);

            // Brick Body
            const bBody = new THREE.Mesh(new THREE.BoxGeometry(6.6, octBldgHeight, leftHalfLen), brickMat);
            octBldg.add(bBody);

            // Windows upper floor
            const bWin = new THREE.Mesh(new THREE.PlaneGeometry(leftHalfLen - 1.5, octBldgHeight - 8), windowMat);
            bWin.rotation.y = -Math.PI / 2;
            bWin.position.set(-3.32, 3.2, 0);
            octBldg.add(bWin);

            // Club Octava Entrance Canopy extending over sidewalk
            const canopyGeo = new THREE.BoxGeometry(4.0, 0.45, 9.6);
            const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0a0e14, metalness: 0.9, roughness: 0.25 });
            const canopy = new THREE.Mesh(canopyGeo, canopyMat);
            canopy.position.set(-4.8, 4.0 - (octBldgHeight / 2), 0);
            octBldg.add(canopy);

            // Glowing Downlight Under Canopy
            const underCanopyLight = new THREE.PointLight(0x00f0ff, 2.5, 12);
            underCanopyLight.position.set(-4.8, 3.6 - (octBldgHeight / 2), 0);
            octBldg.add(underCanopyLight);

            // Large Cyan Neon Sign: "CLUB OCTAVA" (Mounted on canopy front facing oncoming runner)
            const octSignGeo = new THREE.PlaneGeometry(6.6, 1.8);
            const octSignMat = new THREE.MeshBasicMaterial({
                map: this.cyberpunkTextures.octava,
                side: THREE.DoubleSide
            });

            // Front edge sign mounted on top of canopy (facing oncoming player directly like Image 2!)
            const octSignFront = new THREE.Mesh(octSignGeo, octSignMat);
            octSignFront.rotation.y = Math.PI; // Faces oncoming player
            octSignFront.position.set(-4.8, 4.2 - (octBldgHeight / 2) + 1.0, -4.8);
            octBldg.add(octSignFront);

            // Cyan Club Atmosphere PointLight
            const octavaLight = new THREE.PointLight(0x00ffff, 4.0, 24);
            octavaLight.position.set(5.8, 4.2, leftHalfLen * 0.5);
            segment.add(octavaLight);

            segment.add(octBldg);
        }

        // --- SUB-FACADE 2: ANDRÉS D.C. (z from 14 to 28) ---
        {
            const andresBldgHeight = 24;
            const andresBldg = new THREE.Group();
            andresBldg.position.set(11.8, andresBldgHeight / 2, leftHalfLen * 1.5);

            // Bogotá Red Brick Body
            const aBody = new THREE.Mesh(new THREE.BoxGeometry(6.6, andresBldgHeight, leftHalfLen), brickMat);
            andresBldg.add(aBody);

            // Windows upper floor
            const aWin = new THREE.Mesh(new THREE.PlaneGeometry(leftHalfLen - 1.5, andresBldgHeight - 8), windowMat);
            aWin.rotation.y = -Math.PI / 2;
            aWin.position.set(-3.32, 3.2, 0);
            andresBldg.add(aWin);

            // Colorful Neon Sign: "ANDRÉS D.C." (Mounted on brick facade facing oncoming traffic and runner!)
            const andresSignGeo = new THREE.PlaneGeometry(6.4, 1.8);
            const andresSignMat = new THREE.MeshBasicMaterial({
                map: this.cyberpunkTextures.andresDC,
                side: THREE.DoubleSide
            });
            const andresSign = new THREE.Mesh(andresSignGeo, andresSignMat);
            andresSign.rotation.y = Math.PI * 0.88; // Angled facing oncoming traffic and runner!
            andresSign.position.set(-3.6, 6.8 - (andresBldgHeight / 2), -3.2);
            andresBldg.add(andresSign);

            // Entrance canopy
            const aCanopyGeo = new THREE.BoxGeometry(3.2, 0.35, 5.8);
            const aCanopyMat = new THREE.MeshStandardMaterial({ color: 0x140804, metalness: 0.6, roughness: 0.3 });
            const aCanopy = new THREE.Mesh(aCanopyGeo, aCanopyMat);
            aCanopy.position.set(-4.2, 3.8 - (andresBldgHeight / 2), 0);
            andresBldg.add(aCanopy);

            // Warm Orange/Amber party illumination spilling onto street
            const andresLight = new THREE.PointLight(0xff5500, 3.8, 22);
            andresLight.position.set(5.8, 4.0, leftHalfLen * 1.5);
            segment.add(andresLight);

            // Rooftop Antenna with Blinking Red Aviation Light
            const antGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.0, 6);
            const ant = new THREE.Mesh(antGeo, metalMat);
            ant.position.set(0, (andresBldgHeight / 2) + 2.5, 0);
            andresBldg.add(ant);

            const beaconGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
            const beacon = new THREE.Mesh(beaconGeo, beaconMat);
            beacon.position.set(0, (andresBldgHeight / 2) + 5.1, 0);
            andresBldg.add(beacon);

            segment.add(andresBldg);
        }'''

new_facades = '''        // =========================================================================
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

            if (venue.hasCanopy) {
                // Marquesina extendida hacia el andén
                const canopyGeo = new THREE.BoxGeometry(4.0, 0.45, 9.6);
                const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0a0e14, metalness: 0.9, roughness: 0.25 });
                const canopy = new THREE.Mesh(canopyGeo, canopyMat);
                canopy.position.set(-4.8, 4.0 - (bldgHeight / 2), 0);
                bldg.add(canopy);

                // Letrero frontal sobre la marquesina de cara al corredor
                sign.rotation.y = Math.PI;
                sign.position.set(-4.8, 4.2 - (bldgHeight / 2) + 1.0, -4.8);
            } else {
                // Letrero en fachada angular
                sign.rotation.y = Math.PI * 0.88;
                sign.position.set(-3.6, 6.8 - (bldgHeight / 2), -3.0);
            }
            bldg.add(sign);

            // Luz volumétrica del club iluminando la pista
            const clubLight = new THREE.PointLight(venue.color, 4.0, 24);
            clubLight.position.set(5.8, 4.2, bldgZ);
            segment.add(clubLight);

            segment.add(bldg);
        });'''

if old_facades in code:
    code = code.replace(old_facades, new_facades)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("=== GAME.JS UPDATED WITH ALL 10 CLUBS ROTATION ===")
else:
    print("Warning: old_facades block not found exactly.")
