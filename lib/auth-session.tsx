import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Linking } from "react-native";

import { supabase } from "./supabase";

type AuthSessionContextValue = {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(undefined);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleUrl = async (url: string) => {
      const code = new URL(url).searchParams.get("code");

      if (!code) {
        return;
      }

      await supabase.auth.exchangeCodeForSession(code);
    };

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    };

    loadSession();

    void Linking.getInitialURL().then((url) => {
      if (url) {
        void handleUrl(url);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    const urlSubscription = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      urlSubscription.remove();
    };
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      isLoading,
      signOut: async () => {
        await supabase.auth.signOut();
      }
    }),
    [isLoading, session]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }

  return context;
}
