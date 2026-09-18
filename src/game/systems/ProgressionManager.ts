import {
  LEVELS,
  UPGRADE_COSTS,
  UPGRADE_MAX_LEVEL,
  UPGRADE_PER_LEVEL,
  AREAS,
  rankForPhase,
} from "../data/levels";
import { BALANCE, LEVEL_TITLES } from "../config/BalanceConfig";
import type { PhaseProgress, SaveData, LevelResult } from "../types";
import { SaveManager, levelFromXp, xpForLevel } from "./SaveManager";

const emptyPhase = (): PhaseProgress => ({
  completed: false,
  stars: 0,
  bestTime: 0,
  attempts: 0,
  bestMoney: 0,
});

/**
 * Progressão do jogador: fases, XP/nível, upgrades, áreas, reputação.
 * Toda a mutação de save relacionada com campanha passa por aqui.
 */
export class ProgressionManager {
  /** Fase mais alta desbloqueada (1-based). */
  static unlockedPhase(save: SaveData = SaveManager.load()): number {
    return Math.max(1, save.unlockedPhase ?? 1);
  }

  static phaseProgress(phaseId: number, save: SaveData = SaveManager.load()): PhaseProgress {
    return save.phases?.[String(phaseId)] ?? emptyPhase();
  }

  static isPhaseUnlocked(phaseId: number, save: SaveData = SaveManager.load()): boolean {
    return phaseId >= 1 && phaseId <= this.unlockedPhase(save);
  }

  static isPhaseCompleted(phaseId: number, save: SaveData = SaveManager.load()): boolean {
    return this.phaseProgress(phaseId, save).completed;
  }

  static stars(phaseId: number, save: SaveData = SaveManager.load()): number {
    return this.phaseProgress(phaseId, save).stars;
  }

  static totalStars(save: SaveData = SaveManager.load()): number {
    let total = 0;
    for (const p of Object.values(save.phases ?? {})) total += p.stars ?? 0;
    return total;
  }

  /** Aplica o resultado de uma fase ao save e devolve o save actualizado. */
  static applyLevelResult(result: LevelResult): SaveData {
    const save = SaveManager.load();
    const key = String(result.phaseId);
    const prev = save.phases?.[key] ?? emptyPhase();
    const bestStars = Math.max(prev.stars, result.stars);
    const bestTime =
      result.won && result.timeSpent > 0
        ? prev.bestTime > 0
          ? Math.min(prev.bestTime, result.timeSpent)
          : result.timeSpent
        : prev.bestTime;
    const bestMoney = Math.max(prev.bestMoney, result.stats.money);

    const phases = {
      ...(save.phases ?? {}),
      [key]: {
        completed: prev.completed || result.won,
        stars: bestStars,
        bestTime,
        attempts: prev.attempts + 1,
        bestMoney,
      } satisfies PhaseProgress,
    };

    // Desbloqueia a próxima fase com ≥1 estrela (objectivo principal).
    let unlockedPhase = save.unlockedPhase ?? 1;
    if (result.won && result.phaseId >= unlockedPhase) {
      unlockedPhase = Math.min(LEVELS.length, result.phaseId + 1);
    }

    // XP + dinheiro de recompensa de fase (além do ganho in-match já creditado).
    let xp = save.xp + result.rewardXp + result.stats.xp;
    let money = save.money + result.rewardMoney + result.stats.money;
    // Evitar double-count se GameScene já creditou money/xp da partida:
    // o LevelResult.reward* é só o bónus de fase; stats.money/xp são da partida.
    // GameScene NÃO deve creditar money/xp no save — ProgressionManager faz tudo.

    let level = levelFromXp(xp);
    // Nível mínimo acompanha a fase (sensação de progressão).
    level = Math.max(level, Math.min(50, Math.ceil(result.phaseId / 2) + (result.won ? 0 : 0)));

    let reputation = (save.reputation ?? 0) + result.stats.reputation;
    if (result.won) reputation += 5 + result.stars * 2;

    const unlockedAreas = new Set(save.unlockedAreas ?? ["bairro"]);
    let unlockedArea: string | undefined;
    if (result.unlockedArea) {
      unlockedAreas.add(result.unlockedArea);
      unlockedArea = result.unlockedArea;
    }
    // Desbloqueio por fase final
    const levelDef = LEVELS.find((l) => l.id === result.phaseId);
    if (result.won && levelDef?.unlockArea) {
      unlockedAreas.add(levelDef.unlockArea);
      unlockedArea = levelDef.unlockArea;
    }

    // Estação sobe com o rank
    const rank = rankForPhase(Math.max(result.phaseId, unlockedPhase - (result.won ? 0 : 1)));
    const stationFromRank: Record<string, number> = {
      aprendiz: 1,
      lotador: 1,
      experiente: 2,
      profissional: 2,
      mestre: 3,
    };
    const stationLevel = Math.max(save.stationLevel ?? 1, stationFromRank[rank.id] ?? 1);

    const next: SaveData = {
      ...save,
      xp,
      level,
      money,
      phases,
      unlockedPhase,
      reputation,
      unlockedAreas: [...unlockedAreas],
      currentArea: save.currentArea ?? "bairro",
      stationLevel,
      bestScore: Math.max(save.bestScore, result.stats.money),
      tutorialDone: save.tutorialDone || (result.phaseId === 1 && result.won),
    };

    // Anexa área desbloqueada ao resultado para a UI
    if (unlockedArea) result.unlockedArea = unlockedArea;

    SaveManager.save(next);
    return next;
  }

  /** Compra um nível de upgrade. Devolve false se não puder. */
  static buyUpgrade(id: string): boolean {
    const save = SaveManager.load();
    const level = save.upgrades[id] ?? 0;
    if (level >= UPGRADE_MAX_LEVEL) return false;
    const costs = UPGRADE_COSTS[id];
    const cost = costs?.[level] ?? 400 * (level + 1);
    if (save.money < cost) return false;
    SaveManager.update({
      money: save.money - cost,
      upgrades: { ...save.upgrades, [id]: level + 1 },
    });
    return true;
  }

  static upgradeCost(id: string, level: number): number {
    const costs = UPGRADE_COSTS[id];
    return costs?.[level] ?? 400 * (level + 1);
  }

  static upgradeMultiplier(id: string, level: number): number {
    const per = UPGRADE_PER_LEVEL[id] ?? 0.05;
    return 1 + per * level;
  }

  static xpProgress(save: SaveData = SaveManager.load()): {
    level: number;
    xp: number;
    current: number;
    next: number;
    ratio: number;
    title: string;
  } {
    const level = save.level;
    const xp = save.xp;
    const prevThreshold = xpForLevel(level);
    const nextThreshold = xpForLevel(level + 1);
    const current = Math.max(0, xp - prevThreshold);
    const need = Math.max(1, nextThreshold - prevThreshold);
    let title = "Novato";
    for (const entry of LEVEL_TITLES) if (level >= entry.level) title = entry.title;
    // Sobrescreve com rank de fase se mais avançado
    const phase = this.unlockedPhase(save);
    const rank = rankForPhase(Math.min(phase, LEVELS.length));
    if (phase > 1) title = rank.label;
    return {
      level,
      xp,
      current,
      next: need,
      ratio: Math.min(1, current / need),
      title,
    };
  }

  static areaUnlocked(areaId: string, save: SaveData = SaveManager.load()): boolean {
    return (save.unlockedAreas ?? ["bairro"]).includes(areaId);
  }

  static listAreas(save: SaveData = SaveManager.load()) {
    return AREAS.map((a) => ({
      ...a,
      unlocked: this.areaUnlocked(a.id, save),
    }));
  }

  /** Multiplicadores derivados dos upgrades para o Player. */
  static playerBonuses(save: SaveData = SaveManager.load()) {
    const u = save.upgrades ?? {};
    const mul = (id: string) => this.upgradeMultiplier(id, u[id] ?? 0);
    // energia mapeia resistência legada; agilidade → persuasão parcial
    const speed = mul("velocidade");
    const stamina = Math.max(mul("energia"), mul("resistencia"));
    const regen = mul("recuperacao");
    const agility = mul("agilidade");
    const voice = mul("voz");
    const persuade = Math.max(mul("persuasao"), 1 + (agility - 1) * 0.5);
    return {
      speed,
      stamina,
      regen,
      agility,
      voice,
      persuade,
      // caps suaves para não quebrar balanceamento
      walkSpeed: BALANCE.playerWalkSpeed * Math.min(1.25, speed),
      runSpeed: BALANCE.playerRunSpeed * Math.min(1.3, speed * (1 + (agility - 1) * 0.3)),
      maxStamina: BALANCE.maxStamina * Math.min(1.5, stamina),
      staminaRegen: BALANCE.staminaRegenPerSecond * Math.min(1.6, regen),
      callRange: Math.min(1.5, voice),
      convince: Math.min(1.4, persuade),
    };
  }
}
