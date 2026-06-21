const isDevelopment = typeof __DEV__ !== "undefined" && __DEV__;

function readConfigValue(value: string | undefined, fallback: string, name: string) {
  if (value?.trim()) {
    return value;
  }

  if (isDevelopment) {
    return fallback;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export const config = {
  supabaseUrl: readConfigValue(process.env.EXPO_PUBLIC_SUPABASE_URL, "https://example.supabase.co", "EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readConfigValue(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, "your-supabase-anon-key", "EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  r2AccountId: readConfigValue(process.env.EXPO_PUBLIC_R2_ACCOUNT_ID, "your-r2-account-id", "EXPO_PUBLIC_R2_ACCOUNT_ID"),
  r2BucketName: readConfigValue(process.env.EXPO_PUBLIC_R2_BUCKET_NAME, "your-r2-bucket-name", "EXPO_PUBLIC_R2_BUCKET_NAME"),
  r2PublicBaseUrl: readConfigValue(process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL, "https://pub-xxxx.r2.dev", "EXPO_PUBLIC_R2_PUBLIC_BASE_URL"),
  appScheme: readConfigValue(process.env.EXPO_PUBLIC_APP_SCHEME, "booksummaries", "EXPO_PUBLIC_APP_SCHEME"),
  appleAppId: readConfigValue(process.env.EXPO_PUBLIC_APPLE_APP_ID, "your-ios-app-id", "EXPO_PUBLIC_APPLE_APP_ID"),
  googlePlayPackageName: readConfigValue(process.env.EXPO_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME, "com.example.booksummaries", "EXPO_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME")
} as const;
