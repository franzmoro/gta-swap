import { TokenFeeMath } from './token-fee-math';
import { describe, expect, it } from 'vitest';

describe('TokenFeeMath', () => {
  // Tax percentage is 0.06 (6%) and trade fee is 0.003 (0.30%)

  describe('calculateTradeFee', () => {
    it('should calculate the correct trade fee for a regular token', () => {
      const amount = BigInt(1000);
      const fee = TokenFeeMath.calculateTradeFee(amount);

      // 0.30% of 1000 = 3
      expect(fee).toBe(BigInt(3));
    });

    it('should calculate the correct trade fee for the platform token', () => {
      const amount = BigInt(1000);
      const fee = TokenFeeMath.calculateTradeFee(amount, true);

      // First apply tax: 1000 * (1 - 0.06) = 940
      // Then apply trade fee: 940 * 0.003 = 2.82 rounded to 2
      expect(fee).toBe(BigInt(2));
    });
  });

  describe('getMinAmountReceived', () => {
    it('should calculate the correct minimum amount with 0.5% slippage', () => {
      const amount = BigInt(1000);
      const slippage = 0.5; // 0.5%
      const minAmount = TokenFeeMath.getMinAmountReceived(amount, slippage);

      // 1000 * (1 - 0.005) = 995
      expect(minAmount).toBe(BigInt(995));
    });

    it('should calculate the correct minimum amount with 1% slippage', () => {
      const amount = BigInt(1000);
      const slippage = 1; // 1%
      const minAmount = TokenFeeMath.getMinAmountReceived(amount, slippage);

      // 1000 * (1 - 0.01) = 990
      expect(minAmount).toBe(BigInt(990));
    });

    it('should calculate the correct minimum amount with 5.5% slippage', () => {
      const amount = BigInt(1000);
      const slippage = 5.5; // 5.5%
      const minAmount = TokenFeeMath.getMinAmountReceived(amount, slippage);

      // 1000 * (1 - 0.055) = 944.5, rounded to 945
      expect(minAmount).toBe(BigInt(945));
    });
  });

  describe('getTaxOnToken', () => {
    it('should calculate the correct tax for selling a token', () => {
      const amount = BigInt(1000);
      const tax = TokenFeeMath.getTaxOnToken(amount, true);

      // Tax when selling: amount - (amount * (1 - 0.06))
      // 1000 - (1000 * 0.94) = 1000 - 940 = 60
      expect(tax).toBe(BigInt(60));
    });

    it('should calculate the correct tax for buying a token', () => {
      const amount = BigInt(1000);
      const tax = TokenFeeMath.getTaxOnToken(amount, false);

      // Tax when buying: (amount / (1 - 0.06)) - amount
      // (1000 / 0.94) - 1000 ≈ 1063.83 - 1000 = 63.83, rounded to 63
      expect(tax).toBe(BigInt(63));
    });
  });

  describe('getTokenAfterTax', () => {
    it('should calculate the correct amount after tax', () => {
      const amount = BigInt(1000);
      const amountAfterTax = TokenFeeMath.getTokenAfterTax(amount);

      // 1000 * (1 - 0.06) = 1000 * 0.94 = 940
      expect(amountAfterTax).toBe(BigInt(940));
    });
  });

  describe('getTokenWithTax', () => {
    it('should calculate the correct amount with tax', () => {
      const amount = BigInt(1000);
      const amountWithTax = TokenFeeMath.getTokenWithTax(amount);

      // 1000 / (1 - 0.06) = 1000 / 0.94 ≈ 1063.83, rounded to 1063
      expect(amountWithTax).toBe(BigInt(1063));
    });
  });
});
