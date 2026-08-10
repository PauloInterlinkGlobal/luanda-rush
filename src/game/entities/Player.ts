import Phaser from "phaser";
import { Character } from "./Character";
import { BALANCE } from "../config/BalanceConfig";
import type { SaveData } from "../types";
import { UPGRADES } from "../data/missions";

/**
 * Jogador — movimento, corrida, stamina e power-ups.
 * Os upgrades guardados aplicam-se aqui.
 */
export class Player extends Character {
  stamina: number = BALANCE.maxStamina;
  maxStamina: number = BALANCE.maxStamina;
  isRunning = false;
  tired = false;
  turboUntil = 0;
  megaphoneUntil = 0;

  private walkSpeed: number = BALANCE.playerWalkSpeed;
  private runSpeed: number = BALANCE.playerRunSpeed;
  private regenDelay = 0;
  private stepTimer = 0;

  /** Multiplicadores derivados dos upgrades. */
  callRangeBonus = 1;
  convinceBonus = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, save: SaveData) {
    super(scene, x, y, "player");
    this.applyUpgrades(save);
    this.setDepth(y);
  }

  applyUpgrades(save: SaveData): void {
    const lvl = (id: string): number => {
      const def = UPGRADES.find((u) => u.id === id);
      const level = save.upgrades[id as keyof SaveData["upgrades"]] ?? 0;
      return def ? 1 + def.perLevel * level : 1;
    };
    const speedMul = lvl("velocidade");
    this.walkSpeed = BALANCE.playerWalkSpeed * speedMul;
    this.runSpeed = BALANCE.playerRunSpeed * speedMul;
    this.maxStamina = BALANCE.maxStamina * lvl("resistencia");
    this.stamina = this.maxStamina;
    this.callRangeBonus = lvl("voz");
    this.convinceBonus = lvl("persuasao");
  }

  get callRadius(): number {
    const base =
      this.scene.time.now < this.megaphoneUntil ? BALANCE.megaphoneRadius : BALANCE.callRadius;
    return base * this.callRangeBonus;
  }

  get hasTurbo(): boolean {
    return this.scene.time.now < this.turboUntil;
  }

  get hasMegaphone(): boolean {
    return this.scene.time.now < this.megaphoneUntil;
  }

  activateTurbo(): void {
    this.turboUntil = this.scene.time.now + BALANCE.turboDuration * 1000;
  }

  activateMegaphone(): void {
    this.megaphoneUntil = this.scene.time.now + BALANCE.megaphoneDuration * 1000;
  }

  /**
   * @param dirX -1..1
   * @param dirY -1..1
   * @param wantsRun pedido de corrida (shift / botão)
   */
  move(dirX: number, dirY: number, wantsRun: boolean, delta: number): void {
    const dt = delta / 1000;
    const len = Math.hypot(dirX, dirY);
    const nx = len > 0 ? dirX / len : 0;
    const ny = len > 0 ? dirY / len : 0;
    const moving = len > 0.05;

    this.isRunning = wantsRun && moving && this.stamina > 1;

    let speed = this.isRunning ? this.runSpeed : this.walkSpeed;
    if (this.hasTurbo) speed *= 1 + BALANCE.turboBoost;
    if (this.tired) speed *= BALANCE.tiredSpeedMultiplier;

    this.setVelocity(nx * speed, ny * speed);

    // Stamina
    if (this.isRunning) {
      this.stamina = Math.max(0, this.stamina - BALANCE.staminaDrainPerSecond * dt);
      this.regenDelay = BALANCE.staminaRegenDelay;
      if (this.stamina <= 0) this.tired = true;
    } else {
      this.regenDelay = Math.max(0, this.regenDelay - dt);
      if (this.regenDelay <= 0) {
        this.stamina = Math.min(
          this.maxStamina,
          this.stamina + BALANCE.staminaRegenPerSecond * dt,
        );
      }
      if (this.stamina > this.maxStamina * 0.3) this.tired = false;
    }

    // Passos
    if (moving) {
      this.stepTimer -= delta;
      if (this.stepTimer <= 0) {
        this.stepTimer = this.isRunning ? 220 : 340;
        this.emit("footstep");
      }
    }

    this.updateAnimation(nx * speed, ny * speed, this.isRunning, this.tired && !moving, delta);
    this.refreshDepth();
  }
}
