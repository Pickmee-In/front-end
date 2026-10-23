import { Text, TextInput } from "../src/components/Typography";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "../src/components/FlutterIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemApi, MyItemDetail } from "../src/services/api";
import { SelectField } from "../src/components/SelectField";
import { Colors, FontSize, Radius, Spacing } from "../src/config/theme";

const CATEGORIES = [
  "Shirt",
  "Pants",
  "Dress",
  "Jacket",
  "Sweater",
  "Skirt",
  "Shoes",
  "Accessories",
  "Other",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const CONDITIONS = [
  "Like New",
  "Excellent Condition",
  "Good Condition",
  "Fair Condition",
];

export default function EditItemScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<MyItemDetail | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!itemId) {
      setError("Item tidak ditemukan.");
      setLoading(false);
      return;
    }
    ItemApi.getMyItemDetail(itemId)
      .then((d) => {
        setDetail(d);
        setTitle(d.title);
        setCategory(d.category.charAt(0).toUpperCase() + d.category.slice(1));
        setSize(d.size);
        const condMap: Record<string, string> = {
          like_new: "Like New",
          excellent: "Excellent Condition",
          good: "Good Condition",
          fair: "Fair Condition",
        };
        setCondition(condMap[d.condition] ?? d.condition);
        setIsFree(d.isFree);
        setPrice(d.price ? String(d.price) : "");
        setDescription(d.description ?? "");
      })
      .catch(() =>
        setError(
          "Gagal memuat item. Buka kembali halaman ini untuk mencoba lagi.",
        ),
      )
      .finally(() => setLoading(false));
  }, [itemId]);

  const pickPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) setNewPhotos(result.assets.map((a) => a.uri));
  };

  const handleSave = async () => {
    if (!itemId || !detail || saving) return;
    if (!title.trim()) {
      setError("Title wajib diisi.");
      return;
    }
    if (
      !isFree &&
      (!price.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0)
    ) {
      setError("Isi harga yang valid.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await ItemApi.updateItem(itemId, {
        title,
        category,
        size,
        condition,
        isFree,
        price,
        description,
        photos: newPhotos.length > 0 ? newPhotos : undefined,
      });
      router.back();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan item.");
    } finally {
      setSaving(false);
    }
  };

  const Chip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
          >
            <MaterialIcons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Item</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Existing photos */}
          {detail?.photoUrls &&
            (detail.photoUrls.length > 0 || newPhotos.length > 0) && (
              <View>
                <Text style={styles.sectionLabel}>Photos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexDirection: "row" }}
                >
                  {(newPhotos.length ? newPhotos : detail.photoUrls).map(
                    (uri, i) => (
                      <Image
                        key={i}
                        source={{ uri }}
                        style={styles.photoThumb}
                      />
                    ),
                  )}
                </ScrollView>
              </View>
            )}

          {/* Replace photos */}
          <View>
            <TouchableOpacity
              style={styles.replacePhotoBtn}
              onPress={pickPhotos}
            >
              <MaterialIcons
                name="photo-library-outlined"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.replacePhotoBtnText}>
                {newPhotos.length > 0
                  ? `${newPhotos.length} new photo(s) selected`
                  : "Replace Photos"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Item title"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <SelectField
            label="Category"
            placeholder="Select category"
            value={category}
            options={CATEGORIES}
            onChange={setCategory}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <SelectField
              label="Size"
              placeholder="Select size"
              value={size}
              options={SIZES}
              onChange={setSize}
            />
            <SelectField
              label="Condition"
              placeholder="Select condition"
              value={condition}
              options={CONDITIONS}
              onChange={setCondition}
            />
          </View>
          <View style={styles.listingTypeRow}>
            <Text>Free item</Text>
            <Switch
              value={isFree}
              onValueChange={setIsFree}
              trackColor={{ true: Colors.primary }}
            />
          </View>

          {!isFree && (
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Price (Rp)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 50000"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.sectionLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the item…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {!!error && (
            <Text accessibilityRole="alert" style={{ color: Colors.error }}>
              {error}
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { alignItems: "center", paddingVertical: 14 },
              (saving || !detail) && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={saving || !detail}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { flex: 1, fontSize: 20, fontWeight: "600", color: Colors.text },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: FontSize.base,
  },
  scrollContent: { padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  photoThumb: {
    width: 96,
    height: 96,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
  },
  replacePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  replacePhotoBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "600",
  },
  fieldGroup: {},
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  chipTextSelected: { color: Colors.white },
  listingTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingTypeSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlignVertical: "top",
    backgroundColor: Colors.white,
    minHeight: 100,
  },
});
