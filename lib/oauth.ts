import { Linking } from "react-native";

import { config } from "../constants/config";
import { supabase } from "./supabase";

export type OAuthProvider = "google" | "apple";

export async function signInWithOAuth(provider: OAuthProvider) {
  const redirectTo = `${config.appScheme}://auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  });

  if (error || !data.url) {
    throw new Error(error?.message ?? `Unable to start ${provider} sign in.`);
  }

  await Linking.openURL(data.url);
}
