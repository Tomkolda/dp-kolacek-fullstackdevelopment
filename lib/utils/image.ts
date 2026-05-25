/** Reads the natural dimensions of an image file using the browser Image API. */
export function getImageDimensions(
  file: File,
): Promise<{width: number; height: number} | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({width: img.naturalWidth, height: img.naturalHeight});
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
