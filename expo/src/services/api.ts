import { AppConfig } from "../config/app";
import { AuthStorage } from "./authStorage";
import { Platform } from "react-native";

/** Browsers require a Blob; native FormData accepts a URI descriptor. */
async function appendPhoto(form: FormData, field: string, uri: string) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Unable to read selected photo");
    const blob = await response.blob();
    const extension =
      blob.type === "image/png"
        ? "png"
        : blob.type === "image/webp"
          ? "webp"
          : "jpg";
    form.append(field, blob, `photo.${extension}`);
  } else {
    const filename = uri.split("/").pop() ?? "photo.jpg";
    const type = /\.png$/i.test(filename)
      ? "image/png"
      : /\.webp$/i.test(filename)
        ? "image/webp"
        : "image/jpeg";
    form.append(field, { uri, name: filename, type } as any);
  }
}

/* ── Shared helpers ──────────────────────────────────────────────── */

async function authHeaders(json = true): Promise<Record<string, string>> {
  const token = await AuthStorage.getAccessToken();
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function safeFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${body}`);
  }
  return res;
}

/* ── Types ───────────────────────────────────────────────────────── */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  isProfileComplete: boolean;
  preferences?: Record<string, unknown> & { interests?: string[] };
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser: boolean;
  isProfileComplete: boolean;
  preferences?: Record<string, unknown> & { interests?: string[] };
  user: AuthUser;
}

/* ── Auth API ────────────────────────────────────────────────────── */

export const AuthApi = {
  async loginWithGoogle(idToken: string): Promise<AuthSession> {
    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    return res.json();
  },

  async logout(token: string, refreshToken: string) {
    await fetch(`${AppConfig.apiBaseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  },
};

/* ── Explore types ───────────────────────────────────────────────── */

export interface ExploreItem {
  id: string;
  name: string;
  category: string;
  condition: string;
  distance: string;
  imageUrl: string;
  isNewDrop: boolean;
  listingType: string;
  size: string;
  isFavorite: boolean;
  price: number | null;
  locationLabel: string | null;
}

export interface ExplorePagination {
  limit: number;
  offset: number;
  count: number;
}

export interface ExploreItemsResponse {
  items: ExploreItem[];
  pagination: ExplorePagination;
}

export interface ExploreFilters {
  category?: string;
  priceFilter?: string;
  sortBy?: string;
  latitude?: number;
  longitude?: number;
  maxDistanceKm?: number;
  includeSwiped?: boolean;
  listingType?: string;
  limit?: number;
  offset?: number;
}

/* ── Explore API ─────────────────────────────────────────────────── */

export const ExploreApi = {
  async getItems(filters: ExploreFilters = {}): Promise<ExploreItemsResponse> {
    const params = new URLSearchParams();
    params.set("limit", String(filters.limit ?? 25));
    params.set("offset", String(filters.offset ?? 0));
    params.set("includeSwiped", String(filters.includeSwiped ?? false));
    if (filters.category) params.set("category", filters.category);
    if (filters.priceFilter) params.set("priceFilter", filters.priceFilter);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.latitude != null)
      params.set("latitude", String(filters.latitude));
    if (filters.longitude != null)
      params.set("longitude", String(filters.longitude));
    if (filters.maxDistanceKm != null)
      params.set("maxDistanceKm", String(filters.maxDistanceKm));
    if (filters.listingType) params.set("listingType", filters.listingType);

    const res = await safeFetch(
      `${AppConfig.apiBaseUrl}/api/explore/items?${params}`,
      { headers: await authHeaders() },
    );
    return res.json();
  },

  async swipe(itemId: string, action: "pick" | "skip") {
    await safeFetch(`${AppConfig.apiBaseUrl}/api/explore/swipe`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ itemId, action }),
    });
  },

  async getFavorites(): Promise<ExploreItem[]> {
    const res = await safeFetch(
      `${AppConfig.apiBaseUrl}/api/explore/favorites`,
      {
        headers: await authHeaders(),
      },
    );
    const json = await res.json();
    return json.items ?? [];
  },

  async removeFavorite(itemId: string) {
    await safeFetch(`${AppConfig.apiBaseUrl}/api/explore/favorites/${itemId}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
  },
};

/* ── Map types ───────────────────────────────────────────────────── */

export interface MapItem {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  listingType: string;
  isFavorite: boolean;
  distance: string;
  distanceKm: number | null;
  locationLabel: string | null;
  category: string;
  condition: string;
  size: string;
  price: number | null;
  isNewDrop: boolean;
}

/* ── Map API ─────────────────────────────────────────────────────── */

export const MapApi = {
  async getNearbyItems(
    opts: {
      latitude?: number;
      longitude?: number;
      maxDistanceKm?: number;
      listingType?: string;
      q?: string;
      limit?: number;
    } = {},
  ): Promise<MapItem[]> {
    const params = new URLSearchParams();
    params.set("limit", String(opts.limit ?? 200));
    if (opts.latitude != null) params.set("latitude", String(opts.latitude));
    if (opts.longitude != null) params.set("longitude", String(opts.longitude));
    if (opts.maxDistanceKm != null)
      params.set("maxDistanceKm", String(opts.maxDistanceKm));
    if (opts.listingType) params.set("listingType", opts.listingType);
    if (opts.q) params.set("q", opts.q);

    const res = await safeFetch(
      `${AppConfig.apiBaseUrl}/api/map/nearby?${params}`,
      { headers: await authHeaders() },
    );
    const json = await res.json();
    return json.items ?? [];
  },

  async getItemById(id: string): Promise<MapItem | null> {
    const res = await fetch(`${AppConfig.apiBaseUrl}/api/map/items/${id}`, {
      headers: await authHeaders(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Map item failed (${res.status})`);
    const json = await res.json();
    return json.item ?? null;
  },
};

/* ── Chat types ──────────────────────────────────────────────────── */

export interface ChatConversationSummary {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  itemId: string | null;
  itemTitle: string | null;
  itemImageUrl: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isSent: boolean;
  timestampLabel: string;
}

export interface ChatConversationDetail {
  id: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  itemTitle: string | null;
  itemImageUrl: string | null;
  messages: ChatMessage[];
}

/* ── Chat API ────────────────────────────────────────────────────── */

export const ChatApi = {
  async listConversations(): Promise<ChatConversationSummary[]> {
    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/chat`, {
      headers: await authHeaders(),
    });
    const json = await res.json();
    return (json.conversations ?? []).map((c: any) => ({
      id: c.id,
      otherUserId: c.otherUser?.id ?? "",
      otherUserName: c.otherUser?.name ?? "Unknown User",
      otherUserAvatarUrl: c.otherUser?.avatarUrl ?? null,
      itemId: c.item?.id ?? null,
      itemTitle: c.item?.title ?? null,
      itemImageUrl: c.item?.imageUrl ?? null,
      lastMessage: c.lastMessage ?? "",
      lastMessageTime: c.lastMessageTime ?? "",
      unreadCount: c.unreadCount ?? 0,
    }));
  },

  async getConversation(
    conversationId: string,
  ): Promise<ChatConversationDetail> {
    const res = await safeFetch(
      `${AppConfig.apiBaseUrl}/api/chat/${conversationId}`,
      {
        headers: await authHeaders(),
      },
    );
    const json = await res.json();
    const c = json.conversation;
    return {
      id: c.id,
      otherUserName: c.otherUser?.name ?? "Unknown User",
      otherUserAvatarUrl: c.otherUser?.avatarUrl ?? null,
      itemTitle: c.item?.title ?? null,
      itemImageUrl: c.item?.imageUrl ?? null,
      messages: (c.messages ?? []).map((m: any) => ({
        id: m.id,
        text: m.text ?? "",
        senderId: m.senderId ?? "",
        senderName: m.senderName ?? "",
        isSent: m.isSent ?? false,
        timestampLabel: m.timestampLabel ?? "",
      })),
    };
  },

  async startForItem(itemId: string): Promise<ChatConversationDetail> {
    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/chat/start`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify({ itemId }),
    });
    const json = await res.json();
    const c = json.conversation;
    return {
      id: c.id,
      otherUserName: c.otherUser?.name ?? "Unknown User",
      otherUserAvatarUrl: c.otherUser?.avatarUrl ?? null,
      itemTitle: c.item?.title ?? null,
      itemImageUrl: c.item?.imageUrl ?? null,
      messages: (c.messages ?? []).map((m: any) => ({
        id: m.id,
        text: m.text ?? "",
        senderId: m.senderId ?? "",
        senderName: m.senderName ?? "",
        isSent: m.isSent ?? false,
        timestampLabel: m.timestampLabel ?? "",
      })),
    };
  },

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<ChatMessage> {
    const res = await safeFetch(
      `${AppConfig.apiBaseUrl}/api/chat/${conversationId}/messages`,
      {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ content }),
      },
    );
    const json = await res.json();
    return json.message;
  },
};

/* ── Notification types ──────────────────────────────────────────── */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
  data?: Record<string, any>;
}

export interface NotificationListResult {
  unreadCount: number;
  notifications: AppNotification[];
}

/* ── Notification API ────────────────────────────────────────────── */

export const NotificationApi = {
  async list(): Promise<NotificationListResult> {
    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/notifications`, {
      headers: await authHeaders(),
    });
    const json = await res.json();
    return {
      unreadCount: json.unreadCount ?? 0,
      notifications: (json.notifications ?? []).map((n: any) => ({
        id: n.id,
        title: n.title ?? "",
        message: n.body ?? "",
        type: n.type ?? "system",
        timestamp: n.createdAt ?? new Date().toISOString(),
        isRead: n.isRead ?? false,
        data: n.data,
      })),
    };
  },

  async markRead(notificationId: string) {
    await safeFetch(
      `${AppConfig.apiBaseUrl}/api/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: await authHeaders(),
      },
    );
  },

  async markAllRead() {
    await safeFetch(`${AppConfig.apiBaseUrl}/api/notifications/read-all`, {
      method: "PATCH",
      headers: await authHeaders(),
    });
  },
};

/* ── Profile types ───────────────────────────────────────────────── */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  locationLabel: string | null;
  isProfileComplete: boolean;
  preferences?: Record<string, unknown> & { interests?: string[] };
}

export interface ProfileStats {
  activeItems: number;
  completedMatches: number;
  carbonSavedKg: number;
  ecoPoints: number;
  level: string;
  progressValue: number;
  unreadMessages: number;
  totalConversations: number;
  itemsReused: number;
}

/* ── Profile API ─────────────────────────────────────────────────── */

export const ProfileApi = {
  async getCurrentUser(): Promise<UserProfile> {
    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/users/me`, {
      headers: await authHeaders(),
    });
    const json = await res.json();
    return json.user;
  },

  async updateProfile(data: {
    name: string;
    phone?: string;
    bio?: string;
    locationLabel?: string;
    preferences?: Record<string, unknown>;
  }): Promise<UserProfile> {
    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/users/me`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.user;
  },

  async updateAvatar(uri: string): Promise<UserProfile> {
    const form = new FormData();
    await appendPhoto(form, "avatar", uri);

    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/users/me/avatar`, {
      method: "PATCH",
      headers: await authHeaders(false),
      body: form,
    });
    const json = await res.json();
    return json.user;
  },

  async getStats(): Promise<ProfileStats> {
    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/users/me/stats`, {
      headers: await authHeaders(),
    });
    const json = await res.json();
    return json.stats;
  },
};

/* ── Item types ──────────────────────────────────────────────────── */

export interface MyItem {
  id: string;
  title: string;
  size: string;
  imageUrl: string;
  category: string | null;
  condition: string | null;
  isFree: boolean;
  price: number | null;
}

export interface MyItemDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  size: string;
  condition: string;
  listingType: string;
  isFree: boolean;
  price: number | null;
  locationLabel: string | null;
  photoUrls: string[];
}

export interface AiAnalyzeResult {
  success: boolean;
  category?: string;
  condition?: string;
  confidence?: number;
  errorCode?: string;
  errorMessage?: string;
  manualInputRequired: boolean;
}

/* ── Item API ────────────────────────────────────────────────────── */

function absoluteImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${AppConfig.apiBaseUrl}${url}`;
}

function mapCondition(value: string): string {
  switch (value.trim().toLowerCase()) {
    case "like new":
      return "like_new";
    case "excellent condition":
      return "excellent";
    case "good condition":
      return "good";
    case "fair condition":
      return "fair";
    default:
      return "good";
  }
}

export const ItemApi = {
  async analyzePhoto(uri: string): Promise<AiAnalyzeResult> {
    const form = new FormData();
    await appendPhoto(form, "photo", uri);

    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/items/analyze`, {
      method: "POST",
      headers: await authHeaders(false),
      body: form,
    });
    const json = await res.json();
    const ai = json.aiAnalysis ?? {};
    return {
      success: json.success ?? false,
      category: ai.category,
      condition: ai.condition,
      confidence: ai.confidence,
      errorCode: ai.errorCode,
      errorMessage: ai.errorMessage,
      manualInputRequired: json.manualInputRequired ?? true,
    };
  },

  async createItem(data: {
    photos: string[];
    title: string;
    category: string;
    size: string;
    condition: string;
    isFree: boolean;
    price?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    locationLabel?: string;
  }) {
    const form = new FormData();
    form.append("title", data.title.trim() || `${data.category} Item`);
    form.append("category", data.category.trim().toLowerCase());
    form.append("size", data.size);
    form.append("condition", mapCondition(data.condition));
    form.append("listingType", data.isFree ? "swap" : "thrift");
    form.append("isFree", String(data.isFree));
    if (!data.isFree && data.price?.trim())
      form.append("price", data.price.trim());
    if (data.description?.trim())
      form.append("description", data.description.trim());
    if (data.latitude != null) form.append("latitude", String(data.latitude));
    if (data.longitude != null)
      form.append("longitude", String(data.longitude));
    if (data.locationLabel?.trim())
      form.append("locationLabel", data.locationLabel.trim());

    for (const uri of data.photos) {
      await appendPhoto(form, "photos", uri);
    }

    await safeFetch(`${AppConfig.apiBaseUrl}/api/items`, {
      method: "POST",
      headers: await authHeaders(false),
      body: form,
    });
  },

  async listMyItems(): Promise<MyItem[]> {
    const res = await safeFetch(`${AppConfig.apiBaseUrl}/api/items/mine`, {
      headers: await authHeaders(),
    });
    const json = await res.json();
    return (json.items ?? []).map((m: any) => ({
      id: m.id,
      title: m.title ?? "Untitled Item",
      size: m.size ?? "-",
      imageUrl: absoluteImageUrl(m.imageUrl),
      category: m.category ?? null,
      condition: m.condition ?? null,
      isFree: m.isFree ?? true,
      price: m.price ?? null,
    }));
  },

  async deleteItem(itemId: string) {
    await safeFetch(`${AppConfig.apiBaseUrl}/api/items/${itemId}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });
  },

  async getMyItemDetail(itemId: string): Promise<MyItemDetail> {
    const res = await safeFetch(
      `${AppConfig.apiBaseUrl}/api/items/mine/${itemId}`,
      {
        headers: await authHeaders(),
      },
    );
    const json = await res.json();
    const item = json.item;
    return {
      id: item.id,
      title: item.title ?? "Untitled Item",
      description: item.description ?? null,
      category: item.category ?? "other",
      size: item.size ?? "-",
      condition: item.condition ?? "good",
      listingType: item.listingType ?? "swap",
      isFree: item.isFree ?? true,
      price: item.price ?? null,
      locationLabel: item.locationLabel ?? null,
      photoUrls: (item.photos ?? [])
        .map((p: any) => absoluteImageUrl(p.url))
        .filter((u: string) => u.length > 0),
    };
  },

  async updateItem(
    itemId: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      size?: string;
      condition?: string;
      isFree?: boolean;
      price?: string;
      photos?: string[];
    },
  ) {
    const form = new FormData();
    if (data.title != null) form.append("title", data.title);
    if (data.description != null) form.append("description", data.description);
    if (data.category != null)
      form.append("category", data.category.trim().toLowerCase());
    if (data.size != null) form.append("size", data.size);
    if (data.condition != null)
      form.append("condition", mapCondition(data.condition));
    if (data.isFree != null) form.append("isFree", String(data.isFree));
    if (data.isFree === false && data.price?.trim())
      form.append("price", data.price.trim());

    if (data.photos) {
      for (const uri of data.photos) {
        await appendPhoto(form, "photos", uri);
      }
    }

    await safeFetch(`${AppConfig.apiBaseUrl}/api/items/${itemId}`, {
      method: "PATCH",
      headers: await authHeaders(false),
      body: form,
    });
  },
};
