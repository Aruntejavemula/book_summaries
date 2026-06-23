import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "./supabase";

const ONBOARDING_KEY = "book_summaries_onboarding_complete";

export async function getOnboardingCompleted() {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === "true";
}

export async function setOnboardingCompleted() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export async function saveUserPreferences(goals: string[], genres: string[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      goals,
      genres,
      onboarding_completed: true,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to save user preferences:", error.message);
  }
}

export interface BookLike {
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string;
  bookCategory: string;
  liked: boolean;
}

export async function saveBookLikes(likes: BookLike[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const rows = likes.map((like) => ({
    user_id: user.id,
    book_title: like.bookTitle,
    book_author: like.bookAuthor,
    book_cover_url: like.bookCoverUrl,
    book_category: like.bookCategory,
    liked: like.liked,
  }));

  const { error } = await supabase.from("user_book_likes").upsert(rows, {
    onConflict: "user_id,book_title",
  });

  if (error) {
    console.error("Failed to save book likes:", error.message);
  }
}
