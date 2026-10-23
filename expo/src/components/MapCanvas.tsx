import React, { useEffect, useRef } from "react";
import {
  Image,
  View,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  AccessibilityInfo,
} from "react-native";
import MapView, { Marker, Circle, UrlTile } from "react-native-maps";
import { MapCanvasProps, markerColor } from "./MapCanvas.types";

export default function MapCanvas({
  items,
  selectedId,
  center,
  userLocation,
  zoom,
  onSelect,
}: MapCanvasProps) {
  const map = useRef<MapView>(null);
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!active || reduced) return;
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(blink, {
            toValue: 0.6,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(blink, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    });
    return () => {
      active = false;
      animation?.stop();
    };
  }, [blink]);
  const delta = 360 / 2 ** zoom;
  useEffect(() => {
    map.current?.animateCamera({ center });
  }, [center]);
  useEffect(() => {
    map.current?.animateCamera({ zoom });
  }, [zoom]);
  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      initialRegion={{ ...center, latitudeDelta: delta, longitudeDelta: delta }}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      mapType={Platform.OS === "android" ? "none" : "standard"}
    >
      <UrlTile
        urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
      />
      {userLocation && (
        <Circle
          center={userLocation}
          radius={5000}
          strokeColor="#8CE4FF70"
          fillColor="#8CE4FF14"
          strokeWidth={1.5}
        />
      )}
      {items.map((item) => {
        const selected = selectedId === item.id;
        const size = selected ? 62 : 46;
        return (
          <Marker
            key={item.id}
            coordinate={item}
            onPress={() => onSelect(item)}
            zIndex={selected ? 100 : 0}
          >
            <View style={{ alignItems: "center" }}>
              <Animated.View
                style={{
                  opacity: selected ? blink : 1,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: selected ? 3 : 2,
                  borderColor: markerColor(item.listingType),
                  overflow: "hidden",
                  backgroundColor: "#F3FCFF",
                }}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              </Animated.View>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: markerColor(item.listingType),
                }}
              />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}
