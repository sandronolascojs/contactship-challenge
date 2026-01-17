export interface FormatMoneyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatMoneyFromCents(
  amountInCents: number,
  {
    currency = 'USD',
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
  }: FormatMoneyOptions = {},
): string {
  const amount = amountInCents / 100;

  return new Intl.NumberFormat(locale ?? undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}
