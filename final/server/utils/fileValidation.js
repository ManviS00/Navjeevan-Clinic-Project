import fs from "fs";
import path from "path";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/octet-stream",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; //10 MB

export const validateMedicalRecord = (file) => {

  if (!file) {
    throw new Error("Medical record file is required.");
  }

  const extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  if (
    !ALLOWED_TYPES.includes(file.mimetype) ||
    !allowedExtensions.includes(extension)
  ) {
    throw new Error(
      "Only PDF, JPG, JPEG and PNG files are allowed."
    );
  }

  // File size validation
  if (file.size <= 0) {
    throw new Error("Uploaded file is empty.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Maximum file size allowed is 10 MB."
    );
  }

  // Extension validation
  
  if (!allowedExtensions.includes(extension)) {
    throw new Error("Invalid file extension.");
  }

  // Ensure file actually exists
  if (!fs.existsSync(file.path)) {
    throw new Error("Uploaded file not found.");
  }

  // Prevent blank files
  const stats = fs.statSync(file.path);

  if (stats.size === 0) {
    throw new Error("Uploaded file is empty.");
  }

  return true;
};