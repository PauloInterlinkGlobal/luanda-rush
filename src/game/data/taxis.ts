import { TaxiType, type TaxiDefinition } from "../types";
import { BALANCE } from "../config/BalanceConfig";

export const TAXIS: Record<TaxiType, TaxiDefinition> = {
  [TaxiType.NORMAL]: {
    type: TaxiType.NORMAL,
    label: "Táxi Normal",
    capacity: 4,
    bonus: BALANCE.taxiBonus.NORMAL,
    waitTime: 34,
    bodyColor: 0x2b7fd4,
    roofColor: 0xf5f2e8,
    weight: 45,
  },
  [TaxiType.RAPIDO]: {
    type: TaxiType.RAPIDO,
    label: "Táxi Rápido",
    capacity: 3,
    bonus: BALANCE.taxiBonus.RAPIDO,
    waitTime: 22,
    bodyColor: 0xe23b3b,
    roofColor: 0xf5f2e8,
    weight: 25,
  },
  [TaxiType.GRANDE]: {
    type: TaxiType.GRANDE,
    label: "Táxi Grande",
    capacity: 7,
    bonus: BALANCE.taxiBonus.GRANDE,
    waitTime: 46,
    bodyColor: 0x1f5fa8,
    roofColor: 0xf5f2e8,
    weight: 18,
  },
  [TaxiType.ESPECIAL]: {
    type: TaxiType.ESPECIAL,
    label: "Táxi Especial",
    capacity: 5,
    bonus: BALANCE.taxiBonus.ESPECIAL,
    waitTime: 30,
    bodyColor: 0x2aa04e,
    roofColor: 0xdff3e2,
    weight: 9,
  },
  [TaxiType.DOURADO]: {
    type: TaxiType.DOURADO,
    label: "Táxi Dourado",
    capacity: 4,
    bonus: BALANCE.taxiBonus.DOURADO,
    waitTime: 26,
    bodyColor: 0xffc31f,
    roofColor: 0xffe9a8,
    weight: 3,
  },
};

export const TAXI_WEIGHTS: [TaxiType, number][] = (
  Object.values(TAXIS) as TaxiDefinition[]
).map((t) => [t.type, t.weight]);
