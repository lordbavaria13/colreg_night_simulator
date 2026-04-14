
import * as THREE          from 'three';
import { OrbitControls }   from 'three/addons/controls/OrbitControls.js';
import { state }           from './state.js';
import { SCENARIOS }       from './scenarios.js';
import { getUI }              from './ui.js';
import { createOcean, updateOcean } from './models/ocean.js';
import { loadScenario, backToMenu } from './sceneManager.js';
import { updateLightVisibility } from './lighting.js';


state.scene = new THREE.Scene();
state.scene.fog = new THREE.FogExp2(0x020408, 0.003);

state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 2000);
state.camera.position.set(0, 10, 30);

state.renderer = new THREE.WebGLRenderer({ antialias: true });
state.renderer.setSize(window.innerWidth, window.innerHeight);
state.renderer.setPixelRatio(window.devicePixelRatio);
                state.renderer.setClearColor('rgb(255, 255, 255)', 1.0);
//state.renderer.shadowMap.enabled = true;
//state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(state.renderer.domElement);

state.controls = new OrbitControls(state.camera, state.renderer.domElement);
state.controls.enableDamping  = true;
state.controls.dampingFactor  = 0.05;
state.controls.maxPolarAngle  = Math.PI / 2 - 0.02;

window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
});



// Night ambient
state.ambientLight = new THREE.AmbientLight(0x0a1020, 1.5);
state.scene.add(state.ambientLight);

// Starfield
(function buildStarfield() {
    const count = 3000;
    const pos   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 2000;
        pos[i * 3 + 1] = Math.random() * 400 + 60;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    state.scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 })));
})();

// Animated ocean
const { water, waterMat, wPos, origWZ } = createOcean();
state.waterMat = waterMat;
state.wPos     = wPos;
state.origWZ   = origWZ;
state.scene.add(water);

//  KEYBOARD INPUT

document.addEventListener('keydown', e => { state.keys[e.key] = true; });
document.addEventListener('keyup',   e => { state.keys[e.key] = false; });

//  MAIN MENU

const scenarioGrid = document.getElementById('scenario-grid');
SCENARIOS.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = 'scenario-card';

    /*
    const dots = s.lightDots.map(c =>
        `<div class="light-dot" style="background:${c};box-shadow:0 0 6px ${c}"></div>`
    ).join('');
    */

    card.innerHTML = `
        <div class="card-number">Szenario ${idx + 1}</div>
        <div class="card-title">${s.title}</div>
        <div class="card-desc">${s.cardDesc}</div>
    `;

    card.onclick = () => loadScenario(s);
    scenarioGrid.appendChild(card);
});

window.backToMenu = backToMenu;

//  ANIMATION LOOP
const CAM_OFFSET = new THREE.Vector3(0, 9, 26);
const clock      = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time  = clock.getElapsedTime();

    updateOcean(state.wPos, state.origWZ, time);

    if (state.playerBoat) {
        const speed     = 18  * delta;
        const turnSpeed = 1.2 * delta;

        if (state.keys['w'] || state.keys['ArrowUp'])    state.playerBoat.translateZ(-speed);
        if (state.keys['s'] || state.keys['ArrowDown'])  state.playerBoat.translateZ(speed);
        if (state.keys['a'] || state.keys['ArrowLeft'])  state.playerBoat.rotation.y += turnSpeed;
        if (state.keys['d'] || state.keys['ArrowRight']) state.playerBoat.rotation.y -= turnSpeed;

        const camTarget = CAM_OFFSET.clone().applyMatrix4(state.playerBoat.matrixWorld);
        state.camera.position.lerp(camTarget, 0.08);
        state.controls.target.lerp(state.playerBoat.position, 0.1);

        updateLightVisibility(state.playerBoat, state.camera)
    }

    if (state.targetShip) {
        state.targetShip.rotation.z = Math.sin(time * 0.50)       * 0.018;
        state.targetShip.rotation.x = Math.sin(time * 0.35 + 1.0) * 0.010;

        updateLightVisibility(state.targetShip, state.camera)
    }

    state.controls.update();
    state.renderer.render(state.scene, state.camera);
}

animate();
