const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_ENDPOINT
} = process.env;

const hasR2Config =
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET_NAME;

const s3Client = hasR2Config
  ? new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
      }
    })
  : null;

function assertConfigured() {
  if (!hasR2Config || !s3Client) {
    throw new Error("R2 is not configured");
  }
}

async function uploadObject({ key, body, contentType, cacheControl }) {
  assertConfigured();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl
    })
  );

  return key;
}

async function deleteObject(key) {
  if (!hasR2Config || !s3Client) {
    return;
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key
    })
  );
}

async function createSignedGetUrl(key, expiresIn = 60 * 10) {
  assertConfigured();

  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key
    }),
    { expiresIn }
  );
}

function buildObjectKey(prefix, fileName) {
  const safeName = String(fileName || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");

  return `${prefix}/${Date.now()}-${safeName}`;
}

function isR2Configured() {
  return hasR2Config;
}

module.exports = {
  uploadObject,
  deleteObject,
  createSignedGetUrl,
  buildObjectKey,
  isR2Configured
};
