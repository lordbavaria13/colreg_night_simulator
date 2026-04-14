import * as THREE from 'three';
import { addNavLight } from './navBulb.js';

export function createPlayerBoat() {
    const g = new THREE.Group();
    
    const mat = (c) => new THREE.MeshPhongMaterial({ 
        color: c,
        emissive: c,
        emissiveIntensity: 0.15
    });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 7), mat(0x445566));
    g.add(hull);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2, 1.3, 3), mat(0x556677));
    cabin.position.set(0, 1.4, -0.5);
    g.add(cabin);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 5, 6), mat(0x888899));
    mast.position.set(0, 3.6, -0.5);
    g.add(mast);

    const deckLight = new THREE.PointLight(0xcceeff, 1.5, 25);
    deckLight.position.set(0, 5, 0);
    g.add(deckLight);

    addNavLight(g, 0xff0000, -1.6, 0.9, 2.5, 'PORT', 0.6, 10, 0.25);
    addNavLight(g, 0x00ff00, 1.6, 0.9, 2.5, 'STARBOARD', 0.6, 10, 0.25);
    addNavLight(g, 0xffffff, 0, 0.9, 3.2, 'STERN', 0.6, 10, 0.25);

    g.position.y = 1.2;
    return g;
}