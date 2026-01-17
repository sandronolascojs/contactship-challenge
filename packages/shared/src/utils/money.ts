import { Currency } from '@contactship/types';

export interface FormatMoneyOptions {
  currency?: Currency;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatMoneyFromCents(
  amountInCents: number,
  {
    currency = Currency.USD,
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
  }: FormatMoneyOptions = {},
): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}
