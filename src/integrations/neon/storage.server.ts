import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const PRIVATE_BUCKETS = new Set(["essay-submissions", "advisor-cvs"]);
const MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function validateBucket(bucket: string) {
  if (!PRIVATE_BUCKETS.has(bucket)) throw new Error("Unknown private document bucket");
}
function validateKey(key: string) {
  if (
    key.length > 500 ||
    key.startsWith("/") ||
    key.includes("..") ||
    key.includes("\\") ||
    !/^[0-9a-fA-F/-]+\//.test(key) ||
    !/^[A-Za-z0-9/_\-.]+$/.test(key)
  ) throw new Error("Invalid document object key");
}

function config() {
  const endpoint = process.env.NEON_STORAGE_ENDPOINT;
  const region = process.env.NEON_STORAGE_REGION;
  const accessKeyId = process.env.NEON_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NEON_STORAGE_SECRET_ACCESS_KEY;
  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("Neon object storage not configured");
  }
  const url = new URL(endpoint);
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".neon.tech") ||
    !url.hostname.includes(".storage.") ||
    url.username || url.password || url.search || url.hash
  ) throw new Error("Invalid Neon Storage endpoint");

  return { endpoint: url.origin, region, accessKeyId, secretAccessKey };
}

let cached: { configKey: string; client: S3Client } | undefined;
function s3() {
  const settings = config();
  const configKey = JSON.stringify(settings);
  if (!cached || cached.configKey !== configKey) {
    cached?.client.destroy();
    cached = {
      configKey,
      client: new S3Client({
        endpoint: settings.endpoint,
        region: settings.region,
        forcePathStyle: true,
        credentials: {
          accessKeyId: settings.accessKeyId,
          secretAccessKey: settings.secretAccessKey,
        },
        maxAttempts: 2,
      }),
    };
  }
  return cached.client;
}

export async function presignPrivateDocumentUpload(options: {
  bucket: string;
  key: string;
  mimeType: string;
}): Promise<string> {
  validateBucket(options.bucket);
  validateKey(options.key);
  if (!MIME.has(options.mimeType)) throw new Error("Unsupported document type.");
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  return getSignedUrl(
    s3(),
    new PutObjectCommand({
      Bucket: options.bucket,
      Key: options.key,
      ContentType: options.mimeType,
    }),
    { expiresIn: 300 },
  );
}

export async function downloadPrivateDocument(
  bucket: string,
  key: string,
  maxSize = 10 * 1024 * 1024,
): Promise<Uint8Array> {
  validateBucket(bucket);
  validateKey(key);
  const result = await s3().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if ((result.ContentLength ?? maxSize + 1) > maxSize) throw new Error("Document too large");
  const stream = result.Body;
  if (!stream) throw new Error("Private document was not found.");
  const bytes = await stream.transformToByteArray();
  if (bytes.length > maxSize) throw new Error("Document exceeds maximum size");
  return bytes;
}

export async function presignPrivateDocumentRead(
  bucket: string,
  key: string,
  filename: string,
): Promise<string> {
  validateBucket(bucket);
  validateKey(key);
  const safeName = filename.replace(/[^\w. -]/g, "_").slice(0, 150);
  return getSignedUrl(
    s3(),
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeName}"`,
    }),
    { expiresIn: 300 },
  );
}

export async function deletePrivateDocument(bucket: string, key: string): Promise<void> {
  validateBucket(bucket);
  validateKey(key);
  await s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function documentExists(bucket: string, key: string): Promise<boolean> {
  validateBucket(bucket);
  validateKey(key);
  try {
    await s3().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if ((error as { name?: string }).name === "NotFound") return false;
    throw error;
  }
}
