import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/app_config.dart';
import '../../auth/services/auth_storage.dart';

class ChatConversationSummary {
  final String id;
  final String otherUserId;
  final String otherUserName;
  final String? otherUserAvatarUrl;
  final String? itemId;
  final String? itemTitle;
  final String? itemImageUrl;
  final String lastMessage;
  final String lastMessageTime;
  final int unreadCount;

  const ChatConversationSummary({
    required this.id,
    required this.otherUserId,
    required this.otherUserName,
    this.otherUserAvatarUrl,
    this.itemId,
    this.itemTitle,
    this.itemImageUrl,
    required this.lastMessage,
    required this.lastMessageTime,
    required this.unreadCount,
  });

  factory ChatConversationSummary.fromJson(Map<String, dynamic> json) {
    final otherUser = (json['otherUser'] as Map<String, dynamic>?) ?? const {};
    final item = json['item'] as Map<String, dynamic>?;
    return ChatConversationSummary(
      id: json['id'] as String,
      otherUserId: otherUser['id'] as String? ?? '',
      otherUserName: otherUser['name'] as String? ?? 'Unknown User',
      otherUserAvatarUrl: otherUser['avatarUrl'] as String?,
      itemId: item?['id'] as String?,
      itemTitle: item?['title'] as String?,
      itemImageUrl: item?['imageUrl'] as String?,
      lastMessage: json['lastMessage'] as String? ?? '',
      lastMessageTime: json['lastMessageTime'] as String? ?? '',
      unreadCount: json['unreadCount'] as int? ?? 0,
    );
  }
}

class ChatMessage {
  final String id;
  final String text;
  final String senderId;
  final String senderName;
  final bool isSent;
  final String timestampLabel;

  const ChatMessage({
    required this.id,
    required this.text,
    required this.senderId,
    required this.senderName,
    required this.isSent,
    required this.timestampLabel,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      text: json['text'] as String? ?? '',
      senderId: json['senderId'] as String? ?? '',
      senderName: json['senderName'] as String? ?? '',
      isSent: json['isSent'] as bool? ?? false,
      timestampLabel: json['timestampLabel'] as String? ?? '',
    );
  }
}

class ChatConversationDetail {
  final String id;
  final String otherUserName;
  final String? otherUserAvatarUrl;
  final String? itemTitle;
  final String? itemImageUrl;
  final List<ChatMessage> messages;

  const ChatConversationDetail({
    required this.id,
    required this.otherUserName,
    this.otherUserAvatarUrl,
    this.itemTitle,
    this.itemImageUrl,
    required this.messages,
  });

  factory ChatConversationDetail.fromJson(Map<String, dynamic> json) {
    final otherUser = (json['otherUser'] as Map<String, dynamic>?) ?? const {};
    final item = json['item'] as Map<String, dynamic>?;
    final messageRows = (json['messages'] as List<dynamic>? ?? [])
        .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
        .toList();
    return ChatConversationDetail(
      id: json['id'] as String,
      otherUserName: otherUser['name'] as String? ?? 'Unknown User',
      otherUserAvatarUrl: otherUser['avatarUrl'] as String?,
      itemTitle: item?['title'] as String?,
      itemImageUrl: item?['imageUrl'] as String?,
      messages: messageRows,
    );
  }
}

class ChatService {
  const ChatService();

  Future<Map<String, String>> _headers() async {
    final token = await AuthStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<List<ChatConversationSummary>> listConversations() async {
    final response = await http.get(
      Uri.parse('${AppConfig.apiBaseUrl}/api/chat'),
      headers: await _headers(),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'List chats failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final rows = json['conversations'] as List<dynamic>? ?? [];
    return rows
        .map((e) => ChatConversationSummary.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<ChatConversationDetail> getConversation(String conversationId) async {
    final response = await http.get(
      Uri.parse('${AppConfig.apiBaseUrl}/api/chat/$conversationId'),
      headers: await _headers(),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Get chat failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return ChatConversationDetail.fromJson(
      json['conversation'] as Map<String, dynamic>,
    );
  }

  Future<ChatConversationDetail> startConversationForItem(String itemId) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/api/chat/start'),
      headers: await _headers(),
      body: jsonEncode({'itemId': itemId}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Start chat failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return ChatConversationDetail.fromJson(
      json['conversation'] as Map<String, dynamic>,
    );
  }

  Future<ChatMessage> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/api/chat/$conversationId/messages'),
      headers: await _headers(),
      body: jsonEncode({'content': content}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Send message failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return ChatMessage.fromJson(json['message'] as Map<String, dynamic>);
  }
}
