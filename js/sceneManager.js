import { state }              from './state.js';
import { createPlayerBoat }   from './models/playerBoat.js';
import { createTargetShip }   from './models/targetShip.js';
import { disableDayMode }     from './lighting.js';
import { buildQuiz }          from './quiz.js';
import { getUI }              from './ui.js';
import { getRandomRoute }     from './models/shipRoutes.js';
import { tScenario }          from './i18n.js';

export async function loadScenario(scenario) {
    const ui = getUI();

    ui.mainMenu.classList.add('hidden');
    ui.loadingScreen.classList.remove('hidden');
    document.body.classList.add('sim-active');

    state.currentScenario = scenario;
    disableDayMode();

    if (state.playerBoat) { state.scene.remove(state.playerBoat); state.playerBoat = null; }
    if (state.targetShip) { state.scene.remove(state.targetShip); state.targetShip = null; }

    state.playerBoat = createPlayerBoat();
    state.playerBoat.position.set(0, 0, 30);
    state.scene.add(state.playerBoat);

    state.targetShip = await createTargetShip(scenario);
    state.targetShip.position.set(0, 1.5, -85);
    state.scene.add(state.targetShip);

    state.currentRoute = getRandomRoute();
    state.routeT       = state.currentRoute.startT;

    state.camera.position.set(0, 10, 30);
    state.controls.target.set(0, 2, 0);
    state.controls.update();

    ui.loadingScreen.classList.add('hidden');
    ui.resultOverlay.classList.add('hidden');
    ui.hud.classList.remove('hidden');

    buildQuiz(scenario);
    ui.quizPanel.classList.remove('hidden');
}

export function backToMenu() {
    const ui = getUI();

    if (state.playerBoat) {
        state.scene.remove(state.playerBoat);
        state.playerBoat = null;
    }

    if (state.targetShip) {
        state.scene.remove(state.targetShip);
        state.targetShip = null;
    }

    ui.resultOverlay.classList.add('hidden');
    document.body.classList.remove('sim-active');
    const btnThrottle = document.getElementById('btn-throttle');
if (btnThrottle) btnThrottle.classList.remove('active');
    ui.quizPanel.classList.add('hidden');
    ui.hud.classList.add('hidden');
    ui.mainMenu.classList.remove('hidden');
}
