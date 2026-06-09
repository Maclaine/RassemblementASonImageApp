import * as FileSystem from "expo-file-system/legacy";
import type { Audiobook } from "../data/books";

export const AUDIO_BASE_URL =
  "https://cdn.revelationsprivees.fr/public/maria-valtorta-l-evangile-tel-qu-il-m-a-ete-revele";

export type PlayableItem = {
  bookId: string;
  volumeNumber: number;
  chapterNumber: number;
  subchapterLabel?: string;
  filename: string;
  displayLabel: string; // e.g. "Tome 8 · Chapitre 1" or "Tome 8 · Chapitre 2A"
};

export function getStreamUrl(filename: string): string {
  return `${AUDIO_BASE_URL}/${filename}.mp3`;
}

export function getLocalUri(filename: string): string {
  return `${FileSystem.documentDirectory}revelations-privees/${filename}.mp3`;
}

export async function checkIsDownloaded(filename: string): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(getLocalUri(filename));
  return info.exists;
}

// Flattens the full volume/chapter/subchapter hierarchy into an ordered list
// of individually playable items — used for prev/next navigation.
export function getPlayableItems(book: Audiobook): PlayableItem[] {
  const items: PlayableItem[] = [];
  for (const volume of book.volumes) {
    for (const chapter of volume.chapters) {
      if (chapter.subchapters?.length) {
        for (const sub of chapter.subchapters) {
          items.push({
            bookId: book.id,
            volumeNumber: volume.number,
            chapterNumber: chapter.number,
            subchapterLabel: sub.label,
            filename: sub.filename,
            displayLabel: `Tome ${volume.number} · Chapitre ${chapter.number}${sub.label}`,
          });
        }
      } else if (chapter.filename) {
        items.push({
          bookId: book.id,
          volumeNumber: volume.number,
          chapterNumber: chapter.number,
          filename: chapter.filename,
          displayLabel: `Tome ${volume.number} · Chapitre ${chapter.number}`,
        });
      }
    }
  }
  return items;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
