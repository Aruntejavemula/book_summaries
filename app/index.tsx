import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { colors } from "../constants/colors";
import { useAuthSession } from "../lib/auth-session";
import { getOnboardingCompleted } from "../lib/onboarding";

/* Set to true to skip login and go straight to onboarding (for testing) */
const BYPASS_LOGIN = true;

export default function Index() {
  const { isLoading, session } = useAuthSession();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (BYPASS_LOGIN || session) {
      void getOnboardingCompleted().then(setHasCompletedOnboarding);
    }
  }, [session]);

  /* When bypass is on, always send to onboarding so we can test the flow */
  if (BYPASS_LOGIN) {
    return <Redirect href="/(onboarding)" />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (hasCompletedOnboarding === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)" />;
}
