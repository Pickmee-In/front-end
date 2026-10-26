import React, { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";
import { MapCanvasProps, markerColor } from "./MapCanvas.types";

export default function MapCanvas({
  items,
  selectedId,
  center,
  userLocation,
  zoom,
  onZoomChange,
  onSelect,
}: MapCanvasProps) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const layers = useRef<Leaflet.LayerGroup | null>(null);
  const select = useRef(onSelect);
  select.current = onSelect;
  const zoomChanged = useRef(onZoomChange);
  zoomChanged.current = onZoomChange;

  useEffect(() => {
    const L: typeof Leaflet = require("leaflet");
    const instance = L.map(element.current!, {
      zoomControl: false,
      minZoom: 8,
      maxZoom: 19,
    }).setView([center.latitude, center.longitude], zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(instance);
    map.current = instance;
    instance.on("zoomend", () => zoomChanged.current?.(instance.getZoom()));
    layers.current = L.layerGroup().addTo(instance);
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(element.current!);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
      layers.current = null;
    };
  }, []);

  useEffect(() => {
    map.current?.panTo([center.latitude, center.longitude]);
  }, [center]);
  useEffect(() => {
    if (map.current?.getZoom() !== zoom) map.current?.setZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    const L: typeof Leaflet = require("leaflet");
    const group = layers.current;
    if (!group) return;
    group.clearLayers();
    if (userLocation) {
      const position: Leaflet.LatLngExpression = [
        userLocation.latitude,
        userLocation.longitude,
      ];
      L.circle(position, {
        radius: 5000,
        color: "#8CE4FF",
        weight: 1.5,
        fillOpacity: 0.08,
      }).addTo(group);
      L.circleMarker(position, {
        radius: 8,
        color: "white",
        weight: 2.5,
        fillColor: "#2196F3",
        fillOpacity: 1,
      }).addTo(group);
    }
    items.forEach((item) => {
      const selected = selectedId === item.id;
      const size = selected ? 62 : 46;
      const color = markerColor(item.listingType);
      const content = document.createElement("div");
      content.style.cssText = `width:${size}px;height:${size}px;border:${selected ? 3 : 2}px solid ${color};border-radius:50%;background:#f0f8fa;box-shadow:0 0 10px ${color}70;overflow:hidden;box-sizing:border-box`;
      if (selected) content.className = "pickme-selected-marker";
      const wrapper = document.createElement("div");
      wrapper.style.cssText =
        "display:flex;flex-direction:column;align-items:center";
      const dot = document.createElement("div");
      dot.style.cssText = `width:6px;height:6px;border-radius:50%;background:${color}`;
      const photo = document.createElement("img");
      photo.src = item.imageUrl;
      photo.alt = item.title;
      photo.style.cssText = "width:100%;height:100%;object-fit:cover";
      photo.onerror = () => {
        photo.remove();
        content.textContent = String.fromCodePoint(0xe15d);
        content.style.fontFamily = "FlutterMaterialIcons";
        content.style.fontSize = `${size * 0.45}px`;
        content.style.color = color;
        content.style.textAlign = "center";
        content.style.lineHeight = `${size - 6}px`;
      };
      content.appendChild(photo);
      wrapper.append(content, dot);
      L.marker([item.latitude, item.longitude], {
        title: item.title,
        icon: L.divIcon({
          html: wrapper,
          className: "",
          iconSize: [size, size + 6],
          iconAnchor: [size / 2, (size + 6) / 2],
        }),
        zIndexOffset: selected ? 100 : 0,
      })
        .on("click", () => select.current(item))
        .addTo(group);
    });
  }, [items, selectedId, userLocation]);

  return (
    <div
      ref={element}
      aria-label="Peta item di sekitar"
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
    />
  );
}
