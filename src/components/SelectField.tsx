import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "./FlutterIcon";
import { Text } from "./Typography";
import { Colors } from "../config/theme";
export function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={styles.select}
      >
        <Text
          style={[styles.value, !value && { color: "#757575" }]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#757575" />
      </TouchableOpacity>
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>{label}</Text>
            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.option}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 14 }}>{option}</Text>
                  {value === option && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  field: { flex: 1 },
  label: { fontSize: 13, fontWeight: "700", color: "#222", marginBottom: 8 },
  select: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "white",
  },
  value: { fontSize: 16, color: "#222", flex: 1 },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  menu: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 8,
  },
  menuTitle: { fontWeight: "700", padding: 16 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
});
