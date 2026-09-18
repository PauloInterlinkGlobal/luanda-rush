import { MISSIONS } from "../data/missions";
import type { MatchStats, MissionDefinition, ObjectiveMetric } from "../types";
import { ObjectiveManager } from "./ObjectiveManager";

export interface MissionProgress {
  def: MissionDefinition;
  current: number;
  done: boolean;
}

/**
 * Avalia as missões da partida em tempo real.
 * Reutiliza ObjectiveManager.readMetric para métricas partilhadas com fases.
 */
export class MissionManager {
  progress: MissionProgress[] = [];
  onComplete?: (m: MissionDefinition) => void;

  /** `defs` permite usar a configuração de tutorial sem duplicar o sistema. */
  constructor(completed: Record<string, boolean>, defs: MissionDefinition[] = MISSIONS) {
    this.progress = defs.map((def) => ({
      def,
      current: 0,
      done: completed[def.id] === true,
    }));
  }

  evaluate(stats: MatchStats, combo: number): void {
    for (const p of this.progress) {
      if (p.done) continue;
      const metric = p.def.metric as ObjectiveMetric;
      p.current = ObjectiveManager.readMetric(metric, stats, combo);
      // combo: manter o máximo
      if (metric === "combo") {
        p.current = Math.max(p.current, combo);
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
