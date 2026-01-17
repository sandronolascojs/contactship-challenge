/**
 * Date and Time Utilities
 *
 * Centralizes all date, time, and timezone-related utilities
 * Provides consistent date formatting, calculations, and timezone handling
 */

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  format,
  formatDistance as formatDistanceFns,
  startOfDay,
  type Locale,
} from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { enUS, es } from 'date-fns/locale';

// ============================================================================
// Types and Constants
// ============================================================================

export type SupportedDateLocale = 'en' | 'es';

const LOCALE_MAP: Record<SupportedDateLocale, Locale> = {
  en: enUS,
  es: es,
};

const READABLE_FORMAT_BY_LOCALE: Record<SupportedDateLocale, string> = {
  en: 'MMM d, yyyy',
  es: "d 'de' MMM, yyyy",
};

/**
 * Translation keys interface for time distance formatting
 * Allows different apps to provide their own translation functions
 */
export interface TimeDistanceTranslations {
  justNow: string;
  minuteAgo: (count: number) => string;
  minutesAgo: (count: number) => string;
  hourAgo: (count: number) => string;
  hoursAgo: (count: number) => string;
  dayAgo: (count: number) => string;
  daysAgo: (count: number) => string;
  weekAgo: (count: number) => string;
  weeksAgo: (count: number) => string;
  monthAgo: (count: number) => string;
  monthsAgo: (count: number) => string;
  yearAgo: (count: number) => string;
  yearsAgo: (count: number) => string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function toSafeDate(input?: string | Date): Date {
  const candidate = input instanceof Date ? input : input ? new Date(input) : new Date();
  return isNaN(candidate.getTime()) ? new Date() : candidate;
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Formats an ISO string (or Date) into a human-readable date (e.g., Sep 13, 2025).
 * Falls back to current date if input is undefined/invalid to keep previews stable.
 */
export function fromIsoToReadableDate(input?: string | Date, locale?: SupportedDateLocale): string {
  const date = toSafeDate(input);
  if (!locale) return format(date, 'PP');
  return format(date, READABLE_FORMAT_BY_LOCALE[locale], { locale: LOCALE_MAP[locale] });
}

/**
 * Short numeric date format (e.g., 09/13/2025)
 */
export function fromIsoToShortDate(input?: string | Date, locale?: SupportedDateLocale): string {
  const date = toSafeDate(input);
  if (!locale) return format(date, 'P');
  return format(date, 'P', { locale: LOCALE_MAP[locale] });
}

/**
 * Format date to ISO date key format (yyyy-MM-dd)
 * Useful for date keys, comparisons, and calendar components
 */
export function formatToDateKey(input?: string | Date): string {
  const date = toSafeDate(input);
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format date to long readable format (e.g., "September 13, 2025" or "13 de septiembre, 2025")
 * Uses date-fns PPP format with locale support
 */
export function formatToLongDate(input?: string | Date, locale?: SupportedDateLocale): string {
  const date = toSafeDate(input);
  if (!locale) return format(date, 'PPP');
  return format(date, 'PPP', { locale: LOCALE_MAP[locale] });
}

/**
 * Format date to month and year (e.g., "September 2025" or "septiembre 2025")
 */
export function formatToMonthYear(input?: string | Date, locale?: SupportedDateLocale): string {
  const date = toSafeDate(input);
  if (!locale) return format(date, 'MMMM yyyy');
  return format(date, 'MMMM yyyy', { locale: LOCALE_MAP[locale] });
}

/**
 * Format date to time (e.g., "3:45 PM" or "15:45")
 * Uses 12-hour format with AM/PM
 */
export function formatToTime(input?: string | Date, locale?: SupportedDateLocale): string {
  const date = toSafeDate(input);
  if (!locale) return format(date, 'h:mm a');
  return format(date, 'h:mm a', { locale: LOCALE_MAP[locale] });
}

/**
 * Format date with custom format string
 * Allows flexible date formatting with locale support
 */
export function formatDate(
  input: string | Date | undefined,
  formatStr = 'PP',
  locale?: SupportedDateLocale,
): string {
  const date = toSafeDate(input);
  if (!locale) return format(date, formatStr);
  return format(date, formatStr, { locale: LOCALE_MAP[locale] });
}

/**
 * Get locale object for date-fns based on supported locale
 */
export function getDateFnsLocale(locale?: SupportedDateLocale): Locale {
  if (!locale) return enUS;
  return LOCALE_MAP[locale];
}

// ============================================================================
// Time Calculations
// ============================================================================

/**
 * Calculate minutes and seconds from total seconds
 * @param totalSeconds - Total seconds to convert
 * @returns Object with minutes and seconds
 */
export const calculateMinutesAndSeconds = (
  totalSeconds: number,
): {
  minutes: number;
  seconds: number;
} => {
  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
};

/**
 * Calculate billed minutes from seconds (rounds up to next minute)
 * @param seconds - Duration in seconds
 * @returns Billed minutes (rounded up)
 */
export const calculateBilledMinutes = (seconds: number): number => {
  return Math.ceil(seconds / 60);
};

/**
 * Calculate billed seconds from duration (rounds up to next minute)
 * @param durationSeconds - Actual duration in seconds
 * @returns Billed seconds (rounded up to next minute)
 */
export const calculateBilledSeconds = (durationSeconds: number): number => {
  return calculateBilledMinutes(durationSeconds) * 60;
};

/**
 * Format seconds into a human-readable string
 * @param totalSeconds - Total seconds to format
 * @param showSeconds - Whether to show seconds (default: true)
 * @returns Formatted string (e.g., "5m 30s" or "5m")
 */
export const formatTimeFromSeconds = (totalSeconds: number, showSeconds = true): string => {
  const { minutes, seconds } = calculateMinutesAndSeconds(totalSeconds);

  if (showSeconds && seconds > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${minutes}m`;
};

/**
 * Calculate percentage of remaining time
 * @param availableSeconds - Available seconds
 * @param assignedSeconds - Total assigned seconds
 * @returns Percentage (0-100)
 */
export const calculateRemainingPercentage = (
  availableSeconds: number,
  assignedSeconds: number,
): number => {
  if (assignedSeconds <= 0) return 0;
  return Math.round((availableSeconds / assignedSeconds) * 100);
};

/**
 * Calculate percentage of used time
 * @param availableSeconds - Available seconds
 * @param assignedSeconds - Total assigned seconds
 * @returns Percentage (0-100)
 */
export const calculateUsedPercentage = (
  availableSeconds: number,
  assignedSeconds: number,
): number => {
  return 100 - calculateRemainingPercentage(availableSeconds, assignedSeconds);
};

/**
 * Format distance to now using date-fns calculations
 * This provides more accurate time calculations than manual implementation
 * @param date - The date to calculate distance from
 * @param translations - Translation functions for time units
 * @returns Formatted time distance string (e.g., "5 minutes ago", "2 hours ago")
 */
export function formatDistanceToNow(date: Date, translations: TimeDistanceTranslations): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle "just now" case (less than 60 seconds)
  if (diffInSeconds < 60) {
    return translations.justNow;
  }

  // Use date-fns for accurate calculations
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);
  const years = differenceInYears(now, date);

  // Time unit configuration map
  type TimeUnitConfig = {
    condition: boolean;
    value: number;
    singularFn: (count: number) => string;
    pluralFn: (count: number) => string;
  };

  const defaultUnit: TimeUnitConfig = {
    condition: true,
    value: years,
    singularFn: translations.yearAgo,
    pluralFn: translations.yearsAgo,
  };

  const timeUnits: TimeUnitConfig[] = [
    {
      condition: minutes < 60,
      value: minutes,
      singularFn: translations.minuteAgo,
      pluralFn: translations.minutesAgo,
    },
    {
      condition: hours < 24,
      value: hours,
      singularFn: translations.hourAgo,
      pluralFn: translations.hoursAgo,
    },
    {
      condition: days < 7,
      value: days,
      singularFn: translations.dayAgo,
      pluralFn: translations.daysAgo,
    },
    {
      condition: weeks < 4,
      value: weeks,
      singularFn: translations.weekAgo,
      pluralFn: translations.weeksAgo,
    },
    {
      condition: months < 12,
      value: months,
      singularFn: translations.monthAgo,
      pluralFn: translations.monthsAgo,
    },
    defaultUnit,
  ];

  // Find the first matching time unit (always has a match due to defaultUnit)
  const matchedUnit = timeUnits.find((unit) => unit.condition) ?? defaultUnit;

  return matchedUnit.value === 1
    ? matchedUnit.singularFn(matchedUnit.value)
    : matchedUnit.pluralFn(matchedUnit.value);
}

/**
 * Format distance between two dates using date-fns
 * Useful for comparing two dates that aren't relative to now
 * @param dateLeft - First date
 * @param dateRight - Second date
 * @param options - Formatting options
 * @returns Formatted distance string
 */
export function formatDistance(
  dateLeft: Date,
  dateRight: Date,
  options?: { addSuffix?: boolean },
): string {
  return formatDistanceFns(dateLeft, dateRight, {
    addSuffix: options?.addSuffix,
  });
}

/**
 * Format time using date-fns with locale support
 * Provides locale-aware time formatting (e.g., "3:45 PM")
 * @param date - Date to format
 * @param locale - User locale ('en' | 'es')
 * @returns Formatted time string
 */
export function formatTime(date: Date, locale?: SupportedDateLocale): string {
  return formatToTime(date, locale);
}

// ============================================================================
// Timezone Utilities
// ============================================================================

/**
 * Get start of day in a specific timezone
 *
 * @param date - Date to convert (in UTC)
 * @param timezone - User's timezone (IANA string)
 * @returns Date object representing start of day in the specified timezone (in UTC)
 */
export function getStartOfDayInTimezone(date: Date, timezone: string): Date {
  // Convert UTC date to user's timezone
  const zonedDate = toZonedTime(date, timezone);

  // Get start of day in user's timezone
  const startOfDayZoned = startOfDay(zonedDate);

  // Convert back to UTC
  return fromZonedTime(startOfDayZoned, timezone);
}

/**
 * Get date string (YYYY-MM-DD) in a specific timezone
 *
 * @param date - Date to convert (in UTC)
 * @param timezone - User's timezone (IANA string)
 * @returns Date string in YYYY-MM-DD format in the specified timezone
 */
export function getDateStringInTimezone(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
}

/**
 * Calculate days difference between two dates in a specific timezone
 *
 * @param date1 - First date (in UTC)
 * @param date2 - Second date (in UTC)
 * @param timezone - Timezone to use for calculation (IANA string)
 * @returns Number of days difference
 */
export function getDaysDifferenceInTimezone(date1: Date, date2: Date, timezone: string): number {
  // Convert both dates to user's timezone and get start of day
  const start1 = getStartOfDayInTimezone(date1, timezone);
  const start2 = getStartOfDayInTimezone(date2, timezone);

  // Calculate difference in days
  return differenceInDays(start2, start1);
}
