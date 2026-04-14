import * as THREE from 'three';
import { state } from './state.js';

const _worldPos = new THREE.Vector3();
const _camPos   = new THREE.Vector3();
const _dirToCam = new THREE.Vector3();

export function enableDayMode() {
    state.isDayMode = true;
    state.waterMat.color.set(0x006994);
    state.waterMat.specular.set(0x44aacc);
    state.scene.fog.color.set(0x87CEEB);
    state.renderer.setClearColor(0x87CEEB);
    state.ambientLight.color.set(0xffffff);
    state.ambientLight.intensity = 9;

    if (!state.scene.getObjectByName('_sun')) {
        const sun = new THREE.DirectionalLight(0xfffaee, 3);
        sun.name = '_sun';
        sun.position.set(100, 200, 100);
        state.scene.add(sun);
    }
}

export function disableDayMode() {
    state.isDayMode = false;
    state.waterMat.color.set(0x001a10);
    state.waterMat.specular.set(0x113322);
    state.scene.fog.color.set(0x020408);
    state.renderer.setClearColor(0x020408);
    state.ambientLight.color.set(0x0a1020);
    state.ambientLight.intensity = 1.5;

    const sun = state.scene.getObjectByName('_sun');
    if (sun) state.scene.remove(sun);
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