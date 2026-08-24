import multer from "multer";
import { Request } from "express";

function isAllowed(req: Request, file: Express.Multer.File, cb: any) {
  const isCsvName = file.originalname.toLowerCase().endsWith(".csv");
  const allowedMimeTypes = [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
  ];

  if (!isCsvName || !allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Document must be a CSV file"), false);
  }

  return cb(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: isAllowed,
});

export const csvUpload = upload.single("csv");
