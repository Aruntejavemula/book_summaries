export interface PurchaseRequest {
  productId: string;
  platform: "ios" | "android";
}

export async function initializeIap(): Promise<null> {
  return null;
}

export async function validateReceipt(_request: PurchaseRequest): Promise<null> {
  return null;
}
