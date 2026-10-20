import { Text, TextInput } from "../src/components/Typography";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChatApi,
  ChatConversationDetail,
  ChatMessage,
} from "../src/services/api";
import { Colors, FontSize, Radius, Spacing } from "../src/config/theme";

export default function ChatDetailScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const [conversation, setConversation] =
    useState<ChatConversationDetail | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!conversationId) return;
    ChatApi.getConversation(conversationId)
      .then(setConversation)
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || sending || !conversationId) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const msg = await ChatApi.sendMessage(conversationId, text);
      setConversation((prev) =>
        prev ? { ...prev, messages: [...prev.messages, msg] } : prev,
      );
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } catch (e: any) {
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.msgRow,
        item.isSent ? styles.msgRowSent : styles.msgRowReceived,
      ]}
    >
      <View
        style={[
          styles.bubble,
          item.isSent ? styles.bubbleSent : styles.bubbleReceived,
        ]}
      >
        <Text style={[styles.bubbleText, item.isSent && styles.bubbleTextSent]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.timestampLabel}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>
            {conversation?.otherUserName ?? "Chat"}
          </Text>
          {conversation?.itemTitle && (
            <Text style={styles.headerSub} numberOfLines={1}>
              re: {conversation.itemTitle}
            </Text>
          )}
        </View>
        {conversation?.itemImageUrl && (
          <Image
            source={{ uri: conversation.itemImageUrl }}
            style={styles.headerItemImg}
          />
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={conversation?.messages ?? []}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Ionicons
              name="chatbubble-outline"
              size={48}
              color={Colors.border}
            />
            <Text style={styles.emptyText}>Start the conversation!</Text>
          </View>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Ionicons name="send" size={18} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
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
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: FontSize.base,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  headerItemImg: { width: 36, height: 36, borderRadius: Radius.sm },
  messagesList: { padding: Spacing.lg, gap: Spacing.sm },
  msgRow: { marginBottom: Spacing.sm },
  msgRowSent: { alignItems: "flex-end" },
  msgRowReceived: { alignItems: "flex-start" },
  bubble: {
    maxWidth: "75%",
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bubbleSent: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleReceived: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: FontSize.base, color: Colors.text, lineHeight: 20 },
  bubbleTextSent: { color: Colors.white },
  timestamp: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  emptyMessages: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: FontSize.base,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.text,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
});
