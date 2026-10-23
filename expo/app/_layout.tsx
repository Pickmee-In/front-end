import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthStorage } from "../src/services/authStorage";
import { LaunchScreen } from "../src/components/LaunchScreen";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PickMeRoboto: require("../assets/fonts/Roboto-Flutter.ttf"),
    FlutterMaterialIcons: require("../assets/fonts/MaterialIcons-Regular.otf"),
  });
  const [launchVisible, setLaunchVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLaunchVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);
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
    if (!isReady || (!fontsLoaded && !fontError) || launchVisible) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/onboarding");
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isReady, isLoggedIn, segments, fontsLoaded, fontError, launchVisible]);

  if (!isReady || (!fontsLoaded && !fontError) || launchVisible)
    return <LaunchScreen />;

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
