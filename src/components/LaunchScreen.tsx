import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Easing,
  AccessibilityInfo,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./Typography";
import { MaterialIcons } from "./FlutterIcon";
export function LaunchScreen() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const textOpacity = useRef(new Animated.Value(0.2)).current;
  const slide = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    let active = true;
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1800,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!active) return;
      if (reduced) {
        opacity.setValue(1);
        scale.setValue(1);
        textOpacity.setValue(1);
        slide.setValue(0);
      } else animation.start();
    });
    return () => {
      active = false;
      animation.stop();
    };
  }, []);
  return (
    <LinearGradient colors={["#8CE4FF", "white"]} style={styles.page}>
      <SafeAreaView style={styles.page}>
        <View style={styles.spacer} />
        <Animated.View
          style={[styles.logo, { opacity, transform: [{ scale }] }]}
        >
          <MaterialIcons name="eco" size={74} color="white" />
        </Animated.View>
        <Animated.View
          style={{
            alignItems: "center",
            marginTop: 30,
            opacity: textOpacity,
            transform: [{ translateY: slide }],
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.name}>Pick</Text>
            <Text style={[styles.name, { color: "#8CE4FF" }]}>Me</Text>
          </View>
          <Text style={styles.tagline}>SUSTAINABLE THRIFT</Text>
          <View style={styles.rule} />
          <Text style={styles.subtitle}>GIVE CLOTHES A SECOND LIFE</Text>
        </Animated.View>
        <View style={styles.spacer} />
        <ActivityIndicator
          accessibilityLabel="Loading PickMe"
          size={26}
          color="#8CE4FF"
          style={{ marginBottom: 34 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  spacer: { flex: 1 },
  logo: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: "#8CE4FF",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8CE4FF",
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  name: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
    color: "#0F172A",
    lineHeight: 58,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#475569",
    marginTop: 8,
  },
  rule: {
    width: 52,
    height: 2,
    borderRadius: 8,
    backgroundColor: "#8CE4FF66",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.4,
    color: "#94A3B8",
    marginTop: 10,
  },
});
