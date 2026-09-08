import Phaser from "phaser";
import { TaxiType } from "../types";

/** Dimensões de cada frame das folhas renderizadas da Hiace. */
export const TAXI_SHEET_W = 148;
export const TAXI_SHEET_H = 84;

/** Folha (2 frames) por tipo de táxi — todas a mesma carrinha, cores diferentes. */
export const TAXI_SHEETS: Record<TaxiType, string> = {
  [TaxiType.NORMAL]: "/assets/taxi_blue.png",
  [TaxiType.RAPIDO]: "/assets/taxi_yellow.png",
  [TaxiType.GRANDE]: "/assets/taxi_red.png",
  [TaxiType.ESPECIAL]: "/assets/taxi_green.png",
  [TaxiType.DOURADO]: "/assets/taxi_yellow.png",
};

/** Pré-carrega as folhas reais dos táxis. */
export function preloadTaxiSheets(scene: Phaser.Scene): void {
  (Object.entries(TAXI_SHEETS) as [TaxiType, string][]).forEach(([type, url]) => {
    const key = `taxi_src_${type}`;
    if (scene.textures.exists(key)) return;
    // As artes fornecidas são imagens individuais 1200x600, não spritesheets.
    scene.load.image(key, url);
  });
}

/** Cria a textura jogável a partir da imagem individual da Hiace. */
export function buildTaxiFromSheet(scene: Phaser.Scene, key: string): boolean {
  if (scene.textures.exists(key)) return true;
  const sourceKey = key.replace("taxi_", "taxi_src_");
  if (!scene.textures.exists(sourceKey)) return false;

  const source = scene.textures.get(sourceKey).getSourceImage() as CanvasImageSource;
  const texture = scene.textures.createCanvas(key, TAXI_SHEET_W, TAXI_SHEET_H);
  if (!texture) return false;
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, TAXI_SHEET_W, TAXI_SHEET_H);
  ctx.imageSmoothingEnabled = true;

  const drawW = TAXI_SHEET_W - 4;
  const drawH = Math.round(drawW * 0.5);
  const drawY = TAXI_SHEET_H - drawH - 2;
  ctx.drawImage(source, 0, 0, source.width, source.height, 2, drawY, drawW, drawH);
  texture.refresh();

  // CanvasTexture já é a textura final; adicionamos frames válidos manualmente
  // para que Phaser consiga usar frame 0 sem tentar interpretar a imagem original.
  texture.add("0", 0, 0, 0, TAXI_SHEET_W, TAXI_SHEET_H);
  return true;
}

/** true quando a folha real já está registada com o frame jogável. */
export function hasTaxiSheet(scene: Phaser.Scene, key: string): boolean {
  if (!scene.textures.exists(key)) return false;
  return scene.textures.get(key).has("0");
}
