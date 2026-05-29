const MEDIA_BASE_URL = "https://bizo.aiko.qzz.io";

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${MEDIA_BASE_URL}${path}`;
  }

  return `${MEDIA_BASE_URL}/${path}`;
}
