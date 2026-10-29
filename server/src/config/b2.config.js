import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { S3Client } from "@aws-sdk/client-s3";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

dotenv.config({
  path: path.resolve(currentDir, "../../.env"),
});

const b2Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

export default b2Client;
