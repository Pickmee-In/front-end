class AuthUser {
  final String id;
  final String email;
  final String name;
  final String? avatar;
  final bool isProfileComplete;

  const AuthUser({
    required this.id,
    required this.email,
    required this.name,
    required this.avatar,
    required this.isProfileComplete,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
      isProfileComplete: (json['isProfileComplete'] as bool?) ?? false,
    );
  }
}

class AuthSession {
  final String token;
  final String refreshToken;
  final int expiresIn;
  final bool isNewUser;
  final bool isProfileComplete;
  final AuthUser user;

  const AuthSession({
    required this.token,
    required this.refreshToken,
    required this.expiresIn,
    required this.isNewUser,
    required this.isProfileComplete,
    required this.user,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      token: json['token'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresIn: json['expiresIn'] as int,
      isNewUser: (json['isNewUser'] as bool?) ?? false,
      isProfileComplete: (json['isProfileComplete'] as bool?) ?? false,
      user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
