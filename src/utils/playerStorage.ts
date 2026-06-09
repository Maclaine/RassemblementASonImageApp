import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "player_progress";

export type PlayerProgress = {
  bookId: string;
  filename: string;
  currentTime: number; // seconds
  savedAt: number;     // unix timestamp ms
};

export async function saveProgress(progress: PlayerProgress): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
}

export async function loadProgress(): Promise<PlayerProgress | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as PlayerProgress) : null;
}
