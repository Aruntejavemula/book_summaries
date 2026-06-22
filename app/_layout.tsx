import { Stack } from "expo-router";

import { AuthSessionProvider } from "../lib/auth-session";

export default function RootLayout() {
  return (
    <AuthSessionProvider>
      <Stack screenOptions={{ headerTitleAlign: "center" }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[id]" options={{ title: "Book details" }} />
        <Stack.Screen name="player/[id]" options={{ title: "Audio player" }} />
      </Stack>
    </AuthSessionProvider>
  );
}
