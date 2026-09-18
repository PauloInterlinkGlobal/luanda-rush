import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import { audio } from "../systems/AudioManager";
import {
  TUTORIAL_STEPS,
  TutorialStep,
  type TutorialHudTarget,
} from "../systems/TutorialController";
import { layoutOf, restartOnResize, type Layout } from "../systems/Responsive";
import type { GameScene } from "./GameScene";

type HudTargetPos = {
  [K in Exclude<TutorialHudTarget, null>]: { x: number; y: number; r: number };
};

/** HUD compacto por cima do jogo: logo, energia, objetivos, dinheiro + tempo,
 * pausa, joystick e botões de acção — ancorado às bordas reais do ecrã
 * (respeitando safe areas) e escalado uniformemente, sem deformar nada. */
export class HUDScene extends Phaser.Scene {
  private game_!: GameScene;
  private L!: Layout;
  private money!: Phaser.GameObjects.Text;
  private timer!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private tutorialPanel: Phaser.GameObjects.Container | undefined;
  /** Tutorial: tooltip + destaque pulsante sobre o elemento a ensinar. */
  private hudPos!: HudTargetPos;
  private highlightRing!: Phaser.GameObjects.Arc;
  private tooltipBox!: Phaser.GameObjects.Graphics;
  private tooltipText!: Phaser.GameObjects.Text;
  private tooltipMsg = "";
  private staminaFill!: Phaser.GameObjects.Rectangle;
  private staminaWidth = 82;
  private staminaPct!: Phaser.GameObjects.Text;
  private rushText!: Phaser.GameObjects.Text;
  private isPaused = false;
  private stickBase!: Phaser.GameObjects.Arc;
  private stickThumb!: Phaser.GameObjects.Arc;
  private stickId = -1;
  private objBadge!: Phaser.GameObjects.Text;
  private objPanel!: Phaser.GameObjects.Container;
  private objPanelItems: { label: Phaser.GameObjects.Text; status: Phaser.GameObjects.Text }[] = [];
  private powerDot!: Phaser.GameObjects.Arc;

  constructor() {
    super("HUD");
  }

  create(): void {
    this.game_ = this.scene.get("Game") as GameScene;
    this.objPanelItems = [];
    const l = (this.L = layoutOf(this));
    const s = l.s;

    // ---------------- canto superior esquerdo: logo, energia, objetivos
    this.add
      .text(l.left, l.top - s(6), "LOTADOR", {
        fontFamily: FONT.display,
        fontSize: l.font(22),
        color: HEX.gold,
      })
      .setStroke(HEX.dark, Math.max(2, s(4)))
      .setOrigin(0)
      .setScrollFactor(0);

    const energyY = l.top + s(28);
    const energyH = s(22);
    this.card(l.left, energyY, s(152), energyH);
    this.add
      .text(l.left + s(8), energyY + energyH / 2, "⚡", { fontSize: l.font(13), color: HEX.yellow })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.staminaWidth = s(82);
    const barX = l.left + s(26);
    this.add
      .rectangle(barX, energyY + energyH / 2, this.staminaWidth, s(8), 0x000000, 0.55)
      .setOrigin(0, 0.5);
    this.staminaFill = this.add
      .rectangle(barX, energyY + energyH / 2, this.staminaWidth, s(8), 0x36b45a)
      .setOrigin(0, 0.5);
    this.staminaPct = this.add
      .text(l.left + s(114), energyY + energyH / 2, "100%", {
        fontFamily: FONT.display,
        fontSize: l.font(11),
        color: HEX.white,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    const objY = energyY + energyH + s(6);
    const objW = s(110);
    const objH = s(26);
    const objZone = this.add
      .rectangle(l.left, objY, objW, objH)
      .setOrigin(0)
      .setAlpha(0.01)
      .setInteractive({ useHandCursor: true });
    this.card(l.left, objY, objW, objH);
    this.add
      .text(l.left + s(10), objY + objH / 2, "🎯", { fontSize: l.font(12) })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.add
      .text(l.left + s(28), objY + objH / 2, "OBJ.", {
        fontFamily: FONT.display,
        fontSize: l.font(11),
        color: HEX.white,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.add
      .circle(l.left + objW - s(24), objY + objH / 2, s(9), 0xffc31f)
      .setStrokeStyle(2, 0x0e1a33);
    this.objBadge = this.add
      .text(l.left + objW - s(24), objY + objH / 2, "0", {
        fontFamily: FONT.display,
        fontSize: l.font(10),
        color: HEX.dark,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    objZone.on("pointerdown", () => {
      audio.ui();
      this.objPanel.setVisible(!this.objPanel.visible);
      this.registry.set("objectivesOpen", this.objPanel.visible);
    });
    this.registry.set("objectivesOpen", false);
    this.buildObjectivesPanel(objY + objH + s(6));

    // ---------------- canto superior direito: [💰 Kz | ⏱ tempo] [Ⅱ]
    const pauseR = Math.max(16, s(15));
    const cardH = s(30);
    const cardW = Math.min(s(180), Math.max(s(120), l.innerWidth - pauseR * 2 - s(180)));
    const cardY = l.top;
    const cardX = l.right - pauseR * 2 - s(8) - cardW;
    this.card(cardX, cardY, cardW, cardH, 0.78);
    this.money = this.add
      .text(cardX + s(10), cardY + cardH / 2, "💰 0 Kz", {
        fontFamily: FONT.display,
        fontSize: l.font(14),
        color: HEX.gold,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.add.rectangle(cardX + cardW / 2, cardY + cardH / 2, 2, cardH - s(12), 0xffc31f, 0.45);
    this.timer = this.add
      .text(cardX + cardW - s(8), cardY + cardH / 2, "⏱ 3:00", {
        fontFamily: FONT.display,
        fontSize: l.font(14),
        color: HEX.white,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    const pauseX = l.right - pauseR;
    const pause = this.add
      .circle(pauseX, cardY + cardH / 2, pauseR, 0x0e1a33, 0.85)
      .setStrokeStyle(2, 0xffc31f, 0.8)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(pauseX, cardY + cardH / 2, "Ⅱ", {
        fontFamily: FONT.display,
        fontSize: l.font(13),
        color: HEX.white,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    pause.on("pointerdown", () => this.events.emit("hud-pause"));

    this.comboText = this.add
      .text(l.right, cardY + cardH + s(6), "COMBO x1", {
        fontFamily: FONT.display,
        fontSize: l.font(12),
        color: HEX.yellow,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setVisible(false);

    // ---------------- topo centro: apenas eventos temporários
    this.rushText = this.add
      .text(l.cx, l.top + s(8), "HORA DE PONTA!", {
        fontFamily: FONT.display,
        fontSize: l.font(14),
        color: HEX.red,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setVisible(false);

    this.highlightRing = this.add
      .circle(0, 0, s(40), 0x000000, 0)
      .setStrokeStyle(3, 0xffc31f, 0.95)
      .setVisible(false)
      .setDepth(1590);
    this.tweens.add({
      targets: this.highlightRing,
      scale: 1.1,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tooltipBox = this.add.graphics().setDepth(1600).setVisible(false);
    this.tooltipText = this.add
      .text(0, 0, "", { fontFamily: FONT.body, fontSize: l.font(13), color: HEX.white })
      .setOrigin(0.5)
      .setDepth(1601)
      .setVisible(false);

    this.buildTouchControls();

    // ---------------- tutorial: destaque pulsante + tooltip compacto
    this.hudPos = {
      joystick: { x: this.stickBase.x, y: this.stickBase.y, r: this.stickBase.radius + s(10) },
      call: { x: this.callBtn.x, y: this.callBtn.y, r: this.callBtn.radius + s(8) },
      interact: { x: this.interactBtn.x, y: this.interactBtn.y, r: this.interactBtn.radius + s(6) },
      run: { x: this.runBtn.x, y: this.runBtn.y, r: this.runBtn.radius + s(8) },
      energy: { x: l.left + s(76), y: energyY + energyH / 2, r: s(42) },
      objectives: { x: l.left + objW / 2, y: objY + objH / 2, r: s(44) },
      money: { x: cardX + cardW / 2, y: cardY + cardH / 2, r: s(46) },
      timer: { x: cardX + cardW - s(52), y: cardY + cardH / 2, r: s(30) },
    };

    if (this.game_.tutorialMode) this.buildTutorialIntro(l);

    this.registry.set("runHeld", false);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.registry.set("runHeld", false));

    const pausedHandler = (p: boolean) => {
      this.isPaused = p;
      if (p) this.scene.launch("Pause");
      else this.scene.stop("Pause");
    };
    this.game_.events.on("paused", pausedHandler);
    // Remove o listener ao encerrar o HUD — evita acumulação quando a
    // cena é recriada (cada create() adicionaria um novo listener).
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game_.events.off("paused", pausedHandler);
    });

    this.input.keyboard?.on("keydown-ESC", () => {
      if (!this.isPaused) this.events.emit("hud-pause");
    });

    // O HUD é reconstruído no resize/rotação para recalcular todas as âncoras.
    restartOnResize(this);
  }

  /** Cartão escuro compacto com cantos arredondados (fundo do HUD). */
  private card(
    x: number,
    y: number,
    w: number,
    h: number,
    alpha = 0.72,
  ): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    const r = Math.min(11, h / 2);
    g.fillStyle(0x0e1a33, alpha);
    g.fillRoundedRect(x, y, w, h, r);
    g.lineStyle(1, 0xffc31f, 0.35);
    g.strokeRoundedRect(x, y, w, h, r);
    return g;
  }

  /** Painel de objetivos (dados reais do MissionManager), aberto pelo botão OBJ. */
  private buildObjectivesPanel(topY: number): void {
    const l = this.L;
    const missions = this.game_.missions.progress;
    const w = Math.min(l.s(262), l.innerWidth * 0.6);
    const rowH = l.s(22);
    const pad = l.s(10);
    const h = missions.length * rowH + pad * 2;
    const container = this.add.container(l.left, topY).setDepth(1500).setVisible(false);
    const bg = this.add.graphics();
    bg.fillStyle(0x0e1a33, 0.94);
    bg.fillRoundedRect(0, 0, w, h, 12);
    bg.lineStyle(2, 0xffc31f, 0.6);
    bg.strokeRoundedRect(0, 0, w, h, 12);
    container.add(bg);
    missions.forEach((m, i) => {
      const cy = pad + i * rowH + rowH / 2;
      const label = this.add
        .text(pad, cy, m.def.label, {
          fontFamily: FONT.display,
          fontSize: l.font(11),
          color: HEX.white,
        })
        .setOrigin(0, 0.5);
      const status = this.add
        .text(w - pad, cy, "", { fontFamily: FONT.display, fontSize: l.font(11), color: HEX.muted })
        .setOrigin(1, 0.5);
      container.add([label, status]);
      this.objPanelItems.push({ label, status });
    });
    this.objPanel = container;
  }

  private callBtn!: Phaser.GameObjects.Arc;
  private runBtn!: Phaser.GameObjects.Arc;
  private interactBtn!: Phaser.GameObjects.Arc;

  private buildTouchControls(): void {
    const l = this.L;
    const s = l.s;
    // O controlo é ancorado no HUD: nunca segue o toque nem pode ser arrastado.
    // Raio mínimo garante uma área de toque confortável (≥44px) em ecrãs baixos.
    const stickRadius = Math.max(42, s(50));
    const stickX = l.left + stickRadius + s(6);
    const stickY = l.bottom - stickRadius - s(6);
    this.stickBase = this.add
      .circle(stickX, stickY, stickRadius, 0xffffff, 0.1)
      .setStrokeStyle(2, 0xffc31f, 0.55)
      .setScrollFactor(0);
    this.stickThumb = this.add
      .circle(stickX, stickY, stickRadius * 0.4, 0xffc31f, 0.6)
      .setScrollFactor(0);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      const distance = Phaser.Math.Distance.Between(p.x, p.y, stickX, stickY);
      if (p.x < l.width / 2 && distance <= stickRadius + 10 && this.stickId === -1) {
        this.stickId = p.id;
        this.stickThumb.setPosition(stickX, stickY);
      }
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (p.id !== this.stickId) return;
      const dx = p.x - stickX;
      const dy = p.y - stickY;
      const len = Math.min(stickRadius, Math.hypot(dx, dy));
      const a = Math.atan2(dy, dx);
      this.stickThumb.setPosition(stickX + Math.cos(a) * len, stickY + Math.sin(a) * len);
      this.registry.set("joystick", {
        x: (Math.cos(a) * len) / stickRadius,
        y: (Math.sin(a) * len) / stickRadius,
        run: len > stickRadius * 0.85,
      });
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id !== this.stickId) return;
      this.stickId = -1;
      this.stickThumb.setPosition(this.stickBase.x, this.stickBase.y);
      this.registry.set("joystick", { x: 0, y: 0, run: false });
    };
    this.input.on("pointerup", release);
    this.input.on("pointerupoutside", release);

    // Coluna principal do canto inferior direito: CHAMAR em cima, CORRER em baixo.
    const big = Math.max(30, s(34));
    const mini = Math.max(22, s(24));
    const colX = l.right - big;
    const runY = l.bottom - big;
    const callY = runY - big * 2 - s(14);
    this.callBtn = this.actionButton(colX, callY, "🚕", "CHAMAR", 0xffc31f, HEX.dark, () =>
      this.events.emit("hud-call"),
    );
    this.runBtn = this.actionButton(colX, runY, "🏃", "CORRER", 0x2b5fae, "#f7f4ec", () =>
      this.registry.set("runHeld", true),
    );
    this.runBtn.on("pointerup", () => this.registry.set("runHeld", false));
    this.runBtn.on("pointerout", () => this.registry.set("runHeld", false));

    // Botões secundários (interagir / power-up), mais pequenos, à esquerda dos principais.
    const miniX = colX - big - mini - s(6);
    const interactY = (callY + runY) / 2 + mini * 0.6;
    const powerY = interactY - mini * 2 - s(10);
    this.interactBtn = this.miniButton(miniX, interactY, "E", "hud-interact", mini);
    this.miniButton(miniX, powerY, "Q", "hud-power", mini);
    this.powerDot = this.add
      .circle(miniX + mini * 0.65, powerY - mini * 0.65, Math.max(3, s(4)), 0xffc31f)
      .setScrollFactor(0)
      .setVisible(false);

    [this.stickBase, this.stickThumb].forEach((control) => control.setDepth(1000));
  }

  /** Botão circular grande (CHAMAR / CORRER) com ícone e legenda pequena. */
  private actionButton(
    x: number,
    y: number,
    icon: string,
    label: string,
    fill: number,
    labelColor: string,
    onDown: () => void,
  ): Phaser.GameObjects.Arc {
    const l = this.L;
    const r = Math.max(30, l.s(34));
    const c = this.add
      .circle(x, y, r, fill, 0.94)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y - r * 0.24, icon, { fontSize: l.font(18) })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.add
      .text(x, y + r * 0.41, label, {
        fontFamily: FONT.display,
        fontSize: l.font(10),
        color: labelColor,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    c.on("pointerdown", () => {
      c.setScale(0.92);
      onDown();
    });
    c.on("pointerup", () => c.setScale(1));
    c.on("pointerout", () => c.setScale(1));
    return c;
  }

  /** Botão circular secundário (atalhos E / Q). */
  private miniButton(
    x: number,
    y: number,
    label: string,
    event: string,
    r: number,
  ): Phaser.GameObjects.Arc {
    const c = this.add
      .circle(x, y, r, 0x16305c, 0.85)
      .setStrokeStyle(2, 0xffc31f, 0.5)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, { fontFamily: FONT.display, fontSize: this.L.font(16), color: HEX.white })
      .setOrigin(0.5)
      .setScrollFactor(0);
    c.on("pointerdown", () => this.events.emit(event));
    return c;
  }

  /** Introdução breve do tutorial — pequena, sem cobrir o gameplay. */
  private buildTutorialIntro(l: Layout): void {
    const panel = this.add.container(l.cx, l.cy).setDepth(2000);
    const backdrop = this.add.rectangle(0, 0, l.width, l.height, 0x071225, 0.55).setOrigin(0.5);
    const cardW = Math.min(l.s(450), l.innerWidth);
    const cardH = Math.min(l.s(170), l.innerHeight);
    const card = this.add.rectangle(0, 0, cardW, cardH, 0x16305c, 0.98).setStrokeStyle(3, 0xffc31f);
    const title = this.add
      .text(0, -cardH * 0.28, "BEM-VINDO AO LOTADOR!", {
        fontFamily: FONT.display,
        fontSize: l.font(22),
        color: HEX.yellow,
      })
      .setOrigin(0.5);
    const line = this.add
      .text(
        0,
        -cardH * 0.02,
        "Ajuda os passageiros a entrar nos táxis e completa\nos objetivos antes do tempo acabar.",
        {
          fontFamily: FONT.body,
          fontSize: l.font(14),
          color: HEX.white,
          align: "center",
          wordWrap: { width: cardW - l.s(40) },
        },
      )
      .setOrigin(0.5);
    const action = this.add
      .rectangle(
        0,
        cardH * 0.31,
        Math.min(l.s(200), cardW - l.s(40)),
        Math.max(40, l.s(44)),
        0xffc31f,
      )
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    const actionText = this.add
      .text(0, cardH * 0.31, "COMEÇAR", {
        fontFamily: FONT.display,
        fontSize: l.font(20),
        color: "#0e1a33",
      })
      .setOrigin(0.5);
    action.on("pointerdown", () => {
      audio.ui();
      panel.destroy();
      this.tutorialPanel = undefined;
      this.game_.advanceTutorial();
    });
    panel.add([backdrop, card, title, line, action, actionText]);
    this.tutorialPanel = panel;
    this.tweens.add({
      targets: action,
      scale: 1.05,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /** Posição do tooltip por etapa — derivada das âncoras reais do HUD. */
  private tooltipAnchor(step: TutorialStep): { x: number; y: number } | null {
    const l = this.L;
    const p = this.hudPos;
    switch (step) {
      case TutorialStep.MOVE:
        return { x: p.joystick.x + l.s(12), y: p.joystick.y - p.joystick.r - l.s(22) };
      case TutorialStep.CALL:
        return { x: p.call.x - l.s(58), y: p.call.y - p.call.r - l.s(18) };
      case TutorialStep.CONVINCE:
        return { x: p.interact.x - l.s(46), y: p.interact.y - p.interact.r - l.s(18) };
      case TutorialStep.RUN:
        return { x: p.run.x - l.s(58), y: p.call.y - p.call.r - l.s(22) };
      case TutorialStep.OBJECTIVES:
        return { x: p.objectives.x + l.s(150), y: p.objectives.y };
      case TutorialStep.FREE_PLAY:
      case TutorialStep.FIND_PASSENGER:
      case TutorialStep.TAKE_TO_TAXI:
      case TutorialStep.SCORE:
      case TutorialStep.ENERGY:
      case TutorialStep.TIMER:
        return { x: l.cx, y: l.top + l.s(36) };
      default:
        return null;
    }
  }

  /** Desenha o tooltip compacto (caixa arredondada + texto curto). */
  private setTooltip(message: string | null, x: number, y: number): void {
    if (!message) {
      this.tooltipBox.setVisible(false);
      this.tooltipText.setVisible(false);
      return;
    }
    if (message !== this.tooltipMsg) {
      this.tooltipText.setText(message);
      this.tooltipMsg = message;
    }
    const l = this.L;
    const w = this.tooltipText.width + l.s(24);
    const h = this.tooltipText.height + l.s(14);
    const cx = Phaser.Math.Clamp(x, w / 2 + l.left, l.right - w / 2);
    const cy = Phaser.Math.Clamp(y, h / 2 + l.top, l.bottom - h / 2);
    const g = this.tooltipBox;
    g.clear();
    g.fillStyle(0x0e1a33, 0.92);
    g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);
    g.lineStyle(2, 0xffc31f, 0.8);
    g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);
    g.setVisible(true);
    this.tooltipText.setPosition(cx, cy).setVisible(true);
  }

  /** Camada guiada: destaque + tooltip conforme a etapa actual do tutorial. */
  private renderTutorial(): void {
    const ctl = this.game_.tutorialCtl;
    if (!ctl) {
      this.highlightRing.setVisible(false);
      this.tooltipBox.setVisible(false);
      this.tooltipText.setVisible(false);
      return;
    }
    const info = TUTORIAL_STEPS[ctl.step];
    const target = info.hudTarget ? this.hudPos[info.hudTarget] : null;
    this.highlightRing.setVisible(!!target);
    if (target) this.highlightRing.setPosition(target.x, target.y).setRadius(target.r);

    const anchor = this.tooltipAnchor(ctl.step);
    const hiddenHint = ctl.step === TutorialStep.FREE_PLAY && !ctl.showHint;
    this.setTooltip(anchor && !hiddenHint ? info.message : null, anchor?.x ?? 0, anchor?.y ?? 0);
  }

  override update(): void {
    const g = this.game_;
    if (!g || !g.scene.isActive()) return;
    this.money.setText(`💰 ${g.economy.stats.money} Kz`);
    const s = Math.max(0, Math.ceil(g.timeLeft));
    this.timer.setText(`⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
    this.timer.setColor(s <= 20 ? HEX.red : HEX.white);
    this.comboText.setText(`COMBO x${g.combo.level}`).setVisible(g.combo.level > 1);
    this.renderTutorial();

    const ratio = Phaser.Math.Clamp(g.player.stamina / g.player.maxStamina, 0, 1);
    this.staminaFill.width = this.staminaWidth * ratio;
    this.staminaFill.fillColor = g.player.tired ? 0xe23b3b : 0x36b45a;
    this.staminaPct.setText(`${Math.round(ratio * 100)}%`);

    this.rushText.setVisible(g.isRush);
    this.powerDot.setVisible(g.powerUps.cooldownRatio(this.time.now) >= 1);

    const done = g.missions.progress.filter((m) => m.done).length;
    this.objBadge.setText(String(done));
    if (this.objPanel.visible) {
      g.missions.progress.forEach((m, i) => {
        const item = this.objPanelItems[i];
        if (!item) return;
        item.status.setText(m.done ? "✓" : `${Math.min(m.current, m.def.goal)}/${m.def.goal}`);
        item.status.setColor(m.done ? HEX.green : HEX.muted);
      });
    }
  }
}
