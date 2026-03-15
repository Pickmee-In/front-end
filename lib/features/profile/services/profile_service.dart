import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import '../../../core/config/app_config.dart';
import '../../auth/services/auth_storage.dart';

class UserProfile {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String? avatar;
  final String? bio;
  final String? locationLabel;
  final bool isProfileComplete;

  const UserProfile({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    this.avatar,
    this.bio,
    this.locationLabel,
    required this.isProfileComplete,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? 'User',
      phone: json['phone'] as String?,
      avatar: json['avatar'] as String?,
      bio: json['bio'] as String?,
      locationLabel: json['locationLabel'] as String?,
      isProfileComplete: json['isProfileComplete'] as bool? ?? false,
    );
  }
}

class ProfileStats {
  final int activeItems;
  final int completedMatches;
  final double carbonSavedKg;
  final int ecoPoints;
  final String level;
  final double progressValue;
  final int unreadMessages;
  final int totalConversations;
  final int itemsReused;

  const ProfileStats({
    required this.activeItems,
    required this.completedMatches,
    required this.carbonSavedKg,
    required this.ecoPoints,
    required this.level,
    required this.progressValue,
    required this.unreadMessages,
    required this.totalConversations,
    required this.itemsReused,
  });

  factory ProfileStats.fromJson(Map<String, dynamic> json) {
    return ProfileStats(
      activeItems: json['activeItems'] as int? ?? 0,
      completedMatches: json['completedMatches'] as int? ?? 0,
      carbonSavedKg: (json['carbonSavedKg'] as num?)?.toDouble() ?? 0,
      ecoPoints: json['ecoPoints'] as int? ?? 0,
      level: json['level'] as String? ?? 'Eco Beginner',
      progressValue: (json['progressValue'] as num?)?.toDouble() ?? 0.05,
      unreadMessages: json['unreadMessages'] as int? ?? 0,
      totalConversations: json['totalConversations'] as int? ?? 0,
      itemsReused: json['itemsReused'] as int? ?? 0,
    );
  }
}

class ProfileService {
  const ProfileService();

  Future<Map<String, String>> _headers() async {
    final token = await AuthStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, String>> _multipartHeaders() async {
    final token = await AuthStorage.getAccessToken();
    return {
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<UserProfile> getCurrentUser() async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/users/me');
    final response = await http.get(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Get profile failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return UserProfile.fromJson(json['user'] as Map<String, dynamic>);
  }

  Future<UserProfile> updateProfile({
    required String name,
    String? phone,
    String? bio,
    String? locationLabel,
  }) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/users/me');
    final response = await http.patch(
      uri,
      headers: await _headers(),
      body: jsonEncode({
        'name': name,
        'phone': phone,
        'bio': bio,
        'locationLabel': locationLabel,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Update profile failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return UserProfile.fromJson(json['user'] as Map<String, dynamic>);
  }

  Future<UserProfile> updateAvatar(XFile image) async {
    final request = http.MultipartRequest(
      'PATCH',
      Uri.parse('${AppConfig.apiBaseUrl}/api/users/me/avatar'),
    );

    request.headers.addAll(await _multipartHeaders());
    request.files.add(await http.MultipartFile.fromPath('avatar', image.path));

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Update avatar failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return UserProfile.fromJson(json['user'] as Map<String, dynamic>);
  }

  Future<ProfileStats> getStats() async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/users/me/stats');
    final response = await http.get(uri, headers: await _headers());

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        'Get profile stats failed (${response.statusCode}): ${response.body}',
      );
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return ProfileStats.fromJson(json['stats'] as Map<String, dynamic>);
  }
}
