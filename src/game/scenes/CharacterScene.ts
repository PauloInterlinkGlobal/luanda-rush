import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import { layoutOf, relayoutOnResize, type Layout } from "../systems/Responsive";
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
  private stage!: Phaser.GameObjects.Container;
  private L!: Layout;
  /** Colunas do layout (preview à esquerda, opções à direita). */
  private colL = 0;
  private colR = 0;

  constructor() {
    super("Character");
  }

  create(): void {
    const save = SaveManager.load();
    this.skin = { ...DEFAULT_CHARACTER, ...save.character };
    this.playerName = save.playerName || "Lotador";
    this.anim = "idle";
    this.dirIndex = 0;

    this.stage = this.add.container(0, 0);
    this.layer = this.add.container(0, 0);
    this.buildStage(layoutOf(this));
    this.rebuild();
    this.render();

    // Resize/rotação reconstroem o ecrã a partir do espaço disponível.
    relayoutOnResize(this, (l) => {
      this.buildStage(l);
      this.playPreview();
      this.render();
    });

    this.input.keyboard?.on("keydown-ESC", () => this.exit());
  }

  /** Palco + título: tudo proporcional ao espaço real (sem 960×540 fixo). */
  private buildStage(l: Layout): void {
    this.L = l;
    // Duas colunas em ecrãs largos; em ecrãs estreitos o preview encolhe.
    this.colL = l.left + l.innerWidth * 0.22;
    this.colR = l.left + l.innerWidth * 0.62;

    this.stage.removeAll(true);
    this.stage.add(this.add.rectangle(0, 0, l.width, l.height, 0x0e1a33).setOrigin(0));
    this.stage.add(
      this.add
        .text(l.cx, l.top + l.s(4), "PERSONAGEM", {
          fontFamily: FONT.display,
          fontSize: l.font(34),
          color: HEX.yellow,
        })
        .setOrigin(0.5, 0),
    );

    const stageW = Math.min(l.innerWidth * 0.36, l.s(330));
    const stageH = Math.min(l.innerHeight * 0.66, l.s(380));
    const stageY = l.top + l.s(52) + stageH / 2;
    this.stage.add(
      this.add
        .rectangle(this.colL, stageY, stageW, stageH, 0x16305c, 0.9)
        .setStrokeStyle(3, 0xffc31f),
    );
    this.stage.add(
      this.add.ellipse(this.colL, stageY + stageH * 0.34, stageW * 0.45, l.s(30), 0x000000, 0.28),
    );
    // Escala UNIFORME: a personagem nunca fica achatada nem alongada.
    const previewScale = Math.max(1.6, Math.min(4, (stageH / 120) * 1.05));
    if (this.preview?.active) {
      this.preview.setPosition(this.colL, stageY + stageH * 0.22).setScale(previewScale);
    } else {
      this.preview = this.add
        .sprite(this.colL, stageY + stageH * 0.22, "player")
        .setScale(previewScale);
    }
    this.preview.setDepth(5);
  }

  /** Reconstrói a textura do jogador com a aparência actual. */
  private rebuild(): void {
    this.preview.anims.stop();
    // A textura sentinela anterior não existe no TextureManager. Usar um
    // placeholder real impede que Phaser mantenha um Frame com source nulo
    // enquanto as animações do jogador são reconstruídas.
    const safeTexture = AssetManager.ensureTexture(this, "player_rebuild_placeholder");
    this.preview.setTexture(safeTexture, 0);
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
      .text(x, y, value, { fontFamily: FONT.body, fontSize: this.L.font(size), color })
      .setOrigin(origin, 0.5);
    this.layer.add(t);
    return t;
  }

  /** Linha com setas ‹ › e valor ao centro, largura derivada da coluna direita. */
  private row(y: number, label: string, value: string, onStep: (d: number) => void): void {
    const l = this.L;
    const colW = Math.min(l.right - this.colR + l.innerWidth * 0.1, l.s(420));
    const x = this.colR;
    const boxW = Math.min(colW * 0.52, l.s(230));
    const boxX = x + colW * 0.42;
    this.text(x - colW * 0.22, y, label, 14, HEX.muted, 0);
    const box = this.add
      .rectangle(boxX, y, boxW, Math.max(26, l.s(32)), 0x16305c, 0.9)
      .setStrokeStyle(2, 0x2b5fae);
    this.layer.add(box);
    this.text(boxX, y, value, 15, HEX.white);
    const arrow = (ax: number, dir: number) => {
      const a = this.add
        .text(ax, y, dir < 0 ? "‹" : "›", {
          fontFamily: FONT.display,
          fontSize: l.font(28),
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
    arrow(boxX - boxW / 2 - l.s(16), -1);
    arrow(boxX + boxW / 2 + l.s(16), 1);
  }

  private button(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    w = 200,
    primary = false,
  ): void {
    const l = this.L;
    const bw = Math.min(l.s(w), l.innerWidth * 0.42);
    const bg = this.add
      .rectangle(x, y, bw, Math.max(36, l.s(42)), primary ? 0xffc31f : 0x16305c, 0.96)
      .setStrokeStyle(3, primary ? 0x0e1a33 : 0x2b5fae)
      .setInteractive({ useHandCursor: true });
    const t = this.add
      .text(x, y, label, {
        fontFamily: FONT.display,
        fontSize: l.font(17),
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

  private step(
    key: "shirt" | "pants" | "shoes" | "skin" | "hair",
    list: number[],
    d: number,
  ): void {
    const next = (((this.skin[key] + d) % list.length) + list.length) % list.length;
    this.skin = { ...this.skin, [key]: next, useCustomColors: true };
    this.rebuild();
    this.render();
  }

  private render(): void {
    this.layer.removeAll(true);
    const l = this.L;
    const classic = this.skin.style === "classic";

    // Nome (por cima do palco do preview)
    this.text(this.colL, l.top + l.s(34), this.playerName.toUpperCase(), 22, HEX.gold);
    this.button(
      this.colL,
      l.bottom - l.s(58),
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
    this.text(
      this.colL,
      l.bottom - l.s(94),
      classic
        ? "Estilo CLÁSSICO: cores todas livres."
        : "Estilo REAL: sprites do jogo com as tuas cores.",
      11,
      HEX.muted,
    );

    // ----------------------------------------------- coluna direita (opções)
    const colW = Math.min(l.right - this.colR + l.innerWidth * 0.1, l.s(420));
    const animTop = l.top + l.s(34);
    this.text(this.colR + colW * 0.2, animTop, "ANIMAÇÃO", 13, HEX.muted, 0.5);

    const cols = 3;
    const chipW = Math.min(colW * 0.32, l.s(128));
    const chipH = Math.max(24, l.s(28));
    const chipX0 = this.colR - colW * 0.22 + chipW / 2;
    ANIMS.forEach((a, i) => {
      const x = chipX0 + (i % cols) * (chipW + l.s(6));
      const y = animTop + l.s(22) + Math.floor(i / cols) * (chipH + l.s(6));
      const active = this.anim === a.key;
      const bg = this.add
        .rectangle(x, y, chipW, chipH, active ? 0xffc31f : 0x16305c, 0.95)
        .setStrokeStyle(2, 0x2b5fae)
        .setInteractive({ useHandCursor: true });
      const t = this.add
        .text(x, y, a.label, {
          fontFamily: FONT.body,
          fontSize: l.font(12),
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

    // Linhas de opções: o espaço vertical restante é dividido pelas linhas
    // existentes, por isso nada fica cortado nem sobreposto em ecrãs baixos.
    const rows: [string, string, (d: number) => void][] = [
      [
        "DIRECÇÃO",
        DIR_LABEL[DIRS[this.dirIndex] ?? "down"] ?? "",
        (d) => {
          this.dirIndex = (this.dirIndex + d + DIRS.length) % DIRS.length;
          this.playPreview();
          this.render();
        },
      ],
      [
        "GÉNERO",
        this.skin.female ? "LOTADORA" : "LOTADOR",
        () => {
          this.skin = { ...this.skin, female: !this.skin.female };
          this.rebuild();
          this.render();
        },
      ],
      [
        "ESTILO",
        classic ? "CLÁSSICO" : "REAL",
        () => {
          this.skin = { ...this.skin, style: classic ? "atlas" : "classic" };
          this.rebuild();
          this.render();
        },
      ],
      ["CAMISOLA", `COR ${this.skin.shirt + 1}`, (d) => this.step("shirt", PALETTE.shirts, d)],
      ["CALÇAS", `COR ${this.skin.pants + 1}`, (d) => this.step("pants", PALETTE.pants, d)],
      ["SAPATOS", `COR ${this.skin.shoes + 1}`, (d) => this.step("shoes", PALETTE.shoes, d)],
    ];
    if (classic) {
      rows.push(["PELE", `TOM ${this.skin.skin + 1}`, (d) => this.step("skin", PALETTE.skins, d)]);
      rows.push(["CABELO", `COR ${this.skin.hair + 1}`, (d) => this.step("hair", PALETTE.hair, d)]);
    }
    rows.push([
      "ACESSÓRIO",
      ACC_LABEL[this.skin.accessory ?? "none"] ?? "",
      (d) => {
        const i = ACCESSORIES.indexOf(this.skin.accessory ?? "none");
        const next = ACCESSORIES[(i + d + ACCESSORIES.length) % ACCESSORIES.length]!;
        this.skin = { ...this.skin, accessory: next, useCustomColors: true };
        this.rebuild();
        this.render();
      },
    ]);

    const rowsTop = animTop + l.s(22) + Math.ceil(ANIMS.length / cols) * (chipH + l.s(6)) + l.s(10);
    const rowsBottom = l.bottom - l.s(58);
    const gap = Math.max(l.s(24), (rowsBottom - rowsTop) / rows.length);
    rows.forEach(([label, value, onStep], i) => {
      this.row(rowsTop + gap * (i + 0.5), label, value, onStep);
    });

    // ----------------------------------------------- rodapé e voltar
    const footY = l.bottom - l.s(18);
    this.button(
      this.colR - colW * 0.1,
      footY,
      "PREDEFINIÇÃO",
      () => {
        this.skin = { ...DEFAULT_CHARACTER };
        this.rebuild();
        this.render();
      },
      180,
    );
    this.button(
      this.colR + colW * 0.42,
      footY,
      "GUARDAR E VOLTAR",
      () => this.exit(true),
      220,
      true,
    );
    this.button(l.right - l.s(56), l.top + l.s(18), "VOLTAR", () => this.exit(), 105);
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
