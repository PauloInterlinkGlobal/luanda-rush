import type {
  LevelObjectiveDef,
  LevelStarRules,
  MatchStats,
  ObjectiveMetric,
} from "../types";

export interface ObjectiveProgress {
  def: LevelObjectiveDef;
  current: number;
  done: boolean;
  failed: boolean;
}

/**
 * Avalia objectivos de fase de forma modular e reutilizável.
 * Não está hardcoded a uma fase — recebe as defs e as stats em tempo real.
 */
export class ObjectiveManager {
  progress: ObjectiveProgress[] = [];
  onComplete?: (obj: LevelObjectiveDef) => void;
  onFail?: (obj: LevelObjectiveDef) => void;

  constructor(defs: LevelObjectiveDef[]) {
    this.progress = defs.map((def) => ({
      def,
      current: 0,
      done: false,
      failed: false,
    }));
  }

  /** Lê o valor actual de uma métrica a partir das stats + extras. */
  static readMetric(
    metric: ObjectiveMetric,
    stats: MatchStats,
    combo: number,
    extras?: { survived?: boolean; reputationTotal?: number },
  ): number {
    switch (metric) {
      case "taxisFilled":
        return stats.taxisFilled;
      case "passengers":
        return stats.passengers;
      case "money":
        return stats.money;
      case "fastFill":
        return stats.fastFill;
      case "callsUsed":
        return stats.callsUsed;
      case "runsUsed":
        return stats.runsUsed;
      case "combo":
        return Math.max(stats.bestCombo, combo);
      case "penalties":
        return stats.penalties;
      case "disputesWon":
        return stats.disputesWon;
      case "crossings":
        return stats.crossings;
      case "lostPassengers":
        return stats.lostPassengers;
      case "survive":
        return extras?.survived ? 1 : 0;
      case "reputation":
        return extras?.reputationTotal ?? stats.reputation;
      default:
        return 0;
    }
  }

  evaluate(
    stats: MatchStats,
    combo: number,
    extras?: { survived?: boolean; reputationTotal?: number },
  ): void {
    for (const p of this.progress) {
      if (p.failed) continue;
      const value = ObjectiveManager.readMetric(p.def.metric, stats, combo, extras);
      p.current = value;

      if (p.def.inverted) {
        // Objectivo "máximo N": falha se ultrapassar; só "done" no fim (finalize).
        if (value > p.def.goal) {
          if (!p.failed) {
            p.failed = true;
            p.done = false;
            this.onFail?.(p.def);
          }
        }
        continue;
      }

      if (!p.done && value >= p.def.goal) {
        p.done = true;
        this.onComplete?.(p.def);
      }
    }
  }

  /**
   * Fecha objectivos invertidos e de sobrevivência no fim da partida.
   * Chamar com survived=true se o jogador chegou ao fim sem derrota forçada.
   */
  finalize(
    stats: MatchStats,
    combo: number,
    extras: { survived: boolean; reputationTotal?: number },
  ): void {
    this.evaluate(stats, combo, extras);
    for (const p of this.progress) {
      if (p.def.inverted && !p.failed) {
        p.done = p.current <= p.def.goal;
      }
      if (p.def.metric === "survive" && extras.survived && !p.done) {
        p.current = 1;
        p.done = p.current >= p.def.goal;
      }
    }
  }

  primaryObjectives(): ObjectiveProgress[] {
    return this.progress.filter((p) => p.def.kind === "primary");
  }

  allPrimaryDone(): boolean {
    const primaries = this.primaryObjectives();
    return primaries.length > 0 && primaries.every((p) => p.done && !p.failed);
  }

  isDone(id: string): boolean {
    return this.progress.find((p) => p.def.id === id)?.done === true;
  }

  completedCount(): number {
    return this.progress.filter((p) => p.done).length;
  }

  /**
   * Calcula estrelas 1–3 com base nas regras da fase.
   * Não exige 3 estrelas para avançar — 1 estrela (objectivo principal) basta.
   */
  calculateStars(
    rules: LevelStarRules,
    timeSpent: number,
    stats: MatchStats,
    combo: number,
  ): number {
    // 1 estrela: todos os objectivos listados em star1
    const star1Ok = rules.star1.every((id) => this.isDone(id));
    if (!star1Ok) return 0;

    let stars = 1;

    // 2 estrelas: star1 + tempo
    if (rules.star2?.withinSeconds != null && timeSpent <= rules.star2.withinSeconds) {
      stars = 2;
    }

    // 3 estrelas: requer 2 estrelas + extras
    if (stars >= 2 && rules.star3) {
      const objsOk = (rules.star3.requireObjectives ?? []).every((id) => this.isDone(id));
      let bonusOk = true;
      if (rules.star3.bonusMetric != null && rules.star3.bonusGoal != null) {
        const v = ObjectiveManager.readMetric(rules.star3.bonusMetric, stats, combo);
        bonusOk = v >= rules.star3.bonusGoal;
      }
      if (objsOk && bonusOk) stars = 3;
    }

    return stars;
  }

  /** Snapshot para HUD / ecrã de resultado. */
  snapshot(): {
    id: string;
    label: string;
    current: number;
    goal: number;
    done: boolean;
    failed: boolean;
    kind: LevelObjectiveDef["kind"];
    inverted?: boolean;
  }[] {
    return this.progress.map((p) => {
      const row: {
        id: string;
        label: string;
        current: number;
        goal: number;
        done: boolean;
        failed: boolean;
        kind: LevelObjectiveDef["kind"];
        inverted?: boolean;
      } = {
        id: p.def.id,
        label: p.def.label,
        current: p.current,
        goal: p.def.goal,
        done: p.done,
        failed: p.failed,
        kind: p.def.kind,
      };
      if (p.def.inverted !== undefined) row.inverted = p.def.inverted;
      return row;
    });
  }
}
