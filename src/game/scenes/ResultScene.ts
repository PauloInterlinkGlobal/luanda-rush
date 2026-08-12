import Phaser from "phaser";
import { HEX } from "../config/GameConfig";
import { SaveManager, levelTitle } from "../systems/SaveManager";
import type { MatchStats } from "../types";

/** Ecrã de resultado do turno. */
export class ResultScene extends Phaser.Scene {
  private stats!: MatchStats;

  constructor() {
    super("Result");
  }

  init(data: { stats: MatchStats }): void {
    this.stats = data.stats;
  }

  create(): void {
    const { width, height } = this.scale;
    const save = SaveManager.load();
    this.add.rectangle(0, 0, width, height, 0x0e1a33).setOrigin(0);

    this.add
      .text(width / 2, 70, "FIM DO TURNO", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "54px",
        color: HEX.yellow,
      })
      .setOrigin(0.5);

    const lines = [
      `Kz ganho: ${this.stats.money}`,
      `Táxis lotados: ${this.stats.taxisFilled}`,
      `Passageiros: ${this.stats.passengers}`,
      `Melhor combo: x${this.stats.bestCombo}`,
      `Perdidos: ${this.stats.lostPassengers}`,
      `XP: +${this.stats.xp}`,
      `Nível ${save.level} · ${levelTitle(save.level)} · Recorde ${save.bestScore} Kz`,
    ];
    lines.forEach((l, i) => {
      this.add
        .text(width / 2, 160 + i * 34, l, {
          fontFamily: "'Trebuchet MS', sans-serif",
          fontSize: "20px",
          color: i === 0 ? HEX.gold : HEX.white,
        })
        .setOrigin(0.5);
    });

    this.btn(height - 120, "JOGAR OUTRA VEZ", () => this.scene.start("Game"));
    this.btn(height - 60, "MENU", () => this.scene.start("Menu"));
  }

  private btn(y: number, label: string, onClick: () => void): void {
    const { width } = this.scale;
    const bg = this.add
      .rectangle(width / 2, y, 300, 46, 0xffc31f)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width / 2, y, label, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "22px",
        color: "#0e1a33",
      })
      .setOrigin(0.5);
    bg.on("pointerdown", onClick);
  }
}
