import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const neonMode = import.meta.env.VITE_BRAVER_AUTH_PROVIDER === "neon";

function completedAccountUser(user: User | null | undefined): User | null {
  return user?.user_metadata?.signup_completed === false ? null : (user ?? null);
}

let cachedUser: User | null | undefined;
let pendingUserRequest: Promise<User | null> | null = null;

function loadCurrentUser(): Promise<User | null> {
  if (cachedUser !== undefined) return Promise.resolve(cachedUser);
  if (!pendingUserRequest) {
    const neonSession = async (): Promise<{ data: { user: User | null } }> => {
      const response = await fetch("/api/neon-auth/get-session", {
        credentials: "same-origin", cache: "no-store",
      });
      if (!response.ok) throw new Error("Neon session check failed");
      const payload = await response.json();
      const u = payload?.user;
      if (!u?.id || !u.email || u.emailVerified !== true) return { data: { user: null } };
      // The navigation layer only needs these identity fields. All actual
      // authorization remains server-side and rechecks the live role rows.
      const user = {
        id: u.id, email: u.email,
        app_metadata: {},
        user_metadata: { full_name: u.name, signup_completed: true },
        aud: "authenticated",
        created_at: u.createdAt ?? "",
      } as User;
      return { data: { user } };
    };
    pendingUserRequest = (neonMode ? neonSession() : supabase.auth.getUser())
      .then(({ data }) => {
        cachedUser = completedAccountUser(data.user);
        return cachedUser;
      })
      .catch((error) => {
        console.warn("[Auth] Could not verify the current user. Continuing signed out for now.", error);
        pendingUserRequest = null;
        return null;
      });
  }
  return pendingUserRequest;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(cachedUser ?? null);
  const [loading, setLoading] = useState(cachedUser === undefined);

  useEffect(() => {
    let mounted = true;

    void loadCurrentUser().then((nextUser) => {
      if (!mounted) return;
      setUser(nextUser);
      setLoading(false);
    });

    if (neonMode) {
      const refresh = () => {
        cachedUser = undefined;
        pendingUserRequest = null;
        setLoading(true);
        void loadCurrentUser().then((nextUser) => {
          if (mounted) { setUser(nextUser); setLoading(false); }
        });
      };
      window.addEventListener("braver-neon-auth-change", refresh);
      window.addEventListener("focus", refresh);
      return () => {
        mounted = false;
        window.removeEventListener("braver-neon-auth-change", refresh);
        window.removeEventListener("focus", refresh);
      };
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = completedAccountUser(session?.user);
      cachedUser = nextUser;
      pendingUserRequest = Promise.resolve(nextUser);
      if (!mounted) return;
      setUser(nextUser);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!neonMode) return supabase.auth.signOut();
    const response = await fetch("/api/neon-auth/sign-out", {
      method: "POST", credentials: "same-origin",
      headers: {"Content-Type": "application/json"}, body: "{}",
    });
    if (!response.ok) throw new Error("Sign out could not be completed.");
    cachedUser = null;
    pendingUserRequest = Promise.resolve(null);
    window.dispatchEvent(new Event("braver-neon-auth-change"));
    return { error: null };
  };
  return { user, loading, signOut };
}
