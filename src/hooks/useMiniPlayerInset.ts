import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudio } from "../contexts/AudioContext";

// Progress bar (2) + row height (64) = 66
const MINI_PLAYER_HEIGHT = 66;

/**
 * Returns the bottom padding screens should add so the mini player
 * never covers their scrollable content.
 * Returns only the safe-area bottom when no chapter is loaded.
 */
export function useMiniPlayerInset(): number {
  const { currentItem } = useAudio();
  const insets = useSafeAreaInsets();
  const safeBottom = insets.bottom || 12;
  return currentItem ? MINI_PLAYER_HEIGHT + safeBottom : safeBottom;
}
