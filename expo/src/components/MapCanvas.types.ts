import type { MapItem } from "../services/api";

export type Coordinates = { latitude: number; longitude: number };
export interface MapCanvasProps {
  items: MapItem[];
  selectedId?: string;
  center: Coordinates;
  userLocation?: Coordinates;
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  onSelect: (item: MapItem) => void;
}
export function markerColor(type: string) {
  return type === "thrift"
    ? "#8CE4FF"
    : type === "donate"
      ? "#4CAF50"
      : "#FF9800";
}
