import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants/theme";
import { useMiniPlayerInset } from "../hooks/useMiniPlayerInset";

const logo = require("../../assets/images/brand/logo-rassemblement-a-son-image.png");
const descriptionImage = require("../../assets/images/content/livre-jesus-edition-raimage.png");

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
          <Text style={styles.introText}>
            La maison d'édition <Text style={{ fontFamily: Fonts.bold }}>Rassemblement à son image</Text> publie des révélations privées, vies de saints, des témoignages de conversion et des ouvrages d'évangélisation.
          </Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.descriptionRow}>
            <Image source={descriptionImage} style={styles.descriptionImage} contentFit="cover" />
            <Text style={styles.descriptionText}>
              Nous proposons des <Text style={{ fontFamily: Fonts.bold }}>productions multimédias religieuses</Text> (livres, audio, vidéos, images, feuillets...) via un service de vente par correspondance, par l'intermédiaire du catalogue, des sites internet et du mensuel Chrétiens Magazine.
            </Text>
          </View>

          <View style={styles.descriptionRow}>
            <Text style={styles.descriptionText}>
                Cette application est destinée à vous faire découvrir des <Text style={{ fontFamily: Fonts.bold }}>milliers d&apos;heures</Text> d&apos;audiolivres consacrés à la spiritualité catholique — <Text style={{ fontFamily: Fonts.bold }}>librement accessibles</Text>, directement depuis votre appareil.
            </Text>
            <Ionicons name="headset" size={80} color={Colors.secondary} style={styles.descriptionIcon} />
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
    backgroundColor: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero
  hero: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    paddingTop: 0,
    paddingHorizontal: 24,
  },
  logo: {
    width: "80%",
    height: 130,
  },

  // Intro strip (primary background)
  introSection: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 30,
    marginTop: 0,
    overflow: "hidden",
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    color: Colors.primary,
    textAlign: "justify",
  },

  // Main card (background color, quote + features + CTA)
  mainCard: {
    backgroundColor: Colors.background,
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 28,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 32,
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    color: Colors.primary,
    textAlign: "left",
  },
  descriptionIcon: {
  },
  descriptionImage: {
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
