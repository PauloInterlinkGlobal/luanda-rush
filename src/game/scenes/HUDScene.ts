import Phaser from "phaser";
import { HEX } from "../config/GameConfig";
import { BALANCE } from "../config/BalanceConfig";
import { SaveManager, levelTitle } from "../systems/SaveManager";
import type { GameScene } from "./GameScene";

/** HUD por cima do jogo: dinheiro, combo, tempo, stamina, joystick e botões. */
export class HUDScene extends Phaser.Scene {
  private game_!: GameScene;
  private money!: Phaser.GameObjects.Text;
  private timer!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private flowText!: Phaser.GameObjects.Text;
  private tutorialText!: Phaser.GameObjects.Text;
  private staminaBar!: Phaser.GameObjects.Rectangle;
  private rushText!: Phaser.GameObjects.Text;
  private isPaused = false;
  private stickBase!: Phaser.GameObjects.Arc;
  private stickThumb!: Phaser.GameObjects.Arc;
  private stickId = -1;

  constructor() {
    super("HUD");
  }

  create(): void {
    this.game_ = this.scene.get("Game") as GameScene;
    const { width, height } = this.scale;
    const save = SaveManager.load();

    this.add.rectangle(0, 0, width, 54, 0x0e1a33, 0.72).setOrigin(0);
    this.money = this.text(16, 16, "0 Kz", 24, HEX.gold, 0);
    this.timer = this.text(width / 2, 16, "3:00", 24, HEX.white, 0.5);
    this.comboText = this.text(width - 16, 16, "COMBO x1", 20, HEX.yellow, 1);
    this.levelText = this.text(16, 62, `NÍVEL ${save.level} · ${levelTitle(save.level)}`, 13, HEX.muted, 0);
    this.flowText = this.text(width / 2, 88, "PASSAGEIROS 0 · PERDIDOS 0", 12, HEX.muted, 0.5);
    this.tutorialText = this.text(width / 2, 118, "", 22, HEX.yellow, 0.5);

    this.add.rectangle(16, 84, 160, 10, 0x000000, 0.5).setOrigin(0, 0.5);
    this.staminaBar = this.add.rectangle(16, 84, 160, 10, 0x36b45a).setOrigin(0, 0.5);

    this.rushText = this.text(width / 2, 62, "HORA DE PONTA!", 20, HEX.red, 0.5);
    this.rushText.setVisible(false);

    this.buildTouchControls();

    this.game_.events.on("paused", (p: boolean) => {
      this.isPaused = p;
      if (p) this.scene.launch("Pause");
      else this.scene.stop("Pause");
    });

    this.input.keyboard?.on("keydown-ESC", () => {
      if (!this.isPaused) this.events.emit("hud-pause");
    });
  }

  private text(
    x: number,
    y: number,
    value: string,
    size: number,
    color: string,
    originX: number,
  ): Phaser.GameObjects.Text {
    return this.add
      .text(x, y, value, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: `${size}px`,
        color,
      })
      .setOrigin(originX, 0)
      .setScrollFactor(0);
  }

  private button(x: number, y: number, label: string, event: string, r = 34): void {
    const c = this.add
      .circle(x, y, r, 0xffc31f, 0.85)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(x, y, label, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: `${Math.round(r * 0.45)}px`,
        color: "#0e1a33",
      })
      .setOrigin(0.5);
    c.on("pointerdown", () => this.events.emit(event));
  }

  private buildTouchControls(): void {
    const { width, height } = this.scale;
    // O controle é ancorado no HUD: nunca segue o toque nem pode ser arrastado.
    const stickX = 110;
    const stickY = height - 100;
    const stickRadius = 62;
    this.stickBase = this.add.circle(stickX, stickY, stickRadius, 0xffffff, 0.14).setScrollFactor(0);
    this.stickThumb = this.add.circle(stickX, stickY, 28, 0xffc31f, 0.6).setScrollFactor(0);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      const distance = Phaser.Math.Distance.Between(p.x, p.y, stickX, stickY);
      if (p.x < width / 2 && distance <= stickRadius && this.stickId === -1) {
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
        run: len > 52,
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

    this.button(width - 80, height - 80, "E", "hud-interact", 40);
    this.button(width - 168, height - 62, "!", "hud-call");
    this.button(width - 84, height - 168, "Q", "hud-power");
    this.button(width - 40, 84, "II", "hud-pause", 22);

    [this.stickBase, this.stickThumb].forEach((control) => control.setDepth(1000));
  }

  override update(): void {
    const g = this.game_;
    if (!g || !g.scene.isActive()) return;
    this.money.setText(`${g.economy.stats.money} Kz`);
    const s = Math.max(0, Math.ceil(g.timeLeft));
    this.timer.setText(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
    this.timer.setColor(s <= 20 ? HEX.red : HEX.white);
    this.comboText.setText(`COMBO x${g.combo.level}`);
    this.comboText.setScale(g.combo.level > 1 ? 1.08 : 1);
    this.flowText.setText(
      `PASSAGEIROS ${g.economy.stats.passengers} · PERDIDOS ${g.economy.stats.lostPassengers}`,
    );
    this.tutorialText.setText(g.tutorialMode ? `TUTORIAL · ${g.tutorialStep}` : "");
    this.staminaBar.width = 160 * (g.player.stamina / g.player.maxStamina);
    this.staminaBar.fillColor = g.player.tired ? 0xe23b3b : 0x36b45a;
    this.rushText.setVisible(g.isRush);
    const ready = g.powerUps.cooldownRatio(this.time.now) >= 1;
    this.levelText.setText(
      `${g.difficulty.current.name} · POWER-UP ${ready ? "PRONTO" : "…"} · ${Math.round(
        (g.timeLeft / BALANCE.matchDuration) * 100,
      )}%`,
    );
  }
}
