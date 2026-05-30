# Nautical Navigation Lights – Technical Documentation

## Overview

This project is an interactive 3D simulation of nautical navigation lights, implemented in Three.js. The player observes a target vessel from the first-person perspective of their own boat and must correctly identify the traffic situation based on the visible light combinations — as required by the international regulations for preventing collisions at sea (COLREGs).

The following document describes the complete technical implementation, covering nautical basics, the underlying mathematics, the illumination and materials system, and all relevant rendering decisions.

---

## 1. Nautical Basics: Light Sectors

Every vessel is required by law to carry lights that are only visible within specific horizontal angle ranges. An observer can therefore only see the lights whose sector includes their own direction relative to the ship.

| Light      | Color | Sector Center  | Half Angle | Total Angle |
|------------|-------|----------------|------------|-------------|
| Masthead   | White | 0° (ahead)     | ±112.5°    | 225°        |
| Starboard  | Green | +56.25°        | ±56.25°    | 112.5°      |
| Port       | Red   | −56.25°        | ±56.25°    | 112.5°      |
| Stern      | White | 180° (astern)  | ±67.5°     | 135°        |
| All-round  | White | –              | 360°       | 360°        |

---

## 2. Mathematics: Sector Visibility Check

The sector check runs every frame inside `updateLightVisibility()` in `lighting.js`. It determines for each navigation light whether it is currently visible to the camera based on the observer's angle relative to the ship's bow.

### Step 1 – Direction Vector Towards the Camera

```
dirToCam = cameraPosition − lightWorldPosition
dirToCam.y = 0   // only the horizontal plane is relevant
```

The Y component is zeroed out because nautical sector angles are defined purely in the horizontal plane.

### Step 2 – Transform into Local Ship Space

Because the ship rotates freely in the world, the world-space direction vector must be transformed into the ship's local coordinate system using the inverse of the ship's world quaternion:

```
localDir = dirToCam × inverse(shipWorldQuaternion)
```

After this transformation, the ship is treated as if it were aligned with the world axes, which makes the fixed-angle sector check straightforward regardless of the ship's current heading.

### Step 3 – Angle Relative to the Ship's Bow

The ship model faces **−Z** by default. The horizontal angle of the observer relative to the bow is calculated using `atan2`:

```
angleToCam = atan2(localDir.x, localDir.z)
```

The return value of `atan2` ranges from −π to +π:

| Angle  | Meaning           |
|--------|-------------------|
| 0      | directly ahead    |
| +π/2   | starboard (right) |
| −π/2   | port (left)       |
| ±π     | directly astern   |

### Step 4 – Angular Distance to Sector Center

```
diff = |angleToCam − sectorCenter|

// Correct wrap-around at 360°:
if (diff > π) → diff = 2π − diff

// The light is visible when:
visible = diff ≤ (sectorHalfAngle + 0.05)
```

The tolerance of `0.05 rad` (~3°) prevents flickering at sector boundaries where floating-point precision would otherwise cause rapid toggling.

**Why `flipZ = true` for the target ship:**  
The target ship model is rotated 180° on the Y axis (`g.rotateY(Math.PI)`) so the bow faces forward in the scene. This means its local Z axis is flipped. The `flipZ` parameter in `updateLightVisibility()` accounts for this by negating `localDir.z` before computing the angle:

```
const z = flipZ ? -localDirToCam.z : localDirToCam.z;
```

---

## 3. Implementation in Three.js

### `navBulb.js` – Structure of a Navigation Light

Each navigation light is a `THREE.Group` named `navBulbMesh`:

```
navBulbMesh (Group)
├── Mesh (MeshBasicMaterial)     → visible glowing point, always visible
├── SpotLight / PointLight       → illuminates surrounding geometry
└── PointLight (softGlow)        → soft ambient halo around the bulb
```

All components are placed inside the group. Setting `group.visible = false` therefore disables both the visible mesh and the actual light source in a single operation.

**Sector lights** (starboard, port, stern, masthead) use a `THREE.SpotLight` whose opening angle matches the nautical sector:

```js
spot.angle = Math.min(THREE.MathUtils.degToRad(sector.halfAngle), Math.PI / 2);
spot.penumbra = 1.0;  // soft edge
spot.decay = 2;       // physically correct quadratic falloff
```

**All-round lights** use a `THREE.PointLight` instead, since they must illuminate in all directions.

The `softGlow` is a secondary `PointLight` with a short range (`distance * 0.4`) that creates a warm halo effect directly around the bulb without reaching distant geometry.

### `lighting.js` – `updateLightVisibility()`

This function is called every frame for each ship in the scene:

```
for each navBulbMesh group in the ship:
  1. Get the world position of the light
  2. Calculate the direction vector from light to camera (y = 0)
  3. Transform into local ship space using the inverse quaternion
  4. Calculate the angle using atan2
  5. Check the angular distance to the sector center
  6. Set group.visible = true / false
```

Only groups with `userData.isSectorLight = true` are processed. All-round lights (`isSectorLight` not set) are always visible.

---

## 4. Illumination Model and Materials

### The Problem with `MeshPhongMaterial`

The player boat was originally built with `MeshPhongMaterial`. This material uses the **Phong reflection model**, which computes a specular highlight using:

\[ I_s = k_s \cdot (R \cdot V)^n \]

where \(R\) is the reflection vector, \(V\) is the view direction, \(k_s\) is the specular coefficient, and \(n\) is the shininess exponent. At high external light intensities (from the target ship's SpotLights), this formula produces very bright specular hotspots — making the entire boat appear white.

### Solution: `MeshStandardMaterial` with High Roughness

The player boat materials were switched to `MeshStandardMaterial`, which uses the **Physically Based Rendering (PBR)** model. The key parameters:

| Parameter   | Value | Effect                                      |
|-------------|-------|---------------------------------------------|
| `roughness`  | 0.92  | Diffuse scattering — almost no specular highlight |
| `metalness`  | 0.0   | No metallic reflectance                     |

With `roughness = 0.92`, the microfacet BRDF distributes incoming light broadly across the hemisphere, so no concentrated hotspot forms even under intense lights.

### Light Decay: Physical vs. Non-Physical

Three.js supports three decay modes for light sources:

| `decay` | Falloff Formula | Description |
|---------|-----------------|-------------|
| `0`     | constant        | No falloff — light has full intensity at any distance |
| `1`     | linear, \(1/r\) | Unrealistic but predictable |
| `2`     | quadratic, \(1/r^2\) | Physically correct inverse-square law |

**Why `decay = 0` was initially used:**  
When the distance-based intensity scaling system (`t`-parameter) was introduced, `decay = 0` was chosen to ensure the lights were visible at all distances regardless of the actual `distance` parameter. This avoided lights fading to zero before the player could see them.

**Why `decay = 2` is now used:**  
`decay = 0` caused external lights from the target ship to illuminate the player boat at full intensity regardless of separation distance — making it white. With `decay = 2`, the light intensity drops as \(1/r^2\), so even a high base intensity quickly becomes negligible at the distances between the two ships.

### Ocean Reflections

The ocean uses two layers:

1. **`Water` shader** (Three.js addon) — animated normal-mapped water surface with a `sunColor` uniform that controls how brightly light sources reflect on the water.
2. **`mirrorPlane`** — a `MeshStandardMaterial` plane slightly below the water surface for additional depth and reflection effects.

To prevent the target ship's NavLights from over-illuminating the ocean surface, two measures were applied:

- `mirrorPlane` roughness was raised to `0.92` and metalness reduced to `0.05`
- `sunColor` was set to a dim blue-grey (`0x112233`) for night mode

### Light Distance Limiting

The `distance` property on a `THREE.Light` defines the maximum range at which the light still contributes. Beyond this distance, the intensity is zero. By dynamically setting:

```js
child.distance = Math.max(distToTarget * 0.3, 8);
```

the NavLights of the target ship always illuminate geometry within 30% of the ship-to-player distance — enough to light the local water surface around the target ship but never reaching the player boat at normal observation distances.

---

## 5. Dynamic Light Intensity Based on Distance

Navigation lights must remain visible at long range. Since physically correct light falloff (`decay = 2`) would make the lights nearly invisible at a distance, the intensity and bulb size are scaled dynamically every frame in `animate()`.

### Formula

The normalized parameter `t` represents the relative distance between the near and far thresholds:

\[ t = \text{clamp}\!\left(\frac{d - d_{\text{near}}}{d_{\text{far}} - d_{\text{near}}},\ 0,\ 1\right) \]

Linear interpolation (lerp) is then applied to intensity, bulb size, and light reach:

\[ \text{intensity} = I_{\text{near}} + t \cdot (I_{\text{far}} - I_{\text{near}}) \]

\[ \text{bulbSize} = S_{\text{near}} + t \cdot (S_{\text{far}} - S_{\text{near}}) \]

- `t = 0` → ship is close → low brightness, small bulb, short light reach
- `t = 1` → ship is far away → high brightness, large bulb, longer light reach

### Bulb Color Preservation

The visible bulb mesh uses `MeshBasicMaterial`, which ignores all scene lighting — it always renders at its assigned color regardless of external lights. When scaling brightness, `setScalar()` must not be used as it overwrites all three color channels with the same value (destroying the hue). Instead, the original color is stored on the first frame and multiplied:

```js
if (!child.userData.baseColor) {
    child.userData.baseColor = child.material.color.clone();
}
child.material.color.copy(child.userData.baseColor).multiplyScalar(brightness);
```

### Configurable Parameters (`config.js`)

| Parameter            | Description                               | Current Value |
|----------------------|-------------------------------------------|---------------|
| `NAV_DIST_NEAR`      | Distance at minimum brightness            | 3             |
| `NAV_DIST_FAR`       | Distance at maximum brightness            | 120           |
| `NAV_INTENSITY_NEAR` | Light intensity when close                | 0.005         |
| `NAV_INTENSITY_FAR`  | Light intensity when far                  | 10            |
| `NAV_SIZE_NEAR`      | Bulb size when close                      | 0.2           |
| `NAV_SIZE_FAR`       | Bulb size when far                        | 3.0           |

---

## 6. Route System (`shipRoutes.js`)

The target ship moves automatically along predefined routes. Each route is a pure function of the form:

```
f(t) → { x, z, heading }
```

- `t ∈ [0, 1]` – normalized progress along the route
- `x`, `z` – position in the world plane (Y is determined by ocean waves)
- `heading` – direction of travel as an angle in radians

### Available Routes

| Route | Description          | Formula                                    |
|-------|----------------------|--------------------------------------------|
| A     | Circle clockwise     | `x = sin(t·2π)·R`, `z = cos(t·2π)·R`     |
| B     | Circle counter-CW    | `x = sin(−t·2π)·R`, `z = cos(−t·2π)·R`  |
| C     | Diagonal line (30°)  | Linear interpolation at 0.3 rad            |
| D     | Diagonal line (120°) | Linear interpolation at 0.3 + π/2         |
| E     | Zigzag               | Straight path with a `sin` lateral offset  |

### Heading → Model Rotation

The ship model faces **−Z** by default. Since `heading` describes the direction of travel in standard mathematical convention, the model rotation must be offset by π so that the bow points in the direction of movement:

```
targetShip.rotation.y = heading + π
```

### Speed

```
routeT += delta × ROUTE_SPEED
```

`delta` is the frame time in seconds provided by `THREE.Clock`. At `ROUTE_SPEED = 0.002`, one full route cycle takes approximately 500 seconds.

---

## 7. Ocean Waves: Gerstner-Inspired Wave Superposition

The ocean geometry is animated every frame by superimposing three sinusoidal waves with different directions, speeds, and amplitudes.

### Wave Formula

For each vertex at position \((x, z)\) and time \(t\), the height is:

\[ y = \sum_{i=A}^{C} \sin\!\left((x \cdot d_x^i + z \cdot d_z^i) \cdot f_i + t \cdot s_i\right) \cdot a_i \]

where \(d_x, d_z\) is the wave direction, \(f\) the spatial frequency, \(s\) the speed, and \(a\) the amplitude.

The surface normal is derived analytically from the partial derivatives:

\[ \frac{\partial y}{\partial x} = \sum_i \cos(\ldots) \cdot a_i \cdot f_i \cdot d_x^i \]

\[ \text{normal} = \text{normalize}\!\left(-\frac{\partial y}{\partial x},\ 1,\ -\frac{\partial y}{\partial z}\right) \]

This normal is used to compute realistic pitch and roll for both ships every frame.

### Wave Parameters

| Wave | Speed | Amplitude | Direction (x, z)  |
|------|-------|-----------|-------------------|
| A    | 1.0   | 1.2       | (1.0, 0.5)        |
| B    | 0.6   | 0.8       | (−0.5, 1.0)       |
| C    | 1.5   | 0.5       | (0.2, 0.8)        |

---

## 8. Fog and Visibility

Exponential fog (`THREE.FogExp2`) simulates the limited visibility at sea. The reduction in visibility follows an exponential curve:

\[ \text{visibility} = e^{-\rho \cdot d} \]

where \(\rho\) is the fog density and \(d\) the distance from the camera. The fog density increases dynamically as the player approaches the map boundary:

```
if dist > FOG_START:
    t = clamp((dist − FOG_START) / (MAX_DIST − FOG_START), 0, 1)
    density = 0.003 + t × 0.02
else:
    density = 0.003
```

This creates a natural fog wall at the edge of the playable area and avoids a hard cutoff of the world geometry.

| Parameter   | Description                             | Default |
|-------------|-----------------------------------------|---------|
| `FOG_START` | Distance at which fog starts increasing | 450     |
| `MAX_DIST`  | Maximum play area radius                | 500     |

