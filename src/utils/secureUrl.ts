/**
 * Utility to ensure image URLs are complete and use HTTPS
 * iOS blocks insecure HTTP connections by default
 */

// Base URL for media files (without /api)
const MEDIA_BASE_URL = 'https://api.apexglobal.app';

/**
 * Convert relative URLs to absolute and ensure HTTPS
 * Handles:
 * - Relative paths like /media/... -> https://api.apexglobal.app/media/...
 * - HTTP URLs -> HTTPS
 * - Already valid HTTPS URLs -> unchanged
 */
export const secureImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;

    // If it's a relative path (starts with /), prepend base URL
    if (url.startsWith('/')) {
        return `${MEDIA_BASE_URL}${url}`;
    }

    // If it's http, convert to https
    if (url.startsWith('http://')) {
        return url.replace('http://', 'https://');
    }

    // Already https or other valid URL
    return url;
};
