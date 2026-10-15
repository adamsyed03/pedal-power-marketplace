import { PRODUCT_VIDEOS, availableProductVideo, type ProductVideoSource } from '../lib/productVideos';
import type { UkProductKey } from './ukMarket';

export type UkProductVideo = ProductVideoSource;
export const UK_PRODUCT_VIDEOS: Partial<Record<UkProductKey, UkProductVideo>> = PRODUCT_VIDEOS;

export const availableUkProductVideo = (productKey: UkProductKey) => productKey === 'fold'
  ? undefined
  : availableProductVideo(productKey);
