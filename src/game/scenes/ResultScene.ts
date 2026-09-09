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
    const promoted = this.stats.promoted;
    if (promoted) {
      SaveManager.update({
        level: save.level + 1,
        xp: save.xp + this.stats.xp + 100,
        money: save.money + 750,
      });
    }
    this.add.rectangle(0, 0, width, height, 0x0e1a33).setOrigin(0);

    this.add
      .text(width / 2, 70, promoted ? "PROMOÇÃO DESBLOQUEADA" : "FIM DO TURNO", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "54px",
        color: HEX.yellow,
      })
      .setOrigin(0.5);

    if (promoted) {
      this.add.text(width / 2, 118, "TODOS OS OBJETIVOS CONCLUÍDOS", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "24px",
        color: HEX.gold,
      }).setOrigin(0.5);
      this.createConfetti();
      this.tweens.add({ targets: this.children.list, alpha: { from: 0.78, to: 1 }, duration: 500, yoyo: true, repeat: 2 });
    }

    const lines = [
      `Objetivos: ${this.stats.objectivesCompleted}/${this.stats.objectivesTotal}`,
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

  private createConfetti(): void {
    const { width } = this.scale;
    for (let i = 0; i < 28; i += 1) {
      const piece = this.add.rectangle(width / 2, 120, 6, 10, [0xffc31f, 0xe23b3b, 0x36b45a, 0x2b5fae][i % 4]);
      this.tweens.add({
        targets: piece,
        x: Phaser.Math.Between(40, width - 40),
        y: Phaser.Math.Between(120, 430),
        angle: Phaser.Math.Between(-180, 180),
        duration: Phaser.Math.Between(700, 1250),
        ease: "Quad.easeOut",
        onComplete: () => piece.destroy(),
      });
    }
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
