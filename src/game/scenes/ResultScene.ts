import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import { SaveManager, levelTitle } from "../systems/SaveManager";
import { layoutOf, relayoutOnResize, type Layout } from "../systems/Responsive";
import type { MatchStats } from "../types";

/** Ecrã de resultado do turno — distribuído pelo espaço real do ecrã. */
export class ResultScene extends Phaser.Scene {
  private stats!: MatchStats;
  private won: boolean | null = null;
  private tutorial = false;
  private L!: Layout;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super("Result");
  }

  init(data: { stats: MatchStats; won?: boolean | null; tutorial?: boolean }): void {
    this.stats = data.stats;
    this.won = data.won ?? null;
    this.tutorial = data.tutorial === true;
  }

  create(): void {
    const save = SaveManager.load();
    if (this.stats.promoted) {
      SaveManager.update({
        level: save.level + 1,
        xp: save.xp + this.stats.xp + 100,
        money: save.money + 750,
      });
    }
    this.layer = this.add.container(0, 0);
    this.render(layoutOf(this), true);
    relayoutOnResize(this, (l) => this.render(l, false));
  }

  private render(l: Layout, animate: boolean): void {
    this.L = l;
    this.layer.removeAll(true);
    const save = SaveManager.load();
    const promoted = this.stats.promoted;

    this.layer.add(this.add.rectangle(0, 0, l.width, l.height, 0x0e1a33).setOrigin(0));

    const title = this.tutorial
      ? this.won
        ? "TUTORIAL CONCLUÍDO!"
        : "TEMPO ESGOTADO"
      : promoted
        ? "PROMOÇÃO DESBLOQUEADA"
        : "FIM DO TURNO";
    this.layer.add(
      this.add
        .text(l.cx, l.top + l.s(24), title, {
          fontFamily: FONT.display,
          fontSize: l.font(this.tutorial ? 42 : 48),
          color: HEX.yellow,
          align: "center",
          wordWrap: { width: l.innerWidth },
        })
        .setOrigin(0.5, 0),
    );

    let headerBottom = l.top + l.s(72);
    if (this.tutorial) {
      this.layer.add(
        this.add
          .text(
            l.cx,
            headerBottom,
            this.won
              ? "Já sabes o básico para trabalhar como lotador."
              : "Não completaste todos os objetivos.",
            {
              fontFamily: FONT.body,
              fontSize: l.font(16),
              color: this.won ? HEX.gold : HEX.red,
              align: "center",
              wordWrap: { width: l.innerWidth },
            },
          )
          .setOrigin(0.5, 0),
      );
      headerBottom += l.s(26);
    } else if (promoted) {
      this.layer.add(
        this.add
          .text(l.cx, headerBottom, "TODOS OS OBJETIVOS CONCLUÍDOS", {
            fontFamily: FONT.display,
            fontSize: l.font(22),
            color: HEX.gold,
          })
          .setOrigin(0.5, 0),
      );
      headerBottom += l.s(30);
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

    // Os botões ficam sempre no fundo; as linhas usam apenas o espaço restante.
    const btnH = Math.max(38, l.s(44));
    const buttonsTop = l.bottom - btnH * 2 - l.s(14);
    const listTop = headerBottom + l.s(6);
    const listSpace = Math.max(l.s(40), buttonsTop - listTop - l.s(10));
    const step = listSpace / lines.length;
    // Duas colunas quando o espaço vertical é curto (telemóvel em paisagem).
    const twoCols = step < l.s(20) && l.innerWidth > l.s(560);
    lines.forEach((text, i) => {
      const col = twoCols ? i % 2 : 0;
      const row = twoCols ? Math.floor(i / 2) : i;
      const rowStep = twoCols ? listSpace / Math.ceil(lines.length / 2) : step;
      const x = twoCols ? l.cx + (col === 0 ? -l.innerWidth * 0.22 : l.innerWidth * 0.22) : l.cx;
      this.layer.add(
        this.add
          .text(x, listTop + rowStep * (row + 0.5), text, {
            fontFamily: FONT.body,
            fontSize: l.font(Math.min(19, Math.max(11, (rowStep / l.uiScale) * 0.55))),
            color: i === 0 ? HEX.gold : HEX.white,
          })
          .setOrigin(0.5),
      );
    });

    if (animate && (promoted || (this.tutorial && this.won))) {
      this.createConfetti(l);
      const fadeTargets = [...this.layer.list];
      this.tweens.add({
        targets: fadeTargets,
        alpha: { from: 0.78, to: 1 },
        duration: 500,
        yoyo: true,
        repeat: 2,
      });
    }

    this.btn(
      buttonsTop + btnH / 2,
      this.tutorial && !this.won ? "TENTAR NOVAMENTE" : "JOGAR OUTRA VEZ",
      () => this.scene.start("Game"),
    );
    this.btn(
      buttonsTop + btnH * 1.5 + l.s(10),
      this.tutorial ? (this.won ? "CONTINUAR" : "VOLTAR") : "MENU",
      () => this.scene.start("Menu"),
    );
  }

  private createConfetti(l: Layout): void {
    for (let i = 0; i < 28; i += 1) {
      const piece = this.add.rectangle(
        l.cx,
        l.y(0.2),
        l.s(6),
        l.s(10),
        [0xffc31f, 0xe23b3b, 0x36b45a, 0x2b5fae][i % 4],
      );
      this.tweens.add({
        targets: piece,
        x: Phaser.Math.Between(Math.round(l.left), Math.round(l.right)),
        y: Phaser.Math.Between(Math.round(l.y(0.2)), Math.round(l.y(0.85))),
        angle: Phaser.Math.Between(-180, 180),
        duration: Phaser.Math.Between(700, 1250),
        ease: "Quad.easeOut",
        onComplete: () => piece.destroy(),
      });
    }
  }

  private btn(y: number, label: string, onClick: () => void): void {
    const l = this.L;
    const w = Math.min(l.s(300), l.innerWidth * 0.9);
    const h = Math.max(38, l.s(44));
    const bg = this.add
      .rectangle(l.cx, y, w, h, 0xffc31f)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    const t = this.add
      .text(l.cx, y, label, { fontFamily: FONT.display, fontSize: l.font(20), color: "#0e1a33" })
      .setOrigin(0.5);
    bg.on("pointerdown", onClick);
    this.layer.add([bg, t]);
  }
}
