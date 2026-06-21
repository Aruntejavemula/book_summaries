export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "your-supabase-anon-key",
  r2AccountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID ?? "your-r2-account-id",
  r2BucketName: process.env.EXPO_PUBLIC_R2_BUCKET_NAME ?? "your-r2-bucket-name",
  r2PublicBaseUrl: process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL ?? "https://pub-xxxx.r2.dev",
  appScheme: process.env.EXPO_PUBLIC_APP_SCHEME ?? "booksummaries",
  appleAppId: process.env.EXPO_PUBLIC_APPLE_APP_ID ?? "your-ios-app-id",
  googlePlayPackageName: process.env.EXPO_PUBLIC_GOOGLE_PLAY_PACKAGE_NAME ?? "com.example.booksummaries"
} as const;
