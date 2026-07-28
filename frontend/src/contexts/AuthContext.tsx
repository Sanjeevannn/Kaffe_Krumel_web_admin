"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  fetchCurrentUser,
  loginWithApi,
  logoutFromApi,
} from "@/services/authService";
import { getStoredUser, clearAuthStorage } from "@/lib/tokenStorage";
import type { AuthContextValue, AuthUser } from "@/types";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function restoreSession() {
      const stored = getStoredUser();
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const profile = await fetchCurrentUser();
        setUser({
          email: profile.email,
          role: profile.role,
          name: profile.name,
          branch: profile.branch,
          branchId: profile.branchId,
          staffRole: profile.staffRole,
        });
      } catch {
        clearAuthStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: authenticatedUser, redirectTo } = await loginWithApi(
        email,
        password
      );
      setUser(authenticatedUser);
      router.push(redirectTo);
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid email or password";
      return { success: false, message };
    }
  };

  const logout = async () => {
    await logoutFromApi();
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
