import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { colors } from "../../constants/colors";
import type { BookLike } from "../../lib/onboarding";
import {
  saveBookLikes,
  saveUserPreferences,
  setOnboardingCompleted,
} from "../../lib/onboarding";

/* ---------- art assets ---------- */
const goalsArt = require("../../assets/onboarding-goals.png") as number;
const categoriesArt = require("../../assets/onboarding-categories.png") as number;
const discoveryArt = require("../../assets/onboarding-discovery.png") as number;
const subscriptionArt = require("../../assets/onboarding-subscription.png") as number;

const ART_BY_STEP: Record<number, number> = {
  0: goalsArt,
  1: categoriesArt,
  2: discoveryArt,
  4: subscriptionArt,
};

/* ---------- data ---------- */

const GOALS = [
  { id: "habits", label: "Build better habits", icon: "\u2728" },
  { id: "career", label: "Boost my career", icon: "\uD83D\uDE80" },
  { id: "grow", label: "Grow as a person", icon: "\uD83C\uDF31" },
  { id: "ideas", label: "Get inspired by new ideas", icon: "\uD83D\uDCA1" },
  { id: "world", label: "Understand the world", icon: "\uD83C\uDF0D" },
  { id: "learn", label: "Learn something new daily", icon: "\uD83D\uDCDA" },
];

const CATEGORIES = [
  { id: "motivation", label: "Motivation & Inspiration", icon: "\uD83D\uDD25" },
  { id: "business", label: "Business & Career", icon: "\uD83D\uDCBC" },
  { id: "personal", label: "Personal Development", icon: "\uD83C\uDFAF" },
  { id: "health", label: "Health & Wellness", icon: "\uD83E\uDDD8" },
  { id: "money", label: "Money & Finance", icon: "\uD83D\uDCB0" },
  { id: "science", label: "Science & Technology", icon: "\uD83D\uDD2C" },
  { id: "productivity", label: "Productivity", icon: "\u26A1" },
  { id: "communication", label: "Communication Skills", icon: "\uD83D\uDDE3\uFE0F" },
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

/* ---------- constants ---------- */

const TOTAL_STEPS = 4;
const WIDE_BREAKPOINT = 768;

/* ---------- sub-components ---------- */

function ProgressBar({ step }: { step: number }) {
  const progress = Math.min(((step + 1) / TOTAL_STEPS) * 100, 100);
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
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarTrack}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressBarLabel}>
        Step {Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS}
      </Text>
    </View>
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
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        What are your biggest goals right now?
      </Text>
      <Text style={styles.stepSubtitle}>
        You can always update your answers later.
      </Text>
      <View style={styles.optionsList}>
        {GOALS.map((goal) => {
          const isSelected = selected.includes(goal.id);
          return (
            <Pressable
              key={goal.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => onToggle(goal.id)}
            >
              <Text style={styles.optionIcon}>{goal.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {goal.label}
              </Text>
              {isSelected && <Text style={styles.checkmark}>{"\u2713"}</Text>}
            </Pressable>
          );
        })}
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
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        Follow categories you&apos;re interested in
      </Text>
      <Text style={styles.stepSubtitle}>
        We&apos;ll recommend books from these genres.
      </Text>
      <View style={styles.optionsList}>
        {CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat.id);
          return (
            <Pressable
              key={cat.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => onToggle(cat.id)}
            >
              <Text style={styles.optionIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {cat.label}
              </Text>
              {isSelected && <Text style={styles.checkmark}>{"\u2713"}</Text>}
            </Pressable>
          );
        })}
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
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Does this title look interesting?</Text>
      <Text style={styles.stepSubtitle}>
        Titles you like will be saved to your library.
      </Text>
      <Animated.View
        style={[
          styles.bookCard,
          {
            transform: [
              { translateY: cardAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Image
          source={{ uri: book.coverUrl }}
          style={styles.bookCover}
          resizeMode="cover"
        />
        <Text style={styles.bookTitle}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <View style={styles.bookCategoryBadge}>
          <Text style={styles.bookCategoryText}>{book.category}</Text>
        </View>
      </Animated.View>
      <View style={styles.voteRow}>
        <Pressable style={styles.voteBtn} onPress={onDislike}>
          <Text style={styles.voteBtnText}>{"\uD83D\uDC4E"}</Text>
        </Pressable>
        <Pressable style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </Pressable>
        <Pressable style={[styles.voteBtn, styles.voteBtnLike]} onPress={onLike}>
          <Text style={styles.voteBtnText}>{"\uD83D\uDC4D"}</Text>
        </Pressable>
      </View>
      <Text style={styles.bookCounter}>
        {currentIndex + 1} of {SAMPLE_BOOKS.length}
      </Text>
    </View>
  );
}

function PreparingStep({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const ringAnim = useRef(new Animated.Value(0)).current;

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

    Animated.loop(
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spin = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.preparingContainer}>
      <View style={styles.progressRingOuter}>
        <Animated.View
          style={[
            styles.progressRingSpinner,
            { transform: [{ rotate: spin }] },
          ]}
        />
        <Text style={styles.progressRingText}>{progress}%</Text>
      </View>
      <Text style={styles.preparingTitle}>Preparing your content</Text>
      <View style={styles.preparingChecklist}>
        {PREPARING_STEPS.map((label, i) => {
          const done = completedSteps.includes(i);
          return (
            <Animated.View
              key={label}
              style={[styles.preparingItem, { opacity: done ? 1 : 0.4 }]}
            >
              <Text style={styles.preparingCheck}>
                {done ? "\u2705" : "\u23F3"}
              </Text>
              <Text style={styles.preparingLabel}>{label}</Text>
            </Animated.View>
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
    <View style={styles.stepContent}>
      <Text style={styles.subscriptionHeading}>Read without limits</Text>
      <View style={styles.ratingRow}>
        <Text style={styles.stars}>{"\u2B50\u2B50\u2B50\u2B50\u2B50"}</Text>
        <Text style={styles.ratingText}>4.7 stars from 50,000+ readers</Text>
      </View>

      <View style={styles.featureList}>
        {[
          "Unlimited Telugu book summaries",
          "Audio playback for every summary",
          "New titles added weekly",
          "Download for offline reading",
        ].map((feature) => (
          <View key={feature} style={styles.featureItem}>
            <Text style={styles.featureCheck}>{"\u2713"}</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[
          styles.planCard,
          selectedPlan === "annual" && styles.planCardSelected,
        ]}
        onPress={() => onSelectPlan("annual")}
      >
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>OUR BEST VALUE</Text>
        </View>
        <View style={styles.planRow}>
          <View>
            <Text style={styles.planName}>Annual</Text>
            <Text style={styles.planDetail}>7 days free, then billed yearly</Text>
          </View>
          <Text style={styles.planPrice}>$2.49/week</Text>
        </View>
      </Pressable>

      <Pressable
        style={[
          styles.planCard,
          selectedPlan === "monthly" && styles.planCardSelected,
        ]}
        onPress={() => onSelectPlan("monthly")}
      >
        <View style={styles.planRow}>
          <View>
            <Text style={styles.planName}>Monthly</Text>
            <Text style={styles.planDetail}>$9.99/month</Text>
          </View>
          <Text style={styles.planPrice}>$2.99/week</Text>
        </View>
      </Pressable>

      <Pressable style={styles.subscribeBtn} onPress={onSubscribe}>
        <Text style={styles.subscribeBtnText}>Start your free 7-day trial</Text>
      </Pressable>

      <Text style={styles.subscriptionFine}>
        Cancel anytime. Secure payment via App Store or Google Play.
      </Text>

      <Pressable onPress={onSkip} style={styles.skipSubscription}>
        <Text style={styles.skipSubscriptionText}>Maybe later</Text>
      </Pressable>
    </View>
  );
}

/* ---------- main component ---------- */

export default function OnboardingScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const isWide = screenWidth >= WIDE_BREAKPOINT;

  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bookLikes, setBookLikes] = useState<BookLike[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");

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

  const renderContent = () => {
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
  const showNextButton = step < 2;
  const artSource = ART_BY_STEP[step];

  if (isWide) {
    return (
      <View style={styles.container}>
        <View style={styles.leftPanel}>
          <ScrollView
            contentContainerStyle={styles.leftPanelScroll}
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
              {renderContent()}
            </Animated.View>
            {showNextButton && (
              <Pressable
                style={[
                  styles.continueBtn,
                  !canContinue && styles.continueBtnDisabled,
                ]}
                onPress={handleNext}
                disabled={!canContinue}
              >
                <Text style={styles.continueBtnText}>Continue</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
        {artSource != null && (
          <View style={styles.rightPanel}>
            <Image
              source={artSource}
              style={styles.artImage}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.mobileScroll}
      showsVerticalScrollIndicator={false}
    >
      {artSource != null && (
        <Image
          source={artSource}
          style={styles.mobileBanner}
          resizeMode="cover"
        />
      )}
      {showProgressBar && <ProgressBar step={step} />}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {renderContent()}
      </Animated.View>
      {showNextButton && (
        <Pressable
          style={[
            styles.continueBtn,
            !canContinue && styles.continueBtnDisabled,
            { marginHorizontal: 24, marginBottom: 40 },
          ]}
          onPress={handleNext}
          disabled={!canContinue}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },

  /* two-panel desktop */
  leftPanel: {
    flex: 1,
    maxWidth: 600,
    paddingHorizontal: 48,
    paddingVertical: 40,
  },
  leftPanelScroll: {
    flexGrow: 1,
  },
  rightPanel: {
    flex: 1,
    overflow: "hidden",
  },
  artImage: {
    height: "100%",
    width: "100%",
  },

  /* mobile stacked */
  mobileScroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  mobileBanner: {
    height: 260,
    width: "100%",
  },

  /* progress bar */
  progressBarContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  progressBarTrack: {
    backgroundColor: colors.border,
    borderRadius: 6,
    height: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    height: "100%",
  },
  progressBarLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
  },

  /* step content */
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  stepTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
  },
  stepSubtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
  },

  /* multi-select options */
  optionsList: {
    gap: 12,
    marginTop: 24,
  },
  optionCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionCardSelected: {
    borderColor: colors.accent,
  },
  optionIcon: {
    fontSize: 22,
  },
  optionLabel: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  optionLabelSelected: {
    color: colors.accent,
    fontWeight: "600",
  },
  checkmark: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "700",
  },

  /* book picks */
  bookCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 24,
    padding: 20,
    width: "100%",
    maxWidth: 320,
  },
  bookCover: {
    borderRadius: 12,
    height: 240,
    width: 160,
  },
  bookTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  bookAuthor: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 4,
    textAlign: "center",
  },
  bookCategoryBadge: {
    backgroundColor: colors.border,
    borderRadius: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  bookCategoryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  voteRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    marginTop: 24,
  },
  voteBtn: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 2,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  voteBtnLike: {
    borderColor: colors.accent,
  },
  voteBtnText: {
    fontSize: 28,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipBtnText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "500",
  },
  bookCounter: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },

  /* preparing step */
  preparingContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  progressRingOuter: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 80,
    borderWidth: 6,
    height: 160,
    justifyContent: "center",
    width: 160,
  },
  progressRingSpinner: {
    borderColor: "transparent",
    borderRadius: 80,
    borderTopColor: colors.accent,
    borderWidth: 4,
    height: 160,
    left: -6,
    position: "absolute",
    top: -6,
    width: 160,
  },
  progressRingText: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "700",
  },
  preparingTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 32,
  },
  preparingChecklist: {
    gap: 16,
    marginTop: 24,
  },
  preparingItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  preparingCheck: {
    fontSize: 20,
  },
  preparingLabel: {
    color: colors.text,
    fontSize: 16,
  },

  /* subscription */
  subscriptionHeading: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  ratingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
  },
  stars: {
    fontSize: 16,
  },
  ratingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  featureList: {
    gap: 12,
    marginTop: 24,
  },
  featureItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  featureCheck: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "700",
  },
  featureText: {
    color: colors.text,
    fontSize: 16,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 2,
    marginTop: 16,
    padding: 16,
  },
  planCardSelected: {
    borderColor: colors.accent,
  },
  planBadge: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planBadgeText: {
    color: colors.primaryText,
    fontSize: 11,
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
    fontSize: 18,
    fontWeight: "700",
  },
  planDetail: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  planPrice: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  subscribeBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    marginTop: 24,
    paddingVertical: 16,
  },
  subscribeBtnText: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: "700",
  },
  subscriptionFine: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  skipSubscription: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  skipSubscriptionText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
  },

  /* continue button */
  continueBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    marginTop: 24,
    paddingVertical: 16,
  },
  continueBtnDisabled: {
    opacity: 0.4,
  },
  continueBtnText: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: "700",
  },
});
