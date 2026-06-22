import { Redirect } from "expo-router";
import { Text, View } from "react-native";

import { useAuthSession } from "../lib/auth-session";

export default function Index() {
  const { isLoading, session } = useAuthSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Loading session...</Text>
      </View>
    );
  }

  return <Redirect href={session ? "/(tabs)" : "/(auth)/login"} />;
}
