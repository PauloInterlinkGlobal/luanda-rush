import Phaser from "phaser";
import { HEX } from "../config/GameConfig";
import { PALETTE, DEFAULT_CHARACTER } from "../config/AssetConfig";
import { SaveManager } from "../systems/SaveManager";
import { AssetManager } from "../systems/AssetManager";
import { audio } from "../systems/AudioManager";
import type { CharacterSkin } from "../types";

type AnimName = "idle" | "walk" | "run" | "interact" | "celebrate" | "tired";
const ANIMS: { key: AnimName; label: string }[] = [
  { key: "idle", label: "PARADO" },
  { key: "walk", label: "ANDAR" },
  { key: "run", label: "CORRER" },
  { key: "interact", label: "CHAMAR" },
  { key: "celebrate", label: "COMEMORAR" },
  { key: "tired", label: "CANSADO" },
];
const DIRS = ["down", "right", "up"] as const;
const DIR_LABEL: Record<string, string> = { down: "FRENTE", right: "LADO", up: "COSTAS" };
const ACCESSORIES: NonNullable<CharacterSkin["accessory"]>[] = ["cap", "hat", "bag", "none"];
const ACC_LABEL: Record<string, string> = {
  cap: "BONÉ",
  hat: "CHAPÉU",
  bag: "MOCHILA",
  none: "NENHUM",
};

/** Ecrã dedicado à personalização da aparência e pré-visualização de animações. */
export class CharacterScene extends Phaser.Scene {
  private skin!: CharacterSkin;
  private playerName = "Lotador";
  private anim: AnimName = "idle";
  private dirIndex = 0;
  private preview!: Phaser.GameObjects.Sprite;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super("Character");
  }

  create(): void {
    const save = SaveManager.load();
    this.skin = { ...DEFAULT_CHARACTER, ...save.character };
    this.playerName = save.playerName || "Lotador";
    this.anim = "idle";
    this.dirIndex = 0;

    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0e1a33).setOrigin(0);
    this.add
      .text(width / 2, 34, "PERSONAGEM", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "40px",
        color: HEX.yellow,
      })
      .setOrigin(0.5);

    // Palco do preview
    this.add.rectangle(250, 300, 330, 380, 0x16305c, 0.9).setStrokeStyle(3, 0xffc31f);
    this.add.ellipse(250, 430, 150, 34, 0x000000, 0.28);
    this.preview = this.add.sprite(250, 340, "player").setScale(4);

    this.layer = this.add.container(0, 0);
    this.rebuild();
    this.render();

    this.input.keyboard?.on("keydown-ESC", () => this.exit());
  }

  /** Reconstrói a textura do jogador com a aparência actual. */
  private rebuild(): void {
    this.preview.anims.stop();
    this.preview.setTexture("__MISSING");
    AssetManager.rebuildPlayer(this, this.skin);
    this.preview.setTexture("player", 0);
    this.playPreview();
  }

  private playPreview(): void {
    const dir = DIRS[this.dirIndex] ?? "down";
    const key = `player-${this.anim}-${dir}`;
    if (this.anims.exists(key)) this.preview.play({ key, repeat: -1 }, true);
  }

  private text(
    x: number,
    y: number,
    value: string,
    size: number,
    color: string,
    origin = 0.5,
  ): Phaser.GameObjects.Text {
    const t = this.add
      .text(x, y, value, { fontFamily: "'Trebuchet MS', sans-serif", fontSize: `${size}px`, color })
      .setOrigin(origin, 0.5);
    this.layer.add(t);
    return t;
  }

  /** Linha com setas ‹ › e valor ao centro. */
  private row(y: number, label: string, value: string, onStep: (d: number) => void): void {
    const x = 610;
    this.text(x - 130, y, label, 15, HEX.muted, 0);
    const box = this.add.rectangle(x + 90, y, 250, 34, 0x16305c, 0.9).setStrokeStyle(2, 0x2b5fae);
    this.layer.add(box);
    this.text(x + 90, y, value, 16, HEX.white);
    const arrow = (ax: number, dir: number) => {
      const a = this.add
        .text(ax, y, dir < 0 ? "‹" : "›", {
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: "30px",
          color: HEX.yellow,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      a.on("pointerdown", () => {
        audio.ui();
        onStep(dir);
      });
      a.on("pointerover", () => a.setScale(1.2));
      a.on("pointerout", () => a.setScale(1));
      this.layer.add(a);
    };
    arrow(x - 20, -1);
    arrow(x + 200, 1);
  }

  private button(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    w = 200,
    primary = false,
  ): void {
    const bg = this.add
      .rectangle(x, y, w, 44, primary ? 0xffc31f : 0x16305c, 0.96)
      .setStrokeStyle(3, primary ? 0x0e1a33 : 0x2b5fae)
      .setInteractive({ useHandCursor: true });
    const t = this.add
      .text(x, y, label, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "19px",
        color: primary ? "#0e1a33" : HEX.white,
      })
      .setOrigin(0.5);
    bg.on("pointerover", () => bg.setScale(1.04));
    bg.on("pointerout", () => bg.setScale(1));
    bg.on("pointerdown", () => {
      audio.ui();
      onClick();
    });
    this.layer.add([bg, t]);
  }

  private step(key: "shirt" | "pants" | "shoes" | "skin" | "hair", list: number[], d: number): void {
    const next = ((this.skin[key] + d) % list.length + list.length) % list.length;
    this.skin = { ...this.skin, [key]: next, useCustomColors: true };
    this.rebuild();
    this.render();
  }

  private render(): void {
    this.layer.removeAll(true);
    const { width, height } = this.scale;
    const classic = this.skin.style === "classic";

    // Nome
    this.text(250, 130, this.playerName.toUpperCase(), 24, HEX.gold);
    this.button(
      250,
      508,
      "MUDAR NOME",
      () => {
        const name = window.prompt("Nome do lotador:", this.playerName);
        if (name && name.trim()) {
          this.playerName = name.trim().slice(0, 16);
          this.render();
        }
      },
      170,
    );

    // Animações
    this.text(610, 92, "ANIMAÇÃO", 14, HEX.muted, 0.5);
    ANIMS.forEach((a, i) => {
      const x = 470 + (i % 3) * 140;
      const y = 118 + Math.floor(i / 3) * 38;
      const active = this.anim === a.key;
      const bg = this.add
        .rectangle(x, y, 130, 30, active ? 0xffc31f : 0x16305c, 0.95)
        .setStrokeStyle(2, 0x2b5fae)
        .setInteractive({ useHandCursor: true });
      const t = this.add
        .text(x, y, a.label, {
          fontFamily: "'Trebuchet MS', sans-serif",
          fontSize: "13px",
          color: active ? "#0e1a33" : HEX.white,
        })
        .setOrigin(0.5);
      bg.on("pointerdown", () => {
        audio.ui();
        this.anim = a.key;
        this.playPreview();
        this.render();
      });
      this.layer.add([bg, t]);
    });

    // Opções
    let y = 198;
    const gap = 34;
    this.row(y, "DIRECÇÃO", DIR_LABEL[DIRS[this.dirIndex] ?? "down"] ?? "", (d) => {
      this.dirIndex = (this.dirIndex + d + DIRS.length) % DIRS.length;
      this.playPreview();
      this.render();
    });
    y += gap;
    this.row(y, "GÉNERO", this.skin.female ? "LOTADORA" : "LOTADOR", () => {
      this.skin = { ...this.skin, female: !this.skin.female };
      this.rebuild();
      this.render();
    });
    y += gap;
    this.row(y, "ESTILO", classic ? "CLÁSSICO" : "REAL", () => {
      this.skin = { ...this.skin, style: classic ? "atlas" : "classic" };
      this.rebuild();
      this.render();
    });
    y += gap;
    this.row(y, "CAMISOLA", `COR ${this.skin.shirt + 1}`, (d) =>
      this.step("shirt", PALETTE.shirts, d),
    );
    y += gap;
    this.row(y, "CALÇAS", `COR ${this.skin.pants + 1}`, (d) => this.step("pants", PALETTE.pants, d));
    y += gap;
    this.row(y, "SAPATOS", `COR ${this.skin.shoes + 1}`, (d) => this.step("shoes", PALETTE.shoes, d));
    y += gap;
    if (classic) {
      this.row(y, "PELE", `TOM ${this.skin.skin + 1}`, (d) => this.step("skin", PALETTE.skins, d));
      y += gap;
      this.row(y, "CABELO", `COR ${this.skin.hair + 1}`, (d) => this.step("hair", PALETTE.hair, d));
      y += gap;
    }
    this.row(y, "ACESSÓRIO", ACC_LABEL[this.skin.accessory ?? "none"] ?? "", (d) => {
      const i = ACCESSORIES.indexOf(this.skin.accessory ?? "none");
      const next = ACCESSORIES[(i + d + ACCESSORIES.length) % ACCESSORIES.length]!;
      this.skin = { ...this.skin, accessory: next, useCustomColors: true };
      this.rebuild();
      this.render();
    });

    this.text(
      250,
      455,
      classic ? "Estilo CLÁSSICO: cores todas livres." : "Estilo REAL: sprites do jogo com as tuas cores.",
      12,
      HEX.muted,
    );

    this.button(480, height - 32, "PREDEFINIÇÃO", () => {
      this.skin = { ...DEFAULT_CHARACTER };
      this.rebuild();
      this.render();
    }, 190);
    this.button(740, height - 32, "GUARDAR E VOLTAR", () => this.exit(true), 230, true);
    this.button(width - 70, 34, "VOLTAR", () => this.exit(), 110);
  }

  private exit(save = false): void {
    if (save) {
      SaveManager.update({ character: this.skin, playerName: this.playerName });
    } else {
      const stored = SaveManager.load();
      AssetManager.rebuildPlayer(this, stored.character);
    }
    this.scene.start("Menu");
  }
}
