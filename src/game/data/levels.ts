import type { MatchStats } from "../types";

export type LevelObjectiveMetric = "passengers" | "taxisFilled" | "money" | "fastFill" | "lostPassengers";

export interface LevelObjective {
  id: string;
  label: string;
  metric: LevelObjectiveMetric;
  goal: number;
  bonus: boolean;
}

export interface LevelConfig {
  id: number;
  name: string;
  rank: string;
  duration: number;
  passengers: number;
  taxis: number;
  rivals: number;
  obstacles: number;
  rewardMoney: number;
  rewardXp: number;
  objectives: LevelObjective[];
}

const objective = (id: string, label: string, metric: LevelObjectiveMetric, goal: number, bonus = false): LevelObjective => ({ id, label, metric, goal, bonus });

export const LEVELS: LevelConfig[] = [
  { id: 1, name: "PRIMEIRO DIA", rank: "APRENDIZ", duration: 300, passengers: 1, taxis: 1, rivals: 0, obstacles: 0, rewardMoney: 300, rewardXp: 50, objectives: [objective("passengers", "Levar 1 passageiro ao táxi", "passengers", 1)] },
  { id: 2, name: "PRIMEIROS CLIENTES", rank: "APRENDIZ", duration: 180, passengers: 2, taxis: 2, rivals: 0, obstacles: 0, rewardMoney: 400, rewardXp: 75, objectives: [objective("passengers", "Atender 2 passageiros", "passengers", 2)] },
  { id: 3, name: "MAIS MOVIMENTO", rank: "APRENDIZ", duration: 180, passengers: 3, taxis: 2, rivals: 1, obstacles: 0, rewardMoney: 500, rewardXp: 100, objectives: [objective("passengers", "Atender 3 passageiros", "passengers", 3), objective("money", "Ganhar 150 Kz", "money", 150, true)] },
  { id: 4, name: "PARAGEM CHEIA", rank: "APRENDIZ", duration: 180, passengers: 3, taxis: 2, rivals: 1, obstacles: 4, rewardMoney: 650, rewardXp: 125, objectives: [objective("passengers", "Atender 3 passageiros", "passengers", 3), objective("lost", "Perder no máximo 2 passageiros", "lostPassengers", 2, true)] },
  { id: 5, name: "PRIMEIRO TURNO", rank: "LOTADOR", duration: 180, passengers: 6, taxis: 3, rivals: 1, obstacles: 4, rewardMoney: 800, rewardXp: 160, objectives: [objective("taxis", "Encher 3 táxis", "taxisFilled", 3), objective("money", "Ganhar 500 Kz", "money", 500, true)] },
];

export function getLevel(id: number): LevelConfig { return LEVELS.find((level) => level.id === id) ?? LEVELS[0]!; }
export function metricValue(stats: MatchStats, metric: LevelObjectiveMetric): number { return stats[metric]; }
export function objectiveComplete(stats: MatchStats, item: LevelObjective): boolean {
  const value = metricValue(stats, item.metric);
  return item.metric === "lostPassengers" ? value <= item.goal : value >= item.goal;
}
export function starsForLevel(config: LevelConfig, stats: MatchStats, timeLeft: number): number {
  const main = config.objectives.find((item) => !item.bonus);
  if (!main || !objectiveComplete(stats, main)) return 0;
  const secondary = config.objectives.filter((item) => item.bonus).every((item) => objectiveComplete(stats, item));
  const onTime = timeLeft > 0;
  return secondary && onTime ? 3 : onTime ? 2 : 1;
}

export function levelRank(id: number): string {
  if (id <= 4) return "APRENDIZ";
  if (id <= 8) return "LOTADOR";
  if (id <= 12) return "LOTADOR EXPERIENTE";
  if (id <= 16) return "LOTADOR PROFISSIONAL";
  return "MESTRE DA PARAGEM";
}

export function getFutureLevel(id: number): LevelConfig {
  const config = getLevel(id);
  return config.id === id ? config : { ...config, id, name: `FASE ${id}`, rank: levelRank(id) };
}

export const levelObjectiveText = (config: LevelConfig, stats: MatchStats): string[] => config.objectives.map((item) => `${objectiveComplete(stats, item) ? "OK" : ""} ${item.label}`.trim());
