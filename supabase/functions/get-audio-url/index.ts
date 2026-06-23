import { createClient } from "@supabase/supabase-js";

type AuthContext = {
  userId: string;
  supabaseUrl: string;
  serviceRoleKey: string;
};

type JsonRecord = Record<string, unknown>;

type QueryBuilder = {
  select(columns: string): QueryBuilder;
  eq(column: string, value: string | boolean): QueryBuilder;
  limit(count: number): QueryBuilder;
};

type TableBuilder = QueryBuilder & {
  upsert(values: JsonRecord): unknown;
};

type SupabaseLike = {
  auth: {
    getUser(token: string): Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
  from(table: string): TableBuilder;
};

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*"
};

function getEnv(...names: string[]): string {
  const deno = (globalThis as {
    Deno?: { env: { get(key: string): string | undefined } };
  }).Deno;

  const value = names.map((name) => deno?.env.get(name)).find(Boolean);

  if (!value) {
    throw new Error(`Missing environment variable: ${names.join(" or ")}`);
  }

  return value;
}

function jsonResponse(body: JsonRecord, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status
  });
}

function unauthorized(message = "unauthorized") {
  return jsonResponse({ error: message }, 401);
}

function forbidden(message = "forbidden") {
  return jsonResponse({ error: message }, 403);
}

function notFound(message = "not_found") {
  return jsonResponse({ error: message }, 404);
}

function badRequest(message = "invalid_request") {
  return jsonResponse({ error: message }, 400);
}

function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function formatAmzDate(date: Date) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return `${iso.slice(0, 15)}Z`;
}

async function sha256Hex(input: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacRaw(key: CryptoKey, data: string) {
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function getSigningKey(secretAccessKey: string, dateStamp: string, region: string, service: string) {
  const kDate = await importHmacKey(`AWS4${secretAccessKey}`);
  const dateKey = await hmacRaw(kDate, dateStamp);
  const kRegion = await crypto.subtle.importKey(
    "raw",
    dateKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const regionKey = await hmacRaw(kRegion, region);
  const kService = await crypto.subtle.importKey(
    "raw",
    regionKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const serviceKey = await hmacRaw(kService, service);
  return crypto.subtle.importKey(
    "raw",
    serviceKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function signR2Url({
  accountId,
  bucketName,
  objectKey,
  accessKeyId,
  secretAccessKey,
  expiresInSeconds
}: {
  accountId: string;
  bucketName: string;
  objectKey: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresInSeconds: number;
}) {
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";
  const now = new Date();
  const amzDate = formatAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const keyPath = objectKey.replace(/^\/+/, "").split("/").map(encodeRfc3986).join("/");
  const canonicalUri = `/${encodeRfc3986(bucketName)}${keyPath ? `/${keyPath}` : ""}`;

  const queryParams = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${accessKeyId}/${credentialScope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expiresInSeconds)],
    ["X-Amz-SignedHeaders", "host"]
  ];

  const canonicalQueryString = queryParams
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");

  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQueryString,
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD"
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest)
  ].join("\n");

  const signingKey = await getSigningKey(secretAccessKey, dateStamp, region, service);
  const signatureBytes = await hmacRaw(signingKey, stringToSign);
  const signature = [...new Uint8Array(signatureBytes)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

async function getAuthContext(request: Request): Promise<AuthContext | Response> {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return unauthorized();
  }

  const supabaseUrl = getEnv("SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) as unknown as SupabaseLike;

  const token = authorization.slice("Bearer ".length);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return unauthorized();
  }

  return {
    userId: data.user.id,
    serviceRoleKey,
    supabaseUrl
  };
}

async function hasActiveSubscription(supabase: SupabaseLike, userId: string) {
  const { data, error } = await (supabase
    .from("subscriptions")
    .select("id,expires_at,current_period_ends_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1) as unknown as Promise<{
      data: { expires_at: string | null; current_period_ends_at: string | null }[] | null;
      error: { message: string } | null;
    }>);

  if (error) {
    throw error;
  }

  const row = data?.[0];
  if (!row) {
    return false;
  }

  const expiry = row.expires_at ?? row.current_period_ends_at;
  return expiry ? new Date(expiry) > new Date() : false;
}

async function countCompletedChapters(supabase: SupabaseLike, userId: string) {
  const { data, error } = await (supabase
    .from("progress")
    .select("id")
    .eq("user_id", userId)
    .eq("is_completed", true)
    .limit(1000) as unknown as Promise<{
      data: { id: string }[] | null;
      error: { message: string } | null;
    }>);

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
}

async function getAudioPath(supabase: SupabaseLike, chapterId: string) {
  const { data, error } = await (supabase
    .from("chapters")
    .select("audio_path")
    .eq("id", chapterId)
    .limit(1) as unknown as Promise<{
      data: { audio_path: string | null }[] | null;
      error: { message: string } | null;
    }>);

  if (error) {
    throw error;
  }

  return data?.[0]?.audio_path ?? null;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const authContext = await getAuthContext(request);
  if (authContext instanceof Response) {
    return authContext;
  }

  const { userId, supabaseUrl, serviceRoleKey } = authContext;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }) as unknown as SupabaseLike;

  let payload: { chapter_id?: string };

  try {
    payload = await request.json();
  } catch {
    return badRequest();
  }

  const chapterId = payload.chapter_id?.trim();
  if (!chapterId) {
    return badRequest("missing_chapter_id");
  }

  try {
    const [isSubscribed, completedCount, audioPath] = await Promise.all([
      hasActiveSubscription(supabase, userId),
      countCompletedChapters(supabase, userId),
      getAudioPath(supabase, chapterId)
    ]);

    if (!audioPath) {
      return notFound("chapter_not_found");
    }

    if (!isSubscribed && completedCount >= 3) {
      return forbidden("subscription_required");
    }

    const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
    const bucketName = getEnv("CLOUDFLARE_R2_BUCKET_NAME");
    const accessKeyId = getEnv("CLOUDFLARE_R2_ACCESS_KEY_ID");
    const secretAccessKey = getEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY");

    const url = await signR2Url({
      accountId,
      bucketName,
      objectKey: audioPath,
      accessKeyId,
      secretAccessKey,
      expiresInSeconds: 3600
    });

    return jsonResponse({ url });
  } catch (error) {
    console.error("get-audio-url failed", error);
    return jsonResponse({ error: "internal_error" }, 500);
  }
});
