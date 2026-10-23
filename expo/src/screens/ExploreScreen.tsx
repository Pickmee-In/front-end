import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  Linking,
  Share,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "../components/FlutterIcon";
import * as Location from "expo-location";
import MapCanvas from "../components/MapCanvas";
import type { Coordinates } from "../components/MapCanvas.types";
import { Text, TextInput } from "../components/Typography";
import { MapApi, MapItem, ExploreApi, ChatApi } from "../services/api";
import { Colors } from "../config/theme";

const filters = [
  { label: "All", icon: "verified", value: undefined },
  { label: "Thrift", icon: "shopping-bag", value: "thrift" },
  { label: "Donation", icon: "volunteer-activism", value: "donate" },
  { label: "Zero Waste", icon: "eco", value: "swap" },
] as const;
const defaultCenter = { latitude: -7.706, longitude: 110.601 };
function price(value: number | null) {
  if (value == null || value === 0) return "Free";
  return value >= 1000000
    ? `Rp ${(value / 1000000).toFixed(1)}jt`
    : value >= 1000
      ? `Rp ${Math.round(value / 1000)}k`
      : `Rp ${value}`;
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [items, setItems] = useState<MapItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(0);
  const [center, setCenter] = useState<Coordinates>(defaultCenter);
  const [location, setLocation] = useState<Coordinates>();
  const [zoom, setZoom] = useState(14);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState<"filter" | "details" | null>(null);
  const request = useRef(0);
  const selected = items.find((item) => item.id === selectedId);
  const load = useCallback(async () => {
    const id = ++request.current;
    setLoading(true);
    setError("");
    try {
      const data = await MapApi.getNearbyItems({
        ...location,
        q: search.trim() || undefined,
        listingType: filters[filter].value,
      });
      if (id !== request.current) return;
      setItems(data);
      setSelectedId((previous) =>
        data.some((item) => item.id === previous) ? previous : data[0]?.id,
      );
    } catch (e) {
      if (id === request.current)
        setError(e instanceof Error ? e.message : "Gagal memuat peta.");
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, [location, search, filter]);
  useEffect(() => {
    const timer = setTimeout(load, 350);
    return () => clearTimeout(timer);
  }, [load]);
  const locate = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setError("Izinkan akses lokasi untuk melihat posisimu.");
        return;
      }
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      };
      setLocation(next);
      setCenter(next);
      setZoom(14);
      setError("");
    } catch {
      setError("Lokasi belum tersedia. Coba lagi.");
    }
  };
  const select = (item: MapItem) => {
    setSelectedId(item.id);
    setCenter({ latitude: item.latitude, longitude: item.longitude });
    setZoom(16);
  };
  const favorite = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      if (selected.isFavorite) await ExploreApi.removeFavorite(selected.id);
      else await ExploreApi.swipe(selected.id, "pick");
      setItems((previous) =>
        previous.map((item) =>
          item.id === selected.id
            ? { ...item, isFavorite: !item.isFavorite }
            : item,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memperbarui favorit.");
    } finally {
      setBusy(false);
    }
  };
  const chat = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const conversation = await ChatApi.startForItem(selected.id);
      router.push({
        pathname: "/chat-detail",
        params: { conversationId: conversation.id },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuka chat.");
    } finally {
      setBusy(false);
    }
  };
  const mapUrl = selected
    ? `https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=17/${selected.latitude}/${selected.longitude}`
    : "";
  return (
    <View style={styles.page}>
      <MapCanvas
        items={items}
        selectedId={selectedId}
        center={center}
        userLocation={location}
        zoom={zoom}
        onZoomChange={setZoom}
        onSelect={select}
      />
      <View
        style={[styles.top, { top: insets.top + 16 }]}
        pointerEvents="box-none"
      >
        <View style={styles.row}>
          <View style={styles.search}>
            <MaterialIcons name="search" size={20} color="#9E9E9E" />
            <TextInput
              accessibilityLabel="Search items on map"
              placeholder="Find sustainable clothes..."
              placeholderTextColor="#9E9E9E"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={load}
              style={styles.input}
            />
            <TouchableOpacity accessibilityLabel="Refresh map" onPress={load}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <MaterialIcons name="mic" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            accessibilityLabel="Map filters"
            style={styles.filterButton}
            onPress={() => setSheet("filter")}
          >
            <MaterialIcons name="tune" size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((option, index) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => setFilter(index)}
              style={[styles.pill, filter === index && styles.activePill]}
            >
              <MaterialIcons
                name={option.icon}
                size={16}
                color={filter === index ? "white" : "black"}
              />
              <Text
                style={[
                  styles.pillText,
                  { color: filter === index ? "white" : "black" },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {!!error && (
          <TouchableOpacity onPress={load} style={styles.notice}>
            <Text style={styles.noticeText}>{error}</Text>
          </TouchableOpacity>
        )}
        {!loading && !error && items.length === 0 && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Belum ada item di area ini.</Text>
          </View>
        )}
      </View>
      <View
        style={[
          styles.controls,
          { bottom: height < 650 ? 210 : 320, gap: height < 650 ? 8 : 12 },
        ]}
      >
        {(
          [
            {
              icon: "add",
              label: "Zoom in",
              action: () => setZoom((z) => Math.min(19, z + 1)),
            },
            {
              icon: "remove",
              label: "Zoom out",
              action: () => setZoom((z) => Math.max(8, z - 1)),
            },
            { icon: "near-me", label: "My location", action: locate },
          ] as const
        ).map((control) => (
          <TouchableOpacity
            accessibilityLabel={control.label}
            key={control.label}
            style={[
              styles.mapButton,
              height < 650 && { width: 44, height: 44, borderRadius: 14 },
            ]}
            onPress={control.action}
          >
            <MaterialIcons name={control.icon} size={24} />
          </TouchableOpacity>
        ))}
      </View>
      {selected && (
        <View style={[styles.card, { bottom: height < 650 ? 32 : 80 }]}>
          <View style={styles.cardRow}>
            <View>
              <Image source={{ uri: selected.imageUrl }} style={styles.photo} />
              {selected.isNewDrop && (
                <View style={styles.newBadge}>
                  <Text style={styles.newText}>NEW</Text>
                </View>
              )}
            </View>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text numberOfLines={1} style={styles.title}>
                  {selected.title}
                </Text>
                <TouchableOpacity
                  accessibilityLabel={
                    selected.isFavorite ? "Remove favorite" : "Favorite item"
                  }
                  disabled={busy}
                  onPress={favorite}
                >
                  <MaterialIcons
                    name={selected.isFavorite ? "favorite" : "favorite-border"}
                    size={20}
                    color="#F44336"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.category}>
                {selected.condition} • {selected.category}
              </Text>
              <Text style={styles.distance}>
                {[
                  selected.distance ? `📍 ${selected.distance}` : "",
                  price(selected.price),
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.direction}
              onPress={() =>
                Linking.openURL(mapUrl).catch(() =>
                  setError("Tidak dapat membuka peta."),
                )
              }
            >
              <MaterialIcons name="directions" size={16} color="white" />
              <Text style={styles.directionText}>Get Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chat}
              disabled={busy}
              onPress={chat}
            >
              <MaterialIcons
                name="chat-bubble-outline"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.chatText}>Go to Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Item details"
              style={styles.more}
              onPress={() => setSheet("details")}
            >
              <MaterialIcons name="more-horiz" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {Platform.OS !== "web" && (
        <TouchableOpacity
          accessibilityLabel="OpenStreetMap attribution"
          onPress={() =>
            Linking.openURL("https://www.openstreetmap.org/copyright")
          }
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            paddingHorizontal: 4,
            backgroundColor: "#FFFFFFCC",
          }}
        >
          <Text style={{ fontSize: 10, color: "#0078A8" }}>
            © OpenStreetMap
          </Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={sheet !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)} />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
        >
          {sheet === "filter"
            ? filters.map((option, index) => (
                <TouchableOpacity
                  key={option.label}
                  style={styles.sheetRow}
                  onPress={() => {
                    setFilter(index);
                    setSheet(null);
                  }}
                >
                  <MaterialIcons name={option.icon} size={24} />
                  <Text>
                    {option.label === "All" ? "All items" : option.label}
                  </Text>
                  {filter === index && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))
            : selected && (
                <>
                  <Text style={styles.title}>Details</Text>
                  <Text style={styles.details}>
                    {selected.size} • {selected.listingType.toUpperCase()}
                  </Text>
                  <TouchableOpacity
                    style={styles.sheetRow}
                    onPress={() => {
                      setSheet(null);
                      Share.share({
                        message: `${selected.title} — ${mapUrl}`,
                      }).catch(() => setError("Tidak dapat membagikan item."));
                    }}
                  >
                    <MaterialIcons name="share" size={24} />
                    <Text>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sheetRow}
                    onPress={() => {
                      select(selected);
                      setSheet(null);
                    }}
                  >
                    <MaterialIcons name="map" size={24} />
                    <Text>Centre on map</Text>
                  </TouchableOpacity>
                </>
              )}
        </View>
      </Modal>
    </View>
  );
}
const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#E8EDE8" },
  top: { position: "absolute", left: 16, right: 16 },
  row: { flexDirection: "row", gap: 12 },
  search: {
    ...shadow,
    height: 50,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "white",
  },
  input: { flex: 1, minWidth: 0, fontSize: 14, height: 48 },
  filterButton: {
    ...shadow,
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  filters: { gap: 10, paddingTop: 14, paddingBottom: 4 },
  pill: {
    ...shadow,
    flexDirection: "row",
    gap: 6,
    height: 38,
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: "white",
  },
  activePill: { backgroundColor: "black" },
  pillText: { fontSize: 12, fontWeight: "500" },
  controls: { position: "absolute", right: 16, gap: 12 },
  mapButton: {
    ...shadow,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    ...shadow,
    position: "absolute",
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "white",
  },
  cardRow: { flexDirection: "row", gap: 12 },
  photo: { width: 70, height: 70, borderRadius: 14, backgroundColor: "#EEE" },
  newBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "white",
  },
  newText: { fontSize: 9, fontWeight: "700" },
  info: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { flex: 1, fontSize: 15, fontWeight: "700" },
  category: { fontSize: 11, color: "#FFA500", fontWeight: "600", marginTop: 4 },
  distance: { fontSize: 11, color: "#9E9E9E", marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  direction: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 4,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  directionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "center",
  },
  chat: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  chatText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "center",
  },
  more: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  notice: {
    backgroundColor: "white",
    padding: 12,
    marginTop: 8,
    borderRadius: 12,
  },
  noticeText: { fontSize: 12, color: "#666" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "#0006" },
  sheet: {
    marginTop: "auto",
    padding: 20,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
  },
  details: { color: "#777", marginTop: 6 },
});
