import Phaser from "phaser";
import { HEX } from "../config/GameConfig";
import { SaveManager, levelTitle, xpForLevel } from "../systems/SaveManager";
import { audio } from "../systems/AudioManager";
import { MISSIONS } from "../data/missions";
import { MAP_CONFIG } from "../config/MapConfig";
import { AssetManager } from "../systems/AssetManager";

type Panel = "MENU" | "MISSOES" | "DEFINICOES" | "SAIDA";

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
      this.button(226, "JOGAR", () => this.scene.start("Game"), true);
      this.button(292, "MISSÕES", () => this.go("MISSOES"));
      this.button(344, "PERSONAGEM", () => this.scene.start("Character"));
      this.button(396, "DEFINIÇÕES", () => this.go("DEFINICOES"));
      this.button(448, "SAIR DO JOGO", () => this.go("SAIDA"));
      this.label(width / 2, height - 26, "WASD mover · SHIFT correr · E interagir · ESPAÇO chamar · Q power-up", 13, HEX.muted);
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
  private quitGame(): void {
    const { width, height } = this.scale;
    this.layer.removeAll(true);
    this.children.each((c) => c.setVisible?.(false));
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
