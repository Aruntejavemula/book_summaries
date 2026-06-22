import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";

import { useAuthSession } from "../../lib/auth-session";
import { supabase } from "../../lib/supabase";

export default function RegisterScreen() {
  const router = useRouter();
  const { isLoading, session } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/(tabs)/index");
    }
  }, [isLoading, router, session]);

  const handleRegister = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Check your email to confirm");
  };

  return (
    <View style={{ flex: 1, gap: 12, justifyContent: "center", padding: 16 }}>
      <Text>Create account</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} placeholder="Email" value={email} />
      <TextInput autoCapitalize="none" onChangeText={setPassword} placeholder="Password" secureTextEntry value={password} />
      {errorMessage ? <Text>{errorMessage}</Text> : null}
      {successMessage ? <Text>{successMessage}</Text> : null}
      <Button disabled={isSubmitting} title={isSubmitting ? "Creating account..." : "Create Account"} onPress={handleRegister} />
      <Link href="/(auth)/login">Back to login</Link>
    </View>
  );
}
