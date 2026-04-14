

import * as THREE from 'three';

export function createOcean() {
    const SEGS    = 80;
    const waterGeo = new THREE.PlaneGeometry(2000, 2000, SEGS, SEGS);
    const waterMat = new THREE.MeshPhongMaterial({
        color: 0x001a10, specular: 0x113322, shininess: 80, flatShading: true,
    });

    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;

    const wPos   = waterGeo.attributes.position;
    const origWZ = new Float32Array(wPos.count);
    for (let i = 0; i < wPos.count; i++) origWZ[i] = wPos.getZ(i);

    return { water, waterMat, wPos, origWZ };
}

export function updateOcean(wPos, origWZ, time) {
    for (let i = 0; i < wPos.count; i++) {
        const x = wPos.getX(i);
        const y = wPos.getY(i);
        wPos.setZ(i,
            origWZ[i]
            + Math.sin(x * 0.15 + time * 0.8) * 0.6
            + Math.cos(y * 0.12 + time * 0.6) * 0.4
        );
    }
    wPos.needsUpdate = true;
}
