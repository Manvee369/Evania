import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { theme, gradients, radii, spacing, shadow } from "../lib/theme";

const Swatch = ({ label, hex }: { label: string; hex: string }) => (
  <View style={styles.swatchRow}>
    <View style={[styles.box, { backgroundColor: hex }]} />
    <Text style={styles.label}>{label}  <Text style={styles.hex}>{hex}</Text></Text>
  </View>
);

export default function PalettePreview() {
  const items: Array<[string, string]> = Object.entries(theme) as any;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, backgroundColor: theme.background }}>
      <Text style={styles.title}>Evania Palette Preview</Text>

      {/* Swatches */}
      <View style={{ gap: 10 }}>
        {items.map(([k, v]) => (
          <Swatch key={k} label={k} hex={v as string} />
        ))}
      </View>

      {/* Sample Card */}
      <View style={[styles.card, shadow.card, { backgroundColor: theme.surface }]}>
        <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>Routine Card</Text>
        <Text style={{ color: theme.text, opacity: 0.8, marginTop: 6 }}>
          Morning Reset · water • breath • note
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <View style={[styles.chip, { backgroundColor: theme.streak }]}><Text>Daily</Text></View>
          <View style={[styles.chip, { backgroundColor: theme.reward }]}><Text>+5 XP</Text></View>
        </View>
      </View>

      {/* Sample Buttons */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]}><Text style={styles.btnText}>Primary</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.accent }]}><Text style={styles.btnText}>Accent</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.success }]}><Text style={{ color: theme.text }}>Soft</Text></TouchableOpacity>
      </View>

      {/* Level/XP HUD mock */}
      <View style={[styles.card, shadow.card, { backgroundColor: theme.surface }]}>
        <Text style={{ color: theme.text, marginBottom: 8 }}>Level 3 · 240 XP</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { backgroundColor: theme.accent, width: "60%" }]} />
        </View>
        <Text style={{ marginTop: 8, color: theme.text, opacity: 0.8 }}>Streak: <Text style={{ fontWeight: "700" }}>4 days</Text></Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: theme.text },
  swatchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  box: { width: 48, height: 36, borderRadius: 8, borderWidth: 0.5, borderColor: "#ddd" },
  label: { color: theme.text, fontSize: 15, fontWeight: "600" },
  hex: { fontWeight: "400", opacity: 0.7 },
  card: { borderRadius: radii.lg, padding: spacing.lg },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  btn: { borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 10 },
  btnText: { color: "white", fontWeight: "700" },
  progressTrack: { height: 10, backgroundColor: "#E9E9E9", borderRadius: 999 },
  progressFill: { height: 10, borderRadius: 999 },
});
