import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

import { colors } from "../../constants/colors";
import type { BookLike } from "../../lib/onboarding";
import {
  saveBookLikes,
  saveUserPreferences,
  setOnboardingCompleted,
} from "../../lib/onboarding";

/* ---------- art asset (same as login, approved by user) ---------- */
const artImage = require("../../assets/login-art.png") as number;

/* ---------- data ---------- */

const GOALS = [
  {
    id: "habits",
    icon: "\u2728",
    label: "Build better habits",
    subtitle: "Daily routines that stick",
  },
  {
    id: "career",
    icon: "\uD83D\uDE80",
    label: "Boost my career",
    subtitle: "Skills & strategies for growth",
  },
  {
    id: "grow",
    icon: "\uD83C\uDF31",
    label: "Grow as a person",
    subtitle: "Self-awareness & mindset",
  },
  {
    id: "ideas",
    icon: "\uD83D\uDCA1",
    label: "Get inspired by new ideas",
    subtitle: "Creativity & innovation",
  },
  {
    id: "world",
    icon: "\uD83C\uDF0D",
    label: "Understand the world",
    subtitle: "History, science & culture",
  },
  {
    id: "learn",
    icon: "\uD83D\uDCDA",
    label: "Learn something new daily",
    subtitle: "Bite-sized knowledge every day",
  },
];

const CATEGORIES = [
  {
    id: "motivation",
    icon: "\uD83D\uDD25",
    label: "Motivation & Inspiration",
    subtitle: "Stay driven & focused",
  },
  {
    id: "business",
    icon: "\uD83D\uDCBC",
    label: "Business & Career",
    subtitle: "Leadership & strategy",
  },
  {
    id: "personal",
    icon: "\uD83C\uDFAF",
    label: "Personal Development",
    subtitle: "Become your best self",
  },
  {
    id: "health",
    icon: "\uD83E\uDDD8",
    label: "Health & Wellness",
    subtitle: "Mind, body & nutrition",
  },
  {
    id: "money",
    icon: "\uD83D\uDCB0",
    label: "Money & Finance",
    subtitle: "Investing & financial freedom",
  },
  {
    id: "science",
    icon: "\uD83D\uDD2C",
    label: "Science & Technology",
    subtitle: "How the world works",
  },
  {
    id: "productivity",
    icon: "\u26A1",
    label: "Productivity",
    subtitle: "Get more done, better",
  },
  {
    id: "communication",
    icon: "\uD83D\uDDE3\uFE0F",
    label: "Communication Skills",
    subtitle: "Influence & persuasion",
  },
];

interface SampleBook {
  title: string;
  author: string;
  category: string;
  coverUrl: string;
}

const SAMPLE_BOOKS: SampleBook[] = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    category: "Personal Development",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "Money & Finance",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Money & Finance",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
  },
  {
    title: "Ikigai",
    author: "Francesc Miralles",
    category: "Health & Wellness",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Motivation & Inspiration",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
  },
];

const PREPARING_STEPS = [
  "Saving titles to your Library",
  "Selecting title recommendations",
  "Creating collections you might like",
];

const TOTAL_VISIBLE_STEPS = 4;
const WIDE_BREAKPOINT = 768;

/* ---------- sub-components ---------- */

function ProgressBar({ step }: { step: number }) {
  const progress = Math.min(((step + 1) / TOTAL_VISIBLE_STEPS) * 100, 100);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 40,
      friction: 10,
    }).start();
  }, [progress, widthAnim]);

  return (
    <View style={s.progressContainer}>
      <View style={s.progressTrack}>
        <Animated.View
          style={[
            s.progressFill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      <Text style={s.progressLabel}>
        Step {Math.min(step + 1, TOTAL_VISIBLE_STEPS)} of {TOTAL_VISIBLE_STEPS}
      </Text>
    </View>
  );
}

function OptionCard({
  icon,
  label,
  subtitle,
  selected,
  onPress,
}: {
  icon: string;
  label: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[s.optionCard, selected && s.optionCardSelected]}
      onPress={onPress}
    >
      <View style={[s.optionIconCircle, selected && s.optionIconCircleSelected]}>
        <Text style={s.optionIconText}>{icon}</Text>
      </View>
      <View style={s.optionTextCol}>
        <Text style={[s.optionTitle, selected && s.optionTitleSelected]}>
          {label}
        </Text>
        <Text style={s.optionSubtitle}>{subtitle}</Text>
      </View>
      {selected ? (
        <Text style={s.optionCheck}>{"\u2713"}</Text>
      ) : (
        <Text style={s.optionArrow}>{"\u2192"}</Text>
      )}
    </Pressable>
  );
}

function GoalsStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={s.stepBody}>
      <Text style={s.stepHeading}>
        What are your biggest goals right now?
      </Text>
      <Text style={s.stepSubheading}>
        You can always update your answers later.
      </Text>
      <View style={s.optionsList}>
        {GOALS.map((g) => (
          <OptionCard
            key={g.id}
            icon={g.icon}
            label={g.label}
            subtitle={g.subtitle}
            selected={selected.includes(g.id)}
            onPress={() => onToggle(g.id)}
          />
        ))}
      </View>
    </View>
  );
}

function CategoriesStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={s.stepBody}>
      <Text style={s.stepHeading}>
        Follow categories you&apos;re interested in
      </Text>
      <Text style={s.stepSubheading}>
        We&apos;ll recommend books from these genres.
      </Text>
      <View style={s.optionsList}>
        {CATEGORIES.map((c) => (
          <OptionCard
            key={c.id}
            icon={c.icon}
            label={c.label}
            subtitle={c.subtitle}
            selected={selected.includes(c.id)}
            onPress={() => onToggle(c.id)}
          />
        ))}
      </View>
    </View>
  );
}

function BookPicksStep({
  currentIndex,
  onLike,
  onDislike,
  onSkip,
}: {
  currentIndex: number;
  onLike: () => void;
  onDislike: () => void;
  onSkip: () => void;
}) {
  const book = SAMPLE_BOOKS[currentIndex];
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    cardAnim.setValue(40);
    scaleAnim.setValue(0.9);
    Animated.parallel([
      Animated.spring(cardAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
    ]).start();
  }, [currentIndex, cardAnim, scaleAnim]);

  if (!book) return null;

  return (
    <View style={s.stepBody}>
      <Text style={s.stepHeading}>Does this title look interesting?</Text>
      <Text style={s.stepSubheading}>
        Titles you like will be saved to your library.
      </Text>
      <Animated.View
        style={[
          s.bookCard,
          {
            transform: [{ translateY: cardAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={{ uri: book.coverUrl }}
          style={s.bookCover}
          resizeMode="cover"
        />
        <Text style={s.bookTitle}>{book.title}</Text>
        <Text style={s.bookAuthor}>{book.author}</Text>
        <View style={s.bookBadge}>
          <Text style={s.bookBadgeText}>{book.category}</Text>
        </View>
      </Animated.View>
      <View style={s.voteRow}>
        <Pressable style={s.voteBtn} onPress={onDislike}>
          <Text style={s.voteBtnEmoji}>{"\uD83D\uDC4E"}</Text>
        </Pressable>
        <Pressable style={s.skipLink} onPress={onSkip}>
          <Text style={s.skipLinkText}>Skip</Text>
        </Pressable>
        <Pressable style={[s.voteBtn, s.voteBtnLike]} onPress={onLike}>
          <Text style={s.voteBtnEmoji}>{"\uD83D\uDC4D"}</Text>
        </Pressable>
      </View>
      <Text style={s.bookCounter}>
        {currentIndex + 1} of {SAMPLE_BOOKS.length}
      </Text>
    </View>
  );
}

function PreparingStep({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current > 100) {
        clearInterval(interval);
        onDone();
        return;
      }
      setProgress(current);

      if (current >= 33 && !completedSteps.includes(0)) {
        setCompletedSteps((prev) => [...prev, 0]);
      }
      if (current >= 66 && !completedSteps.includes(1)) {
        setCompletedSteps((prev) => [...prev, 1]);
      }
      if (current >= 95 && !completedSteps.includes(2)) {
        setCompletedSteps((prev) => [...prev, 2]);
      }
    }, 60);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={s.stepBody}>
      <Text style={s.stepHeading}>Setting things up...</Text>
      <Text style={s.stepSubheading}>
        We&apos;re preparing your personalized reading experience.
      </Text>

      <View style={s.preparingBarContainer}>
        <View style={s.preparingBarTrack}>
          <View style={[s.preparingBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={s.preparingChecklist}>
        {PREPARING_STEPS.map((label, i) => {
          const done = completedSteps.includes(i);
          const active =
            !done &&
            (i === 0 || completedSteps.includes(i - 1));
          return (
            <View key={label} style={s.preparingItem}>
              <View
                style={[
                  s.preparingDot,
                  done && s.preparingDotDone,
                  active && s.preparingDotActive,
                ]}
              >
                {done && <Text style={s.preparingDotCheck}>{"\u2713"}</Text>}
              </View>
              {i < PREPARING_STEPS.length - 1 && (
                <View
                  style={[s.preparingLine, done && s.preparingLineDone]}
                />
              )}
              <Text
                style={[
                  s.preparingLabel,
                  done && s.preparingLabelDone,
                  active && s.preparingLabelActive,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SubscriptionStep({
  selectedPlan,
  onSelectPlan,
  onSubscribe,
  onSkip,
}: {
  selectedPlan: "annual" | "monthly";
  onSelectPlan: (plan: "annual" | "monthly") => void;
  onSubscribe: () => void;
  onSkip: () => void;
}) {
  return (
    <View style={s.stepBody}>
      <Text style={s.stepHeading}>Read without limits</Text>
      <View style={s.ratingRow}>
        <Text style={s.stars}>{"\u2B50\u2B50\u2B50\u2B50\u2B50"}</Text>
        <Text style={s.ratingText}>4.7 stars from 50,000+ readers</Text>
      </View>

      <View style={s.featureList}>
        {[
          "Unlimited Telugu book summaries",
          "Audio playback for every summary",
          "New titles added weekly",
          "Download for offline reading",
        ].map((f) => (
          <View key={f} style={s.featureItem}>
            <Text style={s.featureCheck}>{"\u2713"}</Text>
            <Text style={s.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[s.planCard, selectedPlan === "annual" && s.planCardSelected]}
        onPress={() => onSelectPlan("annual")}
      >
        <View style={s.planBadge}>
          <Text style={s.planBadgeText}>OUR BEST VALUE</Text>
        </View>
        <View style={s.planRow}>
          <View>
            <Text style={s.planName}>Annual</Text>
            <Text style={s.planDetail}>7 days free, then billed yearly</Text>
          </View>
          <Text style={s.planPrice}>$2.49/week</Text>
        </View>
      </Pressable>

      <Pressable
        style={[s.planCard, selectedPlan === "monthly" && s.planCardSelected]}
        onPress={() => onSelectPlan("monthly")}
      >
        <View style={s.planRow}>
          <View>
            <Text style={s.planName}>Monthly</Text>
            <Text style={s.planDetail}>$9.99/month</Text>
          </View>
          <Text style={s.planPrice}>$2.99/week</Text>
        </View>
      </Pressable>

      <Pressable style={s.ctaBtn} onPress={onSubscribe}>
        <Text style={s.ctaBtnText}>Start your free 7-day trial</Text>
      </Pressable>

      <Text style={s.finePrint}>
        Cancel anytime. Secure payment via App Store or Google Play.
      </Text>

      <Pressable onPress={onSkip} style={s.skipSub}>
        <Text style={s.skipSubText}>Maybe later</Text>
      </Pressable>
    </View>
  );
}

/* ---------- main component ---------- */

export default function OnboardingScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isWide = screenWidth >= WIDE_BREAKPOINT;

  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bookLikes, setBookLikes] = useState<BookLike[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">(
    "annual"
  );

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback(
    (nextStep: number) => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setStep(nextStep);
        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim]
  );

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleBookVote = (liked: boolean) => {
    const book = SAMPLE_BOOKS[currentBookIndex];
    if (!book) return;

    setBookLikes((prev) => [
      ...prev,
      {
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCoverUrl: book.coverUrl,
        bookCategory: book.category,
        liked,
      },
    ]);

    if (currentBookIndex < SAMPLE_BOOKS.length - 1) {
      setCurrentBookIndex((prev) => prev + 1);
    } else {
      animateTransition(3);
    }
  };

  const handleBookSkip = () => {
    if (currentBookIndex < SAMPLE_BOOKS.length - 1) {
      setCurrentBookIndex((prev) => prev + 1);
    } else {
      animateTransition(3);
    }
  };

  const handleNext = () => {
    if (step === 0 && selectedGoals.length === 0) return;
    if (step === 1 && selectedCategories.length === 0) return;
    animateTransition(step + 1);
  };

  const handlePreparingDone = useCallback(() => {
    void saveUserPreferences(selectedGoals, selectedCategories);
    void saveBookLikes(bookLikes);
    animateTransition(4);
  }, [selectedGoals, selectedCategories, bookLikes, animateTransition]);

  const handleSubscribe = () => {
    void setOnboardingCompleted().then(() => {
      router.replace("/(tabs)");
    });
  };

  const handleSkipSubscription = () => {
    void setOnboardingCompleted().then(() => {
      router.replace("/(tabs)");
    });
  };

  const canContinue =
    (step === 0 && selectedGoals.length > 0) ||
    (step === 1 && selectedCategories.length > 0);

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <GoalsStep selected={selectedGoals} onToggle={toggleGoal} />;
      case 1:
        return (
          <CategoriesStep
            selected={selectedCategories}
            onToggle={toggleCategory}
          />
        );
      case 2:
        return (
          <BookPicksStep
            currentIndex={currentBookIndex}
            onLike={() => handleBookVote(true)}
            onDislike={() => handleBookVote(false)}
            onSkip={handleBookSkip}
          />
        );
      case 3:
        return <PreparingStep onDone={handlePreparingDone} />;
      case 4:
        return (
          <SubscriptionStep
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            onSubscribe={handleSubscribe}
            onSkip={handleSkipSubscription}
          />
        );
      default:
        return null;
    }
  };

  const showProgressBar = step < 3;
  const showContinueBtn = step < 2;

  const formContent = (
    <View style={s.formPanel}>
      <ScrollView
        contentContainerStyle={s.formScroll}
        showsVerticalScrollIndicator={false}
      >
        {showProgressBar && <ProgressBar step={step} />}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            flex: 1,
          }}
        >
          {renderStepContent()}
        </Animated.View>
        {showContinueBtn && (
          <Pressable
            style={[s.ctaBtn, !canContinue && s.ctaBtnDisabled]}
            onPress={handleNext}
            disabled={!canContinue}
          >
            <Text style={s.ctaBtnText}>Continue</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );

  if (isWide) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.splitContainer}>
          {formContent}
          <View style={s.artPanelWide}>
            <Image
              source={artImage}
              style={s.artImg}
              resizeMode="cover"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView
        contentContainerStyle={s.mobileScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.artPanelMobile}>
          <Image source={artImage} style={s.artImg} resizeMode="cover" />
        </View>
        <View style={s.mobileContent}>
          {showProgressBar && <ProgressBar step={step} />}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {renderStepContent()}
          </Animated.View>
          {showContinueBtn && (
            <Pressable
              style={[s.ctaBtn, !canContinue && s.ctaBtnDisabled]}
              onPress={handleNext}
              disabled={!canContinue}
            >
              <Text style={s.ctaBtnText}>Continue</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* ---------- two-panel desktop ---------- */
  splitContainer: {
    flex: 1,
    flexDirection: "row",
  },
  formPanel: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 40,
    paddingVertical: 32,
  },
  formScroll: {
    flexGrow: 1,
    maxWidth: 520,
  },
  artPanelWide: {
    flex: 1,
    overflow: "hidden",
  },
  artImg: {
    width: "100%",
    height: "100%",
  },

  /* ---------- mobile stacked ---------- */
  mobileScroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  artPanelMobile: {
    width: "100%",
    height: 220,
    overflow: "hidden",
  },
  mobileContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  /* ---------- progress bar ---------- */
  progressContainer: {
    marginBottom: 28,
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 4,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    height: "100%",
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },

  /* ---------- step content ---------- */
  stepBody: {
    paddingTop: 8,
  },
  stepHeading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 34,
  },
  stepSubheading: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 4,
  },

  /* ---------- option cards (Ferndesk-style) ---------- */
  optionsList: {
    gap: 10,
    marginTop: 20,
  },
  optionCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionCardSelected: {
    borderColor: colors.text,
    borderWidth: 2,
  },
  optionIconCircle: {
    alignItems: "center",
    backgroundColor: "#f5f5f4",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  optionIconCircleSelected: {
    backgroundColor: "#e7e5e4",
  },
  optionIconText: {
    fontSize: 20,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  optionTitleSelected: {
    fontWeight: "700",
  },
  optionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  optionArrow: {
    color: colors.textMuted,
    fontSize: 18,
  },
  optionCheck: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },

  /* ---------- book picks ---------- */
  bookCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    padding: 20,
    width: "100%",
    maxWidth: 300,
  },
  bookCover: {
    borderRadius: 10,
    height: 220,
    width: 150,
  },
  bookTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },
  bookAuthor: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  bookBadge: {
    backgroundColor: "#f5f5f4",
    borderRadius: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  bookBadgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  voteRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    marginTop: 20,
  },
  voteBtn: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  voteBtnLike: {
    borderColor: colors.accent,
  },
  voteBtnEmoji: {
    fontSize: 24,
  },
  skipLink: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipLinkText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  bookCounter: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },

  /* ---------- preparing step (Ferndesk style) ---------- */
  preparingBarContainer: {
    marginTop: 24,
    marginBottom: 28,
  },
  preparingBarTrack: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 6,
    overflow: "hidden",
  },
  preparingBarFill: {
    backgroundColor: colors.text,
    borderRadius: 4,
    height: "100%",
  },
  preparingChecklist: {
    gap: 0,
  },
  preparingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    position: "relative",
  },
  preparingDot: {
    alignItems: "center",
    backgroundColor: colors.border,
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  preparingDotDone: {
    backgroundColor: colors.accent,
  },
  preparingDotActive: {
    backgroundColor: colors.border,
  },
  preparingDotCheck: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "700",
  },
  preparingLine: {
    backgroundColor: colors.border,
    height: 20,
    left: 11,
    position: "absolute",
    top: 34,
    width: 2,
  },
  preparingLineDone: {
    backgroundColor: colors.accent,
  },
  preparingLabel: {
    color: colors.textMuted,
    fontSize: 15,
  },
  preparingLabelDone: {
    color: colors.textSecondary,
  },
  preparingLabelActive: {
    color: colors.text,
    fontWeight: "600",
  },

  /* ---------- subscription ---------- */
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  stars: {
    fontSize: 14,
  },
  ratingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  featureList: {
    gap: 10,
    marginTop: 24,
  },
  featureItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  featureCheck: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "700",
  },
  featureText: {
    color: colors.text,
    fontSize: 15,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  planCardSelected: {
    borderColor: colors.text,
    borderWidth: 2,
  },
  planBadge: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent,
    borderRadius: 6,
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  planBadgeText: {
    color: colors.primaryText,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  planRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  planDetail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  planPrice: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  finePrint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
  skipSub: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 8,
  },
  skipSubText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  /* ---------- CTA button ---------- */
  ctaBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginTop: 24,
    paddingVertical: 16,
  },
  ctaBtnDisabled: {
    opacity: 0.35,
  },
  ctaBtnText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});
