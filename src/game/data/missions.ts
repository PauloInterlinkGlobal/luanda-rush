import type { MissionDefinition, UpgradeDefinition } from "../types";

export const MISSIONS: MissionDefinition[] = [
  {
    id: "primeiro_turno",
    label: "PRIMEIRO TURNO",
    description: "Lotar 3 táxis numa partida",
    goal: 3,
    metric: "taxisFilled",
    rewardMoney: 500,
    rewardXp: 50,
  },
  {
    id: "nao_para",
    label: "NÃO PARA!",
    description: "Lotar 5 táxis numa partida",
    goal: 5,
    metric: "taxisFilled",
    rewardMoney: 800,
    rewardXp: 120,
  },
  {
    id: "velocista",
    label: "VELOCISTA",
    description: "Lotar um táxi em menos de 30 segundos",
    goal: 1,
    metric: "fastFill",
    rewardMoney: 1000,
    rewardXp: 200,
  },
  {
    id: "rei_da_voz",
    label: "REI DA VOZ",
    description: "Levar 10 passageiros numa partida",
    goal: 10,
    metric: "passengers",
    rewardMoney: 700,
    rewardXp: 150,
  },
  {
    id: "combo_mestre",
    label: "COMBO MESTRE",
    description: "Fazer combo x5",
    goal: 5,
    metric: "combo",
    rewardMoney: 500,
    rewardXp: 250,
  },
  {
    id: "caixa_cheia",
    label: "CAIXA CHEIA",
    description: "Ganhar 2.000 Kz numa partida",
    goal: 2000,
    metric: "money",
    rewardMoney: 1000,
    rewardXp: 500,
  },
];

/**
 * Objetivos do nível 1 (tutorial): muito simples, avaliados pelo
 * MissionManager contra as estatísticas reais da partida.
 */
export const TUTORIAL_MISSIONS: MissionDefinition[] = [
  {
    id: "tut_chamar",
    label: "PRIMEIRO CHAMAMENTO",
    description: "Chamar um passageiro",
    goal: 1,
    metric: "callsUsed",
    rewardMoney: 100,
    rewardXp: 20,
  },
  {
    id: "tut_correr",
    label: "AQUECIMENTO",
    description: "Usar a corrida",
    goal: 1,
    metric: "runsUsed",
    rewardMoney: 100,
    rewardXp: 20,
  },
  {
    id: "tut_passageiro",
    label: "BORA, BORA!",
    description: "Levar 1 passageiro ao táxi",
    goal: 1,
    metric: "passengers",
    rewardMoney: 300,
    rewardXp: 50,
  },
];

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: "velocidade",
    label: "VELOCIDADE",
    description: "Corres mais depressa entre passageiros e táxis.",
    maxLevel: 10,
    baseCost: 400,
    perLevel: 0.04,
  },
  {
    id: "resistencia",
    label: "RESISTÊNCIA",
    description: "Mais stamina e recuperação mais rápida.",
    maxLevel: 10,
    baseCost: 350,
    perLevel: 0.08,
  },
  {
    id: "voz",
    label: "VOZ",
    description: "Aumenta o alcance do teu chamamento.",
    maxLevel: 10,
    baseCost: 450,
    perLevel: 0.1,
  },
  {
    id: "persuasao",
    label: "PERSUASÃO",
    description: "Convences os passageiros mais depressa.",
    maxLevel: 10,
    baseCost: 500,
    perLevel: 0.07,
  },
];
