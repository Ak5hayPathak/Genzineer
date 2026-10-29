import multer from "multer";
import { ApiError } from "../utils/ApiError.utils.js";

const allowedMimeTypes = new Set([
  // Documents
  "text/markdown",
  "text/plain",
  "application/pdf",

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",

  // Other attachments
  "application/zip",
  "application/x-zip-compressed",
  "text/csv",
  "application/json",
]);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file
    files: 10,
  },

  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      return cb(null, true);
    }

    cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
  },
});

export { upload };
