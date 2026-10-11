import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "../lib/supabase";
import { apiMe } from "../lib/api";
import { upsertAccountCache, bootstrapStore, setAccountsCache, accountsCache, type RemoteAccount } from "../data/db";
import type { Account } from "../data/store";

/**
 * KR8 Digitals — authentication context (Supabase Auth only).
 *
 * The previous implementation compared plaintext passwords in the browser and
 * kept a custom `kr8_current` session in localStorage. Both are gone: the
 * session is a real Supabase Auth JWT (managed by supabase-js), and the
 * account data shown here is loaded from the server (`/api/me`) into memory.
 */
type AuthCtx = {
  student: Account | null;
  user: Account | null;
  deviceSessionToken: string | null;
  authReady: boolean;
  signIn: (s: Account) => void;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  notifications: { id: string; text: string; ts: number }[];
  addNotification: (text: string) => void;
  clearNotifications: () => void;
};

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Account | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [notifications, setNotifications] = useState<AuthCtx["notifications"]>([]);

  const loadProfile = async (session: Session | null) => {
    if (!session) {
      setStudent(null);
      return;
    }
    try {
      const { account } = await apiMe();
      upsertAccountCache(account as RemoteAccount);
      setStudent(account as unknown as Account);
    } catch {
      // Signed-in JWT but no profile row yet (e.g. mid-registration).
      setStudent(null);
    }
  };

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setAuthReady(true);
      return;
    }
    let cancelled = false;

    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      void loadProfile(data.session).finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    });

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setStudent(null);
        setAccountsCache([]);
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        void loadProfile(session);
      }
    });

    const handleLogout = () => setStudent(null);
    const handleAccounts = () => {
      // Re-read the in-memory cache after roster updates.
      setStudent((prev) => {
        if (!prev) return prev;
        const key = prev.id.replace(/[\s-]/g, "").toUpperCase();
        const fresh = accountsCache.find((a) => (a.id || "").replace(/[\s-]/g, "").toUpperCase() === key);
        return (fresh as unknown as Account) || prev;
      });
    };
    window.addEventListener("kr8:auth-logout", handleLogout);
    window.addEventListener("kr8:accounts-updated", handleAccounts);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.removeEventListener("kr8:auth-logout", handleLogout);
      window.removeEventListener("kr8:accounts-updated", handleAccounts);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the bootstrap data in lockstep with the session.
  useEffect(() => {
    void bootstrapStore();
  }, [student?.id]);

  const signIn = (s: Account) => {
    upsertAccountCache(s as unknown as RemoteAccount);
    setStudent(s);
    void bootstrapStore();
  };

  const signOut = () => {
    setStudent(null);
    setAccountsCache([]);
    const sb = getSupabase();
    if (sb) void sb.auth.signOut().catch(() => undefined);
    window.dispatchEvent(new CustomEvent("kr8:auth-logout"));
  };

  const refreshProfile = async () => {
    const sb = getSupabase();
    const { data } = sb ? await sb.auth.getSession() : { data: { session: null } };
    await loadProfile(data.session);
  };

  const addNotification = (text: string) => {
    setNotifications((prev) => [{ id: Math.random().toString(36).slice(2), text, ts: Date.now() }, ...prev].slice(0, 20));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <Ctx.Provider
      value={{
        student,
        user: student,
        deviceSessionToken: null,
        authReady,
        signIn,
        signOut,
        refreshProfile,
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
