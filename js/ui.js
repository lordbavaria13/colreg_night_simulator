export function getUI() {
    return {
        mainMenu: document.getElementById('main-menu'),
        loadingScreen: document.getElementById('loading-screen'),
        hud: document.getElementById('hud'),
        hudScenarioName: document.getElementById('hud-scenario-name'),
        quizPanel: document.getElementById('quiz-panel'),
        quizQuestion: document.getElementById('quiz-question'),
        answerGrid: document.getElementById('answer-grid'),
        resultOverlay: document.getElementById('result-overlay'),
        resultIcon: document.getElementById('result-icon'),
        resultTitle: document.getElementById('result-title'),
        resultExplanation: document.getElementById('result-explanation'),
        resultRule: document.getElementById('result-rule'),
    };
}