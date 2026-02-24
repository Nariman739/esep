const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_FILE_SIZE && !file.type.includes("heic")) {
    // Small enough and not HEIC — check if resize needed
    const img = await loadImage(file);
    if (img.width <= MAX_DIMENSION && img.height <= MAX_DIMENSION) {
      return file;
    }
  }

  const img = await loadImage(file);
  const { width, height } = getScaledDimensions(img.width, img.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/jpeg", JPEG_QUALITY);
  });

  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
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
