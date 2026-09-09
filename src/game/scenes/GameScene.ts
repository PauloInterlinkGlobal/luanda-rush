import Phaser from "phaser";
import { COLORS, GAME_CONFIG, HEX } from "../config/GameConfig";
import { BALANCE } from "../config/BalanceConfig";
import { MAP_CONFIG } from "../config/MapConfig";
import { Player } from "../entities/Player";
import { Passenger } from "../entities/Passenger";
import { Taxi } from "../entities/Taxi";
import { LotadorNPC } from "../entities/LotadorNPC";
import { Pedestrian } from "../entities/Pedestrian";
import { AMBIENT_KEYS } from "../systems/AssetManager";
import { SpawnManager } from "../systems/SpawnManager";
import { ComboManager } from "../systems/ComboManager";
import { EconomyManager } from "../systems/EconomyManager";
import { MissionManager } from "../systems/MissionManager";
import { DifficultyManager } from "../systems/DifficultyManager";
import { PowerUpManager } from "../systems/PowerUpManager";
import { SaveManager } from "../systems/SaveManager";
import { audio } from "../systems/AudioManager";
import { PassengerState, PowerUpType, TaxiState, TaxiType, type SaveData } from "../types";

const NPC_SHEETS = ["npc_kito", "npc_manuel", "npc_debora"];

/** Cena principal: o turno de 3 minutos na paragem. */
export class GameScene extends Phaser.Scene {
  private save!: SaveData;
  player!: Player;
  npcs: LotadorNPC[] = [];
  pedestrians: Pedestrian[] = [];
  spawns!: SpawnManager;
  combo = new ComboManager();
  economy = new EconomyManager();
  missions!: MissionManager;
  difficulty!: DifficultyManager;
  powerUps = new PowerUpManager();

  timeLeft = BALANCE.matchDuration;
  rushUntil = 0;
  private rushTimer = 12;
  private paused = false;
  private ended = false;
  readonly tutorial = false;
  tutorialMode = false;
  private tutorialTimerStarted = false;
  tutorialStep = "MOVER";
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private callRing!: Phaser.GameObjects.Arc;

  constructor() {
    super("Game");
  }

  create(): void {
    this.ended = false;
    this.paused = false;
    this.timeLeft = BALANCE.matchDuration;
    this.tutorialMode = this.registry.get("tutorial") === true;
    this.paused = this.tutorialMode;
    this.tutorialTimerStarted = false;
    this.tutorialStep = "MOVER";
    this.combo.reset();
    this.economy.reset();
    this.powerUps.reset();

    this.save = SaveManager.load();
    audio.sfxEnabled = this.save.settings.sfx;
    audio.musicEnabled = this.save.settings.music;

    this.physics.world.setBounds(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);
    this.cameras.main.setBounds(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);
    this.cameras.main.setBackgroundColor(COLORS.night);
    this.add.image(0, 0, "ground").setOrigin(0).setDepth(0);

    this.buildProps();

    this.player = new Player(
      this,
      MAP_CONFIG.playerSpawn.x,
      MAP_CONFIG.playerSpawn.y,
      this.save,
    );
    this.player.on("footstep", () => audio.step());
    this.physics.add.collider(this.player, this.obstacles);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.callRing = this.add
      .circle(this.player.x, this.player.y, BALANCE.callRadius, 0xffc31f, 0.12)
      .setDepth(1)
      .setVisible(false);

    this.spawns = new SpawnManager(this);
    this.difficulty = new DifficultyManager(this.save.level);
    this.missions = new MissionManager({});
    this.missions.onComplete = (m) => {
      this.floatText(this.player.x, this.player.y - 70, `MISSÃO: ${m.label}`, HEX.gold);
      audio.reward();
    };

    if (!this.tutorialMode) this.spawnNpcs(this.difficulty.current.npcCount);
    this.spawnPedestrians();
    this.spawns.spawnTaxi(TaxiType.NORMAL);
    for (let i = 0; i < (this.tutorialMode ? 1 : 4 + this.save.stationLevel * 2); i++) {
      this.spawns.spawnPassenger();
    }

    this.setupInput();
    this.events.on("taxi-arrived", () => audio.horn());

    this.scene.launch("HUD");
    this.scene.bringToTop("HUD");
    audio.startMusic(false);
    audio.startAmbient();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      audio.stopMusic();
      audio.stopAmbient();
      this.spawns.clear();
      this.npcs.forEach((n) => n.destroy());
      this.npcs = [];
      this.pedestrians.forEach((p) => p.destroy());
      this.pedestrians = [];
    });
  }

  // ---------------------------------------------------------------- mapa
  private buildProps(): void {
    this.obstacles = this.physics.add.staticGroup();
    MAP_CONFIG.props.forEach(([kind, x, y]) => {
      const key = `prop_${kind}`;
      if (!this.textures.exists(key)) return;
      const sprite = this.physics.add.staticSprite(x, y, key);
      sprite.setOrigin(0.5, 1).setDepth(y);
      const w = sprite.width * 0.6;
      const h = Math.min(26, sprite.height * 0.3);
      sprite.body.setSize(w, h);
      sprite.body.setOffset((sprite.width - w) / 2, sprite.height - h);
      this.obstacles.add(sprite);
    });
  }

  /** Figurantes que passeiam pela paragem (sem interferir no jogo). */
  private spawnPedestrians(): void {
    const keys = AMBIENT_KEYS.filter((k) => this.textures.exists(k));
    if (keys.length === 0) return;
    MAP_CONFIG.ambientSpawns.forEach((spot, i) => {
      const key = keys[(i + Phaser.Math.Between(0, keys.length - 1)) % keys.length]!;
      const ped = new Pedestrian(this, spot.x, spot.y, key);
      this.physics.add.collider(ped, this.obstacles);
      this.pedestrians.push(ped);
    });
  }

  private spawnNpcs(count: number): void {
    const world = { passengers: this.spawns.passengers, taxis: this.spawns.taxis };
    for (let i = this.npcs.length; i < count; i++) {
      const spot = MAP_CONFIG.npcSpawns[i % MAP_CONFIG.npcSpawns.length]!;
      const sheet = NPC_SHEETS[i % NPC_SHEETS.length]!;
      const npc = new LotadorNPC(this, spot.x, spot.y, sheet, world);
      npc.on("npc-board", (p: Passenger, taxi: Taxi) => this.npcBoard(p, taxi));
      this.physics.add.collider(npc, this.obstacles);
      this.npcs.push(npc);
    }
  }

  // -------------------------------------------------------------- input
  private setupInput(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    this.keys = kb.addKeys(
      "W,A,S,D,UP,LEFT,DOWN,RIGHT,SHIFT,E,SPACE,Q,ESC",
    ) as Record<string, Phaser.Input.Keyboard.Key>;

    kb.on("keydown-E", () => this.interact());
    kb.on("keydown-SPACE", () => this.callPassengers());
    kb.on("keydown-Q", () => this.usePowerUp());
    kb.on("keydown-ESC", () => this.togglePause());

    if (GAME_CONFIG.debug) {
      kb.on("keydown-F1", () => this.spawns.spawnPassenger());
      kb.on("keydown-F2", () => this.spawns.spawnTaxi());
      kb.on("keydown-F3", () => this.spawnNpcs(this.npcs.length + 1));
      kb.on("keydown-F4", () => this.economy.addPassenger(500, 1));
      kb.on("keydown-F5", () => this.economy.addComboXp(5));
      kb.on("keydown-F6", () => this.startRush());
      kb.on("keydown-F7", () => (this.player.stamina = this.player.maxStamina));
    }

    // Controlos móveis (emitidos pelo HUD)
    const hud = this.scene.get("HUD");
    hud.events.on("hud-interact", () => this.interact());
    hud.events.on("hud-call", () => this.callPassengers());
    hud.events.on("hud-power", () => this.usePowerUp());
    hud.events.on("hud-pause", () => this.togglePause());
  }

  private get joystick(): { x: number; y: number; run: boolean } {
    return (this.registry.get("joystick") as { x: number; y: number; run: boolean }) ?? {
      x: 0,
      y: 0,
      run: false,
    };
  }

  togglePause(): void {
    this.paused = !this.paused;
    this.physics.world.isPaused = this.paused;
    this.events.emit("paused", this.paused);
  }

  // ---------------------------------------------------------- interacção
  private nearestPassenger(radius: number): Passenger | null {
    let best: Passenger | null = null;
    let bestDist = radius;
    for (const p of this.spawns.passengers) {
      if (!p.active || (!p.isAvailable && p.claimedBy !== this.player)) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return best;
  }

  private taxiFor(p: Passenger): Taxi | null {
    const options = this.spawns.taxis.filter(
      (t) => t.isLoadable && t.destination === p.destination,
    );
    options.sort(
      (a, b) =>
        Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y) -
        Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y),
    );
    return options[0] ?? null;
  }

  private interact(): void {
    if (this.paused || this.ended) return;
    const p = this.nearestPassenger(BALANCE.interactRadius * 1.4);
    if (!p) return;
    this.player.playOnce("interact", 260);
    const taxi = this.taxiFor(p);
    if (!taxi) {
      this.floatText(p.x, p.y - 60, "SEM TÁXI PARA " + p.destination, HEX.red);
      return;
    }
    const accepted = p.tryConvince(this.player, 420 * this.player.convinceBonus, 1);
    if (accepted) {
      p.startFollowing(taxi);
      audio.accept();
      this.floatText(p.x, p.y - 60, "BORA!", HEX.green);
    }
  }

  private callPassengers(): void {
    if (this.paused || this.ended) return;
    audio.call();
    this.player.playOnce("celebrate", 320);
    const r = this.player.callRadius;
    this.callRing.setRadius(r);
    this.callRing.setVisible(true).setAlpha(0.25);
    this.tweens.add({
      targets: this.callRing,
      alpha: 0,
      duration: 420,
      onComplete: () => this.callRing.setVisible(false),
    });
    let touched = 0;
    for (const p of this.spawns.passengers) {
      if (!p.isAvailable) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      if (d > r) continue;
      touched++;
      p.patience = Math.min(p.def.patience, p.patience + 4);
      p.state = PassengerState.SEARCHING;
      const angle = Math.atan2(this.player.y - p.y, this.player.x - p.x);
      p.setVelocity(Math.cos(angle) * p.def.speed, Math.sin(angle) * p.def.speed);
    }
    if (touched > 0) this.floatText(this.player.x, this.player.y - 60, `${touched} OUVIRAM!`, HEX.yellow);
  }

  private usePowerUp(): void {
    if (this.paused || this.ended) return;
    const type = this.powerUps.use(this.time.now);
    if (!type) return;
    audio.powerUp();
    if (type === PowerUpType.TURBO) this.player.activateTurbo();
    else this.player.activateMegaphone();
    this.floatText(this.player.x, this.player.y - 70, type, HEX.gold);
  }

  // ------------------------------------------------------------ embarque
  private boardPassenger(p: Passenger, taxi: Taxi, byPlayer: boolean): void {
    p.board();
    const full = taxi.addPassenger();
    if (byPlayer) {
      const gained = this.economy.addPassenger(p.value, this.combo.multiplier);
      this.floatText(taxi.x, taxi.y - 80, `+${gained} Kz`, HEX.gold);
      audio.reward();
    } else {
      this.economy.registerLoss();
      this.floatText(p.x, p.y - 60, "PASSAGEIRO PERDIDO!", HEX.red);
      audio.lost();
    }
    this.tweens.add({
      targets: p,
      x: taxi.x,
      y: taxi.y,
      alpha: 0,
      scale: 0.4,
      duration: 260,
      onComplete: () => p.complete(),
    });

    if (full) {
      const fast = this.time.now - taxi.arrivedAt < BALANCE.fastFillSeconds * 1000;
      if (byPlayer) {
        const level = this.combo.register();
        const { money } = this.economy.addTaxi(taxi.def.bonus, this.combo.multiplier, fast);
        this.economy.addComboXp(level);
        this.floatText(taxi.x, taxi.y - 110, `LOTADO! +${money} Kz`, HEX.green);
        audio.taxiFull();
        if (level > 1) audio.combo(level);
        this.cameras.main.shake(140, 0.004);
      }
      this.time.delayedCall(400, () => taxi.depart());
    }
  }

  private npcBoard(p: Passenger, taxi: Taxi): void {
    if (!p.active || !taxi.active || !taxi.isLoadable) return;
    this.boardPassenger(p, taxi, false);
  }

  floatText(x: number, y: number, text: string, color: string): void {
    const t = this.add
      .text(x, y, text, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "20px",
        color,
      })
      .setOrigin(0.5)
      .setDepth(200000)
      .setStroke("#0e1a33", 4);
    this.tweens.add({
      targets: t,
      y: y - 46,
      alpha: 0,
      duration: 900,
      onComplete: () => t.destroy(),
    });
  }

  // ------------------------------------------------------- hora de ponta
  private startRush(): void {
    if (this.time.now < this.rushUntil) return;
    this.rushUntil = this.time.now + BALANCE.rushHourDuration * 1000;
    this.economy.rewardMultiplier = BALANCE.rushHourRewardMultiplier;
    audio.startMusic(true);
    this.events.emit("rush", true);
    this.cameras.main.flash(240, 255, 195, 31);
  }

  get isRush(): boolean {
    return this.time.now < this.rushUntil;
  }

  // --------------------------------------------------------------- loop
  override update(_time: number, delta: number): void {
    if (this.paused || this.ended) return;

    const dt = delta / 1000;
    if (!this.tutorialMode || this.tutorialTimerStarted) {
      this.timeLeft -= dt;
    }
    if (!this.tutorialMode && this.timeLeft <= 0) {
      this.endMatch();
      return;
    }

    // Movimento do jogador
    const j = this.joystick;
    const k = this.keys;
    let dx = j.x;
    let dy = j.y;
    if (k) {
      if (k["A"]?.isDown || k["LEFT"]?.isDown) dx -= 1;
      if (k["D"]?.isDown || k["RIGHT"]?.isDown) dx += 1;
      if (k["W"]?.isDown || k["UP"]?.isDown) dy -= 1;
      if (k["S"]?.isDown || k["DOWN"]?.isDown) dy += 1;
    }
    const run = j.run || Boolean(k?.["SHIFT"]?.isDown);
    this.player.move(Phaser.Math.Clamp(dx, -1, 1), Phaser.Math.Clamp(dy, -1, 1), run, delta);
    if (this.tutorialMode && !this.tutorialTimerStarted && (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1)) {
      this.tutorialTimerStarted = true;
      this.tutorialStep = "ENCONTRAR PASSAGEIRO";
    }

    // Sistemas
    const d = this.difficulty;
    d.tick(delta);
    this.combo.tick(delta);
    this.powerUps.tick(this.time.now);
    if (this.tutorialMode) {
      this.updateTutorialState(dx, dy);
    }
    this.spawns.tick(
      delta,
      this.tutorialMode ? 1 : d.current.maxPassengers,
      d.current.passengerRate,
      d.current.taxiRate,
      this.isRush,
      Math.min(6, 2 + this.save.fleetLevel),
    );
    if (!this.tutorialMode) {
      this.spawnNpcs(Math.min(d.current.npcCount, this.isRush ? 10 : d.current.npcCount));
    }

    if (!this.isRush) {
      this.economy.rewardMultiplier = 1;
      this.rushTimer -= dt;
      if (this.rushTimer <= 0) {
        this.rushTimer = 30;
        if (Math.random() < BALANCE.rushHourChance) this.startRush();
      }
    }

    // Entidades
    for (const p of this.spawns.passengers) {
      const leader =
        p.follower === this.player
          ? new Phaser.Math.Vector2(this.player.x, this.player.y)
          : p.follower
            ? new Phaser.Math.Vector2(
                (p.follower as Phaser.GameObjects.Sprite).x,
                (p.follower as Phaser.GameObjects.Sprite).y,
              )
            : null;
      p.tick(delta, leader);

      if (p.state === PassengerState.LEAVING && p.alpha > 0.9) this.economy.registerLoss();

      // Embarque quando o passageiro segue o jogador e o táxi está ao lado
      if (p.state === PassengerState.FOLLOWING && p.follower === this.player && p.targetTaxi) {
        const taxi = p.targetTaxi;
        if (!taxi.active || !taxi.isLoadable) {
          const other = this.taxiFor(p);
          if (other) p.startFollowing(other);
          else {
            p.giveUp();
            continue;
          }
        }
        const bp = p.targetTaxi.boardPoint;
        if (Phaser.Math.Distance.Between(p.x, p.y, bp.x, bp.y) < BALANCE.boardRadius) {
          this.boardPassenger(p, p.targetTaxi, true);
        }
      }
    }
    this.spawns.taxis.forEach((t) => t.tick(delta));
    this.npcs.forEach((n) => n.tick(delta));
    this.pedestrians.forEach((p) => p.tick(delta));

    this.missions.evaluate(this.economy.stats, this.combo.level);
    this.callRing.setPosition(this.player.x, this.player.y);
  }

  advanceTutorial(action: "MOVER" | "CHAMAR"): void {
    if (!this.tutorialMode) return;
    if (action === "MOVER" && this.tutorialStep === "MOVER") {
      this.paused = false;
      this.tutorialStep = "ENCONTRAR PASSAGEIRO";
      this.events.emit("paused", false);
    }
  }

  private updateTutorialState(dx: number, dy: number): void {
    if (!this.tutorialMode) return;
    const passenger = this.spawns.passengers[0];
    if (!passenger) return;
    if (this.tutorialStep === "ENCONTRAR PASSAGEIRO" && Phaser.Math.Distance.Between(this.player.x, this.player.y, passenger.x, passenger.y) < BALANCE.interactRadius * 1.4) {
      this.tutorialStep = "CHAMAR / INTERAGIR";
    }
    if (passenger.state === PassengerState.FOLLOWING) this.tutorialStep = "LEVAR AO TÁXI";
    if (passenger.state === PassengerState.COMPLETED) this.tutorialStep = "GANHOU";
    if (this.tutorialStep === "GANHOU") {
      SaveManager.update({ tutorialDone: true });
      this.endMatch();
    }
  }

  private endMatch(): void {
    if (this.ended) return;
    this.ended = true;
    const save = SaveManager.load();
    const missions = { ...save.missions };
    this.missions.completedIds().forEach((id) => (missions[id] = true));
    const stats = {
      ...this.economy.stats,
      bestCombo: this.combo.best,
      objectivesTotal: this.missions.progress.length,
      objectivesCompleted: this.missions.progress.filter((mission) => mission.done).length,
      promoted: this.missions.progress.length > 0 && this.missions.progress.every((mission) => mission.done),
    };
    SaveManager.update({
      money: save.money + stats.money,
      missions,
      bestScore: Math.max(save.bestScore, stats.money),
    });
    this.scene.stop("HUD");
    this.scene.start("Result", { stats });
  }
}
