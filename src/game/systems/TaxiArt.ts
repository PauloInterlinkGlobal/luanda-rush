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
    const key = `taxi_${type}`;
    if (scene.textures.exists(key)) return;
    scene.load.spritesheet(key, url, {
      frameWidth: TAXI_SHEET_W,
      frameHeight: TAXI_SHEET_H,
    });
  });
}

/** true quando a folha real já está registada com os 2 frames. */
export function hasTaxiSheet(scene: Phaser.Scene, key: string): boolean {
  if (!scene.textures.exists(key)) return false;
  const tex = scene.textures.get(key);
  return tex.has("0") && tex.has("1");
}
