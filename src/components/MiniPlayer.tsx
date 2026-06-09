import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants/theme";
import { useAudio } from "../contexts/AudioContext";

export function MiniPlayer() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const {
    currentBook,
    currentItem,
    currentIndex,
    allItems,
    isPlaying,
    isLoaded,
    currentTime,
    duration,
    play,
    pause,
    goToChapter,
  } = useAudio();

  if (!currentItem || !currentBook) return null;
  if (pathname === "/player") return null;

  const progress = isLoaded && duration > 0 ? currentTime / duration : 0;
  const canGoNext = currentIndex < allItems.length - 1;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {/* Thin progress bar across the top */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <View style={styles.row}>
        {/* Tapping cover + info opens the full player */}
        <Pressable
          style={styles.infoArea}
          onPress={() => router.push("/player")}
        >
          {currentBook.cover ? (
            <Image source={currentBook.cover} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="book" size={18} color={Colors.border} />
            </View>
          )}

          <View style={styles.text}>
            <Text style={styles.chapterLabel} numberOfLines={1}>
              {currentItem.displayLabel}
            </Text>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {currentBook.title}
            </Text>
          </View>
        </Pressable>

        {/* Controls — independent from the navigation press */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => (isPlaying ? pause() : play())}
            hitSlop={10}
            style={styles.controlBtn}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={26}
              color={Colors.white}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => goToChapter(currentIndex + 1)}
            disabled={!canGoNext}
            hitSlop={10}
            style={[styles.controlBtn, !canGoNext && styles.disabled]}
          >
            <Ionicons name="play-skip-forward" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primaryDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
  progressTrack: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressFill: {
    height: 2,
    backgroundColor: Colors.secondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 64,
  },
  infoArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cover: {
    width: 42,
    height: 42,
    borderRadius: 6,
  },
  coverPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  chapterLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bookTitle: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.white,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 8,
  },
  controlBtn: {
    padding: 8,
  },
  disabled: {
    opacity: 0.3,
  },
});
