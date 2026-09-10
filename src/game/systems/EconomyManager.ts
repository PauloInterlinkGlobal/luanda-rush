import type { MatchStats } from "../types";
import { BALANCE } from "../config/BalanceConfig";

/**
 * Economia e XP da partida em curso.
 * Só no fim da partida é que os valores são gravados no save.
 */
export class EconomyManager {
  stats: MatchStats = {
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
  };

  rewardMultiplier = 1;

  onMoney?: (amount: number, total: number) => void;
  onXp?: (amount: number, total: number) => void;

  addPassenger(value: number, comboMultiplier: number): number {
    const amount = Math.round(value * comboMultiplier * this.rewardMultiplier);
    this.stats.money += amount;
    this.stats.passengers++;
    this.stats.xp += BALANCE.xpPerPassenger;
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

  reset(): void {
    this.stats = {
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
    };
    this.rewardMultiplier = 1;
  }
}
