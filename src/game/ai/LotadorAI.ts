import Phaser from "phaser";
import type { Passenger } from "../entities/Passenger";
import type { Taxi } from "../entities/Taxi";
import { PassengerState } from "../types";

export interface AIWorld {
  passengers: Passenger[];
  taxis: Taxi[];
}

export type AIState = "SCAN" | "MOVE" | "INTERACT" | "DELIVER" | "IDLE";

export interface AIProfile {
  /** Multiplicador de velocidade. */
  speed: number;
  /** Melhor avaliação de alvos (escolhe passageiros mais rentáveis). */
  strategy: number;
  /** Convence mais depressa. */
  persuasion: number;
}

/**
 * IA dos lotadores NPC.
 * Obedece exactamente às mesmas regras do jogador: tem de chegar perto,
 * convencer durante o mesmo tempo base e levar o passageiro ao táxi.
 */
export class LotadorAI {
  state: AIState = "SCAN";
  target: Passenger | null = null;
  taxi: Taxi | null = null;
  private scanCooldown = 0;

  constructor(
    private readonly owner: Phaser.Physics.Arcade.Sprite,
    readonly profile: AIProfile,
    private readonly world: AIWorld,
  ) {}

  private compatibleTaxi(p: Passenger): Taxi | null {
    const options = this.world.taxis.filter(
      (t) => t.isLoadable && t.destination === p.destination,
    );
    if (options.length === 0) return null;
    options.sort(
      (a, b) =>
        Phaser.Math.Distance.Between(this.owner.x, this.owner.y, a.x, a.y) -
        Phaser.Math.Distance.Between(this.owner.x, this.owner.y, b.x, b.y),
    );
    return options[0] ?? null;
  }

  /** SCAN → EVALUATE → SELECT TARGET */
  private scan(): void {
    let best: Passenger | null = null;
    let bestScore = -Infinity;
    for (const p of this.world.passengers) {
      if (!p.isAvailable) continue;
      if (!this.compatibleTaxi(p)) continue;
      const dist = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, p.x, p.y);
      const score =
        (p.value * this.profile.strategy) / (dist + 60) +
        p.def.urgency * 12 * this.profile.strategy -
        (1 - p.patienceRatio) * 40;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    if (best) {
      this.target = best;
      this.state = "MOVE";
    } else {
      this.state = "IDLE";
    }
  }

  private moveTowards(x: number, y: number, speed: number): void {
    const angle = Math.atan2(y - this.owner.y, x - this.owner.x);
    this.owner.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  update(delta: number, baseSpeed: number, interactRadius: number, convinceRate: number): void {
    const speed = baseSpeed * this.profile.speed;
    this.scanCooldown -= delta;

    switch (this.state) {
      case "IDLE":
      case "SCAN": {
        this.owner.setVelocity(0, 0);
        if (this.scanCooldown <= 0) {
          this.scanCooldown = 400;
          this.scan();
        }
        break;
      }
      case "MOVE": {
        const t = this.target;
        if (!t || !t.active || (!t.isAvailable && t.claimedBy !== this.owner)) {
          this.reset();
          break;
        }
        const dist = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, t.x, t.y);
        if (dist <= interactRadius) {
          this.state = "INTERACT";
        } else {
          this.moveTowards(t.x, t.y, speed);
        }
        break;
      }
      case "INTERACT": {
        const t = this.target;
        if (!t || !t.active) {
          this.reset();
          break;
        }
        this.owner.setVelocity(0, 0);
        const dist = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, t.x, t.y);
        if (dist > interactRadius * 1.4) {
          this.state = "MOVE";
          break;
        }
        const accepted = t.tryConvince(this.owner, delta * convinceRate, this.profile.persuasion);
        if (accepted) {
          const taxi = this.compatibleTaxi(t);
          if (!taxi) {
            t.releaseClaim(this.owner);
            this.reset();
            break;
          }
          this.taxi = taxi;
          t.startFollowing(taxi);
          this.state = "DELIVER";
        }
        break;
      }
      case "DELIVER": {
        const t = this.target;
        const taxi = this.taxi;
        if (!t || !t.active || !taxi || !taxi.active || taxi.state === "GONE") {
          this.reset();
          break;
        }
        if (!taxi.isLoadable) {
          const other = this.compatibleTaxi(t);
          if (!other) {
            t.giveUp();
            this.reset();
            break;
          }
          this.taxi = other;
          break;
        }
        const bp = taxi.boardPoint;
        const dist = Phaser.Math.Distance.Between(this.owner.x, this.owner.y, bp.x, bp.y);
        if (dist > 34) {
          this.moveTowards(bp.x, bp.y, speed);
        } else {
          this.owner.setVelocity(0, 0);
          if (t.state !== PassengerState.BOARDING) {
            this.owner.emit("npc-board", t, taxi);
          }
          this.reset();
        }
        break;
      }
      default:
        break;
    }
  }

  reset(): void {
    this.target = null;
    this.taxi = null;
    this.state = "SCAN";
    this.scanCooldown = 200;
  }
}
