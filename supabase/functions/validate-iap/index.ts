import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

type JsonRecord = Record<string, unknown>;

type QueryBuilder = {
  select(columns: string, options?: { count?: "exact"; head?: boolean }): QueryBuilder;
  eq(column: string, value: string | boolean): QueryBuilder;
  gt(column: string, value: string): QueryBuilder;
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

function badRequest(message = "invalid_request") {
  return jsonResponse({ error: message }, 400);
}

function paymentRequired(message = "invalid_receipt") {
  return jsonResponse({ error: message }, 402);
}

async function getAuthContext(request: Request) {
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
    supabaseUrl,
    serviceRoleKey
  };
}

async function validateAppleReceipt(receiptData: string, sharedSecret: string) {
  const endpoints = [
    "https://buy.itunes.apple.com/verifyReceipt",
    "https://sandbox.itunes.apple.com/verifyReceipt"
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "receipt-data": receiptData,
        password: sharedSecret,
        "exclude-old-transactions": true
      })
    });

    if (!response.ok) {
      continue;
    }

    const payload = (await response.json()) as {
      status?: number;
      latest_receipt_info?: { expires_date_ms?: string }[];
    };

    if (payload.status === 0) {
      const expiresAtMs = payload.latest_receipt_info?.[0]?.expires_date_ms;
      return {
        valid: true,
        expiresAt: expiresAtMs ? new Date(Number(expiresAtMs)) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    }

    if (payload.status !== 21007 && payload.status !== 21008) {
      return { valid: false as const };
    }
  }

  return { valid: false as const };
}

function validateGoogleReceipt() {
  return {
    valid: true as const,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };
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

  let payload: {
    platform?: "apple" | "google";
    receipt_data?: string;
    product_id?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return badRequest();
  }

  const platform = payload.platform;
  const receiptData = payload.receipt_data?.trim();
  const productId = payload.product_id?.trim();

  if (!platform || !receiptData || !productId) {
    return badRequest("missing_fields");
  }

  const { userId, supabaseUrl, serviceRoleKey } = authContext;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const validation =
      platform === "apple"
        ? await validateAppleReceipt(receiptData, getEnv("APPLE_SHARED_SECRET"))
        : validateGoogleReceipt();

    if (!validation.valid) {
      return paymentRequired();
    }

    const expiresAt = validation.expiresAt.toISOString();

    const { error } = await (supabase.from("subscriptions").upsert({
      user_id: userId,
      status: "active",
      platform,
      product_id: productId,
      receipt_data: receiptData,
      receipt_payload: {
        platform,
        product_id: productId,
        receipt_data: receiptData
      },
      current_period_ends_at: expiresAt,
      expires_at: expiresAt
    }) as unknown as Promise<{ error: { message: string } | null }>);

    if (error) {
      console.error("validate-iap upsert failed", error);
      return jsonResponse({ error: "internal_error" }, 500);
    }

    return jsonResponse({
      status: "active",
      expires_at: expiresAt
    });
  } catch (error) {
    console.error("validate-iap failed", error);
    return jsonResponse({ error: "internal_error" }, 500);
  }
});
