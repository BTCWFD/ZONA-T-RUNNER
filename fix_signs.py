import re

file_path = r"c:\Program Files\PROYECTOS DE PROGRAMACION\ZONAT-RUNNER\web-runner\game.js"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# Reemplazamos la orientación y tamaño de los letreros de las discotecas
old_sign_block = '''            if (venue.hasCanopy) {
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
            bldg.add(sign);'''

new_sign_block = '''            // Marquesina extendida hacia el andén
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
            bldg.add(signWall);'''

# Y distribuimos discotecas también en la ACERA DERECHA (-X)
old_right_signs = '''            // Neon Sign above vitrina
            const rSignGeo = new THREE.PlaneGeometry(4.8, 1.4);
            const rSignTex = ((segIndex + sidx) % 2 === 0) ? this.cyberpunkTextures.baumClub : this.cyberpunkTextures.kaputt;
            const rSign = new THREE.Mesh(rSignGeo, new THREE.MeshBasicMaterial({ map: rSignTex, side: THREE.DoubleSide }));
            rSign.rotation.y = Math.PI / 2;
            rSign.position.set(3.35, 4.2 - (rightBldgHeight / 2), sfZ);
            rightBldg.add(rSign);'''

new_right_signs = '''            // Discotecas en la acera derecha rotando también
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
            rightBldg.add(rWallSign);'''

if old_sign_block in code:
    code = code.replace(old_sign_block, new_sign_block)
    print("Left signs replaced successfully.")
else:
    print("Warning: old_sign_block not found.")

if old_right_signs in code:
    code = code.replace(old_right_signs, new_right_signs)
    print("Right signs replaced successfully.")
else:
    print("Warning: old_right_signs not found.")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("=== ALL VENUES SIGNS FULLY ENLARGED AND ANGLED FOR RUNNER ===")
