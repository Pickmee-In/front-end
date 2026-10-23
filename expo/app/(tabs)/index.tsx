import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
  Animated,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MaterialIcons } from "../../src/components/FlutterIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import {
  ExploreApi,
  ExploreItem,
  NotificationApi,
} from "../../src/services/api";
import { Colors } from "../../src/config/theme";
import { Text } from "../../src/components/Typography";

const categories = [
  "All",
  "Jacket",
  "Shirt",
  "Sweater",
  "Dress",
  "Pants",
  "Skirt",
  "Shoes",
  "Accessories",
];
const sorts = [
  { value: "closest", name: "Closest", label: "Terdekat dari saya" },
  { value: "newest", name: "Newest", label: "Terbaru dulu" },
  { value: "price_asc", name: "Price: Low to High", label: "Harga terendah" },
  { value: "price_desc", name: "Price: High to Low", label: "Harga tertinggi" },
  { value: "condition", name: "Condition", label: "Kondisi terbaik" },
];

function SwipeCard({
  item,
  enabled,
  onSwipe,
}: {
  item: ExploreItem;
  enabled: boolean;
  onSwipe: (action: "pick" | "skip") => Promise<void>;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const { width } = useWindowDimensions();
  const [imageFailed, setImageFailed] = useState(false);
  const rotate = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ["-30deg", "0deg", "30deg"],
    extrapolate: "clamp",
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [30, 160],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const skipOpacity = pan.x.interpolate({
    inputRange: [-160, -30],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const reset = () =>
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  const commit = async (action: "pick" | "skip") => {
    if (!enabled) return;
    Animated.timing(pan, {
      toValue: { x: action === "pick" ? width : -width, y: -50 },
      duration: 300,
      useNativeDriver: false,
    }).start();
    await onSwipe(action);
    reset();
  };
  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      enabled && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > 80 || Math.abs(g.vx) > 0.8)
        void commit(g.dx > 0 ? "pick" : "skip");
      else reset();
    },
    onPanResponderTerminate: reset,
  });
  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.card,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
        },
      ]}
      accessible
      accessibilityLabel={`${item.name}. Geser kanan untuk memilih, kiri untuk melewati.`}
      accessibilityActions={[
        { name: "activate", label: "Pilih pakaian" },
        { name: "escape", label: "Lewati pakaian" },
      ]}
      onAccessibilityAction={(e) => {
        void commit(e.nativeEvent.actionName === "activate" ? "pick" : "skip");
      }}
    >
      {item.imageUrl && !imageFailed ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={styles.imageFallback}>
          <MaterialIcons name="broken-image" size={48} color="#757575" />
        </View>
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[styles.stamp, styles.like, { opacity: likeOpacity }]}
      >
        <Text style={styles.stampText}>LIKE ♥</Text>
      </Animated.View>
      <Animated.View
        style={[styles.stamp, styles.skip, { opacity: skipOpacity }]}
      >
        <Text style={styles.stampText}>NOPE ✕</Text>
      </Animated.View>
      <View style={styles.cardContent}>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category.toUpperCase()}</Text>
          </View>
          {item.isNewDrop && (
            <LinearGradient
              colors={["#66BB6A", "#43A047"]}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>NEW DROP</Text>
            </LinearGradient>
          )}
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.details}>
          <View style={styles.detail}>
            <MaterialIcons
              name="check-circle"
              color="rgba(255,255,255,0.7)"
              size={14}
            />
            <Text style={styles.detailText}>{item.condition}</Text>
          </View>
          <View style={styles.detail}>
            <MaterialIcons
              name="location-on"
              color="rgba(255,255,255,0.7)"
              size={14}
            />
            <Text style={styles.detailText}>
              {item.distance || item.locationLabel || "Lokasi belum tersedia"}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [notice, setNotice] = useState("");
  const [unread, setUnread] = useState(0);
  const [filters, setFilters] = useState({
    category: "All",
    sortBy: "closest",
    priceFilter: "all",
  });
  const [draft, setDraft] = useState(filters);
  const [drawer, setDrawer] = useState(false);
  const [sortMenu, setSortMenu] = useState(false);
  const coords = useRef<{ latitude: number; longitude: number } | undefined>(
    undefined,
  );
  const request = useRef(0);
  const fetchItems = useCallback(async () => {
    const id = ++request.current;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const data = await ExploreApi.getItems({
        category:
          filters.category === "All"
            ? undefined
            : filters.category.toLowerCase(),
        sortBy: filters.sortBy,
        priceFilter: filters.priceFilter,
        ...coords.current,
        maxDistanceKm:
          filters.sortBy === "closest" && coords.current ? 30 : undefined,
        limit: 25,
      });
      if (id === request.current) {
        setItems(data.items);
        setTotal(data.items.length);
      }
    } catch {
      if (id === request.current)
        setError("Periksa koneksi internet lalu coba lagi.");
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);
  useFocusEffect(
    useCallback(() => {
      NotificationApi.list()
        .then((r) => setUnread(r.unreadCount))
        .catch(() => {});
    }, []),
  );
  const applyFilters = async () => {
    setDrawer(false);
    if (draft.sortBy === "closest" && !coords.current) {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          coords.current = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }
      } catch {}
    }
    setFilters({ ...draft });
  };
  const swipe = async (item: ExploreItem, action: "pick" | "skip") => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setNotice("");
    try {
      await ExploreApi.swipe(item.id, action);
      setItems((previous) => previous.filter((i) => i.id !== item.id));
    } catch {
      setNotice("Pilihan belum tersimpan. Silakan coba lagi.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          accessibilityLabel="Saring dan urutkan"
          onPress={() => {
            setDraft(filters);
            setDrawer(true);
          }}
        >
          <MaterialIcons name="menu" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PickMe</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityLabel="Urutkan barang"
            style={styles.sortButton}
            onPress={() => setSortMenu(true)}
          >
            <Text style={styles.sortText} numberOfLines={1}>
              {sorts.find((s) => s.value === filters.sortBy)?.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Notifications"
            style={[styles.iconButton, { width: 40 }]}
            onPress={() => router.push("/notifications")}
          >
            <MaterialIcons name="notifications-none" size={24} />
            {unread > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={52} color="#FF5252" />
          <Text style={styles.errorTitle}>Gagal memuat data explore</Text>
          <Text style={styles.emptyDescription}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={fetchItems}>
            <Text style={styles.whiteButton}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : !items.length ? (
        <View style={styles.center}>
          <LinearGradient
            colors={["#E8FAFF", "#DAF5FF"]}
            style={styles.doneCircle}
          >
            <MaterialIcons name="done-all" size={50} color={Colors.primary} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Semua Item Selesai!</Text>
          <Text style={styles.emptyDescription}>
            {
              "Kamu sudah menjelajahi semua item.\nKembali lagi nanti untuk item baru!"
            }
          </Text>
          <TouchableOpacity style={styles.restart} onPress={fetchItems}>
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text style={styles.whiteButton}>Jelajahi Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.swipeArea}>
          {items
            .slice(1, 3)
            .reverse()
            .map((item, i, arr) => (
              <View
                key={item.id}
                pointerEvents="none"
                style={[
                  styles.backCard,
                  {
                    transform: [
                      { translateY: (arr.length - i) * 8 },
                      { scale: 1 - (arr.length - i) * 0.04 },
                    ],
                  },
                ]}
              >
                <SwipeCard
                  item={item}
                  enabled={false}
                  onSwipe={async () => {}}
                />
              </View>
            ))}
          <View style={styles.frontCard}>
            <SwipeCard
              key={items[0].id}
              item={items[0]}
              enabled={!busy}
              onSwipe={(action) => swipe(items[0], action)}
            />
          </View>
          <View style={styles.progress}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, ((total - items.length + 1) / Math.max(total, 1)) * 100)}%`,
                },
              ]}
            />
          </View>
          {!!notice && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          )}
        </View>
      )}
      <Modal
        transparent
        visible={drawer}
        animationType="fade"
        onRequestClose={() => setDrawer(false)}
      >
        <View style={styles.modal}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDrawer(false)}
            accessibilityLabel="Tutup filter"
          />
          <SafeAreaView style={styles.drawer}>
            <ScrollView contentContainerStyle={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Saring &amp; Urutkan</Text>
                <TouchableOpacity
                  accessibilityLabel="Tutup filter"
                  onPress={() => setDrawer(false)}
                >
                  <MaterialIcons name="close" size={24} />
                </TouchableOpacity>
              </View>
              <Text style={styles.filterLabel}>Urutkan Berdasarkan</Text>
              {sorts.map((sort) => (
                <TouchableOpacity
                  key={sort.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: draft.sortBy === sort.value }}
                  style={styles.option}
                  onPress={() => setDraft({ ...draft, sortBy: sort.value })}
                >
                  <MaterialIcons
                    name={
                      draft.sortBy === sort.value
                        ? "radio-button-checked"
                        : "radio-button-unchecked"
                    }
                    color={
                      draft.sortBy === sort.value ? Colors.primary : "#BDBDBD"
                    }
                    size={20}
                  />
                  <Text style={styles.optionText}>{sort.label}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.filterLabel}>Kategori Barang</Text>
              <View style={styles.chips}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setDraft({ ...draft, category })}
                    style={[
                      styles.chip,
                      draft.category === category && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        draft.category === category && { color: "white" },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.filterLabel}>Tipe Barang</Text>
              {[
                ["Gratis", "free"],
                ["Berbayar", "paid"],
                ["Semua", "all"],
              ].map(([label, value]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.priceOption,
                    draft.priceFilter === value && styles.selectedPrice,
                  ]}
                  onPress={() => setDraft({ ...draft, priceFilter: value })}
                >
                  <Text style={styles.optionText}>{label}</Text>
                  {draft.priceFilter === value && (
                    <MaterialIcons
                      name="check"
                      size={18}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.apply} onPress={applyFilters}>
                <Text style={styles.whiteButton}>Terapkan</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
      <Modal
        transparent
        visible={sortMenu}
        animationType="fade"
        onRequestClose={() => setSortMenu(false)}
      >
        <Pressable style={styles.sortScrim} onPress={() => setSortMenu(false)}>
          <View style={styles.sortMenu}>
            {sorts.map((sort) => (
              <TouchableOpacity
                key={sort.value}
                style={styles.sortOption}
                onPress={() => {
                  setFilters({ ...filters, sortBy: sort.value });
                  setSortMenu(false);
                }}
              >
                <Text>{sort.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAFAFA" },
  header: { height: 56, flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 56,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    position: "absolute",
    left: 60,
    right: 60,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  headerActions: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  sortButton: {
    paddingHorizontal: 8,
    maxWidth: 110,
    height: 48,
    justifyContent: "center",
  },
  sortText: { fontSize: 12, fontWeight: "600", color: "#000" },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: { fontSize: 10, fontWeight: "700", color: "white" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  doneCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#000",
    marginTop: 28,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#757575",
    textAlign: "center",
    marginTop: 12,
  },
  restart: {
    marginTop: 36,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  whiteButton: { color: "white", fontSize: 14, fontWeight: "700" },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  retry: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  swipeArea: { flex: 1 },
  frontCard: {
    ...StyleSheet.absoluteFill,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  backCard: {
    ...StyleSheet.absoluteFill,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  card: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  imageFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E0E0",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  badges: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  badge: {
    backgroundColor: "#616161",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "white",
  },
  itemName: {
    fontSize: 26,
    lineHeight: 31.2,
    fontWeight: "700",
    color: "white",
    marginTop: 14,
    marginBottom: 12,
  },
  details: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detail: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "500",
  },
  progress: {
    position: "absolute",
    top: 16,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: Colors.primary },
  stamp: {
    position: "absolute",
    top: 24,
    borderWidth: 3,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  like: {
    left: 24,
    backgroundColor: "#66BB6A",
    borderColor: "#43A047",
    transform: [{ rotate: "-17deg" }],
  },
  skip: {
    right: 24,
    backgroundColor: "#EF5350",
    borderColor: "#E53935",
    transform: [{ rotate: "17deg" }],
  },
  stampText: { color: "white", fontSize: 24, fontWeight: "700" },
  notice: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#323232",
  },
  noticeText: { color: "white", fontSize: 12 },
  modal: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  drawer: {
    width: 300,
    maxWidth: "90%",
    height: "100%",
    backgroundColor: "white",
  },
  drawerContent: { padding: 20 },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drawerTitle: { fontSize: 18, fontWeight: "800" },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  optionText: { fontSize: 12, fontWeight: "500" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 11, fontWeight: "600", color: "#222" },
  priceOption: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedPrice: { borderColor: Colors.primary, backgroundColor: "#F3FCFF" },
  apply: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  sortScrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.08)" },
  sortMenu: {
    position: "absolute",
    top: 48,
    right: 12,
    width: 200,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "white",
    elevation: 8,
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sortOption: { paddingHorizontal: 16, paddingVertical: 14 },
});
