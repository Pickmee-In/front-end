import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../core/config/app_config.dart';
import '../../auth/services/auth_storage.dart';

class AppNotification {
  final String id;
  final String title;
  final String message;
  final String type;
  final DateTime timestamp;
  final bool isRead;
  final Map<String, dynamic>? data;

  const AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    required this.isRead,
    this.data,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      title: json['title'] as String? ?? '',
      message: json['body'] as String? ?? '',
      type: json['type'] as String? ?? 'system',
      timestamp: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
      isRead: json['isRead'] as bool? ?? false,
      data: json['data'] as Map<String, dynamic>?,
    );
  }
}

class NotificationListResult {
  final int unreadCount;
  final List<AppNotification> notifications;

  const NotificationListResult({
    required this.unreadCount,
    required this.notifications,
  });
}

class NotificationService {
  const NotificationService();

  Future<Map<String, String>> _headers() async {
    final token = await AuthStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<NotificationListResult> listNotifications() async {
    final response = await http.get(
      Uri.parse('${AppConfig.apiBaseUrl}/api/notifications'),
      headers: await _headers(),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'List notifications failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final rows = (json['notifications'] as List<dynamic>? ?? [])
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();

    return NotificationListResult(
      unreadCount: json['unreadCount'] as int? ?? 0,
      notifications: rows,
    );
  }

  Future<void> markRead(String notificationId) async {
    final response = await http.patch(
      Uri.parse('${AppConfig.apiBaseUrl}/api/notifications/$notificationId/read'),
      headers: await _headers(),
    );
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Mark notification read failed (${response.statusCode}): ${response.body}',
      );
    }
  }

  Future<void> markAllRead() async {
    final response = await http.patch(
      Uri.parse('${AppConfig.apiBaseUrl}/api/notifications/read-all'),
      headers: await _headers(),
    );
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Mark all notifications read failed (${response.statusCode}): ${response.body}',
      );
    }
  }
}
