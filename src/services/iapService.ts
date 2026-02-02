/**
 * Apple IAP Service using expo-iap (StoreKit 2)
 * 
 * StoreKit 2 uses JWS (JSON Web Signature) format for transactions
 * Backend must use App Store Server API (NOT deprecated /verifyReceipt)
 */
import {
    initConnection,
    endConnection,
    fetchProducts as iapFetchProducts,
    requestPurchase as iapRequestPurchase,
    finishTransaction as iapFinishTransaction,
    getAvailablePurchases,
    purchaseUpdatedListener,
    purchaseErrorListener,
    type Product,
    type Purchase,
} from 'expo-iap';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';
import { courseService } from './courseService';

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
    private isConnected = false;
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
            const result = await initConnection();
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
                await endConnection();
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
            const products = await iapFetchProducts({
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
    async purchaseModule(
        productId: string,
        moduleId: string
    ): Promise<PurchaseResult> {
        if (!this.isConnected) {
            const connected = await this.initialize();
            if (!connected) {
                return { success: false, error: 'Failed to connect to App Store' };
            }
        }

        return new Promise((resolve) => {
            // Set up purchase listener
            this.purchaseUpdateSubscription = purchaseUpdatedListener(
                async (purchase: Purchase) => {
                    if (purchase.productId === productId) {
                        try {
                            logger.info('IAP: Purchase received', {
                                productId: purchase.productId,
                                purchaseState: purchase.purchaseState,
                                hasToken: !!purchase.purchaseToken,
                            });

                            if (purchase.purchaseState === 'purchased' && purchase.purchaseToken) {
                                // Validate JWS with backend
                                // purchase.purchaseToken is the JWS (signed transaction) for StoreKit 2
                                const validation = await courseService.validateAppleReceipt(
                                    moduleId,
                                    purchase.purchaseToken, // JWS token
                                    purchase.id // Transaction ID
                                );

                                if (validation.success) {
                                    // Finish the transaction
                                    await iapFinishTransaction({
                                        purchase,
                                        isConsumable: false, // Courses are non-consumable
                                    });

                                    resolve({
                                        success: true,
                                        transactionId: purchase.id,
                                        jws: purchase.purchaseToken,
                                    });
                                } else {
                                    resolve({
                                        success: false,
                                        error: 'Receipt validation failed',
                                    });
                                }
                            } else if (purchase.purchaseState === 'pending') {
                                // Transaction is pending (e.g., parental approval)
                                resolve({
                                    success: false,
                                    error: 'Purchase is pending approval',
                                });
                            }
                        } catch (error) {
                            logger.error('IAP: Receipt validation error', error);
                            const status = (error as any)?.response?.status;
                            let errMsg = 'Failed to validate purchase with server';
                            if (status === 401) {
                                errMsg = 'Ошибка авторизации (401). Перелогиньтесь.';
                            } else if (status === 404) {
                                errMsg = 'Endpoint не найден (404)';
                            }
                            resolve({
                                success: false,
                                error: errMsg,
                            });
                        }
                    }
                }
            );

            // Set up error listener
            this.purchaseErrorSubscription = purchaseErrorListener((error) => {
                logger.error('IAP: Purchase error', error);
                if (error.code === 'user-cancelled') {
                    resolve({ success: false, error: 'Purchase cancelled' });
                } else {
                    resolve({
                        success: false,
                        error: error.message || 'Purchase failed',
                    });
                }
            });

            // Initiate purchase
            iapRequestPurchase({
                request: {
                    apple: { sku: productId },
                },
                type: 'in-app',
            }).catch((error) => {
                logger.error('IAP: Purchase initiation failed', error);
                resolve({ success: false, error: 'Failed to initiate purchase' });
            });
        });
    }

    /**
     * Restore previous purchases
     */
    async restorePurchases(): Promise<string[]> {
        if (!this.isConnected) {
            await this.initialize();
        }

        try {
            const purchases = await getAvailablePurchases();
            const restoredProductIds: string[] = [];

            for (const purchase of purchases) {
                restoredProductIds.push(purchase.productId);
                // Finish restored transactions
                await iapFinishTransaction({
                    purchase,
                    isConsumable: false,
                });
            }

            logger.info('IAP: Restored purchases', restoredProductIds);
            return restoredProductIds;
        } catch (error) {
            logger.error('IAP: Failed to restore purchases', error);
            return [];
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
