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
  id: UpgradeId;
  label: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  /** Ganho por nível (multiplicador aditivo). */
  perLevel: number;
}

/** IDs de upgrade — inclui legados (voz/persuasão/resistência) e novos. */
export type UpgradeId =
  | "velocidade"
  | "energia"
  | "recuperacao"
  | "agilidade"
  | "resistencia"
  | "voz"
  | "persuasao";

export interface MissionDefinition {
  id: string;
  label: string;
  description: string;
  goal: number;
  metric: ObjectiveMetric;
  rewardMoney: number;
  rewardXp: number;
}

/** Métricas avaliáveis por objectivos de fase e missões. */
export type ObjectiveMetric =
  | "taxisFilled"
  | "passengers"
  | "combo"
  | "money"
  | "fastFill"
  | "callsUsed"
  | "runsUsed"
  | "penalties"
  | "disputesWon"
  | "crossings"
  | "survive"
  | "reputation"
  | "lostPassengers";

export type ObjectiveKind = "primary" | "secondary" | "special" | "bonus";

/** Objectivo modular reutilizável numa fase. */
export interface LevelObjectiveDef {
  id: string;
  label: string;
  description: string;
  metric: ObjectiveMetric;
  goal: number;
  kind: ObjectiveKind;
  /**
   * Se true, o objectivo falha quando current > goal
   * (ex.: "não sofrer mais de 2 penalizações").
   * Considera-se cumprido enquanto current <= goal no fim da fase.
   */
  inverted?: boolean;
}

export interface LevelSpawnConfig {
  maxPassengers: number;
  maxTaxis: number;
  initialPassengers: number;
  initialTaxis: number;
  npcCount: number;
  /** Multiplicador de velocidade dos rivais (1 = normal). */
  npcSpeedMul?: number;
  /** Multiplicador de estratégia dos rivais. */
  npcStrategyMul?: number;
  passengerRate: number;
  taxiRate: number;
  /** 0..1 densidade visual/colisões de obstáculos extra. */
  obstacleDensity: number;
  /** 0..1 intensidade de trânsito (hora de ponta mais frequente). */
  trafficLevel: number;
  pedestrianCount: number;
  autoSpawn: boolean;
  freezePatience?: boolean;
  freezeTaxiWait?: boolean;
  rushHour: boolean;
  guidedTutorial: boolean;
  fiscalCount?: number;
}

export interface LevelStarRules {
  /** IDs de objectivos necessários para 1 estrela (normalmente o principal). */
  star1: string[];
  /** 2 estrelas: completar star1 dentro de N segundos. */
  star2?: { withinSeconds: number };
  /** 3 estrelas: objectivos extra e/ou métrica bónus. */
  star3?: {
    requireObjectives?: string[];
    bonusMetric?: ObjectiveMetric;
    bonusGoal?: number;
  };
}

export interface LevelRewards {
  money: number;
  xp: number;
  /** Bónus extra por estrela (aplicado por estrela além da 1ª). */
  perStarBonus?: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  rank: RankId;
  areaId: string;
  description: string;
  duration: number;
  /** Tempo alvo para a 2ª estrela (espelha starRules.star2). */
  timeStarSeconds?: number;
  spawn: LevelSpawnConfig;
  objectives: LevelObjectiveDef[];
  starRules: LevelStarRules;
  rewards: LevelRewards;
  intro?: string;
  unlockArea?: string;
  finaleTitle?: string;
}

export type RankId = "aprendiz" | "lotador" | "experiente" | "profissional" | "mestre";

export interface RankTier {
  id: RankId;
  label: string;
  phases: number[];
}

export interface MatchStats {
  taxisFilled: number;
  passengers: number;
  bestCombo: number;
  money: number;
  xp: number;
  lostPassengers: number;
  fastFill: number;
  callsUsed: number;
  runsUsed: number;
  objectivesTotal: number;
  objectivesCompleted: number;
  promoted: boolean;
  /** Penalizações (fiscais, colisões graves, etc.). */
  penalties: number;
  /** Disputas ganhas contra rivais (embarcou quando rival também mirava). */
  disputesWon: number;
  /** Vezes que atravessou a estrada. */
  crossings: number;
  /** Reputação ganha nesta partida. */
  reputation: number;
  /** Fase actual (0 se modo livre). */
  phaseId: number;
  starsEarned: number;
  levelRewardMoney: number;
  levelRewardXp: number;
  newRecord: boolean;
  survived: boolean;
}

/** Progresso guardado por fase. */
export interface PhaseProgress {
  completed: boolean;
  stars: number; // 0..3 (melhor)
  bestTime: number; // segundos gastos (menor = melhor), 0 se nunca
  attempts: number;
  bestMoney: number;
}

export interface SaveData {
  version: number;
  level: number;
  xp: number;
  money: number;
  upgrades: Record<string, number>;
  character: CharacterSkin;
  playerName: string;
  missions: Record<string, boolean>;
  bestScore: number;
  tutorialDone: boolean;
  fleetLevel: number;
  stationLevel: number;
  unlockedMaps: string[];
  settings: GameSettings;
  /** Maior fase desbloqueada (1-based). */
  unlockedPhase: number;
  /** Progresso por id de fase. */
  phases: Record<string, PhaseProgress>;
  /** Reputação global do lotador. */
  reputation: number;
  /** Área/paragem actual. */
  currentArea: string;
  /** Áreas desbloqueadas. */
  unlockedAreas: string[];
}

export interface GameSettings {
  music: boolean;
  sfx: boolean;
  vibration: boolean;
  quality: "LOW" | "MEDIUM" | "HIGH";
  language: "pt" | "en";
}

/** Resultado calculado no fim de uma fase. */
export interface LevelResult {
  phaseId: number;
  won: boolean;
  stars: number;
  previousStars: number;
  newRecord: boolean;
  primaryDone: boolean;
  objectives: { id: string; label: string; current: number; goal: number; done: boolean; kind: ObjectiveKind }[];
  stats: MatchStats;
  rewardMoney: number;
  rewardXp: number;
  timeSpent: number;
  timeLimit: number;
  levelName: string;
  rankLabel: string;
  finaleTitle?: string;
  unlockedNext: boolean;
  unlockedArea?: string;
}
