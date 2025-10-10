import React from "react";
import { SafeAreaView, View, Text } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Evania is alive ✨</Text>
      </View>
    </SafeAreaView>
  );
}
