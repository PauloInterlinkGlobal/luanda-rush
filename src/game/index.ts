import Phaser from "phaser";
import { GAME_CONFIG } from "./config/GameConfig";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { HUDScene } from "./scenes/HUDScene";
import { ResultScene } from "./scenes/ResultScene";
import { CharacterScene } from "./scenes/CharacterScene";
import { PauseScene } from "./scenes/PauseScene";

/** Cria a instância Phaser dentro do contentor indicado (apenas no browser). */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    // O contentor é full-bleed; RESIZE evita letterbox em qualquer proporção.
    width: "100%",
    height: "100%",
    backgroundColor: GAME_CONFIG.backgroundColor,
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.RESIZE,
      parent,
      width: "100%",
      height: "100%",
      autoCenter: Phaser.Scale.NO_CENTER,
    },
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: 0 }, debug: GAME_CONFIG.physicsDebug },
    },
    scene: [BootScene, MenuScene, CharacterScene, GameScene, HUDScene, PauseScene, ResultScene],
  });
}
