import fs from "fs";
import crypto from "crypto";

/**
 * Generate SHA-256 hash for an uploaded file.
 * Used to detect duplicate uploads and verify file integrity.
 */
const generateFileHash = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");

    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

export default generateFileHash;