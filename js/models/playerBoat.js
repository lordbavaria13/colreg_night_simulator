import * as THREE from 'three';
import { addNavLight } from './navBulb.js';

const textureLoader = new THREE.TextureLoader();
const woodTexture = textureLoader.load('./assets/textures/oak_veneer_01_diff_4k.jpg');
const metalTexture = textureLoader.load('./assets/textures/green_metal_rust_rough_4k.jpg');
const plasticBlueTexture = textureLoader.load('./assets/textures/plastered_wall_05_diff_4k.jpg');
const plasticWhiteTexture = textureLoader.load('./assets/textures/plastered_wall_05_ao_4k.jpg');

const matWood = new THREE.MeshStandardMaterial({ 
    map: woodTexture,
    roughness: 0.8 // Holz glänzt nicht stark
});

const matMetal = new THREE.MeshStandardMaterial({ 
    map: metalTexture,
    roughness: 0.6,
    metalness: 0.8
});

const matPlasticBlue = new THREE.MeshStandardMaterial({ 
    map: plasticBlueTexture,
    roughness: 0.7,
    metalness: 0.2
});

const matPlasticWhite = new THREE.MeshStandardMaterial({ 
    map: plasticWhiteTexture,
    roughness: 0.7,
    metalness: 0.1
});

export let steeringWheel = null;
export let cameraAnchor = null;

export function createPlayerBoat() {
    const g = new THREE.Group();

    const mat = (c, opts = {}) => new THREE.MeshPhongMaterial({ 
        color: c,
        emissive: c,
        emissiveIntensity: 0.1,
        side: THREE.DoubleSide, 
        ...opts
    });

    
    // Rumpf
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, 4.5); 
    hullShape.quadraticCurveTo(1.5, 2.0, 1.4, -4.5); 
    hullShape.lineTo(-1.4, -4.5);
    hullShape.quadraticCurveTo(-1.5, 2.0, 0, 4.5);

    const extrudeSettings = {
        depth: 1.6,          // Höhe des Rumpfes
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 2,
        bevelSize: 0.2,      // Abrundung oben/unten
        bevelThickness: 0.3
    };

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    hullGeo.rotateX(Math.PI / 2); 
    hullGeo.translate(0, 1.1, 0); 
    
    const hull = new THREE.Mesh(hullGeo, matPlasticBlue);
    g.add(hull);

    const deckShape = new THREE.Shape();
    deckShape.moveTo(0, 4.3); 
    deckShape.quadraticCurveTo(1.3, 2.0, 1.2, -4.3); 
    deckShape.lineTo(-1.2, -4.3);
    deckShape.quadraticCurveTo(-1.3, 2.0, 0, 4.3);
    
    const deckGeo = new THREE.ShapeGeometry(deckShape);
    deckGeo.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeo, matPlasticWhite);
    deck.position.y = 1.25;

    // Kabine
    const cabinShape = new THREE.Shape();
    cabinShape.moveTo(0, 1.5);
    cabinShape.quadraticCurveTo(0.8, 0.5, 0.8, -1.5);
    cabinShape.lineTo(-0.8, -1.5);
    cabinShape.quadraticCurveTo(-0.8, 0.5, 0, 1.5);

    const cabinExtrude = { depth: 0.6, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 };
    const cabinGeo = new THREE.ExtrudeGeometry(cabinShape, cabinExtrude);
    cabinGeo.rotateX(Math.PI / 2);
    const cabin = new THREE.Mesh(cabinGeo, mat(0xdddddd));
    cabin.position.set(0, 1.8, 0); // Über dem Deck
    g.add(cabin);

    // Mast
    const mastGeo = new THREE.CylinderGeometry(0.06, 0.1, 10, 16);
    const mast = new THREE.Mesh(mastGeo, matMetal);
    mast.position.set(0, 6.2, 0.5); // Leicht vor der Mitte
    g.add(mast);

    const boomGeo = new THREE.CylinderGeometry(0.05, 0.05, 4.5, 12);
    boomGeo.rotateX(Math.PI / 2);
    const boom = new THREE.Mesh(boomGeo, matMetal);
    boom.position.set(0, 4.0, -1.7); // Ragt nach hinten
    g.add(boom);

    // Steuerrad
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(0, 2.2, -3.0); 

    const points = [];
    for ( let i = 0; i <= 10; i ++ ) {
        const angle = (i / 10) * Math.PI * 2;
        points.push(new THREE.Vector2(0.6 + Math.cos(angle)*0.04, Math.sin(angle)*0.04));
    }
    const rimGeo = new THREE.LatheGeometry(points, 32);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, matWood); // Holzfarbe
    wheelGroup.add(rim);

    // Nabe
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16), matMetal);
    hub.rotation.x = Math.PI / 2;
    wheelGroup.add(hub);

    // Speichen
    for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), matWood);
        spoke.rotation.z = (i / 6) * Math.PI * 2;
        wheelGroup.add(spoke);
    }

    // Steuersäule
    const columnGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.0, 16);
    const column = new THREE.Mesh(columnGeo, matMetal);
    column.position.set(0, 1.8, -2.9);
    // Säule leicht nach hinten geneigt
    column.rotation.x = 0.2; 
    g.add(column);

    g.add(wheelGroup);
    steeringWheel = wheelGroup; // Exportiert für die Animation

    // Segel
            const sailShape = new THREE.Shape();
            sailShape.moveTo(0, 0);       // Mast unten
            sailShape.lineTo(0, 8);       // Mast oben
            sailShape.quadraticCurveTo(2, 4, 4.8, 0); // Geschwungene Achterliek (Außenkante)
            sailShape.lineTo(0, 0);
            
            const sailGeo = new THREE.ShapeGeometry(sailShape);
            const sail = new THREE.Mesh(sailGeo, mat(0xf9f9f9));
            sail.position.set(0, 4.1, 0.4); // Leicht hinter dem Mast
            sail.rotation.y = Math.PI/2; // Segel leicht vom Wind zur Seite geblasen
            g.add(sail);

    // ==========================================
    // 5. KAMERA-ANKER (First-Person)
    // ==========================================
    
    cameraAnchor = new THREE.Object3D();
    cameraAnchor.position.set(0, 2.7, -4.2); 
    g.add(cameraAnchor);

    // ==========================================
    // 6. BELEUCHTUNG & NAVIGATION
    // ==========================================
    
    const deckLight = new THREE.PointLight(0xffffee, 1.0, 15);
    deckLight.position.set(0, 4, -1);
    g.add(deckLight);

    // Positionen angepasst an den neuen Rumpf
    addNavLight(g, 0xff0000, -1.3, 1.4, 1.5, 'PORT', 0.5, 10, 0.2);
    addNavLight(g, 0x00ff00, 1.3, 1.4, 1.5, 'STARBOARD', 0.5, 10, 0.2);
    addNavLight(g, 0xffffff, 0, 14, 0.5, 'MASTHEAD', 0.6, 15, 0.2);
    addNavLight(g, 0xffffff, 0, 1.3, -4.5, 'STERN', 0.5, 10, 0.2);

    g.rotateY(Math.PI);
    return g;
}
