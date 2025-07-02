import { format, Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
// Removed other locale imports as we're only supporting English now
// import { es } from 'date-fns/locale/es';
// import { el } from 'date-fns/locale/el';

// Removed i18n import
// import i18n from '../i18n';

/**
 * Maps i18next language codes to date-fns locale objects
 * This map is now simplified to only include enUS as we're removing i18n.
 */
const localeMap: Record<string, Locale> = {
  en: enUS,
  // Removed other language mappings
  // es: es,
  // el: el,
};

/**
 * Returns the date-fns locale object.
 * Always returns enUS as i18next is removed.
 */
export const getCurrentLocale = (): Locale => {
  // Since i18n is removed, we always use English
  return enUS;
};

/**
 * Formats a date using the current locale (always English now).
 *
 * @param date - The date to format
 * @param formatStr - The format string (https://date-fns.org/v2.29.3/docs/format)
 * @returns The formatted date string
 */
export const formatLocalizedDate = (date: Date | number, formatStr: string): string => {
  return format(date, formatStr, {
    locale: getCurrentLocale(),
  });
};

/**
 * Gets the date format pattern.
 * Since translation files are removed, this will always return the fallback.
 *
 * @param formatKey - The key for the format (no longer used for lookup)
 * @param fallback - Fallback format to use
 * @returns The format pattern string (always the fallback now)
 */
export const getDateFormatPattern = (formatKey: string, fallback: string): string => {
  // Since i18n.t is removed, we always return the fallback pattern
  return fallback;
};

/**
 * Formats a date in a long readable format.
 * Example: "Monday, January 1, 2023" (in English)
 *
 * @param date - The date to format
 * @returns The formatted date string
 */
export const formatLongDate = (date: Date | number): string => {
  // Using a fixed English format, as translation keys are removed
  return formatLocalizedDate(date, 'EEEE, MMMM d, yyyy');
};

/**
 * Formats a date in a short format.
 * Example: "Jan 1, 2023" (in English)
 *
 * @param date - The date to format
 * @returns The formatted date string
 */
export const formatShortDate = (date: Date | number): string => {
  // Using a fixed English format
  return formatLocalizedDate(date, 'MMM d, yyyy');
};

/**
 * Formats a date to show only month and year.
 * Example: "January 2023" (in English)
 *
 * @param date - The date to format
 * @returns The formatted date string
 */
export const formatMonthYear = (date: Date | number): string => {
  // Using a fixed English format
  return formatLocalizedDate(date, 'MMMM yyyy');
};

/**
 * Formats a date to show only day and month.
 * Example: "January 1" (in English)
 *
 * @param date - The date to format
 * @returns The formatted date string
 */
export const formatDayMonth = (date: Date | number): string => {
  // Using a fixed English format
  return formatLocalizedDate(date, 'MMMM d');
};

/**
 * Formats a date to show only time.
 * Example: "3:30 PM" (in English)
 *
 * @param date - The date to format
 * @returns The formatted time string
 */
export const formatTime = (date: Date | number): string => {
  // Using a fixed English format
  return formatLocalizedDate(date, 'h:mm a');
};

/**
 * Formats a date to show date and time.
 * Example: "Jan 1, 2023 3:30 PM" (in English)
 *
 * @param date - The date to format
 * @returns The formatted date and time string
 */
export const formatDateTime = (date: Date | number): string => {
  // Using a fixed English format
  return formatLocalizedDate(date, 'MMM d, yyyy h:mm a');
};

/**
 * Checks if a task in today plan has been there for more than a day (likely overdue)
 *
 * @param task - The task to check
 * @returns True if the task is likely overdue in today plan, false otherwise
 */
export const isTaskOverdue = (task: { today?: boolean; created_at?: string; today_move_count?: number; status: string | number; completed_at?: string }): boolean => {
  // If task is not in today plan, it's not overdue
  if (!task.today) {
    return false;
  }

  // Only hide overdue badge if task is actually completed (done/archived), not just in progress
  if (task.completed_at || task.status === 'done' || task.status === 2 || task.status === 'archived' || task.status === 3) {
    return false;
  }

  // If task has been moved to today multiple times, it's likely been sitting around
  if (task.today_move_count && task.today_move_count > 1) {
    return true;
  }

  // If no creation date, can't determine if overdue
  if (!task.created_at) {
    return false;
  }

  const createdDate = new Date(task.created_at);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999); // End of yesterday

  // Task is likely overdue if created before end of yesterday and is in today plan
  // This is an approximation - tasks created yesterday or earlier that are in today plan
  // are likely to have been sitting there for a while
  return createdDate.getTime() < yesterday.getTime();
};