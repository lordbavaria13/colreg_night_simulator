import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';

// Wave parameters for large, slow swell
const waveA = { speed: 1.0, scale: 1.2, dirX: 1.0, dirZ: 0.5 };
const waveB = { speed: 0.6, scale: 0.8, dirX: -0.5, dirZ: 1.0 };
const waveC = { speed: 1.5, scale: 0.5, dirX: 0.2, dirZ: 0.8 };


export function createOcean(scene) {
    const oceanGroup = new THREE.Group();
    
    const waterGeometry = new THREE.PlaneGeometry(2000, 2000, 256, 256);

    const textureLoader = new THREE.TextureLoader();
    const waterNormals = textureLoader.load('./assets/textures/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

const water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        sunDirection: new THREE.Vector3(-100, 200, -100).normalize(),
        sunColor: 0x112233,   
        waterColor: 0x001208,  
        distortionScale: 3.7,
        fog: scene !== undefined && scene.fog !== undefined,
        alpha: 0.92
    }
);
    water.rotation.x = -Math.PI / 2;
    
const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0x000510,
    roughness: 0.92,
    metalness: 0.05,
    normalMap: waterNormals,
    normalScale: new THREE.Vector2(0.05, 0.05)
});

    const mirrorPlane = new THREE.Mesh(waterGeometry, mirrorMat);
    mirrorPlane.rotation.x = -Math.PI / 2;
    mirrorPlane.position.y = -0.5;

    oceanGroup.add(mirrorPlane);
    oceanGroup.add(water);

    oceanGroup.userData.water = water;
    oceanGroup.userData.mirrorMat = mirrorMat;

    const posAttribute = waterGeometry.attributes.position;
    oceanGroup.userData.origZ = new Float32Array(posAttribute.count);
    for (let i = 0; i < posAttribute.count; i++) {
        oceanGroup.userData.origZ[i] = posAttribute.getZ(i);
    }
    oceanGroup.userData.posAttribute = posAttribute;

    return oceanGroup;
}

export function updateOcean(oceanGroup, time) {
    if (!oceanGroup || !oceanGroup.userData) return;

    const water = oceanGroup.userData.water;
    const mirrorMat = oceanGroup.userData.mirrorMat;
    const posAttr = oceanGroup.userData.posAttribute;
    const origZ = oceanGroup.userData.origZ;

    if (water && water.material && water.material.uniforms['time']) {
        water.material.uniforms['time'].value += 1.0 / 60.0;
    }
    if (mirrorMat && mirrorMat.normalMap) {
        mirrorMat.normalMap.offset.x += 0.0001;
        mirrorMat.normalMap.offset.y += 0.0001;
    }

    if (posAttr && origZ) {
        for (let i = 0; i < posAttr.count; i++) {
            const vx = posAttr.getX(i);
            const vy = posAttr.getY(i); 
            
            const wave = getWaveInfo(vx, -vy, time); 
            
            posAttr.setZ(i, origZ[i] + wave.height);
        }
        posAttr.needsUpdate = true;
        
        oceanGroup.children[0].geometry.computeVertexNormals(); 
    }
}
export function getWaveInfo(x, z, time) {
    let y = 0;
    
    // Ableitungen für die Neigung (Pitch/Roll)
    let dx = 0;
    let dz = 0;

    // Welle A
    let phaseA = (x * waveA.dirX + z * waveA.dirZ) * 0.1 + time * waveA.speed;
    y += Math.sin(phaseA) * waveA.scale;
    dx += Math.cos(phaseA) * waveA.scale * 0.1 * waveA.dirX;
    dz += Math.cos(phaseA) * waveA.scale * 0.1 * waveA.dirZ;

    // Welle B
    let phaseB = (x * waveB.dirX + z * waveB.dirZ) * 0.2 + time * waveB.speed;
    y += Math.sin(phaseB) * waveB.scale;
    dx += Math.cos(phaseB) * waveB.scale * 0.2 * waveB.dirX;
    dz += Math.cos(phaseB) * waveB.scale * 0.2 * waveB.dirZ;

    // Welle C
    let phaseC = (x * waveC.dirX + z * waveC.dirZ) * 0.3 + time * waveC.speed;
    y += Math.sin(phaseC) * waveC.scale;
    dx += Math.cos(phaseC) * waveC.scale * 0.3 * waveC.dirX;
    dz += Math.cos(phaseC) * waveC.scale * 0.3 * waveC.dirZ;

    // Normalenvektor der Welle berechnen
    const normal = new THREE.Vector3(-dx, 1, -dz).normalize();

    return { height: y, normal: normal };
}
