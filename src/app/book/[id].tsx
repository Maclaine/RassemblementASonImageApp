import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../constants/theme";
import { useAudio } from "../../contexts/AudioContext";
import { BOOKS } from "../../data/books";
import { useMiniPlayerInset } from "../../hooks/useMiniPlayerInset";
import { getPlayableItems, type PlayableItem } from "../../utils/audio";

type Section = {
  title: string;
  volumeNumber: number;
  chapterCount: number;
  data: PlayableItem[];
};

export default function BookScreen() {
  const bottomInset = useMiniPlayerInset();
  const { currentItem, isPlaying, play, pause, openBook } = useAudio();
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = BOOKS.find((b) => b.id === id);
  const listRef = useRef<SectionList<PlayableItem>>(null);

  const activeVolumeNumber =
    currentItem?.bookId === id ? currentItem.volumeNumber : null;

  const [collapsed, setCollapsed] = useState<Set<number>>(() => {
    const all = new Set(book?.volumes.map((v) => v.number) ?? []);
    const openVolume = activeVolumeNumber ?? book?.volumes[0]?.number;
    if (openVolume != null) all.delete(openVolume);
    return all;
  });

  if (!book) return null;

  const allItems = getPlayableItems(book);

  const scrollToSection = (sectionIndex: number) => {
    try {
      listRef.current?.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewPosition: 0.5,
        animated: true,
      });
    } catch {}
  };

  const toggleCollapse = (volumeNumber: number, sectionIndex: number) => {
    const isExpanded = !collapsed.has(volumeNumber);

    if (isExpanded) {
      // Collapsing: scroll before state update while items are still rendered
      scrollToSection(sectionIndex);
    }

    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(volumeNumber)) next.delete(volumeNumber);
      else next.add(volumeNumber);
      return next;
    });

    if (!isExpanded) {
      // Expanding: scroll after items are rendered
      requestAnimationFrame(() =>
        requestAnimationFrame(() => scrollToSection(sectionIndex))
      );
    }
  };

  const sections: Section[] = book.volumes.map((vol) => {
    const volItems = allItems.filter((item) => item.volumeNumber === vol.number);
    return {
      title: `Tome ${vol.number}`,
      volumeNumber: vol.number,
      chapterCount: volItems.length,
      data: collapsed.has(vol.number) ? [] : volItems,
    };
  });

  const handleRowPress = (item: PlayableItem) => {
    if (currentItem?.filename !== item.filename) {
      openBook(book.id, item.filename);
    }
    router.push({ pathname: "/player", params: { bookId: book.id, filename: item.filename } });
  };

  const handlePlayPause = (item: PlayableItem) => {
    if (currentItem?.filename === item.filename) {
      isPlaying ? pause() : play();
    } else {
      openBook(book.id, item.filename);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.filename}
        contentContainerStyle={[styles.list, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          book.cover ? (
            <View style={styles.coverHeader}>
              <Image source={book.cover} style={styles.cover} contentFit="cover" />
              <View style={styles.coverInfo}>
                <Text style={styles.coverTitle}>{book.title}</Text>
                <Text style={styles.coverAuthor}>{book.author}</Text>
              </View>
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => {
          const isCollapsed = collapsed.has(section.volumeNumber);
          const hasChapters = section.chapterCount > 0;
          const isActive =
            currentItem?.bookId === id &&
            currentItem?.volumeNumber === section.volumeNumber;
          const sectionIndex = sections.findIndex(
            (s) => s.volumeNumber === section.volumeNumber
          );
          return (
            <TouchableOpacity
              style={[styles.sectionHeader, isActive && styles.sectionHeaderActive]}
              onPress={() =>
                hasChapters && toggleCollapse(section.volumeNumber, sectionIndex)
              }
              activeOpacity={hasChapters ? 0.7 : 1}
            >
              <View style={styles.sectionTitleRow}>
                {isActive && (
                  <Ionicons
                    name="musical-notes"
                    size={13}
                    color={Colors.secondary}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text style={[styles.sectionTitle, isActive && styles.sectionTitleActive]}>
                  {section.title}
                </Text>
                {hasChapters && (
                  <Text style={styles.sectionCount}>{section.chapterCount} sous-chapitres</Text>
                )}
              </View>
              {!hasChapters ? (
                <Text style={styles.comingSoon}>Prochainement</Text>
              ) : (
                <Ionicons
                  name={isCollapsed ? "chevron-down" : "chevron-up"}
                  size={16}
                  color={isActive ? Colors.secondary : Colors.textMuted}
                />
              )}
            </TouchableOpacity>
          );
        }}
        renderItem={({ item }) => {
          const isActive = currentItem?.filename === item.filename;
          return (
            <View style={[styles.chapterRow, isActive && styles.chapterRowActive]}>
              <TouchableOpacity
                style={styles.chapterMainArea}
                onPress={() => handleRowPress(item)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isActive ? "musical-notes" : "musical-note-outline"}
                  size={15}
                  color={Colors.secondary}
                  style={styles.chapterIcon}
                />
                <Text style={[styles.chapterLabel, isActive && styles.chapterLabelActive]}>
                  {item.displayLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePlayPause(item)}
                hitSlop={10}
                style={styles.playPauseBtn}
              >
                <Ionicons
                  name={isActive && isPlaying ? "pause-circle" : "play-circle-outline"}
                  size={26}
                  color={isActive ? Colors.secondary : Colors.border}
                />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 32,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.serifSemiBold,
    fontSize: 16,
    color: Colors.white,
  },
  headerSpacer: {
    width: 32,
  },

  // List
  list: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexGrow: 1,
    paddingBottom: 32,
    paddingHorizontal: 20
  },

  // Cover header
  coverHeader: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 20,
    paddingBottom: 8,
    marginBottom: 8,
  },
  cover: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  coverInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  coverTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.text,
  },
  coverAuthor: {
    fontFamily: Fonts.italic,
    fontSize: 13,
    color: Colors.textMuted,
  },

  // Volume section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    marginTop: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primary,
    borderRadius: 10
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.background,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sectionHeaderActive: {
    backgroundColor: Colors.primaryDark,
  },
  sectionTitleActive: {
    color: Colors.secondaryLight,
  },
  sectionCount: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.background,
  },
  comingSoon: {
    fontFamily: Fonts.italic,
    fontSize: 12,
    color: Colors.background,
  },

  // Chapter row
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  chapterRowActive: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
    paddingLeft: 17,
  },
  chapterMainArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  chapterIcon: {
    marginRight: 12,
  },
  playPauseBtn: {
    paddingLeft: 12,
  },
  chapterLabel: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
  },
  chapterLabelActive: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});
