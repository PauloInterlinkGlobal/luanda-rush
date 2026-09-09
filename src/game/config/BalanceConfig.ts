/**
 * Todos os valores de balanceamento do jogo, num único lugar.
 * Alterar aqui muda a economia/dificuldade sem tocar em lógica.
 */
export const BALANCE = {
  matchDuration: 180, // segundos
  /** Nível 1 (tutorial): tempo generoso para um jogador novo. */
  tutorialMatchDuration: 300,
  countdown: 3,

  startingMoney: 0,
  maxStamina: 100,
  staminaDrainPerSecond: 22,
  staminaRegenPerSecond: 16,
  staminaRegenDelay: 0.6,
  tiredSpeedMultiplier: 0.62,

  playerWalkSpeed: 130,
  playerRunSpeed: 235,

  callRadius: 150,
  megaphoneRadius: 320,
  interactRadius: 58,
  boardRadius: 70,

  // Economia
  taxiBonus: {
    NORMAL: 100,
    RAPIDO: 150,
    GRANDE: 200,
    ESPECIAL: 300,
    DOURADO: 500,
  },

  // XP
  xpPerPassenger: 5,
  xpPerTaxi: 25,
  xpFastFill: 10,
  xpComboStep: 10,
  fastFillSeconds: 30,

  // Combo
  comboMax: 5,
  comboTimeout: 12, // segundos sem lotação => combo perdido
  comboMoneyMultiplier: 0.25, // +25% por nível de combo acima de 1

  // Power-ups
  turboDuration: 8,
  turboBoost: 0.4,
  megaphoneDuration: 10,
  powerUpCooldown: 18,

  // Spawns
  passengerSpawnInterval: 2.2,
  taxiSpawnInterval: 7,
  maxPassengers: 12,
  maxTaxis: 3,

  // Hora de ponta
  rushHourChance: 0.35,
  rushHourDuration: 25,
  rushHourRewardMultiplier: 1.5,

  // Progressão
  xpPerLevelBase: 200,
  xpPerLevelGrowth: 1.18,

  // NPCs
  npcBaseSpeed: 150,
  npcReactionTime: 0.45,
  npcConvinceTime: 900,
  /** Intervalo entre spawns de NPCs rivais durante a partida (segundos). */
  npcSpawnInterval: 6,
} as const;

export const LEVEL_TITLES: { level: number; title: string }[] = [
  { level: 1, title: "Novato" },
  { level: 5, title: "Lotador" },
  { level: 10, title: "Experiente" },
  { level: 15, title: "Profissional" },
  { level: 20, title: "Veterano" },
  { level: 30, title: "Mestre" },
  { level: 40, title: "Elite" },
  { level: 50, title: "Lenda" },
];

/** Perfis de dificuldade dinâmica. */
export const DIFFICULTY_TIERS = [
  { name: "FACIL", maxPassengers: 10, npcCount: 3, passengerRate: 5.0, taxiRate: 8 },
  { name: "MEDIO", maxPassengers: 8, npcCount: 6, passengerRate: 4.5, taxiRate: 9 },
  { name: "DIFICIL", maxPassengers: 5, npcCount: 10, passengerRate: 4.0, taxiRate: 10 },
] as const;
