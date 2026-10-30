"use client";

import { useId, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import * as THREE from "three";

gsap.registerPlugin(useGSAP);

export type RelicSceneProps = {
  intention: "protect" | "begin" | "return";
  material: "bronze" | "obsidian" | "silver";
  mark: "sun" | "wave" | "laurel";
  forged?: boolean;
  reducedMotion?: boolean;
};

const NAMES = { protect: "Aegis", begin: "Pyr", return: "Nostos" };
const TAU = Math.PI * 2;
const POSE = { x: -0.13, y: -0.27, z: -0.08 };
type Recipe = Required<RelicSceneProps>;
type Engine = {
  update: (recipe: Recipe) => void;
  rotate: (direction: number) => void;
  reset: () => void;
  visible: (value: boolean) => void;
  dispose: () => void;
};

function makeSurface(): THREE.DataTexture {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const grain = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
      const rings = Math.sin(Math.hypot(x - 64, y - 64) * 0.5) * 5;
      const hammer =
        Math.sin(x * 0.42 + Math.sin(y * 0.38)) *
        Math.sin(y * 0.31 + Math.sin(x * 0.3)) *
        12;
      const value = 186 + (grain - Math.floor(grain)) * 12 + rings + hammer;
      const i = (y * size + x) * 4;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
      pixels[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

function makeEnvironment(renderer: THREE.WebGLRenderer) {
  // Painted softboxes supply broad reflections without a network HDR dependency.
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#42443f";
  ctx.fillRect(0, 0, 1024, 512);
  const glow = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: string,
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, "rgba(20, 22, 20, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  };
  glow(190, 170, 120, 170, "#fff2d8");
  glow(760, 205, 95, 200, "#e9f1ff");
  glow(520, 65, 330, 70, "#fff8e8");
  glow(420, 300, 35, 120, "#d98959");
  ctx.fillStyle = "#f8f4e8";
  ctx.fillRect(125, 130, 32, 170);
  ctx.fillStyle = "#c5d6df";
  ctx.fillRect(800, 80, 18, 240);
  const source = new THREE.CanvasTexture(canvas);
  source.mapping = THREE.EquirectangularReflectionMapping;
  source.colorSpace = THREE.SRGBColorSpace;
  const generator = new THREE.PMREMGenerator(renderer);
  const target = generator.fromEquirectangular(source);
  source.dispose();
  generator.dispose();
  return target;
}

function shapeMesh(
  shape: THREE.Shape,
  depth: number,
  material: THREE.Material,
  bevel = 0.025,
) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 80,
  });
  geometry.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geometry, material);
}

function disc(radius: number, depth: number, material: THREE.Material) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, TAU, false);
  return shapeMesh(shape, depth, material);
}

function ring(
  radius: number,
  width: number,
  depth: number,
  material: THREE.Material,
) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, TAU, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, radius - width, 0, TAU, true);
  shape.holes.push(hole);
  return shapeMesh(shape, depth, material, Math.min(width * 0.22, 0.018));
}

function tube(
  points: THREE.Vector3[],
  radius: number,
  material: THREE.Material,
  closed = false,
) {
  const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal");
  return new THREE.Mesh(
    new THREE.TubeGeometry(
      curve,
      Math.max(16, points.length * 6),
      radius,
      7,
      closed,
    ),
    material,
  );
}

function arc(
  radius: number,
  start: number,
  end: number,
  thickness: number,
  material: THREE.Material,
) {
  const points = Array.from({ length: 65 }, (_, i) => {
    const a = start + ((end - start) * i) / 64;
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  });
  return tube(points, thickness, material);
}

function bar(
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 10),
    material,
  );
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.clone().sub(a).normalize(),
  );
  return mesh;
}

function engravedMark(mark: Recipe["mark"], material: THREE.Material) {
  const group = new THREE.Group();
  if (mark === "sun") {
    group.add(arc(0.14, 0, TAU, 0.018, material));
    for (let i = 0; i < 12; i++) {
      const a = (i * TAU) / 12;
      group.add(
        bar(
          new THREE.Vector3(Math.cos(a) * 0.215, Math.sin(a) * 0.215, 0),
          new THREE.Vector3(
            Math.cos(a) * (i % 3 ? 0.29 : 0.34),
            Math.sin(a) * (i % 3 ? 0.29 : 0.34),
            0,
          ),
          0.012,
          material,
        ),
      );
    }
  } else if (mark === "wave") {
    for (let row = -1; row <= 1; row++) {
      const points = Array.from({ length: 25 }, (_, i) => {
        const x = (i / 24 - 0.5) * 0.61;
        return new THREE.Vector3(
          x,
          Math.sin((i / 24) * TAU) * 0.056 + row * 0.13,
          0,
        );
      });
      group.add(tube(points, 0.017, material));
    }
  } else {
    for (const side of [-1, 1]) {
      const stem = Array.from({ length: 17 }, (_, i) => {
        const a = -1.28 + (i / 16) * 2.38;
        return new THREE.Vector3(
          side * Math.cos(a) * 0.23,
          Math.sin(a) * 0.3,
          0,
        );
      });
      group.add(tube(stem, 0.011, material));
      for (let i = 0; i < 6; i++) {
        const a = -0.97 + i * 0.36;
        const leafShape = new THREE.Shape();
        leafShape.moveTo(0, 0);
        leafShape.quadraticCurveTo(0.075, 0.035, 0.045, 0.135);
        leafShape.quadraticCurveTo(-0.02, 0.09, 0, 0);
        const leaf = shapeMesh(leafShape, 0.006, material, 0.003);
        leaf.position.set(side * Math.cos(a) * 0.23, Math.sin(a) * 0.3, 0);
        leaf.rotation.z = side * (-a - 0.8);
        leaf.scale.x = side;
        group.add(leaf);
      }
    }
  }
  return group;
}

function buildRelic(recipe: Recipe, surface: THREE.Texture) {
  const root = new THREE.Group();
  const assemblies: THREE.Group[] = [];
  const finish =
    recipe.material === "bronze"
      ? { color: "#806244", metalness: 0.88, roughness: 0.4, clearcoat: 0.15 }
      : recipe.material === "silver"
        ? { color: "#c3cbd0", metalness: 1, roughness: 0.23, clearcoat: 0.32 }
        : { color: "#434b53", metalness: 0.42, roughness: 0.18, clearcoat: 1 };
  const body = new THREE.MeshPhysicalMaterial({
    ...finish,
    roughnessMap: surface,
    bumpMap: surface,
    bumpScale:
      recipe.material === "obsidian"
        ? 0.009
        : recipe.material === "bronze"
          ? 0.014
          : 0.023,
    clearcoatRoughness: 0.2,
    envMapIntensity: recipe.material === "obsidian" ? 2.2 : 1.35,
  });
  const edge = new THREE.MeshStandardMaterial({
    color:
      recipe.material === "silver"
        ? "#e5e2d2"
        : recipe.material === "bronze"
          ? "#b7996c"
          : "#d7ac67",
    metalness: 0.9,
    roughness: 0.24,
    envMapIntensity: 1.5,
  });
  const inset = new THREE.MeshStandardMaterial({
    color: recipe.material === "bronze" ? "#28352e" : "#242e34",
    metalness: recipe.material === "bronze" ? 0.38 : 0.65,
    roughness: 0.58,
    bumpMap: surface,
    bumpScale: 0.012,
  });
  const face = new THREE.Group();
  const add = (mesh: THREE.Object3D, z = 0) => {
    mesh.position.z = z;
    root.add(mesh);
    return mesh;
  };
  const addFace = (radius: number, z: number) => {
    face.add(disc(radius, 0.11, body));
    const field = disc(radius * 0.79, 0.022, inset);
    field.position.z = 0.075;
    face.add(field);
    const rim = ring(radius * 0.87, 0.027, 0.025, edge);
    rim.position.z = 0.084;
    face.add(rim);
    const mark = engravedMark(recipe.mark, edge);
    mark.position.z = 0.108;
    if (radius < 0.6) mark.scale.setScalar(0.79);
    face.add(mark);
    face.position.z = z;
    root.add(face);
  };

  if (recipe.intention === "protect") {
    addFace(0.73, 0.09);
    add(ring(0.92, 0.105, 0.09, body), -0.035);
    add(ring(0.96, 0.018, 0.035, edge), 0.015);
    add(ring(1.045, 0.026, 0.03, body), -0.075);
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * TAU;
      const r = i % 3 ? 0.84 : 0.81;
      add(
        bar(
          new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0),
          new THREE.Vector3(Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0),
          0.009,
          edge,
        ),
        0.035,
      );
    }
    for (let side = 0; side < 2; side++) {
      const assembly = new THREE.Group();
      const start = side * Math.PI + 0.018;
      assembly.add(arc(1.38, start, start + Math.PI - 0.036, 0.052, body));
      assembly.add(
        arc(1.32, start + 0.04, start + Math.PI - 0.08, 0.011, edge),
      );
      assembly.rotation.set(0.37, -0.16, -0.3);
      assembly.userData.openY = side ? -0.115 : 0.115;
      assembly.position.y = recipe.forged ? 0 : assembly.userData.openY;
      root.add(assembly);
      assemblies.push(assembly);
    }
    for (const direction of [-1, 1]) {
      add(
        bar(
          new THREE.Vector3(direction * 0.91, 0, 0),
          new THREE.Vector3(direction * 1.32, 0, 0),
          0.027,
          body,
        ),
        -0.06,
      );
      const rivet = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 12),
        edge,
      );
      rivet.position.set(direction * 1.11, 0, -0.06);
      root.add(rivet);
    }
  } else if (recipe.intention === "begin") {
    const triangle = (radius: number) =>
      Array.from({ length: 3 }, (_, i) => {
        const a = Math.PI / 2 + (i / 3) * TAU;
        return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      });
    const core = new THREE.Shape();
    const vertices = triangle(0.89);
    core.moveTo(vertices[0].x, vertices[0].y);
    vertices.slice(1).forEach((p) => core.lineTo(p.x, p.y));
    core.closePath();
    add(shapeMesh(core, 0.22, body, 0.055));
    addFace(0.405, 0.16);
    for (let layer = 0; layer < 2; layer++) {
      const points = triangle(layer ? 1.39 : 1.49);
      for (let i = 0; i < 3; i++) {
        const assembly = new THREE.Group();
        const first = points[i];
        const second = points[(i + 1) % 3];
        const midpoint = first.clone().add(second).multiplyScalar(0.5);
        assembly.add(
          bar(first, second, layer ? 0.028 : 0.056, layer ? edge : body),
        );
        const innerA = first.clone().multiplyScalar(0.94);
        const innerB = second.clone().multiplyScalar(0.94);
        assembly.add(bar(innerA, innerB, 0.009, edge));
        assembly.position.z = layer ? -0.24 : 0.2;
        assembly.userData.openX = midpoint.x * 0.18;
        assembly.userData.openY = midpoint.y * 0.18;
        if (!recipe.forged) {
          assembly.position.x = assembly.userData.openX;
          assembly.position.y = assembly.userData.openY;
        }
        root.add(assembly);
        assemblies.push(assembly);
        const joint = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.095, 0),
          edge,
        );
        joint.position.copy(first);
        assembly.add(joint);
      }
    }
    for (const p of triangle(1.39)) {
      root.add(
        bar(
          new THREE.Vector3(p.x, p.y, -0.24),
          new THREE.Vector3(p.x, p.y, 0.2),
          0.025,
          body,
        ),
      );
      root.add(bar(p.clone().multiplyScalar(0.62), p.clone(), 0.018, edge));
    }
  } else {
    for (let side = 0; side < 2; side++) {
      const assembly = new THREE.Group();
      const start = -Math.PI / 2 + side * Math.PI + 0.04;
      const orbit = arc(1.25, start, start + Math.PI - 0.08, 0.061, body);
      orbit.scale.set(0.7, 1.32, 1);
      assembly.add(orbit);
      const fine = arc(
        1.15,
        start + 0.035,
        start + Math.PI - 0.115,
        0.013,
        edge,
      );
      fine.scale.set(0.7, 1.32, 1);
      assembly.add(fine);
      assembly.userData.openX = side ? -0.095 : 0.095;
      assembly.position.x = recipe.forged ? 0 : assembly.userData.openX;
      root.add(assembly);
      assemblies.push(assembly);
    }
    const inner = ring(1.07, 0.035, 0.06, body);
    inner.scale.set(0.7, 1.31, 1);
    inner.rotation.set(0.15, -0.38, 0.08);
    add(inner, -0.06);
    const star = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 4;
      const radius = i % 2 ? 0.28 : i % 4 ? 0.75 : 1.18;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius;
      if (!i) star.moveTo(x, y);
      else star.lineTo(x, y);
    }
    star.closePath();
    add(shapeMesh(star, 0.095, body, 0.025));
    addFace(0.47, 0.1);
    for (const direction of [-1, 1]) {
      const end = new THREE.Mesh(new THREE.OctahedronGeometry(0.105, 0), edge);
      end.position.y = direction * 1.64;
      end.scale.set(0.7, 1.3, 0.7);
      root.add(end);
      root.add(
        bar(
          new THREE.Vector3(0, direction * 1.23, 0),
          new THREE.Vector3(0, direction * 1.61, 0),
          0.013,
          edge,
        ),
      );
    }
  }
  return { root, assemblies, materials: [body, edge, inset] };
}

function disposeModel(model: ReturnType<typeof buildRelic>) {
  model.root.traverse((object) => {
    if (object instanceof THREE.Mesh) object.geometry.dispose();
  });
  model.materials.forEach((material) => material.dispose());
}

function createEngine(
  host: HTMLDivElement,
  initial: Recipe,
  onError: () => void,
): Engine {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x141614, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.cssText =
    "display:block;width:100%;height:100%;touch-action:pan-y;";
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
  camera.position.set(0, 0, 6.6);
  const environment = makeEnvironment(renderer);
  if (environment) scene.environment = environment.texture;
  scene.add(new THREE.HemisphereLight(0xe7edf0, 0x65432d, 2.1));
  const key = new THREE.DirectionalLight(0xffe5bd, 4.5);
  key.position.set(-3, 4, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc8dcff, 2.8);
  fill.position.set(4, 1, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xef8959, 3.6);
  rim.position.set(-2, -1, -3);
  scene.add(rim);
  const surface = makeSurface();
  const pivot = new THREE.Group();
  pivot.rotation.set(POSE.x, POSE.y, POSE.z);
  scene.add(pivot);
  let recipe = initial;
  let model = buildRelic(recipe, surface);
  pivot.add(model.root);
  let disposed = false;
  let failed = false;
  let inView = true;
  let ticking = false;
  let dirty = true;
  const animations = new Set<gsap.core.Animation>();
  const draw = () => {
    if (disposed || failed || !inView || document.hidden) {
      stop();
      return;
    }
    if (dirty) {
      dirty = false;
      try {
        renderer.render(scene, camera);
      } catch {
        failed = true;
        stop();
        onError();
      }
    }
    // The scene is intentionally still at rest; no idle render loop is needed.
    if (!dirty) stop();
  };
  function stop() {
    gsap.ticker.remove(draw);
    ticking = false;
  }
  const requestDraw = () => {
    dirty = true;
    if (!ticking && !disposed && !failed && inView && !document.hidden) {
      ticking = true;
      gsap.ticker.add(draw);
    }
  };
  const animate = (target: object, values: gsap.TweenVars) => {
    if (recipe.reducedMotion) {
      gsap.set(target, { ...values, duration: 0, onUpdate: requestDraw });
      requestDraw();
      return;
    }
    const tween = gsap.to(target, {
      ...values,
      duration: recipe.reducedMotion ? 0 : (values.duration ?? 0.65),
      onUpdate: requestDraw,
    });
    animations.add(tween);
    tween.eventCallback("onComplete", () => {
      animations.delete(tween);
      requestDraw();
    });
    return tween;
  };
  const clearAnimations = () => {
    animations.forEach((animation) => animation.kill());
    animations.clear();
  };
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z =
      camera.aspect < 0.85 ? (6.6 * 0.85) / camera.aspect : 6.6;
    camera.updateProjectionMatrix();
    requestDraw();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const visibility = () => {
    if (document.hidden) stop();
    else requestDraw();
  };
  document.addEventListener("visibilitychange", visibility);
  const contextLost = (event: Event) => {
    event.preventDefault();
    failed = true;
    stop();
    onError();
  };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  let pointer: {
    id: number;
    x: number;
    y: number;
    rotationX: number;
    rotationY: number;
  } | null = null;
  const rotateX = gsap.quickTo(pivot.rotation, "x", {
    duration: 0.22,
    ease: "power2.out",
    onUpdate: requestDraw,
  });
  const rotateY = gsap.quickTo(pivot.rotation, "y", {
    duration: 0.22,
    ease: "power2.out",
    onUpdate: requestDraw,
  });
  const pointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    clearAnimations();
    rotateX.tween.pause();
    rotateY.tween.pause();
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rotationX: pivot.rotation.x,
      rotationY: pivot.rotation.y,
    };
    renderer.domElement.setPointerCapture(event.pointerId);
    renderer.domElement.style.cursor = "grabbing";
  };
  const pointerMove = (event: PointerEvent) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const x = THREE.MathUtils.clamp(
      pointer.rotationX + (event.clientY - pointer.y) * 0.006,
      -0.8,
      0.8,
    );
    const y = pointer.rotationY + (event.clientX - pointer.x) * 0.009;
    if (recipe.reducedMotion) {
      gsap.set(pivot.rotation, { x, y });
      requestDraw();
    } else {
      rotateX(x);
      rotateY(y);
    }
  };
  const pointerUp = (event: PointerEvent) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    if (renderer.domElement.hasPointerCapture(event.pointerId))
      renderer.domElement.releasePointerCapture(event.pointerId);
    pointer = null;
    renderer.domElement.style.cursor = "grab";
  };
  const canvas = renderer.domElement;
  canvas.style.cursor = "grab";
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("lostpointercapture", pointerUp);
  resize();
  if (!recipe.reducedMotion) {
    gsap.set(pivot.rotation, { y: -0.61, x: 0.08 });
    animate(pivot.rotation, { ...POSE, duration: 1.25, ease: "power3.out" });
  }
  requestDraw();
  return {
    update(next) {
      if (disposed) return;
      const changed =
        next.intention !== recipe.intention ||
        next.material !== recipe.material ||
        next.mark !== recipe.mark;
      const forgeChanged = next.forged !== recipe.forged;
      const sealed = next.forged && !recipe.forged;
      const wasReduced = recipe.reducedMotion;
      recipe = next;
      if (changed) {
        clearAnimations();
        pivot.remove(model.root);
        disposeModel(model);
        model = buildRelic(recipe, surface);
        pivot.add(model.root);
        if (!recipe.reducedMotion) {
          gsap.set(model.root.scale, { x: 0.9, y: 0.9, z: 0.9 });
          animate(model.root.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.55,
            ease: "power3.out",
          });
        }
      }
      if (!changed && forgeChanged) {
        model.assemblies.forEach((part) =>
          animate(part.position, {
            x: recipe.forged ? 0 : part.userData.openX || 0,
            y: recipe.forged ? 0 : part.userData.openY || 0,
            duration: 0.9,
            ease: "power3.inOut",
            overwrite: "auto",
          }),
        );
      }
      if (sealed) {
        rotateX.tween.pause();
        rotateY.tween.pause();
        animate(pivot.rotation, {
          ...POSE,
          y: POSE.y + Math.round((pivot.rotation.y - POSE.y) / TAU) * TAU,
          duration: 0.95,
          ease: "power3.inOut",
          overwrite: "auto",
        });
      }
      if (next.reducedMotion && !wasReduced) {
        animations.forEach((animation) => animation.progress(1));
        clearAnimations();
        rotateX.tween.pause();
        rotateY.tween.pause();
      }
      requestDraw();
    },
    rotate(direction) {
      rotateX.tween.pause();
      rotateY.tween.pause();
      animate(pivot.rotation, {
        y: pivot.rotation.y + (direction * Math.PI) / 5,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    reset() {
      rotateX.tween.pause();
      rotateY.tween.pause();
      animate(pivot.rotation, {
        ...POSE,
        y: POSE.y + Math.round((pivot.rotation.y - POSE.y) / TAU) * TAU,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    visible(value) {
      inView = value;
      if (value) requestDraw();
      else stop();
    },
    dispose() {
      disposed = true;
      stop();
      clearAnimations();
      rotateX.tween.kill();
      rotateY.tween.kill();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("lostpointercapture", pointerUp);
      disposeModel(model);
      surface.dispose();
      environment?.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

function RelicIllustration({
  intention,
  material,
  mark,
  forged,
}: RelicSceneProps) {
  const id = useId().replace(/:/g, "");
  const colors =
    material === "bronze"
      ? ["#d7c5a5", "#8f6f4e", "#453d31"]
      : material === "silver"
        ? ["#f6f4e9", "#b6c3c9", "#53616a"]
        : ["#adb8be", "#515b66", "#242d34"];
  const stroke = `url(#relic-metal-${id})`;
  const markColor = material === "silver" ? "#edead7" : "#dbb777";
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient
          id={`relic-metal-${id}`}
          x1="140"
          y1="110"
          x2="440"
          y2="490"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={colors[0]} />
          <stop offset=".32" stopColor={colors[1]} />
          <stop offset=".56" stopColor={colors[2]} />
          <stop offset=".83" stopColor={colors[1]} />
          <stop offset="1" stopColor={colors[0]} />
        </linearGradient>
        <radialGradient id={`relic-field-${id}`}>
          <stop stopColor="#40473d" />
          <stop offset="1" stopColor="#1a211f" />
        </radialGradient>
      </defs>
      <g transform="translate(300 300) rotate(-9)">
        {intention === "protect" && (
          <>
            <ellipse
              rx="191"
              ry="172"
              stroke={stroke}
              strokeWidth="9"
              strokeDasharray={forged ? undefined : "540 17"}
            />
            <ellipse
              rx="181"
              ry="163"
              stroke={markColor}
              strokeWidth="1.3"
              opacity=".65"
            />
            <path d="M-183 0H183" stroke={stroke} strokeWidth="6" />
            <circle r="131" stroke={stroke} strokeWidth="5" />
            <circle r="115" stroke={stroke} strokeWidth="17" />
            {Array.from({ length: 36 }, (_, i) => (
              <path
                key={i}
                d="M0-108V-119"
                stroke={markColor}
                strokeWidth="1.4"
                transform={`rotate(${i * 10})`}
              />
            ))}
            <circle r="95" fill={stroke} />
            <circle
              r="77"
              fill={`url(#relic-field-${id})`}
              stroke={markColor}
              strokeWidth="2"
            />
          </>
        )}
        {intention === "begin" && (
          <>
            <path
              d="M0-199 177 108H-177Z"
              transform="translate(0 22) scale(.92)"
              stroke={markColor}
              strokeWidth="3"
            />
            <path
              d="M0-199 177 108H-177Z"
              stroke={stroke}
              strokeWidth="10"
              strokeLinejoin="round"
              strokeDasharray={forged ? undefined : "174 12"}
            />
            <path
              d="M0-199V-90M177 108 70 40M-177 108-70 40"
              stroke={markColor}
              strokeWidth="3"
            />
            <path
              d="M0-119 103 62H-103Z"
              fill={stroke}
              stroke={markColor}
              strokeWidth="1"
            />
            <circle
              r="48"
              fill={`url(#relic-field-${id})`}
              stroke={markColor}
              strokeWidth="3"
            />
          </>
        )}
        {intention === "return" && (
          <>
            <ellipse
              rx="111"
              ry="212"
              stroke={stroke}
              strokeWidth="10"
              strokeDasharray={forged ? undefined : "505 15"}
            />
            <ellipse rx="99" ry="195" stroke={markColor} strokeWidth="1.5" />
            <ellipse
              rx="77"
              ry="176"
              stroke={stroke}
              strokeWidth="4"
              transform="rotate(9)"
            />
            <path
              d="M0-154 28-32 98 0 28 32 0 154-28 32-98 0-28-32Z"
              fill={stroke}
              stroke={markColor}
              strokeWidth="1"
            />
            <path d="M0-213V213" stroke={markColor} strokeWidth="2" />
            <circle r="57" fill={stroke} />
            <circle
              r="47"
              fill={`url(#relic-field-${id})`}
              stroke={markColor}
              strokeWidth="2"
            />
          </>
        )}
        <g
          stroke={markColor}
          strokeWidth="2.7"
          strokeLinecap="round"
          transform={`scale(${intention === "protect" ? 1.2 : 0.82})`}
        >
          {mark === "sun" && (
            <>
              <circle r="15" />
              {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d="M0-24V-34" transform={`rotate(${i * 30})`} />
              ))}
            </>
          )}
          {mark === "wave" &&
            [-14, 0, 14].map((y) => (
              <path
                key={y}
                d="M-33 0Q-17-15 0 0T33 0"
                transform={`translate(0 ${y})`}
              />
            ))}
          {mark === "laurel" && (
            <>
              <path d="M-5 34C-39 12-31-18-15-33M5 34C39 12 31-18 15-33" />
              {[-1, 1].map((side) => (
                <g key={side} transform={`scale(${side} 1)`}>
                  {[-19, -7, 6, 19].map((y, i) => (
                    <path
                      key={y}
                      d="M0 0Q-16-2-12-15Q3-11 0 0Z"
                      fill={markColor}
                      strokeWidth="0.5"
                      transform={`translate(${25 - Math.abs(i - 1.5) * 3} ${y}) rotate(${i * -10})`}
                    />
                  ))}
                </g>
              ))}
            </>
          )}
        </g>
      </g>
    </svg>
  );
}

export default function RelicScene({
  intention,
  material,
  mark,
  forged = false,
  reducedMotion = false,
}: RelicSceneProps) {
  const figure = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const current = useRef<Recipe>({
    intention,
    material,
    mark,
    forged,
    reducedMotion,
  });
  const requestedReducedMotion = useRef(reducedMotion);
  const [status, setStatus] = useState<"waiting" | "ready" | "fallback">(
    "waiting",
  );
  const description = `${NAMES[intention]}, ${material}, ${mark} mark. ${intention === "protect" ? "A layered shield enclosed by a circular orbit." : intention === "begin" ? "A triangular core suspended inside an angular cage." : "A compass suspended in an elongated orbit."}`;

  useGSAP(
    () => {
      requestedReducedMotion.current = reducedMotion;
      current.current = {
        intention,
        material,
        mark,
        forged,
        reducedMotion:
          reducedMotion ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      };
      engine.current?.update(current.current);
    },
    {
      scope: figure,
      dependencies: [intention, material, mark, forged, reducedMotion],
    },
  );

  useGSAP(
    (_context, contextSafe) => {
      if (!stage.current || !host.current) return;
      let disposed = false;
      let attempted = false;
      const motionPreference = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      const updateMotion = () => {
        current.current = {
          ...current.current,
          reducedMotion:
            requestedReducedMotion.current || motionPreference.matches,
        };
        engine.current?.update(current.current);
      };
      motionPreference.addEventListener("change", updateMotion);
      const fail = () => {
        if (disposed) return;
        setStatus("fallback");
        engine.current?.visible(false);
      };
      const initialize = contextSafe!(() => {
        if (attempted || disposed || !host.current) return;
        attempted = true;
        try {
          engine.current = createEngine(host.current, current.current, fail);
          setStatus("ready");
        } catch {
          engine.current?.dispose();
          engine.current = null;
          host.current.replaceChildren();
          fail();
        }
      });
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) initialize();
          engine.current?.visible(entry.isIntersecting);
        },
        { rootMargin: "160px 0px" },
      );
      observer.observe(stage.current);
      return () => {
        disposed = true;
        observer.disconnect();
        motionPreference.removeEventListener("change", updateMotion);
        engine.current?.dispose();
        engine.current = null;
      };
    },
    { scope: figure },
  );

  return (
    <figure className="relic-scene" ref={figure} style={{ margin: 0 }}>
      <div
        className="relic-scene-stage"
        ref={stage}
        role="img"
        aria-label={description}
        style={{ position: "relative", aspectRatio: "1 / 1", minHeight: 300 }}
      >
        <div
          className="relic-scene-fallback"
          style={{
            position: "absolute",
            inset: 0,
            visibility: status === "ready" ? "hidden" : "visible",
          }}
        >
          <RelicIllustration
            intention={intention}
            material={material}
            mark={mark}
            forged={forged}
          />
        </div>
        <div
          className="relic-scene-canvas"
          ref={host}
          style={{
            position: "absolute",
            inset: 0,
            visibility: status === "ready" ? "visible" : "hidden",
          }}
        />
      </div>
      <figcaption className="relic-scene-caption">
        <span className="relic-scene-hint">
          {status === "ready"
            ? "Drag to inspect your relic"
            : "Illustrated relic preview"}
        </span>
        <div
          className="relic-scene-controls"
          role="group"
          aria-label="Relic viewing controls"
        >
          <button
            className="relic-scene-control"
            type="button"
            aria-label="Rotate relic left"
            disabled={status !== "ready"}
            onClick={() => engine.current?.rotate(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            className="relic-scene-control"
            type="button"
            aria-label="Reset view of relic"
            disabled={status !== "ready"}
            onClick={() => engine.current?.reset()}
          >
            Reset view
          </button>
          <button
            className="relic-scene-control"
            type="button"
            aria-label="Rotate relic right"
            disabled={status !== "ready"}
            onClick={() => engine.current?.rotate(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </figcaption>
      {status === "fallback" && (
        <p className="relic-scene-status" role="status">
          Your device is showing the illustrated preview. All relic choices and
          downloads remain available.
        </p>
      )}
    </figure>
  );
}
