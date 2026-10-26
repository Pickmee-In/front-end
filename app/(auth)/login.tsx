import { Text } from "../../src/components/Typography";
import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";
import { AppConfig } from "../../src/config/app";
import { AuthApi } from "../../src/services/api";
import { AuthStorage } from "../../src/services/authStorage";
import { MaterialIcons } from "../../src/components/FlutterIcon";
import { Colors, FontSize, Radius, Spacing } from "../../src/config/theme";

export default function LoginScreen() {
  const submitting = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setIsLoading(true);
    try {
      if (!AppConfig.googleWebClientId || (Platform.OS === "ios" && !AppConfig.googleIosClientId)) {
        Alert.alert("Login belum tersedia", "Konfigurasi login aplikasi belum lengkap. Silakan hubungi pengelola PickMe.");
        return;
      }
      GoogleSignin.configure({
        webClientId: AppConfig.googleWebClientId,
        ...(AppConfig.googleIosClientId ? { iosClientId: AppConfig.googleIosClientId } : {}),
      });
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (!isSuccessResponse(result)) return;
      if (!result.data.idToken) throw new Error("Missing Google ID token");
      const session = await AuthApi.loginWithGoogle(result.data.idToken);
      await AuthStorage.saveSession({
        accessToken: session.token,
        refreshToken: session.refreshToken,
        userName: session.user.name,
      });
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) return;
      const unavailable = isErrorWithCode(error) && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE;
      Alert.alert("Login belum berhasil", unavailable
        ? "Perbarui Google Play Services di perangkat ini, lalu coba lagi."
        : "Periksa koneksi dan coba dengan akun Google yang diizinkan. Jika tetap gagal, hubungi pengelola PickMe.");
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <LinearGradient
          colors={["#EEFBFF", "#F9FEFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoCircle}
        >
          <MaterialIcons name="eco-rounded" size={64} color={Colors.primary} />
        </LinearGradient>

        {/* Title */}
        <Text style={styles.title}>Welcome to PickMe</Text>
        <Text style={styles.subtitle}>
          Masuk menggunakan akun Google untuk mulai swipe, swap, dan donasi
          pakaian.
        </Text>

        <View style={{ flex: 1, minHeight: 40 }} />

        {/* Google Button */}
        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.disabledButton]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <MaterialIcons
              name="login-rounded"
              size={22}
              color={Colors.white}
            />
          )}
          <Text style={styles.googleButtonText}>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Metode login lain dinonaktifkan. PickMe hanya menerima Google Auth.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingTop: 44,
    paddingBottom: 44,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Colors.primary}26`,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 36,
  },
  title: {
    fontSize: FontSize["3xl"],
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  googleButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  footerNote: {
    textAlign: "center",
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
});
