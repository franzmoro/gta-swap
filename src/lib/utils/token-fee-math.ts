const TAX_PERCENTAGE = 0.06; // 6%
const TRADE_FEE = 0.003; // 0.30%

export class TokenFeeMath {
  static calculateTradeFee(amount: bigint, isPlatformToken?: boolean): bigint {
    let amountWithTax = amount;
    // if platform token, we need to get the amount after tax
    if (isPlatformToken) {
      amountWithTax = TokenFeeMath.getTokenAfterTax(amount);
    }
    return (amountWithTax * BigInt(TRADE_FEE * 1000)) / BigInt(1000);
  }

  static getMinAmountReceived(amount: bigint, slippage: number): bigint {
    const slippageInRaw = slippage / 100;
    return (amount * BigInt((1 - slippageInRaw) * 1000)) / BigInt(1000);
  }

  static getTaxOnToken(amount: bigint, isSellToken?: boolean) {
    if (isSellToken) {
      // Selling: Fee is deducted from amountIn
      const amountWithFee = TokenFeeMath.getTokenAfterTax(amount);
      const fee = amount - amountWithFee;
      return fee;
    } else {
      // Buying: Fee is added to amountOut
      const amountReceived = TokenFeeMath.getTokenWithTax(amount);
      const fee = amountReceived - amount;
      return fee;
    }
  }

  // Fee is deducted from amount
  static getTokenAfterTax(amount: bigint) {
    return (amount * BigInt((1 - TAX_PERCENTAGE) * 1000)) / BigInt(1000); // 1000 is for not loosing floating point precision
  }

  // Fee is added to amount
  static getTokenWithTax(amount: bigint) {
    return (amount * BigInt(1000)) / BigInt((1 - TAX_PERCENTAGE) * 1000);
  }
}
