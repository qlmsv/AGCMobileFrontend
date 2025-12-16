import { AxiosError } from 'axios';
import { logger } from './logger';

export const isUnauthorizedError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  if ((error as AxiosError).isAxiosError) {
    return (error as AxiosError).response?.status === 401;
  }

  if (error instanceof Error) {
    const maybeResponse = (error as { response?: { status?: number } }).response;
    if (typeof maybeResponse?.status === 'number') {
      return maybeResponse.status === 401;
    }
  }

  return false;
};

export const logApiError = (message: string, error: unknown) => {
  if (isUnauthorizedError(error)) {
    logger.info(`${message}: unauthorized, using demo data.`);
    return;
  }

  logger.error(`${message}:`, error);
};
