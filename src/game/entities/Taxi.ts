import Phaser from "phaser";
import { TAXIS } from "../data/taxis";
import { DESTINATION_COLORS } from "../data/passengers";
import { Destination, TaxiState, TaxiType, type TaxiDefinition } from "../types";
import { HEX } from "../config/GameConfig";
import { MAP_CONFIG } from "../config/MapConfig";

/**
 * Táxi — chega, espera, carrega passageiros, enche e parte.
 * Mostra sempre o destino e a lotação por cima do veículo.
 */
export class Taxi extends Phaser.Physics.Arcade.Sprite {
  readonly def: TaxiDefinition;
  readonly taxiId: string;
  destination: Destination;
  capacity: number;
  currentPassengers = 0;
  override state: TaxiState = TaxiState.ARRIVING;
  slotIndex: number;
  arrivedAt = 0;

  private targetX: number;
  private label: Phaser.GameObjects.Container;
  private countText: Phaser.GameObjects.Text;
  private timerBar: Phaser.GameObjects.Rectangle;
  private waitLeft: number;
  private dust?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Phaser.Scene,
    type: TaxiType,
    destination: Destination,
    slotIndex: number,
  ) {
    const def = TAXIS[type];
    const slot = MAP_CONFIG.taxiSlots[slotIndex] ?? MAP_CONFIG.taxiSlots[0]!;
    super(scene, -180, slot.y, `taxi_${type}`, 0);
    this.def = def;
    this.destination = destination;
    this.capacity = def.capacity;
    this.slotIndex = slotIndex;
    this.targetX = slot.x;
    this.waitLeft = def.waitTime;
    this.taxiId = `t_${Math.random().toString(36).slice(2, 9)}`;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(120, 40);
    body.setOffset(6, 26);
    body.setImmovable(true);
    this.setDepth(slot.y);
    this.play(`taxi_${type}-roll`, true);

    this.label = this.createLabel(scene);
    this.countText = scene.add
      .text(0, 0, "", {
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: "15px",
        color: HEX.white,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(100001);
    this.timerBar = scene.add
      .rectangle(0, 0, 90, 5, 0x36b45a)
      .setOrigin(0, 0.5)
      .setDepth(100001);

    if (scene.textures.exists("fx_dust")) {
      this.dust = scene.add.particles(0, 0, "fx_dust", {
        speed: { min: 20, max: 70 },
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 500,
        frequency: 60,
        quantity: 1,
      });
      this.dust.setDepth(slot.y - 1);
    }
  }

  private createLabel(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const color = DESTINATION_COLORS[this.destination];
    const bg = scene.add.rectangle(0, 0, 116, 26, color, 0.96).setStrokeStyle(3, 0x0e1a33);
    const text = scene.add
      .text(0, 0, this.destination, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "17px",
        color: HEX.white,
      })
      .setOrigin(0.5);
    const c = scene.add.container(this.x, this.y - 58, [bg, text]);
    c.setDepth(100001);
    return c;
  }

  get isLoadable(): boolean {
    return (
      (this.state === TaxiState.WAITING || this.state === TaxiState.LOADING) &&
      this.currentPassengers < this.capacity
    );
  }

  get boardPoint(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x - 30, this.y + 34);
  }

  /** Adiciona um passageiro. Devolve true se o táxi ficou cheio. */
  addPassenger(): boolean {
    this.currentPassengers++;
    this.state = TaxiState.LOADING;
    this.scene.tweens.add({
      targets: this,
      y: this.y + 3,
      duration: 90,
      yoyo: true,
    });
    if (this.currentPassengers >= this.capacity) {
      this.state = TaxiState.FULL;
      return true;
    }
    return false;
  }

  depart(): void {
    if (this.state === TaxiState.DEPARTING || this.state === TaxiState.GONE) return;
    this.state = TaxiState.DEPARTING;
    this.label.setVisible(false);
    this.countText.setVisible(false);
    this.timerBar.setVisible(false);
  }

  tick(delta: number): void {
    const dt = delta / 1000;
    switch (this.state) {
      case TaxiState.ARRIVING: {
        this.setVelocityX(340);
        this.dust?.setPosition(this.x - 60, this.y + 26);
        if (this.x >= this.targetX) {
          this.x = this.targetX;
          this.setVelocityX(0);
          this.state = TaxiState.WAITING;
          this.arrivedAt = this.scene.time.now;
          this.anims.stop();
          this.setFrame(0);
          this.dust?.stop();
          this.scene.events.emit("taxi-arrived", this);
        }
        break;
      }
      case TaxiState.WAITING:
      case TaxiState.LOADING: {
        this.waitLeft -= dt;
        if (this.waitLeft <= 0) this.depart();
        break;
      }
      case TaxiState.FULL: {
        this.waitLeft = Math.min(this.waitLeft, 1.2);
        this.waitLeft -= dt;
        if (this.waitLeft <= 0) this.depart();
        break;
      }
      case TaxiState.DEPARTING: {
        this.play(`taxi_${this.def.type}-roll`, true);
        this.setVelocityX(this.body ? Math.min(420, (this.body.velocity.x || 60) + 500 * dt) : 300);
        this.dust?.setPosition(this.x - 60, this.y + 26);
        if (this.x > MAP_CONFIG.width + 200) {
          this.state = TaxiState.GONE;
        }
        break;
      }
      case TaxiState.GONE:
        break;
      default:
        break;
    }

    this.label.setPosition(this.x, this.y - 58);
    this.countText.setPosition(this.x, this.y - 34);
    this.countText.setText(`${this.currentPassengers} / ${this.capacity}`);
    this.timerBar.setPosition(this.x - 45, this.y - 20);
    const ratio = Phaser.Math.Clamp(this.waitLeft / this.def.waitTime, 0, 1);
    this.timerBar.width = 90 * ratio;
    this.timerBar.fillColor = ratio > 0.5 ? 0x36b45a : ratio > 0.25 ? 0xffc31f : 0xe23b3b;
    this.setDepth(this.y);
  }

  override destroy(fromScene?: boolean): void {
    this.label.destroy();
    this.countText.destroy();
    this.timerBar.destroy();
    this.dust?.destroy();
    super.destroy(fromScene);
  }
}
