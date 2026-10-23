/** Public Expo configuration. Never put server secrets in EXPO_PUBLIC_* variables. */
export const AppConfig = {
  /** Base URL for the backend API. Override via .env or build config. */
  apiBaseUrl: (
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || "http://localhost:3000"
  ).replace(/\/+$/, ""),

  /** OAuth Web Client ID used by web and native ID-token verification. */
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
} as const;
