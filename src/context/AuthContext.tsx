import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { findStudent, type Account } from "../data/store";

type AuthCtx = {
  student: Account | null; // active account (student or tribe)
  signIn: (s: Account) => void;
  signOut: () => void;
  notifications: { id: string; text: string; ts: number }[];
  addNotification: (text: string) => void;
  clearNotifications: () => void;
};

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
const SESSION_KEY = "kr8_last_active";
const INACTIVITY_LIMIT = 5 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Account | null>(null);
  const [notifications, setNotifications] = useState<AuthCtx["notifications"]>([]);

  useEffect(() => {
    try {
      if (!localStorage.getItem("kr8_registration_wipe_v3")) localStorage.removeItem("kr8_current");
      const s = localStorage.getItem("kr8_current");
      const lastActive = Number(localStorage.getItem(SESSION_KEY) || 0);
      if (s && (!lastActive || Date.now() - lastActive <= INACTIVITY_LIMIT)) {
        const stored = JSON.parse(s) as Account;
        const current = findStudent(stored.id);
        if (current) {
          setStudent(current);
          localStorage.setItem("kr8_current", JSON.stringify(current));
        } else {
          localStorage.removeItem("kr8_current");
        }
      }
      if (s && lastActive && Date.now() - lastActive > INACTIVITY_LIMIT) localStorage.removeItem("kr8_current");
      const n = localStorage.getItem("kr8_notifs");
      if (n) setNotifications(JSON.parse(n));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const touch = () => {
      if (!localStorage.getItem("kr8_current")) return;
      localStorage.setItem(SESSION_KEY, String(Date.now()));
    };
    const events = ["click", "keydown", "touchstart", "mousemove", "visibilitychange"];
    events.forEach((event) => window.addEventListener(event, touch));
    const timer = window.setInterval(() => {
      const last = Number(localStorage.getItem(SESSION_KEY) || 0);
      if (last && Date.now() - last > INACTIVITY_LIMIT) {
        setStudent(null);
        localStorage.removeItem("kr8_current");
        localStorage.removeItem(SESSION_KEY);
      }
    }, 60_000);
    return () => { events.forEach((event) => window.removeEventListener(event, touch)); window.clearInterval(timer); };
  }, []);

  const signIn = (s: Account) => {
    setStudent(s);
    localStorage.setItem("kr8_current", JSON.stringify(s));
    localStorage.setItem(SESSION_KEY, String(Date.now()));
  };
  const signOut = () => {
    setStudent(null);
    localStorage.removeItem("kr8_current");
    localStorage.removeItem(SESSION_KEY);
  };
  const addNotification = (text: string) => {
    setNotifications((prev) => {
      const next = [{ id: Math.random().toString(36).slice(2), text, ts: Date.now() }, ...prev].slice(0, 20);
      localStorage.setItem("kr8_notifs", JSON.stringify(next));
      return next;
    });
  };
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("kr8_notifs");
  };

  return (
    <Ctx.Provider value={{ student, signIn, signOut, notifications, addNotification, clearNotifications }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
