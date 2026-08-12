import Phaser from "phaser";
import { AssetManager } from "../systems/AssetManager";
import { SaveManager } from "../systems/SaveManager";
import { HEX } from "../config/GameConfig";

/** Carrega o spritesheet real, constrói texturas e segue para o menu. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    const { width, height } = this.scale;
    const bar = this.add.rectangle(width / 2, height / 2, 10, 14, 0xffc31f).setOrigin(0, 0.5);
    bar.x = width / 2 - 150;
    this.add
      .rectangle(width / 2, height / 2, 304, 20)
      .setStrokeStyle(2, 0xffffff, 0.35)
      .setFillStyle(0x000000, 0.25);
    this.add
      .text(width / 2, height / 2 - 46, "LOTADOR", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "54px",
        color: HEX.yellow,
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 40, "a carregar...", {
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: "16px",
        color: HEX.muted,
      })
      .setOrigin(0.5);

    this.load.on("progress", (p: number) => {
      bar.width = 300 * p;
    });

    AssetManager.preload(this);
  }

  create(): void {
    const save = SaveManager.load();
    AssetManager.buildAll(this, save.character);
    this.scene.start("Menu");
  }
}
