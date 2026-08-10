import { BALANCE } from "../config/BalanceConfig";

/** Gere o combo e o seu temporizador. */
export class ComboManager {
  level = 1;
  best = 1;
  private timeLeft = 0;

  onChange?: (level: number, ratio: number) => void;
  onLost?: () => void;

  register(): number {
    this.level = Math.min(BALANCE.comboMax, this.level + 1);
    this.best = Math.max(this.best, this.level);
    this.timeLeft = BALANCE.comboTimeout;
    this.onChange?.(this.level, 1);
    return this.level;
  }

  get multiplier(): number {
    return 1 + (this.level - 1) * BALANCE.comboMoneyMultiplier;
  }

  tick(delta: number): void {
    if (this.level <= 1) return;
    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) {
      this.level = 1;
      this.onLost?.();
      this.onChange?.(1, 0);
    } else {
      this.onChange?.(this.level, this.timeLeft / BALANCE.comboTimeout);
    }
  }

  reset(): void {
    this.level = 1;
    this.best = 1;
    this.timeLeft = 0;
  }
}
