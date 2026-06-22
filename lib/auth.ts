import { supabase } from "./supabase";

export function getCurrentUser() {
  return supabase.auth.getUser();
}

export function signOut() {
  return supabase.auth.signOut();
}

export function onAuthStateChange(...args: Parameters<typeof supabase.auth.onAuthStateChange>) {
  return supabase.auth.onAuthStateChange(...args);
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "booksummaries://auth/callback"
    }
  });

  return { data, error };
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: "booksummaries://auth/callback"
    }
  });

  return { data, error };
}

export async function handleAuthCallback(url: string) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(url);

  return { data, error };
}
