import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import { audio } from "../systems/AudioManager";
import type { GameScene } from "./GameScene";

const HUD_MARGIN = 16;

/** HUD compacto por cima do jogo: logo, energia, objetivos, dinheiro + tempo,
 * pausa, joystick e botões de acção — colado às bordas, centro livre. */
export class HUDScene extends Phaser.Scene {
  private game_!: GameScene;
  private money!: Phaser.GameObjects.Text;
  private timer!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private tutorialText!: Phaser.GameObjects.Text;
  private tutorialPanel: Phaser.GameObjects.Container | undefined;
  private staminaFill!: Phaser.GameObjects.Rectangle;
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
    const { width, height } = this.scale;

    // ---------------- canto superior esquerdo: logo, energia, objetivos
    this.add
      .text(HUD_MARGIN, 6, "LOTADOR", { fontFamily: FONT.display, fontSize: "22px", color: HEX.gold })
      .setStroke(HEX.dark, 4)
      .setOrigin(0)
      .setScrollFactor(0);

    this.card(HUD_MARGIN, 34, 152, 22);
    this.add
      .text(24, 45, "⚡", { fontSize: "13px", color: HEX.yellow })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.add.rectangle(42, 45, 82, 8, 0x000000, 0.55).setOrigin(0, 0.5);
    this.staminaFill = this.add.rectangle(42, 45, 82, 8, 0x36b45a).setOrigin(0, 0.5);
    this.staminaPct = this.add
      .text(130, 45, "100%", { fontFamily: FONT.display, fontSize: "11px", color: HEX.white })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    const objZone = this.add
      .rectangle(HUD_MARGIN, 62, 110, 24)
      .setOrigin(0)
      .setAlpha(0.01)
      .setInteractive({ useHandCursor: true });
    this.card(HUD_MARGIN, 62, 110, 24);
    this.add.text(26, 74, "🎯", { fontSize: "12px" }).setOrigin(0, 0.5).setScrollFactor(0);
    this.add
      .text(44, 74, "OBJ.", { fontFamily: FONT.display, fontSize: "11px", color: HEX.white })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.add.circle(102, 74, 9, 0xffc31f).setStrokeStyle(2, 0x0e1a33);
    this.objBadge = this.add
      .text(102, 74, "0", { fontFamily: FONT.display, fontSize: "10px", color: HEX.dark })
      .setOrigin(0.5)
      .setScrollFactor(0);
    objZone.on("pointerdown", () => {
      audio.ui();
      this.objPanel.setVisible(!this.objPanel.visible);
    });
    this.buildObjectivesPanel();

    // ---------------- canto superior direito: [💰 Kz | ⏱ tempo] [Ⅱ]
    const cardW = 180;
    const cardH = 30;
    const cardX = width - HUD_MARGIN - 30 - 8 - cardW;
    const cardY = 10;
    this.card(cardX, cardY, cardW, cardH, 0.78);
    this.money = this.add
      .text(cardX + 10, cardY + cardH / 2, "💰 0 Kz", {
        fontFamily: FONT.display,
        fontSize: "14px",
        color: HEX.gold,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0);
    this.add.rectangle(cardX + cardW / 2, cardY + cardH / 2, 2, cardH - 12, 0xffc31f, 0.45);
    this.timer = this.add
      .text(cardX + cardW - 8, cardY + cardH / 2, "⏱ 3:00", {
        fontFamily: FONT.display,
        fontSize: "14px",
        color: HEX.white,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    const pauseX = width - HUD_MARGIN - 15;
    const pause = this.add
      .circle(pauseX, cardY + cardH / 2, 15, 0x0e1a33, 0.85)
      .setStrokeStyle(2, 0xffc31f, 0.8)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(pauseX, cardY + cardH / 2, "Ⅱ", { fontFamily: FONT.display, fontSize: "13px", color: HEX.white })
      .setOrigin(0.5)
      .setScrollFactor(0);
    pause.on("pointerdown", () => this.events.emit("hud-pause"));

    this.comboText = this.add
      .text(width - HUD_MARGIN, cardY + cardH + 6, "COMBO x1", {
        fontFamily: FONT.display,
        fontSize: "12px",
        color: HEX.yellow,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setVisible(false);

    // ---------------- topo centro: apenas eventos temporários
    this.rushText = this.add
      .text(width / 2, 24, "HORA DE PONTA!", {
        fontFamily: FONT.display,
        fontSize: "14px",
        color: HEX.red,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setVisible(false);
    this.tutorialText = this.add
      .text(width / 2, 4, "", { fontFamily: FONT.display, fontSize: "12px", color: HEX.yellow })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    this.buildTouchControls();
    if (this.game_.tutorialMode) this.buildTycoonTutorial(width, height);

    this.registry.set("runHeld", false);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.registry.set("runHeld", false));

    this.game_.events.on("paused", (p: boolean) => {
      this.isPaused = p;
      if (p) this.scene.launch("Pause");
      else this.scene.stop("Pause");
    });

    this.input.keyboard?.on("keydown-ESC", () => {
      if (!this.isPaused) this.events.emit("hud-pause");
    });
  }

  /** Cartão escuro compacto com cantos arredondados (fundo do HUD). */
  private card(x: number, y: number, w: number, h: number, alpha = 0.72): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    const r = Math.min(11, h / 2);
    g.fillStyle(0x0e1a33, alpha);
    g.fillRoundedRect(x, y, w, h, r);
    g.lineStyle(1, 0xffc31f, 0.35);
    g.strokeRoundedRect(x, y, w, h, r);
    return g;
  }

  /** Painel de objetivos (dados reais do MissionManager), aberto pelo botão OBJ. */
  private buildObjectivesPanel(): void {
    const missions = this.game_.missions.progress;
    const w = 262;
    const rowH = 22;
    const pad = 10;
    const h = missions.length * rowH + pad * 2;
    const container = this.add.container(HUD_MARGIN, 94).setDepth(1500).setVisible(false);
    const bg = this.add.graphics();
    bg.fillStyle(0x0e1a33, 0.94);
    bg.fillRoundedRect(0, 0, w, h, 12);
    bg.lineStyle(2, 0xffc31f, 0.6);
    bg.strokeRoundedRect(0, 0, w, h, 12);
    container.add(bg);
    missions.forEach((m, i) => {
      const cy = pad + i * rowH + rowH / 2;
      const label = this.add
        .text(pad, cy, m.def.label, { fontFamily: FONT.display, fontSize: "11px", color: HEX.white })
        .setOrigin(0, 0.5);
      const status = this.add
        .text(w - pad, cy, "", { fontFamily: FONT.display, fontSize: "11px", color: HEX.muted })
        .setOrigin(1, 0.5);
      container.add([label, status]);
      this.objPanelItems.push({ label, status });
    });
    this.objPanel = container;
  }

  private buildTouchControls(): void {
    const { width, height } = this.scale;
    // O controlo é ancorado no HUD: nunca segue o toque nem pode ser arrastado.
    const stickX = 84;
    const stickY = height - 76;
    const stickRadius = 50;
    this.stickBase = this.add
      .circle(stickX, stickY, stickRadius, 0xffffff, 0.1)
      .setStrokeStyle(2, 0xffc31f, 0.55)
      .setScrollFactor(0);
    this.stickThumb = this.add.circle(stickX, stickY, 20, 0xffc31f, 0.6).setScrollFactor(0);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      const distance = Phaser.Math.Distance.Between(p.x, p.y, stickX, stickY);
      if (p.x < width / 2 && distance <= stickRadius + 10 && this.stickId === -1) {
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
      this.stickThumb.setPosition(
        stickX + Math.cos(a) * len,
        stickY + Math.sin(a) * len,
      );
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
    this.actionButton(width - 52, height - 140, "🚕", "CHAMAR", 0xffc31f, HEX.dark, () =>
      this.events.emit("hud-call"),
    );
    const run = this.actionButton(width - 52, height - 58, "🏃", "CORRER", 0x2b5fae, "#f7f4ec", () =>
      this.registry.set("runHeld", true),
    );
    run.on("pointerup", () => this.registry.set("runHeld", false));
    run.on("pointerout", () => this.registry.set("runHeld", false));

    // Botões secundários (interagir / power-up), mais pequenos, à esquerda dos principais.
    this.miniButton(width - 124, height - 99, "E", "hud-interact");
    this.miniButton(width - 124, height - 158, "Q", "hud-power");
    this.powerDot = this.add
      .circle(width - 108, height - 174, 4, 0xffc31f)
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
    const c = this.add
      .circle(x, y, 34, fill, 0.94)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y - 8, icon, { fontSize: "18px" }).setOrigin(0.5).setScrollFactor(0);
    this.add
      .text(x, y + 14, label, { fontFamily: FONT.display, fontSize: "10px", color: labelColor })
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
  private miniButton(x: number, y: number, label: string, event: string): void {
    const c = this.add
      .circle(x, y, 24, 0x16305c, 0.85)
      .setStrokeStyle(2, 0xffc31f, 0.5)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, { fontFamily: FONT.display, fontSize: "16px", color: HEX.white })
      .setOrigin(0.5)
      .setScrollFactor(0);
    c.on("pointerdown", () => this.events.emit(event));
  }

  private buildTycoonTutorial(width: number, height: number): void {
    const panelWidth = Math.min(520, width - 32);
    const panel = this.add.container(width / 2, height / 2).setDepth(2000);
    const backdrop = this.add.rectangle(0, 0, width, height, 0x071225, 0.78).setOrigin(0.5);
    const card = this.add.rectangle(0, 0, panelWidth, 250, 0x16305c, 0.98).setStrokeStyle(4, 0xffc31f);
    const roof = this.add.rectangle(0, -91, 170, 34, 0xffc31f).setStrokeStyle(3, 0x0e1a33);
    const roofText = this.add.text(0, -91, "CENTRAL DE OPERAÇÃO", { fontFamily: FONT.display, fontSize: "16px", color: "#0e1a33" }).setOrigin(0.5);
    const icon = this.add.circle(-panelWidth / 2 + 58, -20, 31, 0xffc31f).setStrokeStyle(3, 0x0e1a33);
    const iconText = this.add.text(icon.x, icon.y, "1", { fontFamily: FONT.display, fontSize: "28px", color: "#0e1a33" }).setOrigin(0.5);
    const title = this.add.text(-panelWidth / 2 + 105, -42, "PRIMEIRO TURNO", { fontFamily: FONT.display, fontSize: "25px", color: HEX.yellow }).setOrigin(0, 0.5);
    const route = this.add.text(-panelWidth / 2 + 105, 0, "MOVER  →  APROXIMAR  →  CHAMAR", { fontFamily: FONT.display, fontSize: "17px", color: HEX.white }).setOrigin(0, 0.5);
    const arrow = this.add.text(0, 54, "↓", { fontFamily: FONT.display, fontSize: "30px", color: HEX.yellow }).setOrigin(0.5);
    const action = this.add.rectangle(0, 91, 250, 48, 0xffc31f).setStrokeStyle(3, 0x0e1a33).setInteractive({ useHandCursor: true });
    const actionText = this.add.text(0, 91, "COMEÇAR TURNO", { fontFamily: FONT.display, fontSize: "22px", color: "#0e1a33" }).setOrigin(0.5);
    action.on("pointerdown", () => {
      audio.ui();
      panel.destroy();
      this.tutorialPanel = undefined;
      this.game_.advanceTutorial("MOVER");
    });
    panel.add([backdrop, card, roof, roofText, icon, iconText, title, route, arrow, action, actionText]);
    this.tutorialPanel = panel;
    this.tweens.add({ targets: arrow, y: 62, duration: 500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: action, scale: 1.05, duration: 650, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  override update(): void {
    const g = this.game_;
    if (!g || !g.scene.isActive()) return;
    this.money.setText(`💰 ${g.economy.stats.money} Kz`);
    const s = Math.max(0, Math.ceil(g.timeLeft));
    this.timer.setText(`⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
    this.timer.setColor(s <= 20 ? HEX.red : HEX.white);
    this.comboText.setText(`COMBO x${g.combo.level}`).setVisible(g.combo.level > 1);
    this.tutorialText.setText(g.tutorialMode ? `TUTORIAL · ${g.tutorialStep}` : "");

    const ratio = Phaser.Math.Clamp(g.player.stamina / g.player.maxStamina, 0, 1);
    this.staminaFill.width = 82 * ratio;
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
