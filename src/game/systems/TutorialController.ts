import Phaser from "phaser";
import { BALANCE } from "../config/BalanceConfig";
import { FONT, HEX } from "../config/GameConfig";
import type { GameScene } from "../scenes/GameScene";
import type { Passenger } from "../entities/Passenger";
import type { Taxi } from "../entities/Taxi";
import { PassengerState } from "../types";
import { audio } from "./AudioManager";

/** Etapas guiadas do tutorial — o nível 1 corre sempre com os sistemas reais. */
export enum TutorialStep {
  INTRO = "INTRO",
  MOVE = "MOVE",
  FIND_PASSENGER = "FIND_PASSENGER",
  CALL = "CALL",
  CONVINCE = "CONVINCE",
  TAKE_TO_TAXI = "TAKE_TO_TAXI",
  SCORE = "SCORE",
  RUN = "RUN",
  ENERGY = "ENERGY",
  OBJECTIVES = "OBJECTIVES",
  TIMER = "TIMER",
  FREE_PLAY = "FREE_PLAY",
}

/** Alvo do HUD a destacar em cada etapa. */
export type TutorialHudTarget =
  | "joystick"
  | "call"
  | "interact"
  | "run"
  | "energy"
  | "objectives"
  | "money"
  | "timer"
  | null;

export interface TutorialStepInfo {
  message: string;
  hudTarget: TutorialHudTarget;
}

export const TUTORIAL_STEPS: Record<TutorialStep, TutorialStepInfo> = {
  [TutorialStep.INTRO]: { message: "", hudTarget: null },
  [TutorialStep.MOVE]: { message: "Usa o joystick para te mover.", hudTarget: "joystick" },
  [TutorialStep.FIND_PASSENGER]: { message: "Aproxima-te do passageiro.", hudTarget: null },
  [TutorialStep.CALL]: { message: "Toca em CHAMAR.", hudTarget: "call" },
  [TutorialStep.CONVINCE]: { message: "Toca em E para convencer.", hudTarget: "interact" },
  [TutorialStep.TAKE_TO_TAXI]: { message: "Leva o passageiro até ao táxi.", hudTarget: null },
  [TutorialStep.SCORE]: { message: "Aqui vês os teus ganhos.", hudTarget: "money" },
  [TutorialStep.RUN]: { message: "Experimenta CORRER.", hudTarget: "run" },
  [TutorialStep.ENERGY]: { message: "Correr gasta energia.", hudTarget: "energy" },
  [TutorialStep.OBJECTIVES]: { message: "Consulta aqui os objetivos.", hudTarget: "objectives" },
  [TutorialStep.TIMER]: { message: "Completa tudo antes do tempo acabar.", hudTarget: "timer" },
  [TutorialStep.FREE_PLAY]: { message: "Completa os objetivos para vencer!", hudTarget: null },
};

/**
 * TutorialController — máquina de estados do tutorial.
 * Só decide etapa, mensagem e destaque; toda a lógica de jogo
 * (movimento, chamada, convencer, embarque, energia) continua
 * nos sistemas existentes. As etapas só avançam com ações reais,
 * exceto as puramente informativas (SCORE, ENERGY, TIMER).
 */
export class TutorialController extends Phaser.Events.EventEmitter {
  step = TutorialStep.INTRO;
  focusPassenger: Passenger | null = null;
  focusTaxi: Taxi | null = null;

  private static readonly INFO_DURATION = 4000;
  private static readonly MOVE_MIN_DISTANCE = 90;

  private movedDistance = 0;
  private lastX = 0;
  private lastY = 0;
  private infoTimer = 0;
  private freePlayHintUntil = 0;
  private passengerMarker: Phaser.GameObjects.Container;
  private taxiMarker: Phaser.GameObjects.Container;

  constructor(private readonly game: GameScene) {
    super();
    this.lastX = game.player.x;
    this.lastY = game.player.y;
    this.passengerMarker = this.buildMarker();
    this.taxiMarker = this.buildMarker();
  }

  /** A dica de jogo livre desaparece após alguns segundos. */
  get showHint(): boolean {
    return this.game.time.now < this.freePlayHintUntil;
  }

  /** Chamado pelo botão COMEÇAR do painel de introdução. */
  begin(): void {
    if (this.step !== TutorialStep.INTRO) return;
    this.setStep(TutorialStep.MOVE);
  }

  tick(delta: number): void {
    const player = this.game.player;
    switch (this.step) {
      case TutorialStep.MOVE: {
        this.movedDistance += Phaser.Math.Distance.Between(this.lastX, this.lastY, player.x, player.y);
        if (this.movedDistance > TutorialController.MOVE_MIN_DISTANCE) {
          this.setStep(TutorialStep.FIND_PASSENGER);
        }
        break;
      }
      case TutorialStep.FIND_PASSENGER: {
        const p = this.ensurePassenger();
        if (p && Phaser.Math.Distance.Between(player.x, player.y, p.x, p.y) < BALANCE.interactRadius * 1.4) {
          this.setStep(TutorialStep.CALL);
        }
        break;
      }
      case TutorialStep.CALL: {
        const p = this.focusPassenger;
        if (this.passengerLost(p)) {
          this.ensurePassenger();
          break;
        }
        if (p && p.state !== PassengerState.WAITING && p.state !== PassengerState.SPAWNING) {
          this.setStep(TutorialStep.CONVINCE);
        }
        break;
      }
      case TutorialStep.CONVINCE: {
        const follower = this.game.spawns.passengers.find(
          (cand) =>
            cand.active &&
            (cand.state === PassengerState.FOLLOWING || cand.state === PassengerState.BOARDING),
        );
        if (follower) {
          this.focusPassenger = follower;
          this.setStep(TutorialStep.TAKE_TO_TAXI);
          break;
        }
        if (this.passengerLost(this.focusPassenger)) this.resetToFind();
        break;
      }
      case TutorialStep.TAKE_TO_TAXI: {
        const p = this.focusPassenger;
        if (!p || !p.active) {
          this.resetToFind();
          break;
        }
        if (p.state === PassengerState.BOARDING || p.state === PassengerState.COMPLETED) {
          this.focusTaxi = null;
          this.setStep(TutorialStep.SCORE);
          break;
        }
        if (p.state === PassengerState.LEAVING) {
          this.resetToFind();
          break;
        }
        const target = p.targetTaxi;
        this.focusTaxi = target?.isLoadable ? target : this.nearestTaxi(p.destination);
        break;
      }
      case TutorialStep.SCORE: {
        this.infoTimer += delta;
        if (this.infoTimer >= TutorialController.INFO_DURATION) this.setStep(TutorialStep.RUN);
        break;
      }
      case TutorialStep.RUN: {
        if (player.isRunning) this.setStep(TutorialStep.ENERGY);
        break;
      }
      case TutorialStep.ENERGY: {
        this.infoTimer += delta;
        if (this.infoTimer >= TutorialController.INFO_DURATION) this.setStep(TutorialStep.OBJECTIVES);
        break;
      }
      case TutorialStep.OBJECTIVES: {
        if (this.game.registry.get("objectivesOpen") === true) this.setStep(TutorialStep.TIMER);
        break;
      }
      case TutorialStep.TIMER: {
        this.infoTimer += delta;
        if (this.infoTimer >= TutorialController.INFO_DURATION) this.setStep(TutorialStep.FREE_PLAY);
        break;
      }
      default:
        break;
    }
    this.lastX = player.x;
    this.lastY = player.y;
    this.updateMarkers();
  }

  private setStep(step: TutorialStep): void {
    this.step = step;
    this.infoTimer = 0;
    this.movedDistance = 0;
    if (step === TutorialStep.FREE_PLAY) {
      this.freePlayHintUntil = this.game.time.now + 6000;
      this.game.floatText(this.game.player.x, this.game.player.y - 84, "Boa! Já sabes jogar.", HEX.green);
    } else if (step !== TutorialStep.INTRO) {
      this.game.floatText(this.game.player.x, this.game.player.y - 84, "Boa!", HEX.green);
    }
    audio.ui();
    this.emit("step-changed", step);
  }

  private resetToFind(): void {
    this.focusPassenger = null;
    this.focusTaxi = null;
    this.setStep(TutorialStep.FIND_PASSENGER);
  }

  private ensurePassenger(): Passenger | null {
    const p = this.focusPassenger;
    if (p && p.active && p.isAvailable) return p;
    this.focusPassenger = this.nearestAvailablePassenger();
    return this.focusPassenger;
  }

  private nearestAvailablePassenger(): Passenger | null {
    let best: Passenger | null = null;
    let bestDist = Infinity;
    for (const cand of this.game.spawns.passengers) {
      if (!cand.active || !cand.isAvailable) continue;
      const d = Phaser.Math.Distance.Between(this.game.player.x, this.game.player.y, cand.x, cand.y);
      if (d < bestDist) {
        bestDist = d;
        best = cand;
      }
    }
    return best;
  }

  private nearestTaxi(destination: Passenger["destination"]): Taxi | null {
    let best: Taxi | null = null;
    let bestDist = Infinity;
    for (const t of this.game.spawns.taxis) {
      if (!t.isLoadable) continue;
      const d = Phaser.Math.Distance.Between(this.game.player.x, this.game.player.y, t.x, t.y);
      const score = d + (t.destination === destination ? 0 : 10000);
      if (score < bestDist) {
        bestDist = score;
        best = t;
      }
    }
    return best;
  }

  private passengerLost(p: Passenger | null): boolean {
    return !p || !p.active || p.state === PassengerState.LEAVING;
  }

  /** Marcador pulsante (círculo + seta) sobre entidades do mundo real. */
  private buildMarker(): Phaser.GameObjects.Container {
    const ring = this.game.add.circle(0, 0, 34, 0x000000, 0).setStrokeStyle(3, 0xffc31f, 0.95);
    const arrow = this.game.add
      .text(0, -54, "▼", { fontFamily: FONT.display, fontSize: "20px", color: HEX.yellow })
      .setOrigin(0.5);
    const container = this.game.add.container(0, 0, [ring, arrow]).setDepth(150000).setVisible(false);
    this.game.tweens.add({
      targets: ring,
      scale: 1.14,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.game.tweens.add({
      targets: arrow,
      y: -64,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    return container;
  }

  private updateMarkers(): void {
    const p = this.focusPassenger;
    const showPassenger =
      (this.step === TutorialStep.FIND_PASSENGER ||
        this.step === TutorialStep.CALL ||
        this.step === TutorialStep.CONVINCE) &&
      p?.active === true;
    this.passengerMarker.setVisible(showPassenger);
    if (showPassenger && p) this.passengerMarker.setPosition(p.x, p.y - 22);

    const t = this.focusTaxi;
    const showTaxi = this.step === TutorialStep.TAKE_TO_TAXI && t?.isLoadable === true;
    this.taxiMarker.setVisible(showTaxi);
    if (showTaxi && t) {
      const bp = t.boardPoint;
      this.taxiMarker.setPosition(bp.x, bp.y);
    }
  }
}
