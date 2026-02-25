import { useState, useEffect } from 'react';
import { Course } from '../types';
import { iapService } from '../services/iapService';
import { logger } from '../utils/logger';

export const useIAPPrice = (course: Course | null) => {
    const [displayPrice, setDisplayPrice] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        const fetchPrice = async () => {
            // If course is not provided yet
            if (!course) {
                if (isMounted) {
                    setDisplayPrice('');
                    setIsLoading(true);
                }
                return;
            }

            // If course is explicitly free or has no price/tier info
            if (
                course.is_free ||
                !course.price ||
                parseFloat(course.price) === 0
            ) {
                if (isMounted) {
                    setDisplayPrice('Free');
                    setIsLoading(false);
                }
                return;
            }

            const productId = course.tier_info?.product_id;

            // If IAP is not available or product ID is missing, fallback to backend string
            if (!iapService.isAvailable() || !productId) {
                if (isMounted) {
                    setDisplayPrice(course.price ? `$${course.price}` : 'Free');
                    setIsLoading(false);
                }
                return;
            }

            try {
                const products = await iapService.getProducts([productId]);
                if (isMounted) {
                    if (products && products.length > 0) {
                        setDisplayPrice(products[0].price); // localized price string directly from Apple/Google
                    } else {
                        // Product not found in App Store (e.g. pending review), fallback
                        setDisplayPrice(course.price ? `$${course.price}` : 'Free');
                    }
                }
            } catch (error) {
                logger.error(`Error fetching IAP price for ${productId}:`, error);
                if (isMounted) {
                    setDisplayPrice(course.price ? `$${course.price}` : 'Free');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPrice();

        return () => {
            isMounted = false;
        };
    }, [course]);

    return { displayPrice, isLoading };
};
