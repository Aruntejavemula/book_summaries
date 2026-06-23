import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Link, useRouter } from "expo-router";

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
      router.replace("/(tabs)");
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

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <View style={styles.phoneFrame}>
          <View style={styles.topGlow} />
          <View style={styles.sideGlow} />

          <View style={styles.brandPill}>
            <Text style={styles.brandText}>BOOK SUMMARIES</Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.bookStack}>
              <View style={[styles.book, styles.bookOne]} />
              <View style={[styles.book, styles.bookTwo]} />
              <View style={[styles.book, styles.bookThree]} />
            </View>
            <Text style={styles.title}>Pick up your next chapter.</Text>
            <Text style={styles.subtitle}>
              Sign in to continue Telugu summaries, audio chapters, and your saved progress.
            </Text>
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
              placeholderTextColor="#a48363"
              style={styles.input}
              value={email}
            />
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#a48363"
              secureTextEntry
              style={styles.input}
              value={password}
            />

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.primaryButtonPressed
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Signing you in…" : "Sign In"}
              </Text>
            </Pressable>

            <View style={styles.helperRow}>
              <Text style={styles.helperText}>Need an account?</Text>
              <Link href="/(auth)/register" style={styles.link}>
                Create account
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f0e4"
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#f6f0e4",
    paddingHorizontal: 14,
    paddingVertical: 18
  },
  phoneFrame: {
    backgroundColor: "#f2eadc",
    borderColor: "#e4d4bb",
    borderRadius: 34,
    borderWidth: 1,
    overflow: "hidden",
    padding: 12,
    shadowColor: "#d4c3a5",
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 16
    },
    width: "100%",
    maxWidth: 390
  },
  topGlow: {
    position: "absolute",
    top: -40,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(233, 219, 196, 0.85)"
  },
  sideGlow: {
    position: "absolute",
    right: -35,
    top: 180,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(228, 214, 190, 0.8)"
  },
  brandPill: {
    alignSelf: "flex-start",
    backgroundColor: "#eadcc8",
    borderColor: "#dcc9ac",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  brandText: {
    color: "#5a432f",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2
  },
  heroCard: {
    backgroundColor: "#f1e5d5",
    borderColor: "#dfccb2",
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 12,
    padding: 12
  },
  bookStack: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8
  },
  book: {
    borderRadius: 18,
    height: 60,
    width: 36
  },
  bookOne: {
    backgroundColor: "#d7b08a",
    transform: [{ rotate: "-6deg" }]
  },
  bookTwo: {
    backgroundColor: "#c89d72",
    transform: [{ rotate: "3deg" }]
  },
  bookThree: {
    backgroundColor: "#e1c29c",
    transform: [{ rotate: "-2deg" }]
  },
  title: {
    color: "#4e3928",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 28,
    maxWidth: 290
  },
  subtitle: {
    color: "#7a624a",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8
  },
  formCard: {
    backgroundColor: "#f5ebdd",
    borderColor: "#e2d1b7",
    borderRadius: 28,
    borderWidth: 1,
    marginTop: 10,
    padding: 12
  },
  formTitle: {
    color: "#4e3928",
    fontSize: 19,
    fontWeight: "900"
  },
  formSubtitle: {
    color: "#7a624a",
    fontSize: 12,
    marginTop: 3,
    marginBottom: 10
  },
  input: {
    backgroundColor: "#f7efe2",
    borderColor: "#e1cdb2",
    borderRadius: 16,
    borderWidth: 1,
    color: "#5a432f",
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  error: {
    color: "#9a5b45",
    fontSize: 14,
    marginBottom: 12
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#c78a5d",
    borderRadius: 16,
    marginTop: 0,
    paddingVertical: 11
  },
  primaryButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }]
  },
  primaryButtonText: {
    color: "#fff5ea",
    fontSize: 16,
    fontWeight: "900"
  },
  helperRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 10
  },
  helperText: {
    color: "#7a624a",
    fontSize: 14
  },
  link: {
    color: "#9a6f49",
    fontSize: 14,
    fontWeight: "900"
  }
});
