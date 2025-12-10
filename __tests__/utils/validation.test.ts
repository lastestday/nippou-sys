import { describe, it, expect } from 'vitest';

/**
 * バリデーション関数のサンプル
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.jp')).toBe(true);
    });

    it('returns false for invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns true for passwords with 8 or more characters', () => {
      expect(validatePassword('12345678')).toBe(true);
      expect(validatePassword('verylongpassword')).toBe(true);
    });

    it('returns false for passwords with less than 8 characters', () => {
      expect(validatePassword('1234567')).toBe(false);
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });
});
