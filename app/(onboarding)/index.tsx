import { useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import type { ReactNode } from "react";
import { useRouter } from "expo-router";

import { colors } from "../../constants/colors";
import { setOnboardingCompleted } from "../../lib/onboarding";

type SlideConfig = {
  key: string;
  title: string;
  subtitle: string;
  visual: "logo" | "library" | "progress" | "categories" | "audio" | "cta";
};

type SlideWithVisual = Omit<SlideConfig, "visual"> & {
  visualKind: SlideConfig["visual"];
  visual: ReactNode;
};

const slides: SlideConfig[] = [
  {
    key: "logo",
    title: "Book Summaries",
    subtitle: "Telugu book summaries that fit into your day.",
    visual: "logo"
  },
  {
    key: "library",
    title: "Build your library",
    subtitle: "Curate the books you want to revisit and save your favorites.",
    visual: "library"
  },
  {
    key: "progress",
    title: "Track your momentum",
    subtitle: "Pick up where you left off and keep moving chapter by chapter.",
    visual: "progress"
  },
  {
    key: "categories",
    title: "Choose what you want next",
    subtitle: "Motivation, business, habits, and ideas — all in one place.",
    visual: "categories"
  },
  {
    key: "audio",
    title: "Listen on the go",
    subtitle: "Play each chapter in sequence while you commute, walk, or relax.",
    visual: "audio"
  },
  {
    key: "cta",
    title: "Ready to start?",
    subtitle: "Set up your account and begin your first Telugu book summary.",
    visual: "cta"
  }
];

function DropletLogo() {
  return (
    <View style={styles.logoWrap}>
      <View style={styles.logoOuter} />
      <View style={styles.logoInner} />
    </View>
  );
}

function Header() {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusTime}>9:41</Text>
      <View style={styles.statusIcons}>
        <View style={styles.signal} />
        <View style={styles.signalShort} />
        <View style={styles.battery} />
      </View>
    </View>
  );
}

function LibraryIllustration() {
  const books = [
    ["#0f766e", "Think and Grow Rich"],
    ["#ef4444", "The 5 AM Club"],
    ["#8b5cf6", "Atomic Habits"],
    ["#f59e0b", "Sapiens"]
  ];

  return (
    <View style={styles.libraryCardWrap}>
      <View style={styles.libraryGrid}>
        {books.map(([backgroundColor, title]) => (
          <View key={title} style={[styles.bookCover, { backgroundColor }]}>
            <Text style={styles.bookCoverText}>{title}</Text>
          </View>
        ))}
      </View>
      <View style={styles.libraryFooter}>
        <DropletLogo />
        <Text style={styles.libraryCaption}>A faster way to catch up on books.</Text>
      </View>
    </View>
  );
}

function ProgressIllustration() {
  return (
    <View style={styles.progressVisual}>
      <View style={styles.progressRing}>
        <Text style={styles.progressValue}>10%</Text>
      </View>
      <Text style={styles.progressHeading}>Preparing your content</Text>
      <Text style={styles.progressText}>Saving titles to your Library</Text>
    </View>
  );
}

function CategoriesIllustration() {
  const chips = ["Motivation", "Business", "Habits", "Money", "Tech", "Health"];

  return (
    <View style={styles.categoriesVisual}>
      <View style={styles.choiceCard}>
        <Text style={styles.choiceTitle}>What do you want to hear about?</Text>
        <View style={styles.chipGrid}>
          {chips.map((chip, index) => (
            <View key={chip} style={[styles.chip, index % 2 === 0 ? styles.chipDark : styles.chipLight]}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.likeRow}>
        <View style={styles.voteButton}>
          <Text style={styles.voteIcon}>▾</Text>
        </View>
        <View style={[styles.voteButton, styles.voteButtonPrimary]}>
          <Text style={styles.voteIconPrimary}>▴</Text>
        </View>
      </View>
    </View>
  );
}

function AudioIllustration() {
  return (
    <View style={styles.audioCard}>
      <View style={styles.audioCover}>
        <Text style={styles.audioCoverTitle}>The Let Them Theory</Text>
      </View>
      <View style={styles.audioPlayer}>
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>▶</Text>
        </View>
        <View style={styles.waveform}>
          <View style={styles.waveShort} />
          <View style={styles.waveTall} />
          <View style={styles.waveMid} />
          <View style={styles.waveTall} />
          <View style={styles.waveShort} />
        </View>
      </View>
    </View>
  );
}

function CtaIllustration() {
  return (
    <View style={styles.ctaCard}>
      <DropletLogo />
      <Text style={styles.ctaCardTitle}>Book Summaries</Text>
      <Text style={styles.ctaCardText}>Read less. Learn more.</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<SlideWithVisual>>(null);
  const [index, setIndex] = useState(0);

  const isLastSlide = index === slides.length - 1;

  const slidesWithVisuals = useMemo<SlideWithVisual[]>(
    () =>
      slides.map((slide) => {
        let visual: ReactNode = null;

        switch (slide.visual) {
          case "logo":
            visual = (
              <View style={styles.logoScene}>
                <Header />
                <View style={styles.centerLogo}>
                  <DropletLogo />
                </View>
              </View>
            );
            break;
          case "library":
            visual = <LibraryIllustration />;
            break;
          case "progress":
            visual = <ProgressIllustration />;
            break;
          case "categories":
            visual = <CategoriesIllustration />;
            break;
          case "audio":
            visual = <AudioIllustration />;
            break;
          case "cta":
            visual = <CtaIllustration />;
            break;
        }

        return { key: slide.key, title: slide.title, subtitle: slide.subtitle, visualKind: slide.visual, visual };
      }),
    []
  );

  const goNext = () => {
    if (isLastSlide) {
      void setOnboardingCompleted().then(() => {
        router.replace("/(auth)/register");
      });
      return;
    }

    const nextIndex = index + 1;
    listRef.current?.scrollToIndex({ animated: true, index: nextIndex });
    setIndex(nextIndex);
  };

  const skip = () => {
    void setOnboardingCompleted().then(() => {
      router.replace("/(auth)/register");
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={slidesWithVisuals}
        keyExtractor={(item) => item.key}
        ref={listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex
        })}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
          setIndex(nextIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            {item.visual}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((slide, slideIndex) => (
            <View key={slide.key} style={[styles.dot, slideIndex === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={skip} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Skip</Text>
          </Pressable>
          <Pressable onPress={goNext} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{isLastSlide ? "Get started" : "Continue"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  slide: {
    width: 1024,
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 180,
    justifyContent: "center"
  },
  logoScene: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 560,
    justifyContent: "flex-start",
    padding: 24
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  },
  statusTime: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600"
  },
  statusIcons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  signal: {
    borderBottomColor: colors.text,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    height: 12,
    width: 14
  },
  signalShort: {
    borderBottomColor: colors.text,
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    height: 10,
    width: 12
  },
  battery: {
    borderColor: colors.text,
    borderRadius: 4,
    borderWidth: 2,
    height: 14,
    width: 26
  },
  centerLogo: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  logoWrap: {
    height: 96,
    width: 96
  },
  logoOuter: {
    backgroundColor: "#86efac",
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    height: 96,
    position: "absolute",
    width: 96
  },
  logoInner: {
    backgroundColor: "#0f172a",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 48,
    left: 24,
    position: "absolute",
    top: 24,
    width: 48
  },
  libraryCardWrap: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    padding: 20
  },
  libraryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    paddingVertical: 20,
    width: "100%"
  },
  bookCover: {
    alignItems: "center",
    borderRadius: 16,
    height: 190,
    justifyContent: "center",
    padding: 12,
    width: 130
  },
  bookCoverText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center"
  },
  libraryFooter: {
    alignItems: "center",
    gap: 12,
    marginTop: 12
  },
  libraryCaption: {
    color: colors.textMuted,
    fontSize: 18,
    textAlign: "center"
  },
  progressVisual: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 560,
    justifyContent: "center"
  },
  progressRing: {
    alignItems: "center",
    borderColor: "#d1d5db",
    borderRadius: 80,
    borderWidth: 6,
    height: 160,
    justifyContent: "center",
    width: 160
  },
  progressValue: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: "700"
  },
  progressHeading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginTop: 26
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 18,
    marginTop: 8
  },
  categoriesVisual: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 560,
    justifyContent: "center",
    padding: 24
  },
  choiceCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    padding: 20,
    width: "100%"
  },
  choiceTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  chipDark: {
    backgroundColor: "#111827"
  },
  chipLight: {
    backgroundColor: "#dbeafe"
  },
  chipText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  likeRow: {
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
    marginTop: 28
  },
  voteButton: {
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    height: 72,
    justifyContent: "center",
    width: 72
  },
  voteButtonPrimary: {
    backgroundColor: "#22c55e"
  },
  voteIcon: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700"
  },
  voteIconPrimary: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700"
  },
  audioCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 560,
    justifyContent: "center",
    padding: 28
  },
  audioCover: {
    alignItems: "center",
    backgroundColor: "#eab308",
    borderRadius: 24,
    height: 260,
    justifyContent: "center",
    width: 200
  },
  audioCoverTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center"
  },
  audioPlayer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    marginTop: 28
  },
  playButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    width: 64
  },
  playButtonText: {
    color: "#fff",
    fontSize: 24
  },
  waveform: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    height: 64
  },
  waveShort: {
    backgroundColor: "#bfdbfe",
    borderRadius: 6,
    height: 26,
    width: 12
  },
  waveMid: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 40,
    width: 12
  },
  waveTall: {
    backgroundColor: "#60a5fa",
    borderRadius: 6,
    height: 56,
    width: 12
  },
  ctaCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    height: 560,
    justifyContent: "center"
  },
  ctaCardTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "700",
    marginTop: 18
  },
  ctaCardText: {
    color: colors.textMuted,
    fontSize: 18,
    marginTop: 6
  },
  title: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "800",
    marginTop: 28
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 28,
    marginTop: 12,
    maxWidth: 540
  },
  footer: {
    bottom: 24,
    left: 28,
    position: "absolute",
    right: 28
  },
  pagination: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center"
  },
  dot: {
    backgroundColor: "#d1d5db",
    borderRadius: 999,
    height: 10,
    width: 10
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 28
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 18
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 52
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    minHeight: 52
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700"
  }
});
