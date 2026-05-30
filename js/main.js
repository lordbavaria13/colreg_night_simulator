import * as THREE          from 'three';
import { OrbitControls }   from 'three/addons/controls/OrbitControls.js';
import { state }           from './state.js';
import { SCENARIOS }       from './scenarios.js';
import { getUI }           from './ui.js';
import { createOcean, updateOcean, getWaveInfo  } from './models/ocean.js';
import { loadScenario, backToMenu } from './sceneManager.js';
import { updateLightVisibility } from './lighting.js';
import { steeringWheel, cameraAnchor } from './models/playerBoat.js';
import { setLang, getLang, t, tScenario } from './i18n.js';

import { MAX_DIST, FOG_START,
         NAV_DIST_NEAR, NAV_DIST_FAR,
         NAV_INTENSITY_NEAR, NAV_INTENSITY_FAR,
         NAV_SIZE_NEAR, NAV_SIZE_FAR } from './config.js';


state.scene = new THREE.Scene();
state.scene.fog = new THREE.FogExp2(0x020408, 0.001);

state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 2000);

state.renderer = new THREE.WebGLRenderer({ antialias: true });
state.renderer.setSize(window.innerWidth, window.innerHeight);
state.renderer.setPixelRatio(window.devicePixelRatio);
state.renderer.setClearColor('rgb(255, 255, 255)', 1.0);
document.getElementById('canvas-container').appendChild(state.renderer.domElement);

state.cameraMode = 'firstPerson';
state.controls = new OrbitControls(state.camera, state.renderer.domElement);
state.controls.enabled = false;
state.controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
};
state.controls.maxPolarAngle = Math.PI / 2 - 0.05;

window.addEventListener('resize', () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
});

state.ambientLight = new THREE.AmbientLight(0x0a1020, 1);
state.scene.add(state.ambientLight);

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

const water = createOcean(state.scene);
state.water = water;
state.scene.add(water);


const btnLeft     = document.getElementById('btn-left');
const btnRight    = document.getElementById('btn-right');
const btnThrottle = document.getElementById('btn-throttle');

btnLeft.addEventListener('touchstart',  (e) => { e.preventDefault(); state.keys['ArrowLeft']  = true;  }, { passive: false });
btnLeft.addEventListener('touchend',    (e) => { e.preventDefault(); state.keys['ArrowLeft']  = false; }, { passive: false });
btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); state.keys['ArrowRight'] = true;  }, { passive: false });
btnRight.addEventListener('touchend',   (e) => { e.preventDefault(); state.keys['ArrowRight'] = false; }, { passive: false });

let throttleLocked = false;
btnThrottle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    throttleLocked = !throttleLocked;
    state.keys['ArrowUp'] = throttleLocked;
    btnThrottle.classList.toggle('active', throttleLocked);
}, { passive: false });

document.addEventListener('keydown', e => {
    state.keys[e.key] = true;

    if (e.key === 'Escape') {
        const ui = getUI();
        if (!ui.creditsModal?.classList.contains('hidden')) {
            ui.creditsModal.classList.add('hidden');
        } else if (!ui.shortcutsModal?.classList.contains('hidden')) {
            ui.shortcutsModal.classList.add('hidden');
        } else if (!ui.mainMenu?.classList.contains('hidden')) {
        } else {
            backToMenu();
        }
    }

    if (e.key === 'q' || e.key === 'Q') {
        const panel = document.getElementById('quiz-panel');
        const btn   = document.getElementById('quiz-toggle');
        if (panel && !panel.classList.contains('hidden')) {
            const collapsed = panel.classList.toggle('collapsed');
            if (btn) {
                btn.textContent = collapsed ? '▲' : '▼';
                btn.title = collapsed ? 'Show quiz' : 'Hide quiz';
            }
        }
    }

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

let isDragging = false;
let lookYaw   = Math.PI;
let lookPitch = 0;

const canvasContainer = document.getElementById('canvas-container');
canvasContainer.addEventListener('mousedown', () => { isDragging = true; });
window.addEventListener('mouseup',   () => { isDragging = false; });
window.addEventListener('mousemove', (e) => {
    if (!isDragging || state.cameraMode !== 'firstPerson') return;
    lookYaw   -= e.movementX * 0.003;
    lookPitch -= e.movementY * 0.003;
    const maxPitch = Math.PI / 2.2;
    lookPitch = Math.max(-maxPitch, Math.min(maxPitch, lookPitch));
});

// Touch-Look für First-Person
let lastTouchX = 0, lastTouchY = 0;

canvasContainer.addEventListener('touchstart', (e) => {
    if (state.cameraMode !== 'firstPerson') return;
    if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }
}, { passive: true });

canvasContainer.addEventListener('touchmove', (e) => {
    if (state.cameraMode !== 'firstPerson') return;
    if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastTouchX;
        const dy = e.touches[0].clientY - lastTouchY;
        lookYaw   -= dx * 0.004;
        lookPitch -= dy * 0.004;
        const maxPitch = Math.PI / 2.2;
        lookPitch = Math.max(-maxPitch, Math.min(maxPitch, lookPitch));
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    }
}, { passive: true });


// Language toggle
(function setupLangToggle() {
    const deBtn = document.getElementById('lang-de');
    const enBtn = document.getElementById('lang-en');

    function updateActive() {
        const lang = getLang();
        deBtn?.classList.toggle('lang-active', lang === 'de');
        enBtn?.classList.toggle('lang-active', lang === 'en');
    }

    deBtn?.addEventListener('click', () => {
        setLang('de');
        renderMenu();
        updateActive();
    });

    enBtn?.addEventListener('click', () => {
        setLang('en');
        renderMenu();
        updateActive();
    });

    updateActive();
})();

renderMenu();
window.backToMenu = backToMenu;

function getSolvedSet() {
    try {
        const raw = sessionStorage.getItem('colregs_solved');
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
}

function markSolved(scenarioId) {
    const solved = getSolvedSet();
    solved.add(scenarioId);
    try { sessionStorage.setItem('colregs_solved', JSON.stringify([...solved])); } catch {}
}

window.resetProgress = function() {
    try { sessionStorage.removeItem('colregs_solved'); } catch {}
    renderMenu();
};

function updateProgressUI() {
    const ui = getUI();
    const solved = getSolvedSet();
    const total  = SCENARIOS.length;
    const done   = [...solved].filter(id => SCENARIOS.find(s => s.id === id)).length;
    const pct    = total > 0 ? (done / total) * 100 : 0;

    if (ui.progressBarFill) ui.progressBarFill.style.width = pct + '%';
    if (ui.progressLabel)   ui.progressLabel.textContent =
        `${done} / ${total} ${t('solved') ?? 'solved'}`;
}

function renderMenu() {
    const ui = getUI();
    const scenarioGrid = document.getElementById('scenario-grid');
    scenarioGrid.innerHTML = '';

    const menuSubtitle = document.getElementById('menu-subtitle');
    if (menuSubtitle) menuSubtitle.textContent = t('menuSubtitle');

    const solved = getSolvedSet();

    if (!window._menuOrder) {
        window._menuOrder = [...SCENARIOS]
            .map((s, i) => ({ s, i, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(x => x);
    }

    window._menuOrder.forEach(({ s, i }) => {
        const isSolved = solved.has(s.id);
        const card = document.createElement('div');
        card.className = 'scenario-card' + (isSolved ? ' solved' : '');

        const lightsHtml = isSolved
            ? `<div class="lights-preview">${
                (s.lights ?? []).slice(0, 5).map(l =>
                    `<span class="light-dot" style="background:${l.color}"></span>`
                ).join('')
              }</div>`
            : `<div class="lights-preview"></div>`;

        card.innerHTML = `
            <div class="card-number">${t('scenarioLabel')} ${i + 1}</div>
            <div class="card-title">${isSolved ? tScenario(s, 'title') : '???'}</div>
            <div class="card-desc">${isSolved ? tScenario(s, 'cardDesc') : '&nbsp;'}</div>
            ${lightsHtml}
        `;
        card.onclick = () => loadScenario(s);
        scenarioGrid.appendChild(card);
    });

    const set = (id, key) => { const el = document.getElementById(id); if (el) el.textContent = t(key); };
    set('credits-about-text',   'creditsAbout');
    set('credits-by-label',     'creditsBy');
    set('credits-assets-label', 'creditsAssets');
    set('credits-asset-text',   'creditsAssetText');
    set('credits-license-label','creditsLicense');
    set('credits-basis-label',  'creditsBasis');
    set('credits-basis-text',   'creditsBasisText');

    // Shortcuts übersetzen
    set('shortcuts-title', 'shortcutsTitle');
    set('sc-answer',       'shortcutAnswer');
    set('sc-back',         'shortcutBack');
    set('sc-quiz',         'shortcutQuiz');
    set('sc-camera',       'shortcutCamera');
    set('sc-mouse',        'shortcutMouse');
    set('sc-touch',        'shortcutTouch');

    updateProgressUI();
}

window.markSolved = markSolved;
window.renderMenu = renderMenu;

(function setupModals() {
    const ui = getUI();

    // Credits
    ui.btnCredits?.addEventListener('click', () => {
        ui.creditsModal?.classList.remove('hidden');
    });
    ui.btnCreditsClose?.addEventListener('click', () => {
        ui.creditsModal?.classList.add('hidden');
    });
    ui.creditsModal?.addEventListener('click', e => {
        if (e.target === ui.creditsModal) ui.creditsModal.classList.add('hidden');
    });

    // Shortcuts
    ui.btnShortcuts?.addEventListener('click', () => {
        ui.shortcutsModal?.classList.remove('hidden');
    });
    ui.btnShortcutsClose?.addEventListener('click', () => {
        ui.shortcutsModal?.classList.add('hidden');
    });
    ui.shortcutsModal?.addEventListener('click', e => {
        if (e.target === ui.shortcutsModal) ui.shortcutsModal.classList.add('hidden');
    });

    ui.btnResultBack?.addEventListener('click', () => backToMenu());
})();


(function setupQuizToggle() {
    const ui = getUI();
    const btn = ui.quizToggle;
    const panel = ui.quizPanel;
    if (!btn || !panel) return;

    btn.addEventListener('click', () => {
        const collapsed = panel.classList.toggle('collapsed');
        btn.textContent = collapsed ? '▲' : '▼';
        btn.title = collapsed ? 'Show quiz' : 'Hide quiz';
    });
})();

const CAM_OFFSET = new THREE.Vector3(0, 8, -15);
const clock = new THREE.Clock();

let playerYaw = Math.PI;
let targetYaw = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time  = clock.getElapsedTime();

    if (state.water) updateOcean(state.water, time);

    if (state.playerBoat) {
        const speed     = 10  * delta;
        const turnSpeed = 0.5 * delta;
        const oldPos    = state.playerBoat.position.clone();

        const wheelTurnSpeed = 2.5 * delta;
        const maxWheelTurn   = Math.PI;

        if (state.keys['a'] || state.keys['ArrowLeft']) {
            playerYaw += turnSpeed;
            if (steeringWheel) steeringWheel.rotation.z = Math.max(steeringWheel.rotation.z - wheelTurnSpeed, -maxWheelTurn);
        } else if (state.keys['d'] || state.keys['ArrowRight']) {
            playerYaw -= turnSpeed;
            if (steeringWheel) steeringWheel.rotation.z = Math.min(steeringWheel.rotation.z + wheelTurnSpeed, maxWheelTurn);
        } else {
            if (steeringWheel) steeringWheel.rotation.z *= 0.85;
        }

        const px   = state.playerBoat.position.x;
        const pz   = state.playerBoat.position.z;
        const wave = getWaveInfo(px, pz, time);

        state.playerBoat.position.y = wave.height + 1.2;

        const targetPitch = wave.normal.z * 0.5;
        const targetRoll  = -wave.normal.x * 0.5;

        const yawQuat   = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), playerYaw);
        const waveEuler = new THREE.Euler(targetPitch, 0, targetRoll, 'YXZ');
        const waveQuat  = new THREE.Quaternion().setFromEuler(waveEuler);
        state.playerBoat.quaternion.copy(yawQuat).multiply(waveQuat);

        if (state.keys['w'] || state.keys['ArrowUp'])   state.playerBoat.translateZ(speed);
        if (state.keys['s'] || state.keys['ArrowDown']) state.playerBoat.translateZ(-speed);

        const pos  = state.playerBoat.position;
        const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);

        if (dist > FOG_START) {
            const tFog = Math.min((dist - FOG_START) / (MAX_DIST - FOG_START), 1);
            state.scene.fog.density = 0.003 + tFog * 0.02;
        } else {
            state.scene.fog.density = 0.003;
        }

        if (dist > MAX_DIST) {
            const pushback = (dist - MAX_DIST) * 0.04;
            pos.x -= (pos.x / dist) * pushback;
            pos.z -= (pos.z / dist) * pushback;
            const angleToCenter = Math.atan2(-pos.x, -pos.z);
            let diff = angleToCenter - playerYaw;
            while (diff >  Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            playerYaw += diff * 0.03;
        }

        if (state.cameraMode === 'firstPerson') {
            if (cameraAnchor) {
                cameraAnchor.getWorldPosition(state.camera.position);
                const baseQuat  = new THREE.Quaternion();
                cameraAnchor.getWorldQuaternion(baseQuat);
                const mouseQuat = new THREE.Quaternion();
                mouseQuat.setFromEuler(new THREE.Euler(lookPitch, lookYaw, 0, 'YXZ'));
                state.camera.quaternion.copy(baseQuat).multiply(mouseQuat);
            }
        } else {
            const deltaMovement = new THREE.Vector3().subVectors(state.playerBoat.position, oldPos);
            state.camera.position.add(deltaMovement);
            state.controls.target.copy(state.playerBoat.position);
            state.controls.update();
        }

        updateLightVisibility(state.playerBoat, state.camera);
    }

    if (state.targetShip) {
        const dx = state.targetShip.position.x - state.playerBoat.position.x;
        const dz = state.targetShip.position.z - state.playerBoat.position.z;
        const distToTarget = Math.sqrt(dx * dx + dz * dz);

        const tNav = Math.min(Math.max(
            (distToTarget - NAV_DIST_NEAR) / (NAV_DIST_FAR - NAV_DIST_NEAR), 0), 1);

        state.targetShip.traverse(obj => {
            if (obj.name !== 'navBulbMesh') return;
            obj.children.forEach(child => {
                if (child.isMesh) {
                    child.scale.setScalar(NAV_SIZE_NEAR + tNav * (NAV_SIZE_FAR - NAV_SIZE_NEAR));
                    if (!child.userData.baseColor) {
                        child.userData.baseColor = child.material.color.clone();
                    }
                }
                if (child.isPointLight || child.isSpotLight) {
                    child.intensity = NAV_INTENSITY_NEAR + tNav * (NAV_INTENSITY_FAR - NAV_INTENSITY_NEAR);
                    child.distance  = Math.max(distToTarget * 0.3, 8);
                }
            });
        });

if (state.currentRoute) {
    const route = state.currentRoute;

    if (route.type === 'pingpong') {
        state.routeT += delta * 0.003 * route.dir;
        if (state.routeT >= 1) { state.routeT = 1; route.dir = -1; }
        if (state.routeT <= 0) { state.routeT = 0; route.dir =  1; }
    } else {
        state.routeT += delta * 0.003;
        if (state.routeT > 1) state.routeT = 0;
    }

    const routePos = route.fn(state.routeT);
    state.targetShip.position.x = routePos.x;
    state.targetShip.position.z = routePos.z;

    const yawOffset = state.currentScenario?.yawOffset ?? 0;

    const dirOffset = (route.type === 'pingpong' && route.dir === -1) ? Math.PI : 0;
    targetYaw = routePos.heading + yawOffset + dirOffset + Math.PI;
}

        const tx    = state.targetShip.position.x;
        const tz    = state.targetShip.position.z;
        const waveT = getWaveInfo(tx, tz, time);
        state.targetShip.position.y = waveT.height + 1.5;

        const targetPitchT = waveT.normal.z * 0.15;
        const targetRollT  = waveT.normal.x * 0.15;

        const yawQuatT   = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetYaw);
        const waveEulerT = new THREE.Euler(targetPitchT, 0, targetRollT, 'YXZ');
        const waveQuatT  = new THREE.Quaternion().setFromEuler(waveEulerT);
        state.targetShip.quaternion.copy(yawQuatT).multiply(waveQuatT);

        updateLightVisibility(state.targetShip, state.camera, true);
    }

    state.renderer.render(state.scene, state.camera);
}

animate();
