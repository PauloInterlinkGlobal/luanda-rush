import { BALANCE, DIFFICULTY_TIERS } from "../config/BalanceConfig";
import type { LevelSpawnConfig } from "../types";

export interface DifficultySnapshot {
  name: string;
  maxPassengers: number;
  npcCount: number;
  passengerRate: number;
  taxiRate: number;
  maxTaxis: number;
  npcSpeedMul: number;
  npcStrategyMul: number;
  trafficLevel: number;
  rushAllowed: boolean;
  fiscalCount: number;
}

/**
 * Dificuldade: prioriza a configuração da fase (LevelSpawnConfig).
 * Sem fase, cai no sistema dinâmico antigo (tempo + nível do jogador).
 */
export class DifficultyManager {
  private elapsed = 0;
  current: DifficultySnapshot;
  private readonly fromLevel: LevelSpawnConfig | null;

  constructor(
    private readonly playerLevel: number,
    levelSpawn?: LevelSpawnConfig | null,
  ) {
    this.fromLevel = levelSpawn ?? null;
    this.current = {
      name: "FACIL",
      maxPassengers: 10,
      npcCount: 3,
      passengerRate: 1.8,
      taxiRate: 6,
      maxTaxis: 3,
      npcSpeedMul: 1,
      npcStrategyMul: 1,
      trafficLevel: 0.3,
      rushAllowed: true,
      fiscalCount: 0,
    };
    this.apply(0);
  }

  private apply(tierIndex: number): void {
    if (this.fromLevel) {
      const s = this.fromLevel;
      this.current = {
        name: `FASE`,
        maxPassengers: s.maxPassengers,
        npcCount: s.npcCount,
        passengerRate: s.passengerRate,
        taxiRate: s.taxiRate,
        maxTaxis: s.maxTaxis,
        npcSpeedMul: s.npcSpeedMul ?? 1,
        npcStrategyMul: s.npcStrategyMul ?? 1,
        trafficLevel: s.trafficLevel,
        rushAllowed: s.rushHour,
        fiscalCount: s.fiscalCount ?? 0,
      };
      return;
    }

    const tier = DIFFICULTY_TIERS[Math.min(tierIndex, DIFFICULTY_TIERS.length - 1)]!;
    const levelPush = Math.min(3, Math.floor(this.playerLevel / 8));
    this.current = {
      name: tier.name,
      maxPassengers: Math.max(4, tier.maxPassengers - levelPush),
      npcCount: Math.min(10, tier.npcCount + levelPush),
      passengerRate: tier.passengerRate,
      taxiRate: tier.taxiRate,
      maxTaxis: Math.min(6, 2 + Math.floor(this.playerLevel / 10)),
      npcSpeedMul: 1 + levelPush * 0.05,
      npcStrategyMul: 1 + levelPush * 0.04,
      trafficLevel: 0.3 + tierIndex * 0.2,
      rushAllowed: true,
      fiscalCount: 0,
    };
  }

  tick(delta: number): boolean {
    if (this.fromLevel) {
      // Configuração fixa da fase — sem escalar no tempo.
      this.elapsed += delta / 1000;
      return false;
    }
    const before = this.current.name;
    this.elapsed += delta / 1000;
    const third = BALANCE.matchDuration / 3;
    this.apply(Math.floor(this.elapsed / third));
    return this.current.name !== before;
  }

  reset(): void {
    this.elapsed = 0;
    this.apply(0);
  }
}
