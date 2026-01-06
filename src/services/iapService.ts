import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { logger } from '../utils/logger';

// react-native-iap v14+ has Nitro Modules API
// Using simplified types for compatibility

export interface IAPProduct {
    productId: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    localizedPrice: string;
}

export interface IAPPurchase {
    productId: string;
    transactionId: string;
    transactionReceipt: string;
    purchaseTime: number;
}

class IAPService {
    private isConnected = false;
    private purchaseUpdateSubscription: any = null;
    private purchaseErrorSubscription: any = null;

    // Initialize IAP connection
    async init(): Promise<boolean> {
        if (Platform.OS !== 'ios') {
            logger.info('IAP: Not iOS, skipping initialization');
            return false;
        }

        try {
            const result = await RNIap.initConnection();
            this.isConnected = true;
            logger.info('IAP: Connection initialized', result);
            return true;
        } catch (error) {
            logger.error('IAP: Failed to initialize:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Get available products from App Store
    async getProducts(productIds: string[]): Promise<IAPProduct[]> {
        if (!this.isConnected) {
            await this.init();
        }

        try {
            // Use getProducts for non-consumable items
            const products: any[] = await (RNIap as any).getProducts({ skus: productIds });
            logger.info('IAP: Products fetched:', products?.length || 0);

            if (!products) return [];

            return products.map((product: any) => ({
                productId: product.productId || product.id || '',
                title: product.title || product.name || '',
                description: product.description || '',
                price: product.price || '0',
                currency: product.currency || 'USD',
                localizedPrice: product.localizedPrice || product.price || '0',
            }));
        } catch (error) {
            logger.error('IAP: Failed to fetch products:', error);
            return [];
        }
    }

    // Purchase a product
    async purchase(productId: string): Promise<IAPPurchase | null> {
        if (!this.isConnected) {
            await this.init();
        }

        try {
            logger.info('IAP: Requesting purchase for:', productId);

            // Request purchase - shows Apple's payment sheet
            const purchase: any = await RNIap.requestPurchase({
                sku: productId,
                andDangerouslyFinishTransactionAutomaticallyIOS: false,
            } as any);

            if (purchase) {
                const purchaseData = Array.isArray(purchase) ? purchase[0] : purchase;

                logger.info('IAP: Purchase successful:', purchaseData?.transactionId);

                // Get receipt - field name varies by version
                const receipt = purchaseData?.transactionReceipt
                    || purchaseData?.receipt
                    || purchaseData?.purchaseToken
                    || '';

                return {
                    productId: purchaseData?.productId || productId,
                    transactionId: purchaseData?.transactionId || '',
                    transactionReceipt: receipt,
                    purchaseTime: purchaseData?.transactionDate
                        ? Number(purchaseData.transactionDate)
                        : Date.now(),
                };
            }

            return null;
        } catch (error: any) {
            logger.error('IAP: Purchase failed:', error);
            throw error;
        }
    }

    // Finish transaction after backend verification
    async finishPurchase(purchase: any): Promise<void> {
        try {
            await RNIap.finishTransaction({ purchase, isConsumable: false });
            logger.info('IAP: Transaction finished:', purchase?.transactionId);
        } catch (error) {
            logger.error('IAP: Failed to finish transaction:', error);
            throw error;
        }
    }

    // Restore previous purchases
    async restorePurchases(): Promise<IAPPurchase[]> {
        if (!this.isConnected) {
            await this.init();
        }

        try {
            const purchases: any[] = await RNIap.getAvailablePurchases();
            logger.info('IAP: Restored purchases:', purchases?.length || 0);

            if (!purchases) return [];

            return purchases.map((purchase: any) => ({
                productId: purchase?.productId || '',
                transactionId: purchase?.transactionId || '',
                transactionReceipt: purchase?.transactionReceipt || purchase?.receipt || '',
                purchaseTime: purchase?.transactionDate
                    ? Number(purchase.transactionDate)
                    : Date.now(),
            }));
        } catch (error) {
            logger.error('IAP: Failed to restore purchases:', error);
            return [];
        }
    }

    // Set up purchase listeners
    setupListeners(
        onPurchaseUpdate: (purchase: any) => void,
        onPurchaseError: (error: any) => void
    ): void {
        this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(onPurchaseUpdate);
        this.purchaseErrorSubscription = RNIap.purchaseErrorListener(onPurchaseError);
        logger.info('IAP: Listeners set up');
    }

    // Remove listeners
    removeListeners(): void {
        if (this.purchaseUpdateSubscription) {
            this.purchaseUpdateSubscription.remove();
            this.purchaseUpdateSubscription = null;
        }
        if (this.purchaseErrorSubscription) {
            this.purchaseErrorSubscription.remove();
            this.purchaseErrorSubscription = null;
        }
        logger.info('IAP: Listeners removed');
    }

    // End connection
    async end(): Promise<void> {
        this.removeListeners();
        if (this.isConnected) {
            try {
                await RNIap.endConnection();
                this.isConnected = false;
                logger.info('IAP: Connection ended');
            } catch (error) {
                logger.error('IAP: Failed to end connection:', error);
            }
        }
    }
}

export const iapService = new IAPService();
