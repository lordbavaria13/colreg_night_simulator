// ================================================================
//  i18n.js — Language switching DE / EN
// ================================================================

let currentLang = 'de';

export function setLang(lang) {
    currentLang = lang === 'en' ? 'en' : 'de';
    document.documentElement.lang = currentLang;
}

export function getLang() { return currentLang; }

const UI = {
    de: {
        menuTitle:       'Navigationslichter',
        menuSubtitle:    'Erkenne Fahrzeuge anhand ihrer Lichter',
        startBtn:        'Szenario starten',
        langToggle:      'English',

        selectTitle:     'Wähle ein Szenario',
        selectAll:       'Zufälliges Szenario',

        questionLabel:   'Was siehst du?',
        checkBtn:        'Antwort prüfen',
        nextBtn:         'Weiter →',
        skipBtn:         'Überspringen',
        backBtn:         '← Zurück',

        correct:         '✓ Richtig!',
        wrong:           '✗ Falsch.',
        rulePrefix:      'Regel:',
        rulePrefixEn:    'Rule:',

        resultTitle:     'Ergebnis',
        resultScore:     'Richtig',
        resultOf:        'von',
        resultRetry:     'Nochmal',
        resultMenu:      'Zum Menü',

        legendTitle:     'Sichtbare Lichter',

        compassN:        'V',  
        compassS:        'A',

        scenarioLabel: 'Szenario',

    creditsAbout:       'Ein interaktiver Simulator zum Erlernen der internationalen Kollisionsverhütungsregeln (KVR / COLREGs). Erkenne Fahrzeugtypen anhand ihrer Navigationslichter — so wie in der echten Nachtfahrt.',
    creditsBy:          '👤 Erstellt von',
    creditsAssets:      '🎨 3D-Modelle & Assets',
    creditsAssetText:   '„Fishing boat 01" von',
    creditsLicense:     'Lizenz',
    creditsBasis:       '📚 Grundlage',
    creditsBasisText:   'International Regulations for Preventing Collisions at Sea (COLREGs) 1972, Kollisionsverhütungsregeln (KVR) — IMO',

    shortcutsTitle:     '⌨️ Tastenkürzel',
    shortcutAnswer:     'Antwort auswählen',
    shortcutBack:       'Zurück zum Menü',
    shortcutQuiz:       'Quiz ein-/ausblenden',
    shortcutMouse:      'Kamera drehen / zoomen',
    shortcutTouch:      '1-Finger drehen, 2-Finger zoomen',
    shortcutCamera:     'Kameraperspektive wechseln',

    },
    en: {
        menuTitle:       'Navigation Lights',
        menuSubtitle:    'Identify vessels by their lights',
        startBtn:        'Start scenario',
        langToggle:      'Deutsch',

        selectTitle:     'Choose a scenario',
        selectAll:       'Random scenario',

        questionLabel:   'What do you see?',
        checkBtn:        'Check answer',
        nextBtn:         'Next →',
        skipBtn:         'Skip',
        backBtn:         '← Back',

        correct:         '✓ Correct!',
        wrong:           '✗ Incorrect.',
        rulePrefix:      'Rule:',
        rulePrefixEn:    'Rule:',

        resultTitle:     'Results',
        resultScore:     'Correct',
        resultOf:        'of',
        resultRetry:     'Try again',
        resultMenu:      'Main menu',

        legendTitle:     'Visible lights',

        compassN:        'F', 
        compassS:        'A',

        scenarioLabel: 'Scenario',
        creditsAbout:       'An interactive simulator for learning the International Regulations for Preventing Collisions at Sea (COLREGs). Identify vessel types by their navigation lights — just like in real night navigation.',
    creditsBy:          '👤 Created by',
    creditsAssets:      '🎨 3D Models & Assets',
    creditsAssetText:   '"Fishing boat 01" by',
    creditsLicense:     'License',
    creditsBasis:       '📚 Based on',
    creditsBasisText:   'International Regulations for Preventing Collisions at Sea (COLREGs) 1972 — IMO',

    shortcutsTitle:     '⌨️ Keyboard Shortcuts',
    shortcutAnswer:     'Select answer',
    shortcutBack:       'Back to menu',
    shortcutQuiz:       'Toggle quiz panel',
    shortcutMouse:      'Rotate / zoom camera',
    shortcutTouch:      '1-finger rotate, 2-finger zoom',
    shortcutCamera:     'Switch camera perspective',
    },
};

export function t(key) {
    return UI[currentLang]?.[key] ?? UI['de'][key] ?? key;
}

/**
 * Get localized scenario field
 * @param {object} scenario  – SCENARIOS entry
 * @param {string} field     – e.g. 'title', 'cardDesc', 'question',
 *                              'answers', 'explanation', 'rule'
 */
export function tScenario(scenario, field) {
    if (currentLang === 'en') {
        const enKey = field + 'En';
        if (scenario[enKey] !== undefined) return scenario[enKey];
    }
    return scenario[field];
}

/**
 * Get localized light label
 * @param {object} light  – entry from scenario.lights
 */
export function tLight(light) {
    if (currentLang === 'en' && light.labelEn) return light.labelEn;
    return light.label;
}
