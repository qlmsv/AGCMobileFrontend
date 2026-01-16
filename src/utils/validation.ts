/**
 * Validation utilities for form inputs
 */

/**
 * Validate phone number format
 * Accepts various formats: +1234567890, 1234567890, (123) 456-7890, etc.
 */
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // Check if it has at least 10 digits
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }

  // Check if it has no more than 15 digits (international format)
  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  return { isValid: true };
};

/**
 * Validate verification code
 */
export const validateVerificationCode = (
  code: string,
  minLength: number = 4
): { isValid: boolean; error?: string } => {
  if (!code || !code.trim()) {
    return { isValid: false, error: 'Verification code is required' };
  }

  if (code.length < minLength) {
    return { isValid: false, error: `Code must be at least ${minLength} characters` };
  }

  // Check if code contains only digits
  if (!/^\d+$/.test(code)) {
    return { isValid: false, error: 'Code must contain only numbers' };
  }

  return { isValid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

/**
 * Validate file size
 */
export const validateFileSize = (
  fileSize: number,
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileSize > maxSizeBytes) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  return { isValid: true };
};

/**
 * Validate file type
 */
export const validateFileType = (
  mimeType: string,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): { isValid: boolean; error?: string } => {
  if (!allowedTypes.includes(mimeType)) {
    const typesStr = allowedTypes.map((t) => t.split('/')[1]).join(', ');
    return { isValid: false, error: `Only ${typesStr} files are allowed` };
  }

  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (
  value: string,
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};
