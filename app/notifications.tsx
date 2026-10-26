import { Text } from "../src/components/Typography";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "../src/components/FlutterIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationApi, AppNotification } from "../src/services/api";
import { Colors, FontSize, Spacing } from "../src/config/theme";

const TYPE_ICON = {
  match: { icon: "favorite-rounded", color: "#F44336" },
  chat: { icon: "chat-bubble-rounded", color: "#4CAF50" },
  message: { icon: "chat-bubble-rounded", color: "#4CAF50" },
  system: { icon: "info-rounded", color: "#9E9E9E" },
  item: { icon: "checkroom-rounded", color: Colors.primary },
} as const;

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m yang lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j yang lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}h yang lalu`;
  const date = new Date(iso);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await NotificationApi.list();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await NotificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await NotificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* silent */
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const style =
      TYPE_ICON[item.type as keyof typeof TYPE_ICON] ?? TYPE_ICON.system;
    return (
      <TouchableOpacity
        style={[styles.notifRow, !item.isRead && styles.notifRowUnread]}
        onPress={() => !item.isRead && handleMarkRead(item.id)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.iconCircle, { backgroundColor: `${style.color}26` }]}
        >
          <MaterialIcons name={style.icon} size={24} color={style.color} />
        </View>
        <View style={styles.notifInfo}>
          <View style={styles.notifHeading}>
            <Text style={styles.notifTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notifTime}>{timeAgo(item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifikasi</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Read all</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={
            notifications.length === 0 ? { flex: 1 } : { paddingVertical: 8 }
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>Belum ada notifikasi.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },
  backBtn: {
    width: 56,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    position: "absolute",
    left: 72,
    right: 72,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  markAllButton: { marginLeft: "auto", paddingHorizontal: 0 },
  markAllText: {
    fontSize: 14,
    color: "#00758F",
    fontWeight: "400",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textMuted,
    fontWeight: "400",
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    backgroundColor: "white",
    gap: 12,
  },
  notifRowUnread: {
    backgroundColor: `${Colors.primary}14`,
    borderColor: `${Colors.primary}4D`,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notifInfo: { flex: 1 },
  notifHeading: { flexDirection: "row", alignItems: "center" },
  notifTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },
  notifMessage: {
    fontSize: FontSize.sm,
    color: "#757575",
    marginTop: 4,
  },
  notifTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  separator: { height: 1, backgroundColor: Colors.borderLight },
});
