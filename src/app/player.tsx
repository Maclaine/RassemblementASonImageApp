import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants/theme";
import { useAudio } from "../contexts/AudioContext";
import { checkIsDownloaded, formatTime, getLocalUri, getStreamUrl } from "../utils/audio";

export default function PlayerScreen() {
  const { bookId, filename } = useLocalSearchParams<{ bookId: string; filename: string }>();
  const { width } = useWindowDimensions();
  const audio = useAudio();

  // Only load the chapter if it isn't already the active one — avoids resetting position
  useEffect(() => {
    if (bookId && filename && audio.currentItem?.filename !== filename) {
      audio.openBook(bookId, filename);
    }
  }, []);

  const {
    currentBook,
    currentItem,
    currentIndex,
    allItems,
    isPlaying,
    isLoaded,
    isBuffering,
    currentTime,
    duration,
    play,
    pause,
    seekTo,
    goToChapter,
  } = audio;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < allItems.length - 1;

  // Download state is local — UI concern only
  const [progressBarWidth, setProgressBarWidth] = useState(1);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (!currentItem) return;
    checkIsDownloaded(currentItem.filename).then(setIsDownloaded);
  }, [currentItem?.filename]);

  const seek = (locationX: number) => {
    if (!isLoaded || !duration) return;
    seekTo(Math.max(0, Math.min(1, locationX / progressBarWidth)) * duration);
  };

  const downloadChapter = async () => {
    if (!currentItem || isDownloading || isDownloaded) return;
    setIsDownloading(true);
    try {
      const dir = `${FileSystem.documentDirectory}rassemblement-a-son-image/`;
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const resumable = FileSystem.createDownloadResumable(
        getStreamUrl(currentItem.bookId, currentItem.filename),
        getLocalUri(currentItem.filename),
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (totalBytesExpectedToWrite > 0)
            setDownloadProgress(totalBytesWritten / totalBytesExpectedToWrite);
        }
      );
      await resumable.downloadAsync();
      setIsDownloaded(true);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const progress = isLoaded && duration > 0 ? currentTime / duration : 0;
  const fillWidth = progress * progressBarWidth;
  const coverSize = Math.round(width * 0.62);

  if (!currentBook || !currentItem) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="chevron-down" size={26} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerLabel}>En écoute</Text>

        <TouchableOpacity
          onPress={downloadChapter}
          hitSlop={12}
          style={styles.headerBtn}
          disabled={isDownloaded || isDownloading}
        >
          {isDownloading ? (
            <View style={styles.downloadProgress}>
              <ActivityIndicator size="small" color={Colors.secondary} />
              <Text style={styles.downloadPct}>{Math.round(downloadProgress * 100)}%</Text>
            </View>
          ) : (
            <Ionicons
              name={isDownloaded ? "checkmark-circle" : "download-outline"}
              size={24}
              color={isDownloaded ? Colors.secondary : Colors.white}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Cover */}
      <View style={styles.coverContainer}>
        {currentBook.cover ? (
          <Image
            source={currentBook.cover}
            style={{ width: coverSize, height: coverSize, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.coverPlaceholder, { width: coverSize, height: coverSize }]}>
            <Ionicons name="book" size={72} color={Colors.primaryDark} />
          </View>
        )}
      </View>

      {/* Track info */}
      <View style={styles.trackInfo}>
        <Text style={styles.chapterLabel}>{currentItem.displayLabel}</Text>
        <Text style={styles.bookTitle} numberOfLines={2}>{currentBook.title}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressSection}>
        <View
          style={styles.progressTrack}
          onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => seek(e.nativeEvent.locationX)}
          onResponderMove={(e) => seek(e.nativeEvent.locationX)}
        >
          <View style={[styles.progressFill, { width: fillWidth }]} />
          <View style={[styles.progressThumb, { left: fillWidth - 7 }]} />
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>-{formatTime(Math.max(0, duration - currentTime))}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => goToChapter(currentIndex - 1)}
          disabled={!canGoPrev}
          style={[styles.sideBtn, !canGoPrev && styles.btnDisabled]}
        >
          <Ionicons name="play-skip-back" size={26} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => seekTo(Math.max(0, currentTime - 30))}
          style={styles.sideBtn}
        >
          <Ionicons name="play-back" size={26} color={Colors.white} />
          <Text style={styles.skipLabel}>30</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (isPlaying ? pause() : play())}
          style={styles.playBtn}
        >
          {isBuffering && !isPlaying ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={38}
              color={Colors.primary}
              style={isPlaying ? undefined : { marginLeft: 4 }}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => seekTo(Math.min(duration, currentTime + 30))}
          style={styles.sideBtn}
        >
          <Ionicons name="play-forward" size={26} color={Colors.white} />
          <Text style={styles.skipLabel}>30</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => goToChapter(currentIndex + 1)}
          disabled={!canGoNext}
          style={[styles.sideBtn, !canGoNext && styles.btnDisabled]}
        >
          <Ionicons name="play-skip-forward" size={26} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 36,
    alignItems: "center",
  },
  headerLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  downloadProgress: {
    alignItems: "center",
    gap: 2,
  },
  downloadPct: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: Colors.secondary,
  },
  coverContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  coverPlaceholder: {
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 6,
    marginBottom: 28,
  },
  chapterLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.secondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bookTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.white,
    textAlign: "center",
  },
  progressSection: {
    paddingHorizontal: 28,
    marginBottom: 32,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    marginBottom: 10,
    justifyContent: "center",
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.secondary,
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
    top: -5,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  sideBtn: {
    alignItems: "center",
    gap: 2,
    padding: 8,
  },
  skipLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    color: Colors.white,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.3,
  },
});
