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

export function createTargetShip(scenario) {
  return new Promise(async (resolve) => {

    const g = new THREE.Group();
    const col = new THREE.Color(scenario.shipColor);

    const mat = (c, opts = {}) => new THREE.MeshPhongMaterial({
      color: c, side: THREE.DoubleSide, ...opts
    });

    // ==========================================
    // UNIVERSELLER RUMPF-GENERATOR
    // ==========================================
    function createHull(length, width, depth, color) {
      const shape = new THREE.Shape();
      const halfW = width / 2;
      const halfL = length / 2;
      shape.moveTo(0, -halfL);
      shape.quadraticCurveTo(halfW, -halfL * 0.4, halfW, halfL * 0.5);
      shape.lineTo(halfW * 0.8, halfL);
      shape.lineTo(-halfW * 0.8, halfL);
      shape.lineTo(-halfW, halfL * 0.5);
      shape.quadraticCurveTo(-halfW, -halfL * 0.4, 0, -halfL);

      const extrudeSettings = {
        depth, bevelEnabled: true, bevelSegments: 3,
        steps: 1, bevelSize: 0.2, bevelThickness: 0.2
      };
      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, mat(color));
      mesh.position.y = depth;
      return mesh;
    }

    // ==========================================
    // SZENARIO-AUFBAUTEN
    // ==========================================

    if (scenario.id === 'trawler') {
      try {
        const model = await loadGLB('./assets/models/fishing_boat_01.glb', {
          scale: [2, 2, 2],
          rotationY: -Math.PI / 2,
          positionY: 2
        });
        g.add(model);
      } catch (e) {
        console.error('Fehler beim Laden des Trawlers:', e);
        // Fallback: prozeduraler Rumpf
        g.add(createHull(15, 5, 2.0, col));
      }

    } else if (scenario.id === 'motorschiff_gross'
            || scenario.id === 'nicht_manoevrierfaehig'
            || scenario.id === 'schleppverband') {
      // --- GROSSES SCHIFF (Cargo / Schlepper) ---
      const hull = createHull(22, 6, 2.5, col);
      g.add(hull);

      const superstructure = new THREE.Mesh(
        new THREE.BoxGeometry(5, 3.5, 5), mat(0xdddddd)
      );
      superstructure.position.set(0, 4.25, 6);
      g.add(superstructure);

      const funnel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.8, 3, 12), mat(0xaa3333)
      );
      funnel.position.set(0, 6, 7);
      g.add(funnel);

    } else if (scenario.id === 'segelfahrzeug') {
      // --- SEGELBOOT ---
      g.add(createHull(12, 3.5, 1.2, col));

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 3.5), mat(0xdddddd));
      cabin.position.set(0, 1.6, 1);
      g.add(cabin);

      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 12, 16), mat(0xe0e0e0));
      mast.position.set(0, 7.2, -1);
      g.add(mast);

      const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5, 12), mat(0xd0d0d0));
      boom.rotateX(Math.PI / 2);
      boom.position.set(0, 2.5, 1.5);
      g.add(boom);

      const sailShape = new THREE.Shape();
      sailShape.moveTo(0, 0);
      sailShape.lineTo(0, 9);
      sailShape.quadraticCurveTo(2, 4, 4.8, 0);
      sailShape.lineTo(0, 0);
      const sail = new THREE.Mesh(new THREE.ShapeGeometry(sailShape), mat(0xf9f9f9));
      sail.position.set(0, 2.6, -0.9);
      sail.rotation.y = -Math.PI / 10;
      g.add(sail);

    } else if (scenario.id === 'motorschiff_klein') {
      // --- KLEINES MOTORBOOT ---
      g.add(createHull(10, 3.5, 1.5, col));

      const cabinShape = new THREE.Shape();
      cabinShape.moveTo(0, -2.5);
      cabinShape.lineTo(1.2, -1.5);
      cabinShape.lineTo(1.2, 2.5);
      cabinShape.lineTo(-1.2, 2.5);
      cabinShape.lineTo(-1.2, -1.5);
      const cabinGeo = new THREE.ExtrudeGeometry(cabinShape, {
        depth: 1.0, bevelEnabled: true, bevelSize: 0.1
      });
      cabinGeo.rotateX(Math.PI / 2);
      const cabin = new THREE.Mesh(cabinGeo, mat(0xeeeeee));
      cabin.position.set(0, 2.5, 0);
      g.add(cabin);

    } else {
      // --- FALLBACK ---
      g.add(createHull(8, 3, 1.5, col));
    }

    // ==========================================
    // LICHTER (immer am Ende, für alle Szenarien)
    // ==========================================
    scenario.lights.forEach(l => {
      addNavLight(g, l.color, l.x, l.y, l.z, l.sector ?? null);
    });

    resolve(g);
  });
}