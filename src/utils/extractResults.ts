/**
 * Helper to extract data from paginated API responses
 * Handles both array responses and paginated objects with 'results' field
 */
export const extractResults = <T>(data: any): T[] => {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
        return data.results;
    }
    return [];
};
