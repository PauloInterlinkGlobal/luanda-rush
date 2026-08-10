import { PassengerType, type PassengerDefinition, Destination } from "../types";

export const PASSENGERS: Record<PassengerType, PassengerDefinition> = {
  [PassengerType.NORMAL]: {
    type: PassengerType.NORMAL,
    label: "Normal",
    value: 100,
    urgency: 0.2,
    patience: 26,
    speed: 92,
    convinceTime: 500,
    skin: { skin: 0, hair: 0, shirt: 5, pants: 0, shoes: 2, accessory: "bag" },
  },
  [PassengerType.APRESSADO]: {
    type: PassengerType.APRESSADO,
    label: "Apressado",
    value: 150,
    urgency: 0.7,
    patience: 16,
    speed: 118,
    convinceTime: 420,
    skin: { skin: 1, hair: 1, shirt: 2, pants: 3, shoes: 1, female: true },
  },
  [PassengerType.INDECISO]: {
    type: PassengerType.INDECISO,
    label: "Indeciso",
    value: 150,
    urgency: 0.3,
    patience: 30,
    speed: 80,
    convinceTime: 1100,
    skin: { skin: 2, hair: 2, shirt: 3, pants: 1, shoes: 3, accessory: "bag" },
  },
  [PassengerType.OBSERVADOR]: {
    type: PassengerType.OBSERVADOR,
    label: "Observador",
    value: 200,
    urgency: 0.35,
    patience: 24,
    speed: 88,
    convinceTime: 850,
    skin: { skin: 3, hair: 0, shirt: 5, pants: 2, shoes: 0, accessory: "cap" },
  },
  [PassengerType.EXIGENTE]: {
    type: PassengerType.EXIGENTE,
    label: "Exigente",
    value: 250,
    urgency: 0.5,
    patience: 20,
    speed: 84,
    convinceTime: 1300,
    skin: { skin: 0, hair: 3, shirt: 6, pants: 4, shoes: 1, female: true, accessory: "hat" },
  },
  [PassengerType.CORRERIA]: {
    type: PassengerType.CORRERIA,
    label: "Correria",
    value: 300,
    urgency: 0.9,
    patience: 12,
    speed: 140,
    convinceTime: 380,
    skin: { skin: 4, hair: 1, shirt: 7, pants: 0, shoes: 4 },
  },
  [PassengerType.ESPECIAL]: {
    type: PassengerType.ESPECIAL,
    label: "Especial",
    value: 500,
    urgency: 0.6,
    patience: 15,
    speed: 96,
    convinceTime: 1500,
    skin: { skin: 1, hair: 2, shirt: 3, pants: 1, shoes: 2, accessory: "hat" },
  },
};

/** Pesos de spawn — os passageiros valiosos são raros. */
export const PASSENGER_WEIGHTS: [PassengerType, number][] = [
  [PassengerType.NORMAL, 34],
  [PassengerType.APRESSADO, 22],
  [PassengerType.INDECISO, 15],
  [PassengerType.OBSERVADOR, 12],
  [PassengerType.EXIGENTE, 8],
  [PassengerType.CORRERIA, 6],
  [PassengerType.ESPECIAL, 3],
];

export const DESTINATIONS: Destination[] = [
  Destination.VIANA,
  Destination.TALATONA,
  Destination.CENTRO,
];

export const DESTINATION_COLORS: Record<Destination, number> = {
  [Destination.VIANA]: 0x36b45a,
  [Destination.TALATONA]: 0x2b5fae,
  [Destination.CENTRO]: 0xe23b3b,
};
