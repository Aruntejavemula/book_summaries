import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";

import { useAuthSession } from "../lib/auth-session";
import { getOnboardingCompleted } from "../lib/onboarding";

export default function Index() {
  const { isLoading, session } = useAuthSession();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    void getOnboardingCompleted().then(setHasCompletedOnboarding);
  }, []);

  if (isLoading || hasCompletedOnboarding === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href={session ? "/(tabs)" : "/(auth)/login"} />;
}
