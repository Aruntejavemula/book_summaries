import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";

import { colors } from "../../constants/colors";
import { useAuthSession } from "../../lib/auth-session";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading, session } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/(tabs)/index");
    }
  }, [isLoading, router, session]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/(tabs)/index");
  };

  return (
    <ScrollView contentContainerStyle={styles.container} bounces={false}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Telugu book summaries</Text>
        </View>
        <Text style={styles.title}>Sign in and pick up your next chapter.</Text>
        <Text style={styles.subtitle}>
          Continue listening, reading, and saving progress across every summary in your library.
        </Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureLabel}>Today’s shortcut</Text>
          <Text style={styles.featureTitle}>Start where you left off, without hunting through the app.</Text>
          <View style={styles.featureRow}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>3 min resume</Text>
            </View>
            <View style={styles.featurePillSoft}>
              <Text style={styles.featurePillSoftText}>Remembered device</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Welcome back</Text>
        <Text style={styles.formSubtitle}>Log in with your Book Summaries account.</Text>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={handleLogin}
          style={({ pressed }) => [styles.primaryButton, (pressed || isSubmitting) && styles.primaryButtonPressed]}
        >
          <Text style={styles.primaryButtonText}>{isSubmitting ? "Signing you in…" : "Sign In"}</Text>
        </Pressable>

        <View style={styles.helperRow}>
          <Text style={styles.helperText}>Need an account?</Text>
          <Link href="/(auth)/register" style={styles.link}>
            Create account
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0b1020",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 28
  },
  hero: {
    marginBottom: 18
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  badgeText: {
    color: "#d7e3ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  title: {
    color: "#ffffff",
    fontSize: 40,
    fontWeight: "800",
    lineHeight: 44,
    marginTop: 18,
    maxWidth: 360
  },
  subtitle: {
    color: "#c7d2fe",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
    maxWidth: 360
  },
  featureCard: {
    backgroundColor: "#141b31",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 22,
    padding: 18
  },
  featureLabel: {
    color: "#8fb2ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase"
  },
  featureTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
    marginTop: 10,
    maxWidth: 300
  },
  featureRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  featurePill: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  featurePillText: {
    color: "#0b1020",
    fontSize: 12,
    fontWeight: "800"
  },
  featurePillSoft: {
    backgroundColor: "rgba(99,102,241,0.18)",
    borderColor: "rgba(99,102,241,0.30)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  featurePillSoftText: {
    color: "#dbe4ff",
    fontSize: 12,
    fontWeight: "700"
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 20
  },
  formTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800"
  },
  formSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 18
  },
  input: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  error: {
    color: "#b00020",
    marginTop: 12
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    borderRadius: 18,
    marginTop: 18,
    paddingVertical: 16
  },
  primaryButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }]
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800"
  },
  helperRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 16
  },
  helperText: {
    color: colors.muted,
    fontSize: 14
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  }
});
