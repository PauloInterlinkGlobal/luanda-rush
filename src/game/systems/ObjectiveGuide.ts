import Phaser from "phaser";
import { FONT, HEX } from "../config/GameConfig";
import type { GameScene } from "../scenes/GameScene";
import type { Passenger } from "../entities/Passenger";
import type { Taxi } from "../entities/Taxi";
import { PassengerState } from "../types";

/**
 * Waypoints fora do tutorial: marca o melhor passageiro livre
 * ou o táxi do passageiro que o jogador está a levar.
 * Reutiliza o visual dos marcadores do TutorialController.
 */
export class ObjectiveGuide {
  private passengerMarker: Phaser.GameObjects.Container;
  private taxiMarker: Phaser.GameObjects.Container;
  private edgeArrow: Phaser.GameObjects.Text;
  private focusPassenger: Passenger | null = null;
  private focusTaxi: Taxi | null = null;

  constructor(private readonly game: GameScene) {
    this.passengerMarker = this.buildMarker();
    this.taxiMarker = this.buildMarker();
    this.edgeArrow = game.add
      .text(0, 0, "▼", {
        fontFamily: FONT.display,
        fontSize: "22px",
        color: HEX.yellow,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(250000)
      .setVisible(false)
      .setStroke("#0e1a33", 4);
  }

  tick(): void {
    // Tutorial tem os próprios marcadores
    if (this.game.tutorialMode && this.game.tutorialCtl) {
      this.hideAll();
      return;
    }

    const player = this.game.player;
    if (!player) {
      this.hideAll();
      return;
    }

    // 1) Se o jogador já leva um passageiro → marca o táxi
    const following = this.game.spawns.passengers.find(
      (p) =>
        p.active &&
        p.follower === player &&
        (p.state === PassengerState.FOLLOWING || p.state === PassengerState.ACCEPTED),
    );

    if (following) {
      this.focusPassenger = following;
      const taxi =
        following.targetTaxi?.isLoadable
          ? following.targetTaxi
          : this.nearestCompatibleTaxi(following);
      this.focusTaxi = taxi;
      this.passengerMarker.setVisible(false);
      if (taxi) {
        const bp = taxi.boardPoint;
        this.taxiMarker.setVisible(true).setPosition(bp.x, bp.y);
        this.updateEdgeArrow(bp.x, bp.y);
      } else {
        this.taxiMarker.setVisible(false);
        this.edgeArrow.setVisible(false);
      }
      return;
    }

    // 2) Caso contrário → melhor passageiro disponível com táxi compatível
    this.focusTaxi = null;
    this.taxiMarker.setVisible(false);
    const target = this.bestPassenger();
    this.focusPassenger = target;
    if (target) {
      this.passengerMarker.setVisible(true).setPosition(target.x, target.y - 22);
      this.updateEdgeArrow(target.x, target.y - 22);
    } else {
      this.passengerMarker.setVisible(false);
      this.edgeArrow.setVisible(false);
    }
  }

  destroy(): void {
    this.passengerMarker.destroy();
    this.taxiMarker.destroy();
    this.edgeArrow.destroy();
  }

  private hideAll(): void {
    this.passengerMarker.setVisible(false);
    this.taxiMarker.setVisible(false);
    this.edgeArrow.setVisible(false);
  }

  private bestPassenger(): Passenger | null {
    let best: Passenger | null = null;
    let bestScore = -Infinity;
    const player = this.game.player;
    for (const p of this.game.spawns.passengers) {
      if (!p.active || !p.isAvailable) continue;
      if (!this.nearestCompatibleTaxi(p)) continue;
      const dist = Phaser.Math.Distance.Between(player.x, player.y, p.x, p.y);
      const score = p.value / (dist + 40) + p.def.urgency * 8 - (1 - p.patienceRatio) * 20;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  }

  private nearestCompatibleTaxi(p: Passenger): Taxi | null {
    const options = this.game.spawns.taxis.filter(
      (t) => t.isLoadable && t.destination === p.destination,
    );
    if (options.length === 0) return null;
    options.sort(
      (a, b) =>
        Phaser.Math.Distance.Between(p.x, p.y, a.x, a.y) -
        Phaser.Math.Distance.Between(p.x, p.y, b.x, b.y),
    );
    return options[0] ?? null;
  }

  /** Seta na borda do ecrã quando o alvo está fora da vista da câmara. */
  private updateEdgeArrow(worldX: number, worldY: number): void {
    const cam = this.game.cameras.main;
    const view = cam.worldView;
    const pad = 36;
    const inside =
      worldX > view.x + pad &&
      worldX < view.x + view.width - pad &&
      worldY > view.y + pad &&
      worldY < view.y + view.height - pad;
    if (inside) {
      this.edgeArrow.setVisible(false);
      return;
    }
    const cx = view.centerX;
    const cy = view.centerY;
    const dx = worldX - cx;
    const dy = worldY - cy;
    const ang = Math.atan2(dy, dx);
    const margin = 40;
    const halfW = view.width / 2 - margin;
    const halfH = view.height / 2 - margin;
    const tx = Math.cos(ang);
    const ty = Math.sin(ang);
    const scale = Math.min(
      Math.abs(tx) > 0.001 ? halfW / Math.abs(tx) : Infinity,
      Math.abs(ty) > 0.001 ? halfH / Math.abs(ty) : Infinity,
    );
    const wx = cx + tx * scale;
    const wy = cy + ty * scale;
    // world → ecrã (overlay com scrollFactor 0)
    const sx = (wx - cam.worldView.x) * cam.zoom;
    const sy = (wy - cam.worldView.y) * cam.zoom;
    this.edgeArrow
      .setVisible(true)
      .setPosition(sx, sy)
      .setRotation(ang + Math.PI / 2);
  }

  private buildMarker(): Phaser.GameObjects.Container {
    const ring = this.game.add.circle(0, 0, 30, 0x000000, 0).setStrokeStyle(3, 0xffc31f, 0.9);
    const arrow = this.game.add
      .text(0, -48, "▼", { fontFamily: FONT.display, fontSize: "18px", color: HEX.yellow })
      .setOrigin(0.5);
    const container = this.game.add.container(0, 0, [ring, arrow]).setDepth(150000).setVisible(false);
    this.game.tweens.add({
      targets: ring,
      scale: 1.12,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.game.tweens.add({
      targets: arrow,
      y: -56,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    return container;
  }
}

/** Destaca táxis com o mesmo destino do passageiro que o jogador leva. */
export function highlightMatchingTaxis(game: GameScene): void {
  const player = game.player;
  const following = game.spawns.passengers.find(
    (p) => p.active && p.follower === player && p.state === PassengerState.FOLLOWING,
  );
  const dest = following?.destination;
  for (const t of game.spawns.taxis) {
    if (!t.active) continue;
    if (dest && t.isLoadable && t.destination === dest) {
      t.setTint(0xffe08a);
    } else {
      t.clearTint();
    }
  }
}
