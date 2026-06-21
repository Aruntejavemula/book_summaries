import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";

import { supabase } from "../../lib/supabase";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert("Registration failed", error.message);
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register screen</Text>
      <Text style={styles.subtitle}>Create an account with email and password.</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <Button title="Register" onPress={handleRegister} />
      <Link href="/(auth)/login" style={styles.link}>
        Back to login
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
    fontWeight: "700"
  },
  subtitle: {
    fontSize: 16
  },
  input: {
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  link: {
    color: "#2563eb"
  }
});
