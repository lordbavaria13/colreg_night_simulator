import * as THREE from 'three';
import { state } from './state.js';

const _worldPos = new THREE.Vector3();
const _camPos   = new THREE.Vector3();
const _dirToCam = new THREE.Vector3();


export function enableDayMode() {
    state.isDayMode = true;
    
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
        
        if (state.water && state.water.material) {
            state.water.material.uniforms['sunDirection'].value.copy(sun.position).normalize();
        }
    }
}
    

export function disableDayMode() {
    state.isDayMode = false;
    
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
    
    if (!state.scene.getObjectByName('_moon')) {
        const moon = new THREE.DirectionalLight(0x88bbff, 0.5);
        moon.name = '_moon';
        moon.position.set(-100, 200, -100);
        state.scene.add(moon);
        
        if (state.water && state.water.material) {
            state.water.material.uniforms['sunDirection'].value.copy(moon.position).normalize();
        }
    }
}

export function updateLightVisibility(shipGroup, camera, flipZ = false) {
  if (!shipGroup || !camera) return;
  camera.getWorldPosition(_camPos);

  shipGroup.traverse(child => {
    if (child.name !== 'navBulbMesh') return;
    if (!child.userData?.isSectorLight) return;

    child.getWorldPosition(_worldPos);
    _dirToCam.subVectors(_camPos, _worldPos);
    _dirToCam.y = 0;

    if (_dirToCam.lengthSq() < 0.000001) {
      child.visible = true;
      return;
    }

    const localDirToCam = _dirToCam.clone()
      .applyQuaternion(shipGroup.getWorldQuaternion(new THREE.Quaternion()).invert());

    const z = flipZ ? -localDirToCam.z : localDirToCam.z;
    const angleToCamRad = Math.atan2(localDirToCam.x, z);

    let diff = Math.abs(angleToCamRad - child.userData.centerRad);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;

    child.visible = diff <= (child.userData.halfAngleRad + 0.05);
  });
}
