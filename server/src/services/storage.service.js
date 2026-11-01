import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import b2Client from "../config/b2.config.js";
import ApiError from "../utils/ApiError.utils.js";

const getBucketName = () => {
  const bucket = process.env.B2_BUCKET_NAME;

  if (!bucket) {
    throw new ApiError(500, "B2 bucket name is not configured");
  }

  return bucket;
};

// Upload a file to B2.
const uploadFile = async ({
  key,
  body,
  contentType = "application/octet-stream",
  contentLength,
  metadata,
}) => {
  if (!key || !body) {
    throw new ApiError(400, "File key and body are required");
  }

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    Body: body,
    ContentType: contentType,
    ...(contentLength !== undefined && {
      ContentLength: contentLength,
    }),
    ...(metadata && { Metadata: metadata }),
  });

  const response = await b2Client.send(command);

  return {
    key,
    etag: response.ETag,
  };
};

// Retrieve a file from B2.
const getFile = async (key) => {
  if (!key) {
    throw new ApiError(400, "File key is required");
  }

  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  const response = await b2Client.send(command);

  return {
    body: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    etag: response.ETag,
  };
};

// Delete a file from B2.
const deleteFile = async (key) => {
  if (!key) {
    throw new ApiError(400, "File key is required");
  }

  const command = new DeleteObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  await b2Client.send(command);

  return { key };
};

export { uploadFile, getFile, deleteFile };
