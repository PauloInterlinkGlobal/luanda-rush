import type { MatchStats } from "../types";
import { BALANCE } from "../config/BalanceConfig";

/**
 * Economia e XP da partida em curso.
 * Só no fim da partida é que os valores são gravados no save
 * (via ProgressionManager / LevelManager).
 */
export class EconomyManager {
  stats: MatchStats = this.blank();

  rewardMultiplier = 1;

  onMoney?: (amount: number, total: number) => void;
  onXp?: (amount: number, total: number) => void;

  private blank(): MatchStats {
    return {
      taxisFilled: 0,
      passengers: 0,
      bestCombo: 1,
      money: 0,
      xp: 0,
      lostPassengers: 0,
      fastFill: 0,
      callsUsed: 0,
      runsUsed: 0,
      objectivesTotal: 0,
      objectivesCompleted: 0,
      promoted: false,
      penalties: 0,
      disputesWon: 0,
      crossings: 0,
      reputation: 0,
      phaseId: 0,
      starsEarned: 0,
      levelRewardMoney: 0,
      levelRewardXp: 0,
      newRecord: false,
      survived: false,
    };
  }

  addPassenger(value: number, comboMultiplier: number): number {
    const amount = Math.round(value * comboMultiplier * this.rewardMultiplier);
    this.stats.money += amount;
    this.stats.passengers++;
    this.stats.xp += BALANCE.xpPerPassenger;
    this.stats.reputation += 1;
    this.onMoney?.(amount, this.stats.money);
    this.onXp?.(BALANCE.xpPerPassenger, this.stats.xp);
    return amount;
  }

  addTaxi(bonus: number, comboMultiplier: number, fast: boolean): { money: number; xp: number } {
    const money = Math.round(bonus * comboMultiplier * this.rewardMultiplier);
    let xp = BALANCE.xpPerTaxi;
    if (fast) {
      xp += BALANCE.xpFastFill;
      this.stats.fastFill++;
    }
    this.stats.money += money;
    this.stats.xp += xp;
    this.stats.taxisFilled++;
    this.stats.reputation += 3;
    this.onMoney?.(money, this.stats.money);
    this.onXp?.(xp, this.stats.xp);
    return { money, xp };
  }

  addComboXp(level: number): number {
    const xp = BALANCE.xpComboStep * (level - 1);
    if (xp <= 0) return 0;
    this.stats.xp += xp;
    this.stats.bestCombo = Math.max(this.stats.bestCombo, level);
    this.onXp?.(xp, this.stats.xp);
    return xp;
  }

  registerLoss(): void {
    this.stats.lostPassengers++;
  }

  /** Um CHAMAR chegou realmente a passageiros (métrica de missão). */
  registerCall(): void {
    this.stats.callsUsed++;
  }

  /** Uma corrida foi realmente ativada (métrica de missão). */
  registerRun(): void {
    this.stats.runsUsed++;
  }

  registerPenalty(amount = 1): void {
    this.stats.penalties += amount;
  }

  registerDisputeWon(): void {
    this.stats.disputesWon++;
    this.stats.reputation += 2;
  }

  registerCrossing(): void {
    this.stats.crossings++;
  }

  reset(): void {
    this.stats = this.blank();
    this.rewardMultiplier = 1;
  }
}
