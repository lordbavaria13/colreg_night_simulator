export const state = {
    scene: null,
    camera: null,
    cameraMode: 'firstPerson',
    renderer: null,
    controls: null,
    ambientLight: null,

    waterMat: null,
    wPos: null,
    origWZ: null,

    playerBoat: null,
    targetShip: null,
    currentScenario: null,

    isDayMode: false,
    keys: {},

    currentRoute: null,
    routeT: 0,

    // true wenn die Seite per App-Bridge direkt mit einer scenarioId
    // gestartet wurde (Deep-Link aus einer Quizfrage heraus)
    deepLinked: false,
};