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
