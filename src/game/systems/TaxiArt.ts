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

  const source = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
  const texture = scene.textures.createCanvas(key, TAXI_SHEET_W * 2, TAXI_SHEET_H);
  if (!texture) return false;
  const ctx = texture.getContext();
  ctx.clearRect(0, 0, TAXI_SHEET_W * 2, TAXI_SHEET_H);
  ctx.imageSmoothingEnabled = true;

  const frameW = Math.floor(source.width / 2);
  const drawW = TAXI_SHEET_W - 4;
  const drawH = Math.min(TAXI_SHEET_H - 4, Math.round(drawW * (source.height / frameW)));
  const drawY = TAXI_SHEET_H - drawH - 2;

  // As imagens fornecidas têm duas vans lado a lado: cada metade é um frame.
  for (let frame = 0; frame < 2; frame += 1) {
    ctx.drawImage(
      source,
      frame * frameW,
      0,
      frameW,
      source.height,
      frame * TAXI_SHEET_W + 2,
      drawY + (frame === 1 ? 1 : 0),
      drawW,
      drawH,
    );
  }
  texture.refresh();
  texture.add("0", 0, 0, 0, TAXI_SHEET_W, TAXI_SHEET_H);
  texture.add("1", 0, TAXI_SHEET_W, 0, TAXI_SHEET_W, TAXI_SHEET_H);
  return true;
}

/** true quando a folha real já está registada com o frame jogável. */
export function hasTaxiSheet(scene: Phaser.Scene, key: string): boolean {
  if (!scene.textures.exists(key)) return false;
  return scene.textures.get(key).has("0");
}
