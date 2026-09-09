/**
 * Tipos centrais do LOTADOR.
 * Todos os sistemas do jogo dependem destas definições.
 */

export enum Destination {
  VIANA = "VIANA",
  TALATONA = "TALATONA",
  CENTRO = "CENTRO",
}

export enum PassengerType {
  NORMAL = "NORMAL",
  APRESSADO = "APRESSADO",
  INDECISO = "INDECISO",
  OBSERVADOR = "OBSERVADOR",
  EXIGENTE = "EXIGENTE",
  CORRERIA = "CORRERIA",
  ESPECIAL = "ESPECIAL",
}

export enum PassengerState {
  SPAWNING = "SPAWNING",
  WAITING = "WAITING",
  SEARCHING = "SEARCHING",
  APPROACHED = "APPROACHED",
  ACCEPTED = "ACCEPTED",
  FOLLOWING = "FOLLOWING",
  BOARDING = "BOARDING",
  COMPLETED = "COMPLETED",
  LEAVING = "LEAVING",
}

export enum TaxiType {
  NORMAL = "NORMAL",
  RAPIDO = "RAPIDO",
  GRANDE = "GRANDE",
  ESPECIAL = "ESPECIAL",
  DOURADO = "DOURADO",
}

export enum TaxiState {
  ARRIVING = "ARRIVING",
  WAITING = "WAITING",
  LOADING = "LOADING",
  FULL = "FULL",
  DEPARTING = "DEPARTING",
  GONE = "GONE",
}

export enum Direction {
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  UP = "up",
}

export enum PowerUpType {
  TURBO = "TURBO",
  MEGAFONE = "MEGAFONE",
  /** Preparados para futuro, ainda não activos no MVP. */
  RADAR = "RADAR",
  IMAN = "IMAN",
  COMBO_SHIELD = "COMBO_SHIELD",
}

export interface PassengerDefinition {
  type: PassengerType;
  label: string;
  /** Recompensa base em Kz. */
  value: number;
  /** 0..1 — quanto mais urgente, mais rápido desiste. */
  urgency: number;
  /** Segundos de espera antes de desistir. */
  patience: number;
  speed: number;
  /** Dificuldade de persuasão: tempo de abordagem em ms. */
  convinceTime: number;
  skin: CharacterSkin;
}

export interface TaxiDefinition {
  type: TaxiType;
  label: string;
  capacity: number;
  /** Bónus em Kz quando o táxi fica lotado. */
  bonus: number;
  /** Segundos que o táxi espera na paragem. */
  waitTime: number;
  bodyColor: number;
  roofColor: number;
  weight: number;
}

export interface CharacterSkin {
  skin: number;
  hair: number;
  shirt: number;
  pants: number;
  shoes: number;
  accessory?: "cap" | "hat" | "bag" | "none";
  female?: boolean;
  /** "atlas" usa os sprites reais; "classic" usa o gerador procedural. */
  style?: "atlas" | "classic";
  /** Quando verdadeiro, as cores escolhidas são aplicadas ao sprite real. */
  useCustomColors?: boolean;
}

export interface UpgradeDefinition {
  id: "velocidade" | "resistencia" | "voz" | "persuasao";
  label: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  /** Ganho por nível (multiplicador aditivo). */
  perLevel: number;
}

export interface MissionDefinition {
  id: string;
  label: string;
  description: string;
  goal: number;
  metric: "taxisFilled" | "passengers" | "combo" | "money" | "fastFill";
  rewardMoney: number;
  rewardXp: number;
}

export interface MatchStats {
  taxisFilled: number;
  passengers: number;
  bestCombo: number;
  money: number;
  xp: number;
  lostPassengers: number;
  fastFill: number;
}

export interface SaveData {
  version: number;
  level: number;
  xp: number;
  money: number;
  upgrades: Record<UpgradeDefinition["id"], number>;
  character: CharacterSkin;
  playerName: string;
  missions: Record<string, boolean>;
  bestScore: number;
  fleetLevel: number;
  stationLevel: number;
  unlockedMaps: string[];
  settings: GameSettings;
}

export interface GameSettings {
  music: boolean;
  sfx: boolean;
  vibration: boolean;
  quality: "LOW" | "MEDIUM" | "HIGH";
  language: "pt" | "en";
}
