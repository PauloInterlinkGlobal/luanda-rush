/**
 * Configuração central do jogo. Nenhum valor mágico deve viver fora daqui
 * (ou de BalanceConfig / MapConfig / AssetConfig).
 */
export const GAME_CONFIG = {
  /** Resolução lógica base — o Phaser escala para o ecrã real. */
  width: 960,
  height: 540,
  backgroundColor: "#1b2a4a",
  /** Tamanho de um frame de personagem no atlas procedural. */
  frameWidth: 48,
  frameHeight: 64,
  /** Activa atalhos F1..F7 (apenas desktop). */
  debug: true,
  physicsDebug: false,
} as const;

export const COLORS = {
  night: 0x0e1a33,
  deepBlue: 0x16305c,
  blue: 0x2b5fae,
  road: 0x3b4250,
  roadDark: 0x333947,
  sidewalk: 0x9aa0ab,
  sidewalkDark: 0x848a95,
  dirt: 0xb08a5a,
  grass: 0x4e8a48,
  yellow: 0xffc31f,
  gold: 0xffd94a,
  orange: 0xf07b1d,
  red: 0xe23b3b,
  green: 0x36b45a,
  white: 0xf5f2e8,
  black: 0x171a21,
} as const;

/** Paleta em string para textos/UI (Phaser Text usa strings). */
export const HEX = {
  yellow: "#ffc31f",
  gold: "#ffd94a",
  white: "#f7f4ec",
  red: "#e23b3b",
  green: "#36b45a",
  blue: "#2b5fae",
  dark: "#0e1a33",
  muted: "#9fb0cc",
} as const;

export const FONT = {
  display: "Impact, 'Arial Black', system-ui, sans-serif",
  body: "'Trebuchet MS', system-ui, sans-serif",
} as const;
