/** Palette ported from the original Flutter PickMe screens. */
export const Colors = {
  primary: "#8CE4FF",
  primaryDark: "#44CCFF",
  primaryLight: "rgba(140, 228, 255, 0.10)",
  primaryShadow: "rgba(140, 228, 255, 0.30)",
  accent: "#8CE4FF",
  accentLight: "#F3FCFF",

  background: "#FFFFFF",
  surface: "#F8FAFC",
  card: "#FFFFFF",

  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#9E9E9E",
  textPlaceholder: "#9CA3AF",

  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",

  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 18,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  "5xl": 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  "2xl": 24,
  full: 9999,
} as const;
