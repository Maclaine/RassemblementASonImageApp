import { createAudioPlayer, setAudioModeAsync, useAudioPlayerStatus } from "expo-audio";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { BOOKS } from "../data/books";
import { type PlayableItem, getPlayableItems, getStreamUrl } from "../utils/audio";
import { loadProgress, saveProgress } from "../utils/playerStorage";

type AudioBook = (typeof BOOKS)[0];

type AudioContextValue = {
  currentBook: AudioBook | null;
  currentItem: PlayableItem | null;
  currentIndex: number;
  allItems: PlayableItem[];
  isPlaying: boolean;
  isLoaded: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  openBook: (bookId: string, filename: string) => void;
  goToChapter: (index: number) => void;
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const player = useMemo(() => createAudioPlayer(null), []);
  const status = useAudioPlayerStatus(player);

  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentBook = currentBookId
    ? (BOOKS.find((b) => b.id === currentBookId) ?? null)
    : null;
  const allItems = useMemo(
    () => (currentBook ? getPlayableItems(currentBook) : []),
    [currentBook]
  );
  const currentItem = allItems[currentIndex] ?? null;

  // --- Refs to avoid stale closures ---
  const currentIndexRef = useRef(currentIndex);
  const allItemsLengthRef = useRef(allItems.length);
  const currentItemRef = useRef(currentItem);
  const currentTimeRef = useRef(status.currentTime);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { allItemsLengthRef.current = allItems.length; }, [allItems.length]);
  useEffect(() => { currentItemRef.current = currentItem; }, [currentItem]);
  useEffect(() => { currentTimeRef.current = status.currentTime; }, [status.currentTime]);

  // When non-zero, seek to this position as soon as the next source finishes loading
  const pendingSeekRef = useRef(0);
  // When true, play as soon as the next source finishes loading
  const shouldAutoPlayRef = useRef(false);

  // --- Setup ---
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
    return () => { player.remove(); };
  }, []);

  // --- Lock screen controls ---
  useEffect(() => {
    if (!currentItem || !currentBook) {
      player.clearLockScreenControls?.();
      return;
    }
    player.setActiveForLockScreen(true, {
      title: currentItem.displayLabel,
      artist: currentBook.author,
      albumTitle: currentBook.title,
    });
  }, [currentItem?.filename]);

  // --- Restore saved progress on startup ---
  useEffect(() => {
    loadProgress().then((saved) => {
      if (!saved) return;
      const book = BOOKS.find((b) => b.id === saved.bookId);
      if (!book) return;
      const items = getPlayableItems(book);
      const index = items.findIndex((i) => i.filename === saved.filename);
      if (index === -1) return;

      pendingSeekRef.current = saved.currentTime;
      shouldAutoPlayRef.current = false; // restore silently, let user press play
      setCurrentBookId(saved.bookId);
      setCurrentIndex(index);
      player.replace({ uri: getStreamUrl(items[index].bookId, items[index].filename) });
    });
  }, []);

  // --- Save progress every 10 seconds while playing ---
  useEffect(() => {
    const interval = setInterval(() => {
      const item = currentItemRef.current;
      const time = currentTimeRef.current;
      if (item && time > 0) {
        saveProgress({ bookId: item.bookId, filename: item.filename, currentTime: time, savedAt: Date.now() });
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  // --- Save progress when app moves to background ---
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        const item = currentItemRef.current;
        const time = currentTimeRef.current;
        if (item && time > 0) {
          saveProgress({ bookId: item.bookId, filename: item.filename, currentTime: time, savedAt: Date.now() });
        }
      }
    });
    return () => sub.remove();
  }, []);

  // --- Seek + auto-play when source becomes ready ---
  useEffect(() => {
    if (!status.isLoaded) return;

    if (pendingSeekRef.current > 0) {
      player.seekTo(pendingSeekRef.current);
      pendingSeekRef.current = 0;
    }

    if (shouldAutoPlayRef.current) {
      shouldAutoPlayRef.current = false;
      player.play();
    }
  }, [status.isLoaded, status.duration]);

  // --- Auto-advance to next chapter ---
  useEffect(() => {
    if (!status.didJustFinish) return;
    const next = currentIndexRef.current + 1;
    if (next < allItemsLengthRef.current) goToChapter(next);
  }, [status.didJustFinish]);

  // --- Chapter navigation ---
  const goToChapter = (index: number) => {
    if (index < 0 || index >= allItemsLengthRef.current) return;
    shouldAutoPlayRef.current = true;
    pendingSeekRef.current = 0; // new chapter always starts from beginning
    setCurrentIndex(index);
    player.replace({ uri: getStreamUrl(allItems[index].bookId, allItems[index].filename) });
  };

  // --- Entry point from book screen ---
  const openBook = (bookId: string, filename: string) => {
    const book = BOOKS.find((b) => b.id === bookId);
    if (!book) return;
    const items = getPlayableItems(book);
    const index = Math.max(0, items.findIndex((i) => i.filename === filename));
    setCurrentBookId(bookId);
    setCurrentIndex(index);
    shouldAutoPlayRef.current = true;
    pendingSeekRef.current = 0;
    player.replace({ uri: getStreamUrl(items[index].bookId, items[index].filename) });
  };

  return (
    <AudioContext.Provider
      value={{
        currentBook,
        currentItem,
        currentIndex,
        allItems,
        isPlaying: status.playing,
        isLoaded: status.isLoaded,
        isBuffering: status.isBuffering,
        currentTime: status.currentTime,
        duration: status.duration ?? 0,
        openBook,
        goToChapter,
        play: () => player.play(),
        pause: () => player.pause(),
        seekTo: (s) => player.seekTo(s),
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
