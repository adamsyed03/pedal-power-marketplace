import type { BikeKey } from './productDetails';

export type ProductVideoSource = {
  src: string;
  mimeType: 'video/mp4';
  title: string;
  available: boolean;
};

// Keep a video disabled until its public URL returns a successful response
// with video/mp4 and working byte-range requests. All three assets passed that
// verification on 2026-10-15.
export const PRODUCT_VIDEOS: Record<BikeKey, ProductVideoSource> = {
  core: {
    src: 'https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/20260729_163748.mp4',
    mimeType: 'video/mp4',
    title: 'Pogon Core product film',
    available: true,
  },
  cargo: {
    src: 'https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/20260713_184119.mp4',
    mimeType: 'video/mp4',
    title: 'Pogon Cargo product film',
    available: true,
  },
  glide: {
    src: 'https://pub-a596780795d544d0ae581ceaebbb8e46.r2.dev/glide%20(2).mp4',
    mimeType: 'video/mp4',
    title: 'Pogon Glide product film',
    available: true,
  },
};

export const availableProductVideo = (productKey: BikeKey) => {
  const video = PRODUCT_VIDEOS[productKey];
  return video.available ? video : undefined;
};
