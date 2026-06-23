import { supabase } from "./supabase";

export class SubscriptionRequiredError extends Error {
  constructor() {
    super("subscription_required");
    this.name = "SubscriptionRequiredError";
  }
}

export class AudioUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AudioUrlError";
  }
}

export async function getAudioUrl(chapter_id: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("get-audio-url", {
    body: { chapter_id }
  });

  if (error) {
    const message = error.message ?? "Unable to get audio URL.";

    if (message.includes("subscription_required")) {
      throw new SubscriptionRequiredError();
    }

    throw new AudioUrlError(message);
  }

  const url = (data as { url?: string } | null)?.url;

  if (!url) {
    throw new AudioUrlError("Missing signed URL from edge function.");
  }

  return url;
}
