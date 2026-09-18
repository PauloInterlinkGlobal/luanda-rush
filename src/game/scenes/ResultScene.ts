import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import { SaveManager } from "../systems/SaveManager";
import { ProgressionManager } from "../systems/ProgressionManager";
import { layoutOf, relayoutOnResize, type Layout } from "../systems/Responsive";
import type { LevelResult, MatchStats } from "../types";
import { audio } from "../systems/AudioManager";

/** Ecrã de resultado do turno / fase — distribuído pelo espaço real do ecrã. */
export class ResultScene extends Phaser.Scene {
  private stats!: MatchStats;
  private won: boolean | null = null;
  private tutorial = false;
  private levelResult: LevelResult | null = null;
  private L!: Layout;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super("Result");
  }

  init(data: {
    stats: MatchStats;
    won?: boolean | null;
    tutorial?: boolean;
    levelResult?: LevelResult | null;
  }): void {
    this.stats = data.stats;
    this.won = data.won ?? null;
    this.tutorial = data.tutorial === true;
    this.levelResult = data.levelResult ?? null;
  }

  create(): void {
    // Progressão já foi aplicada pelo LevelManager.commit no endMatch.
    // Aqui só tratamos o caso legado (modo livre) se ainda não creditou XP de nível.
    if (!this.levelResult && this.stats.promoted) {
      const save = SaveManager.load();
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
    const lr = this.levelResult;
    const won = lr ? lr.won : this.won === true;
    const stars = lr?.stars ?? (won ? 1 : 0);

    this.layer.add(this.add.rectangle(0, 0, l.width, l.height, 0x0e1a33).setOrigin(0));

    // Título
    let title: string;
    if (lr?.finaleTitle && won) title = lr.finaleTitle;
    else if (lr) title = won ? `FASE ${lr.phaseId} CONCLUÍDA!` : `FASE ${lr.phaseId} FALHADA`;
    else if (this.tutorial) title = won ? "TUTORIAL CONCLUÍDO!" : "TEMPO ESGOTADO";
    else if (this.stats.promoted) title = "PROMOÇÃO DESBLOQUEADA";
    else title = "FIM DO TURNO";

    this.layer.add(
      this.add
        .text(l.cx, l.top + l.s(16), title, {
          fontFamily: FONT.display,
          fontSize: l.font(lr?.finaleTitle ? 36 : 40),
          color: HEX.yellow,
          align: "center",
          wordWrap: { width: l.innerWidth - l.s(20) },
        })
        .setOrigin(0.5, 0),
    );

    let y = l.top + l.s(58);

    // Estrelas
    if (lr) {
      const starStr = "★".repeat(stars) + "☆".repeat(Math.max(0, 3 - stars));
      this.layer.add(
        this.add
          .text(l.cx, y, starStr, {
            fontFamily: FONT.display,
            fontSize: l.font(36),
            color: stars > 0 ? HEX.gold : HEX.muted,
          })
          .setOrigin(0.5, 0),
      );
      y += l.s(40);

      if (lr.newRecord) {
        this.layer.add(
          this.add
            .text(l.cx, y, "NOVO RECORDE!", {
              fontFamily: FONT.display,
              fontSize: l.font(18),
              color: HEX.green,
            })
            .setOrigin(0.5, 0),
        );
        y += l.s(24);
      }

      if (lr.rankLabel) {
        this.layer.add(
          this.add
            .text(l.cx, y, lr.rankLabel, {
              fontFamily: FONT.body,
              fontSize: l.font(13),
              color: HEX.muted,
            })
            .setOrigin(0.5, 0),
        );
        y += l.s(20);
      }
    } else if (this.tutorial) {
      this.layer.add(
        this.add
          .text(
            l.cx,
            y,
            won
              ? "Já sabes o básico para trabalhar como lotador."
              : "Não completaste todos os objetivos.",
            {
              fontFamily: FONT.body,
              fontSize: l.font(14),
              color: won ? HEX.gold : HEX.red,
              align: "center",
              wordWrap: { width: l.innerWidth },
            },
          )
          .setOrigin(0.5, 0),
      );
      y += l.s(28);
    }

    // Linhas de detalhe
    const lines: { label: string; value: string; color?: string }[] = [];

    if (lr) {
      for (const obj of lr.objectives) {
        const mark = obj.done ? "✓" : "✗";
        lines.push({
          label: obj.label,
          value: `${mark} ${Math.min(obj.current, obj.goal)}/${obj.goal}`,
          color: obj.done ? HEX.green : HEX.muted,
        });
      }
      lines.push({
        label: "TEMPO",
        value: `${Math.floor(lr.timeSpent / 60)}:${String(Math.floor(lr.timeSpent % 60)).padStart(2, "0")} / ${Math.floor(lr.timeLimit / 60)}:${String(lr.timeLimit % 60).padStart(2, "0")}`,
      });
      lines.push({ label: "Kz NA PARTIDA", value: `${this.stats.money} Kz` });
      lines.push({
        label: "RECOMPENSA FASE",
        value: `+${lr.rewardMoney} Kz`,
        color: HEX.gold,
      });
      lines.push({
        label: "XP",
        value: `+${lr.rewardXp + this.stats.xp} XP`,
        color: HEX.gold,
      });
      if (lr.unlockedArea) {
        lines.push({
          label: "NOVA ÁREA",
          value: lr.unlockedArea.toUpperCase(),
          color: HEX.green,
        });
      }
    } else {
      lines.push({
        label: "Objetivos",
        value: `${this.stats.objectivesCompleted}/${this.stats.objectivesTotal}`,
      });
      lines.push({ label: "Kz ganho", value: `${this.stats.money}` });
      lines.push({ label: "Táxis lotados", value: `${this.stats.taxisFilled}` });
      lines.push({ label: "Passageiros", value: `${this.stats.passengers}` });
      lines.push({ label: "Melhor combo", value: `x${this.stats.bestCombo}` });
      lines.push({ label: "XP", value: `+${this.stats.xp}` });
    }

    const xp = ProgressionManager.xpProgress(save);
    lines.push({
      label: "PROGRESSO",
      value: `Nv.${xp.level} ${xp.title} · ${save.money} Kz · Recorde ${save.bestScore}`,
    });

    const btnH = Math.max(36, l.s(42));
    const buttonsTop = l.bottom - btnH * 2.4 - l.s(8);
    const listTop = y + l.s(4);
    const listSpace = Math.max(l.s(40), buttonsTop - listTop - l.s(6));
    const step = listSpace / Math.max(1, lines.length);
    const twoCols = step < l.s(18) && l.innerWidth > l.s(560);

    lines.forEach((line, i) => {
      const col = twoCols ? i % 2 : 0;
      const row = twoCols ? Math.floor(i / 2) : i;
      const rowStep = twoCols ? listSpace / Math.ceil(lines.length / 2) : step;
      const x = twoCols
        ? l.cx + (col === 0 ? -l.innerWidth * 0.22 : l.innerWidth * 0.22)
        : l.cx;
      const fontSize = Math.min(16, Math.max(10, (rowStep / l.uiScale) * 0.5));
      this.layer.add(
        this.add
          .text(x, listTop + rowStep * (row + 0.5), `${line.label}: ${line.value}`, {
            fontFamily: FONT.body,
            fontSize: l.font(fontSize),
            color: line.color ?? (i === 0 ? HEX.gold : HEX.white),
          })
          .setOrigin(0.5),
      );
    });

    if (animate && (won || (this.tutorial && this.won))) {
      this.createConfetti(l);
    }

    // Botões
    const phaseId = lr?.phaseId ?? Number(this.registry.get("lastPhase") ?? 0);
    const nextPhase = phaseId > 0 ? phaseId + 1 : 0;
    const canContinue = won && nextPhase > 0 && ProgressionManager.isPhaseUnlocked(nextPhase);

    this.btn(
      buttonsTop + btnH / 2,
      !won ? "REPETIR" : canContinue ? "CONTINUAR" : "MAPA DE FASES",
      () => {
        audio.ui();
        if (!won && phaseId > 0) {
          this.registry.set("phase", phaseId);
          this.registry.set("tutorial", phaseId === 1);
          this.scene.start("Game");
        } else if (canContinue) {
          this.registry.set("phase", nextPhase);
          this.registry.set("tutorial", nextPhase === 1);
          this.scene.start("Game");
        } else {
          this.scene.start("LevelSelect");
        }
      },
    );
    this.btn(buttonsTop + btnH * 1.55 + l.s(6), won ? "REPETIR FASE" : "MAPA DE FASES", () => {
      audio.ui();
      if (won && phaseId > 0) {
        this.registry.set("phase", phaseId);
        this.registry.set("tutorial", phaseId === 1);
        this.scene.start("Game");
      } else {
        this.scene.start(phaseId > 0 ? "LevelSelect" : "Menu");
      }
    }, false);
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

  private btn(y: number, label: string, onClick: () => void, primary = true): void {
    const l = this.L;
    const w = Math.min(l.s(300), l.innerWidth * 0.9);
    const h = Math.max(36, l.s(42));
    const bg = this.add
      .rectangle(l.cx, y, w, h, primary ? 0xffc31f : 0x16305c)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    const t = this.add
      .text(l.cx, y, label, {
        fontFamily: FONT.display,
        fontSize: l.font(18),
        color: primary ? "#0e1a33" : HEX.white,
      })
      .setOrigin(0.5);
    bg.on("pointerdown", onClick);
    this.layer.add([bg, t]);
  }
}
