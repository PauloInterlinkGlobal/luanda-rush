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
  PLAYER_SHEET_KEY,
  PLAYER_SHEET_URL,
  buildCharacterFromAtlas,
  buildPlayerFromSheet,
  buildSpriteFromAtlas,
  buildTaxiFromAtlas,
  hasFrame,
} from "./AtlasArt";
import { hasTaxiSheet, preloadTaxiSheets } from "./TaxiArt";
import {
  buildPersonFromSheet,
  buildPropFromSheet,
  hasPersonFrame,
  hasPropFrame,
  preloadScenerySheets,
} from "./SceneryArt";

/** Pessoas reais (folha enviada) usadas pelos lotadores rivais. */
const NPC_PEOPLE: Record<string, string> = {
  npc_kito: "ped_estudante",
  npc_manuel: "ped_mala",
  npc_debora: "ped_moca",
  mentor_ze: "ped_gestor",
};

/** Figurantes que só dão ambiente à paragem. */
export const AMBIENT_PEOPLE = ["ped_senhora", "ped_gestor", "ped_capuz"] as const;

/** Passageiro -> pessoa real da folha. */
const PASSENGER_PEOPLE: Record<string, string> = {
  NORMAL: "ped_gestor",
  APRESSADO: "ped_estudante",
  INDECISO: "ped_capuz",
  OBSERVADOR: "ped_mala",
  EXIGENTE: "ped_senhora",
  CORRERIA: "ped_moca",
  ESPECIAL: "ped_senhora",
};

/** Objecto do mapa -> frame da folha real de cenário. */
const PROP_SHEET_KEYS: Record<string, string> = {
  tree: "prop_tree",
  stall: "prop_stall_agua",
  bench: "prop_bench",
  sign: "prop_sign_taxi",
  cone: "prop_cone",
  shelter: "prop_shelter",
};



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
    if (!scene.textures.exists(PLAYER_SHEET_KEY)) {
      scene.load.image(PLAYER_SHEET_KEY, PLAYER_SHEET_URL);
    }
    preloadTaxiSheets(scene);
    preloadScenerySheets(scene);
  }


  /** Cria todas as texturas do jogo. Idempotente. */
  static buildAll(scene: Phaser.Scene, playerSkin: CharacterSkin = DEFAULT_CHARACTER): void {
    buildFxTextures(scene);

    this.buildPlayer(scene, playerSkin);
    Object.entries(NPC_SKINS).forEach(([key, skin]) => {
      const person = NPC_PEOPLE[key];
      // Pessoas reais (folha enviada) têm prioridade.
      if (person && hasPersonFrame(person) && buildPersonFromSheet(scene, key, person)) return;
      const atlas = ATLAS_CHARACTERS[key];
      if (!atlas || !buildCharacterFromAtlas(scene, key, atlas)) {
        buildCharacterSheet(scene, key, skin);
      }
    });
    // Figurantes de ambiente
    AMBIENT_PEOPLE.forEach((person) => {
      buildPersonFromSheet(scene, `amb_${person}`, person);
    });
    Object.values(PASSENGERS).forEach((p) => {
      const key = `pass_${p.type}`;
      const person = PASSENGER_PEOPLE[p.type];
      const shirt = PALETTE.shirts[p.skin.shirt % PALETTE.shirts.length];
      if (person && hasPersonFrame(person) && buildPersonFromSheet(scene, key, person, shirt))
        return;
      if (!hasFrame(key) || !buildCharacterFromAtlas(scene, key, { down: key })) {
        buildCharacterSheet(scene, key, p.skin);
      }
    });
    Object.values(TAXIS).forEach((t) => {
      const key = `taxi_${t.type}`;
      // Folha real da Hiace (renderizada do modelo 3D) tem prioridade.
      if (hasTaxiSheet(scene, key)) return;
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
    ["tree", "stall", "bin", "lamp", "bench", "sign", "cone", "wall", "shelter"].forEach((k) => {
      const [w, h] = PROP_SIZE[k] ?? [64, 64];
      const frame = PROP_SHEET_KEYS[k];
      // Objectos reais (folha de cenário enviada) têm prioridade.
      if (frame && hasPropFrame(frame) && buildPropFromSheet(scene, `prop_${k}`, frame)) return;
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
    // Sprite real do lotador (sheet limpo 6x4) — usado para o personagem masculino.
    if (!skin.female && buildPlayerFromSheet(scene, "player", recolor)) return;
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
    [
      "player",
      ...Object.keys(NPC_SKINS),
      ...AMBIENT_PEOPLE.map((p) => `amb_${p}`),
    ].forEach((k) =>
      this.registerCharacterAnims(scene, k, false),
    );
    Object.values(PASSENGERS).forEach((p) =>
      this.registerCharacterAnims(scene, `pass_${p.type}`, false),
    );
    Object.values(TAXIS).forEach((t) => {
      const key = `taxi_${t.type}`;
      const texture = scene.textures.get(key);
      const frames = [0, 1].filter((frame) => texture.has(String(frame)));
      if (frames.length > 0 && !scene.anims.exists(`${key}-roll`)) {
        scene.anims.create({
          key: `${key}-roll`,
          // As texturas dos táxis são CanvasTextures com frames adicionados
          // manualmente; valide-os antes de criar uma animação jogável.
          frames: frames.map((frame) => ({ key, frame })),
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
      const texture = scene.textures.get(key);
      defs.forEach(([animKey, frames, rate, repeat]) => {
        const validFrames = frames.filter((frame) => texture.has(String(frame)));
        if (validFrames.length === 0) return;
        if (scene.anims.exists(animKey)) scene.anims.remove(animKey);
        scene.anims.create({
          key: animKey,
          frames: validFrames.map((frame) => ({ key, frame })),
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
