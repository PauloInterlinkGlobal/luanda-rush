import Phaser from "phaser";
import { Character } from "./Character";
import { MAP_CONFIG } from "../config/MapConfig";

/**
 * Transeunte: figurante que só passeia pela paragem.
 * Não interage com passageiros nem táxis — serve para dar vida ao mapa.
 */
export class Pedestrian extends Character {
  private target: Phaser.Math.Vector2;
  private pauseFor = 0;
  private readonly speed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, sheetKey: string) {
    super(scene, x, y, sheetKey);
    this.speed = Phaser.Math.Between(38, 62);
    this.target = this.pickTarget();
    this.setDepth(y);
  }

  private pickTarget(): Phaser.Math.Vector2 {
    const spots = MAP_CONFIG.ambientSpawns;
    const spot = spots[Phaser.Math.Between(0, spots.length - 1)]!;
    return new Phaser.Math.Vector2(
      Phaser.Math.Clamp(spot.x + Phaser.Math.Between(-120, 120), 40, MAP_CONFIG.width - 40),
      Phaser.Math.Clamp(spot.y + Phaser.Math.Between(-60, 60), 40, MAP_CONFIG.height - 40),
    );
  }

  tick(delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;

    if (this.pauseFor > 0) {
      this.pauseFor -= delta;
      body.setVelocity(0, 0);
    } else if (Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y) < 18) {
      this.pauseFor = Phaser.Math.Between(600, 2200);
      this.target = this.pickTarget();
      body.setVelocity(0, 0);
    } else {
      this.scene.physics.moveTo(this, this.target.x, this.target.y, this.speed);
    }

    this.updateAnimation(body.velocity.x, body.velocity.y, false, false, delta);
    this.refreshDepth();
  }
}
