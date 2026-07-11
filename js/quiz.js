import { enableDayMode } from './lighting.js';
import { getUI } from './ui.js';
import { tScenario, getLang } from './i18n.js';   // ← NEU

export function buildQuiz(scenario) {
    const ui = getUI();

    ui.quizQuestion.textContent = tScenario(scenario, 'question');
    ui.answerGrid.innerHTML = '';

    const answers = tScenario(scenario, 'answers');
    answers.forEach((text, i) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = text;
        btn.onclick = () => handleAnswer(i, scenario);
        ui.answerGrid.appendChild(btn);
    });
}

export function handleAnswer(chosen, scenario) {
    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
        btn.disabled = true;
        if (i === scenario.correctIndex) btn.classList.add('correct');
        else if (i === chosen)           btn.classList.add('wrong');
    });

    setTimeout(() => {
        enableDayMode();
        setTimeout(() => showResult(chosen === scenario.correctIndex, scenario), 1600);
    }, 500);
}

function showResult(isCorrect, scenario) {
    const ui = getUI();

    if (window.recordScenarioAnswer) window.recordScenarioAnswer(scenario.id, isCorrect);
    if (window.renderMenu) window.renderMenu();

    ui.quizPanel.classList.add('hidden');
    ui.resultOverlay.classList.remove('hidden');
    ui.resultIcon.textContent  = isCorrect ? '✅' : '❌';

    ui.resultTitle.textContent = isCorrect
        ? tScenario(scenario, 'resultCorrect') ?? 'Richtig!'
        : tScenario(scenario, 'resultWrong')   ?? 'Leider falsch.';
    ui.resultTitle.className   = 'result-title ' + (isCorrect ? 'correct' : 'wrong');

    ui.resultExplanation.textContent = tScenario(scenario, 'explanation');
    ui.resultRule.textContent        = tScenario(scenario, 'rule');
}
