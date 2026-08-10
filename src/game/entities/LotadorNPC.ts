import Phaser from "phaser";
import { Character } from "./Character";
import { LotadorAI, type AIProfile, type AIWorld } from "../ai/LotadorAI";
import { BALANCE } from "../config/BalanceConfig";
import { HEX } from "../config/GameConfig";

export const NPC_PROFILES: Record<string, { name: string; profile: AIProfile }> = {
  npc_kito: { name: 'KITO "RELÂMPAGO"', profile: { speed: 1.25, strategy: 1.0, persuasion: 1.0 } },
  npc_manuel: { name: 'MANUEL "VETERANO"', profile: { speed: 1.0, strategy: 1.3, persuasion: 1.0 } },
  npc_debora: { name: "DÉBORA", profile: { speed: 1.05, strategy: 1.05, persuasion: 1.25 } },
};

/** Lotador NPC — concorrente directo do jogador. */
export class LotadorNPC extends Character {
  readonly ai: LotadorAI;
  readonly npcName: string;
  private tag: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    sheetKey: string,
    world: AIWorld,
    profileOverride?: AIProfile,
  ) {
    super(scene, x, y, sheetKey);
    const entry = NPC_PROFILES[sheetKey];
    this.npcName = entry?.name ?? "LOTADOR";
    this.ai = new LotadorAI(this, profileOverride ?? entry?.profile ?? {
      speed: 1,
      strategy: 1,
      persuasion: 1,
    }, world);
    this.setDepth(y);
    this.tag = scene.add
      .text(x, y - 44, this.npcName.split(" ")[0] ?? "", {
        fontFamily: "'Trebuchet MS', sans-serif",
        fontSize: "11px",
        color: HEX.muted,
      })
      .setOrigin(0.5)
      .setDepth(100000);
  }

  tick(delta: number): void {
    this.ai.update(delta, BALANCE.npcBaseSpeed, BALANCE.interactRadius, delta > 0 ? 1 : 1);
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    const vx = body?.velocity.x ?? 0;
    const vy = body?.velocity.y ?? 0;
    this.updateAnimation(vx, vy, Math.hypot(vx, vy) > BALANCE.npcBaseSpeed * 1.05, false, delta);
    this.refreshDepth();
    this.tag.setPosition(this.x, this.y - 44);
  }

  override destroy(fromScene?: boolean): void {
    this.tag.destroy();
    super.destroy(fromScene);
  }
}
