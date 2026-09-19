/**
 * Modelo de dados dos mockups de UI — O Lotador
 * Espelha a estrutura pedida no brief (LevelObjective / LevelData).
 */

export type ObjectiveType =
  | "PASSENGERS_DELIVERED"
  | "SPECIFIC_DESTINATION"
  | "MONEY_EARNED"
  | "FULL_CAPACITY_TRIPS"
  | "BEAT_RIVAL"
  | "NO_COLLISIONS";

export interface LevelObjective {
  type: ObjectiveType;
  target_value: number;
  current_value: number;
  completed: boolean;
  description: string;
}

export interface LevelData {
  level_number: number;
  chapter_name: string;
  chapter_id: string;
  objectives: LevelObjective[];
  time_limit_seconds: number;
  rival_count: number;
  reward_kz: number;
  unlocked: boolean;
  /** 0 = bloqueada sem progresso; true se já jogada com ≥1★ */
  completed: boolean;
  stars: number; // 0–3
  name: string;
}

export interface ChapterMeta {
  id: string;
  name: string;
  short: string;
  tagline: string;
  density: 1 | 2 | 3 | 4 | 5 | 6;
}

/** 6 capítulos: do bairro mais simples ao Centro. */
export const CHAPTERS: ChapterMeta[] = [
  {
    id: "cazenga",
    name: "CAZENGA",
    short: "CAZ",
    tagline: "Aprendiz · primeiras corridas",
    density: 1,
  },
  {
    id: "rangel",
    name: "RANGEL",
    short: "RAN",
    tagline: "Lotador · rivais aparecem",
    density: 2,
  },
  {
    id: "viana",
    name: "VIANA",
    short: "VIA",
    tagline: "Experiente · trânsito e tempo",
    density: 3,
  },
  {
    id: "talatona",
    name: "TALATONA",
    short: "TAL",
    tagline: "Profissional · multi-objectivo",
    density: 4,
  },
  {
    id: "camama",
    name: "CAMAMA",
    short: "CAM",
    tagline: "Pressão alta · paragem densa",
    density: 5,
  },
  {
    id: "centro",
    name: "CENTRO",
    short: "CEN",
    tagline: "Mestre · Rei da Paragem",
    density: 6,
  },
];

export const OBJECTIVE_META: Record<
  ObjectiveType,
  { icon: string; label: string; short: string; css: string }
> = {
  PASSENGERS_DELIVERED: {
    icon: "🧍",
    label: "Passageiros",
    short: "PAX",
    css: "passengers",
  },
  SPECIFIC_DESTINATION: {
    icon: "📍",
    label: "Destino",
    short: "DEST",
    css: "destination",
  },
  MONEY_EARNED: {
    icon: "💰",
    label: "Kwanzas",
    short: "KZ",
    css: "money",
  },
  FULL_CAPACITY_TRIPS: {
    icon: "🚕",
    label: "Táxis lotados",
    short: "TAXI",
    css: "trips",
  },
  BEAT_RIVAL: {
    icon: "🏁",
    label: "Rival",
    short: "RIVAL",
    css: "rival",
  },
  NO_COLLISIONS: {
    icon: "🛡️",
    label: "Sem colisões",
    short: "SAFE",
    css: "collisions",
  },
};

/** Formata objectivo para HUD: "🧍 5/8 passageiros" */
export function formatObjectiveLine(o: LevelObjective): string {
  const meta = OBJECTIVE_META[o.type];
  if (o.type === "BEAT_RIVAL") {
    return o.completed
      ? `${meta.icon} rival vencido`
      : `${meta.icon} vence o rival`;
  }
  if (o.type === "NO_COLLISIONS") {
    return o.completed
      ? `${meta.icon} 0 colisões`
      : `${meta.icon} 0/${o.target_value} colisões`;
  }
  if (o.type === "MONEY_EARNED") {
    return `${meta.icon} ${o.current_value}/${o.target_value} Kz`;
  }
  if (o.type === "FULL_CAPACITY_TRIPS") {
    return `${meta.icon} ${o.current_value}/${o.target_value} viagens lotadas`;
  }
  if (o.type === "SPECIFIC_DESTINATION") {
    return `${meta.icon} ${o.current_value}/${o.target_value} · ${o.description}`;
  }
  return `${meta.icon} ${o.current_value}/${o.target_value} passageiros`;
}

export function objectiveProgress(o: LevelObjective): number {
  if (o.type === "BEAT_RIVAL") return o.completed ? 1 : o.current_value / Math.max(1, o.target_value);
  if (o.type === "NO_COLLISIONS") {
    // inverted: progress = remaining "budget"
    const used = o.current_value;
    return Math.max(0, 1 - used / Math.max(1, o.target_value + 0.0001));
  }
  return Math.min(1, o.current_value / Math.max(1, o.target_value));
}

/**
 * 6+ níveis de exemplo cobrindo a progressão pedida:
 * L1 (1 obj, 0 rivais), L5 (2), L10 (2–3 + 1 rival), L18 (4 + 2–3 rivais).
 */
export const SAMPLE_LEVELS: LevelData[] = [
  // ── Capítulo 1 · Cazenga ──────────────────────────────────
  {
    level_number: 1,
    name: "PRIMEIRO DIA",
    chapter_name: "CAZENGA",
    chapter_id: "cazenga",
    time_limit_seconds: 300,
    rival_count: 0,
    reward_kz: 200,
    unlocked: true,
    completed: true,
    stars: 3,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 1,
        current_value: 1,
        completed: true,
        description: "Leva 1 passageiro ao táxi",
      },
    ],
  },
  {
    level_number: 2,
    name: "PRIMEIROS CLIENTES",
    chapter_name: "CAZENGA",
    chapter_id: "cazenga",
    time_limit_seconds: 180,
    rival_count: 0,
    reward_kz: 300,
    unlocked: true,
    completed: true,
    stars: 2,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 2,
        current_value: 2,
        completed: true,
        description: "Atende 2 passageiros",
      },
    ],
  },
  {
    level_number: 3,
    name: "MAIS MOVIMENTO",
    chapter_name: "CAZENGA",
    chapter_id: "cazenga",
    time_limit_seconds: 150,
    rival_count: 1,
    reward_kz: 400,
    unlocked: true,
    completed: true,
    stars: 1,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 3,
        current_value: 3,
        completed: true,
        description: "Atende 3 passageiros",
      },
      {
        type: "BEAT_RIVAL",
        target_value: 1,
        current_value: 0,
        completed: false,
        description: "Chega antes do rival",
      },
    ],
  },
  {
    level_number: 4,
    name: "PARAGEM CHEIA",
    chapter_name: "CAZENGA",
    chapter_id: "cazenga",
    time_limit_seconds: 150,
    rival_count: 1,
    reward_kz: 450,
    unlocked: true,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 3,
        current_value: 0,
        completed: false,
        description: "Atende 3 passageiros",
      },
      {
        type: "NO_COLLISIONS",
        target_value: 1,
        current_value: 0,
        completed: false,
        description: "No máximo 1 perda",
      },
    ],
  },

  // ── Nível 5 · Rangel (2 objectivos) ───────────────────────
  {
    level_number: 5,
    name: "PRIMEIRO TURNO",
    chapter_name: "RANGEL",
    chapter_id: "rangel",
    time_limit_seconds: 150,
    rival_count: 2,
    reward_kz: 500,
    unlocked: true,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 3,
        current_value: 1,
        completed: false,
        description: "Enche 3 táxis",
      },
      {
        type: "MONEY_EARNED",
        target_value: 400,
        current_value: 120,
        completed: false,
        description: "Ganha 400 Kz",
      },
    ],
  },
  {
    level_number: 6,
    name: "FISCALIZAÇÃO",
    chapter_name: "RANGEL",
    chapter_id: "rangel",
    time_limit_seconds: 140,
    rival_count: 2,
    reward_kz: 550,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 3,
        current_value: 0,
        completed: false,
        description: "Enche 3 táxis",
      },
      {
        type: "NO_COLLISIONS",
        target_value: 2,
        current_value: 0,
        completed: false,
        description: "Máx. 2 penalizações",
      },
    ],
  },
  {
    level_number: 7,
    name: "TRÂNSITO",
    chapter_name: "RANGEL",
    chapter_id: "rangel",
    time_limit_seconds: 140,
    rival_count: 2,
    reward_kz: 600,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 4,
        current_value: 0,
        completed: false,
        description: "Atende 4 passageiros",
      },
      {
        type: "SPECIFIC_DESTINATION",
        target_value: 2,
        current_value: 0,
        completed: false,
        description: "VIANA",
      },
    ],
  },
  {
    level_number: 8,
    name: "RIVALIDADE",
    chapter_name: "RANGEL",
    chapter_id: "rangel",
    time_limit_seconds: 140,
    rival_count: 3,
    reward_kz: 650,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "BEAT_RIVAL",
        target_value: 3,
        current_value: 0,
        completed: false,
        description: "Vence 3 disputas",
      },
      {
        type: "MONEY_EARNED",
        target_value: 500,
        current_value: 0,
        completed: false,
        description: "Ganha 500 Kz",
      },
    ],
  },

  // ── Nível 10 · Viana (2–3 objs, 1 rival) ──────────────────
  {
    level_number: 9,
    name: "RITMO ACELERADO",
    chapter_name: "VIANA",
    chapter_id: "viana",
    time_limit_seconds: 130,
    rival_count: 3,
    reward_kz: 700,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 4,
        current_value: 0,
        completed: false,
        description: "Enche 4 táxis",
      },
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 6,
        current_value: 0,
        completed: false,
        description: "Atende 6 passageiros",
      },
    ],
  },
  {
    level_number: 10,
    name: "MULTI-OBJECTIVO",
    chapter_name: "VIANA",
    chapter_id: "viana",
    time_limit_seconds: 130,
    rival_count: 1,
    reward_kz: 800,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 5,
        current_value: 2,
        completed: false,
        description: "Enche 5 táxis",
      },
      {
        type: "MONEY_EARNED",
        target_value: 500,
        current_value: 280,
        completed: false,
        description: "Ganha 500 Kz",
      },
      {
        type: "NO_COLLISIONS",
        target_value: 2,
        current_value: 1,
        completed: false,
        description: "Máx. 2 penalizações",
      },
    ],
  },
  {
    level_number: 11,
    name: "PRESSÃO NA PARAGEM",
    chapter_name: "VIANA",
    chapter_id: "viana",
    time_limit_seconds: 125,
    rival_count: 4,
    reward_kz: 850,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 6,
        current_value: 0,
        completed: false,
        description: "Atende 6 passageiros",
      },
      {
        type: "BEAT_RIVAL",
        target_value: 2,
        current_value: 0,
        completed: false,
        description: "Vence 2 disputas",
      },
    ],
  },
  {
    level_number: 12,
    name: "TURNO COMPLETO",
    chapter_name: "VIANA",
    chapter_id: "viana",
    time_limit_seconds: 125,
    rival_count: 4,
    reward_kz: 900,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 5,
        current_value: 0,
        completed: false,
        description: "Enche 5 táxis",
      },
      {
        type: "MONEY_EARNED",
        target_value: 700,
        current_value: 0,
        completed: false,
        description: "Ganha 700 Kz",
      },
      {
        type: "SPECIFIC_DESTINATION",
        target_value: 3,
        current_value: 0,
        completed: false,
        description: "TALATONA",
      },
    ],
  },

  // ── Talatona ──────────────────────────────────────────────
  {
    level_number: 13,
    name: "PROFISSIONAL",
    chapter_name: "TALATONA",
    chapter_id: "talatona",
    time_limit_seconds: 120,
    rival_count: 4,
    reward_kz: 1000,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 6,
        current_value: 0,
        completed: false,
        description: "Enche 6 táxis",
      },
      {
        type: "MONEY_EARNED",
        target_value: 800,
        current_value: 0,
        completed: false,
        description: "Ganha 800 Kz",
      },
      {
        type: "BEAT_RIVAL",
        target_value: 2,
        current_value: 0,
        completed: false,
        description: "Vence 2 disputas",
      },
    ],
  },
  {
    level_number: 14,
    name: "ZONA DE RISCO",
    chapter_name: "TALATONA",
    chapter_id: "talatona",
    time_limit_seconds: 120,
    rival_count: 5,
    reward_kz: 1100,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 7,
        current_value: 0,
        completed: false,
        description: "Atende 7 passageiros",
      },
      {
        type: "NO_COLLISIONS",
        target_value: 2,
        current_value: 0,
        completed: false,
        description: "Máx. 2 penalizações",
      },
      {
        type: "MONEY_EARNED",
        target_value: 900,
        current_value: 0,
        completed: false,
        description: "Ganha 900 Kz",
      },
    ],
  },
  {
    level_number: 15,
    name: "ESTRATEGISTA",
    chapter_name: "TALATONA",
    chapter_id: "talatona",
    time_limit_seconds: 115,
    rival_count: 5,
    reward_kz: 1200,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 7,
        current_value: 0,
        completed: false,
        description: "Atende 7 passageiros",
      },
      {
        type: "MONEY_EARNED",
        target_value: 1000,
        current_value: 0,
        completed: false,
        description: "Ganha 1.000 Kz",
      },
      {
        type: "BEAT_RIVAL",
        target_value: 2,
        current_value: 0,
        completed: false,
        description: "Vence 2 disputas",
      },
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 4,
        current_value: 0,
        completed: false,
        description: "Enche 4 táxis",
      },
    ],
  },
  {
    level_number: 16,
    name: "MESTRE DO TURNO",
    chapter_name: "TALATONA",
    chapter_id: "talatona",
    time_limit_seconds: 115,
    rival_count: 5,
    reward_kz: 1300,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 7,
        current_value: 0,
        completed: false,
        description: "Enche 7 táxis",
      },
      {
        type: "BEAT_RIVAL",
        target_value: 3,
        current_value: 0,
        completed: false,
        description: "Vence 3 disputas",
      },
      {
        type: "NO_COLLISIONS",
        target_value: 2,
        current_value: 0,
        completed: false,
        description: "Máx. 2 colisões",
      },
    ],
  },

  // ── Camama ────────────────────────────────────────────────
  {
    level_number: 17,
    name: "CAOS CONTROLADO",
    chapter_name: "CAMAMA",
    chapter_id: "camama",
    time_limit_seconds: 110,
    rival_count: 6,
    reward_kz: 1400,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 8,
        current_value: 0,
        completed: false,
        description: "Atende 8 passageiros",
      },
      {
        type: "MONEY_EARNED",
        target_value: 1200,
        current_value: 0,
        completed: false,
        description: "Ganha 1.200 Kz",
      },
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 5,
        current_value: 0,
        completed: false,
        description: "Enche 5 táxis",
      },
    ],
  },

  // ── Nível 18 · Centro (4 objs, 2–3 rivais, tempo apertado) ─
  {
    level_number: 18,
    name: "REI DA VOZ",
    chapter_name: "CENTRO",
    chapter_id: "centro",
    time_limit_seconds: 100,
    rival_count: 3,
    reward_kz: 1600,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 8,
        current_value: 5,
        completed: false,
        description: "Atende 8 passageiros",
      },
      {
        type: "MONEY_EARNED",
        target_value: 1500,
        current_value: 920,
        completed: false,
        description: "Ganha 1.500 Kz",
      },
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 6,
        current_value: 6,
        completed: true,
        description: "Enche 6 táxis",
      },
      {
        type: "BEAT_RIVAL",
        target_value: 3,
        current_value: 2,
        completed: false,
        description: "Vence 3 disputas",
      },
    ],
  },
  {
    level_number: 19,
    name: "SOBREVIVENTE",
    chapter_name: "CENTRO",
    chapter_id: "centro",
    time_limit_seconds: 105,
    rival_count: 7,
    reward_kz: 1800,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 8,
        current_value: 0,
        completed: false,
        description: "Atende 8 passageiros",
      },
      {
        type: "MONEY_EARNED",
        target_value: 1500,
        current_value: 0,
        completed: false,
        description: "Ganha 1.500 Kz",
      },
      {
        type: "BEAT_RIVAL",
        target_value: 3,
        current_value: 0,
        completed: false,
        description: "Vence 3 disputas",
      },
      {
        type: "NO_COLLISIONS",
        target_value: 2,
        current_value: 0,
        completed: false,
        description: "Máx. 2 colisões",
      },
    ],
  },
  {
    level_number: 20,
    name: "REI DA PARAGEM",
    chapter_name: "CENTRO",
    chapter_id: "centro",
    time_limit_seconds: 100,
    rival_count: 8,
    reward_kz: 2500,
    unlocked: false,
    completed: false,
    stars: 0,
    objectives: [
      {
        type: "PASSENGERS_DELIVERED",
        target_value: 10,
        current_value: 0,
        completed: false,
        description: "Atende 10 passageiros",
      },
      {
        type: "MONEY_EARNED",
        target_value: 2000,
        current_value: 0,
        completed: false,
        description: "Ganha 2.000 Kz",
      },
      {
        type: "BEAT_RIVAL",
        target_value: 4,
        current_value: 0,
        completed: false,
        description: "Vence 4 disputas",
      },
      {
        type: "FULL_CAPACITY_TRIPS",
        target_value: 8,
        current_value: 0,
        completed: false,
        description: "Enche 8 táxis",
      },
    ],
  },
];

/** Snapshots de HUD para demonstrar 1 vs 4 objectivos. */
export const HUD_DEMO_TUTORIAL: LevelObjective[] = [
  {
    type: "PASSENGERS_DELIVERED",
    target_value: 1,
    current_value: 0,
    completed: false,
    description: "Leva 1 passageiro ao táxi",
  },
];

export const HUD_DEMO_MID: LevelObjective[] = [
  {
    type: "FULL_CAPACITY_TRIPS",
    target_value: 3,
    current_value: 2,
    completed: false,
    description: "Enche 3 táxis",
  },
  {
    type: "MONEY_EARNED",
    target_value: 400,
    current_value: 400,
    completed: true,
    description: "Ganha 400 Kz",
  },
];

export const HUD_DEMO_ADVANCED: LevelObjective[] = [
  {
    type: "PASSENGERS_DELIVERED",
    target_value: 8,
    current_value: 5,
    completed: false,
    description: "Atende 8 passageiros",
  },
  {
    type: "MONEY_EARNED",
    target_value: 1500,
    current_value: 920,
    completed: false,
    description: "Ganha 1.500 Kz",
  },
  {
    type: "FULL_CAPACITY_TRIPS",
    target_value: 6,
    current_value: 6,
    completed: true,
    description: "Enche 6 táxis",
  },
  {
    type: "BEAT_RIVAL",
    target_value: 3,
    current_value: 2,
    completed: false,
    description: "Vence 3 disputas",
  },
];

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
