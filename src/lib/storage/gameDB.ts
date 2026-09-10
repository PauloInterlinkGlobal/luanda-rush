import { deleteDB, openDB, type DBSchema } from "idb";

export type GameState = Record<string, unknown>;

interface LotadorDB extends DBSchema {
  saves: {
    key: string;
    value: { id: string; state: GameState; updatedAt: number };
  };
}

const DB_NAME = "lotador-game";
const SLOT = "default";

const database = () =>
  openDB<LotadorDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("saves")) db.createObjectStore("saves", { keyPath: "id" });
    },
  });

export async function saveGameState(state: GameState): Promise<void> {
  const db = await database();
  await db.put("saves", { id: SLOT, state, updatedAt: Date.now() });
}

export async function loadGameState(): Promise<GameState | null> {
  const db = await database();
  return (await db.get("saves", SLOT))?.state ?? null;
}

export async function clearGameState(): Promise<void> {
  const db = await database();
  await db.delete("saves", SLOT);
}

export async function closeGameDatabase(): Promise<void> {
  await deleteDB(DB_NAME);
}

export type { LotadorDB };
