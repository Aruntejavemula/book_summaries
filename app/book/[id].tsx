import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book detail screen</Text>
      <Text>Book ID: {id ?? "unknown"}</Text>
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
