import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type Phaser from "phaser";

const MODEL_URL = "/hiace_van.glb";
const CANVAS_SIZE = 256;

let renderPromise: Promise<HTMLCanvasElement> | undefined;

async function loadModel(): Promise<THREE.Group> {
  const response = await fetch(MODEL_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Não foi possível carregar ${MODEL_URL}: ${response.status}`);
  const buffer = await response.arrayBuffer();

  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(buffer, "/", (gltf) => resolve(gltf.scene), reject);
  });
}

async function renderHiace(): Promise<HTMLCanvasElement> {
  const webglCanvas = document.createElement("canvas");
  webglCanvas.width = CANVAS_SIZE;
  webglCanvas.height = CANVAS_SIZE;
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = CANVAS_SIZE;
  outputCanvas.height = CANVAS_SIZE;

  const renderer = new THREE.WebGLRenderer({ canvas: webglCanvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(CANVAS_SIZE, CANVAS_SIZE, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff4d6, 0x243047, 2.8));
  const key = new THREE.DirectionalLight(0xffffff, 4);
  key.position.set(4, 8, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffc31f, 1.2);
  fill.position.set(-5, 3, -4);
  scene.add(fill);

  const model = await loadModel();
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = false;
      object.receiveShadow = false;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
    }
  });
  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  model.position.sub(center);
  model.position.y -= size.y * 0.08;
  model.rotation.y = -Math.PI * 0.16;

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  const viewSize = maxSize * 1.28;
  camera.left = -viewSize;
  camera.right = viewSize;
  camera.top = viewSize;
  camera.bottom = -viewSize;
  camera.position.set(maxSize * 1.5, maxSize * 0.95, maxSize * 1.7);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);
  const outputContext = outputCanvas.getContext("2d");
  if (!outputContext) throw new Error("Não foi possível criar o canvas 2D do táxi Hiace");
  outputContext.drawImage(renderer.domElement, 0, 0);
  renderer.dispose();
  return outputCanvas;
}

export async function registerHiaceTaxiTexture(scene: Phaser.Scene): Promise<void> {
  if (scene.textures.exists("hiace_taxi")) return;
  renderPromise ??= renderHiace();
  const canvas = await renderPromise;
  if (!scene.textures.exists("hiace_taxi")) {
    scene.textures.addBase64("hiace_taxi", canvas.toDataURL("image/png"));
  }
}

export async function registerHiaceTaxiAliases(scene: Phaser.Scene, keys: string[]): Promise<void> {
  renderPromise ??= renderHiace();
  const canvas = await renderPromise;
  for (const key of keys) {
    if (!scene.textures.exists(key)) scene.textures.addCanvas(key, canvas);
  }
}
