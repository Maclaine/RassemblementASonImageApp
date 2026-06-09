import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants/theme";
import { useMiniPlayerInset } from "../hooks/useMiniPlayerInset";

const logo = require("../../assets/images/brand/logo-revelations-privees.png");
const mainCardImage = require("../../assets/images/content/revelations-privees.jpg");

export default function WelcomeScreen() {
  const bottomInset = useMiniPlayerInset();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
        </View>

        <View style={styles.introSection}>
          <Ionicons name="headset" size={80} color={Colors.secondary} style={styles.introIconBg} />
          <Text style={styles.introText}>
            Découvrez des <Text style={{ fontFamily: Fonts.serifSemiBold }}>milliers d&apos;heures</Text> d&apos;audiolivres consacrés aux <Text style={{ fontFamily: Fonts.serifSemiBold }}>révélations
            privées</Text>, aux mystiques chrétiens et à la spiritualité catholique — <Text style={{ fontFamily: Fonts.serifSemiBold }}>librement
            accessibles</Text>, directement depuis votre appareil.
          </Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.quoteRow}>
            <Text style={styles.quoteText}>
              Une <Text style={{ fontFamily: Fonts.boldItalic }}>révélation privée</Text> est une <Text style={{ fontFamily: Fonts.boldItalic }}>expérience spirituelle</Text> intérieure. Les mystiques reçoivent des évocations, des messages, des locutions intérieures du Christ, de la Vierge Marie, de saints, des âmes du purgatoire… {"\n\n"}
              Ces <Text style={{ fontFamily: Fonts.boldItalic }}>apparitions</Text> ou <Text style={{ fontFamily: Fonts.boldItalic }}>visions</Text> permettent un cœur à cœur avec Jésus Christ, la Vierge Marie. Ces <Text style={{ fontFamily: Fonts.boldItalic }}>révélations privées</Text> nous transmettent un chemin de simplicité pour notre foi, une aide.
            </Text>
            <Image source={mainCardImage} style={styles.mainCardImage} contentFit="cover" />
          </View>

          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={() => router.push("/library")}>
            <Text style={styles.ctaText}>Découvrir la bibliothèque</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Accès entièrement gratuit · Aucun compte requis
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero
  hero: {
    backgroundColor: Colors.background,
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 24,
  },
  logo: {
    width: "80%",
    height: 160,
    marginBottom: 5,
  },

  // Intro strip (primary background)
  introSection: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 50,
    marginTop: -25,
    overflow: "hidden",
  },
  introIconBg: {
    position: "absolute",
    right: 16,
    bottom: 25,
    opacity: 1,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.serif,
    color: Colors.background,
    textAlign: "justify",
  },

  // Main card (background color, quote + features + CTA)
  mainCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
    marginTop: -25,
  },
  quoteRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 32,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    color: Colors.primary,
    textAlign: "left",
  },
  mainCardImage: {
    width: "45%",
    alignSelf: "stretch",
    borderRadius: 25,
  },

  // CTA
  ctaButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
