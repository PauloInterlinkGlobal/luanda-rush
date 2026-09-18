import Phaser from "phaser";
import { AssetManager } from "../systems/AssetManager";
import { SaveManager } from "../systems/SaveManager";
import { HEX } from "../config/GameConfig";
import { layoutOf, onResize, type Layout } from "../systems/Responsive";

/** Carrega o spritesheet real, constrói texturas e segue para o menu. */
export class BootScene extends Phaser.Scene {
  private bar!: Phaser.GameObjects.Rectangle;
  private track!: Phaser.GameObjects.Rectangle;
  private title!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private backdrop!: Phaser.GameObjects.Rectangle;
  private progress = 0;

  constructor() {
    super("Boot");
  }

  preload(): void {
    const l = layoutOf(this);

    this.backdrop = this.add.rectangle(0, 0, l.width, l.height, 0x0e1a33).setOrigin(0);
    this.track = this.add
      .rectangle(l.cx, l.cy, l.s(304), l.s(20))
      .setStrokeStyle(2, 0xffffff, 0.35)
      .setFillStyle(0x000000, 0.25);
    this.bar = this.add.rectangle(0, l.cy, 1, l.s(14), 0xffc31f).setOrigin(0, 0.5);
    this.title = this.add
      .text(l.cx, l.cy, "LOTADOR", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: l.font(54),
        color: HEX.yellow,
      })
      .setOrigin(0.5);
    this.hint = this.add
      .text(l.cx, l.cy, "a carregar...", {
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: l.font(16),
        color: HEX.muted,
      })
      .setOrigin(0.5);

    this.applyLayout(l);
    onResize(this, () => this.applyLayout(layoutOf(this)));

    this.load.on("progress", (p: number) => {
      this.progress = p;
      this.applyLayout(layoutOf(this));
    });

    AssetManager.preload(this);
  }

  /** Reposiciona/redimensiona o ecrã de carregamento a partir do espaço real. */
  private applyLayout(l: Layout): void {
    if (!this.backdrop?.active) return;
    const barW = Math.min(l.s(300), l.innerWidth * 0.8);
    this.backdrop.setSize(l.width, l.height).setPosition(0, 0);
    this.track.setPosition(l.cx, l.cy).setSize(barW + l.s(4), l.s(20));
    this.bar.setPosition(l.cx - barW / 2, l.cy).setSize(Math.max(1, barW * this.progress), l.s(14));
    this.title.setPosition(l.cx, l.cy - l.s(46)).setFontSize(l.font(54));
    this.hint.setPosition(l.cx, l.cy + l.s(40)).setFontSize(l.font(16));
  }

  create(): void {
    const save = SaveManager.load();
    AssetManager.buildAll(this, save.character);
    this.scene.start("Menu");
  }
}
