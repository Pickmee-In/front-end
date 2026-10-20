import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../src/components/Typography";
import { Colors } from "../../src/config/theme";
const slides = [
  {
    title: "Millions of tons\ngo to waste.",
    description:
      "Give your unused clothes a second life. Join the circular fashion movement.",
    icon: "eco",
  },
  {
    title: "Buy sustainably,\nfashionably cheap.",
    description:
      "Find quality pre-loved clothes at unbeatable prices. Support sustainable fashion.",
    icon: "shopping-bag",
  },
  {
    title: "Connect with\nthe community.",
    description:
      "Chat, swap, and trade with other fashion enthusiasts. Build a circular wardrobe together.",
    icon: "people",
  },
] as const;
export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { tutorial } = useLocalSearchParams();
  const path = usePathname();
  const [index, setIndex] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const list = useRef<FlatList>(null);
  useEffect(() => {
    list.current?.scrollToOffset({ offset: index * width, animated: false });
  }, [width]);
  const finish = () =>
    tutorial || path === "/tutorial"
      ? router.back()
      : router.replace("/(auth)/login");
  const go = (next: number) => {
    setIndex(next);
    list.current?.scrollToIndex({ index: next, animated: true });
  };
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <MaterialIcons name="eco" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.brandText}>PickMe</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" onPress={finish}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={list}
        data={slides}
        keyExtractor={(s) => s.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.pages}
        onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, height: pageHeight }]}>
            <View style={styles.half}>
              <LinearGradient
                colors={["#F3FCFF", "#F9FDFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.circle}
              >
                <MaterialIcons
                  name={item.icon}
                  size={80}
                  color={Colors.primary}
                />
              </LinearGradient>
            </View>
            <View style={[styles.half, styles.copy]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: index === i ? 28 : 8,
                backgroundColor: index === i ? Colors.primary : "#E0E0E0",
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.buttons}>
        {index > 0 && (
          <TouchableOpacity
            accessibilityRole="button"
            style={styles.back}
            onPress={() => go(index - 1)}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            index === slides.length - 1 ? "Get Started" : "Next"
          }
          style={styles.next}
          onPress={() =>
            index === slides.length - 1 ? finish() : go(index + 1)
          }
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextInner}
          >
            <Text style={styles.nextText}>
              {index === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
            <MaterialIcons name="arrow-forward" color="white" size={24} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 12,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { backgroundColor: "#EEFBFF", padding: 8, borderRadius: 12 },
  brandText: { fontSize: 18, fontWeight: "800", color: "#222" },
  skip: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9E9E9E",
    paddingVertical: 6,
  },
  pages: { flex: 1 },
  slide: { flex: 1 },
  half: { flex: 1, alignItems: "center", justifyContent: "center" },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { paddingHorizontal: 28 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38.4,
    color: "#222",
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
    color: "#757575",
    textAlign: "center",
    marginTop: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  dot: { height: 8, borderRadius: 4 },
  buttons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  back: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backText: { fontSize: 15, fontWeight: "700", color: Colors.primary },
  next: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  nextInner: {
    flex: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextText: { fontSize: 15, fontWeight: "700", color: "white" },
});
