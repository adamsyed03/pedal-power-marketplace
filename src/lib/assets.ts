export const publicAsset = (path: string) => {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.replace(/^\/+/, '');
  const encodeSegment = (segment: string) => {
    try {
      return encodeURIComponent(decodeURIComponent(segment));
    } catch {
      return encodeURIComponent(segment);
    }
  };
  const encodedPath = cleanPath
    .split('/')
    .map(encodeSegment)
    .join('/');

  return `${cleanBase}${encodedPath}`;
};
