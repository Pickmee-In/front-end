import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_NAME_KEY = "user_name";
const listeners = new Set<() => void>();

/* ── Helpers: use SecureStore on native, localStorage on web ── */

let SecureStore: typeof import("expo-secure-store") | null = null;
if (Platform.OS !== "web") {
  SecureStore = require("expo-secure-store");
}

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore!.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore!.getItemAsync(key);
}

async function removeItem(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore!.deleteItemAsync(key);
  }
}

/* ── Public API ── */

export const AuthStorage = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  async saveSession(params: {
    accessToken: string;
    refreshToken: string;
    userName: string;
  }) {
    await setItem(ACCESS_TOKEN_KEY, params.accessToken);
    await setItem(REFRESH_TOKEN_KEY, params.refreshToken);
    await setItem(USER_NAME_KEY, params.userName);
    listeners.forEach((listener) => listener());
  },

  async getAccessToken(): Promise<string | null> {
    return getItem(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return getItem(REFRESH_TOKEN_KEY);
  },

  async getUserName(): Promise<string | null> {
    return getItem(USER_NAME_KEY);
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await getItem(ACCESS_TOKEN_KEY);
    return token != null && token.length > 0;
  },

  async clearSession() {
    await removeItem(ACCESS_TOKEN_KEY);
    await removeItem(REFRESH_TOKEN_KEY);
    await removeItem(USER_NAME_KEY);
    listeners.forEach((listener) => listener());
  },
};
