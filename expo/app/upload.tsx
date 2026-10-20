import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemApi } from "../src/services/api";
import { Text, TextInput } from "../src/components/Typography";
import { SelectField } from "../src/components/SelectField";
import { Colors } from "../src/config/theme";
const categories = [
  "Jacket",
  "Shirt",
  "Sweater",
  "Dress",
  "Pants",
  "Skirt",
  "Shoes",
  "Accessories",
  "Other",
];
const conditions = [
  "Like New",
  "Excellent Condition",
  "Good Condition",
  "Fair Condition",
];
export default function UploadScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiStatus, setAiStatus] = useState("Upload photo for AI detection");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<
    { latitude: number; longitude: number } | undefined
  >();
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const p = await Location.getForegroundPermissionsAsync();
        if (p.status === "granted") {
          const l = await Location.getCurrentPositionAsync({});
          if (active)
            setCoords({
              latitude: l.coords.latitude,
              longitude: l.coords.longitude,
            });
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);
  const pickPhotos = async (camera = false) => {
    if (photos.length >= 5) {
      setError("Maximum 5 photos allowed");
      return;
    }
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setError("Camera permission is required to take a photo.");
          return;
        }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.9,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            quality: 0.9,
            selectionLimit: 5 - photos.length,
          });
      if (result.canceled) return;
      setError("");
      setPhotos((prev) =>
        [...prev, ...result.assets.map((a) => a.uri)].slice(0, 5),
      );
      setAnalyzing(true);
      setAiStatus("Analyzing photo with Gemini...");
      try {
        const ai = await ItemApi.analyzePhoto(result.assets[0].uri);
        if (ai.success) {
          if (ai.category) {
            const c = ai.category[0].toUpperCase() + ai.category.slice(1);
            setCategory(c);
            setAiStatus(`Category detected: ${c}`);
          }
          const map: Record<string, string> = {
            like_new: "Like New",
            excellent: "Excellent Condition",
            good: "Good Condition",
            fair: "Fair Condition",
          };
          if (ai.condition) setCondition(map[ai.condition] ?? "");
        } else
          setAiStatus(
            "AI unavailable. Please select category and condition manually.",
          );
      } catch {
        setAiStatus(
          "AI unavailable. Please select category and condition manually.",
        );
      } finally {
        setAnalyzing(false);
      }
    } catch {
      setError("Unable to open photos. Please try again.");
    }
  };
  const submit = async () => {
    if (submitting) return;
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }
    if (!photos.length) {
      setError("Please upload at least 1 photo");
      return;
    }
    if (!category || !size || !condition) {
      setError("Please fill all fields");
      return;
    }
    if (
      !isFree &&
      (!price.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0)
    ) {
      setError("Please enter a valid price");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      let itemCoords = coords;
      if (!itemCoords) {
        try {
          const permission = await Location.requestForegroundPermissionsAsync();
          if (permission.status === "granted") {
            const position = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            itemCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setCoords(itemCoords);
          }
        } catch {
          // Listing remains available when location cannot be obtained.
        }
      }
      await ItemApi.createItem({
        photos,
        title,
        category,
        size,
        condition,
        isFree,
        price,
        description,
        ...itemCoords,
      });
      router.back();
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Back"
            style={styles.back}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>List New Item</Text>
          <View style={styles.back} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.titleLabel}>Title</Text>
          <TextInput
            accessibilityLabel="Title"
            style={[styles.input, { borderRadius: 16 }]}
            placeholder="e.g. Oversized denim jacket"
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.photosLabel}>Photos</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Add Photo"
            style={styles.uploadBox}
            onPress={() => {
              void pickPhotos();
            }}
          >
            <MaterialIcons
              name="cloud-upload"
              size={48}
              color={Colors.primary}
            />
            <Text style={styles.uploadTitle}>Upload Photo</Text>
            <Text style={styles.uploadSub}>
              Add up to 5 photos of your item
            </Text>
            <View style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Photo</Text>
            </View>
          </TouchableOpacity>
          {!!photos.length && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photos}
            >
              {photos.map((uri, i) => (
                <View key={uri} style={styles.thumbnail}>
                  <Image source={{ uri }} style={StyleSheet.absoluteFill} />
                  <TouchableOpacity
                    accessibilityLabel={`Remove photo ${i + 1}`}
                    style={styles.remove}
                    onPress={() =>
                      setPhotos((prev) => prev.filter((_, n) => n !== i))
                    }
                  >
                    <MaterialIcons name="close" color="white" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.photoAction}
              onPress={() => {
                void pickPhotos(true);
              }}
            >
              <MaterialIcons
                name="photo-camera"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.photoActionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoAction}
              onPress={() => {
                void pickPhotos();
              }}
            >
              <MaterialIcons
                name="photo-library"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.photoActionText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ai}>
            <View style={styles.aiIcon}>
              {analyzing ? (
                <ActivityIndicator color="white" />
              ) : (
                <MaterialIcons name="auto-awesome" size={22} color="white" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiLabel}>AI IDENTIFICATION</Text>
              <Text style={styles.aiStatus}>{aiStatus}</Text>
            </View>
            <MaterialIcons
              name={category ? "check-circle" : "info-outline"}
              size={24}
              color={Colors.primary}
            />
          </View>
          <View style={styles.fields}>
            <SelectField
              label="Category"
              placeholder="Select category"
              value={category}
              options={categories}
              onChange={setCategory}
            />
            <View style={styles.row}>
              <SelectField
                label="Size"
                placeholder="Select size"
                value={size}
                options={["XS", "S", "M", "L", "XL", "XXL"]}
                onChange={setSize}
              />
              <SelectField
                label="Condition"
                placeholder="Select condition"
                value={condition}
                options={conditions}
                onChange={setCondition}
              />
            </View>
            <View>
              <Text style={styles.label}>Harga</Text>
              <View style={styles.row}>
                {[
                  { label: "Free", free: true },
                  { label: "Bayar", free: false },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.priceChoice,
                      isFree === option.free && styles.priceSelected,
                    ]}
                    onPress={() => setIsFree(option.free)}
                  >
                    <Text
                      style={[
                        styles.priceText,
                        {
                          color:
                            isFree === option.free ? Colors.primary : "#757575",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {isFree ? (
                <View style={styles.freeNote}>
                  <Text style={styles.freeText}>
                    Item akan ditampilkan sebagai free untuk di-tukar
                  </Text>
                </View>
              ) : (
                <View style={styles.priceInput}>
                  <Text style={{ color: Colors.primary, fontWeight: "700" }}>
                    Rp
                  </Text>
                  <TextInput
                    accessibilityLabel="Price"
                    style={{ flex: 1, paddingVertical: 14, fontSize: 13 }}
                    keyboardType="numeric"
                    placeholder="Enter price"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
              )}
            </View>
            <View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                accessibilityLabel="Description"
                style={[styles.input, styles.description]}
                multiline
                placeholder="Describe the material, fit, and any flaws..."
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>
          {!!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.submit, submitting && { opacity: 0.6 }]}
            onPress={submit}
            disabled={submitting || analyzing}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>✓ List Item</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.footer}>
            {
              "By listing your item, you agree to PickMe's\nsustainable selling guidelines"
            }
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  header: { height: 56, flexDirection: "row", alignItems: "center" },
  back: {
    width: 56,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  content: { padding: 20, paddingBottom: 44 },
  titleLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 13,
    color: "#222",
    minHeight: 52,
  },
  photosLabel: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 12,
  },
  uploadBox: {
    width: 260,
    maxWidth: "100%",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#DDF7FF",
    backgroundColor: "#F9FEFF",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginTop: 16,
  },
  uploadSub: {
    fontSize: 12,
    color: "#757575",
    marginTop: 6,
    textAlign: "center",
  },
  addButton: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: { fontSize: 13, fontWeight: "700", color: "white" },
  photos: { gap: 10, paddingVertical: 20 },
  thumbnail: { width: 90, height: 90, borderRadius: 12, overflow: "hidden" },
  remove: {
    position: "absolute",
    right: 4,
    top: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 3,
  },
  photoActions: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 20,
    justifyContent: "center",
  },
  photoAction: {
    borderWidth: 1,
    borderColor: "#DDF7FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photoActionText: { fontSize: 12, fontWeight: "600", color: Colors.primary },
  ai: {
    width: 320,
    maxWidth: "100%",
    alignSelf: "center",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F6FDFF",
    borderWidth: 1,
    borderColor: "#E8FAFF",
    borderRadius: 14,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: Colors.primary,
  },
  aiStatus: { fontSize: 13, fontWeight: "700", color: "#222", marginTop: 4 },
  fields: { gap: 18, marginTop: 28 },
  row: { flexDirection: "row", gap: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8, color: "#222" },
  priceChoice: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  priceSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "#F6FDFF",
  },
  priceText: { fontSize: 13, fontWeight: "700" },
  freeNote: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8FAFF",
    backgroundColor: "#F6FDFF",
    marginTop: 12,
  },
  freeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  description: { minHeight: 120, textAlignVertical: "top" },
  submit: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
    elevation: 2,
  },
  submitText: { fontSize: 15, fontWeight: "700", color: "white" },
  footer: {
    marginTop: 12,
    fontSize: 11,
    color: "#757575",
    lineHeight: 15.4,
    textAlign: "center",
  },
  error: { marginTop: 16, color: Colors.error, fontSize: 13 },
});
