import AsyncStorage from "@react-native-async-storage/async-storage";

import { MOCK_DB_STORAGE_KEY } from "../utils/constants";
import { buildInitialMockState, MockDbState } from "./mockData";

let memoryCache: MockDbState | null = null;

const cloneState = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const simulateLatency = async (ms = 250) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const readMockDb = async () => {
  if (memoryCache) {
    return cloneState(memoryCache);
  }

  const raw = await AsyncStorage.getItem(MOCK_DB_STORAGE_KEY);
  if (!raw) {
    const seeded = buildInitialMockState();
    memoryCache = seeded;
    await AsyncStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(seeded));
    return cloneState(seeded);
  }

  const parsed = JSON.parse(raw) as MockDbState;
  memoryCache = parsed;
  return cloneState(parsed);
};

export const writeMockDb = async (db: MockDbState) => {
  memoryCache = cloneState(db);
  await AsyncStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(memoryCache));
};

export const mutateMockDb = async <T>(updater: (db: MockDbState) => Promise<T> | T) => {
  const working = await readMockDb();
  const result = await updater(working);
  await writeMockDb(working);
  return {
    db: working,
    result,
  };
};
