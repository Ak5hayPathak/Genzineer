import { HeadBucketCommand } from "@aws-sdk/client-s3";
import b2Client from "../config/b2.config.js";

const bucket = process.env.B2_BUCKET_NAME;

try {
  await b2Client.send(new HeadBucketCommand({ Bucket: bucket }));
  console.log("Backblaze B2 connected successfully!");
} catch (error) {
  console.error("B2 connection failed:", error.name, error.message);
}
