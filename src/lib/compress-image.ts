const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Compress/resize image for upload.
 * Falls back to original file if anything fails (e.g. HEIC on iOS).
 */
export async function compressImage(file: File): Promise<File> {
  try {
    // If file is already small and not a format that needs conversion — return as-is
    const isHEIC =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (!isHEIC && file.size <= MAX_FILE_SIZE) {
      // Try loading to check dimensions
      const img = await loadImage(file);
      if (img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
        return file; // already small enough
      }
      // Need to resize
      return await resizeImage(img, file.name);
    }

    // HEIC or too large — try canvas conversion
    const img = await loadImage(file);
    return await resizeImage(img, file.name);
  } catch {
    // Fallback: return original file unchanged
    // This handles HEIC on browsers that can't decode it via canvas,
    // server-side Blob will handle it directly
    console.warn("compressImage: falling back to original file", file.type);
    return file;
  }
}

async function resizeImage(img: HTMLImageElement, originalName: string): Promise<File> {
  const { width, height } = getScaledDimensions(img.width, img.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });

  return new File([blob], originalName.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Cannot decode image: ${file.type}`));
    };
    img.src = url;
  });
}

function getScaledDimensions(w: number, h: number) {
  if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) return { width: w, height: h };
  const ratio = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
}
