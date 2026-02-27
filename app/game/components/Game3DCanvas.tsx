'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CheckpointData } from './CheckpointOverlay';

export const CHECKPOINTS: CheckpointData[] = [
  {
    id: 'github',
    position: [40, 0, 0],
    type: 'link',
    url: 'https://github.com/alvinkcs',
    label: 'GitHub Profile',
    description: 'Explore my open-source projects and contributions',
    color: 0x6e5494,
  },
  {
    id: 'photo',
    position: [0, 0, 40],
    type: 'image',
    url: '/IMG_4269.jpg',
    label: 'About Me',
    description: 'Hello! Nice to meet you.',
    color: 0xff6b6b,
  },
  {
    id: 'hkust',
    position: [-40, 0, 0],
    type: 'link',
    url: 'https://hkust.edu.hk',
    label: 'HKUST',
    description: 'My university — The Hong Kong University of Science and Technology',
    color: 0x003366,
  },
  {
    id: 'vocal-coach',
    position: [0, 0, -40],
    type: 'link',
    url: 'https://apps.apple.com/app/vocal-coach-sing-sharp/id1226568633',
    label: 'Vocal Coach App',
    description: 'The iOS app I contributed to at Sing Sharp Limited',
    color: 0x4ecdc4,
  },
];

interface Props {
  onCheckpoint: (checkpoint: CheckpointData) => void;
  isPaused: boolean;
}

const MOVE_SPEED = 15;
const JUMP_SPEED = 12;
const GRAVITY = -30;
const CAMERA_OFFSET = new THREE.Vector3(0, 10, 15);
const CAMERA_SMOOTHING = 0.04;
const CHECKPOINT_TRIGGER_DIST = 5;
const WORLD_HALF = 100;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createAvatar(): THREE.Group {
  const group = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.5, 0.55, 1.5, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3366cc });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.75;
  body.castShadow = true;
  group.add(body);

  const shirtGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.5, 16);
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x4488ee });
  const shirt = new THREE.Mesh(shirtGeo, shirtMat);
  shirt.position.y = 1.25;
  shirt.castShadow = true;
  group.add(shirt);

  const headGeo = new THREE.SphereGeometry(0.4, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffddaa });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.0;
  head.castShadow = true;
  group.add(head);

  const hatGeo = new THREE.ConeGeometry(0.45, 0.4, 16);
  const hatMat = new THREE.MeshStandardMaterial({ color: 0x553322 });
  const hat = new THREE.Mesh(hatGeo, hatMat);
  hat.position.y = 2.5;
  hat.castShadow = true;
  group.add(hat);

  const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.15, 2.05, 0.35);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.15, 2.05, 0.35);
  group.add(rightEye);

  return group;
}

function createTree(x: number, z: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);

  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1;
  trunk.castShadow = true;
  group.add(trunk);

  const foliageGeo = new THREE.ConeGeometry(1.5, 3, 8);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d7a3a });
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.y = 3.5;
  foliage.castShadow = true;
  group.add(foliage);

  return group;
}

function createRock(x: number, z: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const geo = new THREE.DodecahedronGeometry(1, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a });
  const rock = new THREE.Mesh(geo, mat);
  rock.position.y = 0.5 * scale;
  rock.scale.set(scale, scale * 0.7, scale);
  rock.castShadow = true;
  group.add(rock);

  return group;
}

function createCheckpointMarker(cp: CheckpointData): THREE.Group {
  const group = new THREE.Group();
  group.position.set(cp.position[0], 0, cp.position[2]);

  const torusGeo = new THREE.TorusGeometry(2.5, 0.15, 8, 32);
  const torusMat = new THREE.MeshStandardMaterial({
    color: cp.color,
    emissive: cp.color,
    emissiveIntensity: 0.6,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = -Math.PI / 2;
  torus.position.y = 0.2;
  group.add(torus);

  const beamGeo = new THREE.CylinderGeometry(0.08, 0.25, 10, 8);
  const beamMat = new THREE.MeshStandardMaterial({
    color: cp.color,
    emissive: cp.color,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.25,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.y = 5;
  group.add(beam);

  const light = new THREE.PointLight(cp.color, 3, 20);
  light.position.y = 2;
  group.add(light);

  // Floating diamond above the checkpoint
  const diamondGeo = new THREE.OctahedronGeometry(0.5, 0);
  const diamondMat = new THREE.MeshStandardMaterial({
    color: cp.color,
    emissive: cp.color,
    emissiveIntensity: 0.8,
  });
  const diamond = new THREE.Mesh(diamondGeo, diamondMat);
  diamond.position.y = 4;
  diamond.castShadow = true;
  group.add(diamond);

  return group;
}

function isTooCloseToCheckpoint(x: number, z: number, minDist: number): boolean {
  for (const cp of CHECKPOINTS) {
    const dx = x - cp.position[0];
    const dz = z - cp.position[2];
    if (Math.sqrt(dx * dx + dz * dz) < minDist) return true;
  }
  return false;
}

export default function Game3DCanvas({ onCheckpoint, isPaused }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const onCheckpointRef = useRef(onCheckpoint);
  onCheckpointRef.current = onCheckpoint;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.006);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.copy(CAMERA_OFFSET);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(50, 50, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    scene.add(sunLight);
    scene.add(sunLight.target);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(WORLD_HALF * 2, WORLD_HALF * 2);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(WORLD_HALF * 2, 50, 0xffffff, 0xffffff);
    const gridMat = gridHelper.material;
    if (Array.isArray(gridMat)) {
      gridMat.forEach((m) => { m.opacity = 0.08; m.transparent = true; });
    } else {
      gridMat.opacity = 0.08;
      gridMat.transparent = true;
    }
    scene.add(gridHelper);

    // Avatar
    const avatar = createAvatar();
    scene.add(avatar);

    // Target indicator
    const targetRingGeo = new THREE.TorusGeometry(0.6, 0.08, 8, 32);
    const targetRingMat = new THREE.MeshStandardMaterial({
      color: 0xffdd44,
      emissive: 0xffdd44,
      emissiveIntensity: 0.6,
    });
    const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.y = 0.1;
    targetRing.visible = false;
    scene.add(targetRing);

    // Decorations
    const rng = seededRandom(42);
    for (let i = 0; i < 50; i++) {
      const x = (rng() - 0.5) * WORLD_HALF * 1.8;
      const z = (rng() - 0.5) * WORLD_HALF * 1.8;
      if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
      if (isTooCloseToCheckpoint(x, z, 8)) continue;
      scene.add(createTree(x, z, 0.6 + rng() * 0.8));
    }
    for (let i = 0; i < 30; i++) {
      const x = (rng() - 0.5) * WORLD_HALF * 1.8;
      const z = (rng() - 0.5) * WORLD_HALF * 1.8;
      if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
      if (isTooCloseToCheckpoint(x, z, 8)) continue;
      scene.add(createRock(x, z, 0.5 + rng()));
    }

    // Checkpoints
    const cpMarkers: THREE.Group[] = [];
    for (const cp of CHECKPOINTS) {
      const marker = createCheckpointMarker(cp);
      scene.add(marker);
      cpMarkers.push(marker);
    }

    // Game state
    let velocityY = 0;
    let isGrounded = true;
    let moveTarget: THREE.Vector3 | null = null;
    let bobPhase = 0;
    let lastTime = 0;
    let isMoving = false;
    let triggeredCpId: string | null = null;
    const keysDown = new Set<string>();

    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    // Event handlers
    const onPointerDown = (event: PointerEvent) => {
      if (isPausedRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNDC, camera);
      const hits = raycaster.intersectObject(ground);
      if (hits.length > 0) {
        moveTarget = hits[0].point.clone();
        moveTarget.y = 0;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isPausedRef.current) {
        if (event.key === 'Escape') return; // let page handle escape
        return;
      }
      const key = event.key.toLowerCase();
      keysDown.add(key);

      if (key === ' ' && isGrounded) {
        event.preventDefault();
        velocityY = JUMP_SPEED;
        isGrounded = false;
      }
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysDown.delete(event.key.toLowerCase());
    };

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);

    renderer.domElement.tabIndex = 0;
    renderer.domElement.style.outline = 'none';
    renderer.domElement.setAttribute('role', 'application');
    renderer.domElement.setAttribute(
      'aria-label',
      'Click to move, WASD to walk, Space to jump. Reach glowing checkpoints to discover content.'
    );
    renderer.domElement.focus();

    // Pre-allocated reusable vectors to avoid GC pressure
    const _camFwd = new THREE.Vector3();
    const _camRight = new THREE.Vector3();
    const _kbDir = new THREE.Vector3();
    const _diff = new THREE.Vector3();
    const _desiredCam = new THREE.Vector3();
    const _avatarGround = new THREE.Vector3();
    const _cpPos = new THREE.Vector3();
    const _up = new THREE.Vector3(0, 1, 0);

    // Animation loop
    let frameId: number;

    const loop = (now: number) => {
      frameId = requestAnimationFrame(loop);

      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Animate checkpoints even when paused
      for (let i = 0; i < cpMarkers.length; i++) {
        const m = cpMarkers[i];
        const torusChild = m.children[0];
        const beamChild = m.children[1];
        const lightChild = m.children[2] as THREE.PointLight;
        const diamondChild = m.children[3];

        if (torusChild) torusChild.rotation.z += dt * 0.8;
        if (beamChild) beamChild.position.y = 5 + Math.sin(now * 0.001 + i * 2) * 0.5;
        if (lightChild) lightChild.intensity = 2.5 + Math.sin(now * 0.002 + i * 1.5) * 1;
        if (diamondChild) {
          diamondChild.position.y = 4 + Math.sin(now * 0.0015 + i * 3) * 0.6;
          diamondChild.rotation.y += dt * 1.5;
        }
      }

      if (isPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      // Camera-relative movement directions
      camera.getWorldDirection(_camFwd);
      _camFwd.y = 0;
      _camFwd.normalize();

      _camRight.crossVectors(_camFwd, _up).normalize();

      // Keyboard movement
      _kbDir.set(0, 0, 0);
      if (keysDown.has('w') || keysDown.has('arrowup')) _kbDir.add(_camFwd);
      if (keysDown.has('s') || keysDown.has('arrowdown')) _kbDir.sub(_camFwd);
      if (keysDown.has('d') || keysDown.has('arrowright')) _kbDir.add(_camRight);
      if (keysDown.has('a') || keysDown.has('arrowleft')) _kbDir.sub(_camRight);

      if (_kbDir.lengthSq() > 0) {
        _kbDir.normalize();
        avatar.position.x += _kbDir.x * MOVE_SPEED * dt;
        avatar.position.z += _kbDir.z * MOVE_SPEED * dt;
        avatar.rotation.y = Math.atan2(_kbDir.x, _kbDir.z);
        moveTarget = null;
        isMoving = true;
      } else if (moveTarget) {
        _diff.set(
          moveTarget.x - avatar.position.x,
          0,
          moveTarget.z - avatar.position.z
        );
        const dist = _diff.length();
        if (dist > 0.5) {
          _diff.normalize();
          const step = Math.min(MOVE_SPEED * dt, dist);
          avatar.position.x += _diff.x * step;
          avatar.position.z += _diff.z * step;
          avatar.rotation.y = Math.atan2(_diff.x, _diff.z);
          isMoving = true;
        } else {
          avatar.position.x = moveTarget.x;
          avatar.position.z = moveTarget.z;
          moveTarget = null;
          isMoving = false;
        }
      } else {
        isMoving = false;
      }

      // World boundary clamp
      avatar.position.x = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, avatar.position.x));
      avatar.position.z = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, avatar.position.z));

      // Jump physics
      velocityY += GRAVITY * dt;
      avatar.position.y += velocityY * dt;
      if (avatar.position.y <= 0) {
        avatar.position.y = 0;
        velocityY = 0;
        isGrounded = true;
      }

      // Bob animation
      bobPhase = (bobPhase + (isMoving ? 8 : 2) * dt) % (Math.PI * 200);
      const bobAmt = isMoving ? 0.15 : 0.05;
      const bodyMesh = avatar.children[0];
      if (bodyMesh) bodyMesh.position.y = 0.75 + Math.sin(bobPhase) * bobAmt;

      // Camera follow (frame-rate independent)
      _desiredCam.copy(avatar.position).add(CAMERA_OFFSET);
      const camSmooth = 1 - Math.pow(1 - CAMERA_SMOOTHING, dt * 60);
      camera.position.lerp(_desiredCam, camSmooth);
      camera.lookAt(avatar.position.x, avatar.position.y + 2, avatar.position.z);

      // Sun follows avatar for consistent shadows
      sunLight.position.set(avatar.position.x + 50, 50, avatar.position.z + 25);
      sunLight.target.position.copy(avatar.position);

      // Target indicator
      if (moveTarget) {
        targetRing.visible = true;
        targetRing.position.set(moveTarget.x, 0.1, moveTarget.z);
        targetRing.rotation.z += dt * 3;
      } else {
        targetRing.visible = false;
      }

      // Checkpoint proximity
      _avatarGround.set(avatar.position.x, 0, avatar.position.z);
      for (const cp of CHECKPOINTS) {
        _cpPos.set(cp.position[0], 0, cp.position[2]);
        const dist = _avatarGround.distanceTo(_cpPos);
        if (dist < CHECKPOINT_TRIGGER_DIST && triggeredCpId !== cp.id) {
          triggeredCpId = cp.id;
          onCheckpointRef.current(cp);
          break;
        }
      }

      let nearAny = false;
      for (const cp of CHECKPOINTS) {
        _cpPos.set(cp.position[0], 0, cp.position[2]);
        if (_avatarGround.distanceTo(_cpPos) < CHECKPOINT_TRIGGER_DIST * 2) {
          nearAny = true;
          break;
        }
      }
      if (!nearAny) triggeredCpId = null;

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // all mutable state in refs or local variables

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
}
