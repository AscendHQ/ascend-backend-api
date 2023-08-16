import multer from "multer";
import { Request } from "express";

function isAllowed(req: Request, file: any, cb: any) {
  if (file.mimetype !== "text/csv") {
    return cb(new Error("Document must be a CSV file!"), false);
  }

  return cb(null, true);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 10000000,
  },
  fileFilter: isAllowed,
});

export const csvUpload = upload.single("csv");
