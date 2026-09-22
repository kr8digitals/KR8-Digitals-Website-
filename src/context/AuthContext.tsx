import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { findStudent, type Account } from "../data/store";

type AuthCtx = {
  student: Account | null; // active account (student or tribe)
  user: Account | null; // universal alias for active user
  deviceSessionToken: string | null;
  signIn: (s: Account) => void;
  signOut: () => void;
  notifications: { id: string; text: string; ts: number }[];
  addNotification: (text: string) => void;
  clearNotifications: () => void;
};

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
const SESSION_KEY = "kr8_last_active";
const DEVICE_TOKEN_KEY = "kr8_device_session_token_v1";
const DEVICE_SESSION_DATA = "kr8_device_session_data_v1";
// 5 full days (120 hours) persistent device session
const INACTIVITY_LIMIT = 5 * 24 * 60 * 60 * 1000;

function getOrCreateDeviceToken(): string {
  try {
    let token = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      token = "dev_" + Math.random().toString(36).substring(2) + "_" + Date.now().toString(36);
      localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
    return token;
  } catch {
    return "dev_fallback";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Account | null>(null);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AuthCtx["notifications"]>([]);

  useEffect(() => {
    try {
      const token = getOrCreateDeviceToken();
      setDeviceToken(token);

      const s = localStorage.getItem("kr8_current");
      const lastActive = Number(localStorage.getItem(SESSION_KEY) || 0);
      const isExpired = lastActive > 0 && Date.now() - lastActive > INACTIVITY_LIMIT;

      if (isExpired) {
        // Expired after 5 days of device inactivity
        localStorage.removeItem("kr8_current");
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(DEVICE_SESSION_DATA);
        setStudent(null);
      } else if (s) {
        const stored = JSON.parse(s) as Account;
        const current = findStudent(stored.id);
        if (current) {
          setStudent(current);
          localStorage.setItem("kr8_current", JSON.stringify(current));
          // Refresh touch timestamp
          localStorage.setItem(SESSION_KEY, String(Date.now()));
        } else {
          localStorage.removeItem("kr8_current");
        }
      }

      const n = localStorage.getItem("kr8_notifs");
      if (n) setNotifications(JSON.parse(n));
    } catch {
      /* ignore */
    }
  }, []);

  // Real-time synchronization when accounts are updated
  useEffect(() => {
    const handleSync = () => {
      try {
        const s = localStorage.getItem("kr8_current");
        if (s) {
          const stored = JSON.parse(s) as Account;
          const fresh = findStudent(stored.id);
          if (fresh) {
            setStudent(fresh);
            localStorage.setItem("kr8_current", JSON.stringify(fresh));
          }
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("kr8:accounts-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("kr8:accounts-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Device activity tracker — sliding 5-day expiration window
  useEffect(() => {
    const touch = () => {
      if (!localStorage.getItem("kr8_current")) return;
      const now = Date.now();
      localStorage.setItem(SESSION_KEY, String(now));
      try {
        const raw = localStorage.getItem(DEVICE_SESSION_DATA);
        if (raw) {
          const data = JSON.parse(raw);
          data.lastActive = now;
          data.expiresAt = now + INACTIVITY_LIMIT;
          localStorage.setItem(DEVICE_SESSION_DATA, JSON.stringify(data));
        }
      } catch {
        /* ignore */
      }
    };

    const events = ["click", "keydown", "touchstart", "mousemove", "visibilitychange"];
    events.forEach((event) => window.addEventListener(event, touch));

    // Periodic check for 5-day expiration
    const timer = window.setInterval(() => {
      const last = Number(localStorage.getItem(SESSION_KEY) || 0);
      if (last && Date.now() - last > INACTIVITY_LIMIT) {
        setStudent(null);
        localStorage.removeItem("kr8_current");
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(DEVICE_SESSION_DATA);
      }
    }, 60_000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, touch));
      window.clearInterval(timer);
    };
  }, []);

  const signIn = (s: Account) => {
    const token = getOrCreateDeviceToken();
    const now = Date.now();
    setStudent(s);
    setDeviceToken(token);
    try {
      localStorage.setItem("kr8_current", JSON.stringify(s));
      localStorage.setItem(SESSION_KEY, String(now));
      localStorage.setItem(
        DEVICE_SESSION_DATA,
        JSON.stringify({
          accountId: s.id,
          deviceToken: token,
          email: s.email,
          lastActive: now,
          expiresAt: now + INACTIVITY_LIMIT,
        })
      );
    } catch {
      /* ignore */
    }
  };

  const signOut = () => {
    setStudent(null);
    try {
      localStorage.removeItem("kr8_current");
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(DEVICE_SESSION_DATA);
    } catch {
      /* ignore */
    }
  };

  const addNotification = (text: string) => {
    setNotifications((prev) => {
      const next = [{ id: Math.random().toString(36).slice(2), text, ts: Date.now() }, ...prev].slice(0, 20);
      try {
        localStorage.setItem("kr8_notifs", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem("kr8_notifs");
    } catch {
      /* ignore */
    }
  };

  return (
    <Ctx.Provider
      value={{
        student,
        user: student,
        deviceSessionToken: deviceToken,
        signIn,
        signOut,
        notifications,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
