import React, { useEffect, useRef } from "react";
import { Image, View, StyleSheet } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
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
    >
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
            <View
              style={{
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
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}
