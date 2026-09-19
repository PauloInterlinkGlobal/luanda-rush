import { getLevel, LEVELS, rankForPhase } from "../data/levels";
import type {
  LevelDefinition,
  LevelResult,
  MatchStats,
  SaveData,
} from "../types";
import { ObjectiveManager } from "./ObjectiveManager";
import { ProgressionManager } from "./ProgressionManager";

export type LevelHudSnapshot = {
  phaseId: number;
  phaseName: string;
  rankLabel: string;
  timeLeft: number;
  timeLimit: number;
  starsPreview: number;
  objectives: ReturnType<ObjectiveManager["snapshot"]>;
};

/**
 * Orquestra uma fase: objectivos, vitória/derrota, estrelas e recompensas.
 * A GameScene consulta este manager em vez de hardcodar regras por fase.
 */
export class LevelManager {
  readonly def: LevelDefinition;
  readonly objectives: ObjectiveManager;
  readonly duration: number;

  private startedAt = 0;
  private elapsed = 0;
  private finished = false;

  constructor(phaseId: number) {
    const def = getLevel(phaseId);
    if (!def) throw new Error(`Fase ${phaseId} não existe`);
    this.def = def;
    this.duration = def.duration;
    this.objectives = new ObjectiveManager(def.objectives);
  }

  static hasPhase(id: number): boolean {
    return LEVELS.some((l) => l.id === id);
  }

  static totalPhases(): number {
    return LEVELS.length;
  }

  get phaseId(): number {
    return this.def.id;
  }

  get isTutorial(): boolean {
    return this.def.spawn.guidedTutorial === true;
  }

  get spawn() {
    return this.def.spawn;
  }

  begin(): void {
    this.startedAt = performance.now();
    this.elapsed = 0;
    this.finished = false;
  }

  /** Avança o relógio interno (segundos). */
  tick(dtSeconds: number): void {
    if (this.finished) return;
    this.elapsed += dtSeconds;
  }

  get timeSpent(): number {
    return this.elapsed;
  }

  get timeLeft(): number {
    return Math.max(0, this.duration - this.elapsed);
  }

  evaluate(stats: MatchStats, combo: number, reputationTotal?: number): void {
    const extras: { reputationTotal?: number } = {};
    if (reputationTotal !== undefined) extras.reputationTotal = reputationTotal;
    this.objectives.evaluate(stats, combo, extras);
  }

  /** Vitória antecipada: todos os objectivos primários cumpridos. */
  checkEarlyWin(stats: MatchStats, combo: number): boolean {
    this.evaluate(stats, combo);
    return this.objectives.allPrimaryDone();
  }

  /**
   * Fecha a fase. `survived` = chegou ao fim do tempo ou completou objectivos
   * sem derrota forçada.
   */
  finish(
    stats: MatchStats,
    combo: number,
    opts: { survived: boolean; forcedLose?: boolean; reputationTotal?: number },
  ): LevelResult {
    this.finished = true;
    const finExtras: { survived: boolean; reputationTotal?: number } = {
      survived: opts.survived && !opts.forcedLose,
    };
    if (opts.reputationTotal !== undefined) finExtras.reputationTotal = opts.reputationTotal;
    this.objectives.finalize(stats, combo, finExtras);

    const primaryDone = this.objectives.allPrimaryDone() && !opts.forcedLose;
    const won = primaryDone;
    const stars = won
      ? this.objectives.calculateStars(this.def.starRules, this.elapsed, stats, combo)
      : 0;

    const perStar = this.def.rewards.perStarBonus ?? Math.round(this.def.rewards.money * 0.15);
    const rewardMoney = won ? this.def.rewards.money + Math.max(0, stars - 1) * perStar : 0;
    const rewardXp = won
      ? this.def.rewards.xp + Math.max(0, stars - 1) * Math.round(this.def.rewards.xp * 0.2)
      : Math.round(this.def.rewards.xp * 0.1);

    const prev = ProgressionManager.phaseProgress(this.phaseId);
    const newRecord = won && stars > prev.stars;

    const rank = rankForPhase(this.phaseId);

    const result: LevelResult = {
      phaseId: this.phaseId,
      won,
      stars,
      previousStars: prev.stars,
      newRecord,
      primaryDone,
      objectives: this.objectives.snapshot().map((o) => ({
        id: o.id,
        label: o.label,
        current: o.current,
        goal: o.goal,
        done: o.done,
        kind: o.kind,
      })),
      stats: {
        ...stats,
        phaseId: this.phaseId,
        starsEarned: stars,
        levelRewardMoney: rewardMoney,
        levelRewardXp: rewardXp,
        newRecord,
        survived: opts.survived,
        objectivesTotal: this.objectives.progress.length,
        objectivesCompleted: this.objectives.completedCount(),
        promoted: won,
      },
      rewardMoney,
      rewardXp,
      timeSpent: this.elapsed,
      timeLimit: this.duration,
      levelName: this.def.name,
      rankLabel: rank.label,
      unlockedNext: won && this.phaseId < LEVELS.length,
    };
    if (won && this.def.finaleTitle) result.finaleTitle = this.def.finaleTitle;
    if (won && this.def.unlockArea) result.unlockedArea = this.def.unlockArea;

    return result;
  }

  /** Aplica resultado ao save (recompensas + desbloqueios). */
  commit(result: LevelResult): SaveData {
    return ProgressionManager.applyLevelResult(result);
  }

  hudSnapshot(stats: MatchStats, combo: number): LevelHudSnapshot {
    this.evaluate(stats, combo);
    const preview = this.objectives.allPrimaryDone()
      ? this.objectives.calculateStars(this.def.starRules, this.elapsed, stats, combo)
      : this.objectives.primaryObjectives().some((p) => p.done)
        ? 1
        : 0;
    return {
      phaseId: this.phaseId,
      phaseName: this.def.name,
      rankLabel: rankForPhase(this.phaseId).label,
      timeLeft: this.timeLeft,
      timeLimit: this.duration,
      starsPreview: preview,
      objectives: this.objectives.snapshot(),
    };
  }
}
