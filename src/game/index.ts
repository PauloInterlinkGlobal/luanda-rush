import Phaser from "phaser";
import { GAME_CONFIG } from "./config/GameConfig";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { HUDScene } from "./scenes/HUDScene";
import { ResultScene } from "./scenes/ResultScene";
import { CharacterScene } from "./scenes/CharacterScene";
import { PauseScene } from "./scenes/PauseScene";
import { LevelSelectScene } from "./scenes/LevelSelectScene";

/** Cria a instância Phaser dentro do contentor indicado (apenas no browser). */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    // O jogo usa apenas sprites e gráficos 2D; Canvas evita framebuffers WebGL
    // incompletos em previews/iframes onde o viewport pode iniciar em 0px.
    // Nunca usar AUTO/WebGL: o preview pode expor um contexto WebGL com
    // framebuffer incompleto durante a criação do canvas.
    type: Phaser.CANVAS,
    parent,
    // O contentor é full-bleed; RESIZE evita letterbox em qualquer proporção.
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    backgroundColor: GAME_CONFIG.backgroundColor,
    pixelArt: false,
    scale: {
      // RESIZE: o canvas assume exactamente a largura/altura úteis do
      // dispositivo. Nunca há letterbox nem esticamento não uniforme —
      // a adaptação é feita por escala uniforme dentro de cada cena.
      mode: Phaser.Scale.RESIZE,
      parent,
      width: "100%",
      height: "100%",
      autoCenter: Phaser.Scale.NO_CENTER,
      expandParent: true,
      autoRound: true,
    },
    // Acompanha barras móveis do browser e mudanças de orientação sem recarregar.
    disableContextMenu: true,
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: 0 }, debug: GAME_CONFIG.physicsDebug },
    },
    scene: [
      BootScene,
      MenuScene,
      LevelSelectScene,
      CharacterScene,
      GameScene,
      HUDScene,
      PauseScene,
      ResultScene,
    ],
  });
}
