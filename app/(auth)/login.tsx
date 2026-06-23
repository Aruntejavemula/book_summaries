import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
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

const { width: screenWidth } = Dimensions.get("window");
const isWideScreen = screenWidth >= 768;

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

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google"
    });
    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleAppleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple"
    });
    if (error) {
      setErrorMessage(error.message);
    }
  };

  const formContent = (
    <View style={styles.formPanel}>
      <View style={styles.formInner}>
        <Text style={styles.logo}>Book Summaries</Text>

        <Text style={styles.heading}>Sign into your account</Text>
        <Text style={styles.subheading}>
          Your Telugu book summaries and audio chapters await.
        </Text>

        <Text style={styles.label}>
          Email address <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#a8a29e"
          style={styles.input}
          value={email}
        />

        <Text style={styles.label}>
          Password <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="password"
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor="#a8a29e"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        <Pressable style={styles.forgotLink}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleGoogleSignIn}
          style={({ pressed }) => [
            styles.oauthButton,
            pressed && styles.oauthButtonPressed
          ]}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.oauthButtonText}>Sign in with Google</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleAppleSignIn}
          style={({ pressed }) => [
            styles.oauthButton,
            pressed && styles.oauthButtonPressed
          ]}
        >
          <Text style={styles.appleIcon}>&#xF8FF;</Text>
          <Text style={styles.oauthButtonText}>Sign in with Apple</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Link href="/(auth)/register" style={styles.footerLink}>
            Sign up
          </Link>
        </View>
      </View>
    </View>
  );

  const artPanel = (
    <View style={isWideScreen ? styles.artPanelWide : styles.artPanelMobile}>
      <Image
        source={require("../../assets/login-art.png")}
        style={styles.artImage}
        resizeMode="cover"
      />
    </View>
  );

  if (isWideScreen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.splitContainer}>
          {formContent}
          {artPanel}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.mobileContainer} bounces={false}>
        {artPanel}
        {formContent}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF9F6"
  },
  splitContainer: {
    flex: 1,
    flexDirection: "row"
  },
  mobileContainer: {
    flexGrow: 1
  },
  formPanel: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 32
  },
  formInner: {
    maxWidth: 400,
    width: "100%"
  },
  logo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#44403c",
    marginBottom: 36,
    letterSpacing: 0.5
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1c1917",
    marginBottom: 8
  },
  subheading: {
    fontSize: 15,
    color: "#78716c",
    marginBottom: 28,
    lineHeight: 22
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#44403c",
    marginBottom: 6
  },
  required: {
    color: "#dc2626"
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#e7e5e4",
    borderRadius: 10,
    borderWidth: 1,
    color: "#1c1917",
    fontSize: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  forgotLink: {
    alignSelf: "flex-start",
    marginBottom: 20
  },
  forgotText: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "600"
  },
  error: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 12
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#1c1917",
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 12
  },
  primaryButtonPressed: {
    opacity: 0.85
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  },
  oauthButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#e7e5e4",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 10
  },
  oauthButtonPressed: {
    backgroundColor: "#f5f5f4"
  },
  oauthButtonText: {
    color: "#1c1917",
    fontSize: 15,
    fontWeight: "600"
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
    marginRight: 10
  },
  appleIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1917",
    marginRight: 10
  },
  footerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 20
  },
  footerText: {
    color: "#78716c",
    fontSize: 14
  },
  footerLink: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "700"
  },
  artPanelWide: {
    flex: 1,
    overflow: "hidden"
  },
  artPanelMobile: {
    width: "100%",
    height: 220,
    overflow: "hidden"
  },
  artImage: {
    width: "100%",
    height: "100%"
  }
});
