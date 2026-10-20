import { Text } from "../../src/components/Typography";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatApi, ChatConversationSummary } from "../../src/services/api";
import { Colors, FontSize, Radius, Spacing } from "../../src/config/theme";

function timeAgo(iso: string): string {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ChatScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversationSummary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await ChatApi.listConversations();
      setConversations(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const renderItem = ({ item }: { item: ChatConversationSummary }) => (
    <TouchableOpacity
      style={[
        styles.row,
        item.unreadCount > 0 && { backgroundColor: "#FAFEFF" },
      ]}
      onPress={() =>
        router.push({
          pathname: "/chat-detail",
          params: { conversationId: item.id },
        })
      }
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {item.otherUserAvatarUrl ? (
          <Image
            source={{ uri: item.otherUserAvatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>
              {item.otherUserName[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        {item.unreadCount > 0 && <View style={styles.unreadDot} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text
            style={[styles.name, item.unreadCount > 0 && styles.nameUnread]}
          >
            {item.otherUserName}
          </Text>
          <Text style={styles.time}>{timeAgo(item.lastMessageTime)}</Text>
        </View>
        {item.itemTitle && (
          <View style={styles.itemBadge}>
            <Ionicons name="shirt-outline" size={10} color={Colors.primary} />
            <Text style={styles.itemBadgeText} numberOfLines={1}>
              {item.itemTitle}
            </Text>
          </View>
        )}
        <Text
          style={[styles.lastMsg, item.unreadCount > 0 && styles.lastMsgUnread]}
          numberOfLines={1}
        >
          {item.lastMessage || "No messages yet"}
        </Text>
      </View>

      {/* Unread count */}
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>
            {item.unreadCount > 9 ? "9+" : item.unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        {conversations.some((c) => c.unreadCount > 0) && (
          <View
            style={[styles.unreadBadge, { position: "absolute", right: 20 }]}
          >
            <Text style={styles.unreadCount}>
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptySub}>
                Belum ada chat. Mulai dari halaman explore.
              </Text>
            </View>
          }
          contentContainerStyle={
            conversations.length === 0 ? { flex: 1 } : undefined
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { height: 56, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", color: Colors.text },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing["2xl"],
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: "700", color: Colors.text },
  emptySub: {
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  avatarContainer: { position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: 14 },
  avatarFallback: {
    backgroundColor: `${Colors.primary}26`,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.primary,
  },
  unreadDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  info: { flex: 1, gap: 3 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: FontSize.base, fontWeight: "600", color: Colors.text },
  nameUnread: { fontWeight: "800" },
  time: { fontSize: FontSize.xs, color: Colors.textMuted },
  itemBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  itemBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: "600",
  },
  lastMsg: { fontSize: FontSize.sm, color: Colors.textMuted },
  lastMsgUnread: { color: Colors.text, fontWeight: "600" },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadCount: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: "800",
  },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 80 },
});
