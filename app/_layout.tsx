import { useEffect } from "react";
import { Linking } from "react-native";
import { Stack } from "expo-router";

import { AuthSessionProvider } from "../lib/auth-session";
import { handleAuthCallback } from "../lib/auth";

export default function RootLayout() {
  useEffect(() => {
    const handleUrl = (url: string) => {
      if (url.startsWith("booksummaries://auth/callback")) {
        void handleAuthCallback(url);
      }
    };

    void Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <AuthSessionProvider>
      <Stack screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[id]" options={{ title: "Book details" }} />
        <Stack.Screen name="player/[id]" options={{ title: "Audio player" }} />
      </Stack>
    </AuthSessionProvider>
  );
}
