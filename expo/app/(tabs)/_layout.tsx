import React from "react";
import { Tabs, useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "../../src/components/FlutterIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type BottomTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];
import { Text } from "../../src/components/Typography";
import { Colors } from "../../src/config/theme";

const tabs = [
  { route: "index", label: "Home", icon: "home-rounded" },
  { route: "explore", label: "Explore", icon: "map-rounded" },
  { route: "chat", label: "Chat", icon: "chat-bubble-rounded" },
  { route: "profile", label: "Profile", icon: "person-rounded" },
] as const;
function BottomBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: insets.bottom, height: 71 + insets.bottom },
      ]}
    >
      {tabs.map((tab) => {
        const route = state.routes.find((r) => r.name === tab.route)!;
        const focused = state.routes[state.index]?.name === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            style={styles.tab}
            onPress={() => {
              const event = emitter.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            }}
          >
            <View style={[styles.icon, focused && styles.activeIcon]}>
              <MaterialIcons
                name={tab.icon}
                size={focused ? 26 : 24}
                color={focused ? Colors.primary : "#BDBDBD"}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color: focused ? Colors.primary : "#BDBDBD",
                  fontWeight: focused ? "700" : "600",
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="List New Item"
        style={styles.fab}
        onPress={() => router.push("/upload")}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="upload-placeholder" options={{ href: null }} />
    </Tabs>
  );
}
const styles = StyleSheet.create({
  bar: {
    backgroundColor: "white",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  icon: { padding: 8, borderRadius: 10, height: 42, justifyContent: "center" },
  activeIcon: { backgroundColor: "#F3FCFF" },
  label: { fontSize: 12 },
  fab: {
    position: "absolute",
    top: -28,
    left: "50%",
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
