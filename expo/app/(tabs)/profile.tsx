import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ProfileApi,
  ItemApi,
  UserProfile,
  ProfileStats,
  MyItem,
} from "../../src/services/api";
import { AuthStorage } from "../../src/services/authStorage";
import { Text } from "../../src/components/Typography";
import { Colors } from "../../src/config/theme";
export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MyItem | null>(null);
  const load = useCallback(async () => {
    setError("");
    try {
      const [p, s, i] = await Promise.all([
        ProfileApi.getCurrentUser(),
        ProfileApi.getStats(),
        ItemApi.listMyItems(),
      ]);
      setProfile(p);
      setStats(s);
      setItems(i);
    } catch {
      setError("Profil belum bisa dimuat. Tarik ke bawah untuk mencoba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const confirm = (message: string, action: () => Promise<void>) => {
    if (Platform.OS === "web") {
      if (window.confirm(message)) void action();
    } else
      Alert.alert("PickMe", message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            void action();
          },
        },
      ]);
  };
  const logout = () =>
    confirm("Are you sure you want to sign out?", async () => {
      await AuthStorage.clearSession();
    });
  const remove = (item: MyItem) =>
    confirm(`Delete ${item.title}?`, async () => {
      try {
        await ItemApi.deleteItem(item.id);
        setItems((previous) => previous.filter((i) => i.id !== item.id));
      } catch {
        setError("Item belum dapat dihapus.");
      }
    });
  return (
    <LinearGradient
      colors={["#8CE4FF", "#D0F0FF", "#F6F8F6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.screen}
    >
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                setLoading(true);
                void load();
              }}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            <TouchableOpacity
              accessibilityLabel="View Tutorial"
              style={styles.iconButton}
              onPress={() => router.push("/tutorial")}
            >
              <MaterialIcons name="help-outline" size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Sign Out"
              style={styles.iconButton}
              onPress={logout}
            >
              <MaterialIcons name="logout" size={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.profile}>
            <View>
              <View style={styles.avatar}>
                {profile?.avatar ? (
                  <Image
                    source={{ uri: profile.avatar }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <MaterialIcons name="person" size={64} color="white" />
                )}
              </View>
              <View style={styles.verified}>
                <MaterialIcons
                  name="verified"
                  color={Colors.primary}
                  size={14}
                />
              </View>
            </View>
            <Text style={styles.name}>
              {profile?.name ?? (loading ? "Loading..." : "My Profile")}
            </Text>
            <Text style={styles.badge}>ECO HERO</Text>
            <Text style={styles.bio}>
              {profile?.bio ||
                "Lengkapi profilmu untuk mulai swap dan thrift 🌿"}
            </Text>
            {!!profile?.locationLabel && (
              <View style={styles.location}>
                <MaterialIcons name="location-on" color="#666" size={14} />
                <Text style={styles.locationText}>{profile.locationLabel}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.edit}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={styles.editText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
          {!!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <MaterialIcons
                  name="cyclone"
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.statLabel}>Completed Swaps</Text>
                <Text style={styles.statValue}>
                  {loading ? "..." : (stats?.completedMatches ?? 0)}
                </Text>
              </View>
              <View style={styles.stat}>
                <MaterialIcons name="eco" size={20} color={Colors.primary} />
                <Text style={styles.statLabel}>Carbon Saved</Text>
                <Text style={styles.statValue}>
                  {loading
                    ? "..."
                    : `${(stats?.carbonSavedKg ?? 0).toFixed(1)}kg`}
                </Text>
              </View>
            </View>
            <View style={styles.level}>
              <Text style={styles.levelText}>
                {loading
                  ? "Loading level..."
                  : `${stats?.level ?? "Eco Beginner"} • ${stats?.ecoPoints ?? 0} pts`}
              </Text>
              <View style={styles.progress}>
                <View
                  style={[
                    styles.progressValue,
                    {
                      width: `${Math.max(0, Math.min(100, (stats?.progressValue ?? 0.05) * 100))}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.itemsHeader}>
              <Text style={styles.sectionTitle}>My Items</Text>
              <TouchableOpacity
                accessibilityLabel="Refresh my items"
                style={styles.iconButton}
                onPress={load}
              >
                <MaterialIcons name="refresh" size={20} />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : !items.length ? (
              <Text style={styles.empty}>
                No items yet. Tap + to upload your first item.
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.items}
              >
                {items.map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.itemPhoto}>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={StyleSheet.absoluteFill}
                        />
                      ) : (
                        <MaterialIcons
                          name="checkroom"
                          size={32}
                          color="#9E9E9E"
                        />
                      )}
                      <TouchableOpacity
                        accessibilityLabel={`Options for ${item.title}`}
                        style={styles.itemMenu}
                        onPress={() => setSelected(item)}
                      >
                        <MaterialIcons
                          name="more-horiz"
                          color="white"
                          size={20}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemMeta}>
                      Size {item.size} •{" "}
                      {item.isFree
                        ? "Free"
                        : `Rp ${(item.price ?? 0).toLocaleString("id-ID")}`}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <Modal
        transparent
        visible={!!selected}
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.scrim} onPress={() => setSelected(null)}>
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                const item = selected;
                setSelected(null);
                if (item)
                  router.push({
                    pathname: "/edit-item",
                    params: { itemId: item.id },
                  });
              }}
            >
              <Text>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                const item = selected;
                setSelected(null);
                if (item) remove(item);
              }}
            >
              <Text style={{ color: Colors.error }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: 32 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  title: { flex: 1, fontSize: 22, fontWeight: "700", color: "black" },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  profile: { alignItems: "center", paddingHorizontal: 16, paddingVertical: 8 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "white",
    overflow: "hidden",
    backgroundColor: "#B1E7F8",
    alignItems: "center",
    justifyContent: "center",
  },
  verified: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 4,
    borderRadius: 20,
    backgroundColor: "white",
  },
  name: { fontSize: 18, fontWeight: "700", color: "black", marginTop: 8 },
  badge: { fontSize: 12, fontWeight: "700", color: "white", marginTop: 2 },
  bio: {
    paddingHorizontal: 20,
    fontSize: 12,
    color: "#222",
    textAlign: "center",
    marginTop: 6,
  },
  location: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: { fontSize: 12, color: "#666" },
  edit: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 24,
    paddingHorizontal: 30,
    paddingVertical: 10,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  editText: { color: Colors.primary, fontWeight: "700", fontSize: 14 },
  section: { paddingHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "black" },
  stats: { flexDirection: "row", gap: 10, marginTop: 8 },
  stat: {
    flex: 1,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statLabel: { fontSize: 11, color: "#9E9E9E", marginTop: 6 },
  statValue: { fontSize: 18, fontWeight: "700" },
  level: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  levelText: { fontSize: 14, fontWeight: "700" },
  progress: {
    height: 6,
    borderRadius: 8,
    backgroundColor: "#EEE",
    overflow: "hidden",
    marginTop: 8,
  },
  progressValue: { height: 6, backgroundColor: Colors.primary },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  empty: { fontSize: 12, color: "#666", marginTop: 10 },
  items: { gap: 10, paddingTop: 10 },
  item: { width: 145, height: 190 },
  itemPhoto: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },
  itemMenu: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    padding: 2,
  },
  itemName: { fontSize: 12, fontWeight: "700", marginTop: 6 },
  itemMeta: { fontSize: 10, color: "#757575", marginTop: 2 },
  error: { padding: 16, color: Colors.error, fontSize: 12 },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    backgroundColor: "white",
    borderRadius: 12,
    width: 220,
    paddingVertical: 8,
  },
  menuOption: { padding: 16 },
});
