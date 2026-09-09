import Phaser from "phaser";
import { HEX } from "../config/GameConfig";
import { SaveManager, levelTitle } from "../systems/SaveManager";
import { audio } from "../systems/AudioManager";
import { MISSIONS, UPGRADES } from "../data/missions";
import { MAP_CONFIG } from "../config/MapConfig";

type Panel = "MENU" | "MISSOES" | "GESTAO" | "DEFINICOES" | "SAIDA";

/** Menu principal: jogar, missões, personagem e definições. */
export class MenuScene extends Phaser.Scene {
  private panel: Panel = "MENU";
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super("Menu");
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e1a33).setOrigin(0);

    // Cenário de fundo
    const bg = this.add.image(width / 2, height / 2 + 40, "ground").setAlpha(0.4);
    bg.setDisplaySize(width * 1.1, (width * 1.1 * MAP_CONFIG.height) / MAP_CONFIG.width);

    this.add
      .text(width / 2, 74, "LOTADOR", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "72px",
        color: HEX.yellow,
      })
      .setOrigin(0.5)
      .setShadow(0, 5, "#000000", 8);
    this.add
      .text(width / 2, 122, "CHAMA, LOTA, GANHA", {
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: "17px",
        color: HEX.white,
      })
      .setOrigin(0.5);

    if (this.textures.exists("player")) {
      this.add.sprite(width / 2 - 300, height - 130, "player").setScale(2.6).play("player-idle-down");
    }
    if (this.textures.exists("taxi_NORMAL")) {
      this.add.sprite(width / 2 + 290, height - 140, "taxi_NORMAL", 0).setScale(1.2);
    }

    this.layer = this.add.container(0, 0);
    this.render();

    this.input.once("pointerdown", () => audio.unlock());
  }

  private button(y: number, label: string, onClick: () => void, primary = false): void {
    const { width } = this.scale;
    const w = primary ? 320 : 280;
    const bg = this.add
      .rectangle(width / 2, y, w, primary ? 62 : 48, primary ? 0xffc31f : 0x16305c, 0.96)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(width / 2, y, label, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: primary ? "30px" : "21px",
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
  }

  private label(x: number, y: number, text: string, size = 16, color: string = HEX.white, origin = 0.5): void {
    this.layer.add(
      this.add
        .text(x, y, text, {
          fontFamily: "'Trebuchet MS', sans-serif",
          fontSize: `${size}px`,
          color,
        })
        .setOrigin(origin, 0.5),
    );
  }

  private render(): void {
    this.layer.removeAll(true);
    const { width, height } = this.scale;
    const save = SaveManager.load();

    if (this.panel === "MENU") {
      this.label(
        width / 2,
        168,
        `NÍVEL ${save.level} · ${levelTitle(save.level)} · ${save.money} Kz · RECORDE ${save.bestScore} Kz`,
        16,
        HEX.gold,
      );
      this.button(226, save.tutorialDone ? "JOGAR" : "TUTORIAL", () => {
        this.registry.set("tutorial", !save.tutorialDone);
        this.scene.start("Game");
      }, true);
      this.button(292, save.tutorialDone ? "REPETIR TUTORIAL" : "MISSÕES", () => {
        if (save.tutorialDone) {
          this.registry.set("tutorial", true);
          this.scene.start("Game");
        } else this.go("MISSOES");
      });
      this.button(344, "GESTÃO", () => this.go("GESTAO"));
      this.button(396, "PERSONAGEM", () => this.scene.start("Character"));
      this.button(448, "DEFINIÇÕES", () => this.go("DEFINICOES"));
      this.button(500, "SAIR DO JOGO", () => this.go("SAIDA"));
      this.label(width / 2, height - 26, "WASD mover · SHIFT correr · E interagir · ESPAÇO chamar · Q power-up", 13, HEX.muted);
      this.buildControlGuide(width, height);
      return;
    }

    const panelBg = this.add
      .rectangle(width / 2, height / 2 + 20, 620, 380, 0x0e1a33, 0.94)
      .setStrokeStyle(3, 0xffc31f);
    this.layer.add(panelBg);

    if (this.panel === "MISSOES") {
      this.label(width / 2, 180, "MISSÕES", 26, HEX.yellow);
      MISSIONS.forEach((m, i) => {
        const done = save.missions[m.id] === true;
        this.label(width / 2 - 280, 230 + i * 42, `${done ? "✔" : "•"} ${m.label}`, 17, done ? HEX.green : HEX.white, 0);
        this.label(width / 2 - 280, 252 + i * 42, `${m.description} — ${m.rewardMoney} Kz / ${m.rewardXp} XP`, 13, HEX.muted, 0);
      });
    }

    if (this.panel === "GESTAO") {
      this.label(width / 2, 164, "GESTÃO DA OPERAÇÃO", 26, HEX.yellow);
      this.label(width / 2, 194, `CAIXA ${save.money} Kz · FROTA NÍVEL ${save.fleetLevel} · PARAGEM NÍVEL ${save.stationLevel}`, 14, HEX.muted);
      UPGRADES.forEach((upgrade, i) => {
        const level = save.upgrades[upgrade.id] ?? 0;
        const cost = upgrade.baseCost * (level + 1);
        const y = 236 + i * 48;
        this.label(width / 2 - 270, y, `${upgrade.label} ${level}/${upgrade.maxLevel}`, 16, HEX.white, 0);
        this.button(y, level >= upgrade.maxLevel ? "MAX" : `${cost} Kz`, () => {
          if (level >= upgrade.maxLevel || save.money < cost) return;
          SaveManager.update({ money: save.money - cost, upgrades: { ...save.upgrades, [upgrade.id]: level + 1 } });
          this.render();
        });
      });
      this.button(442, save.fleetLevel >= 3 ? "FROTA MAX" : `FROTA ${save.fleetLevel + 1} · ${1200 * save.fleetLevel} Kz`, () => {
        const cost = 1200 * save.fleetLevel;
        if (save.fleetLevel >= 3 || save.money < cost) return;
        SaveManager.update({ money: save.money - cost, fleetLevel: save.fleetLevel + 1 });
        this.render();
      });
      this.button(498, save.stationLevel >= 3 ? "PARAGEM MAX" : `PARAGEM ${save.stationLevel + 1} · ${1800 * save.stationLevel} Kz`, () => {
        const cost = 1800 * save.stationLevel;
        if (save.stationLevel >= 3 || save.money < cost) return;
        SaveManager.update({ money: save.money - cost, stationLevel: save.stationLevel + 1 });
        this.render();
      });
    }

    if (this.panel === "SAIDA") {
      this.label(width / 2, 200, "SAIR DO JOGO", 26, HEX.yellow);
      this.label(width / 2, 250, `Até à próxima, ${save.playerName || "lotador"}!`, 18, HEX.white);
      this.label(width / 2, 282, "O teu progresso fica guardado neste dispositivo.", 13, HEX.muted);
      this.button(340, "SIM, SAIR", () => this.quitGame());
      this.button(396, "AFINAL FICO", () => this.go("MENU"));
    }

    if (this.panel === "DEFINICOES") {
      this.label(width / 2, 180, "DEFINIÇÕES", 26, HEX.yellow);
      const s = save.settings;
      const toggle = (y: number, key: "music" | "sfx" | "vibration", name: string) => {
        this.button(y, `${name}: ${s[key] ? "LIGADO" : "DESLIGADO"}`, () => {
          SaveManager.update({ settings: { ...s, [key]: !s[key] } });
          audio.musicEnabled = key === "music" ? !s.music : s.music;
          audio.sfxEnabled = key === "sfx" ? !s.sfx : s.sfx;
          this.render();
        });
      };
      toggle(240, "music", "MÚSICA");
      toggle(296, "sfx", "EFEITOS");
      toggle(352, "vibration", "VIBRAÇÃO");
      this.button(408, `IDIOMA: ${s.language.toUpperCase()}`, () => {
        SaveManager.update({ settings: { ...s, language: s.language === "pt" ? "en" : "pt" } });
        this.render();
      });
    }

    this.button(height - 60, "VOLTAR", () => this.go("MENU"));
  }

  /** Fecha a sessão: pára tudo e mostra o ecrã de despedida. */
  private buildControlGuide(width: number, height: number): void {
    const compact = width < 820;
    const x = compact ? width / 2 : width - 176;
    const y = compact ? height - 92 : 278;
    const guideWidth = compact ? Math.min(width - 32, 620) : 300;
    const guideHeight = compact ? 70 : 250;
    const panel = this.add
      .rectangle(x, y, guideWidth, guideHeight, 0x16305c, 0.94)
      .setStrokeStyle(2, 0x2b5fae);
    this.layer.add(panel);

    const title = this.add
      .text(x, y - guideHeight / 2 + 22, "COMO JOGAR", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "20px",
        color: HEX.yellow,
      })
      .setOrigin(0.5);
    this.layer.add(title);

    if (compact) {
      const steps = this.add.text(x, y + 8, "1  MOVER  →  2  APROXIMAR  →  3  ESPAÇO PARA CHAMAR", {
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: "12px",
        color: HEX.white,
      }).setOrigin(0.5);
      this.layer.add(steps);
      this.animateCallHint(x + guideWidth / 2 - 24, y + 26);
      return;
    }

    const steps = [
      ["1", "MOVER", "WASD ou joystick", HEX.yellow],
      ["2", "APROXIMAR", "Chega perto do passageiro", HEX.white],
      ["3", "CHAMAR", "Pressiona ESPAÇO", HEX.gold],
    ] as const;
    steps.forEach(([number, label, copy], index) => {
      const rowY = y - 66 + index * 54;
      const marker = this.add.circle(x - 126, rowY, 15, index === 2 ? 0xffc31f : 0x2b5fae).setStrokeStyle(2, 0x0e1a33);
      const numberText = this.add.text(x - 126, rowY, number, { fontFamily: "Impact, 'Arial Black', sans-serif", fontSize: "16px", color: "#0e1a33" }).setOrigin(0.5);
      const labelText = this.add.text(x - 98, rowY - 9, label, { fontFamily: "Impact, 'Arial Black', sans-serif", fontSize: "15px", color: index === 2 ? HEX.yellow : HEX.white }).setOrigin(0, 0.5);
      const copyText = this.add.text(x - 98, rowY + 11, copy, { fontFamily: "'Trebuchet MS', sans-serif", fontSize: "11px", color: HEX.muted }).setOrigin(0, 0.5);
      this.layer.add([marker, numberText, labelText, copyText]);
    });
    this.animateCallHint(x + 100, y + 84);
  }

  private animateCallHint(x: number, y: number): void {
    const button = this.add
      .circle(x, y, 22, 0xffc31f, 0.95)
      .setStrokeStyle(3, 0x0e1a33);
    const text = this.add.text(x, y, "ESPAÇO", {
      fontFamily: "Impact, 'Arial Black', sans-serif",
      fontSize: "9px",
      color: "#0e1a33",
    }).setOrigin(0.5);
    const ring = this.add.circle(x, y, 28, 0xffc31f, 0).setStrokeStyle(2, 0xffc31f, 0.8);
    this.layer.add([ring, button, text]);
    this.tweens.add({ targets: [button, text], scale: 1.1, duration: 650, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: ring, scale: 1.55, alpha: 0, duration: 1000, repeat: -1, ease: "Quad.easeOut" });
  }

  private quitGame(): void {
    const { width, height } = this.scale;
    this.children.removeAll(true);
    this.add.rectangle(0, 0, width, height, 0x0e1a33).setOrigin(0);
    this.add
      .text(width / 2, height / 2 - 30, "ATÉ À PRÓXIMA, LOTADOR!", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "40px",
        color: HEX.yellow,
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 20, "Obrigado por jogar LOTADOR.", {
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: "16px",
        color: HEX.muted,
      })
      .setOrigin(0.5);
    const bg = this.add
      .rectangle(width / 2, height / 2 + 90, 260, 48, 0xffc31f, 0.96)
      .setStrokeStyle(3, 0x0e1a33)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width / 2, height / 2 + 90, "VOLTAR A ENTRAR", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "20px",
        color: "#0e1a33",
      })
      .setOrigin(0.5);
    bg.on("pointerdown", () => this.scene.restart());
    audio.musicEnabled = false;
    try {
      window.close();
    } catch {
      /* browsers bloqueiam fechar separadores por código */
    }
  }

  private go(panel: Panel): void {
    this.panel = panel;
    this.render();
  }
}
