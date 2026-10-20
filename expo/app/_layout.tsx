import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthStorage } from "../src/services/authStorage";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    JakartaRegular: PlusJakartaSans_400Regular,
    JakartaMedium: PlusJakartaSans_500Medium,
    JakartaSemiBold: PlusJakartaSans_600SemiBold,
    JakartaBold: PlusJakartaSans_700Bold,
    JakartaExtraBold: PlusJakartaSans_800ExtraBold,
  });
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const updateSession = async () => {
      const loggedIn = await AuthStorage.isLoggedIn();
      setIsLoggedIn(loggedIn);
      setIsReady(true);
    };
    const unsubscribe = AuthStorage.subscribe(() => {
      void updateSession();
    });
    void updateSession();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isReady || (!fontsLoaded && !fontError)) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/onboarding");
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isReady, isLoggedIn, segments, fontsLoaded, fontError]);

  if (!isReady || (!fontsLoaded && !fontError)) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="upload" options={{ presentation: "modal" }} />
        <Stack.Screen name="edit-item" options={{ presentation: "modal" }} />
        <Stack.Screen name="chat-detail" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="notifications" />
      </Stack>
    </>
  );
}
