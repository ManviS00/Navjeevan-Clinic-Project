import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";


// Create upload folder automatically (Year/Month)
const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    const now = new Date();

    const year = now.getFullYear().toString();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const uploadPath = path.join(
      "uploads",
      "medical-records",
      year,
      month
    );

    fs.mkdirSync(uploadPath, {
      recursive: true,
    });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    const now = new Date();

    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const random = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

    const extension = path.extname(file.originalname);

    cb(
      null,
      `MR-${date}-${random}${extension}`
    );
  },
});

const fileFilter = (req, file, cb) => {

  console.log("Original Name:", file.originalname);
  console.log("Mime Type:", file.mimetype);

  const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
  ];

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/octet-stream",
  ];

  if (
    allowedExtensions.includes(extension) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only PDF, JPG, JPEG and PNG files are allowed."
    ),
    false
  );
};

const uploadMedicalRecord = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

});

export const uploadSingleMedicalRecord =
  uploadMedicalRecord.single("medicalRecord");

export default uploadMedicalRecord;