import React, { useCallback, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/components/Typography";
import { ChatApi, ChatConversationSummary } from "../../src/services/api";
import { Colors } from "../../src/config/theme";
export default function ChatScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversationSummary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setError("");
      setConversations(await ChatApi.listConversations());
    } catch {
      setError("Chat belum dapat dimuat. Tarik ke bawah untuk mencoba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const unread = conversations.reduce((sum, item) => sum + item.unreadCount, 0);
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        {unread > 0 && (
          <View style={styles.total}>
            <Text style={styles.totalText}>{unread}</Text>
          </View>
        )}
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={load}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={
            !conversations.length ? { flex: 1 } : undefined
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Belum ada chat. Mulai dari halaman explore.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
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
            >
              {item.itemImageUrl ? (
                <Image
                  source={{ uri: item.itemImageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.initial]}>
                  <Text style={{ fontSize: 22 }}>
                    {item.otherUserName[0]?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.otherUserName}
                  </Text>
                  <Text style={styles.time}>{item.lastMessageTime}</Text>
                </View>
                {!!item.itemTitle && (
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.itemTitle}
                  </Text>
                )}
                <View style={styles.messageRow}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.message,
                      { fontWeight: item.unreadCount > 0 ? "600" : "400" },
                    ]}
                  >
                    {item.lastMessage || "Mulai percakapan…"}
                  </Text>
                  {item.unreadCount > 0 && (
                    <View style={styles.unread}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  header: { height: 56, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", color: "#222" },
  total: {
    position: "absolute",
    right: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalText: { color: "white", fontSize: 12, fontWeight: "700" },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEFBFF",
  },
  initial: { justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flex: 1, fontSize: 14, fontWeight: "700", color: "#222" },
  time: { fontSize: 11, color: "#9E9E9E" },
  itemTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 2,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  message: { flex: 1, fontSize: 13, color: "#757575" },
  unread: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { fontSize: 11, fontWeight: "700", color: "white" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: { fontSize: 14, color: "#0008", textAlign: "center" },
  error: { fontSize: 12, color: Colors.error, padding: 16 },
});
