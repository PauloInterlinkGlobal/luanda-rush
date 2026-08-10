import { MISSIONS } from "../data/missions";
import type { MatchStats, MissionDefinition } from "../types";

export interface MissionProgress {
  def: MissionDefinition;
  current: number;
  done: boolean;
}

/** Avalia as missões da partida em tempo real. */
export class MissionManager {
  progress: MissionProgress[] = [];
  onComplete?: (m: MissionDefinition) => void;

  constructor(completed: Record<string, boolean>) {
    this.progress = MISSIONS.map((def) => ({
      def,
      current: 0,
      done: completed[def.id] === true,
    }));
  }

  evaluate(stats: MatchStats, combo: number): void {
    for (const p of this.progress) {
      if (p.done) continue;
      switch (p.def.metric) {
        case "taxisFilled":
          p.current = stats.taxisFilled;
          break;
        case "passengers":
          p.current = stats.passengers;
          break;
        case "money":
          p.current = stats.money;
          break;
        case "fastFill":
          p.current = stats.fastFill;
          break;
        case "combo":
          p.current = Math.max(p.current, combo);
          break;
        default:
          break;
      }
      if (p.current >= p.def.goal) {
        p.done = true;
        this.onComplete?.(p.def);
      }
    }
  }

  /** Missões concluídas nesta partida (para gravar). */
  completedIds(): string[] {
    return this.progress.filter((p) => p.done).map((p) => p.def.id);
  }
}
