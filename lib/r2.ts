export interface R2SignedUrlInput {
  objectKey: string;
  expiresInSeconds?: number;
}

export async function getR2SignedUrl(_input: R2SignedUrlInput): Promise<string | null> {
  return null;
}
