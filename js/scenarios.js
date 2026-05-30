// ================================================================
//  KOORDINATENSYSTEM (targetShip nach rotateY(Math.PI)):
//    Bug  = -Z  (voraus)
//    Heck = +Z  (achtern)
//    Backbord   = -X (port)
//    Steuerbord = +X (starboard)
//
//  Tiefgang (draft): Rumpf taucht unter y=0 (Wasserlinie).
//  Deck sichtbar bei deckY = depth - draft.
//
//  Schiff              | Hull              | depth | draft | deckY
//  --------------------+-------------------+-------+-------+------
//  motorschiff_gross   | L=44 W=12         |  5.0  |  3.5  |  1.5
//  motorschiff_klein   | L=14 W=4          |  1.8  |  1.2  |  0.6
//  nicht_manoevr.      | L=18 W=5.5        |  2.2  |  1.5  |  0.7
//  schleppverband      | L=32 W=11         |  4.6  |  3.2  |  1.4
//  segelfahrzeug       | L=12 W=3.5        |  1.2  |  0.8  |  0.4
//  trawler             | GLB scale=2 posY=2| —     |  —    |  —
//
//  Sector keys:
//    'MASTHEAD'   225° Voraussektor
//    'PORT'       112.5° Backbordsektor
//    'STARBOARD'  112.5° Steuerbordssektor
//    'STERN'      135° Hecksektor (weiß)
//    'TOW'        135° Hecksektor (gelb, Schleppfahrzeug)
//    'ALL_ROUND'  360° (PointLight)
// ================================================================

export const SCENARIOS = [
    {
        id: 'motorschiff_gross',
        title: 'Motorschiff > 50 m',
        titleEn: 'Power-driven vessel > 50 m',
        cardDesc: 'Großes Motorschiff über 50 m Länge',
        cardDescEn: 'Large power-driven vessel over 50 m in length',
        lights: [
            { color: 0xffffff, x:  0,  y: 14, z:  -4, sector: 'MASTHEAD',  label: 'Topplicht vorne (tiefer)',    labelEn: 'Masthead light forward (lower)' },
            { color: 0xffffff, x:  0,  y: 20, z:  12, sector: 'MASTHEAD',  label: 'Topplicht achtern (höher)',   labelEn: 'Masthead light aft (higher)' },
            { color: 0xff0000, x: -6,  y:  6, z:  -4, sector: 'PORT',      label: 'Backbord (rot)',              labelEn: 'Port (red)' },
            { color: 0x00ff00, x:  6,  y:  6, z:  -4, sector: 'STARBOARD', label: 'Steuerbord (grün)',           labelEn: 'Starboard (green)' },
            { color: 0xffffff, x:  0,  y:  6, z:  20, sector: 'STERN',     label: 'Hecklicht (weiß)',            labelEn: 'Stern light (white)' },
        ],
        lightDots: ['#ffffff', '#ffffff', '#ff4444', '#44ff44', '#ffffff'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        questionEn: 'What type of vessel is approaching?',
        answers:   ['Segelfahrzeug', 'Fischereifahrzeug (Trawler)', 'Motorschiff > 50 m', 'Nicht manövrierfähig'],
        answersEn: ['Sailing vessel', 'Fishing vessel (trawler)', 'Power-driven vessel > 50 m', 'Vessel not under command'],
        correctIndex: 2,
        explanation:   'Zwei weiße Topplichter (vorderes tiefer, hinteres höher) + rotes/grünes Seitenlicht = Maschinenfahrzeug über 50 m Länge.',
        explanationEn: 'Two white masthead lights (forward lower, aft higher) + red/green sidelights = power-driven vessel over 50 m.',
        rule: 'KVR Regel 23 (a)(i) + (a)(ii)',
        ruleEn: 'COLREG Rule 23 (a)(i) + (a)(ii)',
        shipColor: 0x1a3a6e,
        yawOffset: 0,
    },

    {
        id: 'segelfahrzeug',
        title: 'Segelfahrzeug',
        titleEn: 'Sailing vessel',
        cardDesc: 'Segelboot unter Segeln (ohne Motor)',
        cardDescEn: 'Sailing vessel under sail (engine off)',
        lights: [
            { color: 0xff0000, x: -1.7, y: 0.8, z: -2, sector: 'PORT',      label: 'Backbord (rot)',    labelEn: 'Port (red)' },
            { color: 0x00ff00, x:  1.7, y: 0.8, z: -2, sector: 'STARBOARD', label: 'Steuerbord (grün)', labelEn: 'Starboard (green)' },
            { color: 0xffffff, x:  0,   y: 0.8, z:  5, sector: 'STERN',     label: 'Hecklicht (weiß)',  labelEn: 'Stern light (white)' },
        ],
        lightDots: ['#ff4444', '#44ff44', '#ffffff'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        questionEn: 'What type of vessel is approaching?',
        answers:   ['Motorschiff > 50 m', 'Segelfahrzeug', 'Fischereifahrzeug (Trawler)', 'Motorschiff < 50 m'],
        answersEn: ['Power-driven vessel > 50 m', 'Sailing vessel', 'Fishing vessel (trawler)', 'Power-driven vessel < 50 m'],
        correctIndex: 1,
        explanation:   'Nur Seitenlichter (rot/grün) + Hecklicht, KEIN Topplicht = Segelfahrzeug unter Segeln.',
        explanationEn: 'Sidelights (red/green) + stern light only, NO masthead light = sailing vessel under sail.',
        rule: 'KVR Regel 25 (a)',
        ruleEn: 'COLREG Rule 25 (a)',
        shipColor: 0x2d5a1b,
        yawOffset: 0,
    },

    {
        id: 'trawler',
        title: 'Fischereifahrzeug (Trawler)',
        titleEn: 'Fishing vessel (trawler)',
        cardDesc: 'Trawler beim Schleppnetzfischen',
        cardDescEn: 'Trawler engaged in trawling',
        lights: [
            { color: 0x00ff88, x:  0,    y: 20,  z:  -8.8, sector: 'ALL_ROUND', label: 'Grünes Rundumlicht (oben)',  labelEn: 'Green all-round light (top)' },
            { color: 0xffffff, x:  0,    y: 12,  z:  -8.8, sector: 'ALL_ROUND', label: 'Weißes Rundumlicht (unten)', labelEn: 'White all-round light (bottom)' },
            { color: 0xff0000, x: -2.1,  y:  5,  z:   1.4, sector: 'PORT',      label: 'Backbord (rot)',             labelEn: 'Port (red)' },
            { color: 0x00ff00, x:  2.1,  y:  5,  z:   1.4, sector: 'STARBOARD', label: 'Steuerbord (grün)',          labelEn: 'Starboard (green)' },
            { color: 0xffffff, x:  0,    y:  1.5, z: 16,   sector: 'STERN',     label: 'Hecklicht (weiß)',           labelEn: 'Stern light (white)' },
        ],
        lightDots: ['#44ffaa', '#ffffff', '#ff4444', '#44ff44', '#ffffff'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        questionEn: 'What type of vessel is approaching?',
        answers:   ['Motorschiff < 50 m', 'Segelfahrzeug', 'Nicht manövrierfähig', 'Fischereifahrzeug (Trawler)'],
        answersEn: ['Power-driven vessel < 50 m', 'Sailing vessel', 'Vessel not under command', 'Fishing vessel (trawler)'],
        correctIndex: 3,
        explanation:   'Grünes Rundumlicht ÜBER weißem Rundumlicht + Seitenlichter = Trawler (fischend mit Schleppnetz).',
        explanationEn: 'Green all-round light ABOVE white all-round light + sidelights = trawler engaged in trawling.',
        rule: 'KVR Regel 26 (b)',
        ruleEn: 'COLREG Rule 26 (b)',
        shipColor: 0x5a3a1a,
        yawOffset: 0,
    },

    {
        id: 'nicht_manoevrierfaehig',
        title: 'Nicht manövrierfähig',
        titleEn: 'Vessel not under command',
        cardDesc: 'Havariertes Fahrzeug — manövrierunfähig',
        cardDescEn: 'Vessel unable to manoeuvre due to exceptional circumstances',
        lights: [
        { color: 0xff0000, x:  0,  y: 20, z:  0, sector: 'ALL_ROUND', label: '1. Rotes Rundumlicht (oben)',  labelEn: '1st red all-round light (top)' },
        { color: 0xff0000, x:  0,  y: 14, z:  0, sector: 'ALL_ROUND', label: '2. Rotes Rundumlicht (unten)', labelEn: '2nd red all-round light (bottom)' },
        { color: 0xff0000, x: -6,  y:  2.5, z: -4, sector: 'PORT',      label: 'Backbord (rot)',               labelEn: 'Port (red)' },
        { color: 0x00ff00, x:  6,  y:  2.5, z: -4, sector: 'STARBOARD', label: 'Steuerbord (grün)',            labelEn: 'Starboard (green)' },
        { color: 0xffffff, x:  0,  y:  6, z: 16, sector: 'STERN',     label: 'Hecklicht (weiß)',             labelEn: 'Stern light (white)' },
    ],
        lightDots: ['#ff2222', '#ff2222', '#ff4444', '#44ff44'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        questionEn: 'What type of vessel is approaching?',
        answers:   ['Fischereifahrzeug (Trawler)', 'Motorschiff > 50 m', 'Nicht manövrierfähig', 'Schleppverband'],
        answersEn: ['Fishing vessel (trawler)', 'Power-driven vessel > 50 m', 'Vessel not under command', 'Towing vessel'],
        correctIndex: 2,
        explanation:   'Zwei rote Rundumlichter übereinander + Seitenlichter (wenn Fahrt) = Fahrzeug manövrierunfähig.',
        explanationEn: 'Two red all-round lights in a vertical line + sidelights (when making way) = vessel not under command.',
        rule: 'KVR Regel 27 (a)',
        ruleEn: 'COLREG Rule 27 (a)',
        shipColor: 0x3a1a1a,
        yawOffset: 0,
    },

    {
        id: 'motorschiff_klein',
        title: 'Motorschiff < 50 m',
        titleEn: 'Power-driven vessel < 50 m',
        cardDesc: 'Kleines Motorboot unter 50 m Länge',
        cardDescEn: 'Small power-driven vessel under 50 m in length',
        lights: [
            { color: 0xffffff, x:  0, y: 5, z:  2, sector: 'MASTHEAD',  label: 'Topplicht (1×, mittig-vorne)', labelEn: 'Masthead light (1×, forward)' },
            { color: 0xff0000, x: -2, y: 1, z: -2, sector: 'PORT',      label: 'Backbord (rot)',               labelEn: 'Port (red)' },
            { color: 0x00ff00, x:  2, y: 1, z: -2, sector: 'STARBOARD', label: 'Steuerbord (grün)',            labelEn: 'Starboard (green)' },
            { color: 0xffffff, x:  0, y: 1, z:  6, sector: 'STERN',     label: 'Hecklicht (weiß)',             labelEn: 'Stern light (white)' },
        ],
        lightDots: ['#ffffff', '#ff4444', '#44ff44', '#ffffff'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        questionEn: 'What type of vessel is approaching?',
        answers:   ['Segelfahrzeug', 'Motorschiff > 50 m', 'Fischereifahrzeug', 'Motorschiff < 50 m'],
        answersEn: ['Sailing vessel', 'Power-driven vessel > 50 m', 'Fishing vessel', 'Power-driven vessel < 50 m'],
        correctIndex: 3,
        explanation:   'EIN weißes Topplicht (vorne) + Seitenlichter + Hecklicht = Maschinenfahrzeug unter 50 m Länge.',
        explanationEn: 'ONE white masthead light (forward) + sidelights + stern light = power-driven vessel under 50 m.',
        rule: 'KVR Regel 23 (a)(i)',
        ruleEn: 'COLREG Rule 23 (a)(i)',
        shipColor: 0x2a4a6e,
        yawOffset: 0,
    },

    {
        id: 'schleppverband',
        title: 'Schleppverband > 200 m',
        titleEn: 'Towing vessel > 200 m',
        cardDesc: 'Schlepper mit Schleppzug über 200 m',
        cardDescEn: 'Vessel towing with tow length exceeding 200 m',
lights: [
    { color: 0xffffff, x:  0,  y: 16, z:  12, sector: 'MASTHEAD',  label: 'Topplicht 1 (unten)',          labelEn: 'Masthead light 1 (bottom)' },
    { color: 0xffffff, x:  0,  y: 22, z:  12, sector: 'MASTHEAD',  label: 'Topplicht 2 (mitte)',          labelEn: 'Masthead light 2 (middle)' },
    { color: 0xffffff, x:  0,  y: 28, z:  12, sector: 'MASTHEAD',  label: 'Topplicht 3 (oben)',           labelEn: 'Masthead light 3 (top)' },
    { color: 0xffffff, x:  0,  y:  8, z:  14, sector: 'STERN',     label: 'Hecklicht (weiß)',             labelEn: 'Stern light (white)' },
    { color: 0xffee00, x:  0,  y: 10, z:  14, sector: 'TOW',       label: 'Schlepplicht (gelb, darüber)', labelEn: 'Towing light (yellow, above)' },
    { color: 0xff0000, x: -6,  y:  6, z:  -4, sector: 'PORT',      label: 'Backbord (rot)',               labelEn: 'Port (red)' },
    { color: 0x00ff00, x:  6,  y:  6, z:  -4, sector: 'STARBOARD', label: 'Steuerbord (grün)',            labelEn: 'Starboard (green)' },
    { color: 0xff0000, x: -5,  y:  4, z:  35, sector: 'PORT',      label: 'Barge: Backbord (rot)',        labelEn: 'Barge: port (red)' },
    { color: 0x00ff00, x:  5,  y:  4, z:  35, sector: 'STARBOARD', label: 'Barge: Steuerbord (grün)',     labelEn: 'Barge: starboard (green)' },
    { color: 0xffffff, x:  0,  y:  4, z:  62, sector: 'STERN',     label: 'Barge: Hecklicht (weiß)',      labelEn: 'Barge: stern light (white)' },
],
lightDots: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffee00', '#ff4444', '#44ff44', '#ff4444', '#44ff44', '#ffffff'],
        question: 'Welche Art von Fahrzeug nähert sich?',
        questionEn: 'What type of vessel is approaching?',
        answers:   ['Motorschiff > 50 m', 'Fischereifahrzeug', 'Schleppverband (> 200 m)', 'Nicht manövrierfähig'],
        answersEn: ['Power-driven vessel > 50 m', 'Fishing vessel', 'Towing vessel (> 200 m)', 'Vessel not under command'],
        correctIndex: 2,
        explanation:   'DREI weiße Topplichter übereinander + GELBES Hecklicht + Seitenlichter = Schlepper mit Schlepplänge über 200 m.',
        explanationEn: 'THREE white masthead lights vertically + YELLOW stern light + sidelights = towing vessel with tow exceeding 200 m.',
        rule: 'KVR Regel 24 (a)(i) + (a)(iii)',
        ruleEn: 'COLREG Rule 24 (a)(i) + (a)(iii)',
        shipColor: 0x3a3a1a,
        yawOffset: 0,
    },
];
