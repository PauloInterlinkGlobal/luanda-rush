import type { CharacterSkin } from "../types";

/**
 * Configuração de assets.
 *
 * `useExternalAtlas` fica a false enquanto não existir um atlas real.
 * Quando o atlas (PNG + JSON) for adicionado, basta apontar aqui: o
 * AssetManager passa a servir os frames reais e nenhum sistema de gameplay
 * precisa de mudar.
 */
export const ASSET_CONFIG = {
  useExternalAtlas: false,
  atlasKey: "lotador-atlas",
  atlasImageUrl: "",
  atlasJsonUrl: "",
} as const;

/** Paleta de peles/roupas usada pelo gerador procedural. */
export const PALETTE = {
  skins: [0x8d5524, 0x6b3f1d, 0xa9713f, 0x5a3417, 0xc68642],
  hair: [0x1b1410, 0x2b2018, 0x120d0a, 0x3a2a1a, 0x552f8a],
  shirts: [0xffc31f, 0xe23b3b, 0xf5f2e8, 0x2b5fae, 0x36b45a, 0xf07b1d, 0x9b59b6, 0x16a3a3],
  pants: [0x2f4f7a, 0x1f2937, 0x3b5998, 0x5c4033, 0x264653],
  shoes: [0xe23b3b, 0xf5f2e8, 0x171a21, 0x2b5fae, 0xffc31f],
};

export const DEFAULT_CHARACTER: CharacterSkin = {
  skin: 0,
  hair: 0,
  shirt: 0,
  pants: 0,
  shoes: 0,
  accessory: "cap",
  female: false,
};

/**
 * Manifesto de assets — espelha o asset-manifest.json exigido pelo design doc.
 * Serve de índice único de tudo o que o AssetManager tem de produzir/carregar.
 */
export const ASSET_MANIFEST = {
  player: ["player_male", "player_female"],
  npcs: ["npc_kito", "npc_manuel", "npc_debora", "mentor_ze"],
  passengers: [
    "pass_NORMAL",
    "pass_APRESSADO",
    "pass_INDECISO",
    "pass_OBSERVADOR",
    "pass_EXIGENTE",
    "pass_CORRERIA",
    "pass_ESPECIAL",
  ],
  taxis: ["taxi_NORMAL", "taxi_RAPIDO", "taxi_GRANDE", "taxi_ESPECIAL", "taxi_DOURADO"],
  objects: ["prop_tree", "prop_stall", "prop_bin", "prop_lamp", "prop_bench", "prop_sign", "prop_cone", "prop_wall"],
  effects: ["fx_dust", "fx_star", "fx_coin", "fx_spark"],
  ui: ["ui_joystick_base", "ui_joystick_thumb", "ui_button"],
} as const;
