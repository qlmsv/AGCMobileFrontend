import { Platform } from 'react-native';
import { Course, TierInfo } from '../types';

const APPLE_TIER_PRODUCT_PREFIX = 'com.agc.mobile.module.v20260307.';

export const getTierProductIdForPlatform = (tierInfo?: TierInfo | null): string | null => {
  if (!tierInfo) {
    return null;
  }

  if (Platform.OS === 'ios') {
    return tierInfo.apple_product_id || tierInfo.product_id || null;
  }

  return tierInfo.google_product_id || tierInfo.product_id || null;
};

export const getCourseProductIdForPlatform = (course?: Course | null): string | null =>
  getTierProductIdForPlatform(course?.tier_info);

export const isAppleTierProductId = (productId?: string | null): boolean =>
  Boolean(productId && productId.startsWith(APPLE_TIER_PRODUCT_PREFIX));
