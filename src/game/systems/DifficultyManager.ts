import { BALANCE, DIFFICULTY_TIERS } from "../config/BalanceConfig";

export interface DifficultySnapshot {
  name: string;
  maxPassengers: number;
  npcCount: number;
  passengerRate: number;
  taxiRate: number;
}

/**
 * Dificuldade dinâmica: aumenta ao longo da partida e com o nível do jogador.
 * Menos passageiros + mais lotadores = mais escassez.
 */
export class DifficultyManager {
  private elapsed = 0;
  current: DifficultySnapshot;

  constructor(private readonly playerLevel: number) {
    this.current = { ...DIFFICULTY_TIERS[0]! };
    this.apply(0);
  }

  private apply(tierIndex: number): void {
    const tier = DIFFICULTY_TIERS[Math.min(tierIndex, DIFFICULTY_TIERS.length - 1)]!;
    const levelPush = Math.min(3, Math.floor(this.playerLevel / 8));
    this.current = {
      name: tier.name,
      maxPassengers: Math.max(4, tier.maxPassengers - levelPush),
      npcCount: Math.min(10, tier.npcCount + levelPush),
      passengerRate: tier.passengerRate,
      taxiRate: tier.taxiRate,
    };
  }

  tick(delta: number): boolean {
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
