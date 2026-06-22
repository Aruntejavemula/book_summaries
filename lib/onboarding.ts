import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "book_summaries_onboarding_complete";

export async function getOnboardingCompleted() {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === "true";
}

export async function setOnboardingCompleted() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}
