import Phaser from "phaser";
import { TaxiType } from "../types";
import NORMAL from "../../assets/taxi_NORMAL.png.asset.json";
import RAPIDO from "../../assets/taxi_RAPIDO.png.asset.json";
import GRANDE from "../../assets/taxi_GRANDE.png.asset.json";
import ESPECIAL from "../../assets/taxi_ESPECIAL.png.asset.json";
import DOURADO from "../../assets/taxi_DOURADO.png.asset.json";

/** Dimensões de cada frame das folhas renderizadas da Hiace. */
export const TAXI_SHEET_W = 148;
export const TAXI_SHEET_H = 84;

/** Folha (2 frames) por tipo de táxi — todas a mesma carrinha, cores diferentes. */
export const TAXI_SHEETS: Record<TaxiType, string> = {
  [TaxiType.NORMAL]: NORMAL.url,
  [TaxiType.RAPIDO]: RAPIDO.url,
  [TaxiType.GRANDE]: GRANDE.url,
  [TaxiType.ESPECIAL]: ESPECIAL.url,
  [TaxiType.DOURADO]: DOURADO.url,
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

  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  scene.textures.remove(key);
  scene.textures.addSpriteSheet(key, canvas as unknown as HTMLImageElement, {
    frameWidth: TAXI_SHEET_W,
    frameHeight: TAXI_SHEET_H,
  });
  return true;
}

/** true quando a folha real já está registada com o frame jogável. */
export function hasTaxiSheet(scene: Phaser.Scene, key: string): boolean {
  if (!scene.textures.exists(key)) return false;
  return scene.textures.get(key).has("0");
}
