import { supabase } from "./supabase";

export type IapPlatform = "apple" | "google";

export interface ValidateReceiptResult {
  status: "active";
  expires_at: string;
}

export class InvalidReceiptError extends Error {
  constructor() {
    super("invalid_receipt");
    this.name = "InvalidReceiptError";
  }
}

export class IapValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IapValidationError";
  }
}

export async function validateReceipt(
  platform: IapPlatform,
  receipt_data: string,
  product_id: string
): Promise<ValidateReceiptResult> {
  const { data, error } = await supabase.functions.invoke("validate-iap", {
    body: { platform, receipt_data, product_id }
  });

  if (error) {
    const message = error.message ?? "Unable to validate receipt.";

    if (message.includes("invalid_receipt")) {
      throw new InvalidReceiptError();
    }

    throw new IapValidationError(message);
  }

  const result = data as ValidateReceiptResult | null;

  if (!result?.status || !result.expires_at) {
    throw new IapValidationError("Missing subscription status from edge function.");
  }

  return result;
}
