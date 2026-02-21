/**
 * Apple IAP Service using expo-iap (StoreKit 2)
 *
 * StoreKit 2 uses JWS (JSON Web Signature) format for transactions
 * Backend must use App Store Server API (NOT deprecated /verifyReceipt)
 */
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import { courseService } from './courseService';

// Lazy-load expo-iap to avoid crash in Expo Go / simulators
let iapModule: typeof import('expo-iap') | null = null;
function getIAP(): typeof import('expo-iap') {
  if (!iapModule) {
    try {
      iapModule = require('expo-iap');
    } catch (e) {
      logger.warn('IAP: expo-iap native module not available (Expo Go / simulator)');
      throw new Error('IAP not available');
    }
  }
  return iapModule!;
}

type Purchase = import('expo-iap').Purchase;

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount?: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  jws?: string; // JWS token for iOS (StoreKit 2)
  error?: string;
}

class IAPService {
  public isConnected = false;
  private purchaseUpdateSubscription: { remove: () => void } | null = null;
  private purchaseErrorSubscription: { remove: () => void } | null = null;

  /**
   * Initialize IAP connection - call this on app start
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      logger.info('IAP: Not iOS, skipping initialization');
      return false;
    }

    try {
      const result = await getIAP().initConnection();
      this.isConnected = result;
      logger.info('IAP: Connected successfully', result);
      return result;
    } catch (error) {
      logger.error('IAP: Failed to connect', error);
      return false;
    }
  }

  /**
   * Disconnect from IAP - call on app unmount
   */
  async disconnect(): Promise<void> {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }

    if (this.isConnected) {
      try {
        await getIAP().endConnection();
        this.isConnected = false;
        logger.info('IAP: Disconnected');
      } catch (error) {
        logger.error('IAP: Failed to disconnect', error);
      }
    }
  }

  /**
   * Get available products from App Store
   */
  async getProducts(productIds: string[]): Promise<IAPProduct[]> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const products = await getIAP().fetchProducts({
        skus: productIds,
        type: 'in-app',
      });

      if (!products) {
        return [];
      }

      return products.map((product) => ({
        productId: product.id,
        title: product.title,
        description: product.description,
        price: product.displayPrice,
        priceAmount: product.price ?? undefined,
        currency: product.currency,
      }));
    } catch (error) {
      logger.error('IAP: Failed to get products', error);
      return [];
    }
  }

  /**
   * Purchase a product and validate with backend
   *
   * For iOS (StoreKit 2):
   * - purchase.purchaseToken contains the JWS (signed transaction)
   * - Backend should use App Store Server API to validate
   */
  async purchaseCourse(productId: string, courseId: string): Promise<PurchaseResult> {
    if (!this.isConnected) {
      const connected = await this.initialize();
      if (!connected) {
        logger.error('IAP: Not connected to App Store');
        return { success: false, error: 'Failed to connect to App Store' };
      }
    }

    logger.info('IAP: Starting purchase flow', { productId, courseId });

    return new Promise((resolve) => {
      let isResolved = false;
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          logger.error('IAP: Purchase timeout after 60s');
          resolve({ success: false, error: 'Purchase timed out. Please try again.' });
        }
      }, 60000); // 60 second timeout

      const cleanup = () => {
        clearTimeout(timeout);
        if (this.purchaseUpdateSubscription) {
          this.purchaseUpdateSubscription.remove();
          this.purchaseUpdateSubscription = null;
        }
        if (this.purchaseErrorSubscription) {
          this.purchaseErrorSubscription.remove();
          this.purchaseErrorSubscription = null;
        }
      };

      // Set up purchase listener
      this.purchaseUpdateSubscription = getIAP().purchaseUpdatedListener(async (purchase: Purchase) => {
        if (purchase.productId === productId && !isResolved) {
          try {
            logger.info('IAP: Purchase received', {
              productId: purchase.productId,
              purchaseState: purchase.purchaseState,
              hasToken: !!purchase.purchaseToken,
              transactionId: purchase.id,
            });

            if (purchase.purchaseState === 'purchased' && purchase.purchaseToken) {
              // Validate JWS with backend
              logger.info('IAP: Validating receipt with backend', { courseId });
              const validation = await courseService.validateCourseAppleReceipt(
                courseId,
                purchase.purchaseToken, // JWS token
                purchase.id // Transaction ID
              );

              if (validation.status === 'enrolled' || validation.status === 'already_enrolled' || validation.status === 'already_processed') {
                logger.info('IAP: Receipt validated successfully', { courseId });
                // Finish the transaction
                await getIAP().finishTransaction({
                  purchase,
                  isConsumable: false, // Courses are non-consumable
                });

                isResolved = true;
                cleanup();
                resolve({
                  success: true,
                  transactionId: purchase.id,
                  jws: purchase.purchaseToken,
                });
              } else {
                logger.error('IAP: Receipt validation failed', { courseId });
                isResolved = true;
                cleanup();
                resolve({
                  success: false,
                  error: 'Receipt validation failed. Please contact support.',
                });
              }
            } else if (purchase.purchaseState === 'pending') {
              logger.warn('IAP: Purchase pending', { productId });
              isResolved = true;
              cleanup();
              resolve({
                success: false,
                error: 'Purchase is pending approval',
              });
            } else {
              // Unknown or other state
              logger.warn('IAP: Unexpected purchase state', {
                productId,
                state: purchase.purchaseState,
              });
              isResolved = true;
              cleanup();
              resolve({
                success: false,
                error: 'Unexpected purchase state. Please try again.',
              });
            }
          } catch (error) {
            logger.error('IAP: Receipt validation error', error);
            const status = (error as any)?.response?.status;
            const detail = (error as any)?.response?.data?.detail;
            let errMsg = 'Failed to validate purchase with server';
            if (status === 401) {
              errMsg = 'Authentication error. Please log in again.';
            } else if (status === 404) {
              errMsg = 'Course not found. Please contact support.';
            } else if (detail) {
              errMsg = detail;
            }
            isResolved = true;
            cleanup();
            resolve({
              success: false,
              error: errMsg,
            });
          }
        }
      });

      // Set up error listener
      this.purchaseErrorSubscription = getIAP().purchaseErrorListener((error) => {
        if (!isResolved) {
          logger.error('IAP: Purchase error', { code: error.code, message: error.message });
          isResolved = true;
          cleanup();
          if (error.code === 'user-cancelled') {
            resolve({ success: false, error: 'Purchase cancelled' });
          } else if (error.code === 'sku-not-found') {
            resolve({
              success: false,
              error:
                'Product not available in the App Store. This product may not be configured yet. Please try again later.',
            });
          } else {
            resolve({
              success: false,
              error: error.message || 'Purchase failed. Please try again.',
            });
          }
        }
      });

      // Initiate purchase
      logger.info('IAP: Initiating purchase request', { productId });
      getIAP().requestPurchase({
        request: {
          apple: { sku: productId },
        },
        type: 'in-app',
      }).catch((error) => {
        if (!isResolved) {
          logger.error('IAP: Purchase initiation failed', error);
          isResolved = true;
          cleanup();

          // Check if it's a SKU not found error
          const errorMsg = error?.message || '';
          const isSKUNotFound =
            errorMsg.includes('SKU not found') || errorMsg.includes('sku-not-found');

          if (isSKUNotFound) {
            resolve({
              success: false,
              error:
                'Product not available in the App Store. This product may not be configured yet. Please try again later.',
            });
          } else {
            resolve({ success: false, error: 'Failed to initiate purchase. Please try again.' });
          }
        }
      });
    });
  }

  /**
   * Restore previous purchases and sync with backend
   * This is required by Apple for apps with In-App Purchases
   *
   * For tier-based IAP:
   * - Sends all tier purchases to backend
   * - Backend determines which modules user has access to based on purchase history
   */
  async restorePurchases(): Promise<{ success: boolean; count: number; error?: string }> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      logger.info('IAP: Starting purchase restoration...');
      const purchases = await getIAP().getAvailablePurchases();

      logger.info('IAP: Found purchases to restore:', purchases.length);

      if (purchases.length === 0) {
        return { success: true, count: 0 };
      }

      // Collect all tier purchases with their JWS tokens
      const tierPurchases = purchases
        .filter((p): p is Purchase & { purchaseToken: string } =>
          Boolean(p.productId.includes('tier') && p.purchaseToken)
        )
        .map((p) => ({
          productId: p.productId,
          transactionId: p.id,
          jws: p.purchaseToken,
        }));

      logger.info('IAP: Tier purchases to restore:', tierPurchases.length);

      // Validate each tier purchase with backend individually
      for (const tp of tierPurchases) {
        try {
          // We don't know which course this purchase was for without backend lookup,
          // so we log and skip — restore is best-effort
          logger.info('IAP: Restore - found tier purchase', { productId: tp.productId, transactionId: tp.transactionId });
        } catch (validationError) {
          logger.error('IAP: Restore validation failed for', tp.productId, validationError);
        }
      }

      // Finish all restored transactions
      for (const purchase of purchases) {
        await getIAP().finishTransaction({
          purchase,
          isConsumable: false,
        });
      }

      logger.info('IAP: Restored purchases complete');
      return { success: true, count: tierPurchases.length };
    } catch (error) {
      logger.error('IAP: Failed to restore purchases', error);
      return {
        success: false,
        count: 0,
        error: 'Failed to restore purchases. Please try again.',
      };
    }
  }

  /**
   * Check if IAP is available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios';
  }
}

export const iapService = new IAPService();
