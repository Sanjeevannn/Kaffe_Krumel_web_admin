"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/services/authService";
import type { AuthContextValue, AuthUser } from "@/types";

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "kaffe_krumel_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored) as AuthUser);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const authenticatedUser = authenticateUser(email, password);
    if (!authenticatedUser) {
      return { success: false, message: "Invalid email or password" };
    }

    const session: AuthUser = {
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      name: authenticatedUser.name,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    router.push(authenticatedUser.redirectTo);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
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
