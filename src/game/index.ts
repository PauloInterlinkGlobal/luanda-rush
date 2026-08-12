import Phaser from "phaser";
import { GAME_CONFIG } from "./config/GameConfig";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { HUDScene } from "./scenes/HUDScene";
import { ResultScene } from "./scenes/ResultScene";

/** Cria a instância Phaser dentro do contentor indicado (apenas no browser). */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    backgroundColor: GAME_CONFIG.backgroundColor,
    pixelArt: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: 0 }, debug: GAME_CONFIG.physicsDebug },
    },
    scene: [BootScene, MenuScene, GameScene, HUDScene, ResultScene],
  });
}
