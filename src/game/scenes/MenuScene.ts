import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import { SaveManager } from "../systems/SaveManager";
import { ProgressionManager } from "../systems/ProgressionManager";
import { audio } from "../systems/AudioManager";
import { MISSIONS, UPGRADES } from "../data/missions";
import { coverUniform, layoutOf, relayoutOnResize, type Layout } from "../systems/Responsive";

type Panel = "MENU" | "MISSOES" | "GESTAO" | "DEFINICOES" | "SAIDA";

/** Menu principal: jogar, missões, personagem e definições.
 *  Todo o layout é derivado do espaço disponível — nada assume 960×540. */
export class MenuScene extends Phaser.Scene {
  private panel: Panel = "MENU";
  private layer!: Phaser.GameObjects.Container;
  private backdrop!: Phaser.GameObjects.Container;
  private L!: Layout;
  private quitting = false;

  constructor() {
    super("Menu");
  }

  create(): void {
    this.quitting = false;
    // Painel pedido por outra cena (ex.: LevelSelect → GESTÃO)
    const open = this.registry.get("openPanel") as Panel | undefined;
    if (open) {
      this.panel = open;
      this.registry.set("openPanel", null);
    } else {
      this.panel = "MENU";
    }
    this.backdrop = this.add.container(0, 0);
    this.layer = this.add.container(0, 0);
    this.build(layoutOf(this));
    this.input.once("pointerdown", () => audio.unlock());
    // Resize/rotação: redesenha tudo a partir do novo espaço, sem recarregar.
    relayoutOnResize(this, (l) => this.build(l));
  }

  private build(l: Layout): void {
    this.L = l;
    this.backdrop.removeAll(true);
    if (this.quitting) {
      this.renderQuit();
      return;
    }

    this.backdrop.add(this.add.rectangle(0, 0, l.width, l.height, 0x0e1a33).setOrigin(0));

    // Fundo: cobre toda a área visível com escala UNIFORME (sem faixas nem deformação).
    if (this.textures.exists("ground")) {
      const bg = this.add.image(l.cx, l.cy, "ground").setAlpha(0.4);
      coverUniform(bg, l.width, l.height);
      this.backdrop.add(bg);
    }

    const title = this.add
      .text(l.cx, l.top + l.s(30), "LOTADOR", {
        fontFamily: FONT.display,
        fontSize: l.font(72),
        color: HEX.yellow,
      })
      .setOrigin(0.5)
      .setShadow(0, 5, "#000000", 8);
    const sub = this.add
      .text(l.cx, l.top + l.s(74), "CHAMA, LOTA, GANHA", {
        fontFamily: FONT.body,
        fontSize: l.font(17),
        color: HEX.white,
      })
      .setOrigin(0.5);
    this.backdrop.add([title, sub]);

    // Mascotes só aparecem quando há largura de sobra — e sempre sem deformar.
    if (l.innerWidth > l.s(760)) {
      if (this.textures.exists("player")) {
        const p = this.add
          .sprite(l.left + l.s(60), l.bottom - l.s(90), "player")
          .setScale(2.6 * l.uiScale)
          .play("player-idle-down");
        this.backdrop.add(p);
      }
      if (this.textures.exists("taxi_NORMAL")) {
        const t = this.add
          .sprite(l.right - l.s(70), l.bottom - l.s(100), "taxi_NORMAL", 0)
          .setScale(1.2 * l.uiScale);
        this.backdrop.add(t);
      }
    }

    this.render();
  }

  /**
   * Botão centrado, dimensionado de forma uniforme.
   * `maxH` limita a altura quando o espaço vertical é curto, garantindo que
   * a coluna inteira cabe no ecrã sem sobreposições.
   */
  private button(
    y: number,
    label: string,
    onClick: () => void,
    primary = false,
    x?: number,
    maxH?: number,
  ): number {
    const l = this.L;
    const w = Math.min(primary ? l.s(320) : l.s(280), l.innerWidth * 0.9);
    const h = Math.min(maxH ?? Number.POSITIVE_INFINITY, Math.max(28, primary ? l.s(56) : l.s(46)));
    const cx = x ?? l.cx;
    const bg = this.add
      .rectangle(cx, y, w, h, primary ? 0xffc31f : 0x16305c, 0.96)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(cx, y, label, {
        fontFamily: FONT.display,
        // A fonte acompanha a altura efectiva do botão — nunca transborda.
        fontSize: `${Math.max(11, Math.round(Math.min(primary ? 28 : 20, (h / l.uiScale) * 0.46) * l.uiScale))}px`,
        color: primary ? "#0e1a33" : HEX.white,
      })
      .setOrigin(0.5);
    bg.on("pointerover", () => bg.setScale(1.04));
    bg.on("pointerout", () => bg.setScale(1));
    bg.on("pointerdown", () => {
      audio.unlock();
      audio.ui();
      onClick();
    });
    this.layer.add([bg, text]);
    return h;
  }

  private label(
    x: number,
    y: number,
    text: string,
    size = 16,
    color: string = HEX.white,
    origin = 0.5,
  ): void {
    this.layer.add(
      this.add
        .text(x, y, text, { fontFamily: FONT.body, fontSize: this.L.font(size), color })
        .setOrigin(origin, 0.5),
    );
  }

  private render(): void {
    this.layer.removeAll(true);
    const l = this.L;
    const save = SaveManager.load();

    if (this.panel === "MENU") {
      this.renderMainMenu(l, save);
      return;
    }

    // Painéis: caixa ajustada ao espaço útil real.
    const panelW = Math.min(l.s(620), l.innerWidth);
    const panelH = Math.min(l.s(380), l.innerHeight * 0.78);
    const panelTop = l.top + l.s(60);
    const panelBg = this.add
      .rectangle(l.cx, panelTop + panelH / 2, panelW, panelH, 0x0e1a33, 0.94)
      .setStrokeStyle(3, 0xffc31f);
    this.layer.add(panelBg);
    const inner = (t: number) => panelTop + panelH * t;

    if (this.panel === "MISSOES") {
      this.label(l.cx, inner(0.08), "MISSÕES", 24, HEX.yellow);
      const rows = Math.max(1, MISSIONS.length);
      MISSIONS.forEach((m, i) => {
        const done = save.missions[m.id] === true;
        const y = inner(0.2) + (i * panelH * 0.7) / rows;
        const x = l.cx - panelW / 2 + l.s(24);
        this.label(x, y, `${done ? "✔" : "•"} ${m.label}`, 16, done ? HEX.green : HEX.white, 0);
        this.label(
          x,
          y + l.s(20),
          `${m.description} — ${m.rewardMoney} Kz / ${m.rewardXp} XP`,
          12,
          HEX.muted,
          0,
        );
      });
    }

    if (this.panel === "GESTAO") {
      this.label(l.cx, inner(0.06), "UPGRADES DO LOTADOR", 24, HEX.yellow);
      this.label(
        l.cx,
        inner(0.14),
        `CAIXA ${save.money} Kz · PARAGEM NÍVEL ${save.stationLevel} · FASE ${save.unlockedPhase ?? 1}`,
        13,
        HEX.muted,
      );
      const step = panelH * 0.14;
      UPGRADES.forEach((upgrade, i) => {
        const level = save.upgrades[upgrade.id] ?? 0;
        const cost = ProgressionManager.upgradeCost(upgrade.id, level);
        const y = inner(0.26) + i * step;
        this.label(
          l.cx - panelW / 2 + l.s(20),
          y,
          `${upgrade.label} ${level}/${upgrade.maxLevel}`,
          15,
          HEX.white,
          0,
        );
        this.label(
          l.cx - panelW / 2 + l.s(20),
          y + l.s(14),
          upgrade.description,
          10,
          HEX.muted,
          0,
        );
        this.button(
          y,
          level >= upgrade.maxLevel ? "MAX" : `${cost} Kz`,
          () => {
            if (ProgressionManager.buyUpgrade(upgrade.id)) this.render();
          },
          false,
          l.cx + panelW / 4,
        );
      });
      const baseY = inner(0.26) + UPGRADES.length * step;
      this.button(
        baseY,
        save.fleetLevel >= 3
          ? "FROTA MAX"
          : `FROTA ${save.fleetLevel + 1} · ${1200 * save.fleetLevel} Kz`,
        () => {
          const cost = 1200 * save.fleetLevel;
          if (save.fleetLevel >= 3 || save.money < cost) return;
          SaveManager.update({ money: save.money - cost, fleetLevel: save.fleetLevel + 1 });
          this.render();
        },
      );
      this.button(
        baseY + step,
        save.stationLevel >= 3
          ? "PARAGEM MAX"
          : `PARAGEM ${save.stationLevel + 1} · ${1800 * save.stationLevel} Kz`,
        () => {
          const cost = 1800 * save.stationLevel;
          if (save.stationLevel >= 3 || save.money < cost) return;
          SaveManager.update({ money: save.money - cost, stationLevel: save.stationLevel + 1 });
          this.render();
        },
      );
    }

    if (this.panel === "SAIDA") {
      this.label(l.cx, inner(0.12), "SAIR DO JOGO", 24, HEX.yellow);
      this.label(
        l.cx,
        inner(0.28),
        `Até à próxima, ${save.playerName || "lotador"}!`,
        17,
        HEX.white,
      );
      this.label(
        l.cx,
        inner(0.38),
        "O teu progresso fica guardado neste dispositivo.",
        12,
        HEX.muted,
      );
      this.button(inner(0.58), "SIM, SAIR", () => this.quitGame());
      this.button(inner(0.78), "AFINAL FICO", () => this.go("MENU"));
    }

    if (this.panel === "DEFINICOES") {
      this.label(l.cx, inner(0.08), "DEFINIÇÕES", 24, HEX.yellow);
      const s = save.settings;
      const toggle = (t: number, key: "music" | "sfx" | "vibration", name: string) => {
        this.button(inner(t), `${name}: ${s[key] ? "LIGADO" : "DESLIGADO"}`, () => {
          const cur = SaveManager.load().settings;
          const next = { ...cur, [key]: !cur[key] };
          SaveManager.update({ settings: next });
          if (key === "music") audio.musicEnabled = next.music;
          if (key === "sfx") audio.sfxEnabled = next.sfx;
          this.render();
        });
      };
      toggle(0.2, "music", "MÚSICA");
      toggle(0.36, "sfx", "EFEITOS");
      toggle(0.52, "vibration", "VIBRAÇÃO");
      // Idioma: PT only por agora — toggle EN escondido até haver i18n real.
      this.label(l.cx, inner(0.66), "IDIOMA: PORTUGUÊS", 14, HEX.muted);
      this.button(inner(0.82), "APAGAR PROGRESSO", () => {
        if (typeof window !== "undefined") {
          const ok = window.confirm(
            "Apagar todo o progresso neste dispositivo? Esta acção não se pode desfazer.",
          );
          if (!ok) return;
        }
        SaveManager.reset();
        this.render();
      });
    }

    this.button(l.bottom - l.s(24), "VOLTAR", () => this.go("MENU"));
  }

  /** Menu principal: coluna de botões distribuída pelo espaço real disponível. */
  private renderMainMenu(l: Layout, save: ReturnType<typeof SaveManager.load>): void {
    // Em ecrãs largos o guia "Como jogar" fica ao lado; em ecrãs baixos/estreitos
    // é compactado em baixo para nada ficar cortado.
    const sideGuide = l.innerWidth >= l.s(880) && l.innerHeight >= l.s(420);
    const compactGuide = !sideGuide;

    const xp = ProgressionManager.xpProgress(save);
    const unlocked = ProgressionManager.unlockedPhase(save);
    this.label(
      l.cx,
      l.top + l.s(104),
      `NÍVEL ${xp.level} · ${xp.title} · FASE ${unlocked} · ${save.money} Kz · ★ ${ProgressionManager.totalStars(save)}`,
      14,
      HEX.gold,
    );

    const entries: { label: string; action: () => void; primary?: boolean }[] = [
      {
        label: save.tutorialDone || unlocked > 1 ? "JOGAR · FASES" : "TUTORIAL · FASE 1",
        primary: true,
        action: () => {
          if (!save.tutorialDone && unlocked <= 1) {
            this.registry.set("phase", 1);
            this.registry.set("tutorial", true);
            this.scene.start("Game");
          } else {
            this.scene.start("LevelSelect");
          }
        },
      },
      {
        label: "CONTINUAR",
        action: () => {
          const phase = Math.min(unlocked, 20);
          this.registry.set("phase", phase);
          this.registry.set("tutorial", phase === 1 && !save.tutorialDone);
          this.scene.start("Game");
        },
      },
      { label: "UPGRADES", action: () => this.go("GESTAO") },
      { label: "MISSÕES", action: () => this.go("MISSOES") },
      { label: "PERSONAGEM", action: () => this.scene.start("Character") },
      { label: "DEFINIÇÕES", action: () => this.go("DEFINICOES") },
      { label: "SAIR DO JOGO", action: () => this.go("SAIDA") },
    ];

    const guideHeight = compactGuide ? l.s(70) : 0;
    const footerHeight = l.s(26);
    const listTop = l.top + l.s(126);
    const listBottom = l.bottom - footerHeight - guideHeight - l.s(10);
    const available = Math.max(l.s(120), listBottom - listTop);
    const step = available / entries.length;
    const columnX = sideGuide ? l.cx - l.s(80) : l.cx;

    // Altura máxima por botão = passo disponível menos a folga mínima.
    const maxButtonH = Math.max(24, step - l.s(6));
    entries.forEach((entry, i) => {
      this.button(
        listTop + step * (i + 0.5),
        entry.label,
        entry.action,
        entry.primary,
        columnX,
        maxButtonH,
      );
    });

    this.label(
      l.cx,
      l.bottom - l.s(8),
      "WASD mover · SHIFT correr · E interagir · ESPAÇO chamar · Q power-up",
      12,
      HEX.muted,
    );
    this.buildControlGuide(l, sideGuide);
  }

  private buildControlGuide(l: Layout, sideGuide: boolean): void {
    const compact = !sideGuide;
    const guideWidth = compact ? Math.min(l.innerWidth, l.s(620)) : l.s(290);
    const guideHeight = compact ? l.s(68) : Math.min(l.s(250), l.innerHeight * 0.5);
    const x = compact ? l.cx : l.right - guideWidth / 2;
    const y = compact ? l.bottom - l.s(26) - guideHeight / 2 : l.cy + l.s(10);

    const panel = this.add
      .rectangle(x, y, guideWidth, guideHeight, 0x16305c, 0.94)
      .setStrokeStyle(2, 0x2b5fae);
    this.layer.add(panel);

    const title = this.add
      .text(x, y - guideHeight / 2 + l.s(16), "COMO JOGAR", {
        fontFamily: FONT.display,
        fontSize: l.font(compact ? 15 : 19),
        color: HEX.yellow,
      })
      .setOrigin(0.5);
    this.layer.add(title);

    if (compact) {
      const steps = this.add
        .text(x, y + l.s(8), "1 MOVER → 2 APROXIMAR → 3 ESPAÇO PARA CHAMAR", {
          fontFamily: FONT.body,
          fontSize: l.font(11),
          color: HEX.white,
          align: "center",
          wordWrap: { width: guideWidth - l.s(70) },
        })
        .setOrigin(0.5);
      this.layer.add(steps);
      this.animateCallHint(x + guideWidth / 2 - l.s(26), y + l.s(4), l.s(18));
      return;
    }

    const steps = [
      ["1", "MOVER", "WASD ou joystick"],
      ["2", "APROXIMAR", "Chega perto do passageiro"],
      ["3", "CHAMAR", "Pressiona ESPAÇO"],
    ] as const;
    const rowStep = guideHeight * 0.2;
    steps.forEach(([number, label, copy], index) => {
      const rowY = y - guideHeight * 0.16 + index * rowStep;
      const markerX = x - guideWidth / 2 + l.s(24);
      const marker = this.add
        .circle(markerX, rowY, l.s(14), index === 2 ? 0xffc31f : 0x2b5fae)
        .setStrokeStyle(2, 0x0e1a33);
      const numberText = this.add
        .text(markerX, rowY, number, {
          fontFamily: FONT.display,
          fontSize: l.font(15),
          color: "#0e1a33",
        })
        .setOrigin(0.5);
      const labelText = this.add
        .text(markerX + l.s(24), rowY - l.s(8), label, {
          fontFamily: FONT.display,
          fontSize: l.font(14),
          color: index === 2 ? HEX.yellow : HEX.white,
        })
        .setOrigin(0, 0.5);
      const copyText = this.add
        .text(markerX + l.s(24), rowY + l.s(9), copy, {
          fontFamily: FONT.body,
          fontSize: l.font(10),
          color: HEX.muted,
          wordWrap: { width: guideWidth - l.s(56) },
        })
        .setOrigin(0, 0.5);
      this.layer.add([marker, numberText, labelText, copyText]);
    });
    this.animateCallHint(x + guideWidth * 0.3, y + guideHeight * 0.33, l.s(20));
  }

  private animateCallHint(x: number, y: number, radius: number): void {
    const l = this.L;
    const button = this.add.circle(x, y, radius, 0xffc31f, 0.95).setStrokeStyle(3, 0x0e1a33);
    const text = this.add
      .text(x, y, "ESPAÇO", { fontFamily: FONT.display, fontSize: l.font(9), color: "#0e1a33" })
      .setOrigin(0.5);
    const ring = this.add.circle(x, y, radius * 1.3, 0xffc31f, 0).setStrokeStyle(2, 0xffc31f, 0.8);
    this.layer.add([ring, button, text]);
    this.tweens.add({
      targets: [button, text],
      scale: 1.1,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: ring,
      scale: 1.55,
      alpha: 0,
      duration: 1000,
      repeat: -1,
      ease: "Quad.easeOut",
    });
  }

  /** Fecha a sessão: pára tudo e mostra o ecrã de despedida. */
  private quitGame(): void {
    this.quitting = true;
    this.build(layoutOf(this));
    audio.musicEnabled = false;
    try {
      window.close();
    } catch {
      /* browsers bloqueiam fechar separadores por código */
    }
  }

  private renderQuit(): void {
    const l = layoutOf(this);
    this.L = l;
    this.layer.removeAll(true);
    this.backdrop.add(this.add.rectangle(0, 0, l.width, l.height, 0x0e1a33).setOrigin(0));
    this.layer.add(
      this.add
        .text(l.cx, l.cy - l.s(30), "ATÉ À PRÓXIMA, LOTADOR!", {
          fontFamily: FONT.display,
          fontSize: l.font(40),
          color: HEX.yellow,
        })
        .setOrigin(0.5),
    );
    this.layer.add(
      this.add
        .text(l.cx, l.cy + l.s(16), "Obrigado por jogar LOTADOR.", {
          fontFamily: FONT.body,
          fontSize: l.font(16),
          color: HEX.muted,
        })
        .setOrigin(0.5),
    );
    this.button(l.cy + l.s(80), "VOLTAR A ENTRAR", () => {
      this.quitting = false;
      this.panel = "MENU";
      this.scene.restart();
    });
  }

  private go(panel: Panel): void {
    this.panel = panel;
    this.render();
  }
}
