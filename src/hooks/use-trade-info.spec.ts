import useTradeInfo from './use-trade-info';
import { GOATAI_TOKEN, NATIVE_TOKEN, tokens } from '@/constants/tokens';
import { TokenFeeMath } from '@/lib/utils/token-fee-math';
import { SwapMode } from '@/types';
import { useAtomValue } from 'jotai';
import { formatUnits, parseUnits } from 'viem';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('jotai', () => ({
  atom: vi.fn(),
  useAtomValue: vi.fn(),
}));

vi.mock('./use-get-token-price', () => ({
  useTokenPriceFromPool: vi.fn(),
}));

// Find USDC token
const USDC_TOKEN = tokens.find((token) => token.symbol === 'USDC')!;

// Get mock implementation from original module
import { useTokenPriceFromPool as originalUseTokenPriceFromPool } from './use-get-token-price';
const mockUseTokenPriceFromPool = vi.mocked(originalUseTokenPriceFromPool);

describe('useTradeInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default slippage value
    vi.mocked(useAtomValue).mockReturnValue(0.5);
  });

  describe('when selected tokens are GOATAI (platform token) and ETH', () => {
    it('should calculate correct tax and fees for GOATAI -> ETH swap', () => {
      // Mock the token price from pool
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: false,
        loading: false,
        pairAddress: '0xmockPairAddress',
        tokenAPrice: 0.0001, // 1 GOATAI = 0.0001 ETH
        tokenBPrice: 10000, // 1 ETH = 10000 GOATAI
      });

      // Arrange inputs
      const selectedTokens = {
        [SwapMode.BUY]: NATIVE_TOKEN,
        [SwapMode.SELL]: GOATAI_TOKEN,
      };

      const swapAmounts = {
        [SwapMode.BUY]: {
          displayValue: '0.095',
          rawValue: parseUnits('0.095', NATIVE_TOKEN.decimals),
        },
        [SwapMode.SELL]: {
          displayValue: '1000',
          rawValue: parseUnits('1000', GOATAI_TOKEN.decimals),
        },
      };

      // Act: Call the hook with our mocked values
      const result = useTradeInfo({ selectedTokens, swapAmounts });

      // Assert
      // For platform token tax should be 6% of sell amount
      const expectedTaxAmount = TokenFeeMath.getTaxOnToken(
        swapAmounts[SwapMode.SELL].rawValue,
        true
      );
      expect(result.taxOnToken).toBe(formatUnits(expectedTaxAmount, GOATAI_TOKEN.decimals));

      // Trade fee for platform token is 0.3% of amount after tax
      const expectedTradeFee = TokenFeeMath.calculateTradeFee(
        swapAmounts[SwapMode.SELL].rawValue,
        true
      );
      expect(result.tradeFee).toBe(formatUnits(expectedTradeFee, GOATAI_TOKEN.decimals));

      // Rate should be buy amount / sell amount = 0.095 / 1000 = 0.000095
      expect(result.rate).toBeCloseTo(0.000095);

      // Price impact should be calculated as ((tokenAPrice - rate) / tokenAPrice) * 100
      // Here: ((0.0001 - 0.000095) / 0.0001) * 100 = 5%
      expect(result.priceImpact).toBeCloseTo(5);

      expect(result.slippage).toBe(0.5);
    });

    it('should calculate correct tax and fees for ETH -> GOATAI swap', () => {
      // Mock the token price from pool
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: false,
        loading: false,
        pairAddress: '0xmockPairAddress',
        tokenAPrice: 10000, // 1 ETH = 10000 GOATAI
        tokenBPrice: 0.0001, // 1 GOATAI = 0.0001 ETH
      });

      // Arrange inputs
      const selectedTokens = {
        [SwapMode.BUY]: GOATAI_TOKEN,
        [SwapMode.SELL]: NATIVE_TOKEN,
      };

      const swapAmounts = {
        [SwapMode.BUY]: {
          displayValue: '950',
          rawValue: parseUnits('950', GOATAI_TOKEN.decimals),
        },
        [SwapMode.SELL]: {
          displayValue: '0.1',
          rawValue: parseUnits('0.1', NATIVE_TOKEN.decimals),
        },
      };

      // Act: Call the hook with our mocked values
      const result = useTradeInfo({ selectedTokens, swapAmounts });

      // Assert
      // Tax is on buy amount for platform token
      const expectedTaxAmount = TokenFeeMath.getTaxOnToken(
        swapAmounts[SwapMode.BUY].rawValue,
        false
      );
      expect(result.taxOnToken).toBe(formatUnits(expectedTaxAmount, GOATAI_TOKEN.decimals));

      // Trade fee for non-platform token is 0.3% of sell amount
      const expectedTradeFee = TokenFeeMath.calculateTradeFee(
        swapAmounts[SwapMode.SELL].rawValue,
        false
      );
      expect(result.tradeFee).toBe(formatUnits(expectedTradeFee, GOATAI_TOKEN.decimals));

      // Rate should be buy amount / sell amount = 950 / 0.1 = 9500
      expect(result.rate).toBeCloseTo(9500);

      // Price impact should be calculated as ((tokenAPrice - rate) / tokenAPrice) * 100
      // Here: ((10000 - 9500) / 10000) * 100 = 5%
      expect(result.priceImpact).toBeCloseTo(5);

      expect(result.slippage).toBe(0.5);
    });
  });

  describe('when selected tokens are GOATAI and USDC', () => {
    it('should calculate correct tax and fees for GOATAI -> USDC swap', () => {
      // Mock the token price from pool
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: false,
        loading: false,
        pairAddress: '0xmockPairAddress',
        tokenAPrice: 0.1, // 1 GOATAI = 0.1 USDC
        tokenBPrice: 10, // 1 USDC = 10 GOATAI
      });

      // Arrange inputs
      const selectedTokens = {
        [SwapMode.BUY]: USDC_TOKEN,
        [SwapMode.SELL]: GOATAI_TOKEN,
      };

      const swapAmounts = {
        [SwapMode.BUY]: {
          displayValue: '9.5',
          rawValue: parseUnits('9.5', USDC_TOKEN.decimals),
        },
        [SwapMode.SELL]: {
          displayValue: '100',
          rawValue: parseUnits('100', GOATAI_TOKEN.decimals),
        },
      };

      // Act: Call the hook with our mocked values
      const result = useTradeInfo({ selectedTokens, swapAmounts });

      // Assert
      // For platform token tax should be 6% of sell amount
      const expectedTaxAmount = TokenFeeMath.getTaxOnToken(
        swapAmounts[SwapMode.SELL].rawValue,
        true
      );
      expect(result.taxOnToken).toBe(formatUnits(expectedTaxAmount, GOATAI_TOKEN.decimals));

      // Trade fee for platform token is 0.3% of amount after tax
      const expectedTradeFee = TokenFeeMath.calculateTradeFee(
        swapAmounts[SwapMode.SELL].rawValue,
        true
      );
      expect(result.tradeFee).toBe(formatUnits(expectedTradeFee, GOATAI_TOKEN.decimals));

      // Rate should be buy amount / sell amount = 9.5 / 100 = 0.095
      expect(result.rate).toBeCloseTo(0.095);

      // Price impact should be calculated as ((tokenAPrice - rate) / tokenAPrice) * 100
      // Here: ((0.1 - 0.095) / 0.1) * 100 = 5%
      expect(result.priceImpact).toBeCloseTo(5);
    });

    it('should calculate correct tax and fees for USDC -> GOATAI swap', () => {
      // Mock the token price from pool
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: false,
        loading: false,
        pairAddress: '0xmockPairAddress',
        tokenAPrice: 10, // 1 USDC = 10 GOATAI
        tokenBPrice: 0.1, // 1 GOATAI = 0.1 USDC
      });

      // Arrange inputs
      const selectedTokens = {
        [SwapMode.BUY]: GOATAI_TOKEN,
        [SwapMode.SELL]: USDC_TOKEN,
      };

      const swapAmounts = {
        [SwapMode.BUY]: {
          displayValue: '95',
          rawValue: parseUnits('95', GOATAI_TOKEN.decimals),
        },
        [SwapMode.SELL]: {
          displayValue: '10',
          rawValue: parseUnits('10', USDC_TOKEN.decimals),
        },
      };

      // Act: Call the hook with our mocked values
      const result = useTradeInfo({ selectedTokens, swapAmounts });

      // Assert
      // Tax is on buy amount for platform token
      const expectedTaxAmount = TokenFeeMath.getTaxOnToken(
        swapAmounts[SwapMode.BUY].rawValue,
        false
      );
      expect(result.taxOnToken).toBe(formatUnits(expectedTaxAmount, GOATAI_TOKEN.decimals));

      // Trade fee for non-platform token is 0.3% of sell amount
      const expectedTradeFee = TokenFeeMath.calculateTradeFee(
        swapAmounts[SwapMode.SELL].rawValue,
        false
      );
      expect(result.tradeFee).toBe(formatUnits(expectedTradeFee, GOATAI_TOKEN.decimals));

      // Rate should be buy amount / sell amount = 95 / 10 = 9.5
      expect(result.rate).toBeCloseTo(9.5);

      // Price impact should be calculated as ((tokenAPrice - rate) / tokenAPrice) * 100
      // Here: ((10 - 9.5) / 10) * 100 = 5%
      expect(result.priceImpact).toBeCloseTo(5);
    });
  });

  describe('when swap amount is 0', () => {
    it('should handle zero swap amount gracefully', () => {
      // Mock the token price from pool
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: false,
        loading: false,
        pairAddress: '0xmockPairAddress',
        tokenAPrice: 10000,
        tokenBPrice: 0.0001,
      });

      // Arrange inputs
      const selectedTokens = {
        [SwapMode.BUY]: GOATAI_TOKEN,
        [SwapMode.SELL]: NATIVE_TOKEN,
      };

      const swapAmounts = {
        [SwapMode.BUY]: {
          displayValue: '0',
          rawValue: parseUnits('0', GOATAI_TOKEN.decimals),
        },
        [SwapMode.SELL]: {
          displayValue: '0',
          rawValue: parseUnits('0', NATIVE_TOKEN.decimals),
        },
      };

      // Act: Call the hook with our mocked values
      const result = useTradeInfo({ selectedTokens, swapAmounts });

      // Assert
      // With zero amount, tax should be zero
      expect(result.taxOnToken).toBe('0');

      // With zero amount, trade fee should be zero
      expect(result.tradeFee).toBe('0');

      // Rate should be 0 when sell amount is 0
      expect(result.rate).toBe(0);

      // When rate is 0, price impact calculation should handle it
      // Since the formula is ((tokenAPrice - rate) / tokenAPrice) * 100
      // this should equal 100% since rate is 0
      expect(result.priceImpact).toBe(100);
    });
  });

  describe('when swap amount is negative', () => {
    it('should handle negative swap amount (should not happen in UI but testing for robustness)', () => {
      // Mock the token price from pool
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: false,
        loading: false,
        pairAddress: '0xmockPairAddress',
        tokenAPrice: 10000,
        tokenBPrice: 0.0001,
      });

      // Arrange inputs
      const selectedTokens = {
        [SwapMode.BUY]: GOATAI_TOKEN,
        [SwapMode.SELL]: NATIVE_TOKEN,
      };

      // Note: We can't create negative BigInt values directly
      // This is a contrived example where we're testing how the hook
      // would behave with display values that are negative
      const swapAmounts = {
        [SwapMode.BUY]: {
          displayValue: '-10000', // Negative display value
          rawValue: parseUnits('10000', GOATAI_TOKEN.decimals),
        },
        [SwapMode.SELL]: {
          displayValue: '-1', // Negative display value
          rawValue: parseUnits('1', NATIVE_TOKEN.decimals),
        },
      };

      // Act: Call the hook with our mocked values
      const result = useTradeInfo({ selectedTokens, swapAmounts });

      // Assert
      // The trade fee should still be calculated on the raw value
      const expectedTradeFee = TokenFeeMath.calculateTradeFee(
        swapAmounts[SwapMode.SELL].rawValue,
        false
      );
      expect(result.tradeFee).toBe(formatUnits(expectedTradeFee, GOATAI_TOKEN.decimals));

      // With negative display values, rate should be positive as negatives cancel out
      // rate = -10000 / -1 = 10000
      expect(result.rate).toBe(10000);

      // Price impact should still be calculated correctly
      // Here: ((10000 - 10000) / 10000) * 100 = 0%
      expect(result.priceImpact).toBe(0);
    });
  });

  describe('when useTokenPriceFromPool errors', () => {
    it('should handle error from useTokenPriceFromPool', () => {
      // Mock the token price from pool with error
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: true,
        loading: false,
        pairAddress: null,
        tokenAPrice: 0,
        tokenBPrice: 0,
      });

      // Arrange inputs
      const selectedTokens = {
        [SwapMode.BUY]: NATIVE_TOKEN,
        [SwapMode.SELL]: GOATAI_TOKEN,
      };

      const swapAmounts = {
        [SwapMode.BUY]: {
          displayValue: '0.1',
          rawValue: parseUnits('0.1', NATIVE_TOKEN.decimals),
        },
        [SwapMode.SELL]: {
          displayValue: '1000',
          rawValue: parseUnits('1000', GOATAI_TOKEN.decimals),
        },
      };

      // Act: Call the hook with our mocked values
      const result = useTradeInfo({ selectedTokens, swapAmounts });

      // Assert
      // Rate should still be calculated based on swap amounts
      expect(result.rate).toBeCloseTo(0.0001);

      // When tokenAPrice is 0, price impact calculation would result in NaN
      // or Infinity, but we expect the hook to handle this gracefully
      expect(Number.isNaN(result.priceImpact) || !Number.isFinite(result.priceImpact)).toBe(true);
    });
  });

  describe('when useTokenPriceFromPool returns 0', () => {
    it('should handle zero token price from pool', () => {
      // Mock the token price from pool with zero price
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: false,
        loading: false,
        pairAddress: '0xmockPairAddress',
        tokenAPrice: 0,
        tokenBPrice: 0,
      });

      // Arrange inputs
      const selectedTokens = {
        [SwapMode.BUY]: NATIVE_TOKEN,
        [SwapMode.SELL]: GOATAI_TOKEN,
      };

      const swapAmounts = {
        [SwapMode.BUY]: {
          displayValue: '0.1',
          rawValue: parseUnits('0.1', NATIVE_TOKEN.decimals),
        },
        [SwapMode.SELL]: {
          displayValue: '1000',
          rawValue: parseUnits('1000', GOATAI_TOKEN.decimals),
        },
      };

      // Act: Call the hook with our mocked values
      const result = useTradeInfo({ selectedTokens, swapAmounts });

      // Assert
      // Rate should still be calculated based on swap amounts
      expect(result.rate).toBeCloseTo(0.0001);

      // When tokenAPrice is 0, price impact calculation would result in NaN
      // or Infinity, but we expect the hook to handle this gracefully
      expect(Number.isNaN(result.priceImpact) || !Number.isFinite(result.priceImpact)).toBe(true);
    });
  });

  describe('price impact calculations using constant product AMM formula', () => {
    it('should calculate price impact correctly for different trade sizes', () => {
      // For constant product AMM (x * y = k), we can calculate the expected price impact
      // Starting with reserves: x = 1000 ETH, y = 10,000,000 GOATAI
      // The token price would be y/x = 10,000 GOATAI per ETH

      // Mock the token price from pool
      mockUseTokenPriceFromPool.mockReturnValue({
        isError: false,
        loading: false,
        pairAddress: '0xmockPairAddress',
        tokenAPrice: 10000, // 1 ETH = 10000 GOATAI
        tokenBPrice: 0.0001, // 1 GOATAI = 0.0001 ETH
      });

      // Test different trade sizes to verify price impact calculation

      // Small trade (0.1 ETH) - Should have small price impact ~1%
      {
        const selectedTokens = {
          [SwapMode.BUY]: GOATAI_TOKEN,
          [SwapMode.SELL]: NATIVE_TOKEN,
        };

        // For an AMM with x = 1000 ETH, y = 10M GOATAI:
        // For 0.1 ETH input, the output would be:
        // dy = y * dx / (x + dx) = 10M * 0.1 / (1000 + 0.1) ≈ 999.9 GOATAI
        // The effective rate: 999.9 / 0.1 = 9999 GOATAI per ETH
        // The price impact: (10000 - 9999) / 10000 * 100 ≈ 0.01%
        const swapAmounts = {
          [SwapMode.BUY]: {
            displayValue: '999.9',
            rawValue: parseUnits('999.9', GOATAI_TOKEN.decimals),
          },
          [SwapMode.SELL]: {
            displayValue: '0.1',
            rawValue: parseUnits('0.1', NATIVE_TOKEN.decimals),
          },
        };

        const result = useTradeInfo({ selectedTokens, swapAmounts });
        expect(result.rate).toBeCloseTo(9999);
        expect(result.priceImpact).toBeCloseTo(0.01);
      }

      // Medium trade (10 ETH) - Should have moderate price impact ~1%
      {
        const selectedTokens = {
          [SwapMode.BUY]: GOATAI_TOKEN,
          [SwapMode.SELL]: NATIVE_TOKEN,
        };

        // For an AMM with x = 1000 ETH, y = 10M GOATAI:
        // For 10 ETH input, the output would be:
        // dy = y * dx / (x + dx) = 10M * 10 / (1000 + 10) ≈ 99009.9 GOATAI
        // The effective rate: 99009.9 / 10 = 9900.99 GOATAI per ETH
        // The price impact: (10000 - 9900.99) / 10000 * 100 ≈ 0.99%
        const swapAmounts = {
          [SwapMode.BUY]: {
            displayValue: '99009.9',
            rawValue: parseUnits('99009.9', GOATAI_TOKEN.decimals),
          },
          [SwapMode.SELL]: {
            displayValue: '10',
            rawValue: parseUnits('10', NATIVE_TOKEN.decimals),
          },
        };

        const result = useTradeInfo({ selectedTokens, swapAmounts });
        expect(result.rate).toBeCloseTo(9900.99);
        expect(result.priceImpact).toBeCloseTo(0.99);
      }

      // Large trade (100 ETH) - Should have significant price impact ~9.1%
      {
        const selectedTokens = {
          [SwapMode.BUY]: GOATAI_TOKEN,
          [SwapMode.SELL]: NATIVE_TOKEN,
        };

        // For an AMM with x = 1000 ETH, y = 10M GOATAI:
        // For 100 ETH input, the output would be:
        // dy = y * dx / (x + dx) = 10M * 100 / (1000 + 100) ≈ 909090.9 GOATAI
        // The effective rate: 909090.9 / 100 = 9090.91 GOATAI per ETH
        // The price impact: (10000 - 9090.91) / 10000 * 100 ≈ 9.09%
        const swapAmounts = {
          [SwapMode.BUY]: {
            displayValue: '909090.9',
            rawValue: parseUnits('909090.9', GOATAI_TOKEN.decimals),
          },
          [SwapMode.SELL]: {
            displayValue: '100',
            rawValue: parseUnits('100', NATIVE_TOKEN.decimals),
          },
        };

        const result = useTradeInfo({ selectedTokens, swapAmounts });
        expect(result.rate).toBeCloseTo(9090.91);
        expect(result.priceImpact).toBeCloseTo(9.09);
      }
    });
  });
});
