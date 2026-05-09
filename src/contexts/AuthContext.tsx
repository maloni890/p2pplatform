"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface User {
  id: string;
  username?: string;
  name?: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  wallet_address?: string;
  completion_rate?: number;
  completed_trades?: number;
  total_trades?: number;
  is_verified_trader?: boolean;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  referral_code?: string;
  my_referral_code?: string;
  created_at?: string;
}

interface RegisterData {
  username?: string;
  name?: string;
  email: string;
  phone?: string;
  password: string;
  wallet_address?: string;
  referral_code?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  verifyPhone: (phone: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "swapease_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (u: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    }
  };

  const clearSession = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(SESSION_KEY)
          : null;
      if (stored) {
        const u = JSON.parse(stored) as User;
        setUser(u);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = async (data: RegisterData): Promise<User> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name || data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        referral_code: data.referral_code,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      // Throw in a shape the existing catch blocks can parse
      throw Object.assign(new Error(json.detail || "Registration failed"), {
        response: { data: { detail: json.detail || "Registration failed" } },
      });
    }

    const u: User = {
      ...json,
      username: json.email,
    };
    setUser(u);
    saveSession(u);
    return u;
  };

  const login = async (identifier: string, password: string): Promise<User> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw Object.assign(new Error(json.detail || "Login failed"), {
        response: { data: { detail: json.detail || "Login failed" } },
      });
    }

    const u: User = {
      ...json,
      username: json.email,
    };
    setUser(u);
    saveSession(u);
    return u;
  };

  const logout = async () => {
    clearSession();
    setUser(null);
  };

  const verifyPhone = async (_phone: string, otp: string): Promise<boolean> => {
    // Accept any 6-digit OTP for now (real SMS can be wired later)
    if (otp.length === 6 && user) {
      const updated = { ...user, is_phone_verified: true };
      setUser(updated);
      saveSession(updated);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, checkAuth, verifyPhone }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Keep api export for backward compat with other files that import it
import axios from "axios";
export const api = axios.create({ baseURL: "/api" });
api.interceptors.request.use((config) => {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
  if (stored) {
    try {
      const u = JSON.parse(stored) as User;
      if (u.id) config.headers["x-user-id"] = u.id;
    } catch {}
  }
  return config;
});
