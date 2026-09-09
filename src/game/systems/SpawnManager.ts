import Phaser from "phaser";
import { MAP_CONFIG } from "../config/MapConfig";
import { DESTINATIONS, PASSENGER_WEIGHTS } from "../data/passengers";
import { TAXI_WEIGHTS } from "../data/taxis";
import { Passenger } from "../entities/Passenger";
import { Taxi } from "../entities/Taxi";
import { Destination, PassengerType, TaxiState, TaxiType } from "../types";

function weightedPick<T>(entries: [T, number][]): T {
  const total = entries.reduce((s, e) => s + e[1], 0);
  let r = Math.random() * total;
  for (const [value, weight] of entries) {
    r -= weight;
    if (r <= 0) return value;
  }
  return entries[0]![0];
}

/**
 * SpawnManager — cria passageiros e táxis em zonas configuráveis.
 * Mantém as regras de escassez definidas pelo DifficultyManager.
 */
export class SpawnManager {
  passengers: Passenger[] = [];
  taxis: Taxi[] = [];

  private passengerTimer = 0;
  private taxiTimer = 1.2;

  constructor(private readonly scene: Phaser.Scene) {}

  /** Destinos actualmente servidos por táxis à espera. */
  private activeDestinations(): Destination[] {
    return this.taxis
      .filter((t) => t.isLoadable)
      .map((t) => t.destination);
  }

  spawnPassenger(
    forceDestination?: Destination,
    at?: { x: number; y: number },
  ): Passenger | null {
    const zone =
      MAP_CONFIG.passengerSpawnZones[
        Math.floor(Math.random() * MAP_CONFIG.passengerSpawnZones.length)
      ]!;
    const x = at ? at.x : zone.x + Math.random() * zone.w;
    const y = at ? at.y : zone.y + Math.random() * zone.h;
    const type = weightedPick(PASSENGER_WEIGHTS) as PassengerType;

    // 70% dos passageiros querem um destino que já tem táxi — mantém o ritmo
    const active = this.activeDestinations();
    let destination: Destination;
    if (forceDestination) destination = forceDestination;
    else if (active.length > 0 && Math.random() < 0.7)
      destination = active[Math.floor(Math.random() * active.length)]!;
    else destination = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)]!;

    const p = new Passenger(this.scene, x, y, type, destination);
    this.passengers.push(p);
    return p;
  }

  spawnTaxi(forceType?: TaxiType): Taxi | null {
    const usedSlots = new Set(
      this.taxis.filter((t) => t.state !== TaxiState.GONE).map((t) => t.slotIndex),
    );
    const free = MAP_CONFIG.taxiSlots.map((_, i) => i).filter((i) => !usedSlots.has(i));
    if (free.length === 0) return null;
    const slot = free[Math.floor(Math.random() * free.length)]!;
    const type = forceType ?? (weightedPick(TAXI_WEIGHTS) as TaxiType);
    const destination = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)]!;
    const taxi = new Taxi(this.scene, type, destination, slot);
    this.taxis.push(taxi);
    return taxi;
  }

  tick(
    delta: number,
    maxPassengers: number,
    passengerRate: number,
    taxiRate: number,
    rush: boolean,
    maxTaxis = 3,
  ): void {
    const dt = delta / 1000;
    const rushFactor = rush ? 0.55 : 1;

    this.passengerTimer -= dt;
    if (this.passengerTimer <= 0) {
      this.passengerTimer = passengerRate * rushFactor;
      const alive = this.passengers.filter((p) => p.active).length;
      if (alive < (rush ? maxPassengers + 4 : maxPassengers)) this.spawnPassenger();
    }

    this.taxiTimer -= dt;
    if (this.taxiTimer <= 0) {
      this.taxiTimer = taxiRate * rushFactor;
      if (this.taxis.filter((t) => t.active && t.state !== TaxiState.GONE).length < maxTaxis) {
        this.spawnTaxi();
      }
    }

    // Limpeza
    this.passengers = this.passengers.filter((p) => {
      if (!p.active) return false;
      if (p.alpha <= 0.02 || p.state === "COMPLETED") {
        p.destroy();
        return false;
      }
      return true;
    });
    this.taxis = this.taxis.filter((t) => {
      if (!t.active) return false;
      if (t.state === TaxiState.GONE) {
        t.destroy();
        return false;
      }
      return true;
    });
  }

  clear(): void {
    this.passengers.forEach((p) => p.destroy());
    this.taxis.forEach((t) => t.destroy());
    this.passengers = [];
    this.taxis = [];
  }
}
