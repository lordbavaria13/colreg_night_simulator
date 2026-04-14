import { state } from './state.js';
import { createPlayerBoat } from './models/playerBoat.js';
import { createTargetShip } from './models/targetShip.js';
import { disableDayMode } from './lighting.js';
import { buildQuiz } from './quiz.js';
import { getUI } from './ui.js';

export function loadScenario(scenario) {
    const ui = getUI();

    state.currentScenario = scenario;
    disableDayMode();

    if (state.playerBoat) {
        state.scene.remove(state.playerBoat);
        state.playerBoat = null;
    }

    if (state.targetShip) {
        state.scene.remove(state.targetShip);
        state.targetShip = null;
    }

    state.playerBoat = createPlayerBoat();
    state.scene.add(state.playerBoat);

    state.targetShip = createTargetShip(scenario);
    state.targetShip.position.set(0, 1.5, -85);
    state.scene.add(state.targetShip);

    state.camera.position.set(0, 10, 30);
    state.controls.target.set(0, 2, 0);
    state.controls.update();

    ui.mainMenu.classList.add('hidden');
    ui.resultOverlay.classList.add('hidden');
    ui.hud.classList.remove('hidden');
    ui.hudScenarioName.textContent = scenario.title;

    buildQuiz(scenario);
    ui.quizPanel.classList.remove('hidden');
}

export function backToMenu() {
    const ui = getUI();

    //disableDayMode();

    if (state.playerBoat) {
        state.scene.remove(state.playerBoat);
        state.playerBoat = null;
    }

    if (state.targetShip) {
        state.scene.remove(state.targetShip);
        state.targetShip = null;
    }

    ui.resultOverlay.classList.add('hidden');
    ui.quizPanel.classList.add('hidden');
    ui.hud.classList.add('hidden');
    ui.mainMenu.classList.remove('hidden');
}