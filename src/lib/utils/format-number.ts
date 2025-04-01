import { DEFAULT_LOCALE } from '@/constants';

type NumberFormatOptions = Intl.NumberFormatOptions;

const FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN: NumberFormatOptions = {
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
  notation: 'standard',
};

const FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN_NO_COMMAS: NumberFormatOptions = {
  maximumFractionDigits: 5,
  minimumFractionDigits: 2,
  notation: 'standard',
  useGrouping: false,
};

const NO_DECIMALS: NumberFormatOptions = {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  notation: 'standard',
};

const NO_DECIMALS_CURRENCY: NumberFormatOptions = {
  currency: 'USD',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  notation: 'standard',
  style: 'currency',
};

const THREE_DECIMALS: NumberFormatOptions = {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
  notation: 'standard',
};

const TWO_DECIMALS: NumberFormatOptions = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  notation: 'standard',
};

const TWO_DECIMALS_CURRENCY: NumberFormatOptions = {
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  notation: 'standard',
  style: 'currency',
};

const SHORTHAND_TWO_DECIMALS: NumberFormatOptions = {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  notation: 'compact',
};

const SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS: NumberFormatOptions = {
  maximumFractionDigits: 2,
  notation: 'compact',
};

const SHORTHAND_CURRENCY_TWO_DECIMALS: NumberFormatOptions = {
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  notation: 'compact',
  style: 'currency',
};

const SIX_SIG_FIGS_TWO_DECIMALS: NumberFormatOptions = {
  maximumFractionDigits: 2,
  maximumSignificantDigits: 6,
  minimumFractionDigits: 2,
  minimumSignificantDigits: 3,
  notation: 'standard',
};

const SIX_SIG_FIGS_NO_COMMAS: NumberFormatOptions = {
  maximumSignificantDigits: 6,
  notation: 'standard',
  useGrouping: false,
};

const SIX_SIG_FIGS_TWO_DECIMALS_NO_COMMAS: NumberFormatOptions = {
  maximumFractionDigits: 2,
  maximumSignificantDigits: 6,
  minimumFractionDigits: 2,
  minimumSignificantDigits: 3,
  notation: 'standard',
  useGrouping: false,
};

const ONE_SIG_FIG_CURRENCY: NumberFormatOptions = {
  currency: 'USD',
  maximumSignificantDigits: 1,
  minimumSignificantDigits: 1,
  notation: 'standard',
  style: 'currency',
};

const THREE_SIG_FIGS_CURRENCY: NumberFormatOptions = {
  currency: 'USD',
  maximumSignificantDigits: 3,
  minimumSignificantDigits: 3,
  notation: 'standard',
  style: 'currency',
};

const SEVEN_SIG_FIGS__SCI_NOTATION_CURRENCY: NumberFormatOptions = {
  currency: 'USD',
  maximumSignificantDigits: 7,
  minimumSignificantDigits: 7,
  notation: 'scientific',
  style: 'currency',
};

type FormatterBaseRule = { formatterOptions: NumberFormatOptions };

type FormatterExactRule = { exact: number; upperBound?: undefined } & FormatterBaseRule;
type FormatterRule = { hardCodedInput?: HardCodedInputFormat } & (
  | FormatterExactRule
  | FormatterUpperBoundRule
);
type FormatterUpperBoundRule = { exact?: undefined; upperBound: number } & FormatterBaseRule;

// each rule must contain either an `upperBound` or an `exact` value.
// upperBound => number will use that formatter as long as it is < upperBound
// exact => number will use that formatter if it is === exact
// if hardcoded input is supplied it will override the input value or use the hardcoded output
type HardCodedInputFormat =
  | {
      hardcodedOutput: string;
      input?: undefined;
      prefix?: undefined;
    }
  | {
      hardcodedOutput?: undefined;
      input: number;
      prefix?: string;
    };

// these formatter objects dictate which formatter rule to use based on the interval that
// the number falls into. for example, based on the rule set below, if your number
// falls between 1 and 1e6, you'd use TWO_DECIMALS as the formatter.
const tokenNonTxFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  {
    formatterOptions: THREE_DECIMALS,
    hardCodedInput: { input: 0.001, prefix: '<' },
    upperBound: 0.001,
  },
  { formatterOptions: THREE_DECIMALS, upperBound: 1 },
  { formatterOptions: TWO_DECIMALS, upperBound: 1e6 },
  { formatterOptions: SHORTHAND_TWO_DECIMALS, upperBound: 1e15 },
  {
    formatterOptions: SHORTHAND_TWO_DECIMALS_NO_TRAILING_ZEROS,
    hardCodedInput: { input: 999_000_000_000_000, prefix: '>' },
    upperBound: Infinity,
  },
];

const tokenTxFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  {
    formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN,
    hardCodedInput: { input: 0.00001, prefix: '<' },
    upperBound: 0.00001,
  },
  { formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN, upperBound: 1 },
  { formatterOptions: SIX_SIG_FIGS_TWO_DECIMALS, upperBound: 10000 },
  { formatterOptions: TWO_DECIMALS, upperBound: Infinity },
];

const swapTradeAmountFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  { formatterOptions: SIX_SIG_FIGS_NO_COMMAS, upperBound: 0.1 },
  { formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN_NO_COMMAS, upperBound: 1 },
  { formatterOptions: SIX_SIG_FIGS_TWO_DECIMALS_NO_COMMAS, upperBound: Infinity },
];

const swapDetailsAmountFormatter: FormatterRule[] = [
  { formatterOptions: SIX_SIG_FIGS_NO_COMMAS, upperBound: Infinity },
];

const swapPriceFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS },
  {
    formatterOptions: FIVE_DECIMALS_MAX_TWO_DECIMALS_MIN,
    hardCodedInput: { input: 0.00001, prefix: '<' },
    upperBound: 0.00001,
  },
  ...swapTradeAmountFormatter,
];

const fiatTokenPricesFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: TWO_DECIMALS_CURRENCY },
  {
    formatterOptions: ONE_SIG_FIG_CURRENCY,
    hardCodedInput: { input: 0.00000001, prefix: '<' },
    upperBound: 0.00000001,
  },
  { formatterOptions: THREE_SIG_FIGS_CURRENCY, upperBound: 1 },
  { formatterOptions: TWO_DECIMALS_CURRENCY, upperBound: 1e6 },
  { formatterOptions: SHORTHAND_CURRENCY_TWO_DECIMALS, upperBound: 1e16 },
  { formatterOptions: SEVEN_SIG_FIGS__SCI_NOTATION_CURRENCY, upperBound: Infinity },
];

const fiatGasPriceFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: NO_DECIMALS_CURRENCY },
  {
    formatterOptions: TWO_DECIMALS_CURRENCY,
    hardCodedInput: { input: 0.01, prefix: '<' },
    upperBound: 0.01,
  },
  { formatterOptions: TWO_DECIMALS_CURRENCY, upperBound: 1e6 },
  { formatterOptions: SHORTHAND_CURRENCY_TWO_DECIMALS, upperBound: Infinity },
];

const portfolioBalanceFormatter: FormatterRule[] = [
  { exact: 0, formatterOptions: TWO_DECIMALS_CURRENCY },
  { formatterOptions: TWO_DECIMALS_CURRENCY, upperBound: Infinity },
];

const wholeNumberFormatter: FormatterRule[] = [
  { formatterOptions: NO_DECIMALS, upperBound: Infinity },
];

export enum NumberType {
  // fiat gas prices
  FiatGasPrice = 'fiat-gas-price',

  // fiat prices everywhere except Token Details flow
  FiatTokenPrice = 'fiat-token-price',

  // portfolio balance
  PortfolioBalance = 'portfolio-balance',

  SwapDetailsAmount = 'swap-details-amount',

  // this formatter is used for displaying swap price conversions
  // below the input/output amounts
  SwapPrice = 'swap-price',

  // this formatter is only used for displaying the swap trade output amount
  // in the text input boxes. Output amounts on review screen should use the above TokenTx formatter
  SwapTradeAmount = 'swap-trade-amount',

  // used for token quantities in non-transaction contexts (e.g. portfolio balances)
  TokenNonTx = 'token-non-tx',

  // used for token quantities in transaction contexts (e.g. swap, send)
  TokenTx = 'token-tx',

  // whole number formatting
  WholeNumber = 'whole-number',
}

type FormatterType = FormatterRule[] | NumberType;
const TYPE_TO_FORMATTER_RULES = {
  [NumberType.FiatGasPrice]: fiatGasPriceFormatter,
  [NumberType.FiatTokenPrice]: fiatTokenPricesFormatter,
  [NumberType.PortfolioBalance]: portfolioBalanceFormatter,
  [NumberType.SwapDetailsAmount]: swapDetailsAmountFormatter,
  [NumberType.SwapPrice]: swapPriceFormatter,
  [NumberType.SwapTradeAmount]: swapTradeAmountFormatter,
  [NumberType.TokenNonTx]: tokenNonTxFormatter,
  [NumberType.TokenTx]: tokenTxFormatter,
  [NumberType.WholeNumber]: wholeNumberFormatter,
};

interface FormatCurrencyAmountOptions {
  amount?: number;
  conversionRate?: number;
  placeholder?: string;
  type?: FormatterType;
}

interface FormatFiatPriceOptions {
  conversionRate?: number;
  price?: number;
  type?: FormatterType;
}

interface FormatNumberOptions {
  conversionRate?: number;
  forceShowCurrencySymbol?: boolean;
  input?: number;
  placeholder?: string;
  suffix?: string;
  type?: FormatterType;
}

interface FormatNumberOrStringOptions {
  conversionRate?: number;
  input?: number | string;
  placeholder?: string;
  suffix?: string;
  type: FormatterType;
}

interface FormatPriceOptions {
  conversionRate?: number;
  price?: number;
  type?: FormatterType;
}

export function formatCurrencyAmount({
  amount,
  conversionRate,
  placeholder,
  type = NumberType.TokenNonTx,
}: FormatCurrencyAmountOptions): string {
  return formatNumber({
    conversionRate,
    input: amount,
    placeholder,
    type,
  });
}

export function formatFiatPrice({
  conversionRate,
  price,
  type = NumberType.FiatTokenPrice,
}: FormatFiatPriceOptions): string {
  return formatNumberOrString({ conversionRate, input: price, type });
}

export function formatNumber({
  conversionRate,
  forceShowCurrencySymbol = false,
  input,
  placeholder = '-',
  suffix = '',
  type = NumberType.TokenNonTx,
}: FormatNumberOptions): string {
  if (input === null || input === undefined) {
    if (forceShowCurrencySymbol) {
      const parts = new Intl.NumberFormat(DEFAULT_LOCALE, {
        currency: 'USD',
        style: 'currency',
      }).formatToParts(0);
      const currencySymbol = parts.find((part) => part.type === 'currency')?.value;
      const isSymbolBeforeNumber = parts[0].type === 'currency';

      return isSymbolBeforeNumber ?
          `${currencySymbol}${placeholder}`
        : `${placeholder}${currencySymbol}`;
    }

    return placeholder;
  }

  const { formatterOptions, hardCodedInput } = getFormatterRule(input, type, conversionRate);

  if (formatterOptions.currency) {
    input = conversionRate ? input * conversionRate : input;
    formatterOptions.currency = 'USD';
  }

  if (!hardCodedInput) {
    return `${new Intl.NumberFormat(DEFAULT_LOCALE, formatterOptions).format(input)} ${suffix}`;
  }

  if (hardCodedInput.hardcodedOutput) {
    return `${hardCodedInput.hardcodedOutput} ${suffix}`;
  }

  const { input: hardCodedInputValue, prefix } = hardCodedInput;
  if (hardCodedInputValue === undefined) {
    return placeholder;
  }
  return (
    (prefix ?? '') +
    new Intl.NumberFormat(DEFAULT_LOCALE, formatterOptions).format(hardCodedInputValue) +
    suffix
  );
}

export function formatNumberOrString({
  conversionRate,
  input,
  placeholder = '-',
  suffix,
  type,
}: FormatNumberOrStringOptions): string {
  if (input === null || input === undefined) {
    return placeholder;
  }
  if (typeof input === 'string') {
    return formatNumber({ conversionRate, input: parseFloat(input), placeholder, suffix, type });
  }
  return formatNumber({ conversionRate, input, placeholder, suffix, type });
}

export function formatPercent(percent?: number | undefined, maxDecimals = 3) {
  if (!percent) {
    return '-';
  }

  return `${Number(percent.toFixed(maxDecimals)).toLocaleString(DEFAULT_LOCALE, {
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  })}%`;
}

export function formatPrice({
  conversionRate,
  price,
  type = NumberType.FiatTokenPrice,
}: FormatPriceOptions): string {
  if (price === null || price === undefined) {
    return '-';
  }

  return formatNumber({
    conversionRate,
    input: price,
    type,
  });
}

function getFormatterRule(
  input: number,
  type: FormatterType,
  conversionRate?: number
): FormatterRule {
  const rules = Array.isArray(type) ? type : TYPE_TO_FORMATTER_RULES[type];
  for (const rule of rules) {
    const shouldConvertInput = rule.formatterOptions.currency && conversionRate;
    const convertedInput = shouldConvertInput ? input * conversionRate : input;

    if (
      (rule.exact !== undefined && convertedInput === rule.exact) ||
      (rule.upperBound !== undefined && convertedInput < rule.upperBound)
    ) {
      return rule;
    }
  }

  throw new Error(`formatter for type ${type} not configured correctly for value ${input}`);
}

const MAX_AMOUNT_STR_LENGTH = 9;

export function formatReviewSwapCurrencyAmount(amount: number): string {
  let formattedAmount = formatCurrencyAmount({ amount, type: NumberType.TokenTx });
  if (formattedAmount.length > MAX_AMOUNT_STR_LENGTH) {
    formattedAmount = formatCurrencyAmount({ amount, type: NumberType.SwapTradeAmount });
  }
  return formattedAmount;
}
