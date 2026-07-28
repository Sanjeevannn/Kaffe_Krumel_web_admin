import { api } from "@/lib/api";
import {
  clearAuthStorage,
  setStoredUser,
  setTokens,
} from "@/lib/tokenStorage";
import type { AuthUser } from "@/types";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser & { redirectTo: string };
}

export async function loginWithApi(email: string, password: string) {
  const data = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });

  setTokens(data.accessToken, data.refreshToken);
  const user: AuthUser = {
    email: data.user.email,
    role: data.user.role,
    name: data.user.name,
    branch: data.user.branch,
    branchId: data.user.branchId,
    staffRole: data.user.staffRole,
  };
  setStoredUser(user);

  return { user, redirectTo: data.user.redirectTo };
}

export async function fetchCurrentUser() {
  return api.get<AuthUser & { redirectTo: string }>("/api/auth/me");
}

export async function logoutFromApi() {
  const refreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem("kaffe_krumel_refresh")
      : null;

  try {
    if (refreshToken) {
      await api.post("/api/auth/logout", { refreshToken });
    }
  } finally {
    clearAuthStorage();
  }
}
