import Phaser from "phaser";
import { PALETTE } from "../config/AssetConfig";
import type { CharacterSkin } from "../types";

/** Converte 0xRRGGBB em string CSS. */
export function css(color: number): string {
  return "#" + color.toString(16).padStart(6, "0");
}

function shade(color: number, amount: number): number {
  const r = Math.max(0, Math.min(255, Math.round(((color >> 16) & 0xff) * amount)));
  const g = Math.max(0, Math.min(255, Math.round(((color >> 8) & 0xff) * amount)));
  const b = Math.max(0, Math.min(255, Math.round((color & 0xff) * amount)));
  return (r << 16) | (g << 8) | b;
}

export const FRAME_W = 48;
export const FRAME_H = 64;
export const FRAMES_PER_ROW = 6;
export const DIR_ROWS = ["down", "left", "right", "up"] as const;

function pick(list: number[], index: number): number {
  return list[index % list.length] ?? list[0] ?? 0xffffff;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Desenha um personagem cartoon num frame 48x64.
 * `phase` controla o ciclo de passada (0 = parado).
 */
function drawCharacter(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  s: CharacterSkin,
  dir: (typeof DIR_ROWS)[number],
  phase: number,
  pose: "idle" | "walk" | "special",
) {
  const skin = pick(PALETTE.skins, s.skin);
  const hair = pick(PALETTE.hair, s.hair);
  const shirt = pick(PALETTE.shirts, s.shirt);
  const pants = pick(PALETTE.pants, s.pants);
  const shoes = pick(PALETTE.shoes, s.shoes);

  const cx = ox + FRAME_W / 2;
  const groundY = oy + 60;
  const swing = pose === "walk" ? Math.sin(phase * Math.PI * 0.5) * 5 : 0;
  const bob = pose === "walk" ? Math.abs(Math.sin(phase * Math.PI * 0.5)) * -2 : 0;
  const armUp = pose === "special" ? -10 : 0;

  ctx.save();

  // Sombra
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(cx, groundY + 2, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const bodyY = oy + 26 + bob;

  // Pernas
  ctx.fillStyle = css(pants);
  ctx.fillRect(cx - 7, bodyY + 18, 6, 12 + swing * 0.4);
  ctx.fillRect(cx + 1, bodyY + 18, 6, 12 - swing * 0.4);
  // Sapatos
  ctx.fillStyle = css(shoes);
  ctx.fillRect(cx - 8, groundY - 4 + swing * 0.5, 8, 4);
  ctx.fillRect(cx + 1, groundY - 4 - swing * 0.5, 8, 4);

  // Tronco (t-shirt)
  ctx.fillStyle = css(shirt);
  roundRect(ctx, cx - 9, bodyY, 18, 20, 4);
  // Sombreado lateral
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(cx + 4, bodyY + 2, 5, 18);

  // Braços
  ctx.fillStyle = css(skin);
  const armSwing = pose === "walk" ? swing * 0.6 : 0;
  ctx.fillRect(cx - 13, bodyY + 3 + armSwing + armUp, 4, 13);
  ctx.fillRect(cx + 9, bodyY + 3 - armSwing + armUp, 4, 13);

  // Pescoço + cabeça
  ctx.fillStyle = css(shade(skin, 0.85));
  ctx.fillRect(cx - 3, bodyY - 4, 6, 5);
  ctx.fillStyle = css(skin);
  ctx.beginPath();
  ctx.arc(cx, bodyY - 10, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Cabelo
  ctx.fillStyle = css(hair);
  if (dir === "up") {
    ctx.beginPath();
    ctx.arc(cx, bodyY - 10, 8.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(cx, bodyY - 12, 8.6, Math.PI, Math.PI * 2);
    ctx.fill();
    if (s.female) {
      ctx.beginPath();
      ctx.arc(cx, bodyY - 11, 10, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill();
      ctx.fillRect(cx - 10, bodyY - 12, 3, 10);
      ctx.fillRect(cx + 7, bodyY - 12, 3, 10);
    }
  }

  // Rosto
  if (dir !== "up") {
    ctx.fillStyle = "#12161d";
    const eyeShift = dir === "left" ? -2 : dir === "right" ? 2 : 0;
    ctx.fillRect(cx - 3.5 + eyeShift, bodyY - 11, 2, 2.5);
    ctx.fillRect(cx + 1.5 + eyeShift, bodyY - 11, 2, 2.5);
    if (pose === "special") {
      ctx.fillStyle = "#12161d";
      ctx.beginPath();
      ctx.ellipse(cx + eyeShift, bodyY - 6, 3, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Acessório
  if (s.accessory === "cap") {
    ctx.fillStyle = css(0xe23b3b);
    ctx.beginPath();
    ctx.arc(cx, bodyY - 13, 8.8, Math.PI, Math.PI * 2);
    ctx.fill();
    const brim = dir === "left" ? -12 : dir === "right" ? 4 : -5;
    if (dir !== "up") ctx.fillRect(cx + brim, bodyY - 14, 9, 2.5);
  } else if (s.accessory === "hat") {
    ctx.fillStyle = css(0x6b4a2a);
    ctx.fillRect(cx - 12, bodyY - 15, 24, 3);
    ctx.fillRect(cx - 7, bodyY - 21, 14, 7);
  } else if (s.accessory === "bag") {
    ctx.fillStyle = css(0x4a3524);
    ctx.fillRect(cx - 12, bodyY + 4, 5, 10);
  }

  ctx.restore();
}

/** Cria (uma vez) o spritesheet de um personagem. */
export function buildCharacterSheet(
  scene: Phaser.Scene,
  key: string,
  skin: CharacterSkin,
): void {
  if (scene.textures.exists(key)) return;
  const w = FRAME_W * FRAMES_PER_ROW;
  const h = FRAME_H * DIR_ROWS.length;
  // Canvas próprio (não usar textures.createCanvas + remove: o canvas volta
  // ao pool do Phaser e é reutilizado, corrompendo a textura).
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  DIR_ROWS.forEach((dir, row) => {
    for (let col = 0; col < FRAMES_PER_ROW; col++) {
      const ox = col * FRAME_W;
      const oy = row * FRAME_H;
      if (col === 0) drawCharacter(ctx, ox, oy, skin, dir, 0, "idle");
      else if (col === 5) drawCharacter(ctx, ox, oy, skin, dir, 0, "special");
      else drawCharacter(ctx, ox, oy, skin, dir, col - 1, "walk");
    }
  });
  const tex = scene.textures.addCanvas(key, canvas);
  if (!tex) return;
  tex.refresh();
  for (let i = 0; i < FRAMES_PER_ROW * DIR_ROWS.length; i++) {
    const col = i % FRAMES_PER_ROW;
    const row = Math.floor(i / FRAMES_PER_ROW);
    tex.add(String(i), 0, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
  }
}

export const TAXI_W = 132;
export const TAXI_H = 72;

/** Desenha uma carrinha de táxi fictícia (vista lateral, virada à direita). */
export function buildTaxiTexture(
  scene: Phaser.Scene,
  key: string,
  body: number,
  roof: number,
): void {
  if (scene.textures.exists(key)) return;
  const frames = 2;
  const tex = scene.textures.createCanvas(key, TAXI_W * frames, TAXI_H);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, TAXI_W * frames, TAXI_H);

  for (let f = 0; f < frames; f++) {
    const ox = f * TAXI_W;
    ctx.save();
    ctx.translate(ox, 0);

    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(TAXI_W / 2, 63, 56, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo inferior
    ctx.fillStyle = css(body);
    roundRect(ctx, 8, 26, 116, 30, 6);
    // Tejadilho
    ctx.fillStyle = css(roof);
    roundRect(ctx, 18, 8, 96, 22, 8);
    // Faixa
    ctx.fillStyle = css(shade(body, 0.75));
    ctx.fillRect(10, 44, 112, 5);

    // Janelas
    ctx.fillStyle = "rgba(180,225,255,0.9)";
    for (let i = 0; i < 4; i++) {
      roundRect(ctx, 24 + i * 22, 13, 18, 14, 3);
    }
    // Frente
    ctx.fillStyle = css(shade(body, 1.12));
    roundRect(ctx, 108, 30, 18, 18, 4);
    // Farol
    ctx.fillStyle = "#ffe9a8";
    roundRect(ctx, 118, 34, 7, 6, 2);
    // Luz traseira
    ctx.fillStyle = "#e23b3b";
    roundRect(ctx, 8, 34, 6, 6, 2);

    // Rodas
    const wheelPhase = f === 1 ? Math.PI / 4 : 0;
    [34, 100].forEach((wx) => {
      ctx.fillStyle = "#15181f";
      ctx.beginPath();
      ctx.arc(wx, 56, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c9ced8";
      ctx.beginPath();
      ctx.arc(wx, 56, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#8b929e";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const a = wheelPhase + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(wx, 56);
        ctx.lineTo(wx + Math.cos(a) * 8, 56 + Math.sin(a) * 8);
        ctx.stroke();
      }
    });

    // Contorno
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 2;
    ctx.strokeRect(9, 27, 114, 28);

    ctx.restore();
  }

  // Canvas próprio — ver buildCharacterSheet para a justificação.
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = TAXI_W * frames;
  srcCanvas.height = TAXI_H;
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) return;
  // Copia o conteúdo do CanvasTexture para o canvas independente.
  srcCtx.drawImage(tex.getSourceImage() as CanvasImageSource, 0, 0);
  scene.textures.remove(key);
  const newTex = scene.textures.addCanvas(key, srcCanvas);
  if (!newTex) return;
  newTex.refresh();
  newTex.add("0", 0, 0, 0, TAXI_W, TAXI_H);
  newTex.add("1", 0, TAXI_W, 0, TAXI_W, TAXI_H);
}

/** Props de rua. */
export function buildPropTexture(scene: Phaser.Scene, kind: string): void {
  const key = `prop_${kind}`;
  if (scene.textures.exists(key)) return;
  const sizes: Record<string, [number, number]> = {
    tree: [64, 80],
    stall: [96, 72],
    bin: [34, 40],
    lamp: [24, 84],
    bench: [58, 32],
    sign: [30, 56],
    cone: [24, 28],
    wall: [96, 48],
  };
  const [w, h] = sizes[kind] ?? [40, 40];
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 4, w * 0.35, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (kind) {
    case "tree": {
      ctx.fillStyle = "#5c4033";
      ctx.fillRect(w / 2 - 5, h - 26, 10, 24);
      ctx.fillStyle = "#3f7a3a";
      ctx.beginPath();
      ctx.arc(w / 2, 30, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4e9c47";
      ctx.beginPath();
      ctx.arc(w / 2 - 8, 24, 16, 0, Math.PI * 2);
      ctx.arc(w / 2 + 10, 28, 14, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "stall": {
      ctx.fillStyle = "#8a6a45";
      ctx.fillRect(8, 34, w - 16, 32);
      ctx.fillStyle = "#e23b3b";
      ctx.beginPath();
      ctx.moveTo(2, 32);
      ctx.lineTo(w / 2, 6);
      ctx.lineTo(w - 2, 32);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f5f2e8";
      for (let i = 0; i < 4; i++) ctx.fillRect(8 + i * 22, 28, 10, 5);
      ctx.fillStyle = "#ffc31f";
      ctx.fillRect(14, 40, 18, 10);
      ctx.fillStyle = "#36b45a";
      ctx.fillRect(40, 40, 18, 10);
      ctx.fillStyle = "#f07b1d";
      ctx.fillRect(66, 40, 16, 10);
      break;
    }
    case "bin": {
      ctx.fillStyle = "#2f6f4f";
      roundRect(ctx, 4, 10, w - 8, h - 14, 4);
      ctx.fillStyle = "#245640";
      ctx.fillRect(2, 6, w - 4, 7);
      break;
    }
    case "lamp": {
      ctx.fillStyle = "#4a5260";
      ctx.fillRect(w / 2 - 3, 12, 6, h - 16);
      ctx.fillStyle = "#ffe9a8";
      roundRect(ctx, w / 2 - 9, 4, 18, 10, 4);
      break;
    }
    case "bench": {
      ctx.fillStyle = "#8a6a45";
      ctx.fillRect(2, 10, w - 4, 8);
      ctx.fillRect(2, 20, w - 4, 6);
      ctx.fillStyle = "#4a5260";
      ctx.fillRect(6, 24, 5, 8);
      ctx.fillRect(w - 11, 24, 5, 8);
      break;
    }
    case "sign": {
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(w / 2 - 2, 20, 4, h - 22);
      ctx.fillStyle = "#2b5fae";
      roundRect(ctx, 2, 4, w - 4, 18, 4);
      ctx.fillStyle = "#f5f2e8";
      ctx.fillRect(6, 10, w - 12, 3);
      break;
    }
    case "cone": {
      ctx.fillStyle = "#f07b1d";
      ctx.beginPath();
      ctx.moveTo(w / 2, 2);
      ctx.lineTo(w - 4, h - 6);
      ctx.lineTo(4, h - 6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f5f2e8";
      ctx.fillRect(5, h - 14, w - 10, 4);
      break;
    }
    default: {
      ctx.fillStyle = "#9aa0ab";
      ctx.fillRect(0, 6, w, h - 10);
      ctx.fillStyle = "#848a95";
      for (let y = 6; y < h - 6; y += 12)
        for (let x = 0; x < w; x += 24) ctx.fillRect(x + ((y / 12) % 2) * 12, y, 22, 10);
      break;
    }
  }
  tex.refresh();
}

/** Pequenas texturas para partículas e ícones. */
export function buildFxTextures(scene: Phaser.Scene): void {
  const make = (key: string, size: number, draw: (c: CanvasRenderingContext2D) => void) => {
    if (scene.textures.exists(key)) return;
    const t = scene.textures.createCanvas(key, size, size);
    if (!t) return;
    draw(t.getContext());
    t.refresh();
  };

  make("fx_dust", 16, (c) => {
    c.fillStyle = "rgba(226,214,190,0.9)";
    c.beginPath();
    c.arc(8, 8, 7, 0, Math.PI * 2);
    c.fill();
  });
  make("fx_spark", 12, (c) => {
    c.fillStyle = "#9fd8ff";
    c.beginPath();
    c.arc(6, 6, 5, 0, Math.PI * 2);
    c.fill();
  });
  make("fx_coin", 18, (c) => {
    c.fillStyle = "#ffc31f";
    c.beginPath();
    c.arc(9, 9, 8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#ffe9a8";
    c.beginPath();
    c.arc(9, 9, 4.5, 0, Math.PI * 2);
    c.fill();
  });
  make("fx_star", 20, (c) => {
    c.fillStyle = "#ffd94a";
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 9 : 4;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const fn = i === 0 ? "moveTo" : "lineTo";
      c[fn](10 + Math.cos(a) * r, 10 + Math.sin(a) * r);
    }
    c.closePath();
    c.fill();
  });
  make("ui_joystick_base", 128, (c) => {
    c.fillStyle = "rgba(12,22,42,0.42)";
    c.beginPath();
    c.arc(64, 64, 62, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(255,195,31,0.7)";
    c.lineWidth = 4;
    c.beginPath();
    c.arc(64, 64, 60, 0, Math.PI * 2);
    c.stroke();
  });
  make("ui_joystick_thumb", 64, (c) => {
    c.fillStyle = "rgba(255,195,31,0.9)";
    c.beginPath();
    c.arc(32, 32, 28, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.35)";
    c.beginPath();
    c.arc(26, 24, 10, 0, Math.PI * 2);
    c.fill();
  });
}
