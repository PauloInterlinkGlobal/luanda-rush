import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import { SaveManager } from "../systems/SaveManager";
import { audio } from "../systems/AudioManager";
import { layoutOf, relayoutOnResize, type Layout } from "../systems/Responsive";

/** Painel de pausa por cima da partida: continuar, definições rápidas, sair.
 *  Layout proporcional ao espaço disponível — nunca corta nem sobrepõe. */
export class PauseScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private shade!: Phaser.GameObjects.Rectangle;
  private confirming = false;
  private L!: Layout;

  constructor() {
    super("Pause");
  }

  create(): void {
    const l = (this.L = layoutOf(this));
    this.shade = this.add
      .rectangle(0, 0, l.width, l.height, 0x0e1a33, 0.88)
      .setOrigin(0)
      .setInteractive();
    this.layer = this.add.container(0, 0);
    this.confirming = false;
    this.render();
    this.input.keyboard?.on("keydown-ESC", () => this.resume());
    relayoutOnResize(this, (next) => {
      this.L = next;
      this.shade.setSize(next.width, next.height);
      this.render();
    });
  }

  private button(y: number, label: string, onClick: () => void, primary = false): void {
    const l = this.L;
    const w = Math.min(primary ? l.s(320) : l.s(280), l.innerWidth * 0.9);
    const h = Math.max(38, primary ? l.s(54) : l.s(44));
    const bg = this.add
      .rectangle(l.cx, y, w, h, primary ? 0xffc31f : 0x16305c, 0.96)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    const t = this.add
      .text(l.cx, y, label, {
        fontFamily: FONT.display,
        fontSize: l.font(primary ? 26 : 19),
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
        .text(this.L.cx, y, value, { fontFamily: FONT.display, fontSize: this.L.font(size), color })
        .setOrigin(0.5),
    );
  }

  private render(): void {
    this.layer.removeAll(true);
    const l = this.L;
    const s = SaveManager.load().settings;

    if (this.confirming) {
      this.title(l.y(0.1), "SAIR DA PARTIDA?", 36, HEX.yellow);
      this.title(l.y(0.26), "Perdes o progresso desta corrida.", 16, HEX.muted);
      this.button(l.y(0.52), "SIM, SAIR", () => this.quit());
      this.button(l.y(0.74), "CONTINUAR A JOGAR", () => {
        this.confirming = false;
        this.render();
      });
      return;
    }

    this.title(l.y(0.08), "PAUSA", 48, HEX.yellow);
    this.button(l.y(0.3), "CONTINUAR", () => this.resume(), true);
    this.button(l.y(0.48), `MÚSICA: ${s.music ? "LIGADA" : "DESLIGADA"}`, () => {
      SaveManager.update({ settings: { ...s, music: !s.music } });
      audio.musicEnabled = !s.music;
      this.render();
    });
    this.button(l.y(0.64), `EFEITOS: ${s.sfx ? "LIGADOS" : "DESLIGADOS"}`, () => {
      SaveManager.update({ settings: { ...s, sfx: !s.sfx } });
      audio.sfxEnabled = !s.sfx;
      this.render();
    });
    this.button(l.y(0.8), "SAIR DA PARTIDA", () => {
      this.confirming = true;
      this.render();
    });
    this.title(l.bottom - l.s(6), "ESC para continuar", 13, HEX.muted);
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
