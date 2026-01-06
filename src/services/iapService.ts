import { Platform } from 'react-native';
import { logger } from '../utils/logger';

// react-native-iap uses NitroModules which don't work in Expo Go
// We dynamically import it only when needed in production builds

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

// Lazy load react-native-iap to avoid crashes in Expo Go
let RNIap: any = null;

const loadIAP = async () => {
    if (RNIap) return RNIap;
    try {
        RNIap = await import('react-native-iap');
        return RNIap;
    } catch (error) {
        logger.warn('IAP: Could not load react-native-iap (expected in Expo Go)');
        return null;
    }
};

class IAPService {
    private isConnected = false;
    private purchaseUpdateSubscription: any = null;
    private purchaseErrorSubscription: any = null;
    private isSupported = false;

    // Initialize IAP connection
    async init(): Promise<boolean> {
        if (Platform.OS !== 'ios') {
            logger.info('IAP: Not iOS, skipping initialization');
            return false;
        }

        const iap = await loadIAP();
        if (!iap) {
            logger.info('IAP: Not available (running in Expo Go)');
            this.isSupported = false;
            return false;
        }

        try {
            const result = await iap.initConnection();
            this.isConnected = true;
            this.isSupported = true;
            logger.info('IAP: Connection initialized', result);
            return true;
        } catch (error) {
            logger.error('IAP: Failed to initialize:', error);
            this.isConnected = false;
            this.isSupported = false;
            return false;
        }
    }

    // Check if IAP is supported
    isAvailable(): boolean {
        return this.isSupported && Platform.OS === 'ios';
    }

    // Get available products from App Store
    async getProducts(productIds: string[]): Promise<IAPProduct[]> {
        const iap = await loadIAP();
        if (!iap) return [];

        if (!this.isConnected) {
            await this.init();
        }

        try {
            const products: any[] = await iap.getProducts({ skus: productIds });
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
        const iap = await loadIAP();
        if (!iap) {
            throw new Error('IAP not available');
        }

        if (!this.isConnected) {
            await this.init();
        }

        try {
            logger.info('IAP: Requesting purchase for:', productId);

            const purchase: any = await iap.requestPurchase({
                sku: productId,
                andDangerouslyFinishTransactionAutomaticallyIOS: false,
            });

            if (purchase) {
                const purchaseData = Array.isArray(purchase) ? purchase[0] : purchase;

                logger.info('IAP: Purchase successful:', purchaseData?.transactionId);

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
        const iap = await loadIAP();
        if (!iap) return;

        try {
            await iap.finishTransaction({ purchase, isConsumable: false });
            logger.info('IAP: Transaction finished:', purchase?.transactionId);
        } catch (error) {
            logger.error('IAP: Failed to finish transaction:', error);
            throw error;
        }
    }

    // Restore previous purchases
    async restorePurchases(): Promise<IAPPurchase[]> {
        const iap = await loadIAP();
        if (!iap) return [];

        if (!this.isConnected) {
            await this.init();
        }

        try {
            const purchases: any[] = await iap.getAvailablePurchases();
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
    async setupListeners(
        onPurchaseUpdate: (purchase: any) => void,
        onPurchaseError: (error: any) => void
    ): Promise<void> {
        const iap = await loadIAP();
        if (!iap) return;

        this.purchaseUpdateSubscription = iap.purchaseUpdatedListener(onPurchaseUpdate);
        this.purchaseErrorSubscription = iap.purchaseErrorListener(onPurchaseError);
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
        const iap = await loadIAP();
        if (!iap) return;

        this.removeListeners();
        if (this.isConnected) {
            try {
                await iap.endConnection();
                this.isConnected = false;
                logger.info('IAP: Connection ended');
            } catch (error) {
                logger.error('IAP: Failed to end connection:', error);
            }
        }
    }
}

export const iapService = new IAPService();
