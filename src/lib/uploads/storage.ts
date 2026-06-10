import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

export type UploadResult = {
  url: string;
  key: string;
  width: number;
  height: number;
  size: number;
  contentType: "image/webp";
};

export type ImageUploadOptions = {
  folder?: string;
};

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxInputSize = 8 * 1024 * 1024;
const maxOutputWidth = 1600;
const webpQuality = 76;

let r2Client: S3Client | undefined;

export async function uploadImageFile(
  file: File,
  options: ImageUploadOptions = {},
): Promise<UploadResult> {
  validateImageFile(file);

  const input = Buffer.from(await file.arrayBuffer());
  const processed = await processImage(input);
  const key = createObjectKey(options.folder);
  const bucket = getRequiredEnv("R2_BUCKET_NAME");

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: processed.buffer,
      CacheControl: "public, max-age=31536000, immutable",
      ContentLength: processed.buffer.byteLength,
      ContentType: "image/webp",
    }),
  );

  return {
    key,
    url: getPublicUrl(key),
    width: processed.width,
    height: processed.height,
    size: processed.buffer.byteLength,
    contentType: "image/webp",
  };
}

export async function deleteStoredImage(storageKey: string) {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getRequiredEnv("R2_BUCKET_NAME"),
      Key: storageKey,
    }),
  );
}

function validateImageFile(file: File) {
  if (!acceptedTypes.has(file.type)) {
    throw new UploadValidationError("Only JPG, PNG, and WebP images can be uploaded.");
  }

  if (file.size <= 0) {
    throw new UploadValidationError("Image file is empty.");
  }

  if (file.size > maxInputSize) {
    throw new UploadValidationError("Images must be 8 MB or smaller before compression.");
  }
}

async function processImage(input: Buffer) {
  const image = sharp(input, {
    failOn: "warning",
    limitInputPixels: 30_000_000,
  }).rotate();

  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new UploadValidationError("Could not read image dimensions.");
  }

  const shouldResize = metadata.width > maxOutputWidth;
  const pipeline = shouldResize ? image.resize({ width: maxOutputWidth, withoutEnlargement: true }) : image;
  const buffer = await pipeline
    .webp({
      effort: 5,
      quality: webpQuality,
    })
    .toBuffer();
  const outputMetadata = await sharp(buffer).metadata();

  return {
    buffer,
    width: outputMetadata.width ?? metadata.width,
    height: outputMetadata.height ?? metadata.height,
  };
}

function createObjectKey(folder?: string) {
  const safeFolder = folder?.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+|\/+$/g, "");
  const prefix = safeFolder || `uploads/${new Date().toISOString().slice(0, 10)}`;

  return `${prefix}/${randomUUID()}.webp`;
}

function getR2Client() {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: normalizeR2Endpoint(getRequiredEnv("R2_ENDPOINT")),
      credentials: {
        accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: getRequiredEnv("R2_SECRET_ACCESS_KEY"),
      },
      forcePathStyle: true,
    });
  }

  return r2Client;
}

function normalizeR2Endpoint(value: string) {
  const url = new URL(value);

  return url.origin;
}

function getPublicUrl(key: string) {
  const baseUrl = getRequiredEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/g, "");
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${baseUrl}/${encodedKey}`;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}
