import { BALANCE } from "../config/BalanceConfig";
import { PowerUpType } from "../types";

interface ActivePowerUp {
  type: PowerUpType;
  until: number;
}

/**
 * Power-ups do jogador. TURBO e MEGAFONE activos no MVP;
 * RADAR / ÍMAN / COMBO SHIELD já têm entrada preparada.
 */
export class PowerUpManager {
  private active: ActivePowerUp[] = [];
  private cooldownUntil = 0;
  /** Power-up carregado e pronto a usar. */
  ready: PowerUpType = PowerUpType.TURBO;

  onActivate?: (type: PowerUpType) => void;

  canUse(now: number): boolean {
    return now >= this.cooldownUntil;
  }

  cooldownRatio(now: number): number {
    if (now >= this.cooldownUntil) return 1;
    const total = BALANCE.powerUpCooldown * 1000;
    return 1 - (this.cooldownUntil - now) / total;
  }

  use(now: number): PowerUpType | null {
    if (!this.canUse(now)) return null;
    const type = this.ready;
    const duration =
      type === PowerUpType.MEGAFONE ? BALANCE.megaphoneDuration : BALANCE.turboDuration;
    this.active.push({ type, until: now + duration * 1000 });
    this.cooldownUntil = now + BALANCE.powerUpCooldown * 1000;
    // Alterna o próximo power-up disponível
    this.ready = type === PowerUpType.TURBO ? PowerUpType.MEGAFONE : PowerUpType.TURBO;
    this.onActivate?.(type);
    return type;
  }

  tick(now: number): void {
    this.active = this.active.filter((a) => a.until > now);
  }

  isActive(type: PowerUpType, now: number): boolean {
    return this.active.some((a) => a.type === type && a.until > now);
  }

  reset(): void {
    this.active = [];
    this.cooldownUntil = 0;
    this.ready = PowerUpType.TURBO;
  }
}
