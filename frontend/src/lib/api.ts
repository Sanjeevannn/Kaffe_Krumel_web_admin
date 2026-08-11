import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/tokenStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://kaffe-krumel-backend.onrender.com";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new ApiError(
      res.status,
      text || "Server unavailable. Please try again later."
    );
  }

  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(res.status, "Invalid response from server");
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const json = await parseJsonResponse<{ accessToken: string }>(res);
  if (!res.ok || !json.success || !json.data?.accessToken) {
    clearAuthStorage();
    return null;
  }

  setTokens(json.data.accessToken, refreshToken);
  return json.data.accessToken;
}

async function getValidAccessToken(): Promise<string | null> {
  return getAccessToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = await getValidAccessToken();
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await parseJsonResponse<T>(res);

  if (res.status === 401 && retry && getRefreshToken()) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;
    if (newToken) return request<T>(path, options, false);
  }

  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.message || "Request failed");
  }

  return json.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
};

export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) return "";
  if (!imageUrl.startsWith("blob:")) return imageUrl;

  const blob = await fetch(imageUrl).then((r) => r.blob());
  if (!blob || blob.size === 0) {
    throw new ApiError(400, "Invalid image. Please select the image again.");
  }

  const extension =
    blob.type === "image/jpeg" || blob.type === "image/jpg"
      ? "jpg"
      : blob.type === "image/webp"
        ? "webp"
        : blob.type === "image/gif"
          ? "gif"
          : "png";

  const file = new File([blob], `upload.${extension}`, {
    type: blob.type || `image/${extension}`,
  });

  return uploadImageFile(file);
}

export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, file.name || "upload.png");
  const result = await api.upload<{ url: string }>("/api/media/upload", formData);
  if (!result?.url) {
    throw new ApiError(500, "Image upload failed");
  }
  return result.url;
}

export async function uploadImageFromUrlIfNeeded(
  imageUrl: string
): Promise<string> {
  return uploadImageFromUrl(imageUrl);
}
