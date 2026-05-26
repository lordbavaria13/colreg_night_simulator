// ================================================================
//  SCENARIO DATA — COLREGs / KVR navigation-light configurations
//
//  Each light entry includes a `sector` key:
//    'MASTHEAD'   225° forward arc
//    'PORT'       112.5° port-side arc
//    'STARBOARD'  112.5° starboard-side arc
//    'STERN'      135° stern arc (white)
//    'TOW'        135° stern arc (yellow, towing light)
//    'ALL_ROUND'  360° (PointLight)
// ================================================================

export const SCENARIOS = [
    {
        id: 'motorschiff_gross',
        title: 'Motorschiff > 50 m',
        cardDesc: 'Großes Motorschiff über 50 m Länge',
        lights: [
            { color: 0xffffff, x:  0, y:  7, z:  -2, sector: 'MASTHEAD',   label: 'Topplicht vorne (tiefer)' },
            { color: 0xffffff, x:  0, y: 10, z: 6, sector: 'MASTHEAD',   label: 'Topplicht achtern (höher)' },
            { color: 0xff0000, x: -3, y:  3, z:  7, sector: 'PORT',       label: 'Backbord (rot)' },
            { color: 0x00ff00, x:  3, y:  3, z:  7, sector: 'STARBOARD',  label: 'Steuerbord (grün)' },
            { color: 0xffffff, x:  0, y:  3, z: 9, sector: 'STERN',      label: 'Hecklicht (weiß)' },
        ],
        lightDots: ['#ffffff', '#ffffff', '#ff4444', '#44ff44', '#ffffff'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        answers: ['Segelfahrzeug', 'Fischereifahrzeug (Trawler)', 'Motorschiff > 50 m', 'Nicht manövrierfähig'],
        correctIndex: 2,
        explanation: 'Zwei weiße Topplichter (vorderes tiefer, hinteres höher) + rotes/grünes Seitenlicht = Maschinenfahrzeug über 50 m Länge.',
        rule: 'KVR Regel 23 (a)(i) + (a)(ii)',
        shipColor: 0x1a3a6e,
    },
    {
        id: 'segelfahrzeug',
        title: 'Segelfahrzeug',
        cardDesc: 'Segelboot unter Segeln (ohne Motor)',
        lights: [
            { color: 0xff0000, x: -2, y: 3, z:  5, sector: 'PORT',       label: 'Backbord (rot)' },
            { color: 0x00ff00, x:  2, y: 3, z:  5, sector: 'STARBOARD',  label: 'Steuerbord (grün)' },
            { color: 0xffffff, x:  0, y: 3, z: -7, sector: 'STERN',      label: 'Hecklicht (weiß)' },
        ],
        lightDots: ['#ff4444', '#44ff44', '#ffffff'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        answers: ['Motorschiff > 50 m', 'Segelfahrzeug', 'Fischereifahrzeug (Trawler)', 'Motorschiff < 50 m'],
        correctIndex: 1,
        explanation: 'Nur Seitenlichter (rot/grün) + Hecklicht, KEIN Topplicht = Segelfahrzeug unter Segeln. Sobald der Motor läuft, muss ein Topplicht gezeigt werden.',
        rule: 'KVR Regel 25 (a)',
        shipColor: 0x2d5a1b,
    },
    {
        id: 'trawler',
        title: 'Fischereifahrzeug (Trawler)',
        cardDesc: 'Trawler beim Schleppnetzfischen',
        lights: [
            { color: 0x00ff88, x:  0, y:  20, z:  -8.8, sector: 'ALL_ROUND',  label: 'Grünes Rundumlicht (oben)' },
            { color: 0xffffff, x:  0, y:  12, z:  -8.8, sector: 'ALL_ROUND',  label: 'Weißes Rundumlicht (unten)' },
            { color: 0xff0000, x: -2.1, y:  5, z:  1.4, sector: 'PORT',       label: 'Backbord (rot)' },
            { color: 0x00ff00, x:  2.1, y:  5, z:  1.4, sector: 'STARBOARD',  label: 'Steuerbord (grün)' },
            { color: 0xffffff, x:  0, y:  1.5, z: 16, sector: 'STERN',      label: 'Hecklicht (weiß)' },
        ],
        lightDots: ['#44ffaa', '#ffffff', '#ff4444', '#44ff44'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        answers: ['Motorschiff < 50 m', 'Segelfahrzeug', 'Nicht manövrierfähig', 'Fischereifahrzeug (Trawler)'],
        correctIndex: 3,
        explanation: 'Grünes Rundumlicht ÜBER weißem Rundumlicht + Seitenlichter = Trawler (fischend mit Schleppnetz).',
        rule: 'KVR Regel 26 (b)',
        shipColor: 0x5a3a1a,
    },
    {
        id: 'nicht_manoevrierfaehig',
        title: 'Nicht manövrierfähig',
        cardDesc: 'Havariertes Fahrzeug — manövrierunfähig',
        lights: [
            { color: 0xff0000, x:  0, y: 10, z:  0, sector: 'ALL_ROUND',  label: '1. Rotes Rundumlicht (oben)' },
            { color: 0xff0000, x:  0, y:  7, z:  0, sector: 'ALL_ROUND',  label: '2. Rotes Rundumlicht (unten)' },
            { color: 0xff0000, x: -3, y:  3, z:  5, sector: 'PORT',       label: 'Backbord (rot)' },
            { color: 0x00ff00, x:  3, y:  3, z:  5, sector: 'STARBOARD',  label: 'Steuerbord (grün)' },
            
        ],
        lightDots: ['#ff2222', '#ff2222', '#ff4444', '#44ff44'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        answers: ['Fischereifahrzeug (Trawler)', 'Motorschiff > 50 m', 'Nicht manövrierfähig', 'Schleppverband'],
        correctIndex: 2,
        explanation: 'Zwei rote Rundumlichter übereinander (+ Seitenlichter wenn Fahrt gemacht wird) = Fahrzeug manövrierunfähig (z. B. Maschinenausfall, havariert).',
        rule: 'KVR Regel 27 (a)',
        shipColor: 0x3a1a1a,
    },
    {
        id: 'motorschiff_klein',
        title: 'Motorschiff < 50 m',
        cardDesc: 'Kleines Motorboot unter 50 m Länge',
        lights: [
            { color: 0xffffff, x:  0, y:  7, z:  2, sector: 'MASTHEAD',   label: 'Topplicht (1×, mittig-vorne)' },
            { color: 0xff0000, x: -2, y:  3, z:  5, sector: 'PORT',       label: 'Backbord (rot)' },
            { color: 0x00ff00, x:  2, y:  3, z:  5, sector: 'STARBOARD',  label: 'Steuerbord (grün)' },
            { color: 0xffffff, x:  0, y:  3, z: -7, sector: 'STERN',      label: 'Hecklicht (weiß)' },
        ],
        lightDots: ['#ffffff', '#ff4444', '#44ff44', '#ffffff'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        answers: ['Segelfahrzeug', 'Motorschiff > 50 m', 'Fischereifahrzeug', 'Motorschiff < 50 m'],
        correctIndex: 3,
        explanation: 'EIN weißes Topplicht (mittig-vorne) + Seitenlichter + Hecklicht = Maschinenfahrzeug unter 50 m Länge.',
        rule: 'KVR Regel 23 (a)(i)',
        shipColor: 0x2a4a6e,
    },
    {
        id: 'schleppverband',
        title: 'Schleppverband > 200 m',
        cardDesc: 'Schlepper mit Schleppzug über 200 m',
        lights: [
            { color: 0xffffff, x:  0, y:  8, z:  6, sector: 'MASTHEAD',   label: 'Topplicht 1 (unten)' },
            { color: 0xffffff, x:  0, y: 11, z:  6, sector: 'MASTHEAD',   label: 'Topplicht 2 (mitte)' },
            { color: 0xffffff, x:  0, y: 14, z:  6, sector: 'MASTHEAD',   label: 'Topplicht 3 (oben)' },
            { color: 0xffee00, x:  0, y:  5, z: -8, sector: 'TOW',        label: 'Gelbes Hecklicht (Schlepp)' },
            { color: 0xff0000, x: -3, y:  3, z:  7, sector: 'PORT',       label: 'Backbord (rot)' },
            { color: 0x00ff00, x:  3, y:  3, z:  7, sector: 'STARBOARD',  label: 'Steuerbord (grün)' },
        ],
        lightDots: ['#ffffff', '#ffffff', '#ffffff', '#ffee00', '#ff4444', '#44ff44'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        answers: ['Motorschiff > 50 m', 'Fischereifahrzeug', 'Schleppverband (> 200 m)', 'Nicht manövrierfähig'],
        correctIndex: 2,
        explanation: 'DREI weiße Topplichter übereinander + GELBES Hecklicht statt weißem + Seitenlichter = Schleppendes Fahrzeug mit Schlepplänge über 200 m.',
        rule: 'KVR Regel 24 (a)(i) + (a)(iii)',
        shipColor: 0x3a3a1a,
    },
];
