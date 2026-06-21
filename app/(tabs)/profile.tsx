import { StyleSheet, Text, View } from "react-native";

import { SubscriptionGate } from "../../components/SubscriptionGate";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile screen</Text>
      <SubscriptionGate>
        <Text>Account and subscription status will appear here later.</Text>
      </SubscriptionGate>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: "600"
  }
});
