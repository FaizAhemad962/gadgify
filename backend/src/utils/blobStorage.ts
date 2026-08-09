import path from "path";
import { put } from "@vercel/blob";

export const isBlobStorageEnabled = () =>
  process.env.VERCEL === "1" && Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export const uploadFileToBlob = async (
  file: Express.Multer.File,
  folder: "profiles" | "products" | "videos",
) => {
  if (!file.buffer) {
    throw new Error("File buffer is required for Blob uploads");
  }

  const extension = path.extname(file.originalname);
  const basename = path
    .basename(file.originalname, extension)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const filename = `${folder}/${basename || "upload"}-${Date.now()}${extension}`;

  const blob = await put(filename, file.buffer, {
    access: "public",
    contentType: file.mimetype,
    addRandomSuffix: true,
  });

  return blob.url;
};
