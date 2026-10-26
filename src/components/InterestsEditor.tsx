import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput } from "./Typography";
import { MaterialIcons } from "./FlutterIcon";
import { Colors } from "../config/theme";
const popular = [
  "#composting",
  "#solar",
  "#recycling",
  "#veganism",
  "#zerowaste",
  "#sustainable",
  "#organic",
  "#eco-friendly",
  "#carbon-neutral",
  "#upcycling",
];
export function InterestsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const add = () => {
    const raw = (custom || selected).trim().replace(/^#+/, "");
    const tag = "#" + raw.toLowerCase().replace(/\s+/g, "-");
    if (!raw) {
      setError("Pilih atau tulis satu tag.");
      return;
    }
    if (tag.length > 40) {
      setError("Tag maksimal 40 karakter.");
      return;
    }
    if (value.includes(tag)) {
      setError("Tag ini sudah ditambahkan.");
      return;
    }
    if (value.length >= 12) {
      setError("Maksimal 12 minat.");
      return;
    }
    onChange([...value, tag]);
    setOpen(false);
  };
  return (
    <>
      <Text style={styles.label}>Sustainable Interests</Text>
      <View style={styles.tags}>
        {value.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity
              accessibilityLabel={`Remove ${tag}`}
              onPress={() => onChange(value.filter((item) => item !== tag))}
            >
              <MaterialIcons name="close" size={14} color="#9E9E9E" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add Tag"
          style={styles.tag}
          onPress={() => {
            setSelected("");
            setCustom("");
            setError("");
            setOpen(true);
          }}
        >
          <Text
            style={[
              styles.tagText,
              { color: Colors.primary, fontWeight: "600" },
            ]}
          >
            + Add Tag
          </Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityLabel="Close tag dialog"
          />
          <View style={styles.dialog}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.dialogContent}
            >
              <View style={styles.header}>
                <Text style={styles.heading}>Add New Tag</Text>
                <TouchableOpacity
                  accessibilityLabel="Close tag dialog"
                  onPress={() => setOpen(false)}
                >
                  <MaterialIcons name="close" size={24} color="#9E9E9E" />
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>Popular Tags</Text>
              <View style={styles.tags}>
                {popular.map((tag) => (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={tag}
                    style={[styles.option, selected === tag && styles.selected]}
                    onPress={() => {
                      setSelected(selected === tag ? "" : tag);
                      setCustom("");
                      setError("");
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected === tag && { color: "white" },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.divider} />
              <Text style={styles.label}>Or Create Custom Tag</Text>
              <View style={styles.inputRow}>
                <MaterialIcons name="tag" color={Colors.primary} size={24} />
                <TextInput
                  accessibilityLabel="Custom tag"
                  placeholder="e.g. #biking, #gardening"
                  value={custom}
                  onChangeText={(text) => {
                    setCustom(text);
                    setSelected("");
                    setError("");
                  }}
                  style={styles.input}
                  maxLength={40}
                  autoCapitalize="none"
                  onSubmitEditing={add}
                />
              </View>
              {!!error && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {error}
                </Text>
              )}
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#EEE" }]}
                  onPress={() => setOpen(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Add selected tag"
                  style={[styles.button, { backgroundColor: Colors.primary }]}
                  onPress={add}
                >
                  <MaterialIcons name="add" size={18} color="white" />
                  <Text style={[styles.buttonText, { color: "white" }]}>
                    Add Tag
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
export function ProfilePreferencesPreview() {
  return (
    <View style={{ marginTop: 20, marginBottom: 20 }}>
      <Text style={styles.sectionLabel}>PRIVACY &amp; NOTIFICATIONS</Text>
      {(
        [
          { title: "Public Profile", icon: "check-circle" },
          { title: "Push Notifications", icon: "notifications" },
        ] as const
      ).map((item) => (
        <View key={item.title} style={styles.preference}>
          <MaterialIcons name={item.icon} size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.preferenceTitle}>{item.title}</Text>
            <Text style={styles.preferenceSubtitle}>Segera tersedia</Text>
          </View>
          <View
            accessibilityRole="switch"
            accessibilityLabel={item.title}
            accessibilityState={{ checked: false, disabled: true }}
            style={styles.switch}
          >
            <View style={styles.thumb} />
          </View>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: "#222", marginBottom: 8 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "white",
  },
  tagText: { fontSize: 12 },
  overlay: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    borderRadius: 20,
    backgroundColor: "white",
    overflow: "hidden",
  },
  dialogContent: { padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  heading: { fontSize: 18, fontWeight: "700" },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  selected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { fontSize: 12, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginTop: 20,
    marginBottom: 16,
  },
  inputRow: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: { flex: 1, minWidth: 0, paddingVertical: 12, fontSize: 14 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 20 },
  button: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { fontSize: 14, fontWeight: "600" },
  error: { color: Colors.error, fontSize: 12, marginTop: 8 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9E9E9E",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  preference: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  preferenceTitle: { fontSize: 13, fontWeight: "600" },
  preferenceSubtitle: { fontSize: 11, color: "#9E9E9E", marginTop: 2 },
  switch: {
    width: 52,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  thumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#BDBDBD" },
});
