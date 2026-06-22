import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
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
    <View style={{ flex: 1, gap: 12, justifyContent: "center", padding: 16 }}>
      <Text>Login</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} placeholder="Email" value={email} />
      <TextInput autoCapitalize="none" onChangeText={setPassword} placeholder="Password" secureTextEntry value={password} />
      {errorMessage ? <Text>{errorMessage}</Text> : null}
      <Button disabled={isSubmitting} title={isSubmitting ? "Signing in..." : "Sign In"} onPress={handleLogin} />
      <Link href="/(auth)/register">Create account</Link>
    </View>
  );
}
