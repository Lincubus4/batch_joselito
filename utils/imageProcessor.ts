import { FitMode } from '../types';

export const processImage = async (
  file: File,
  targetWidth: number,
  targetHeight: number,
  mode: FitMode,
  bgColor: string = '#000000'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Fill background
      if (mode === 'contain') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      }

      let drawX = 0;
      let drawY = 0;
      let drawWidth = targetWidth;
      let drawHeight = targetHeight;

      const scaleX = targetWidth / img.width;
      const scaleY = targetHeight / img.height;

      if (mode === 'cover') {
        const scale = Math.max(scaleX, scaleY);
        drawWidth = img.width * scale;
        drawHeight = img.height * scale;
        drawX = (targetWidth - drawWidth) / 2;
        drawY = (targetHeight - drawHeight) / 2;
      } else if (mode === 'contain') {
        const scale = Math.min(scaleX, scaleY);
        drawWidth = img.width * scale;
        drawHeight = img.height * scale;
        drawX = (targetWidth - drawWidth) / 2;
        drawY = (targetHeight - drawHeight) / 2;
      } else if (mode === 'fill') {
        drawWidth = targetWidth;
        drawHeight = targetHeight;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      const dataUrl = canvas.toDataURL(file.type);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};
