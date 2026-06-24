import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { colors } from "../constants/colors";
import { BYPASS_LOGIN, FORCE_ONBOARDING } from "../constants/dev-flags";
import { useAuthSession } from "../lib/auth-session";
import { getOnboardingCompleted } from "../lib/onboarding";

export default function Index() {
  const { isLoading, session } = useAuthSession();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (BYPASS_LOGIN || session) {
      void getOnboardingCompleted().then(setHasCompletedOnboarding);
    }
  }, [session]);

  if (isLoading && !BYPASS_LOGIN) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  // Flow: login (off when BYPASS_LOGIN) -> onboarding -> tabs
  if (!BYPASS_LOGIN && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!FORCE_ONBOARDING && hasCompletedOnboarding === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (FORCE_ONBOARDING || !hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)" />;
}
