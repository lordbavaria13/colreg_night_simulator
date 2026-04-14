import { enableDayMode } from './lighting.js';
import { getUI } from './ui.js';

export function buildQuiz(scenario) {
    const ui = getUI();

    ui.quizQuestion.textContent = scenario.question;
    ui.answerGrid.innerHTML = '';

    scenario.answers.forEach((text, i) => {
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
        else if (i === chosen) btn.classList.add('wrong');
    });

    setTimeout(() => {
        enableDayMode();
        setTimeout(() => showResult(chosen === scenario.correctIndex, scenario), 1600);
    }, 500);
}

function showResult(isCorrect, scenario) {
    const ui = getUI();

    ui.quizPanel.classList.add('hidden');
    ui.resultOverlay.classList.remove('hidden');
    ui.resultIcon.textContent = isCorrect ? '✅' : '❌';
    ui.resultTitle.textContent = isCorrect ? 'Richtig!' : 'Leider falsch.';
    ui.resultTitle.className = 'result-title ' + (isCorrect ? 'correct' : 'wrong');
    ui.resultExplanation.textContent = scenario.explanation;
    ui.resultRule.textContent = scenario.rule;
}