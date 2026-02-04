import { S3Client } from "@aws-sdk/client-s3";

let cachedClient: S3Client | null = null;

export function getStorageClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const region = process.env.STORAGE_REGION ?? "auto";
  const endpoint = process.env.STORAGE_ENDPOINT;
  const forcePathStyle = process.env.STORAGE_FORCE_PATH_STYLE === "true";

  const config: ConstructorParameters<typeof S3Client>[0] = {
    region,
    forcePathStyle
  };

  if (endpoint) {
    config.endpoint = endpoint;
  }

  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    config.credentials = { accessKeyId, secretAccessKey };
  }

  cachedClient = new S3Client(config);
  return cachedClient;
}

export function requireStorageBucket() {
  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("Missing STORAGE_BUCKET");
  }
  return bucket;
}

export function buildStorageKey(id: string, path: string) {
  return `reviews/${id}/${path}`;
}
