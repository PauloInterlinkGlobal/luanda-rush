import Phaser from "phaser";
import { HEX } from "../config/GameConfig";
import { SaveManager } from "../systems/SaveManager";
import { audio } from "../systems/AudioManager";

/** Painel de pausa por cima da partida: continuar, definições rápidas, sair. */
export class PauseScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private confirming = false;

  constructor() {
    super("Pause");
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e1a33, 0.88).setOrigin(0).setInteractive();
    this.layer = this.add.container(0, 0);
    this.confirming = false;
    this.render();
    this.input.keyboard?.on("keydown-ESC", () => this.resume());
  }

  private button(y: number, label: string, onClick: () => void, primary = false): void {
    const { width } = this.scale;
    const bg = this.add
      .rectangle(width / 2, y, primary ? 320 : 280, primary ? 58 : 46, primary ? 0xffc31f : 0x16305c, 0.96)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    const t = this.add
      .text(width / 2, y, label, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: primary ? "28px" : "20px",
        color: primary ? "#0e1a33" : HEX.white,
      })
      .setOrigin(0.5);
    bg.on("pointerover", () => bg.setScale(1.04));
    bg.on("pointerout", () => bg.setScale(1));
    bg.on("pointerdown", () => {
      audio.ui();
      onClick();
    });
    this.layer.add([bg, t]);
  }

  private title(y: number, value: string, size: number, color: string): void {
    this.layer.add(
      this.add
        .text(this.scale.width / 2, y, value, {
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: `${size}px`,
          color,
        })
        .setOrigin(0.5),
    );
  }

  private render(): void {
    this.layer.removeAll(true);
    const { height } = this.scale;
    const s = SaveManager.load().settings;

    if (this.confirming) {
      this.title(150, "SAIR DA PARTIDA?", 40, HEX.yellow);
      this.title(210, "Perdes o progresso desta corrida.", 18, HEX.muted);
      this.button(300, "SIM, SAIR", () => this.quit());
      this.button(364, "CONTINUAR A JOGAR", () => {
        this.confirming = false;
        this.render();
      });
      return;
    }

    this.title(120, "PAUSA", 56, HEX.yellow);
    this.button(210, "CONTINUAR", () => this.resume(), true);
    this.button(286, `MÚSICA: ${s.music ? "LIGADA" : "DESLIGADA"}`, () => {
      SaveManager.update({ settings: { ...s, music: !s.music } });
      audio.musicEnabled = !s.music;
      this.render();
    });
    this.button(344, `EFEITOS: ${s.sfx ? "LIGADOS" : "DESLIGADOS"}`, () => {
      SaveManager.update({ settings: { ...s, sfx: !s.sfx } });
      audio.sfxEnabled = !s.sfx;
      this.render();
    });
    this.button(402, "SAIR DA PARTIDA", () => {
      this.confirming = true;
      this.render();
    });
    this.title(height - 34, "ESC para continuar", 14, HEX.muted);
  }

  private resume(): void {
    const hud = this.scene.get("HUD");
    hud.events.emit("hud-pause");
  }

  private quit(): void {
    this.scene.stop("HUD");
    this.scene.stop("Game");
    this.scene.stop();
    this.scene.start("Menu");
  }
}
