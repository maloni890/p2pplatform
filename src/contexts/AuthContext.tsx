"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const IS_DEMO = !API_BASE;

// In-memory demo store (survives the session via localStorage)
function getDemoUsers(): Record<string, User & { password: string }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("demo_users") || "{}");
  } catch {
    return {};
  }
}
function saveDemoUsers(users: Record<string, User & { password: string }>) {
  if (typeof window !== "undefined")
    localStorage.setItem("demo_users", JSON.stringify(users));
}
function makeDemoUser(data: RegisterData): User & { password: string } {
  return {
    id: `demo_${Date.now()}`,
    username: data.username,
    name: data.name || data.username,
    email: data.email,
    phone: data.phone || "",
    password: data.password,
    role: "user",
    wallet_address: data.wallet_address || "",
    completion_rate: 100,
    completed_trades: 0,
    total_trades: 0,
    is_verified_trader: false,
    is_phone_verified: false,
    is_email_verified: false,
    referral_code: data.referral_code,
    my_referral_code: generateReferralCode(),
    created_at: new Date().toISOString(),
  };
}

function generateReferralCode(): string {
  return "SE" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export interface User {
  id: string;
  username: string;
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  verifyPhone: (phone: string, otp: string) => Promise<boolean>;
}

interface RegisterData {
  username: string;
  name?: string;
  email: string;
  phone?: string;
  password: string;
  wallet_address?: string;
  referral_code?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (IS_DEMO) {
      // Demo mode: restore session from localStorage
      try {
        const stored = typeof window !== "undefined"
          ? localStorage.getItem("demo_current_user")
          : null;
        if (stored) {
          const u = JSON.parse(stored) as User;
          setUser(u);
        }
      } catch {}
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(res.data);
    } catch {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        try {
          const res = await axios.get(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch {
          if (typeof window !== "undefined")
            localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (identifier: string, password: string): Promise<User> => {
    if (IS_DEMO) {
      const users = getDemoUsers();
      // Match by email or phone
      const match = Object.values(users).find(
        (u) => (u.email === identifier || u.phone === identifier) && u.password === password
      );
      if (!match) throw new Error("Invalid credentials");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...safeUser } = match;
      setUser(safeUser);
      if (typeof window !== "undefined")
        localStorage.setItem("demo_current_user", JSON.stringify(safeUser));
      return safeUser;
    }
    const res = await axios.post(
      `${API_BASE}/api/auth/login`,
      { email: identifier, password },
      { withCredentials: true }
    );
    if (res.data.token && typeof window !== "undefined")
      localStorage.setItem("token", res.data.token);
    setUser(res.data);
    return res.data;
  };

  const register = async (data: RegisterData): Promise<User> => {
    if (IS_DEMO) {
      const users = getDemoUsers();
      const emailExists = Object.values(users).some((u) => u.email === data.email);
      const usernameExists = Object.values(users).some(
        (u) => u.username === data.username
      );
      const phoneExists = data.phone && Object.values(users).some((u) => u.phone === data.phone);
      
      if (emailExists) throw Object.assign(new Error(), {
        response: { data: { detail: "An account with this email already exists" } },
      });
      if (usernameExists) throw Object.assign(new Error(), {
        response: { data: { detail: "Username already taken" } },
      });
      if (phoneExists) throw Object.assign(new Error(), {
        response: { data: { detail: "Phone number already registered" } },
      });
      
      const newUser = makeDemoUser(data);
      users[newUser.id] = newUser;
      saveDemoUsers(users);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...safeUser } = newUser;
      setUser(safeUser);
      if (typeof window !== "undefined")
        localStorage.setItem("demo_current_user", JSON.stringify(safeUser));
      return safeUser;
    }
    const res = await axios.post(`${API_BASE}/api/auth/register`, data, {
      withCredentials: true,
    });
    if (res.data.token && typeof window !== "undefined")
      localStorage.setItem("token", res.data.token);
    setUser(res.data);
    return res.data;
  };

  const verifyPhone = async (phone: string, otp: string): Promise<boolean> => {
    if (IS_DEMO) {
      // In demo mode, always succeed with any 6-digit OTP
      if (otp.length === 6 && user) {
        const updatedUser = { ...user, is_phone_verified: true };
        setUser(updatedUser);
        if (typeof window !== "undefined")
          localStorage.setItem("demo_current_user", JSON.stringify(updatedUser));
        
        // Update in demo users store
        const users = getDemoUsers();
        if (users[user.id]) {
          users[user.id] = { ...users[user.id], is_phone_verified: true };
          saveDemoUsers(users);
        }
        return true;
      }
      return false;
    }
    try {
      await axios.post(`${API_BASE}/api/auth/verify-phone`, { phone, otp }, {
        withCredentials: true,
      });
      // Refresh user data
      await checkAuth();
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    if (IS_DEMO) {
      if (typeof window !== "undefined")
        localStorage.removeItem("demo_current_user");
      setUser(null);
      return;
    }
    try {
      await axios.post(
        `${API_BASE}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch {}
    if (typeof window !== "undefined") localStorage.removeItem("token");
    setUser(null);
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

// Axios instance with auth headers
export const api = axios.create({ baseURL: `${API_BASE}/api` });

api.interceptors.request.use((config) => {
  config.withCredentials = true;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
