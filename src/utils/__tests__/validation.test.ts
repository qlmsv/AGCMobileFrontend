import { validatePhone, validateEmail, validateRequired } from '../validation';

describe('Validation Utils', () => {
  describe('validatePhone', () => {
    it('validates correct phone numbers', () => {
      expect(validatePhone('1234567890').isValid).toBe(true);
      expect(validatePhone('+1234567890').isValid).toBe(true);
    });

    it('rejects too short numbers', () => {
      expect(validatePhone('123').isValid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('validates correct emails', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(validateEmail('invalid-email').isValid).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('validates non-empty strings', () => {
      expect(validateRequired('some value').isValid).toBe(true);
    });

    it('rejects empty strings', () => {
      expect(validateRequired('').isValid).toBe(false);
      expect(validateRequired('   ').isValid).toBe(false);
    });
  });
});
