# 3D Adventure — Game Feature Documentation

## Table of Contents

- [Feature Overview](#feature-overview)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Game Mechanics](#game-mechanics)
- [3D World Design](#3d-world-design)
- [Checkpoint System](#checkpoint-system)
- [Camera System](#camera-system)
- [Controls Reference](#controls-reference)
- [How to Extend](#how-to-extend)

---

## Feature Overview

**3D Adventure** is a Three.js-powered 3D game embedded as a route (`/game`) in a Next.js App Router application. The player navigates a stylized open world using click-to-move, WASD keyboard controls, and jump physics to reach glowing checkpoint markers scattered across the landscape. Each checkpoint triggers an overlay that displays external content (embedded web pages or images).

Key features:

- **Click-to-move navigation** — click anywhere on the ground to set a movement target via raycasting
- **WASD / Arrow key movement** — camera-relative directional walking
- **Jump physics** — space bar jump with gravity simulation
- **Interactive checkpoints** — glowing 3D markers that open an overlay with embedded content
- **Third-person camera** — smooth lerp-based follow camera with frame-rate independent smoothing
- **Procedural world** — seeded random placement of trees and rocks across a 200×200 unit terrain
- **Real-time lighting and shadows** — directional sun light with PCF soft shadow maps
- **Atmospheric fog** — exponential distance fog matching the sky color

The game runs entirely client-side. Three.js is used directly (no React-Three-Fiber) inside a `useEffect` hook that manages the full WebGL lifecycle.

---

## Architecture

### High-Level Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  /game route (page.tsx)                                      │
│                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────┐  │
│  │  <Game3DCanvas />          │  │  <CheckpointOverlay /> │  │
│  │  (Three.js scene)          │  │  (React modal)         │  │
│  │                            │  │                        │  │
│  │  ┌──────────┐  ┌────────┐ │  │  ┌──────────────────┐  │  │
│  │  │  Scene   │  │  Game  │ │  │  │  iframe / image  │  │  │
│  │  │  Setup   │──│  Loop  │ │  │  │  display panel   │  │  │
│  │  └──────────┘  └───┬────┘ │  │  └──────────────────┘  │  │
│  │                    │      │  │                        │  │
│  │      ┌─────────────┼────┐ │  └────────────────────────┘  │
│  │      ▼             ▼    ▼ │                               │
│  │  Input         Physics  Render                            │
│  │  (pointer,     (move,   (Three.js                         │
│  │   keyboard)    jump,    renderer)                         │
│  │               camera)                                     │
│  └────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────┘
```

### React–Three.js Integration Pattern

The game uses **vanilla Three.js inside a React `useEffect`**, not React-Three-Fiber. This is a deliberate choice that keeps the rendering loop, scene graph, and input handling in a single imperative block:

1. **Mount**: `useEffect` creates the `Scene`, `Camera`, `WebGLRenderer`, all meshes, lights, and event listeners. The renderer's DOM element is appended to a container `<div>` via a ref.
2. **Loop**: `requestAnimationFrame` drives a `loop()` callback that updates physics, animates objects, and calls `renderer.render()`.
3. **Pause bridge**: A `useRef` mirror (`isPausedRef`) of the `isPaused` prop lets the imperative loop read React state without re-running the effect.
4. **Unmount**: The cleanup function cancels the animation frame, removes event listeners, traverses the scene to dispose all geometries and materials, disposes the renderer, and removes the canvas element from the DOM.

### State Management

All mutable game state lives in local variables inside the `useEffect` closure rather than in React state or refs. This avoids re-renders on every frame while keeping the code straightforward:

| Variable | Type | Purpose |
|----------|------|---------|
| `velocityY` | `number` | Current vertical velocity (for jump arc) |
| `isGrounded` | `boolean` | Whether the avatar is on the ground |
| `moveTarget` | `Vector3 \| null` | Click-to-move destination (null when idle) |
| `bobPhase` | `number` | Phase accumulator for the walking/idle bob |
| `isMoving` | `boolean` | Whether the avatar is currently in motion |
| `triggeredCpId` | `string \| null` | ID of the last triggered checkpoint (prevents re-triggers) |
| `keysDown` | `Set<string>` | Currently held keyboard keys |

---

## File Structure

### `page.tsx` — Game Page

The top-level page component for the `/game` route. Responsibilities:

- Manages `activeCheckpoint` state — when non-null, the checkpoint overlay is visible and the game is paused.
- Passes `onCheckpoint` and `isPaused` props down to `Game3DCanvas`.
- Renders `CheckpointOverlay` conditionally on top of the canvas.
- Listens for the Escape key at the page level to close the overlay.
- Renders a header bar with the game title, a "Three.js" badge, and a back-to-home link.
- Renders an HUD bar at the bottom of the canvas with control hints.

### `page.module.css` — Page Styles

CSS Module styles for the page layout:

- `.container` — Full-viewport flex column with a dark background (`#1a1a2e`).
- `.header` — Semi-transparent top bar with blur backdrop and navigation.
- `.canvasWrapper` — Flex-grow area that the 3D canvas fills entirely; also the positioning context for the overlay and HUD.
- `.hud` — Absolutely positioned bottom-center control hints with a pill-shaped translucent background.
- Responsive breakpoint at 600px hides the badge and reduces font sizes.

### `components/Game3DCanvas.tsx` — 3D Game Engine

The core client component. Contains the Three.js scene setup, all 3D object factories, input handling, physics, and the animation loop. Key sections:

| Section | Description |
|---------|-------------|
| `CHECKPOINTS` array | Defines checkpoint positions, types, URLs, labels, and colors |
| Physics constants | `MOVE_SPEED`, `JUMP_SPEED`, `GRAVITY`, `CAMERA_OFFSET`, `CAMERA_SMOOTHING`, `CHECKPOINT_TRIGGER_DIST`, `WORLD_HALF` |
| `seededRandom()` | Deterministic PRNG for reproducible decoration placement |
| `createAvatar()` | Builds the player character from primitive meshes |
| `createTree()` / `createRock()` | Procedural decoration factories |
| `createCheckpointMarker()` | Builds the glowing checkpoint indicator (torus + beam + light + diamond) |
| `useEffect` body | Scene init, lighting, ground, decorations, event handlers, game loop, cleanup |

### `components/CheckpointOverlay.tsx` — Checkpoint Overlay

A React component that displays checkpoint content in a modal panel:

- Exports the `CheckpointData` interface used across the game.
- Renders a blurred backdrop that closes the overlay on click.
- Displays a header with the checkpoint label and description.
- Content area shows either an `<iframe>` (for `link` type) or an `<img>` (for `image` type).
- Footer hint reminds the user how to close.

### `components/CheckpointOverlay.module.css` — Overlay Styles

CSS Module styles for the overlay:

- `.backdrop` — Full-overlay with dark semi-transparent background and blur, animated fade-in.
- `.panel` — Centered card with dark background, rounded corners, and a slide-up entrance animation.
- `.content` — Flexible content area with a minimum height of 400px.
- `.iframe` — Full-width/height borderless iframe.
- `.imageWrapper` — Centered image display with padding.
- Responsive adjustments at 600px.

---

## Game Mechanics

### Click-to-Move (Raycasting)

When the player clicks on the 3D canvas:

1. The pointer position is converted to **normalized device coordinates** (NDC: -1 to +1 range).
2. A `THREE.Raycaster` is set from the camera through the NDC point.
3. The raycaster tests for intersections against the **ground plane** mesh.
4. If a hit is found, the intersection point (clamped to y=0) becomes the new `moveTarget`.
5. A **yellow target ring** (torus mesh) appears at the destination and spins until the avatar arrives.

Each frame, if a `moveTarget` exists and no keyboard input overrides it:

1. The direction vector from avatar to target is computed (XZ plane only).
2. If the remaining distance is greater than 0.5 units, the avatar steps toward the target at `MOVE_SPEED` (15 units/sec), capped by the remaining distance to avoid overshoot.
3. The avatar's Y-rotation is set to face the movement direction via `atan2`.
4. When within 0.5 units, the avatar snaps to the target and movement stops.

### WASD / Arrow Key Movement

Keyboard movement is **camera-relative**, not world-axis-aligned:

1. The camera's forward direction is projected onto the XZ plane and normalized (`camFwd`).
2. The camera's right direction is derived via a cross product (`camRight`).
3. W/Up adds `camFwd`, S/Down subtracts it, D/Right adds `camRight`, A/Left subtracts it.
4. The resulting direction vector is normalized and scaled by `MOVE_SPEED * dt`.
5. Keyboard input cancels any active click-to-move target.

### Jump Physics

Jumping uses a simple Euler integration model:

1. Pressing Space (when grounded) sets `velocityY` to `JUMP_SPEED` (12 units/sec) and marks `isGrounded = false`.
2. Each frame, gravity is applied: `velocityY += GRAVITY * dt` where `GRAVITY = -30`.
3. The avatar's Y position is updated: `position.y += velocityY * dt`.
4. When `position.y` drops to 0 or below, the avatar lands: Y is clamped to 0, velocity is zeroed, and `isGrounded` is restored.

The avatar can move horizontally while airborne — jump does not interrupt WASD or click-to-move.

### Bob Animation

The avatar has a vertical body bob driven by a sine wave:

- **While moving**: phase increments at rate `8 * dt`, amplitude `0.15` units — a quick, visible bounce.
- **While idle**: phase increments at rate `2 * dt`, amplitude `0.05` units — a gentle breathing sway.

The bob is applied only to the body mesh's local Y position, not the root group.

### World Boundary

The world spans from `-WORLD_HALF` to `+WORLD_HALF` (100 units in each direction from the origin, 200×200 total). The avatar's XZ position is clamped to this range every frame.

---

## 3D World Design

### Ground

A flat `PlaneGeometry` (200×200) rotated to lie horizontally, colored grass-green (`#4a7c59`). It receives shadows from all objects above it. A subtle grid helper overlays the ground at 8% opacity for spatial reference.

### Avatar

The player character is built from primitive Three.js geometries grouped under a single `THREE.Group`:

| Part | Geometry | Color | Position (local Y) |
|------|----------|-------|---------------------|
| Body | `CylinderGeometry(0.5, 0.55, 1.5)` | `#3366cc` (blue) | 0.75 |
| Shirt | `CylinderGeometry(0.52, 0.52, 0.5)` | `#4488ee` (light blue) | 1.25 |
| Head | `SphereGeometry(0.4)` | `#ffddaa` (skin tone) | 2.0 |
| Hat | `ConeGeometry(0.45, 0.4)` | `#553322` (brown) | 2.5 |
| Eyes (×2) | `SphereGeometry(0.06)` | `#333333` (dark) | 2.05, z=0.35 |

All parts cast shadows. The group rotates on the Y-axis to face the movement direction.

### Decorations

Decorations are placed procedurally using a seeded PRNG (seed `42`) for reproducibility:

- **50 trees** — trunk (`CylinderGeometry`) topped with a conical canopy (`ConeGeometry`), randomly scaled between 0.6× and 1.4×.
- **30 rocks** — `DodecahedronGeometry` squashed on the Y-axis for a natural look, grey-colored, randomly scaled.

Placement rules:
- Decorations within 8 units of the origin are skipped to keep the spawn area clear.
- Decorations within 8 units of any checkpoint are skipped to keep approach paths unobstructed.

### Checkpoint Markers

Each checkpoint is a `THREE.Group` containing four elements:

| Element | Geometry | Effect |
|---------|----------|--------|
| **Ground torus** | `TorusGeometry(2.5, 0.15)` | Lies flat, rotates slowly, uses checkpoint color with emissive glow |
| **Beam** | `CylinderGeometry(0.08, 0.25, 10)` | Semi-transparent vertical pillar, bobs up and down sinusoidally |
| **Point light** | `PointLight(color, 3, 20)` | Pulses intensity between 1.5 and 3.5 for a breathing glow |
| **Floating diamond** | `OctahedronGeometry(0.5)` | Hovers above the beam, rotates on the Y-axis, bobs vertically |

Checkpoint animations continue even when the game is paused, keeping the scene visually alive.

### Lighting

| Light | Type | Settings |
|-------|------|----------|
| Ambient | `AmbientLight` | White, intensity 0.6 — fills shadows softly |
| Sun | `DirectionalLight` | White, intensity 1.2 — main scene illumination; casts shadows |

The sun light follows the avatar (`position = avatar + (50, 50, 25)`) so shadows remain consistent regardless of where the player moves. Shadow map is 2048×2048 with PCF soft shadow filtering and a frustum spanning 120 units.

### Fog

`FogExp2` with color `#87ceeb` (sky blue) and density `0.006` creates distance-based atmospheric fade. This matches the scene background color so distant objects blend smoothly into the horizon.

---

## Checkpoint System

### Checkpoint Data

Each checkpoint is defined in the `CHECKPOINTS` array with the following shape:

```typescript
interface CheckpointData {
  id: string;                         // Unique identifier
  position: [number, number, number]; // World position [x, y, z]
  type: 'link' | 'image';            // Content type
  url: string;                        // URL to display
  label: string;                      // Display title
  description: string;                // Short description
  color: number;                      // Hex color for the marker
}
```

### Current Checkpoints

| ID | Position | Type | Content |
|----|----------|------|---------|
| `github` | (40, 0, 0) | link | GitHub profile page |
| `photo` | (0, 0, 40) | image | Personal photo |
| `hkust` | (-40, 0, 0) | link | HKUST university website |
| `vocal-coach` | (0, 0, -40) | link | Vocal Coach iOS app listing |

### Trigger Logic

1. Each frame, the avatar's ground position (XZ) is compared against every checkpoint position.
2. If the distance is less than `CHECKPOINT_TRIGGER_DIST` (5 units) and the checkpoint hasn't already been triggered, `onCheckpoint` fires with the checkpoint data.
3. `triggeredCpId` stores the last-triggered checkpoint ID to prevent repeated triggers while standing on the same checkpoint.
4. Once the avatar moves far enough away (beyond `CHECKPOINT_TRIGGER_DIST * 2` from all checkpoints), `triggeredCpId` resets so the same checkpoint can be triggered again on a return visit.

### Overlay Component

When a checkpoint triggers:

1. `GamePage` stores the checkpoint data in `activeCheckpoint` state.
2. `isPaused` becomes `true`, which is bridged into the game loop via `isPausedRef`. The loop continues rendering (checkpoint animations play) but skips physics and input processing.
3. `CheckpointOverlay` renders on top of the canvas with:
   - A blurred dark backdrop (click to dismiss).
   - A modal panel with the checkpoint's label and description.
   - An `<iframe>` (sandboxed with `allow-scripts allow-same-origin allow-popups`) for link-type checkpoints, or an `<img>` for image-type checkpoints.
   - A hint footer: "Press Escape or click outside to close."
4. Closing the overlay (Escape key, close button, or backdrop click) sets `activeCheckpoint` to `null`, which unpauses the game.

---

## Camera System

The camera uses a **third-person follow** model with frame-rate independent smoothing.

### Configuration

| Constant | Value | Description |
|----------|-------|-------------|
| `CAMERA_OFFSET` | `(0, 10, 15)` | Fixed offset from the avatar to the desired camera position |
| `CAMERA_SMOOTHING` | `0.04` | Base smoothing factor per frame at 60 fps |

### Follow Algorithm

Each frame:

1. Compute the desired camera position: `avatar.position + CAMERA_OFFSET`.
2. Calculate a **frame-rate independent** smoothing factor:
   ```
   camSmooth = 1 - (1 - CAMERA_SMOOTHING) ^ (dt * 60)
   ```
   This formula ensures the camera feels identical at 30 fps, 60 fps, or 144 fps. At exactly 60 fps, `camSmooth` equals `CAMERA_SMOOTHING`.
3. Lerp the camera position toward the desired position using `camSmooth`.
4. Point the camera at the avatar's position offset upward by 2 units (roughly chest height).

### Perspective

The camera uses a `PerspectiveCamera` with a 60° field of view, near plane at 0.1, and far plane at 500. It is initialized looking at the origin and transitions smoothly once the game loop starts.

---

## Controls Reference

| Input | Action |
|-------|--------|
| **Left click** (on ground) | Set movement target — avatar walks to the clicked point |
| **W** / **Arrow Up** | Move forward (camera-relative) |
| **S** / **Arrow Down** | Move backward (camera-relative) |
| **A** / **Arrow Left** | Strafe left (camera-relative) |
| **D** / **Arrow Right** | Strafe right (camera-relative) |
| **Space** | Jump (when grounded) |
| **Escape** | Close checkpoint overlay |

WASD movement overrides and cancels any active click-to-move target. The avatar can jump while moving in any direction. All movement is disabled while a checkpoint overlay is open.

---

## How to Extend

### Adding a New Checkpoint

Add an entry to the `CHECKPOINTS` array in `Game3DCanvas.tsx`:

```typescript
{
  id: 'my-checkpoint',
  position: [30, 0, -30],
  type: 'link',
  url: 'https://example.com',
  label: 'My Checkpoint',
  description: 'A description of what this checkpoint shows',
  color: 0xff9900,
}
```

The checkpoint marker, trigger logic, and overlay handling are all data-driven — no other code changes are needed.

### Adding New 3D Objects

Follow the existing factory function pattern:

```typescript
function createMyObject(x: number, z: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.5 * scale;
  mesh.scale.setScalar(scale);
  mesh.castShadow = true;
  group.add(mesh);

  return group;
}
```

Then add a placement loop in the `useEffect`, after the existing tree/rock loops:

```typescript
for (let i = 0; i < 20; i++) {
  const x = (rng() - 0.5) * WORLD_HALF * 1.8;
  const z = (rng() - 0.5) * WORLD_HALF * 1.8;
  if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
  if (isTooCloseToCheckpoint(x, z, 8)) continue;
  scene.add(createMyObject(x, z, 0.5 + rng()));
}
```

Use `MeshStandardMaterial` and enable `castShadow` on meshes to integrate with the existing lighting.

### Modifying Physics Constants

| Constant | Default | Effect of Increasing |
|----------|---------|---------------------|
| `MOVE_SPEED` | `15` | Avatar walks faster |
| `JUMP_SPEED` | `12` | Higher jumps |
| `GRAVITY` | `-30` | Faster fall (more negative = stronger pull) |
| `CAMERA_OFFSET` | `(0, 10, 15)` | Camera further from avatar; increase Y for higher angle, Z for more distance |
| `CAMERA_SMOOTHING` | `0.04` | Camera follows more tightly. At `1.0` it snaps instantly. |
| `CHECKPOINT_TRIGGER_DIST` | `5` | Larger activation radius around checkpoints |
| `WORLD_HALF` | `100` | Larger explorable area (world spans ±this value) |

### Adding Terrain Height

The current ground is flat. To add terrain:

1. Replace `PlaneGeometry` with a subdivided plane and displace vertices based on a noise function.
2. In the movement update, sample the terrain height at the avatar's XZ position and set the avatar's base Y accordingly.
3. Update jump physics to use the terrain height as the ground level instead of `y = 0`.
4. Adjust decoration placement to account for terrain height.

### Adding Collectibles or Scoring

1. Define a new data array similar to `CHECKPOINTS` with positions and reward values.
2. Create a marker factory (e.g., spinning coins using `CylinderGeometry`).
3. In the game loop, check proximity and remove collected items from the scene.
4. Lift the score into React state via a callback prop (same pattern as `onCheckpoint`) to display it in the HUD.
