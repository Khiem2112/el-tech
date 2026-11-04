export const DEFAULT_PRODUCT_IMAGE_PATH = '/images/products/placeholder.webp';

type MediaObject = {
  url?: string;
  thumbnail?: string;
  src?: string;
  is_primary?: boolean;
  sort_order?: number;
  [key: string]: unknown;
};

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('./')
  );
}

export function resolveAllProductImages(media: unknown): readonly string[] {
  if (!media) {
    return [DEFAULT_PRODUCT_IMAGE_PATH];
  }

  if (typeof media === 'string') {
    const trimmed = media.trim();
    if (isValidImageUrl(trimmed)) {
      return [trimmed];
    }
    try {
      const parsed = JSON.parse(trimmed);
      return resolveAllProductImages(parsed);
    } catch {
      return [DEFAULT_PRODUCT_IMAGE_PATH];
    }
  }

  if (Array.isArray(media)) {
    type ExtractedImage = { url: string; isPrimary: boolean; sortOrder: number; originalIndex: number };
    const items: ExtractedImage[] = [];

    for (let index = 0; index < media.length; index++) {
      const item = media[index];
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (isValidImageUrl(trimmed)) {
          items.push({ url: trimmed, isPrimary: false, sortOrder: index, originalIndex: index });
        }
      } else if (item && typeof item === 'object') {
        const obj = item as MediaObject;
        const candidateUrl =
          (typeof obj.url === 'string' && obj.url.trim()) ||
          (typeof obj.thumbnail === 'string' && obj.thumbnail.trim()) ||
          (typeof obj.src === 'string' && obj.src.trim()) ||
          '';

        if (candidateUrl && isValidImageUrl(candidateUrl)) {
          const isPrimary = Boolean(obj.is_primary);
          const sortOrder = typeof obj.sort_order === 'number' ? obj.sort_order : index;
          items.push({ url: candidateUrl, isPrimary, sortOrder, originalIndex: index });
        }
      }
    }

    if (items.length > 0) {
      items.sort((first, second) => {
        if (first.isPrimary && !second.isPrimary) return -1;
        if (!first.isPrimary && second.isPrimary) return 1;
        if (first.sortOrder !== second.sortOrder) return first.sortOrder - second.sortOrder;
        return first.originalIndex - second.originalIndex;
      });

      return items.map((item) => item.url);
    }

    return [DEFAULT_PRODUCT_IMAGE_PATH];
  }

  if (typeof media === 'object' && media !== null) {
    const obj = media as MediaObject;
    const candidateUrl =
      (typeof obj.url === 'string' && obj.url.trim()) ||
      (typeof obj.thumbnail === 'string' && obj.thumbnail.trim()) ||
      (typeof obj.src === 'string' && obj.src.trim()) ||
      '';

    if (candidateUrl && isValidImageUrl(candidateUrl)) {
      return [candidateUrl];
    }
  }

  return [DEFAULT_PRODUCT_IMAGE_PATH];
}

export function resolveProductImageUrl(media: unknown): string {
  const images = resolveAllProductImages(media);
  return images[0] ?? DEFAULT_PRODUCT_IMAGE_PATH;
}

export function handleProductImageError(event: Event): void {
  const target = event.target;
  if (
    target instanceof HTMLImageElement &&
    !target.src.endsWith(DEFAULT_PRODUCT_IMAGE_PATH) &&
    !target.src.endsWith('/image.png')
  ) {
    target.src = DEFAULT_PRODUCT_IMAGE_PATH;
  }
}
