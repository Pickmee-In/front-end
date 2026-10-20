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
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput } from "../src/components/Typography";
import { ProfileApi, UserProfile } from "../src/services/api";
import { Colors } from "../src/config/theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    ProfileApi.getCurrentUser()
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setPhone(p.phone ?? "");
        setBio(p.bio ?? "");
        setLocation(p.locationLabel ?? "");
      })
      .catch(() =>
        setError(
          "Gagal memuat profil. Buka kembali halaman ini untuk mencoba lagi.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;
      setUploading(true);
      setError("");
      setProfile(await ProfileApi.updateAvatar(result.assets[0].uri));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah foto.");
    } finally {
      setUploading(false);
    }
  };
  const save = async () => {
    if (!name.trim()) {
      setError("Full Name wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await ProfileApi.updateProfile({
        name: name.trim(),
        phone,
        bio,
        locationLabel: location,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <LinearGradient
      colors={["#8CE4FF", "#D0F0FF", "#F6F8F6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.page}
    >
      <SafeAreaView style={styles.page} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.page}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity
                accessibilityLabel="Back"
                style={styles.back}
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back" size={24} />
              </TouchableOpacity>
              <Text style={styles.heading}>Edit Profile</Text>
              <View style={styles.back} />
            </View>
            {loading ? (
              <ActivityIndicator
                style={{ margin: 60 }}
                color={Colors.primary}
              />
            ) : (
              <>
                <TouchableOpacity
                  accessibilityLabel="Change profile photo"
                  disabled={uploading || !profile}
                  style={styles.avatarWrap}
                  onPress={pickAvatar}
                >
                  {profile?.avatar ? (
                    <Image
                      source={{ uri: profile.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.fallback]}>
                      <MaterialIcons
                        name="person"
                        size={60}
                        color={Colors.primary}
                      />
                    </View>
                  )}
                  <View style={styles.camera}>
                    {uploading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <MaterialIcons
                        name="camera-alt"
                        size={18}
                        color="white"
                      />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.form}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    accessibilityLabel="Full Name"
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                  />
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    accessibilityLabel="Phone"
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                  <Text style={styles.label}>Bio</Text>
                  <TextInput
                    accessibilityLabel="Bio"
                    style={[styles.input, styles.bio]}
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    maxLength={500}
                  />
                  <Text style={styles.label}>Location</Text>
                  <View style={styles.location}>
                    <TextInput
                      accessibilityLabel="Location"
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      value={location}
                      onChangeText={setLocation}
                    />
                    <MaterialIcons
                      name="location-on"
                      size={24}
                      color={Colors.primary}
                      style={{ marginRight: 14 }}
                    />
                  </View>
                  {!!error && (
                    <Text accessibilityRole="alert" style={styles.error}>
                      {error}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.save,
                      (saving || !profile) && { opacity: 0.5 },
                    ]}
                    disabled={saving || uploading || !profile}
                    onPress={save}
                  >
                    {saving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <MaterialIcons name="check" size={20} color="white" />
                        <Text style={styles.saveText}>Save Changes</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingBottom: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700" },
  avatarWrap: { alignSelf: "center", marginTop: 16, marginBottom: 24 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "white",
  },
  fallback: {
    backgroundColor: "#F3FCFF",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 24,
  },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#222", marginBottom: 6 },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 48,
    marginBottom: 16,
  },
  bio: { minHeight: 92, textAlignVertical: "top" },
  location: {
    backgroundColor: "white",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  save: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveText: { fontSize: 14, fontWeight: "700", color: "white" },
  error: { fontSize: 13, color: "#B91C1C", marginBottom: 16 },
});
