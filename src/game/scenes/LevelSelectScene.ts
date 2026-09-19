import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import { LEVELS, RANK_TIERS, AREAS } from "../data/levels";
import { ProgressionManager } from "../systems/ProgressionManager";
import { SaveManager } from "../systems/SaveManager";
import { audio } from "../systems/AudioManager";
import { coverUniform, layoutOf, relayoutOnResize, type Layout } from "../systems/Responsive";

/**
 * Mapa de fases da paragem actual.
 * Fases concluídas ficam disponíveis para replay; a seguinte desbloqueia com ≥1★.
 */
export class LevelSelectScene extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;
  private backdrop!: Phaser.GameObjects.Container;
  private L!: Layout;
  private scroll = 0;

  constructor() {
    super("LevelSelect");
  }

  create(): void {
    this.backdrop = this.add.container(0, 0);
    this.layer = this.add.container(0, 0);
    this.scroll = 0;
    this.build(layoutOf(this));
    this.input.once("pointerdown", () => audio.unlock());
    this.input.on("wheel", (_p: unknown, _g: unknown, _dx: number, dy: number) => {
      this.applyScroll(this.scroll + dy * 0.45);
    });
    let dragY = 0;
    let dragging = false;
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      dragY = p.y;
      dragging = false;
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      const dy = dragY - p.y;
      if (Math.abs(dy) < 6 && !dragging) return;
      dragging = true;
      dragY = p.y;
      this.applyScroll(this.scroll + dy);
    });
    relayoutOnResize(this, (l) => this.build(l));
  }

  private maxScroll = 0;
  private listContent: Phaser.GameObjects.Container | null = null;

  private applyScroll(next: number): void {
    this.scroll = Phaser.Math.Clamp(next, 0, this.maxScroll);
    this.listContent?.setY(-this.scroll);
  }

  private build(l: Layout): void {
    this.L = l;
    this.backdrop.removeAll(true);
    this.layer.removeAll(true);

    this.backdrop.add(this.add.rectangle(0, 0, l.width, l.height, 0x0e1a33).setOrigin(0));
    if (this.textures.exists("ground")) {
      const bg = this.add.image(l.cx, l.cy, "ground").setAlpha(0.35);
      coverUniform(bg, l.width, l.height);
      this.backdrop.add(bg);
    }

    const save = SaveManager.load();
    const areaId = save.currentArea ?? "bairro";
    const area = AREAS.find((a) => a.id === areaId) ?? AREAS[0]!;
    const xp = ProgressionManager.xpProgress(save);

    // Cabeçalho
    this.layer.add(
      this.add
        .text(l.cx, l.top + l.s(18), area.name, {
          fontFamily: FONT.display,
          fontSize: l.font(26),
          color: HEX.yellow,
        })
        .setOrigin(0.5, 0),
    );
    this.layer.add(
      this.add
        .text(
          l.cx,
          l.top + l.s(48),
          `NÍVEL ${xp.level} · ${xp.title} · ${save.money} Kz · ★ ${ProgressionManager.totalStars(save)} · REP ${save.reputation ?? 0}`,
          {
            fontFamily: FONT.body,
            fontSize: l.font(12),
            color: HEX.gold,
          },
        )
        .setOrigin(0.5, 0),
    );

    // Barra de XP
    const barW = Math.min(l.s(280), l.innerWidth * 0.7);
    const barX = l.cx - barW / 2;
    const barY = l.top + l.s(70);
    const barBg = this.add.rectangle(barX, barY, barW, l.s(8), 0x000000, 0.45).setOrigin(0, 0.5);
    const barFill = this.add
      .rectangle(barX, barY, barW * xp.ratio, l.s(8), 0xffc31f)
      .setOrigin(0, 0.5);
    this.layer.add([barBg, barFill]);
    this.layer.add(
      this.add
        .text(l.cx, barY + l.s(14), `XP ${xp.current}/${xp.next}`, {
          fontFamily: FONT.body,
          fontSize: l.font(10),
          color: HEX.muted,
        })
        .setOrigin(0.5, 0),
    );

    // Lista de fases por rank
    const listTop = l.top + l.s(100);
    const listBottom = l.bottom - l.s(56);
    const listH = listBottom - listTop;
    const unlocked = ProgressionManager.unlockedPhase(save);

    // Mostra até 20 fases em grelha responsiva
    const cols = l.innerWidth > l.s(700) ? 5 : l.innerWidth > l.s(480) ? 4 : 3;
    const gap = l.s(10);
    const cardW = (l.innerWidth - gap * (cols + 1)) / cols;
    const cardH = Math.max(l.s(64), Math.min(l.s(88), listH / 5 - gap));

    let rankHeaderY = listTop;
    const content = this.add.container(0, -this.scroll);
    this.listContent = content;
    this.layer.add(content);

    for (const rank of RANK_TIERS) {
      const phases = LEVELS.filter((lv) => rank.phases.includes(lv.id));
      if (phases.length === 0) continue;

      content.add(
        this.add
          .text(l.left + gap, rankHeaderY, rank.label, {
            fontFamily: FONT.display,
            fontSize: l.font(13),
            color: HEX.gold,
          })
          .setOrigin(0, 0),
      );
      rankHeaderY += l.s(22);

      phases.forEach((lv, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = l.left + gap + col * (cardW + gap) + cardW / 2;
        const y = rankHeaderY + row * (cardH + gap) + cardH / 2;
        const isUnlocked = lv.id <= unlocked;
        const prog = ProgressionManager.phaseProgress(lv.id, save);
        const stars = prog.stars;

        const bg = this.add
          .rectangle(x, y, cardW, cardH, isUnlocked ? 0x16305c : 0x0a1224, 0.95)
          .setStrokeStyle(2, isUnlocked ? (prog.completed ? 0x36b45a : 0xffc31f) : 0x2a3550);
        content.add(bg);

        const titleColor = isUnlocked ? HEX.white : HEX.muted;
        content.add(
          this.add
            .text(x, y - cardH * 0.28, `FASE ${lv.id}`, {
              fontFamily: FONT.display,
              fontSize: l.font(11),
              color: titleColor,
            })
            .setOrigin(0.5),
        );
        content.add(
          this.add
            .text(x, y - cardH * 0.02, isUnlocked ? lv.name : "🔒", {
              fontFamily: FONT.body,
              fontSize: l.font(10),
              color: isUnlocked ? HEX.yellow : HEX.muted,
              align: "center",
              wordWrap: { width: cardW - l.s(8) },
            })
            .setOrigin(0.5),
        );

        // Estrelas
        const starStr = isUnlocked
          ? "★".repeat(stars) + "☆".repeat(Math.max(0, 3 - stars))
          : "···";
        content.add(
          this.add
            .text(x, y + cardH * 0.3, starStr, {
              fontFamily: FONT.display,
              fontSize: l.font(12),
              color: stars > 0 ? HEX.gold : HEX.muted,
            })
            .setOrigin(0.5),
        );

        if (isUnlocked) {
          bg.setInteractive({ useHandCursor: true });
          bg.on("pointerover", () => bg.setScale(1.04));
          bg.on("pointerout", () => bg.setScale(1));
          bg.on("pointerdown", () => {
            audio.unlock();
            audio.ui();
            this.startPhase(lv.id);
          });
        }
      });

      const rows = Math.ceil(phases.length / cols);
      rankHeaderY += rows * (cardH + gap) + l.s(12);
    }

    this.maxScroll = Math.max(0, rankHeaderY - listBottom + l.s(20));

    // Rodapé
    const footerY = l.bottom - l.s(28);
    this.button(footerY, "VOLTAR", () => this.scene.start("Menu"), false, l.cx - l.s(110));
    this.button(
      footerY,
      "UPGRADES",
      () => {
        this.registry.set("openPanel", "GESTAO");
        this.scene.start("Menu");
      },
      true,
      l.cx + l.s(110),
    );
  }

  private startPhase(phaseId: number): void {
    this.registry.set("phase", phaseId);
    this.registry.set("tutorial", phaseId === 1);
    this.scene.start("Game");
  }

  private button(
    y: number,
    label: string,
    onClick: () => void,
    primary = false,
    x?: number,
  ): void {
    const l = this.L;
    const w = Math.min(primary ? l.s(260) : l.s(160), l.innerWidth * 0.4);
    const h = Math.max(32, l.s(40));
    const cx = x ?? l.cx + (primary ? l.s(80) : 0);
    const bg = this.add
      .rectangle(cx, y, w, h, primary ? 0xffc31f : 0x16305c, 0.96)
      .setStrokeStyle(2, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(cx, y, label, {
        fontFamily: FONT.display,
        fontSize: l.font(14),
        color: primary ? "#0e1a33" : HEX.white,
      })
      .setOrigin(0.5);
    bg.on("pointerdown", () => {
      audio.ui();
      onClick();
    });
    this.layer.add([bg, text]);
  }
}
