import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../../../core/config/app_config.dart';
import '../models/auth_models.dart';

class AuthApiService {
  const AuthApiService();

  Future<AuthSession> loginWithGoogle(String idToken) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/auth/google');

    late final http.Response response;

    try {
      response = await http.post(
        uri,
        headers: const {'Content-Type': 'application/json'},
        body: jsonEncode({'idToken': idToken}),
      );
    } on SocketException {
      throw Exception(
        'Tidak bisa terhubung ke backend (${AppConfig.apiBaseUrl}). '
        'Jika pakai Android Emulator, gunakan API_BASE_URL=http://10.0.2.2:3000',
      );
    } on http.ClientException catch (error) {
      throw Exception(
        'Backend request error: ${error.message}. '
        'Cek API_BASE_URL dan pastikan backend sedang running.',
      );
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final body = response.body;
      throw Exception('Google auth failed (${response.statusCode}): $body');
    }

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return AuthSession.fromJson(json);
  }

  Future<void> logout({
    required String token,
    required String refreshToken,
  }) async {
    final uri = Uri.parse('${AppConfig.apiBaseUrl}/api/auth/logout');

    await http.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'refreshToken': refreshToken}),
    );
  }
}
