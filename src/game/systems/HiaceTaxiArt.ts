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

  // O sprite final é sempre a vista lateral azul da referência do jogo.
  // Recortamos o espaço transparente original antes de redimensionar para
  // impedir que a van apareça pequena dentro de uma moldura invisível.
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("Não foi possível preparar o sprite do táxi Hiace");
  sourceContext.drawImage(image, 0, 0);
  const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
  let minX = sourceCanvas.width;
  let minY = sourceCanvas.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < sourceCanvas.height; y++) {
    for (let x = 0; x < sourceCanvas.width; x++) {
      if (pixels[(y * sourceCanvas.width + x) * 4 + 3] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const sourceX = maxX >= 0 ? minX : 0;
  const sourceY = maxY >= 0 ? minY : 0;
  const sourceWidth = maxX >= 0 ? maxX - minX + 1 : image.naturalWidth;
  const sourceHeight = maxY >= 0 ? maxY - minY + 1 : image.naturalHeight;
  const targetWidth = 190;
  const targetHeight = 78;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (CANVAS_WIDTH - width) / 2;
  const y = (CANVAS_HEIGHT - height) / 2;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );

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
