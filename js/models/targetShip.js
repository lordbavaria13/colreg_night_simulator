import * as THREE from 'three';
import { addNavLight } from './navBulb.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();

function loadGLB(path, { scale = [1,1,1], rotationY = 0, positionY = 0 } = {}) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(path, (gltf) => {
      const model = gltf.scene;
      model.scale.set(...scale);
      model.rotation.y = rotationY;
      model.position.y = positionY;
      model.traverse((child) => {
        if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
      });
      resolve(model);
    }, undefined, reject);
  });
}

const mat = (c, opts = {}) => new THREE.MeshBasicMaterial({
  color: new THREE.Color(c).multiplyScalar(0.35),
  side: THREE.DoubleSide, ...opts
});

function createHull(length, width, depth, color, {
  bowSharpness = 0.38,
  draft = depth * 0.65,
} = {}) {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hl = length / 2;

  shape.moveTo(0, -hl);
  shape.quadraticCurveTo(hw * bowSharpness, -hl * 0.5, hw, -hl * 0.1);
  shape.lineTo(hw, hl * 0.6);
  shape.lineTo(hw * 0.8, hl);
  shape.lineTo(-hw * 0.8, hl);
  shape.lineTo(-hw, hl * 0.6);
  shape.lineTo(-hw, -hl * 0.1);
  shape.quadraticCurveTo(-hw * bowSharpness, -hl * 0.5, 0, -hl);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSegments: 2,
    steps: 1, bevelSize: 0.15, bevelThickness: 0.15,
  });
  geo.rotateX(Math.PI / 2);

  const mesh = new THREE.Mesh(geo, mat(color));
  mesh.position.y = depth - draft;

  return { mesh, deckY: depth - draft };
}

function box(w, h, d, color, opts) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
}
function cyl(rt, rb, h, color, segs = 12) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat(color));
}

// ---------------------------------------------------------------------------
// motorschiff_gross  (×2)
// Hull L=44, W=12, depth=5, draft=3.5  →  deckY=1.5
// ---------------------------------------------------------------------------
function buildFreighter(g, col) {
  const { mesh: hull, deckY } = createHull(44, 12, 5, col, { draft: 3.5 });
  g.add(hull);
  const deck = deckY;

  const fwdHouse = box(8, 4, 6, 0xccccbb);
  fwdHouse.position.set(0, deck + 2, -6);
  g.add(fwdHouse);

  const aftHouse = box(11, 8, 12, 0xddddcc);
  aftHouse.position.set(0, deck + 4, 12);
  g.add(aftHouse);

  const bridge = box(9, 3, 9, 0xeeeedd);
  bridge.position.set(0, deck + 10, 11);
  g.add(bridge);

  const funnel = cyl(1.1, 1.5, 6, 0xaa2222);
  funnel.position.set(1.6, deck + 11, 15);
  g.add(funnel);

  const foreMast = cyl(0.16, 0.24, 13, 0xaaaaaa);
  foreMast.position.set(0, deck + 6.5, -4);
  g.add(foreMast);

  const aftMast = cyl(0.14, 0.20, 12, 0xaaaaaa);
  aftMast.position.set(0, deck + 4 + 6 + 4.5, 12);
  g.add(aftMast);

  [-5.6, 5.6].forEach(x => {
    const rail = box(0.12, 1, 40, 0x888888);
    rail.position.set(x, deck + 1, 0);
    g.add(rail);
  });
}

// ---------------------------------------------------------------------------
// motorschiff_klein  (×1)
// Hull L=14, W=4, depth=1.8, draft=1.2  →  deckY=0.6
// ---------------------------------------------------------------------------
function buildMotorboat(g, col) {
  const { mesh: hull, deckY } = createHull(14, 4, 1.8, col, {
    bowSharpness: 0.25, draft: 1.2,
  });
  g.add(hull);
  const deck = deckY;

  const cabin = box(3.2, 1.8, 4, 0xeeeeee);
  cabin.position.set(0, deck + 0.9, 1);
  g.add(cabin);

  const roof = box(3.0, 0.3, 3.8, 0xdddddd);
  roof.position.set(0, deck + 1.95, 1);
  g.add(roof);

  const screen = box(3.0, 0.8, 0.06, 0x88aacc, { transparent: true, opacity: 0.4 });
  screen.position.set(0, deck + 1.4, -1.0);
  g.add(screen);

  const mast = cyl(0.06, 0.09, 5.2, 0xbbbbbb);
  mast.position.set(0, deck + 2.6, 2);
  g.add(mast);

  const yard = box(1.5, 0.08, 0.08, 0xaaaaaa);
  yard.position.set(0, deck + 4.5, 2);
  g.add(yard);
}

// ---------------------------------------------------------------------------
// nicht_manoevrierfaehig  (×2)
// Hull L=36, W=11, depth=5, draft=3.8  →  deckY=1.2
// Bug z=-18, Heck z=+18
// Signalmast z=0  →  Rundumlichter y=14/20
// Seitenlichter y=6  z=-4  |  Hecklicht y=6  z=16
// ---------------------------------------------------------------------------
function buildDisabled(g, col) {
  const { mesh: hull, deckY } = createHull(36, 11, 5, col, { draft: 3.8 });
  g.add(hull);
  const deck = deckY; // 1.2

  const house = box(10, 7, 11, 0xccccbb);
  house.position.set(0, deck + 3.5, 4);
  g.add(house);

  const bridge = box(8, 2.4, 8, 0xddddcc);
  bridge.position.set(0, deck + 8.2, 3.8);
  g.add(bridge);

  const funnel = cyl(1.0, 1.3, 5, 0x882222);
  funnel.position.set(0.6, deck + 9, 5.5);
  g.add(funnel);

  // Signalmast: h=21 → Spitze bei deck+22.2 ≈ 23.4
  const sigMast = cyl(0.18, 0.26, 21, 0xaaaaaa);
  sigMast.position.set(0, deck + 10.5, 0);
  g.add(sigMast);

  const sigYard = box(3.6, 0.24, 0.24, 0x999999);
  sigYard.position.set(0, deck + 20, 0);
  g.add(sigYard);

  [-5.2, 5.2].forEach(x => {
    const rail = box(0.12, 1, 32, 0x888888);
    rail.position.set(x, deck + 1, 0);
    g.add(rail);
  });

  g.rotation.z = THREE.MathUtils.degToRad(4);
}

// ---------------------------------------------------------------------------
// schleppverband  (×2)
// Hull L=32, W=11, depth=4.6, draft=3.2  →  deckY=1.4
// Heck z=+16  →  Schlepptrosse beginnt bei z=18
// Geschlepptes Objekt (Barge) bei z=+80
// ---------------------------------------------------------------------------
function buildTugboat(g, col) {
  const { mesh: hull, deckY } = createHull(32, 11, 4.6, col, {
    bowSharpness: 0.3, draft: 3.2,
  });
  g.add(hull);
  const deck = deckY; // 1.4

  const mainHouse = box(10, 9, 10, 0xddccbb);
  mainHouse.position.set(0, deck + 4.5, 6);
  g.add(mainHouse);

  const bridge = box(8.4, 3.6, 8, 0xeeddcc);
  bridge.position.set(0, deck + 10.8, 5.6);
  g.add(bridge);

  const funnel = cyl(1.3, 1.7, 5.6, 0x223355);
  funnel.position.set(1.2, deck + 11.6, 10);
  g.add(funnel);

  const ring = cyl(1.36, 1.36, 0.8, 0xffffff);
  ring.position.set(1.2, deck + 13.8, 10);
  g.add(ring);

  const bollard = cyl(0.4, 0.4, 1.2, 0x555555);
  bollard.position.set(0, deck + 0.6, -12);
  g.add(bollard);

  const mast = cyl(0.16, 0.26, 28, 0xbbbbbb);
  mast.position.set(0, deck + 14, 12);
  g.add(mast);

  [16, 22, 28].forEach(y => {
    const mastYard = box(3.2, 0.2, 0.2, 0xaaaaaa);
    mastYard.position.set(0, y, 12);
    g.add(mastYard);
  });

  const towArch = box(9, 0.3, 0.3, 0x666655);
  towArch.position.set(0, deck + 2.4, -10);
  g.add(towArch);


    // Schlepptrosse: z=16 bis z=48 (halbiert)
  const towLineLength = 32;
  const towLine = cyl(0.08, 0.08, towLineLength, 0x444433);
  towLine.rotation.x = Math.PI / 2;
  towLine.position.set(0, deck - 0.3, 16 + towLineLength / 2); // Mitte bei z=32
  g.add(towLine);

  // Barge bei z=48 (war z=80)
  const { mesh: bargeHull, deckY: bargeDeck } = createHull(28, 10, 3.0, 0x445566, { draft: 2.5 });
  bargeHull.position.z = 48;
  g.add(bargeHull);

  [[0, 0], [6, 0], [-6, 0], [0, 6]].forEach(([bx, bz]) => {
    const crate = box(4, 2.5, 4, 0x667755);
    crate.position.set(bx, bargeDeck + 1.25, 48 + bz);
    g.add(crate);
  });

  const bargebollard = cyl(0.3, 0.3, 1.0, 0x555555);
  bargebollard.position.set(0, bargeDeck + 0.5, 48 - 14);
  g.add(bargebollard);

}

// ---------------------------------------------------------------------------
// segelfahrzeug  (×1)
// Hull L=12, W=3.5, depth=2.5, draft=2.1  →  deckY=0.4
// Seitenlichter y=3 z=-2  |  Hecklicht y=3 z=5
// ---------------------------------------------------------------------------
function buildSailboat(g, col) {
  const { mesh: hull, deckY } = createHull(12, 3.5, 2.5, col, {
    bowSharpness: 0.2, draft: 2.1,
  });
  g.add(hull);
  const deck = deckY; // 0.4

  const cabin = box(2.2, 0.9, 3.5, 0xdddddd);
  cabin.position.set(0, deck + 0.45, 1);
  g.add(cabin);

  // Mast bei z=-1
  const mast = cyl(0.07, 0.1, 12, 0xe0e0e0, 16);
  mast.position.set(0, deck + 6, -1);
  g.add(mast);

  // Boom: Group am Mast (Drehachse = Mastposition z=-1)
  const boomGroup = new THREE.Group();
  boomGroup.position.set(0, deck + 1.2, -1);
  boomGroup.rotation.y = Math.PI / 7;
  const boomMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 5),
    mat(0xd0d0d0)
  );
  boomMesh.position.set(0, 0, 2.5); // ragt 5 Einheiten nach hinten vom Mast
  boomGroup.add(boomMesh);
  g.add(boomGroup);

  // Segel: Ursprung = Mastposition (x=0.05, z=-1.0), dreht um denselben Winkel
  const sailShape = new THREE.Shape();
  sailShape.moveTo(0, 0);
  sailShape.lineTo(0, 9);
  sailShape.quadraticCurveTo(2, 4, 4.8, 0);
  sailShape.lineTo(0, 0);

  const sail = new THREE.Mesh(
    new THREE.ShapeGeometry(sailShape),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xf5f5f0).multiplyScalar(0.35),
      side: THREE.DoubleSide,
    })
  );
  sail.position.set(0.05, deck + 1.2, -1.0);
  sail.rotation.y = -Math.PI / 7 * 2;
  g.add(sail);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export function createTargetShip(scenario) {
  return new Promise(async (resolve) => {
    const g = new THREE.Group();
    const col = new THREE.Color(scenario.shipColor);

    if (scenario.id === 'trawler') {
      try {
        const model = await loadGLB('./assets/models/fishing_boat_01.glb', {
          scale: [2, 2, 2],
          rotationY: -Math.PI / 2,
          positionY: 2,
        });
        g.add(model);
      } catch (e) {
        console.error('Trawler-Modell nicht geladen:', e);
        g.add(createHull(15, 5, 2.0, col, { draft: 1.3 }).mesh);
      }

    } else if (scenario.id === 'segelfahrzeug') {
      buildSailboat(g, col);

    } else if (scenario.id === 'motorschiff_gross') {
      buildFreighter(g, col);

    } else if (scenario.id === 'motorschiff_klein') {
      buildMotorboat(g, col);

    } else if (scenario.id === 'nicht_manoevrierfaehig') {
      buildDisabled(g, col);

    } else if (scenario.id === 'schleppverband') {
      buildTugboat(g, col);

    } else {
      g.add(createHull(10, 3.5, 1.5, col, { draft: 1.0 }).mesh);
    }

    scenario.lights.forEach(l => {
      addNavLight(g, l.color, l.x, l.y, l.z, l.sector ?? null);
    });

    resolve(g);
  });
}