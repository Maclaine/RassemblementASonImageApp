import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants/theme";
import { BOOKS, type Audiobook } from "../data/books";
import { useMiniPlayerInset } from "../hooks/useMiniPlayerInset";

export default function LibraryScreen() {
  const bottomInset = useMiniPlayerInset();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bibliothèque</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={BOOKS}
        keyExtractor={(book) => book.id}
        renderItem={({ item }) => <BookCard book={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function BookCard({ book }: { book: Audiobook }) {
  const volumeCount = book.volumes.length;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: "/book/[id]", params: { id: book.id } })}
    >
      <View style={styles.coverWrapper}>
        {book.cover ? (
          <Image source={book.cover} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book" size={36} color={Colors.border} />
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>

        <View style={styles.volumeBadge}>
          <Text style={styles.volumeBadgeText}>{volumeCount} volumes</Text>
        </View>

        <Text style={styles.bookDescription} numberOfLines={2}>
          {book.description}
        </Text>
      </View>
    </TouchableOpacity>
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
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: 32,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.serifSemiBold,
    fontSize: 18,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 32,
  },

  // List
  list: {
    padding: 16,
    gap: 16,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexGrow: 1,
  },

  // Book card
  card: {
    flexDirection: "row",
    alignSelf: "flex-start",
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 170
  },
  coverWrapper: {
    width: 170,
  },
  cover: {
    width: 170,
    height: "100%",
  },
  coverPlaceholder: {
    width: 170,
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    gap: 4,
    overflow: "hidden",
  },
  bookTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.text,
  },
  bookAuthor: {
    fontFamily: Fonts.italic,
    fontSize: 12,
    color: Colors.textMuted,
  },
  volumeBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  volumeBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  bookDescription: {
    marginTop: 10,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textMuted,
  },
});
