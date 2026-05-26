import * as THREE from 'three';

export const SECTORS = {
    MASTHEAD:  { center: 0,      halfAngle: 112.5 },
    PORT:      { center: -56.25, halfAngle: 56.25 }, 
    STARBOARD: { center: 56.25,  halfAngle: 56.25 }, 
    STERN:     { center: 180,    halfAngle: 67.5 },
    TOW:       { center: 180,    halfAngle: 67.5 },
    ALL_ROUND: null,
};

export function addNavLight(
    parentGroup,
    colorHex,
    x, y, z,
    sectorKey = null,
    intensity = 3,
    distance = 80,
    size = 0.38
) {
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(x, y, z);
    bulbGroup.name = 'navBulbMesh';

    bulbGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(size, 12, 12),
        new THREE.MeshBasicMaterial({ color: colorHex })
    ));

    const sector = (sectorKey && sectorKey !== 'ALL_ROUND') ? SECTORS[sectorKey] : null;

    if (sector) {
        bulbGroup.userData = {
            isSectorLight: true,
            centerRad: THREE.MathUtils.degToRad(sector.center),
            halfAngleRad: THREE.MathUtils.degToRad(sector.halfAngle),
        };
    }

    parentGroup.add(bulbGroup);

    if (!sector) {
        const pl = new THREE.PointLight(colorHex, intensity, distance);
        pl.position.set(x, y, z);
        parentGroup.add(pl);
        return;
    }

    const spot = new THREE.SpotLight(colorHex, intensity, distance);
    spot.position.set(x, y, z);
    
    spot.angle = Math.min(THREE.MathUtils.degToRad(sector.halfAngle), Math.PI / 2);
    spot.penumbra = 1.0; 
    spot.decay = 1;;

    const rad = THREE.MathUtils.degToRad(sector.center);
    const target = new THREE.Object3D();
    target.position.set(
        x + Math.sin(rad) * 20, 
        y, 
        z - Math.cos(rad) * 20
    );

    parentGroup.add(spot);
    parentGroup.add(target);
    spot.target = target;

    const softGlow = new THREE.PointLight(colorHex, intensity * 0.2, distance * 0.3);
    softGlow.position.set(x, y, z);
    parentGroup.add(softGlow);
}