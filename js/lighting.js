import * as THREE from 'three';
import { state } from './state.js';

const _worldPos = new THREE.Vector3();
const _camPos   = new THREE.Vector3();
const _dirToCam = new THREE.Vector3();


export function enableDayMode() {
    state.isDayMode = true;
    
    // 1. NEUER OZEAN - Farbe für den Tag anpassen
    if (state.water && state.water.material && state.water.material.uniforms) {
        state.water.material.uniforms['waterColor'].value.setHex(0x006994);
        state.water.material.uniforms['sunColor'].value.setHex(0xffffff);
    }
    
    state.scene.fog.color.setHex(0x87CEEB);
    state.renderer.setClearColor(0x87CEEB);
    state.ambientLight.color.setHex(0xffffff);
    state.ambientLight.intensity = 0.6;

    if (!state.scene.getObjectByName('_sun')) {
        const sun = new THREE.DirectionalLight(0xfffaee, 1.5);
        sun.name = '_sun';
        sun.position.set(100, 200, 100);
        state.scene.add(sun);
        
        // 2. Das neue Wasser an das Sonnenlicht binden (für Reflexionen)
        if (state.water && state.water.material) {
            state.water.material.uniforms['sunDirection'].value.copy(sun.position).normalize();
        }
    }
}
    

export function disableDayMode() {
    state.isDayMode = false;
    
    // 1. NEUER OZEAN - Farbe für die Nacht anpassen
    if (state.water && state.water.material && state.water.material.uniforms) {
        state.water.material.uniforms['waterColor'].value.setHex(0x001e0f);
        state.water.material.uniforms['sunColor'].value.setHex(0x88bbff); // Mondlicht-Spiegelung
    }
    
    state.scene.fog.color.setHex(0x020408);
    state.renderer.setClearColor(0x020408);
    state.ambientLight.color.setHex(0x0a1020);
    state.ambientLight.intensity = 1.5;

    const sun = state.scene.getObjectByName('_sun');
    if (sun) {
        state.scene.remove(sun);
    }
    
    // 2. Mondlicht als DirectionalLight hinzufügen (falls noch nicht vorhanden),
    // damit das Wasser nachts auch spiegelt!
    if (!state.scene.getObjectByName('_moon')) {
        const moon = new THREE.DirectionalLight(0x88bbff, 0.5);
        moon.name = '_moon';
        moon.position.set(-100, 200, -100);
        state.scene.add(moon);
        
        // Wasser an das Mondlicht binden
        if (state.water && state.water.material) {
            state.water.material.uniforms['sunDirection'].value.copy(moon.position).normalize();
        }
    }
}

export function updateLightVisibility(shipGroup, camera) {
    if (!shipGroup || !camera) return;

    camera.getWorldPosition(_camPos);

    shipGroup.children.forEach(child => {
        if (child.name !== 'navBulbMesh') return;
        if (!child.userData || !child.userData.isSectorLight) return;

        // Position des Lichts
        child.getWorldPosition(_worldPos);

        // Vektor von der Lichtquelle zur Kamera berechnen
        _dirToCam.subVectors(_camPos, _worldPos);
        _dirToCam.y = 0; // 2D Ebene

        if (_dirToCam.lengthSq() < 0.000001) {
            child.visible = true;
            return;
        }

        const localDirToCam = _dirToCam.clone().applyQuaternion(shipGroup.quaternion.clone().invert());
    
        let angleToCamRad = Math.atan2(localDirToCam.x, -localDirToCam.z);

        const centerRad = child.userData.centerRad;
        const halfAngleRad = child.userData.halfAngleRad;

        let diff = Math.abs(angleToCamRad - centerRad);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;

        // Toleranz von 0.05 rad (ca 3 Grad), damit es am Rand nicht flackert
        child.visible = diff <= (halfAngleRad + 0.05);
    });
}
