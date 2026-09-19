import { DEFAULT_CHARACTER } from "../config/AssetConfig";
import { BALANCE, LEVEL_TITLES } from "../config/BalanceConfig";
import type { SaveData } from "../types";
import { loadGameState, saveGameState } from "../../lib/storage/gameDB";

const KEY = "lotador.save.v2";
const VERSION = 2;

function defaults(): SaveData {
  return {
    version: VERSION,
    level: 1,
    xp: 0,
    money: BALANCE.startingMoney,
    upgrades: {
      velocidade: 0,
      energia: 0,
      recuperacao: 0,
      agilidade: 0,
      resistencia: 0,
      voz: 0,
      persuasao: 0,
    },
    character: { ...DEFAULT_CHARACTER },
    playerName: "Lotador",
    missions: {},
    bestScore: 0,
    tutorialDone: false,
    fleetLevel: 1,
    stationLevel: 1,
    unlockedMaps: ["bairro"],
    unlockedPhase: 1,
    phases: {},
    reputation: 0,
    currentArea: "bairro",
    unlockedAreas: ["bairro"],
    settings: {
      music: true,
      sfx: true,
      vibration: true,
      quality: "HIGH",
      language: "pt",
    },
  };
}

/** Migra saves antigos (v1) para o formato de campanha por fases. */
function migrate(raw: Partial<SaveData>): SaveData {
  const base = defaults();
  const merged: SaveData = {
    ...base,
    ...raw,
    upgrades: { ...base.upgrades, ...(raw.upgrades ?? {}) },
    character: { ...base.character, ...(raw.character ?? {}) },
    missions: { ...base.missions, ...(raw.missions ?? {}) },
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    phases: { ...(raw.phases ?? {}) },
    unlockedMaps: raw.unlockedMaps?.length ? raw.unlockedMaps : base.unlockedMaps,
    unlockedAreas: raw.unlockedAreas?.length
      ? raw.unlockedAreas
      : raw.unlockedMaps?.length
        ? [...raw.unlockedMaps]
        : base.unlockedAreas,
    version: VERSION,
  };

  // Se o jogador já fez o tutorial no save antigo, desbloqueia fase 2.
  if (raw.tutorialDone && (merged.unlockedPhase ?? 1) < 2) {
    merged.unlockedPhase = 2;
    const prevPhase1 = merged.phases["1"];
    merged.phases = {
      ...merged.phases,
      "1": prevPhase1 ?? {
        completed: true,
        stars: 1,
        bestTime: 0,
        attempts: 1,
        bestMoney: 0,
      },
    };
  }

  // Garante unlockedPhase mínimo
  if (!merged.unlockedPhase || merged.unlockedPhase < 1) merged.unlockedPhase = 1;

  // Migra upgrades legados → novos nomes
  const res = merged.upgrades["resistencia"] ?? 0;
  const ene = merged.upgrades["energia"] ?? 0;
  if (res > ene) merged.upgrades["energia"] = res;

  return merged;
}

/** Persistência local versionada. Nunca lança — falha para os valores padrão. */
export class SaveManager {
  private static cache: SaveData | null = null;

  static load(): SaveData {
    if (this.cache) return this.cache;
    const base = defaults();
    try {
      if (typeof window === "undefined") return base;
      // Tenta v2, depois v1
      let raw = window.localStorage.getItem(KEY);
      if (!raw) raw = window.localStorage.getItem("lotador.save.v1");
      if (!raw) {
        this.cache = base;
        return base;
      }
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const merged = migrate(parsed);
      this.cache = merged;
      return merged;
    } catch (err) {
      console.warn("[SaveManager] save corrompido, a recomeçar", err);
      this.cache = base;
      return base;
    }
  }

  static save(data: SaveData): void {
    this.cache = data;
    void saveGameState(data as unknown as Record<string, unknown>);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, JSON.stringify(data));
        // Mantém v1 sincronizado para não perder progresso se algo ler a chave antiga
        window.localStorage.setItem("lotador.save.v1", JSON.stringify(data));
      }
    } catch (err) {
      console.warn("[SaveManager] não foi possível guardar", err);
    }
  }

  static async hydrate(): Promise<SaveData> {
    const stored = await loadGameState();
    if (!stored) return this.load();
    const next = migrate({ ...this.load(), ...(stored as Partial<SaveData>) });
    this.cache = next;
    return next;
  }

  static update(patch: Partial<SaveData>): SaveData {
    const next = { ...this.load(), ...patch };
    this.save(next);
    return next;
  }

  static reset(): SaveData {
    const base = defaults();
    this.save(base);
    return base;
  }
}

/** XP necessário para atingir um nível. */
export function xpForLevel(level: number): number {
  return Math.round(
    (BALANCE.xpPerLevelBase * (Math.pow(BALANCE.xpPerLevelGrowth, level - 1) - 1)) /
      (BALANCE.xpPerLevelGrowth - 1),
  );
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < 50 && xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function levelTitle(level: number): string {
  let title = "Novato";
  for (const entry of LEVEL_TITLES) if (level >= entry.level) title = entry.title;
  return title;
}
