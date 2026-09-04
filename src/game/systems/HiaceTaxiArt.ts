import type Phaser from "phaser";

const TAXI_IMAGE_URL = "/hiace_van.png";
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 128;

let renderPromise: Promise<HTMLCanvasElement> | undefined;

function loadTaxiImage(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Não foi possível carregar ${TAXI_IMAGE_URL}`));
    image.src = TAXI_IMAGE_URL;
  });
}

async function renderHiace(): Promise<HTMLCanvasElement> {
  const image = await loadTaxiImage();
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível criar o canvas do táxi Hiace");

  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.imageSmoothingEnabled = true;

  // A imagem fornecida é a vista lateral definitiva do jogo. Mantemos a
  // proporção e o fundo transparente, sem perspectiva ou renderização 3D.
  const scale = Math.min(
    (CANVAS_WIDTH - 8) / image.naturalWidth,
    (CANVAS_HEIGHT - 8) / image.naturalHeight,
  );
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (CANVAS_WIDTH - width) / 2;
  const y = (CANVAS_HEIGHT - height) / 2;
  context.drawImage(image, x, y, width, height);

  return canvas;
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
  const dataUrl = canvas.toDataURL("image/png");

  for (const key of keys) {
    if (!scene.textures.exists(key)) scene.textures.addBase64(key, dataUrl);
  }
}

export function getHiaceTaxiTextureSize(): { width: number; height: number } {
  return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
}

export const HIACE_TAXI_IMAGE_URL = TAXI_IMAGE_URL;

void getHiaceTaxiTextureSize;
void HIACE_TAXI_IMAGE_URL;
