const TAX_PERCENTAGE = 0.06; // 6%
const TRADE_FEE = 0.003; // 0.30%

/**
 * Utility class for calculating token fees, taxes, and slippage for trading operations
 */
export class TokenFeeMath {
  /**
   * Calculate the trade fee for a given amount
   * @param amount - The amount to calculate the fee for
   * @param isPlatformToken - Whether the token is the platform token (GOATAI token)
   * @returns The trade fee for the given amount
   */
  static calculateTradeFee(amount: bigint, isPlatformToken?: boolean): bigint {
    let amountWithTax = amount;
    // if platform token, we need to get the amount after tax
    if (isPlatformToken) {
      amountWithTax = TokenFeeMath.getTokenAfterTax(amount);
    }
    // calculate the trade fee
    return (amountWithTax * BigInt(TRADE_FEE * 1000)) / BigInt(1000);
  }

  /**
   * Calculate the minimum amount received after applying slippage
   * @param amount - The amount to calculate the minimum amount received for
   * @param slippage - The slippage percentage
   * @returns The minimum amount received after applying slippage
   */
  static getMinAmountReceived(amount: bigint, slippage: number): bigint {
    // Convert slippage from percentage to decimal (e.g., 0.5% -> 0.005)
    const slippageInRaw = slippage / 100;
    return (amount * BigInt((1 - slippageInRaw) * 1000)) / BigInt(1000);
  }

  /**
   * Calculate the tax on the token
   * @param amount - The amount to calculate the tax for
   * @param isSellToken - Whether the token is being sold
   * @returns The tax on the token
   */
  static getTaxOnToken(amount: bigint, isSellToken?: boolean) {
    if (isSellToken) {
      // Selling: Fee is deducted from amountIn; as amountIn is with tax
      const amountWithFee = TokenFeeMath.getTokenAfterTax(amount);
      const fee = amount - amountWithFee;
      return fee;
    } else {
      // Buying: Fee is added to amountOut; as amountOut is without tax
      const amountReceived = TokenFeeMath.getTokenWithTax(amount);
      const fee = amountReceived - amount;
      return fee;
    }
  }

  /**
   * Calculate the amount of token adding tax to the amount
   * @param amount - The amount to calculate the amount after tax for
   * @returns The amount of token after tax
   */
  static getTokenAfterTax(amount: bigint) {
    return (amount * BigInt((1 - TAX_PERCENTAGE) * 1000)) / BigInt(1000); // 1000 is for not loosing floating point precision
  }

  /**
   * Calculate the amount of token subtracting tax from the amount
   * @param amount - The amount to calculate the amount with tax for
   * @returns The amount of token with tax
   */
  static getTokenWithTax(amount: bigint) {
    return (amount * BigInt(1000)) / BigInt((1 - TAX_PERCENTAGE) * 1000);
  }
}
