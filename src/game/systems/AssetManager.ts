import Phaser from "phaser";
import { DEFAULT_CHARACTER } from "../config/AssetConfig";
import { PASSENGERS } from "../data/passengers";
import { TAXIS } from "../data/taxis";
import { MAP_CONFIG } from "../config/MapConfig";
import type { CharacterSkin } from "../types";
import {
  buildCharacterSheet,
  buildFxTextures,
  buildPropTexture,
  buildTaxiTexture,
  DIR_ROWS,
} from "./ProceduralArt";
import { PALETTE } from "../config/AssetConfig";
import {
  ATLAS_KEY,
  ATLAS_URL,
  buildCharacterFromAtlas,
  buildSpriteFromAtlas,
  buildTaxiFromAtlas,
  hasFrame,
} from "./AtlasArt";

/** Skins dos NPC lotadores e do mentor (fallback procedural). */
export const NPC_SKINS: Record<string, CharacterSkin> = {
  npc_kito: { skin: 1, hair: 0, shirt: 3, pants: 1, shoes: 1, accessory: "bag" },
  npc_manuel: { skin: 3, hair: 2, shirt: 4, pants: 4, shoes: 2, accessory: "hat" },
  npc_debora: { skin: 0, hair: 5, shirt: 6, pants: 0, shoes: 1, female: true },
  mentor_ze: { skin: 2, hair: 4, shirt: 4, pants: 3, shoes: 2, accessory: "hat" },
};

/** Mapeamento personagem -> frames reais do atlas. */
const ATLAS_CHARACTERS: Record<string, { down: string; up?: string; side?: string }> = {
  npc_kito: { down: "npc_kito_down", side: "npc_kito_side" },
  npc_manuel: { down: "npc_manuel_down" },
  npc_debora: { down: "npc_debora_down" },
  mentor_ze: { down: "mentor_ze_down" },
};

/**
 * AssetManager — ponto único de criação/registo de texturas e animações.
 *
 * Usa os frames reais do spritesheet do jogo; se algum faltar, cai
 * automaticamente no gerador procedural para nunca haver textura em falta.
 */
export class AssetManager {
  private static built = new Set<string>();

  static preload(scene: Phaser.Scene): void {
    if (!scene.textures.exists(ATLAS_KEY)) {
      scene.load.image(ATLAS_KEY, ATLAS_URL);
    }
  }

  /** Cria todas as texturas do jogo. Idempotente. */
  static buildAll(scene: Phaser.Scene, playerSkin: CharacterSkin = DEFAULT_CHARACTER): void {
    buildFxTextures(scene);

    this.buildPlayer(scene, playerSkin);
    Object.entries(NPC_SKINS).forEach(([key, skin]) => {
      const atlas = ATLAS_CHARACTERS[key];
      if (!atlas || !buildCharacterFromAtlas(scene, key, atlas)) {
        buildCharacterSheet(scene, key, skin);
      }
    });
    Object.values(PASSENGERS).forEach((p) => {
      const key = `pass_${p.type}`;
      if (!hasFrame(key) || !buildCharacterFromAtlas(scene, key, { down: key })) {
        buildCharacterSheet(scene, key, p.skin);
      }
    });
    Object.values(TAXIS).forEach((t) => {
      const key = `taxi_${t.type}`;
      if (!hasFrame(key) || !buildTaxiFromAtlas(scene, key, key)) {
        buildTaxiTexture(scene, key, t.bodyColor, t.roofColor);
      }
    });
    const PROP_SIZE: Record<string, [number, number]> = {
      tree: [96, 120],
      stall: [110, 90],
      bin: [46, 56],
      lamp: [40, 110],
      bench: [96, 60],
      sign: [90, 70],
      cone: [30, 40],
      wall: [120, 90],
    };
    ["tree", "stall", "bin", "lamp", "bench", "sign", "cone", "wall"].forEach((k) => {
      const [w, h] = PROP_SIZE[k] ?? [64, 64];
      if (!hasFrame(`prop_${k}`) || !buildSpriteFromAtlas(scene, `prop_${k}`, `prop_${k}`, w, h)) {
        buildPropTexture(scene, k);
      }
    });
    if (hasFrame("prop_tree2")) buildSpriteFromAtlas(scene, "prop_tree2", "prop_tree2", 96, 120);
    ["fx_coin", "fx_star", "fx_spark", "fx_flame", "fx_check"].forEach((k) => {
      if (hasFrame(k)) buildSpriteFromAtlas(scene, k, k, 48, 48);
    });
    this.buildGroundTexture(scene);
    this.registerAnimations(scene);
  }

  /** Constrói o sprite do jogador (atlas real, com fallback procedural). */
  private static buildPlayer(scene: Phaser.Scene, skin: CharacterSkin): void {
    if (skin.style === "classic") {
      buildCharacterSheet(scene, "player", skin);
      return;
    }
    const prefix = skin.female ? "player_female" : "player_male";
    const pick = (list: number[], i: number) => list[i % list.length] ?? list[0]!;
    const recolor = skin.useCustomColors
      ? {
          shirt: pick(PALETTE.shirts, skin.shirt),
          pants: pick(PALETTE.pants, skin.pants),
          shoes: pick(PALETTE.shoes, skin.shoes),
          accessory: skin.accessory ?? "none",
          accessoryColor: pick(PALETTE.shirts, skin.shirt + 2),
        }
      : undefined;
    const ok = buildCharacterFromAtlas(
      scene,
      "player",
      { down: `${prefix}_down`, up: `${prefix}_up`, side: `${prefix}_side` },
      recolor,
    );
    if (!ok) buildCharacterSheet(scene, "player", skin);
  }


  /** Reconstrói só o sprite do jogador (usado pela customização). */
  static rebuildPlayer(scene: Phaser.Scene, skin: CharacterSkin): void {
    this.buildPlayer(scene, skin);
    this.registerCharacterAnims(scene, "player", true);
  }


  private static buildGroundTexture(scene: Phaser.Scene): void {
    const key = "ground";
    if (scene.textures.exists(key)) return;
    const { width, height, road, sidewalk } = MAP_CONFIG;
    const tex = scene.textures.createCanvas(key, width, height);
    if (!tex) return;
    const ctx = tex.getContext();

    // Terra / chão do bairro
    ctx.fillStyle = "#b98f5f";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 3 === 0 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillRect(x, y, 6, 4);
    }

    // Passeio
    ctx.fillStyle = "#a5abb6";
    ctx.fillRect(sidewalk.x, sidewalk.y, sidewalk.w, sidewalk.h);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, sidewalk.y);
      ctx.lineTo(x, sidewalk.y + sidewalk.h);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, sidewalk.y + 60);
    ctx.lineTo(width, sidewalk.y + 60);
    ctx.stroke();

    // Estrada
    ctx.fillStyle = "#41474f";
    ctx.fillRect(road.x, road.y, road.w, road.h);
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(road.x, road.y, road.w, 8);
    // Linha central tracejada
    ctx.fillStyle = "#ffc31f";
    for (let x = 20; x < width; x += 70) ctx.fillRect(x, road.y + road.h / 2 - 3, 38, 6);
    // Passadeira
    ctx.fillStyle = "#eae6da";
    for (let i = 0; i < 6; i++) ctx.fillRect(660 + i * 22, road.y + 12, 14, road.h - 24);

    // Passeio inferior
    ctx.fillStyle = "#a5abb6";
    ctx.fillRect(0, road.y + road.h, width, 40);

    tex.refresh();
  }

  /** Regista as animações de todos os personagens e táxis. */
  static registerAnimations(scene: Phaser.Scene): void {
    ["player", ...Object.keys(NPC_SKINS)].forEach((k) =>
      this.registerCharacterAnims(scene, k, false),
    );
    Object.values(PASSENGERS).forEach((p) =>
      this.registerCharacterAnims(scene, `pass_${p.type}`, false),
    );
    Object.values(TAXIS).forEach((t) => {
      const key = `taxi_${t.type}`;
      if (!scene.anims.exists(`${key}-roll`)) {
        scene.anims.create({
          key: `${key}-roll`,
          frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 1 }),
          frameRate: 12,
          repeat: -1,
        });
      }
    });
  }

  /**
   * Animações por personagem: idle / walk / run / interact / celebrate / tired
   * em cada uma das 4 direcções.
   */
  static registerCharacterAnims(scene: Phaser.Scene, key: string, force: boolean): void {
    if (!scene.textures.exists(key)) return;
    if (this.built.has(key) && !force) return;
    this.built.add(key);

    DIR_ROWS.forEach((dir, row) => {
      const base = row * 6;
      const defs: [string, number[], number, number][] = [
        [`${key}-idle-${dir}`, [base], 1, -1],
        [`${key}-walk-${dir}`, [base + 1, base + 2, base + 3, base + 4], 9, -1],
        [`${key}-run-${dir}`, [base + 1, base + 2, base + 3, base + 4], 15, -1],
        [`${key}-tired-${dir}`, [base, base + 2], 3, -1],
        [`${key}-interact-${dir}`, [base + 5, base], 6, 0],
        [`${key}-celebrate-${dir}`, [base + 5, base], 8, 2],
      ];
      defs.forEach(([animKey, frames, rate, repeat]) => {
        if (scene.anims.exists(animKey)) scene.anims.remove(animKey);
        scene.anims.create({
          key: animKey,
          frames: frames.map((f) => ({ key, frame: f })),
          frameRate: rate,
          repeat,
        });
      });
    });
  }

  /** Garante que uma textura existe; caso contrário cria um placeholder visível. */
  static ensureTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    const fallback = "missing_placeholder";
    if (!scene.textures.exists(fallback)) {
      const t = scene.textures.createCanvas(fallback, 32, 32);
      if (t) {
        const c = t.getContext();
        c.fillStyle = "#e23b3b";
        c.fillRect(0, 0, 32, 32);
        c.fillStyle = "#ffc31f";
        c.fillRect(0, 0, 16, 16);
        c.fillRect(16, 16, 16, 16);
        t.refresh();
      }
    }
    console.warn(`[AssetManager] textura em falta: ${key} — a usar placeholder`);
    return fallback;
  }

  static reset(): void {
    this.built.clear();
  }
}
