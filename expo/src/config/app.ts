/** Public Expo configuration. Never put server secrets in EXPO_PUBLIC_* variables. */
export const AppConfig = {
  /** Base URL for the backend API. Override via .env or build config. */
  apiBaseUrl: (
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "http://localhost:3000"
  ).replace(/\/+$/, ""),

  /** Google Identity Services Web Client ID; native login needs separate integration. */
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
} as const;
