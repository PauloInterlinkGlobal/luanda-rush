/**
 * Layout do primeiro mapa: PARAGEM DO BAIRRO (Luanda fictícia).
 * Área compacta e densa — boa para perseguições sem virar mundo aberto.
 */
export const MAP_CONFIG = {
  id: "bairro",
  name: "PARAGEM DO BAIRRO",
  width: 1600,
  height: 1100,
  tile: 50,

  /** Faixa de estrada horizontal (onde os táxis param). */
  road: { x: 0, y: 620, w: 1600, h: 230 },
  /** Passeio principal (paragem). */
  sidewalk: { x: 0, y: 500, w: 1600, h: 120 },

  /** Lugares de paragem para os táxis (da esquerda para a direita). */
  taxiSlots: [
    { x: 320, y: 700 },
    { x: 760, y: 700 },
    { x: 1200, y: 700 },
  ],

  /** Zonas onde os passageiros aparecem. */
  passengerSpawnZones: [
    { x: 120, y: 300, w: 500, h: 180 },
    { x: 700, y: 250, w: 520, h: 200 },
    { x: 1150, y: 330, w: 380, h: 160 },
    { x: 200, y: 900, w: 1100, h: 140 },
  ],

  playerSpawn: { x: 800, y: 540 },
  npcSpawns: [
    { x: 260, y: 540 },
    { x: 1280, y: 545 },
    { x: 620, y: 470 },
    { x: 1000, y: 950 },
    { x: 420, y: 930 },
    { x: 1420, y: 520 },
    { x: 150, y: 470 },
    { x: 900, y: 300 },
    { x: 1350, y: 930 },
    { x: 520, y: 260 },
  ],

  /** Props estáticos: [tipo, x, y]. Os com colisão são marcados no ObjectLayer. */
  props: [
    ["stall", 180, 250],
    ["stall", 300, 250],
    ["stall", 980, 210],
    ["stall", 1100, 210],
    ["tree", 90, 420],
    ["tree", 480, 400],
    ["tree", 700, 190],
    ["tree", 1300, 400],
    ["tree", 1520, 250],
    ["tree", 260, 1010],
    ["tree", 700, 1010],
    ["tree", 1180, 1010],
    ["bench", 400, 545],
    ["bench", 900, 545],
    ["bench", 1350, 545],
    ["bin", 560, 545],
    ["bin", 1080, 545],
    ["lamp", 200, 520],
    ["lamp", 640, 520],
    ["lamp", 1080, 520],
    ["lamp", 1500, 520],
    ["sign", 330, 500],
    ["sign", 770, 500],
    ["sign", 1210, 500],
    ["cone", 620, 880],
    ["cone", 660, 890],
    ["cone", 1420, 860],
    ["wall", 60, 150],
    ["wall", 160, 150],
    ["wall", 1400, 130],
    ["wall", 1500, 130],
    // Paragem coberta e mais vida na rua
    ["shelter", 1040, 612],
    ["shelter", 240, 612],
    ["stall", 620, 250],
    ["tree", 1050, 420],
    ["tree", 860, 1010],
    ["tree", 1460, 1010],
    ["tree", 40, 1010],
    ["bench", 1150, 545],
    ["bench", 640, 545],
    ["bin", 1300, 545],
    ["sign", 1480, 500],
    ["cone", 380, 660],
    ["cone", 420, 672],
    ["cone", 460, 684],
    ["cone", 1000, 830],
    ["cone", 1040, 842],
    ["cone", 900, 880],
    ["cone", 240, 900],
  ] as [string, number, number][],

  /** Sítios por onde os figurantes (transeuntes) circulam. */
  ambientSpawns: [
    { x: 180, y: 560 },
    { x: 700, y: 580 },
    { x: 1150, y: 470 },
    { x: 480, y: 960 },
    { x: 1250, y: 940 },
    { x: 950, y: 330 },
    { x: 360, y: 350 },
    { x: 1420, y: 580 },
    { x: 820, y: 980 },
    { x: 1450, y: 380 },
    { x: 100, y: 950 },
    { x: 600, y: 460 },
  ],
} as const;

/** Zonas do mapa de campanha (só a primeira desbloqueada no MVP). */
export const CAMPAIGN_ZONES = [
  { id: "bairro", name: "BAIRRO", unlocked: true, requiredLevel: 1 },
  { id: "rangel", name: "RANGEL", unlocked: false, requiredLevel: 5 },
  { id: "samba", name: "SAMBA", unlocked: false, requiredLevel: 10 },
  { id: "talatona", name: "TALATONA", unlocked: false, requiredLevel: 15 },
  { id: "camama", name: "CAMAMA", unlocked: false, requiredLevel: 20 },
  { id: "centro", name: "CENTRO", unlocked: false, requiredLevel: 30 },
  { id: "terminal", name: "TERMINAL", unlocked: false, requiredLevel: 40 },
];
