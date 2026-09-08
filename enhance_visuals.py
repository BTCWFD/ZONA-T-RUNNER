import re

file_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\web-runner\game.js"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Mejorar la niebla volumétrica y cielo de Bogotá
old_fog = 'this.scene.fog = new THREE.FogExp2(skyColor, 0.007);'
new_fog = 'this.scene.fog = new THREE.FogExp2(0x0a0614, 0.012);'

# 2. Agregar estrellas y partículas de niebla/humo de discoteca
old_rain_init = '''    initRain() {
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
    }'''

new_rain_init = '''    initRain() {
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
    }'''

# 3. Animar la lluvia en update(dt)
old_anim_spot = 'if (this.limbs.rightArm) this.limbs.rightArm.rotation.x = legAngle * 0.8;\n        }'
new_anim_spot = '''if (this.limbs.rightArm) this.limbs.rightArm.rotation.x = legAngle * 0.8;\n        }

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
        }'''

if old_fog in code:
    code = code.replace(old_fog, new_fog)
if old_rain_init in code:
    code = code.replace(old_rain_init, new_rain_init)
if old_anim_spot in code:
    code = code.replace(old_anim_spot, new_anim_spot)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("=== GAME.JS VISUALS ENHANCED WITH DYNAMIC RAIN & MIST ===")
