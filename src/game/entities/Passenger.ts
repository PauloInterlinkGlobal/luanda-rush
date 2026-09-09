import Phaser from "phaser";
import { Character } from "./Character";
import { PASSENGERS, DESTINATION_COLORS } from "../data/passengers";
import { Destination, PassengerState, PassengerType, type PassengerDefinition } from "../types";
import { HEX } from "../config/GameConfig";
import type { Taxi } from "./Taxi";

/**
 * Passageiro — máquina de estados completa
 * SPAWNING → WAITING/SEARCHING → APPROACHED → ACCEPTED → FOLLOWING → BOARDING → COMPLETED
 * (ou LEAVING quando perde a paciência).
 */
export class Passenger extends Character {
  readonly def: PassengerDefinition;
  readonly passengerId: string;
  destination: Destination;
  override state: PassengerState = PassengerState.SPAWNING;
  patience: number;
  value: number;
  /** Tutorial: nunca perde a paciência nem desiste sozinho. */
  frozenPatience = false;

  /** Quem reclamou este passageiro (jogador ou NPC). */
  claimedBy: Phaser.GameObjects.GameObject | null = null;
  follower: Phaser.GameObjects.GameObject | null = null;
  targetTaxi: Taxi | null = null;

  private bubble: Phaser.GameObjects.Container;
  private wanderTimer = 0;
  private wanderDir = new Phaser.Math.Vector2(0, 0);
  private convinceProgress = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: PassengerType,
    destination: Destination,
  ) {
    const def = PASSENGERS[type];
    super(scene, x, y, `pass_${type}`);
    this.def = def;
    this.destination = destination;
    this.patience = def.patience;
    this.value = def.value;
    this.passengerId = `p_${Math.random().toString(36).slice(2, 9)}`;
    this.setDepth(y);

    this.bubble = this.createBubble(scene);
    this.state = PassengerState.WAITING;
  }

  private createBubble(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const color = DESTINATION_COLORS[this.destination];
    const bg = scene.add.rectangle(0, 0, 112, 34, color, 0.95).setStrokeStyle(2, 0x0e1a33);
    const text = scene.add
      .text(0, -5, `${this.def.label} · ${this.destination}`, {
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: "13px",
        color: HEX.white,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const patienceBar = scene.add.rectangle(-48, 12, 96, 3, 0x0e1a33, 0.7).setOrigin(0, 0.5);
    patienceBar.setName("patience-bar");
    const tail = scene.add.triangle(0, 21, -6, 0, 6, 0, 0, 8, color);
    const c = scene.add.container(this.x, this.y - 52, [bg, tail, text, patienceBar]);
    c.setDepth(100000);
    return c;
  }

  /** Percentagem de paciência restante (1 → 0). */
  get patienceRatio(): number {
    return Phaser.Math.Clamp(this.patience / this.def.patience, 0, 1);
  }

  get isAvailable(): boolean {
    return (
      (this.state === PassengerState.WAITING || this.state === PassengerState.SEARCHING) &&
      this.claimedBy === null
    );
  }

  /** Um lotador tenta convencer. Devolve true quando o passageiro aceita. */
  tryConvince(by: Phaser.GameObjects.GameObject, deltaMs: number, persuasion: number): boolean {
    if (this.claimedBy && this.claimedBy !== by) return false;
    if (!this.isAvailable && this.state !== PassengerState.APPROACHED) return false;
    this.claimedBy = by;
    this.state = PassengerState.APPROACHED;
    this.convinceProgress += deltaMs * persuasion;
    if (this.convinceProgress >= this.def.convinceTime) {
      this.state = PassengerState.ACCEPTED;
      this.follower = by;
      return true;
    }
    return false;
  }

  releaseClaim(by: Phaser.GameObjects.GameObject): void {
    if (this.claimedBy === by && this.state === PassengerState.APPROACHED) {
      this.claimedBy = null;
      this.state = PassengerState.WAITING;
      this.convinceProgress = 0;
    }
  }

  startFollowing(taxi: Taxi): void {
    this.state = PassengerState.FOLLOWING;
    this.targetTaxi = taxi;
  }

  board(): void {
    this.state = PassengerState.BOARDING;
    this.setVelocity(0, 0);
    this.bubble.setVisible(false);
  }

  complete(): void {
    this.state = PassengerState.COMPLETED;
  }

  giveUp(): void {
    this.state = PassengerState.LEAVING;
    this.claimedBy = null;
    this.bubble.setVisible(false);
  }

  tick(delta: number, leader: Phaser.Math.Vector2 | null): void {
    const dt = delta / 1000;

    if (
      this.state === PassengerState.WAITING ||
      this.state === PassengerState.SEARCHING ||
      this.state === PassengerState.APPROACHED
    ) {
      this.patience -= dt;
      if (this.patience <= 0) this.giveUp();
    }

    switch (this.state) {
      case PassengerState.WAITING:
      case PassengerState.SEARCHING: {
        // Pequeno vaguear para o mapa parecer vivo
        this.wanderTimer -= dt;
        if (this.wanderTimer <= 0) {
          this.wanderTimer = Phaser.Math.FloatBetween(1.2, 3);
          if (Math.random() < 0.55) {
            const a = Math.random() * Math.PI * 2;
            this.wanderDir.set(Math.cos(a), Math.sin(a));
          } else {
            this.wanderDir.set(0, 0);
          }
        }
        this.setVelocity(this.wanderDir.x * this.def.speed * 0.35, this.wanderDir.y * this.def.speed * 0.35);
        break;
      }
      case PassengerState.APPROACHED:
        this.setVelocity(0, 0);
        break;
      case PassengerState.ACCEPTED:
      case PassengerState.FOLLOWING: {
        if (leader) {
          const dist = Phaser.Math.Distance.Between(this.x, this.y, leader.x, leader.y);
          if (dist > 44) {
            const angle = Math.atan2(leader.y - this.y, leader.x - this.x);
            const spd = this.def.speed * 1.45;
            this.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
          } else {
            this.setVelocity(0, 0);
          }
        }
        break;
      }
      case PassengerState.LEAVING: {
        this.setVelocity(0, -this.def.speed);
        this.setAlpha(Math.max(0, this.alpha - dt * 1.4));
        break;
      }
      default:
        this.setVelocity(0, 0);
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    this.updateAnimation(
      body?.velocity.x ?? 0,
      body?.velocity.y ?? 0,
      this.state === PassengerState.FOLLOWING,
      false,
      delta,
    );
    this.refreshDepth();

    // Balão de destino e urgência visual para facilitar decisões rápidas.
    this.bubble.setPosition(this.x, this.y - 52);
    this.bubble.setAlpha(this.alpha);
    const patienceBar = this.bubble.getByName("patience-bar") as Phaser.GameObjects.Rectangle;
    patienceBar.width = 96 * this.patienceRatio;
    patienceBar.fillColor = this.patienceRatio < 0.3 ? 0xe23b3b : 0x36b45a;
    if (this.state === PassengerState.WAITING || this.state === PassengerState.SEARCHING) {
      const urgent = this.patienceRatio < 0.3;
      this.bubble.setScale(urgent ? 1 + Math.sin(this.scene.time.now / 120) * 0.06 : 1);
    }
  }

  override destroy(fromScene?: boolean): void {
    this.bubble.destroy();
    super.destroy(fromScene);
  }
}
