/**
 * Convert an image File to WebP format using a canvas.
 * Returns the original file unchanged if:
 *  - it's already WebP
 *  - it's an animated GIF (would lose animation)
 *  - the browser can't encode WebP
 *  - any error occurs
 */
export async function convertToWebp(
  file: File,
  quality = 0.85,
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/webp') return file;
  if (file.type === 'image/gif') return file; // keep animation

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image decode failed'));
      el.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', quality);
    });
    if (!blob || blob.type !== 'image/webp') return file;

    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${base}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('convertToWebp failed, using original:', err);
    return file;
  }
}