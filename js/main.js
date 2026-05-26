import * as THREE          from 'three';
import { OrbitControls }   from 'three/addons/controls/OrbitControls.js';
import { state }           from './state.js';
import { SCENARIOS }       from './scenarios.js';
import { getUI }           from './ui.js';
import { createOcean, updateOcean, getWaveInfo  } from './models/ocean.js';
import { loadScenario, backToMenu } from './sceneManager.js';
import { updateLightVisibility } from './lighting.js';
import { steeringWheel, cameraAnchor } from './models/playerBoat.js';

state.scene = new THREE.Scene();
state.scene.fog = new THREE.FogExp2(0x020408, 0.003);

state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 2000);

state.renderer = new THREE.WebGLRenderer({ antialias: true });
state.renderer.setSize(window.innerWidth, window.innerHeight);
state.renderer.setPixelRatio(window.devicePixelRatio);
state.renderer.setClearColor('rgb(255, 255, 255)', 1.0);
document.getElementById('canvas-container').appendChild(state.renderer.domElement);

// --- Kamera-Modus Status & OrbitControls Setup ---
state.cameraMode = 'firstPerson'; // Startet in der First-Person-Ansicht
state.controls = new OrbitControls(state.camera, state.renderer.domElement);
state.controls.enabled = false; // Wird im First-Person-Modus deaktiviert
//state.controls.enableDamping = true;
//state.controls.dampingFactor = 0.05;

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
/*
const { water, waterMat, wPos, origWZ } = createOcean();
state.waterMat = waterMat;
state.wPos     = wPos;
state.origWZ   = origWZ;
state.scene.add(water);
*/
const water = createOcean(state.scene);
state.water = water;
state.scene.add(water);


// ==========================================
// KEYBOARD & MOUSE INPUT
// ==========================================

document.addEventListener('keydown', e => { 
    state.keys[e.key] = true; 
    
    if (e.key === 'c' || e.key === 'C') {
        if (state.cameraMode === 'firstPerson') {
            state.cameraMode = 'thirdPerson';
            state.controls.enabled = true; 
            isDragging = false; 

            if (state.playerBoat) {
                const camTarget = CAM_OFFSET.clone().applyMatrix4(state.playerBoat.matrixWorld);
                state.camera.position.copy(camTarget);
                state.controls.target.copy(state.playerBoat.position);
                state.controls.update();
            }

        } else {
            state.cameraMode = 'firstPerson';
            state.controls.enabled = false; 
        }
    }
});

document.addEventListener('keyup', e => { state.keys[e.key] = false; });

// Variablen für die First-Person Maus-Look-Steuerung
let isDragging = false;
let lookYaw = Math.PI; // Start-Blickrichtung nach vorne
let lookPitch = 0;

const canvasContainer = document.getElementById('canvas-container');

canvasContainer.addEventListener('mousedown', () => { isDragging = true; });
window.addEventListener('mouseup', () => { isDragging = false; });

window.addEventListener('mousemove', (e) => {
    // Maus-Look nur anwenden, wenn wir im First-Person-Modus sind
    if (!isDragging || state.cameraMode !== 'firstPerson') return;
    
    lookYaw -= e.movementX * 0.003;
    lookPitch -= e.movementY * 0.003;
    
    const maxPitch = Math.PI / 2.2;
    lookPitch = Math.max(-maxPitch, Math.min(maxPitch, lookPitch));
});


// MAIN MENU
const scenarioGrid = document.getElementById('scenario-grid');
SCENARIOS.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = 'scenario-card';
    card.innerHTML = `
        <div class="card-number">Szenario ${idx + 1}</div>
        <div class="card-title">${s.title}</div>
        <div class="card-desc">${s.cardDesc}</div>
    `;
    card.onclick = () => loadScenario(s);
    scenarioGrid.appendChild(card);
});

window.backToMenu = backToMenu;

const axesHelper = new THREE.AxesHelper(10);
state.scene.add(axesHelper);

// ==========================================
// ANIMATION LOOP
// ==========================================

const CAM_OFFSET = new THREE.Vector3(0, 8, -15);
const clock = new THREE.Clock();

// Variable, um die tatsächliche Himmelsrichtung (Gieren) des Spielerbootes zu speichern
// (Unabhängig vom Schaukeln der Wellen)
let playerYaw = Math.PI; // Startet bei 180 Grad, damit es nach -Z schaut. 
let targetYaw = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time  = clock.getElapsedTime();

    if (state.water) {
        updateOcean(state.water, time);
    }

    if (state.playerBoat) {
        const speed     = 10  * delta;
        const turnSpeed = 0.5 * delta;

        // 1. Alte Position vor der Bewegung merken (für Third-Person-Kamera)
        const oldPos = state.playerBoat.position.clone();
        
        const wheelTurnSpeed = 2.5 * delta; 
        const maxWheelTurn = Math.PI;       

        // --- LENKUNG (YAW) BERECHNEN ---
        if (state.keys['a'] || state.keys['ArrowLeft']) {
            playerYaw += turnSpeed; // Linkskurve
            if (steeringWheel) steeringWheel.rotation.z = Math.max(steeringWheel.rotation.z - wheelTurnSpeed, -maxWheelTurn);
        } 
        else if (state.keys['d'] || state.keys['ArrowRight']) {
            playerYaw -= turnSpeed; // Rechtskurve
            if (steeringWheel) steeringWheel.rotation.z = Math.min(steeringWheel.rotation.z + wheelTurnSpeed, maxWheelTurn);
        } 
        else {
            if (steeringWheel) steeringWheel.rotation.z *= 0.85; // Zurückfedern
        }

        // --- WELLEN FÜR PLAYBOAT BERECHNEN ---
        // Wichtig, bevor sich das Boot neigt oder bewegt!
        const px = state.playerBoat.position.x;
        const pz = state.playerBoat.position.z;
        const wave = getWaveInfo(px, pz, time);
        
        // Höhe des Bootes an die Wellenhöhe anpassen (1.2 ist der Tiefgang)
        state.playerBoat.position.y = wave.height + 1.2; 

        // Sanftes Neigen des Bootes (Dämpfungs-Faktor: 0.5)
        const targetPitch = wave.normal.z * 0.5;
        const targetRoll = -wave.normal.x * 0.5;

        // --- AUSRICHTEN: LENKUNG UND WELLEN KOMBINIEREN ---
        // Steuerrad-Quaternion (links/rechts lenken)
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
        
        //Schaukel-Quaternion (vor/zurück & rollen)
        const waveEuler = new THREE.Euler(targetPitch, 0, targetRoll, 'YXZ');
        const waveQuat = new THREE.Quaternion().setFromEuler(waveEuler);
        
        // Kombination aus beidem
        state.playerBoat.quaternion.copy(yawQuat).multiply(waveQuat);

        // --- FAHREN ---
        // Das Boot wird nun entlang seiner aktuellen Ausrichtung (vorwärts = -Z) geschoben
        if (state.keys['w'] || state.keys['ArrowUp'])   state.playerBoat.translateZ(speed); 
        if (state.keys['s'] || state.keys['ArrowDown']) state.playerBoat.translateZ(-speed);


        // --- KAMERA-LOGIK ---
        if (state.cameraMode === 'firstPerson') {
            if (cameraAnchor) {
                cameraAnchor.getWorldPosition(state.camera.position);
                const baseQuat = new THREE.Quaternion();
                cameraAnchor.getWorldQuaternion(baseQuat);
                const mouseQuat = new THREE.Quaternion();
                mouseQuat.setFromEuler(new THREE.Euler(lookPitch, lookYaw, 0, 'YXZ'));
                state.camera.quaternion.copy(baseQuat).multiply(mouseQuat);
            }
        } else {
            // Die Kamera folgt dem Boot exakt um die Strecke, die es in diesem Frame gefahren ist
            const deltaMovement = new THREE.Vector3().subVectors(state.playerBoat.position, oldPos);
            state.camera.position.add(deltaMovement);
            state.controls.target.copy(state.playerBoat.position);
            state.controls.update(); 
        }

        updateLightVisibility(state.playerBoat, state.camera);
    }

    if (state.targetShip) {
        const tx = state.targetShip.position.x;
        const tz = state.targetShip.position.z;
        const waveT = getWaveInfo(tx, tz, time);

        // Basis-Y-Position plus Wellenhöhe
        state.targetShip.position.y = waveT.height + 1.5; // 1.5 ist der Tiefgang des Zielschiffs

        // TARGETSHIP BERUHIGEN:
        // Ein großes Schiff schaukelt bei kleinen Wellen viel träger und weniger tief als ein kleines Boot.
        // Wir reduzieren die Neigung hier drastisch auf 0.15 (statt vorher 1.0 oder 0.6).
        const targetPitchT = waveT.normal.z * 0.15;
        const targetRollT = waveT.normal.x * 0.15;

        // Wir nutzen dieselbe sichere Quaternion-Methode wie beim PlayerBoat
        const baseYawT = targetYaw; // 0, falls sich das Schiff nicht aktiv dreht
        const yawQuatT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseYawT);
        
        const waveEulerT = new THREE.Euler(targetPitchT, 0, targetRollT, 'YXZ');
        const waveQuatT = new THREE.Quaternion().setFromEuler(waveEulerT);

        state.targetShip.quaternion.copy(yawQuatT).multiply(waveQuatT);

        updateLightVisibility(state.targetShip, state.camera);
    }

    state.renderer.render(state.scene, state.camera);
}


animate();
