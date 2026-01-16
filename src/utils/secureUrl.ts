/**
 * Utility to ensure image URLs use HTTPS
 * iOS blocks insecure HTTP connections by default
 */

/**
 * Convert http:// to https:// in image URLs
 */
export const secureImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    return url.replace('http://', 'https://');
};
