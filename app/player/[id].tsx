import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio player screen</Text>
      <Text>Audio/book ID: {id ?? "unknown"}</Text>
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
