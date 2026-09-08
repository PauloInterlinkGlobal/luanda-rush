import Phaser from "phaser";
import PROPS from "../data/props-frames.json";
import PEOPLE from "../data/npcs-frames.json";
import PROPS_ASSET from "../../assets/props_street.png.asset.json";
import PEOPLE_ASSET from "../../assets/npcs_people.png.asset.json";
import { DIR_ROWS, FRAMES_PER_ROW, FRAME_H, FRAME_W, css } from "./ProceduralArt";

type Rect = { x: number; y: number; w: number; h: number };

export const PROPS_KEY = "props_street";
export const PEOPLE_KEY = "npcs_people";

const PROP_RECTS = PROPS.frames as Record<string, Rect>;
const PEOPLE_RECTS = PEOPLE.frames as Record<string, Rect>;

/** Altura desejada (px) de cada objecto de rua no mapa. */
export const PROP_HEIGHT: Record<string, number> = {
  prop_bench: 62,
  prop_sign_taxi: 96,
  prop_stall_agua: 104,
  prop_tree: 124,
  prop_shelter: 118,
  prop_cone: 40,
};

export function preloadScenerySheets(scene: Phaser.Scene): void {
  if (!scene.textures.exists(PROPS_KEY)) scene.load.image(PROPS_KEY, "/assets/props_street.png");
  if (!scene.textures.exists(PEOPLE_KEY)) scene.load.image(PEOPLE_KEY, "/assets/npcs_people.png");
}

export function hasPropFrame(name: string): boolean {
  return Boolean(PROP_RECTS[name]);
}

export function hasPersonFrame(name: string): boolean {
  return Boolean(PEOPLE_RECTS[name]);
}

function sourceOf(scene: Phaser.Scene, key: string): CanvasImageSource | null {
  if (!scene.textures.exists(key)) return null;
  return scene.textures.get(key).getSourceImage() as CanvasImageSource;
}

/** Cria a textura de um objecto de rua a partir da folha real. */
export function buildPropFromSheet(
  scene: Phaser.Scene,
  key: string,
  frameName: string = key,
): boolean {
  if (scene.textures.exists(key)) return true;
  const rect = PROP_RECTS[frameName];
  const img = sourceOf(scene, PROPS_KEY);
  if (!rect || !img) return false;

  const targetH = PROP_HEIGHT[frameName] ?? 80;
  const scale = targetH / rect.h;
  const w = Math.max(4, Math.round(rect.w * scale));
  const h = Math.max(4, Math.round(rect.h * scale));
  const pad = 6;
  const tex = scene.textures.createCanvas(key, w, h + pad);
  if (!tex) return false;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, w, h + pad);

  // Sombra suave por baixo
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(w / 2, h + 1, w * 0.36, pad * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);
  tex.refresh();
  return true;
}

/** Recolor simples da zona do tronco, para variar passageiros. */
function tintShirt(ctx: CanvasRenderingContext2D, w: number, h: number, color: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, h * 0.3, w, h * 0.28);
  ctx.clip();
  ctx.globalCompositeOperation = "color";
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = css(color);
  ctx.fillRect(0, h * 0.3, w, h * 0.28);
  ctx.restore();
}

/**
 * Gera um spritesheet 6x4 (idle/andar/especial x 4 direcções) a partir do
 * frame frontal de uma pessoa real. Lado = frame espelhado; costas = frame
 * frontal ligeiramente escurecido. Mantém o formato usado pelo motor.
 */
export function buildPersonFromSheet(
  scene: Phaser.Scene,
  key: string,
  personKey: string,
  shirt?: number,
): boolean {
  if (scene.textures.exists(key)) return true;
  const rect = PEOPLE_RECTS[personKey];
  const img = sourceOf(scene, PEOPLE_KEY);
  if (!rect || !img) return false;

  const sheetW = FRAME_W * FRAMES_PER_ROW;
  const sheetH = FRAME_H * DIR_ROWS.length;
  // Canvas próprio (não usar textures.createCanvas + remove: o canvas volta
  // ao pool do Phaser e é reutilizado pela pessoa seguinte, corrompendo tudo).
  const canvas = document.createElement("canvas");
  canvas.width = sheetW;
  canvas.height = sheetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.clearRect(0, 0, sheetW, sheetH);

  // Recorte redimensionado (uma vez) num canvas auxiliar
  const drawH = FRAME_H - 8;
  const drawW = Math.max(4, Math.round((rect.w / rect.h) * drawH));
  const buf = document.createElement("canvas");
  buf.width = drawW;
  buf.height = drawH;
  const bctx = buf.getContext("2d");
  if (!bctx) return false;
  bctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, drawW, drawH);
  if (shirt !== undefined) {
    tintShirt(bctx, drawW, drawH, shirt);
    bctx.save();
    bctx.globalCompositeOperation = "destination-in";
    bctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, drawW, drawH);
    bctx.restore();
  }

  DIR_ROWS.forEach((dir, row) => {
    for (let col = 0; col < FRAMES_PER_ROW; col++) {
      const ox = col * FRAME_W;
      const oy = row * FRAME_H;
      const walking = col >= 1 && col <= 4;
      const bob = walking ? (col % 2 === 0 ? -2 : 0) : 0;
      const lean = col === 5 ? -3 : 0;

      ctx.save();
      // Sombra
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(ox + FRAME_W / 2, oy + FRAME_H - 4, 11, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(ox + FRAME_W / 2, oy + FRAME_H - 4 + bob + lean);
      if (dir === "left") ctx.scale(-1, 1);
      ctx.drawImage(buf, -drawW / 2, -drawH);
      ctx.restore();

      if (dir === "up") {
        // Costas: escurece ligeiramente para dar leitura de direcção
        ctx.save();
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.fillRect(ox, oy, FRAME_W, FRAME_H);
        ctx.restore();
      }
    }
  });

  // Regista o canvas no TextureManager antes de criar os frames Phaser.
  // Sem este passo `tex` não existe e o BootScene falha ao construir NPCs.
  const tex = scene.textures.addCanvas(key, canvas);
  if (!tex) return false;
  tex.refresh();
  for (let row = 0; row < DIR_ROWS.length; row += 1) {
    for (let col = 0; col < FRAMES_PER_ROW; col += 1) {
      tex.add(String(row * FRAMES_PER_ROW + col), 0, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
    }
  }
  return true;
}
