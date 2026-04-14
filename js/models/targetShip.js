import * as THREE      from 'three';
import { addNavLight } from './navBulb.js';

export function createTargetShip(scenario) {
    const g   = new THREE.Group();
    const col = new THREE.Color(scenario.shipColor);
    const mat = (c) => new THREE.MeshPhongMaterial({ color: c });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 18), mat(col));
    g.add(hull);

    const superCol = col.clone().multiplyScalar(1.35);
    const sup = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 8), mat(superCol));
    sup.position.set(0, 2.75, -1);
    g.add(sup);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 14, 6), mat(0x888888));
    mast.position.set(0, 8.5, 2);
    g.add(mast);

    // Navigationslichter
    scenario.lights.forEach(l => {
        addNavLight(g, l.color, l.x, l.y, l.z, l.sector ?? null);
    });

    return g;
}