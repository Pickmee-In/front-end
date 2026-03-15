import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/services.dart';

import '../../../core/config/app_config.dart';
import '../models/auth_models.dart';
import 'auth_api_service.dart';
import 'auth_storage.dart';

class GoogleAuthService {
  GoogleAuthService._();

  static final GoogleAuthService instance = GoogleAuthService._();

  final AuthApiService _api = const AuthApiService();

  late final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: const ['email', 'profile'],
    serverClientId: AppConfig.googleServerClientId.isEmpty
        ? null
        : AppConfig.googleServerClientId,
  );

  Future<AuthSession> signIn() async {
    GoogleSignInAccount? account;

    try {
      account = await _googleSignIn.signIn();
    } on PlatformException catch (error) {
      final details = error.message ?? error.code;

      if (error.code == 'sign_in_failed') {
        throw Exception(
          'Google sign-in failed ($details). '
          'Pastikan Android OAuth Client sudah benar (package + SHA-1) dan '
          'GOOGLE_SERVER_CLIENT_ID memakai Web Client ID.',
        );
      }

      throw Exception('Google sign-in error: $details');
    }

    if (account == null) {
      throw Exception('Google sign in cancelled');
    }

    final auth = await account.authentication;
    final idToken = auth.idToken;

    if (idToken == null || idToken.isEmpty) {
      throw Exception(
        'Google ID token not available. Configure GOOGLE_SERVER_CLIENT_ID.',
      );
    }

    final session = await _api.loginWithGoogle(idToken);

    await AuthStorage.saveSession(
      accessToken: session.token,
      refreshToken: session.refreshToken,
      userName: session.user.name,
    );

    return session;
  }

  Future<void> signOut() async {
    final token = await AuthStorage.getAccessToken();
    final refreshToken = await AuthStorage.getRefreshToken();

    if (token != null && refreshToken != null) {
      await _api.logout(token: token, refreshToken: refreshToken);
    }

    await _googleSignIn.signOut();
    await AuthStorage.clearSession();
  }

  Future<bool> isLoggedIn() {
    return AuthStorage.isLoggedIn();
  }
}
