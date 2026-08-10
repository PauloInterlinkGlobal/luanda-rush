import Phaser from "phaser";
import { Direction } from "../types";
import { FRAME_H, FRAME_W } from "../systems/ProceduralArt";

export type AnimState = "idle" | "walk" | "run" | "interact" | "celebrate" | "tired";

/**
 * Base de todos os personagens (jogador, NPCs, passageiros).
 * Trata de física, direcção e escolha de animação a partir do estado.
 */
export class Character extends Phaser.Physics.Arcade.Sprite {
  protected facing: Direction = Direction.DOWN;
  protected animState: AnimState = "idle";
  protected sheetKey: string;
  /** Bloqueia a troca automática de animação (ex.: durante celebrar). */
  protected animLock = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, sheetKey: string) {
    super(scene, x, y, sheetKey, 0);
    this.sheetKey = sheetKey;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 16);
    body.setOffset((FRAME_W - 20) / 2, FRAME_H - 20);
    body.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.5);
    this.play(`${sheetKey}-idle-down`, true);
  }

  get direction(): Direction {
    return this.facing;
  }

  /** Actualiza direcção/animação a partir da velocidade actual. */
  updateAnimation(vx: number, vy: number, running: boolean, tired: boolean, delta: number): void {
    if (this.animLock > 0) {
      this.animLock -= delta;
      return;
    }
    const moving = Math.abs(vx) > 5 || Math.abs(vy) > 5;
    if (moving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? Direction.RIGHT : Direction.LEFT;
      } else {
        this.facing = vy > 0 ? Direction.DOWN : Direction.UP;
      }
    }
    const next: AnimState = !moving ? (tired ? "tired" : "idle") : running ? "run" : "walk";
    this.setAnim(next);
  }

  setAnim(state: AnimState): void {
    const key = `${this.sheetKey}-${state}-${this.facing}`;
    if (this.animState === state && this.anims.currentAnim?.key === key) return;
    this.animState = state;
    if (this.scene.anims.exists(key)) this.play(key, true);
  }

  /** Toca uma animação pontual e bloqueia trocas durante `ms`. */
  playOnce(state: AnimState, ms: number): void {
    this.animLock = 0;
    this.setAnim(state);
    this.animLock = ms;
  }

  /** Ordena profundidade por Y para dar sensação de 2.5D. */
  refreshDepth(): void {
    this.setDepth(this.y);
  }
}
