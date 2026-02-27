# Click-to-Move Adventure — Game Feature Documentation

## Table of Contents

- [Feature Overview](#feature-overview)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Game Mechanics](#game-mechanics)
- [World Design](#world-design)
- [Rendering Pipeline](#rendering-pipeline)
- [Coordinate Systems](#coordinate-systems)
- [How to Extend](#how-to-extend)

---

## Feature Overview

**Click-to-Move Adventure** is a canvas-based 2D game embedded as a route (`/game`) in a Next.js 14 App Router application. The player clicks anywhere on the canvas to move a character avatar across a procedurally decorated open world. The game features:

- **Click-to-move navigation** with smooth avatar movement
- **Smooth-follow camera** that tracks the avatar with linear interpolation
- **Procedurally generated world** with trees, rocks, bushes, and flowers
- **Depth-sorted rendering** for correct visual overlap between the avatar and decorations
- **Visual effects** including click ripples, dust particles, target indicators, and a walking bob animation
- **Heads-up display (HUD)** showing avatar coordinates and movement state

The entire game runs client-side inside a single React component using the HTML5 Canvas API and `requestAnimationFrame` for the game loop. No external game libraries are required.

---

## Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────┐
│  /game route (page.tsx)                     │
│  ┌────────────────────────────────────────┐ │
│  │  <GameCanvas /> (client component)     │ │
│  │                                        │ │
│  │  ┌──────────┐  ┌──────────────────┐   │ │
│  │  │  State    │  │  Game Loop       │   │ │
│  │  │  (refs)   │──│  (rAF callback)  │   │ │
│  │  └──────────┘  └──────┬───────────┘   │ │
│  │                       │               │ │
│  │         ┌─────────────┼──────────┐    │ │
│  │         ▼             ▼          ▼    │ │
│  │     Update        Render       Draw   │ │
│  │     Physics       World        HUD    │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Game Loop

The game loop follows a standard **update-then-render** pattern driven by `requestAnimationFrame`:

1. **Update phase** — advance avatar position toward the click target, update the camera, tick particle/ripple lifetimes.
2. **Render phase** — clear the canvas, draw the ground and grid, depth-sort all entities, draw effects, draw HUD.

The loop is started inside a `useEffect` and cleaned up with `cancelAnimationFrame` on unmount.

### State Management

All mutable game state is stored in React `useRef` objects rather than `useState`. This is intentional — refs avoid triggering re-renders on every frame (60 fps) while still persisting values across animation frames:

| Ref | Type | Purpose |
|-----|------|---------|
| `avatar` | `Vec2` | Current avatar world position |
| `target` | `Vec2 \| null` | Click destination (null when idle) |
| `camera` | `Vec2` | Current camera world position |
| `bobPhase` | `number` | Phase accumulator for the walking/idle bob animation |
| `moving` | `boolean` | Whether the avatar is currently in motion |
| `facingRight` | `boolean` | Avatar facing direction (affects eye position and lean) |
| `ripples` | `Ripple[]` | Active click-ripple effects |
| `dust` | `Particle[]` | Active dust particles behind the avatar |
| `decorations` | `Decoration[]` | World decoration objects (generated once on mount) |

### Camera System

The camera uses **linear interpolation (lerp)** to smoothly follow the avatar:

```typescript
camera.x = lerp(camera.x, avatar.x, CAMERA_SMOOTHING); // 0.06
camera.y = lerp(camera.y, avatar.y, CAMERA_SMOOTHING);
```

With a smoothing factor of `0.06`, the camera closes 6% of the gap between its current position and the avatar every frame. This creates a smooth trailing effect — the camera accelerates when far from the avatar and decelerates as it catches up.

---

## File Structure

### `page.tsx` — Route Page

The server component that defines the `/game` route. Responsibilities:

- Exports Next.js `metadata` (page title and description)
- Renders a header bar with the game title, a "Canvas Game" badge, and a back-to-home link
- Mounts the `<GameCanvas />` client component inside a flex-grow wrapper

### `page.module.css` — Page Styles

CSS Module styles for the page layout:

- `.container` — Full-viewport flex column with a dark background (`#1a1a2e`)
- `.header` — Semi-transparent top bar with blur backdrop
- `.canvasWrapper` — Flex-grow area that the canvas fills entirely
- Responsive breakpoint at 600px hides the badge and reduces padding

### `components/GameCanvas.tsx` — Game Engine

The core client component (`'use client'`). Contains all game logic, rendering, and interaction handling in a single file. Key sections:

| Section | Lines | Description |
|---------|-------|-------------|
| Type definitions | 5–32 | `Vec2`, `Ripple`, `Particle`, `Decoration` interfaces |
| Constants | 34–37 | `AVATAR_SPEED`, `CAMERA_SMOOTHING`, `WORLD_SIZE`, `GRID_SIZE` |
| Utility functions | 39–49 | `seededRandom()`, `lerp()` |
| Draw functions | 51–254 | `drawTree`, `drawRock`, `drawBush`, `drawFlower`, `drawAvatar`, `drawHUD` |
| Component body | 256–503 | Refs, decoration generation, resize handler, click handler, game loop, JSX |

---

## Game Mechanics

### Click-to-Move

When the player clicks the canvas:

1. The screen-space click coordinates are converted to **world coordinates** using the current camera offset.
2. The world coordinates are **clamped** to the world boundaries (`±WORLD_SIZE/2`).
3. The clamped position is stored as the movement `target`.
4. A **ripple effect** is spawned at the target location.
5. The avatar's facing direction is updated based on whether the target is left or right of the current position.

### Avatar Movement

Each frame, if a target exists:

1. Compute the direction vector from avatar to target.
2. Compute the distance. If greater than 3 pixels, move the avatar.
3. Step size uses `Math.min(AVATAR_SPEED, dist * 0.08)` — this means the avatar moves at full speed (`4` units/frame) when far away and **decelerates** as it approaches the target, creating an ease-out effect.
4. When within 3 units of the target, snap to the exact position and enter idle state.

### Bob Animation

The avatar has a vertical bobbing motion driven by a sine wave:

- **While moving**: phase increments by `0.12` per frame, amplitude of `4` pixels — a quick, noticeable bounce.
- **While idle**: phase increments by `0.04` per frame, amplitude of `2` pixels — a gentle breathing-like sway.

### Dust Particles

While moving, each frame has a 35% chance to spawn a dust particle behind the avatar. Particles have:

- Random horizontal spread around the avatar's feet
- Slight upward drift (`vy` is negative)
- A `life` value that decreases by `0.018` per frame (roughly 55 frames / ~0.9 seconds lifespan)
- Size scales down with remaining life for a fade-out effect

### Click Ripples

Each click spawns an expanding ring at the target location:

- Radius grows by `1.5` pixels per frame
- Opacity decreases by `0.015` per frame (roughly 67 frames / ~1.1 seconds)
- Rendered as a yellow-gold stroke circle (`rgba(255, 220, 100, ...)`)

### Target Indicator

While the avatar is moving, a **pulsing reticle** is drawn at the target:

- An outer ring with a `sin`-based pulse (±3 pixel radius oscillation)
- A small filled center dot
- Both rendered in gold (`rgba(255, 220, 100, ...)`)

---

## World Design

### World Boundaries

The world is a square region defined by `WORLD_SIZE = 3000`, spanning from `(-1500, -1500)` to `(1500, 1500)` in world coordinates. The avatar spawns at the origin `(0, 0)`. A dashed white border is rendered at the world edges, and click targets are clamped to stay within bounds.

### Grid System

A subtle white grid (`GRID_SIZE = 80` pixels) overlays the ground. The grid is drawn dynamically based on the camera viewport — only lines visible on screen are rendered. Grid lines use a very low opacity (`rgba(255, 255, 255, 0.08)`) to provide spatial reference without visual clutter.

### Procedural Decorations

On mount, 120 decoration attempts are made using a **seeded pseudo-random number generator** (seed `42`). This ensures the world looks identical across sessions and devices.

Each decoration:

- Is placed randomly within the world bounds
- Is **excluded** from a 60-unit radius around the origin (the spawn area) to keep the starting area clear
- Is assigned a random type: `tree`, `rock`, `bush`, or `flower`
- Has a random `size` multiplier between `0.5` and `1.3`
- Has a random `hue` value (0–1) used for color variation in bushes and flowers

#### Decoration Types

| Type | Visual | Characteristics |
|------|--------|-----------------|
| **Tree** | Triangular green canopy on a brown trunk | Two-layer foliage (dark + light triangles), drop shadow |
| **Rock** | Rounded grey ellipse | Two-layer shading (dark base + lighter highlight), drop shadow |
| **Bush** | Cluster of green circles | Three overlapping circles with hue-shifted greens, drop shadow |
| **Flower** | Petals on a stem | Green stem, 5 colored petals arranged in a ring, yellow center dot |

---

## Rendering Pipeline

Each frame renders in the following order (back to front):

### 1. Background Fill

The entire canvas is cleared with a grass-green color (`#4a7c59`).

### 2. Grid Lines

Vertical and horizontal grid lines are drawn only within the camera viewport for performance. Grid calculations use the camera offset to determine which world-space grid lines fall on screen.

### 3. World Boundary

A dashed white rectangle is drawn at the world's edge using `ctx.setLineDash([8, 4])`.

### 4. Depth-Sorted Entities

All decorations and the avatar are collected into a `sortables` array, each with a `y` world coordinate and a `draw` callback. The array is **sorted by ascending `y`** so that objects further down the screen (closer to the "camera") are drawn last, appearing in front of objects higher up. This creates the illusion of depth in a top-down view.

**Frustum culling**: decorations outside the visible viewport (with a small margin) are skipped entirely to avoid unnecessary draw calls.

### 5. Ripple Effects

Click ripples are drawn as expanding circles on top of all entities.

### 6. Target Indicator

The pulsing reticle at the movement destination is drawn above entities.

### 7. Dust Particles

Dust particles are drawn after entities so they appear in the foreground.

### 8. HUD

The HUD is drawn last, in **screen space** (not affected by the camera offset):

- **Top-right panel**: Displays the avatar's world X/Y coordinates and movement state (Moving/Idle)
- **Bottom-center panel**: Shows the instruction text "Click anywhere to move"

---

## Coordinate Systems

The game uses two coordinate systems:

### World Space

- Origin `(0, 0)` is the center of the world and the avatar's spawn point.
- Positive X is right, positive Y is down.
- Range: `(-1500, -1500)` to `(1500, 1500)`.
- All game objects (avatar, decorations, particles) store positions in world space.

### Screen Space

- Origin `(0, 0)` is the top-left corner of the canvas.
- Determined by the canvas element's pixel dimensions.
- Used for HUD rendering and mouse input.

### Conversion

World-to-screen conversion uses the camera offset:

```typescript
const offsetX = canvasWidth / 2 - camera.x;
const offsetY = canvasHeight / 2 - camera.y;

screenX = worldX + offsetX;
screenY = worldY + offsetY;
```

Screen-to-world conversion (used in click handling):

```typescript
worldX = screenX + camera.x - canvasWidth / 2;
worldY = screenY + camera.y - canvasHeight / 2;
```

---

## How to Extend

### Adding a New Decoration Type

1. Define the draw function following the existing pattern:

```typescript
function drawMyDecoration(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number, hue: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Draw shadow, then main shape
  ctx.restore();
}
```

2. Add the new type to the `Decoration` interface's `type` union:

```typescript
type: 'tree' | 'rock' | 'bush' | 'flower' | 'myDecoration';
```

3. Include it in the `types` array inside the decoration generation `useEffect`.

4. Add a rendering branch in the sortables loop inside the game loop.

### Adding NPCs or Other Moving Entities

1. Create a new interface (e.g., `NPC`) with position, target, speed, and appearance properties.
2. Store instances in a `useRef` array.
3. In the game loop update phase, advance NPC positions using the same movement logic as the avatar.
4. Push each NPC into the `sortables` array with its `y` coordinate so it depth-sorts correctly with the avatar and decorations.

### Adding Collision Detection

The current system has no collision. To add it:

1. Before applying the avatar's movement step, check if the new position would overlap any decoration (simple circle-circle or point-in-rect test).
2. If a collision is detected, either stop movement or slide the avatar along the obstacle edge.

### Adding a Minimap

1. After the main HUD draw, render a small rectangle in a corner of the screen.
2. Scale the world down so the full `WORLD_SIZE` fits in the minimap area.
3. Draw dots for decorations and a highlighted dot for the avatar.
4. Draw a rectangle representing the current camera viewport.

### Adjusting Game Constants

| Constant | Default | Effect of Increasing |
|----------|---------|---------------------|
| `AVATAR_SPEED` | `4` | Avatar moves faster |
| `CAMERA_SMOOTHING` | `0.06` | Camera follows more tightly (less lag). At `1.0` it would snap instantly. |
| `WORLD_SIZE` | `3000` | Larger explorable area |
| `GRID_SIZE` | `80` | Wider grid squares, fewer grid lines |
