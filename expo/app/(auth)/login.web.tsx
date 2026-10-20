import { Text } from "../../src/components/Typography";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { AppConfig } from "../../src/config/app";
import { Colors } from "../../src/config/theme";
import { AuthApi } from "../../src/services/api";
import { AuthStorage } from "../../src/services/authStorage";

type GoogleIdentity = {
  initialize(options: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select: boolean;
  }): void;
  renderButton(element: HTMLElement, options: Record<string, unknown>): void;
};
const googleIdentity = () =>
  (window as Window & { google?: { accounts: { id: GoogleIdentity } } }).google
    ?.accounts.id;

export default function LoginScreen() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();

  useEffect(() => {
    let active = true;
    const showError = (message: string) => {
      if (active) {
        setError(message);
        setLoading(false);
      }
    };
    if (!AppConfig.googleWebClientId) {
      showError("Login Google belum tersedia. Silakan kembali nanti.");
      return;
    }
    const initialize = () => {
      const identity = googleIdentity();
      if (!active || !identity || !buttonRef.current) return;
      identity.initialize({
        client_id: AppConfig.googleWebClientId,
        auto_select: false,
        callback: async ({ credential }) => {
          if (submitting.current || !active) return;
          submitting.current = true;
          setBusy(true);
          setError("");
          try {
            const session = await AuthApi.loginWithGoogle(credential);
            await AuthStorage.saveSession({
              accessToken: session.token,
              refreshToken: session.refreshToken,
              userName: session.user.name,
            });
            // The root session subscription navigates after storage is complete.
          } catch {
            showError(
              "Login belum berhasil. Coba lagi dengan akun Google yang diizinkan.",
            );
          } finally {
            submitting.current = false;
            if (active) setBusy(false);
          }
        },
      });
      buttonRef.current.replaceChildren();
      identity.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        locale: "en",
        width: Math.min(width - 48, 400),
      });
      setLoading(false);
    };
    let script = document.querySelector<HTMLScriptElement>(
      "script[data-pickme-google]",
    );
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client?hl=id";
      script.async = true;
      script.dataset.pickmeGoogle = "true";
      document.head.appendChild(script);
    }
    const onError = () =>
      showError(
        "Google tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.",
      );
    script.addEventListener("load", initialize);
    script.addEventListener("error", onError);
    if (googleIdentity()) initialize();
    const timeout = window.setTimeout(() => {
      if (!googleIdentity()) onError();
    }, 15000);
    return () => {
      active = false;
      clearTimeout(timeout);
      script.removeEventListener("load", initialize);
      script.removeEventListener("error", onError);
    };
  }, [width]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logo}>
          <MaterialIcons name="eco" size={64} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Welcome to PickMe</Text>
        <Text style={styles.description}>
          Masuk menggunakan akun Google untuk mulai swipe, swap, dan donasi
          pakaian.
        </Text>
        <View style={styles.spacer} />
        {(loading || busy) && (
          <ActivityIndicator
            color={Colors.accent}
            style={{ marginBottom: 16 }}
          />
        )}
        {!!error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        <View
          style={{
            alignItems: "center",
            opacity: busy ? 0.5 : 1,
            pointerEvents: busy ? "none" : "auto",
          }}
        >
          {React.createElement("div", {
            ref: buttonRef,
            style: { minHeight: 44 },
          })}
        </View>
        <Text style={styles.footer}>
          Metode login lain dinonaktifkan. PickMe hanya menerima Google Auth.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 44,
    width: "100%",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3FCFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 36,
  },
  title: { fontSize: 28, fontWeight: "800", color: Colors.text },
  description: { fontSize: 14, lineHeight: 22, color: "#757575", marginTop: 8 },
  spacer: { flex: 1, minHeight: 40 },
  error: {
    color: Colors.error,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  footer: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    color: "#757575",
    marginTop: 16,
  },
});
