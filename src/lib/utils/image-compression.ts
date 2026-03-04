/**
 * Image Compression Utilities
 *
 * Compresses images before upload to reduce:
 * - Upload time and bandwidth
 * - Storage costs
 * - OpenAI token costs (smaller base64 = fewer tokens)
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 to 1.0
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeKB: 500, // 500KB max
};

/**
 * Compress an image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Only compress images
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // If already small enough, skip compression
  if (file.size / 1024 <= opts.maxSizeKB / 2) {
    console.log('[Compression] File already small, skipping:', file.size / 1024, 'KB');
    return file;
  }

  console.log('[Compression] Original size:', (file.size / 1024).toFixed(2), 'KB');

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      // Calculate new dimensions while preserving aspect ratio
      let { width, height } = img;

      if (width > opts.maxWidth || height > opts.maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = Math.min(width, opts.maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, opts.maxHeight);
          width = height * aspectRatio;
        }
      }

      // Create canvas and compress
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          const compressedSize = blob.size / 1024;
          console.log('[Compression] Compressed size:', compressedSize.toFixed(2), 'KB');
          console.log('[Compression] Reduction:', ((1 - blob.size / file.size) * 100).toFixed(1), '%');

          // Create new File from blob
          const compressedFile = new File(
            [blob],
            file.name,
            {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        file.type || 'image/jpeg',
        opts.quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map(file => compressImage(file, options)));
}

/**
 * Get optimal compression settings based on use case
 */
export function getCompressionPresets(preset: 'chart' | 'profile' | 'document'): CompressionOptions {
  switch (preset) {
    case 'chart':
      // High quality for chart readability
      return {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.90,
        maxSizeKB: 800,
      };
    case 'profile':
      // Medium quality for profile images
      return {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        maxSizeKB: 300,
      };
    case 'document':
      // High quality for document readability
      return {
        maxWidth: 2048,
        maxHeight: 2048,
        quality: 0.92,
        maxSizeKB: 1000,
      };
    default:
      return DEFAULT_OPTIONS;
  }
}
