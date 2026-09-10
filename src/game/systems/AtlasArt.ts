import Phaser from "phaser";
import { FRAME_H, FRAME_W, FRAMES_PER_ROW, TAXI_H, TAXI_W, css } from "./ProceduralArt";
import FRAMES from "../data/atlas-frames.json";
import PLAYER_SHEET from "../data/player-frames.json";
export const ATLAS_KEY = "lotador_sprites";
// Assets públicos e same-origin evitam imports dinâmicos de PNG pelo Vite.
export const ATLAS_URL = "/lotador_atlas_clean.png";
export const PLAYER_SHEET_KEY = "player_sheet";
export const PLAYER_SHEET_URL = "/player_sheet.png";

type Rect = { x: number; y: number; w: number; h: number };
const RECTS = FRAMES as Record<string, Rect>;
const PLAYER_RECTS = PLAYER_SHEET.frames as Record<string, Rect>;

/** Opções de personalização aplicadas por cima do frame real. */
export interface RecolorOptions {
  shirt?: number;
  pants?: number;
  shoes?: number;
  accessory?: "cap" | "hat" | "bag" | "none";
  accessoryColor?: number;
}

export function hasFrame(name: string): boolean {
  return Boolean(RECTS[name]);
}

function source(scene: Phaser.Scene): HTMLImageElement | HTMLCanvasElement | null {
  if (!scene.textures.exists(ATLAS_KEY)) return null;
  const img = scene.textures.get(ATLAS_KEY).getSourceImage();
  return img as HTMLImageElement;
}

function hasRecolor(o?: RecolorOptions): boolean {
  if (!o) return false;
  return (
    o.shirt !== undefined ||
    o.pants !== undefined ||
    o.shoes !== undefined ||
    (o.accessory !== undefined && o.accessory !== "none")
  );
}

/**
 * Recolore um recorte já desenhado: aplica a cor (matiz + saturação) em
 * faixas verticais — tronco, pernas e pés — preservando o sombreado do sprite.
 */
function paintBands(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  rect: Rect,
  w: number,
  h: number,
  o: RecolorOptions,
): void {
  const bands: [number, number, number | undefined][] = [
    [0.3, 0.62, o.shirt],
    [0.62, 0.84, o.pants],
    [0.84, 1.0, o.shoes],
  ];
  bands.forEach(([a, b, color]) => {
    if (color === undefined) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, h * a, w, h * (b - a));
    ctx.clip();
    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = css(color);
    ctx.fillRect(0, h * a, w, h * (b - a));
    ctx.restore();
  });
  // Repõe o alpha original (o preenchimento pode ter transbordado).
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);
  ctx.restore();
}

/** Desenha o acessório escolhido por cima da cabeça do sprite. */
function paintAccessory(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  o: RecolorOptions,
): void {
  const type = o.accessory;
  if (!type || type === "none") return;
  const color = css(o.accessoryColor ?? 0xe23b3b);
  const cx = w / 2;
  const headY = h * 0.16;
  ctx.save();
  ctx.fillStyle = color;
  if (type === "cap") {
    ctx.beginPath();
    ctx.ellipse(cx, headY, w * 0.19, h * 0.055, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - w * 0.05, headY, w * 0.28, h * 0.022);
  } else if (type === "hat") {
    ctx.fillRect(cx - w * 0.3, headY, w * 0.6, h * 0.022);
    ctx.beginPath();
    ctx.ellipse(cx, headY - h * 0.01, w * 0.16, h * 0.06, 0, Math.PI, 0);
    ctx.fill();
  } else if (type === "bag") {
    ctx.fillRect(cx + w * 0.12, h * 0.42, w * 0.16, h * 0.18);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, w * 0.03);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.06, h * 0.34);
    ctx.lineTo(cx + w * 0.18, h * 0.44);
    ctx.stroke();
  }
  ctx.restore();
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
  recolor?: RecolorOptions,
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
  if (hasRecolor(recolor)) {
    const cw = Math.max(1, Math.ceil(w));
    const ch = Math.max(1, Math.ceil(h));
    const tmp = document.createElement("canvas");
    tmp.width = cw;
    tmp.height = ch;
    const tctx = tmp.getContext("2d");
    if (tctx) {
      tctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, cw, ch);
      paintBands(tctx, img, rect, cw, ch, recolor!);
      paintAccessory(tctx, cw, ch, recolor!);
      ctx.drawImage(tmp, x, y, w, h);
      ctx.restore();
      return;
    }
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
  recolor?: RecolorOptions,
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
      drawFrame(ctx, img, rect, cx, bottom, FRAME_W - 4, FRAME_H - 6, flip, bobs[f] ?? 0, recolor);
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

/** Constrói a spritesheet do jogador a partir do sheet real limpo (6x4). */
export function buildPlayerFromSheet(
  scene: Phaser.Scene,
  key: string,
  recolor?: RecolorOptions,
): boolean {
  if (!scene.textures.exists(PLAYER_SHEET_KEY)) return false;
  const img = scene.textures.get(PLAYER_SHEET_KEY).getSourceImage() as CanvasImageSource;
  // linhas na ordem DIR_ROWS: down(front), left, right, up(back)
  const rows = ["front", "left", "right", "back"];
  // colunas -> idle, walk x4, interact
  const cols = ["idle_0", "run_0", "run_1", "run_2", "run_3", "idle_1"];

  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, FRAME_W * FRAMES_PER_ROW, FRAME_H * 4);
  if (!tex) return false;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;

  rows.forEach((dir, row) => {
    cols.forEach((state, f) => {
      const rect = PLAYER_RECTS[`${dir}_${state}`];
      if (!rect) return;
      const cx = f * FRAME_W + FRAME_W / 2;
      const bottom = row * FRAME_H + FRAME_H - 2;
      drawFrame(ctx, img, rect, cx, bottom, FRAME_W - 2, FRAME_H - 4, false, 0, recolor);
    });
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
