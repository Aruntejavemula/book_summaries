import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  BounceIn,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInUp,
  ZoomIn,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { colors } from "../../constants/colors";
import type { BookLike } from "../../lib/onboarding";
import {
  saveBookLikes,
  saveUserPreferences,
  setOnboardingCompleted
} from "../../lib/onboarding";

/* ---------- colour palettes per step ---------- */
const STEP_PALETTES: { bg: string; shapes: string[] }[] = [
  { bg: "#FFF7ED", shapes: ["#FB923C", "#FDBA74", "#F97316", "#FED7AA", "#EA580C"] },
  { bg: "#ECFDF5", shapes: ["#34D399", "#6EE7B7", "#10B981", "#A7F3D0", "#059669"] },
  { bg: "#F5F3FF", shapes: ["#A78BFA", "#C4B5FD", "#8B5CF6", "#DDD6FE", "#7C3AED"] },
  { bg: "#EFF6FF", shapes: ["#60A5FA", "#93C5FD", "#3B82F6", "#BFDBFE", "#2563EB"] },
  { bg: "#FFFBEB", shapes: ["#FBBF24", "#FCD34D", "#F59E0B", "#FDE68A", "#D97706"] },
];

/* ---------- data ---------- */

const GOALS = [
  {
    id: "habits",
    icon: "\u2728",
    label: "Build better habits",
    subtitle: "Daily routines that stick"
  },
  {
    id: "career",
    icon: "\uD83D\uDE80",
    label: "Boost my career",
    subtitle: "Skills & strategies for growth"
  },
  {
    id: "grow",
    icon: "\uD83C\uDF31",
    label: "Grow as a person",
    subtitle: "Self-awareness & mindset"
  },
  {
    id: "ideas",
    icon: "\uD83D\uDCA1",
    label: "Get inspired by new ideas",
    subtitle: "Creativity & innovation"
  },
  {
    id: "world",
    icon: "\uD83C\uDF0D",
    label: "Understand the world",
    subtitle: "History, science & culture"
  },
  {
    id: "learn",
    icon: "\uD83D\uDCDA",
    label: "Learn something new daily",
    subtitle: "Bite-sized knowledge every day"
  }
];

const CATEGORIES = [
  {
    id: "motivation",
    icon: "\uD83D\uDD25",
    label: "Motivation & Inspiration",
    subtitle: "Stay driven & focused"
  },
  {
    id: "business",
    icon: "\uD83D\uDCBC",
    label: "Business & Career",
    subtitle: "Leadership & strategy"
  },
  {
    id: "personal",
    icon: "\uD83C\uDFAF",
    label: "Personal Development",
    subtitle: "Become your best self"
  },
  {
    id: "health",
    icon: "\uD83E\uDDD8",
    label: "Health & Wellness",
    subtitle: "Mind, body & nutrition"
  },
  {
    id: "money",
    icon: "\uD83D\uDCB0",
    label: "Money & Finance",
    subtitle: "Investing & financial freedom"
  },
  {
    id: "science",
    icon: "\uD83D\uDD2C",
    label: "Science & Technology",
    subtitle: "How the world works"
  },
  {
    id: "productivity",
    icon: "\u26A1",
    label: "Productivity",
    subtitle: "Get more done, better"
  },
  {
    id: "communication",
    icon: "\uD83D\uDDE3\uFE0F",
    label: "Communication Skills",
    subtitle: "Influence & persuasion"
  }
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
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg"
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "Money & Finance",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg"
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Money & Finance",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg"
  },
  {
    title: "Ikigai",
    author: "Francesc Miralles",
    category: "Health & Wellness",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg"
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    category: "Motivation & Inspiration",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg"
  }
];

const PREPARING_STEPS = [
  "Saving titles to your Library",
  "Selecting title recommendations",
  "Creating collections you might like"
];

const TOTAL_VISIBLE_STEPS = 5;
const WIDE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 110;

/* ---------- shared animation config ---------- */

const springConfig = { damping: 18, stiffness: 220, mass: 0.9 };
const softSpring = { damping: 26, stiffness: 180 };
const pressSpring = { damping: 14, stiffness: 320 };

/* ---------- step transition: content slides in from the side ---------- */

const slideInFromSide = SlideInRight.springify().damping(20).stiffness(200).duration(400);

/* ---------- reusable pressable with spring scale ---------- */

function PressableScale({
  onPress,
  disabled,
  style,
  children
}: {
  onPress?: () => void;
  disabled?: boolean;
  style?: object;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, pressSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, pressSpring);
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[animStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}

/* ---------- floating CTA (persian orange, gentle bob, strong shadow) ---------- */

function FloatingCTA({
  onPress,
  disabled,
  label
}: {
  onPress: () => void;
  disabled?: boolean;
  label: string;
}) {
  const float = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [float]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }, { scale: scale.value }]
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, pressSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, pressSpring);
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          s.ctaBtn,
          animStyle,
          !disabled && s.ctaBtnFloating,
          disabled && s.ctaBtnDisabled
        ]}
      >
        <Text style={s.ctaBtnText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

/* ---------- animated abstract art ---------- */

interface ShapeConfig {
  type: "circle" | "rect" | "book" | "diamond";
  size: number;
  color: string;
  x: number;
  y: number;
  rotation?: number;
}

function getShapesForStep(step: number): ShapeConfig[] {
  const palette = STEP_PALETTES[step] ?? STEP_PALETTES[0];
  const c = palette.shapes;

  switch (step) {
    case 0:
      return [
        { type: "circle", size: 140, color: c[0], x: 15, y: 8 },
        { type: "circle", size: 90, color: c[1], x: 60, y: 55 },
        { type: "book", size: 120, color: c[2], x: 10, y: 50, rotation: -12 },
        { type: "circle", size: 50, color: c[3], x: 70, y: 15 },
        { type: "diamond", size: 40, color: c[4], x: 45, y: 35 },
        { type: "circle", size: 30, color: c[1], x: 30, y: 78 },
        { type: "rect", size: 60, color: c[3], x: 55, y: 75, rotation: 20 },
      ];
    case 1:
      return [
        { type: "rect", size: 160, color: c[0], x: 5, y: 5, rotation: 10 },
        { type: "rect", size: 100, color: c[1], x: 50, y: 45, rotation: -8 },
        { type: "circle", size: 80, color: c[2], x: 65, y: 10 },
        { type: "book", size: 90, color: c[3], x: 20, y: 60, rotation: 5 },
        { type: "diamond", size: 50, color: c[4], x: 40, y: 20 },
        { type: "circle", size: 40, color: c[0], x: 10, y: 80 },
        { type: "rect", size: 45, color: c[2], x: 75, y: 70, rotation: -15 },
      ];
    case 2:
      return [
        { type: "book", size: 150, color: c[0], x: 10, y: 10, rotation: -8 },
        { type: "book", size: 110, color: c[1], x: 45, y: 40, rotation: 12 },
        { type: "circle", size: 70, color: c[2], x: 70, y: 8 },
        { type: "diamond", size: 60, color: c[3], x: 25, y: 65 },
        { type: "circle", size: 45, color: c[4], x: 60, y: 72 },
        { type: "rect", size: 35, color: c[1], x: 5, y: 45, rotation: 25 },
        { type: "circle", size: 25, color: c[3], x: 80, y: 50 },
      ];
    case 3:
      return [
        { type: "circle", size: 180, color: c[0], x: 20, y: 15 },
        { type: "circle", size: 130, color: c[1], x: 20, y: 15 },
        { type: "circle", size: 80, color: c[2], x: 20, y: 15 },
        { type: "diamond", size: 50, color: c[3], x: 65, y: 60 },
        { type: "rect", size: 40, color: c[4], x: 10, y: 70, rotation: 30 },
        { type: "circle", size: 35, color: c[3], x: 75, y: 20 },
        { type: "diamond", size: 30, color: c[0], x: 55, y: 80 },
      ];
    case 4:
    default:
      return [
        { type: "diamond", size: 120, color: c[0], x: 30, y: 10 },
        { type: "circle", size: 100, color: c[1], x: 10, y: 50 },
        { type: "diamond", size: 80, color: c[2], x: 55, y: 55 },
        { type: "book", size: 90, color: c[3], x: 60, y: 5, rotation: 15 },
        { type: "circle", size: 50, color: c[4], x: 40, y: 75 },
        { type: "rect", size: 40, color: c[0], x: 5, y: 20, rotation: -20 },
        { type: "circle", size: 30, color: c[2], x: 80, y: 40 },
      ];
  }
}

function AnimatedShape({ shape, index }: { shape: ShapeConfig; index: number }) {
  const floatY = useSharedValue(0);
  const floatX = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    const yDuration = 2800 + index * 400;
    const xDuration = 3500 + index * 500;
    const scaleDuration = 4000 + index * 600;

    floatY.value = withRepeat(
      withSequence(
        withTiming(12 + index * 3, { duration: yDuration }),
        withTiming(-(8 + index * 2), { duration: yDuration })
      ),
      -1,
      true
    );

    floatX.value = withRepeat(
      withSequence(
        withTiming(6 + index * 2, { duration: xDuration }),
        withTiming(-(6 + index * 2), { duration: xDuration })
      ),
      -1,
      true
    );

    scaleAnim.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: scaleDuration }),
        withTiming(0.95, { duration: scaleDuration })
      ),
      -1,
      true
    );
  }, [floatY, floatX, scaleAnim, index]);

  const rotation = shape.rotation ?? 0;
  const isDiamond = shape.type === "diamond";

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { translateX: floatX.value },
      { scale: scaleAnim.value },
      { rotate: isDiamond ? "45deg" : `${rotation}deg` },
    ],
  }));

  const baseStyle = {
    position: "absolute" as const,
    left: `${shape.x}%` as `${number}%`,
    top: `${shape.y}%` as `${number}%`,
    opacity: 0.7,
  };

  const shapeStyle = (() => {
    switch (shape.type) {
      case "circle":
        return {
          width: shape.size,
          height: shape.size,
          borderRadius: shape.size / 2,
          backgroundColor: shape.color,
        };
      case "rect":
        return {
          width: shape.size,
          height: shape.size * 0.6,
          borderRadius: shape.size * 0.15,
          backgroundColor: shape.color,
        };
      case "book":
        return {
          width: shape.size * 0.7,
          height: shape.size,
          borderRadius: shape.size * 0.08,
          backgroundColor: shape.color,
          borderLeftWidth: shape.size * 0.06,
          borderLeftColor: "rgba(0,0,0,0.15)",
        };
      case "diamond":
        return {
          width: shape.size,
          height: shape.size,
          borderRadius: shape.size * 0.18,
          backgroundColor: shape.color,
        };
      default:
        return {};
    }
  })();

  return <Animated.View style={[baseStyle, shapeStyle, animStyle]} />;
}

function AbstractArtPanel({ step }: { step: number }) {
  const palette = STEP_PALETTES[step] ?? STEP_PALETTES[0];
  const shapes = getShapesForStep(step);
  const panelFade = useSharedValue(1);

  useEffect(() => {
    panelFade.value = 0;
    panelFade.value = withTiming(1, { duration: 600 });
  }, [step, panelFade]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: panelFade.value,
  }));

  return (
    <Animated.View
      style={[
        artStyles.container,
        { backgroundColor: palette.bg },
        fadeStyle,
      ]}
    >
      {shapes.map((shape, i) => (
        <AnimatedShape key={`${step}-${i}`} shape={shape} index={i} />
      ))}
    </Animated.View>
  );
}

const artStyles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
});

/* ---------- sub-components ---------- */

function ProgressBar({ step }: { step: number }) {
  const progress = Math.min(((step + 1) / TOTAL_VISIBLE_STEPS) * 100, 100);
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, { damping: 20, stiffness: 120 });
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`
  }));

  return (
    <View style={s.progressContainer}>
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, fillStyle]} />
      </View>
      <Text style={s.progressLabel}>
        Step {Math.min(step + 1, TOTAL_VISIBLE_STEPS)} of{" "}
        {TOTAL_VISIBLE_STEPS}
      </Text>
    </View>
  );
}

/* ---------- option card (Blinkist-style row with animated check) ---------- */

function OptionCard({
  icon,
  label,
  subtitle,
  selected,
  onPress,
  index
}: {
  icon: string;
  label: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  const checkScale = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    checkScale.value = withSpring(selected ? 1 : 0, {
      damping: 12,
      stiffness: 260
    });
  }, [selected, checkScale]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(120 + index * 70)
        .springify()
        .damping(18)}
    >
      <PressableScale onPress={onPress}>
        <Animated.View
          style={[
            s.optionCard,
            selected && s.optionCardSelected,
            selected && { borderColor: colors.accent }
          ]}
        >
          <View
            style={[
              s.optionIconCircle,
              selected && { backgroundColor: colors.accentSoft }
            ]}
          >
            <Text style={s.optionIconText}>{icon}</Text>
          </View>
          <View style={s.optionTextCol}>
            <Text
              style={[s.optionTitle, selected && { color: colors.text }]}
            >
              {label}
            </Text>
            <Text style={s.optionSubtitle}>{subtitle}</Text>
          </View>
          <Animated.View style={[s.optionCheckWrap, checkStyle]}>
            <View style={s.optionCheckCircle}>
              <Text style={s.optionCheck}>{"\u2713"}</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </PressableScale>
    </Animated.View>
  );
}

function GoalsStep({
  selected,
  onToggle
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={s.stepBody}>
      <Animated.Text
        style={s.stepHeading}
        entering={FadeInDown.springify().damping(18)}
      >
        What are your biggest goals right now?
      </Animated.Text>
      <Animated.Text
        style={s.stepSubheading}
        entering={FadeInDown.delay(60).springify().damping(18)}
      >
        You can always update your answers later.
      </Animated.Text>
      <View style={s.optionsList}>
        {GOALS.map((g, i) => (
          <OptionCard
            key={g.id}
            icon={g.icon}
            label={g.label}
            subtitle={g.subtitle}
            selected={selected.includes(g.id)}
            onPress={() => onToggle(g.id)}
            index={i}
          />
        ))}
      </View>
    </View>
  );
}

function CategoriesStep({
  selected,
  onToggle
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={s.stepBody}>
      <Animated.Text
        style={s.stepHeading}
        entering={FadeInDown.springify().damping(18)}
      >
        Follow categories you&apos;re interested in
      </Animated.Text>
      <Animated.Text
        style={s.stepSubheading}
        entering={FadeInDown.delay(60).springify().damping(18)}
      >
        We&apos;ll recommend books from these genres.
      </Animated.Text>
      <View style={s.optionsList}>
        {CATEGORIES.map((c, i) => (
          <OptionCard
            key={c.id}
            icon={c.icon}
            label={c.label}
            subtitle={c.subtitle}
            selected={selected.includes(c.id)}
            onPress={() => onToggle(c.id)}
            index={i}
          />
        ))}
      </View>
    </View>
  );
}

/* ---------- reading time step (single-select pills, zoom-in effect) ---------- */

const READING_TIMES = [
  { id: "5min", label: "5 min", subtitle: "A quick bite" },
  { id: "15min", label: "15 min", subtitle: "A coffee break" },
  { id: "30min", label: "30 min", subtitle: "A solid session" },
  { id: "60min", label: "1 hour+", subtitle: "Deep diving" }
];

function ReadingTimeStep({
  selected,
  onSelect
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={s.stepBody}>
      <Animated.Text
        style={s.stepHeading}
        entering={ZoomIn.springify().damping(16)}
      >
        How much time do you have to read?
      </Animated.Text>
      <Animated.Text
        style={s.stepSubheading}
        entering={ZoomIn.delay(80).springify().damping(16)}
      >
        We&apos;ll tailor summaries to fit your schedule.
      </Animated.Text>
      <View style={s.pillGrid}>
        {READING_TIMES.map((t, i) => {
          const isSelected = selected === t.id;
          return (
            <Animated.View
              key={t.id}
              entering={ZoomIn.delay(150 + i * 80)
                .springify()
                .damping(14)}
              style={s.pillCell}
            >
              <PressableScale onPress={() => onSelect(t.id)}>
                <View
                  style={[
                    s.pillCard,
                    isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }
                  ]}
                >
                  <Text
                    style={[
                      s.pillLabel,
                      isSelected && { color: colors.accentText }
                    ]}
                  >
                    {t.label}
                  </Text>
                  <Text
                    style={[
                      s.pillSubtitle,
                      isSelected && { color: colors.accentText }
                    ]}
                  >
                    {t.subtitle}
                  </Text>
                </View>
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

/* ---------- reading time-of-day step (single-select, slide-up + bounce) ---------- */

const READING_TIMES_OF_DAY = [
  { id: "morning", icon: "\uD83C\uDF1E", label: "Morning", subtitle: "Start the day sharp" },
  { id: "afternoon", icon: "\u2600\uFE0F", label: "Afternoon", subtitle: "A midday reset" },
  { id: "evening", icon: "\uD83C\uDF19", label: "Evening", subtitle: "Wind down with ideas" },
  { id: "night", icon: "\uD83C\uDF03", label: "Before bed", subtitle: "Quiet, reflective time" }
];

function ReadingTimeOfDayStep({
  selected,
  onSelect
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={s.stepBody}>
      <Animated.Text
        style={s.stepHeading}
        entering={SlideInUp.springify().damping(16)}
      >
        When do you prefer to read?
      </Animated.Text>
      <Animated.Text
        style={s.stepSubheading}
        entering={SlideInUp.delay(80).springify().damping(16)}
      >
        We&apos;ll send gentle reminders at the right time.
      </Animated.Text>
      <View style={s.optionsList}>
        {READING_TIMES_OF_DAY.map((t, i) => {
          const isSelected = selected === t.id;
          return (
            <Animated.View
              key={t.id}
              entering={BounceIn.delay(150 + i * 100)}
            >
              <PressableScale onPress={() => onSelect(t.id)}>
                <View
                  style={[
                    s.optionCard,
                    isSelected && s.optionCardSelected,
                    isSelected && { borderColor: colors.accent }
                  ]}
                >
                  <View
                    style={[
                      s.optionIconCircle,
                      isSelected && { backgroundColor: colors.accentSoft }
                    ]}
                  >
                    <Text style={s.optionIconText}>{t.icon}</Text>
                  </View>
                  <View style={s.optionTextCol}>
                    <Text style={s.optionTitle}>{t.label}</Text>
                    <Text style={s.optionSubtitle}>{t.subtitle}</Text>
                  </View>
                  {isSelected && (
                    <View style={s.optionCheckCircle}>
                      <Text style={s.optionCheck}>{"\u2713"}</Text>
                    </View>
                  )}
                </View>
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

/* ---------- book swipe deck (gesture-driven, stacked depth) ---------- */

function BookPicksStep({
  currentIndex,
  onLike,
  onDislike,
  onSkip
}: {
  currentIndex: number;
  onLike: () => void;
  onDislike: () => void;
  onSkip: () => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const exitX = useSharedValue(0);

  const book = SAMPLE_BOOKS[currentIndex];

  useEffect(() => {
    // reset + pop-in for the next card
    translateX.value = 0;
    translateY.value = 0;
    exitX.value = 0;
    scale.value = 0.9;
    scale.value = withSpring(1, springConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        exitX.value = withSpring(600, { velocity: e.velocityX, damping: 28 });
        translateY.value = withSpring(e.translationY, {
          velocity: e.velocityY,
          damping: 28
        });
        runOnJS(onLike)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        exitX.value = withSpring(-600, { velocity: e.velocityX, damping: 28 });
        translateY.value = withSpring(e.translationY, {
          velocity: e.velocityY,
          damping: 28
        });
        runOnJS(onDislike)();
      } else {
        translateX.value = withSpring(0, softSpring);
        translateY.value = withSpring(0, softSpring);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const x = translateX.value + exitX.value;
    const rotate = interpolate(
      x,
      [-220, 220],
      [-0.32, 0.32],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: x },
        { translateY: translateY.value },
        { rotate: `${rotate}rad` },
        { scale: scale.value }
      ]
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value + exitX.value,
      [0, 70, 130],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    )
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value + exitX.value,
      [-130, -70, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    )
  }));

  if (!book) return null;

  const behind1 = SAMPLE_BOOKS[currentIndex + 1];
  const behind2 = SAMPLE_BOOKS[currentIndex + 2];

  return (
    <View style={s.stepBody}>
      <Animated.View entering={ZoomIn.springify().damping(16)}>
        <Text style={s.stepHeading}>Does this title look interesting?</Text>
        <Text style={s.stepSubheading}>
          Swipe right to save it, left to skip.
        </Text>
      </Animated.View>

      <View style={s.deckWrap}>
        {/* depth cards */}
        {behind2 && (
          <View style={[s.bookCard, s.bookCardBehind2]}>
            <Image
              source={{ uri: behind2.coverUrl }}
              style={s.bookCover}
              resizeMode="cover"
            />
          </View>
        )}
        {behind1 && (
          <View style={[s.bookCard, s.bookCardBehind1]}>
            <Image
              source={{ uri: behind1.coverUrl }}
              style={s.bookCover}
              resizeMode="cover"
            />
          </View>
        )}

        {/* draggable top card */}
        <GestureDetector gesture={pan}>
          <Animated.View style={[s.bookCard, s.bookCardTop, cardStyle]}>
            <Animated.View style={[s.stampLayer, likeStyle]}>
              <View style={[s.stamp, { borderColor: colors.accent }]}>
                <Text style={[s.stampText, { color: colors.accent }]}>
                  SAVE
                </Text>
              </View>
            </Animated.View>
            <Animated.View style={[s.stampLayer, nopeStyle]}>
              <View style={[s.stamp, { borderColor: colors.secondary }]}>
                <Text style={[s.stampText, { color: colors.secondary }]}>
                  SKIP
                </Text>
              </View>
            </Animated.View>
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
        </GestureDetector>
      </View>

      <View style={s.voteRow}>
        <PressableScale onPress={onDislike}>
          <View style={[s.voteBtn, s.voteBtnDislike]}>
            <Text style={s.voteBtnGlyph}>{"\u2715"}</Text>
          </View>
        </PressableScale>
        <PressableScale onPress={onSkip}>
          <View style={s.skipBtn}>
            <Text style={s.skipLinkText}>Skip</Text>
          </View>
        </PressableScale>
        <PressableScale onPress={onLike}>
          <View style={[s.voteBtn, s.voteBtnLike]}>
            <Text style={s.voteBtnGlyph}>{"\u2764"}</Text>
          </View>
        </PressableScale>
      </View>
      <Text style={s.bookCounter}>
        {currentIndex + 1} of {SAMPLE_BOOKS.length}
      </Text>
    </View>
  );
}

/* ---------- preparing step (shimmer + staggered checks) ---------- */

function PreparingStep({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1100 }),
      -1,
      false
    );
  }, [shimmer]);

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
      if (current >= 33 && !completedSteps.includes(0))
        setCompletedSteps((p) => [...p, 0]);
      if (current >= 66 && !completedSteps.includes(1))
        setCompletedSteps((p) => [...p, 1]);
      if (current >= 95 && !completedSteps.includes(2))
        setCompletedSteps((p) => [...p, 2]);
    }, 60);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-120, 320]) }]
  }));

  return (
    <View style={s.stepBody}>
      <Animated.Text
        style={s.stepHeading}
        entering={FadeInDown.springify().damping(18)}
      >
        Setting things up...
      </Animated.Text>
      <Animated.Text
        style={s.stepSubheading}
        entering={FadeInDown.delay(60).springify().damping(18)}
      >
        We&apos;re preparing your personalized reading experience.
      </Animated.Text>

      <View style={s.preparingBarContainer}>
        <View style={s.preparingBarTrack}>
          <View style={[s.preparingBarFill, { width: `${progress}%` }]}>
            <Animated.View style={[s.shimmerSweep, shimmerStyle]} />
          </View>
        </View>
      </View>

      <View style={s.preparingChecklist}>
        {PREPARING_STEPS.map((label, i) => {
          const done = completedSteps.includes(i);
          const active = !done && (i === 0 || completedSteps.includes(i - 1));
          return (
            <PreparingItem
              key={label}
              label={label}
              done={done}
              active={active}
              index={i}
            />
          );
        })}
      </View>
    </View>
  );
}

function PreparingItem({
  label,
  done,
  active,
  index
}: {
  label: string;
  done: boolean;
  active: boolean;
  index: number;
}) {
  const checkScale = useSharedValue(0);
  const dotPulse = useSharedValue(1);

  useEffect(() => {
    if (done) {
      checkScale.value = withSpring(1, { damping: 11, stiffness: 260 });
    }
  }, [done, checkScale]);

  useEffect(() => {
    if (active && !done) {
      dotPulse.value = withRepeat(
        withSequence(
          withSpring(1.25, { damping: 14, stiffness: 200 }),
          withSpring(1, { damping: 14, stiffness: 200 })
        ),
        -1,
        true
      );
    }
  }, [active, done, dotPulse]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotPulse.value }]
  }));

  return (
    <Animated.View
      style={s.preparingItem}
      entering={FadeInDown.delay(200 + index * 120)
        .springify()
        .damping(18)}
    >
      <View style={s.preparingDotWrap}>
        <Animated.View
          style={[
            s.preparingDot,
            dotStyle,
            done && { backgroundColor: colors.secondary }
          ]}
        >
          <Animated.View style={[s.preparingDotCheck, checkStyle]}>
            <Text style={s.preparingCheckText}>{"\u2713"}</Text>
          </Animated.View>
        </Animated.View>
      </View>
      <Text
        style={[
          s.preparingLabel,
          done && { color: colors.text },
          active && { color: colors.text }
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

/* ---------- subscription step (Blinkist paywall) ---------- */

function SubscriptionStep({
  selectedPlan,
  onSelectPlan,
  onSubscribe,
  onSkip
}: {
  selectedPlan: "annual" | "monthly";
  onSelectPlan: (plan: "annual" | "monthly") => void;
  onSubscribe: () => void;
  onSkip: () => void;
}) {
  const features = [
    "Unlimited Telugu book summaries",
    "Audio playback for every summary",
    "New titles added weekly",
    "Download for offline reading"
  ];

  return (
    <View style={s.stepBody}>
      <Animated.Text
        style={s.stepHeading}
        entering={FadeInDown.springify().damping(18)}
      >
        Read without limits
      </Animated.Text>
      <Animated.View
        style={s.quoteBox}
        entering={FadeIn.delay(80).springify()}
      >
        <Text style={s.quoteText}>
          {"\u201CA reader lives a thousand lives before he dies.\u201D"}
        </Text>
        <Text style={s.quoteAuthor}>— George R.R. Martin</Text>
      </Animated.View>

      <View style={s.featureList}>
        {features.map((f, i) => (
          <Animated.View
            key={f}
            style={s.featureItem}
            entering={FadeInDown.delay(140 + i * 70)
              .springify()
              .damping(18)}
          >
            <View style={s.featureCheckCircle}>
              <Text style={s.featureCheck}>{"\u2713"}</Text>
            </View>
            <Text style={s.featureText}>{f}</Text>
          </Animated.View>
        ))}
      </View>

      <PlanCard
        plan="annual"
        selected={selectedPlan === "annual"}
        onSelect={onSelectPlan}
        badge="OUR BEST VALUE"
        name="Annual"
        detail="7 days free, then billed yearly"
        price="$2.49/week"
        index={0}
      />
      <PlanCard
        plan="monthly"
        selected={selectedPlan === "monthly"}
        onSelect={onSelectPlan}
        name="Monthly"
        detail="$9.99/month"
        price="$2.99/week"
        index={1}
      />

      <Animated.View
        entering={FadeInUp.delay(420).springify().damping(18)}
      >
        <FloatingCTA onPress={onSubscribe} label="Start your free 7-day trial" />
      </Animated.View>

      <Text style={s.finePrint}>
        Cancel anytime. Secure payment via App Store or Google Play.
      </Text>

      <Pressable onPress={onSkip} style={s.skipSub}>
        <Text style={s.skipSubText}>Maybe later</Text>
      </Pressable>
    </View>
  );
}

function PlanCard({
  plan,
  selected,
  onSelect,
  badge,
  name,
  detail,
  price,
  index
}: {
  plan: "annual" | "monthly";
  selected: boolean;
  onSelect: (p: "annual" | "monthly") => void;
  badge?: string;
  name: string;
  detail: string;
  price: string;
  index: number;
}) {
  const ringScale = useSharedValue(selected ? 1 : 0.96);

  useEffect(() => {
    ringScale.value = withSpring(selected ? 1 : 0.96, softSpring);
  }, [selected, ringScale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    borderColor: selected ? colors.accent : colors.border,
    borderWidth: selected ? 2 : 1
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 90).springify().damping(18)}
    >
      <PressableScale onPress={() => onSelect(plan)}>
        <Animated.View style={[s.planCard, cardStyle]}>
          {badge && (
            <View style={s.planBadge}>
              <Text style={s.planBadgeText}>{badge}</Text>
            </View>
          )}
          <View style={s.planRow}>
            <View>
              <Text style={s.planName}>{name}</Text>
              <Text style={s.planDetail}>{detail}</Text>
            </View>
            <Text style={s.planPrice}>{price}</Text>
          </View>
          <View
            style={[s.planRadio, selected && { borderColor: colors.accent }]}
          >
            {selected && <View style={s.planRadioDot} />}
          </View>
        </Animated.View>
      </PressableScale>
    </Animated.View>
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
  const [selectedReadingTime, setSelectedReadingTime] = useState<string | null>(null);
  const [selectedReadingTimeOfDay, setSelectedReadingTimeOfDay] = useState<string | null>(null);
  const [bookLikes, setBookLikes] = useState<BookLike[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">(
    "annual"
  );

  const animateTransition = useCallback((nextStep: number) => {
    setStep(nextStep);
  }, []);

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
        liked
      }
    ]);
    if (currentBookIndex < SAMPLE_BOOKS.length - 1) {
      setCurrentBookIndex((prev) => prev + 1);
    } else {
      animateTransition(5);
    }
  };

  const handleBookSkip = () => {
    if (currentBookIndex < SAMPLE_BOOKS.length - 1) {
      setCurrentBookIndex((prev) => prev + 1);
    } else {
      animateTransition(5);
    }
  };

  const handleNext = () => {
    if (step === 0 && selectedGoals.length === 0) return;
    if (step === 1 && selectedCategories.length === 0) return;
    if (step === 2 && !selectedReadingTime) return;
    if (step === 3 && !selectedReadingTimeOfDay) return;
    animateTransition(step + 1);
  };

  const handlePreparingDone = useCallback(() => {
    void saveUserPreferences(
      selectedGoals,
      selectedCategories,
      selectedReadingTime,
      selectedReadingTimeOfDay
    );
    void saveBookLikes(bookLikes);
    animateTransition(6);
  }, [selectedGoals, selectedCategories, selectedReadingTime, selectedReadingTimeOfDay, bookLikes, animateTransition]);

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
    (step === 1 && selectedCategories.length > 0) ||
    (step === 2 && !!selectedReadingTime) ||
    (step === 3 && !!selectedReadingTimeOfDay);

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
          <ReadingTimeStep
            selected={selectedReadingTime}
            onSelect={setSelectedReadingTime}
          />
        );
      case 3:
        return (
          <ReadingTimeOfDayStep
            selected={selectedReadingTimeOfDay}
            onSelect={setSelectedReadingTimeOfDay}
          />
        );
      case 4:
        return (
          <BookPicksStep
            currentIndex={currentBookIndex}
            onLike={() => handleBookVote(true)}
            onDislike={() => handleBookVote(false)}
            onSkip={handleBookSkip}
          />
        );
      case 5:
        return <PreparingStep onDone={handlePreparingDone} />;
      case 6:
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

  const showProgressBar = step < 5;
  const showContinueBtn = step < 4;

  const artOnLeft = step % 2 === 1;

  const formContent = (
    <View style={s.formPanel}>
      <ScrollView
        contentContainerStyle={s.formScroll}
        showsVerticalScrollIndicator={false}
      >
        {showProgressBar && <ProgressBar step={step} />}
        {/* keying by step remounts subtree so entering animations replay */}
        <Animated.View key={step} style={s.stepWrap} entering={slideInFromSide}>
          {renderStepContent()}
        </Animated.View>
        {showContinueBtn && (
          <Animated.View entering={FadeInUp.delay(260).springify().damping(18)}>
            <FloatingCTA
              onPress={handleNext}
              disabled={!canContinue}
              label="Continue"
            />
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );

  const artPanel = <AbstractArtPanel step={step} />;

  if (isWide) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.splitContainer}>
          {artOnLeft ? artPanel : formContent}
          {artOnLeft ? formContent : artPanel}
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
        <View style={s.mobileContent}>
          {showProgressBar && <ProgressBar step={step} />}
          <Animated.View key={step} style={s.stepWrap} entering={slideInFromSide}>
            {renderStepContent()}
          </Animated.View>
          {showContinueBtn && (
            <Animated.View entering={FadeInUp.delay(260).springify().damping(18)}>
              <FloatingCTA
                onPress={handleNext}
                disabled={!canContinue}
                label="Continue"
              />
            </Animated.View>
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
    position: "relative"
  },

  /* ---------- two-panel desktop ---------- */
  splitContainer: {
    flex: 1,
    flexDirection: "row"
  },
  formPanel: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 40,
    paddingVertical: 32
  },
  formScroll: {
    flexGrow: 1,
    maxWidth: 520
  },



  /* ---------- mobile ---------- */
  mobileScroll: {
    flexGrow: 1,
    paddingBottom: 40
  },
  mobileContent: {
    paddingHorizontal: 24,
    paddingTop: 24
  },
  stepWrap: {
    minHeight: 200
  },

  /* ---------- progress bar ---------- */
  progressContainer: {
    marginBottom: 28
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 5,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: "100%"
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
    letterSpacing: 0.2
  },

  /* ---------- step content ---------- */
  stepBody: {
    paddingTop: 8
  },
  stepHeading: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 35,
    letterSpacing: -0.3
  },
  stepSubheading: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 4
  },

  /* ---------- option cards ---------- */
  optionsList: {
    gap: 12,
    marginTop: 22
  },
  optionCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: colors.text,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  optionCardSelected: {
    borderWidth: 2,
    backgroundColor: colors.accentSoft
  },
  optionIconCircle: {
    alignItems: "center",
    backgroundColor: colors.secondarySoft,
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  optionIconText: {
    fontSize: 20
  },
  optionTextCol: {
    flex: 1
  },
  optionTitle: {
    color: colors.text,
    fontSize: 15.5,
    fontWeight: "700"
  },
  optionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2
  },
  optionCheckWrap: {
    height: 28,
    width: 28
  },
  optionCheckCircle: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  optionCheck: {
    color: colors.accentText,
    fontSize: 15,
    fontWeight: "800"
  },

  /* ---------- book picks / swipe deck ---------- */
  deckWrap: {
    alignItems: "center",
    height: 360,
    justifyContent: "center",
    marginTop: 24,
    width: "100%"
  },
  bookCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    width: 280,
    shadowColor: colors.text,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  bookCardTop: {
    position: "absolute"
  },
  bookCardBehind1: {
    position: "absolute",
    transform: [{ scale: 0.94 }, { translateY: 14 }],
    opacity: 0.7
  },
  bookCardBehind2: {
    position: "absolute",
    transform: [{ scale: 0.88 }, { translateY: 28 }],
    opacity: 0.4
  },
  stampLayer: {
    position: "absolute",
    top: 18,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5
  },
  stamp: {
    borderRadius: 10,
    borderWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 4
  },
  stampText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2
  },
  bookCover: {
    borderRadius: 12,
    height: 210,
    width: 150
  },
  bookTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 14,
    textAlign: "center"
  },
  bookAuthor: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center"
  },
  bookBadge: {
    backgroundColor: colors.secondarySoft,
    borderRadius: 20,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  bookBadgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600"
  },
  voteRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 22,
    justifyContent: "center",
    marginTop: 18
  },
  voteBtn: {
    alignItems: "center",
    borderRadius: 999,
    height: 64,
    justifyContent: "center",
    width: 64,
    shadowColor: colors.text,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  voteBtnLike: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent
  },
  voteBtnDislike: {
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary
  },
  voteBtnGlyph: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.accentText
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  skipLinkText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  bookCounter: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 14,
    textAlign: "center"
  },

  /* ---------- preparing step ---------- */
  preparingBarContainer: {
    marginTop: 26,
    marginBottom: 28
  },
  preparingBarTrack: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 8,
    overflow: "hidden"
  },
  preparingBarFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: "100%",
    overflow: "hidden"
  },
  shimmerSweep: {
    backgroundColor: "rgba(255,255,255,0.55)",
    height: "100%",
    width: 120,
    position: "absolute",
    left: 0,
    top: 0
  },
  preparingChecklist: {
    gap: 0
  },
  preparingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12
  },
  preparingDotWrap: {
    height: 28,
    width: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  preparingDot: {
    alignItems: "center",
    backgroundColor: colors.border,
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  preparingDotCheck: {
    alignItems: "center",
    justifyContent: "center"
  },
  preparingCheckText: {
    color: colors.accentText,
    fontSize: 13,
    fontWeight: "800"
  },
  preparingLabel: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "500"
  },

  /* ---------- reading time pills ---------- */
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24
  },
  pillCell: {
    width: "48%",
    flexGrow: 1
  },
  pillCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 22,
    shadowColor: colors.text,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  pillLabel: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  pillSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4
  },

  /* ---------- subscription ---------- */
  quoteBox: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  quoteText: {
    color: colors.text,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22
  },
  quoteAuthor: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6
  },
  featureList: {
    gap: 12,
    marginTop: 24
  },
  featureItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  featureCheckCircle: {
    alignItems: "center",
    backgroundColor: colors.secondarySoft,
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  featureCheck: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "800"
  },
  featureText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500"
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginTop: 14,
    padding: 16,
    position: "relative",
    shadowColor: colors.text,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: 6,
    marginBottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 3
  },
  planBadgeText: {
    color: colors.accentText,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  planRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  planName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  planDetail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2
  },
  planPrice: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  planRadio: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    top: 16,
    width: 24
  },
  planRadioDot: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    height: 12,
    width: 12
  },
  finePrint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 14,
    textAlign: "center"
  },
  skipSub: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 8
  },
  skipSubText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline"
  },

  /* ---------- CTA button (floating, persian orange) ---------- */
  ctaBtn: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    marginTop: 26,
    paddingVertical: 18,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  ctaBtnFloating: {
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  ctaBtnDisabled: {
    opacity: 0.35,
    shadowOpacity: 0
  },
  ctaBtnText: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2
  }
});
