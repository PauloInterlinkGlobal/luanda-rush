import { DEFAULT_CHARACTER } from "../config/AssetConfig";
import { BALANCE, LEVEL_TITLES } from "../config/BalanceConfig";
import type { SaveData } from "../types";

const KEY = "lotador.save.v1";
const VERSION = 1;

function defaults(): SaveData {
  return {
    version: VERSION,
    level: 1,
    xp: 0,
    money: BALANCE.startingMoney,
    upgrades: { velocidade: 0, resistencia: 0, voz: 0, persuasao: 0 },
    character: { ...DEFAULT_CHARACTER },
    playerName: "Lotador",
    missions: {},
    bestScore: 0,
    tutorialDone: false,
    fleetLevel: 1,
    stationLevel: 1,
    unlockedMaps: ["bairro"],
    settings: {
      music: true,
      sfx: true,
      vibration: true,
      quality: "HIGH",
      language: "pt",
    },
  };
}

/** Persistência local versionada. Nunca lança — falha para os valores padrão. */
export class SaveManager {
  private static cache: SaveData | null = null;

  static load(): SaveData {
    if (this.cache) return this.cache;
    const base = defaults();
    try {
      if (typeof window === "undefined") return base;
      const raw = window.localStorage.getItem(KEY);
      if (!raw) {
        this.cache = base;
        return base;
      }
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      const merged: SaveData = {
        ...base,
        ...parsed,
        upgrades: { ...base.upgrades, ...(parsed.upgrades ?? {}) },
        character: { ...base.character, ...(parsed.character ?? {}) },
        missions: { ...base.missions, ...(parsed.missions ?? {}) },
        settings: { ...base.settings, ...(parsed.settings ?? {}) },
        version: VERSION,
      };
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
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("[SaveManager] não foi possível guardar", err);
    }
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
    BALANCE.xpPerLevelBase * (Math.pow(BALANCE.xpPerLevelGrowth, level - 1) - 1) /
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
