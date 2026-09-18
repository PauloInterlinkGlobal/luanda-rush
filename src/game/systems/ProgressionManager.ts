import { getLevel, objectiveComplete, starsForLevel, type LevelConfig } from "../data/levels";
import { levelFromXp } from "./SaveManager";
import { SaveManager } from "./SaveManager";
import type { MatchStats, SaveData } from "../types";

export interface LevelResult { stars: number; money: number; xp: number; unlockedNext: boolean; level: number; }

export class ProgressionManager {
  static currentLevel(): number { return Math.max(1, SaveManager.load().unlockedLevel ?? 1); }
  static config(level = this.currentLevel()): LevelConfig { return getLevel(level); }
  static complete(level: number, stats: MatchStats, timeLeft: number): LevelResult {
    const save = SaveManager.load();
    const config = getLevel(level);
    const stars = starsForLevel(config, stats, timeLeft);
    const previous = save.levelStars[String(level)] ?? 0;
    const bestStars = Math.max(previous, stars);
    const won = stars > 0;
    const bonusMoney = won ? config.rewardMoney : 0;
    const bonusXp = won ? config.rewardXp : 0;
    const nextUnlocked = won && (save.unlockedLevel ?? 1) <= level ? level + 1 : save.unlockedLevel ?? 1;
    const totalXp = save.xp + stats.xp + bonusXp;
    const patch: Partial<SaveData> = {
      money: save.money + stats.money + bonusMoney,
      xp: totalXp,
      level: levelFromXp(totalXp),
      unlockedLevel: nextUnlocked,
      levelStars: { ...save.levelStars, [String(level)]: bestStars },
      completedLevels: Array.from(new Set([...(save.completedLevels ?? []), ...(won ? [level] : [])])),
      stationLevel: Math.min(3, Math.max(save.stationLevel, Math.ceil(nextUnlocked / 5))),
      bestScore: Math.max(save.bestScore, stats.money + bonusMoney),
    };
    SaveManager.update(patch);
    return { stars, money: stats.money + bonusMoney, xp: stats.xp + bonusXp, unlockedNext: nextUnlocked > level, level };
  }
  static objectiveStates(level: number, stats: MatchStats): boolean[] { return getLevel(level).objectives.map((item) => objectiveComplete(stats, item)); }
}
