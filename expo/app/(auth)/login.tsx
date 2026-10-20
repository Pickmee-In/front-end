import { Text } from "../../src/components/Typography";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Radius, Spacing } from "../../src/config/theme";

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // NOTE: In production, integrate expo-auth-session or
      // @react-native-google-signin/google-signin here.
      // For now we show a placeholder.
      Alert.alert(
        "Google Sign-In",
        "Google Sign-In requires native configuration.\n\n" +
          "Set up EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env " +
          "and configure expo-auth-session for production.",
      );
    } catch (error: any) {
      Alert.alert("Error", error.message ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <View style={styles.logoCircle}>
          <Ionicons name="leaf" size={64} color={Colors.primary} />
        </View>

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
            <Ionicons name="log-in" size={22} color={Colors.white} />
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
    lineHeight: 22,
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
