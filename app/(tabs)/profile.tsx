import { Button, StyleSheet, Text, View } from "react-native";

import { SubscriptionGate } from "../../components/SubscriptionGate";
import { useAuthSession } from "../../lib/auth-session";

export default function ProfileScreen() {
  const { session, signOut } = useAuthSession();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile screen</Text>
      <SubscriptionGate>
        <Text>Account and subscription status will appear here later.</Text>
      </SubscriptionGate>
      <Text>{session?.user.email ? `Signed in as ${session.user.email}` : "No session"}</Text>
      <Button title="Sign out" onPress={signOut} />
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
    fontSize: 20,
    fontWeight: "600"
  }
});
