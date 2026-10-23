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
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput } from "../src/components/Typography";
import { MaterialIcons } from "../src/components/FlutterIcon";
import {
  ChatApi,
  ChatConversationDetail,
  ChatMessage,
} from "../src/services/api";
import { Colors } from "../src/config/theme";
export default function ChatDetailScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const [conversation, setConversation] =
    useState<ChatConversationDetail | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const list = useRef<FlatList>(null);
  useEffect(() => {
    let active = true;
    if (!conversationId) {
      setLoading(false);
      setError("Percakapan tidak ditemukan.");
      return;
    }
    ChatApi.getConversation(conversationId)
      .then((value) => {
        if (active) setConversation(value);
      })
      .catch(() => {
        if (active)
          setError("Chat belum dapat dimuat. Buka kembali untuk mencoba lagi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [conversationId]);
  const send = async () => {
    const text = input.trim();
    if (!text || sending || !conversationId) return;
    setSending(true);
    setError("");
    try {
      const message = await ChatApi.sendMessage(conversationId, text);
      setConversation((previous) =>
        previous
          ? { ...previous, messages: [...previous.messages, message] }
          : previous,
      );
      setInput("");
    } catch {
      setError("Pesan belum terkirim. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  };
  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.bubble,
        {
          alignSelf: item.isSent ? "flex-end" : "flex-start",
          backgroundColor: item.isSent ? Colors.primary : "#F5F5F5",
          alignItems: item.isSent ? "flex-end" : "flex-start",
        },
      ]}
    >
      <Text style={[styles.message, { color: item.isSent ? "white" : "#222" }]}>
        {item.text}
      </Text>
      <Text
        style={[
          styles.timestamp,
          { color: item.isSent ? "#FFFFFFB3" : "#9E9E9E" },
        ]}
      >
        {item.timestampLabel}
      </Text>
    </View>
  );
  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.screen}
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
          <View style={styles.heading}>
            <Text style={styles.name}>
              {conversation?.otherUserName ?? "Chat"}
            </Text>
            {!!conversation?.itemTitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {conversation.itemTitle}
              </Text>
            )}
          </View>
          <View style={styles.back} />
        </View>
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
        ) : (
          <>
            {!!conversation?.itemImageUrl && (
              <View style={styles.item}>
                <Image
                  source={{ uri: conversation.itemImageUrl }}
                  style={styles.itemPhoto}
                />
                <Text style={styles.itemTitle}>
                  {conversation.itemTitle || "Item chat"}
                </Text>
              </View>
            )}
            <FlatList
              ref={list}
              data={conversation?.messages ?? []}
              renderItem={renderMessage}
              keyExtractor={(message) => message.id}
              contentContainerStyle={styles.messages}
              onContentSizeChange={() =>
                list.current?.scrollToEnd({ animated: true })
              }
            />
            {!!error && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}
            <View style={styles.composer}>
              <TextInput
                accessibilityLabel="Message"
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ketik pesan..."
                placeholderTextColor="#9E9E9E"
                maxLength={1000}
                onSubmitEditing={send}
                editable={!sending}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Send message"
                style={styles.send}
                disabled={sending || !conversation}
                onPress={send}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialIcons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
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
  heading: { flex: 1, alignItems: "center" },
  name: { fontSize: 15, fontWeight: "700", color: "#222" },
  subtitle: { fontSize: 11, fontWeight: "600", color: "#9E9E9E" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
  },
  itemPhoto: { width: 52, height: 52, borderRadius: 10 },
  itemTitle: { flex: 1, fontSize: 14, fontWeight: "700" },
  messages: { paddingHorizontal: 16, paddingVertical: 12 },
  bubble: {
    maxWidth: "92%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  message: { fontSize: 13 },
  timestamp: { fontSize: 10, marginTop: 4 },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  send: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: Colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
  },
});
