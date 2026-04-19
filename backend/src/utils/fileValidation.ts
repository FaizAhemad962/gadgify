/**
 * ✅ SECURITY: Magic bytes validation for file uploads
 * Prevents malware/malicious files from being uploaded by checking actual file content
 * Not just file extension which can be spoofed
 */

export interface MagicBytesMap {
  [key: string]: {
    signatures: Buffer[];
    mimeTypes: string[];
    extensions: string[];
  };
}

// Magic byte signatures for supported file types
export const MAGIC_BYTES: MagicBytesMap = {
  // Images
  png: {
    signatures: [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
    mimeTypes: ["image/png"],
    extensions: ["png"],
  },
  jpeg: {
    signatures: [
      Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
      Buffer.from([0xff, 0xd8, 0xff, 0xe8]),
    ],
    mimeTypes: ["image/jpeg"],
    extensions: ["jpg", "jpeg"],
  },
  gif: {
    signatures: [Buffer.from([0x47, 0x49, 0x46, 0x38])],
    mimeTypes: ["image/gif"],
    extensions: ["gif"],
  },
  webp: {
    signatures: [
      Buffer.from([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ]),
    ],
    mimeTypes: ["image/webp"],
    extensions: ["webp"],
  },
  // Videos
  mp4: {
    signatures: [Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70])],
    mimeTypes: ["video/mp4"],
    extensions: ["mp4"],
  },
  webm: {
    signatures: [Buffer.from([0x1a, 0x45, 0xdf, 0xa3])],
    mimeTypes: ["video/webm"],
    extensions: ["webm"],
  },
};

/**
 * Check if file content matches the declared MIME type
 * Returns true if content matches claimed type or if unsupported file
 * Returns false only if content clearly doesn't match
 */
export const validateMagicBytes = (
  buffer: Buffer,
  declaredMimeType: string,
  fileName: string,
): { valid: boolean; error?: string } => {
  // Get file extension
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

  // Check if file type is supported in our validation map
  let isSupported = false;
  let expectedMimeType = "";

  for (const [key, fileTypeConfig] of Object.entries(MAGIC_BYTES)) {
    if (
      fileTypeConfig.extensions.includes(fileExtension) ||
      fileTypeConfig.mimeTypes.includes(declaredMimeType)
    ) {
      isSupported = true;
      expectedMimeType = fileTypeConfig.mimeTypes[0];

      // Check if buffer starts with any valid magic bytes for this type
      const hasValidSignature = fileTypeConfig.signatures.some((signature) => {
        // Handle special cases like WebP which has signature in middle
        if (key === "webp") {
          return buffer.includes(signature);
        }
        return buffer.subarray(0, signature.length).equals(signature);
      });

      if (!hasValidSignature) {
        return {
          valid: false,
          error: `File content does not match ${key.toUpperCase()} format. Detected potential ${getFileTypeFromMagicBytes(buffer) || "unknown"} file.`,
        };
      }

      return { valid: true };
    }
  }

  // If file type is not in our supported list, allow it (don't reject unknown types)
  // But log a warning
  console.warn(
    `[FILE VALIDATION] Unsupported file type for magic bytes validation: ${fileExtension}`,
  );
  return { valid: true };
};

/**
 * Detect file type from magic bytes
 * Useful for identifying spoofed files
 */
export const getFileTypeFromMagicBytes = (buffer: Buffer): string | null => {
  for (const [key, fileTypeConfig] of Object.entries(MAGIC_BYTES)) {
    const hasSignature = fileTypeConfig.signatures.some((signature) => {
      if (key === "webp") {
        return buffer.includes(signature);
      }
      return buffer.subarray(0, signature.length).equals(signature);
    });

    if (hasSignature) {
      return key.toUpperCase();
    }
  }

  return null;
};

/**
 * Validate file upload security
 * Checks:
 * 1. File size
 * 2. File extension whitelist
 * 3. MIME type matches declared
 * 4. Magic bytes match actual content
 */
export const validateFileUpload = (
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  maxSizeBytes: number,
  allowedExtensions: string[] = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "mp4",
    "webm",
  ],
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check file size
  if (buffer.length > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    errors.push(
      `File size exceeds maximum of ${maxSizeMB}MB (actual: ${Math.round(buffer.length / (1024 * 1024))}MB)`,
    );
  }

  // Check file extension
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push(
      `File type not allowed. Allowed types: ${allowedExtensions.join(", ")}`,
    );
  }

  // Check magic bytes
  const magicBytesCheck = validateMagicBytes(buffer, mimeType, fileName);
  if (!magicBytesCheck.valid && magicBytesCheck.error) {
    errors.push(magicBytesCheck.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export default {
  validateMagicBytes,
  getFileTypeFromMagicBytes,
  validateFileUpload,
  MAGIC_BYTES,
};
