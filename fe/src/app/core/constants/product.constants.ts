export const DEFAULT_PRODUCT_IMAGE_PATH = '/image.png';

export function resolveProductImageUrl(media: unknown): string {
  if (!media) {
    return DEFAULT_PRODUCT_IMAGE_PATH;
  }

  if (typeof media === 'string') {
    const trimmed = media.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
    try {
      const parsed = JSON.parse(trimmed);
      return resolveProductImageUrl(parsed);
    } catch {
      return DEFAULT_PRODUCT_IMAGE_PATH;
    }
  }

  if (Array.isArray(media)) {
    for (const item of media) {
      if (typeof item === 'string' && item.trim()) {
        return item.trim();
      }
      if (item && typeof item === 'object' && 'url' in item && typeof item.url === 'string' && item.url.trim()) {
        return item.url.trim();
      }
    }
    return DEFAULT_PRODUCT_IMAGE_PATH;
  }

  if (typeof media === 'object' && media !== null && 'url' in media && typeof (media as { url: unknown }).url === 'string') {
    const url = (media as { url: string }).url.trim();
    return url || DEFAULT_PRODUCT_IMAGE_PATH;
  }

  return DEFAULT_PRODUCT_IMAGE_PATH;
}

export function handleProductImageError(event: Event): void {
  const target = event.target;
  if (target instanceof HTMLImageElement && !target.src.endsWith(DEFAULT_PRODUCT_IMAGE_PATH)) {
    target.src = DEFAULT_PRODUCT_IMAGE_PATH;
  }
}
