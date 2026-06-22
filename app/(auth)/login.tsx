import { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";

import { colors } from "../../constants/colors";
import { useAuthSession } from "../../lib/auth-session";
import { signInWithOAuth } from "../../lib/oauth";
import { supabase } from "../../lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const { isLoading, session } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/(tabs)");
    }
  }, [isLoading, router, session]);

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Enter your email and password.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid email", "Enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsSubmitting(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    router.replace("/(tabs)");
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      Alert.alert("Sign in failed", error instanceof Error ? error.message : "Unable to sign in.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login screen</Text>
      <Text style={styles.subtitle}>Sign in with email and password.</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        placeholderTextColor={colors.muted}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        placeholderTextColor={colors.muted}
        value={password}
      />
      <Button
        disabled={isSubmitting}
        title={isSubmitting ? "Logging in..." : "Log in"}
        onPress={handleLogin}
      />
      <Button title="Continue with Google" onPress={() => handleSocialSignIn("google")} />
      <Button title="Continue with Apple" onPress={() => handleSocialSignIn("apple")} />
      <Link href="/(auth)/register" style={styles.link}>
        Create an account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted
  },
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    padding: 12
  },
  link: {
    color: colors.primary
  }
});
