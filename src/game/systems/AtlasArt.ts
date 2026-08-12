import Phaser from "phaser";
import { FRAME_H, FRAME_W, FRAMES_PER_ROW, TAXI_H, TAXI_W } from "./ProceduralArt";
import FRAMES from "../data/atlas-frames.json";
import ATLAS_ASSET from "../../assets/lotador_sprites.png.asset.json";

export const ATLAS_KEY = "lotador_sprites";
export const ATLAS_URL = ATLAS_ASSET.url;

type Rect = { x: number; y: number; w: number; h: number };
const RECTS = FRAMES as Record<string, Rect>;

export function hasFrame(name: string): boolean {
  return Boolean(RECTS[name]);
}

function source(scene: Phaser.Scene): HTMLImageElement | HTMLCanvasElement | null {
  if (!scene.textures.exists(ATLAS_KEY)) return null;
  const img = scene.textures.get(ATLAS_KEY).getSourceImage();
  return img as HTMLImageElement;
}

/** Desenha um frame do atlas dentro de uma célula, alinhado ao chão. */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  rect: Rect,
  cx: number,
  bottom: number,
  maxW: number,
  maxH: number,
  flip: boolean,
  bob: number,
): void {
  const scale = Math.min(maxW / rect.w, maxH / rect.h);
  const w = rect.w * scale;
  const h = rect.h * scale;
  const x = cx - w / 2;
  const y = bottom - h + bob;
  ctx.save();
  if (flip) {
    ctx.translate(cx * 2, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, x, y, w, h);
  ctx.restore();
}

/**
 * Constrói a spritesheet de um personagem (6 frames x 4 direcções) a partir
 * dos frames reais do atlas. Mantém exactamente o mesmo layout que a versão
 * procedural, por isso todas as animações registadas continuam válidas.
 */
export function buildCharacterFromAtlas(
  scene: Phaser.Scene,
  key: string,
  frames: { down: string; up?: string; side?: string },
): boolean {
  const img = source(scene);
  const down = RECTS[frames.down];
  if (!img || !down) return false;
  const up = (frames.up && RECTS[frames.up]) || down;
  const side = (frames.side && RECTS[frames.side]) || down;

  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, FRAME_W * FRAMES_PER_ROW, FRAME_H * 4);
  if (!tex) return false;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;

  const rows: [Rect, boolean][] = [
    [down, false],
    [side, false],
    [side, true],
    [up, false],
  ];
  // bob por frame: idle, 4 de caminhada, interagir
  const bobs = [0, -2, 0, -2, 0, -1];

  rows.forEach(([rect, flip], row) => {
    for (let f = 0; f < FRAMES_PER_ROW; f++) {
      const cx = f * FRAME_W + FRAME_W / 2;
      const bottom = row * FRAME_H + FRAME_H - 2;
      drawFrame(ctx, img, rect, cx, bottom, FRAME_W - 4, FRAME_H - 6, flip, bobs[f] ?? 0);
    }
  });

  tex.refresh();
  const t = scene.textures.get(key);

  for (let i = 0; i < FRAMES_PER_ROW * 4; i++) {
    const col = i % FRAMES_PER_ROW;
    const row = Math.floor(i / FRAMES_PER_ROW);
    t.add(i, 0, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
  }
  return true;
}

/** Constrói a textura de um táxi (2 frames) a partir do atlas. */
export function buildTaxiFromAtlas(scene: Phaser.Scene, key: string, frameName: string): boolean {
  const img = source(scene);
  const rect = RECTS[frameName];
  if (!img || !rect) return false;

  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, TAXI_W * 2, TAXI_H);
  if (!tex) return false;
  const ctx = tex.getContext();
  for (let f = 0; f < 2; f++) {
    const cx = f * TAXI_W + TAXI_W / 2;
    drawFrame(ctx, img, rect, cx, TAXI_H - 2, TAXI_W - 6, TAXI_H - 6, false, f === 1 ? -1 : 0);
  }
  tex.refresh();
  const t = scene.textures.get(key);
  for (let f = 0; f < 2; f++) t.add(f, 0, f * TAXI_W, 0, TAXI_W, TAXI_H);
  return true;
}

/** Constrói uma textura simples (prop / efeito) a partir do atlas. */
export function buildSpriteFromAtlas(
  scene: Phaser.Scene,
  key: string,
  frameName: string,
  maxW: number,
  maxH: number,
): boolean {
  const img = source(scene);
  const rect = RECTS[frameName];
  if (!img || !rect) return false;
  const scale = Math.min(maxW / rect.w, maxH / rect.h, 1.6);
  const w = Math.max(4, Math.round(rect.w * scale));
  const h = Math.max(4, Math.round(rect.h * scale));
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return false;
  tex.getContext().drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);
  tex.refresh();
  return true;
}
