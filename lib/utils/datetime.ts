import {DateTime} from 'luxon';

export function currentYear(): number {
  return DateTime.now().year;
}

export function nowMillis(): number {
  return DateTime.now().toMillis();
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Ensures at least `minDurationMs` elapsed since `startedAtMs`.
 * Useful for keeping UI loading states visible for a minimum time.
 */
export async function ensureMinDuration(startedAtMs: number): Promise<void> {
  const minDurationMs = 400;
  const elapsed = nowMillis() - startedAtMs;
  const remaining = minDurationMs - elapsed;
  if (remaining > 0) await sleep(remaining);
}

/**
 * Database data types:
 * - date: string in 'YYYY-MM-DD' format (e.g. '2024-03-15')
 * - time: string in 'HH:mm:ss' or 'HH:mm:ss.sss' format (e.g. '14:30:00')
 * - timestamp: Date object
 */

/**
 * Combines date and time strings from database into Luxon DateTime object
 * @throws {Error} If dateStr or combined format is not a valid ISO string
 */
export function combineDateAndTime(
  dateStr: string | null | undefined,
  timeStr: string | null | undefined,
): DateTime | null {
  if (!dateStr) return null;

  if (!timeStr) {
    // If only date without time, return DateTime at start of day
    const dt = DateTime.fromISO(dateStr).startOf('day');
    if (!dt.isValid) {
      throw new Error(`Invalid date string from database: "${dateStr}"`);
    }
    return dt;
  }

  // Combine date and time into format that Luxon understands
  const combined = `${dateStr}T${timeStr}`;
  const dt = DateTime.fromISO(combined);
  if (!dt.isValid) {
    throw new Error(
      `Invalid date/time combination from database: date="${dateStr}", time="${timeStr}"`,
    );
  }
  return dt;
}

/**
 * Converts date string from database to Luxon DateTime (start of day)
 * @throws {Error} If dateStr is not a valid ISO date string
 */
export function dateFromDB(
  dateStr: string | null | undefined,
): DateTime | null {
  if (!dateStr) return null;
  const dt = DateTime.fromISO(dateStr).startOf('day');
  if (!dt.isValid) {
    throw new Error(`Invalid date string from database: "${dateStr}"`);
  }
  return dt;
}

/**
 * Converts time string from database to Luxon DateTime (today with given time)
 * Note: Time string doesn't have date information, so it uses current date
 * @throws {Error} If timeStr is not a valid time string
 */
export function timeFromDB(
  timeStr: string | null | undefined,
): DateTime | null {
  if (!timeStr) return null;
  const today = DateTime.now().toISODate();
  const dt = DateTime.fromISO(`${today}T${timeStr}`);
  if (!dt.isValid) {
    throw new Error(`Invalid time string from database: "${timeStr}"`);
  }
  return dt;
}

/**
 * Converts timestamp from database (Date object) to Luxon DateTime
 * @throws {Error} If timestamp is not a valid Date object
 */
export function timestampFromDB(
  timestamp: Date | null | undefined,
): DateTime | null {
  if (!timestamp) return null;
  const dt = DateTime.fromJSDate(timestamp);
  if (!dt.isValid) {
    throw new Error(
      `Invalid timestamp from database: ${timestamp.toISOString()}`,
    );
  }
  return dt;
}

/**
 * Converts Luxon DateTime to date string for database ('YYYY-MM-DD')
 */
export function dateToDB(dt: DateTime | null | undefined): string | null {
  if (!dt || !dt.isValid) return null;
  return dt.toISODate();
}

/**
 * Converts Luxon DateTime to time string for database ('HH:mm:ss')
 */
export function timeToDB(dt: DateTime | null | undefined): string | null {
  if (!dt || !dt.isValid) return null;
  return dt.toFormat('HH:mm:ss');
}

/**
 * Converts Luxon DateTime to Date object for timestamp in database
 */
export function timestampToDB(dt: DateTime | null | undefined): Date | null {
  if (!dt || !dt.isValid) return null;
  return dt.toJSDate();
}

/**
 * Formats date from database into readable format (e.g. "15. března 2024")
 */
export function formatDate(
  dateStr: string | null | undefined,
  format: string = 'd. MMMM yyyy',
  locale: string = 'cs',
): string | null {
  if (!dateStr) return null;
  const dt = DateTime.fromISO(dateStr);
  if (!dt.isValid) return null;
  return dt.setLocale(locale).toFormat(format);
}

/**
 * Formats time from database into readable format (e.g. "14:30")
 */
export function formatTime(
  timeStr: string | null | undefined,
  format: string = 'HH:mm',
): string | null {
  if (!timeStr) return null;
  const dt = timeFromDB(timeStr);
  if (!dt || !dt.isValid) return null;
  return dt.toFormat(format);
}

/**
 * Formats combined date and time from database into readable format
 */
export function formatDateTime(
  dateStr: string | null | undefined,
  timeStr: string | null | undefined,
  format: string = 'd. MMMM yyyy HH:mm',
  locale: string = 'cs',
): string | null {
  const dt = combineDateAndTime(dateStr, timeStr);
  if (!dt || !dt.isValid) return null;
  return dt.setLocale(locale).toFormat(format);
}

/**
 * Checks if date is a valid ISO date string
 */
export function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  return DateTime.fromISO(dateStr).isValid;
}

/**
 * Checks if time is a valid time string
 */
export function isValidTime(timeStr: string | null | undefined): boolean {
  if (!timeStr) return false;
  const today = DateTime.now().toISODate();
  const dt = DateTime.fromISO(`${today}T${timeStr}`);
  return dt.isValid;
}

/**
 * Compares two date strings from database
 * @param date1 - First date string (can be null/undefined)
 * @param date2 - Second date string (can be null/undefined)
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 * @remarks
 * - Null or undefined values are treated as 'less than' any valid date
 * - Two null/undefined values are considered equal (returns 0)
 * - If date1 is null/undefined and date2 is valid, returns -1
 * - If date2 is null/undefined and date1 is valid, returns 1
 * @throws {Error} If any of the non-null date strings is not valid
 */
export function compareDates(
  date1: string | null | undefined,
  date2: string | null | undefined,
): number {
  if (!date1 && !date2) return 0;
  if (!date1) return -1;
  if (!date2) return 1;

  const dt1 = DateTime.fromISO(date1);
  const dt2 = DateTime.fromISO(date2);

  if (!dt1.isValid) {
    throw new Error(`Invalid date string in compareDates: "${date1}"`);
  }
  if (!dt2.isValid) {
    throw new Error(`Invalid date string in compareDates: "${date2}"`);
  }

  if (dt1 < dt2) return -1;
  if (dt1 > dt2) return 1;
  return 0;
}

/**
 * Checks if date is in the past
 */
export function isPastDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const dt = DateTime.fromISO(dateStr);
  if (!dt.isValid) return false;
  return dt < DateTime.now().startOf('day');
}

/**
 * Checks if date is in the future
 */
export function isFutureDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const dt = DateTime.fromISO(dateStr);
  if (!dt.isValid) return false;
  return dt > DateTime.now().startOf('day');
}

/**
 * Returns current date as date string for database
 */
export function todayDate(): string {
  return DateTime.now().toISODate();
}

/**
 * Returns current time as time string for database
 */
export function nowTime(): string {
  return DateTime.now().toFormat('HH:mm:ss');
}

/**
 * Formats duration in seconds into mm:ss string (e.g. 215 → "3:35")
 */
export function formatDuration(
  seconds: number | null | undefined,
): string | null {
  if (seconds == null || seconds < 0) return null;
  const totalSeconds = Math.floor(seconds);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Parses a duration string in m:ss format (e.g. "3:35") into seconds.
 */
export function parseDuration(
  duration: string | null | undefined,
): number | null {
  if (!duration) return null;

  const normalized = duration.trim();
  if (!normalized) return null;

  const match = normalized.match(/^(\d+):([0-5]\d)$/);
  if (!match) return null;

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  return minutes * 60 + seconds;
}

/**
 * Converts a date string to database format ('yyyy-mm-dd').
 * Accepts both 'dd-mm-yyyy' (UI form) and 'yyyy-mm-dd' (HTML date input).
 * Returns null for invalid input.
 */
export function parseDateInputForDb(date: string | undefined): string | null {
  if (!date) return null;
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return isValidDate(trimmed) ? trimmed : null;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('-');
    const iso = `${year}-${month}-${day}`;
    return isValidDate(iso) ? iso : null;
  }
  return null;
}

/**
 * Converts UI time string ('HH:mm') to database format ('HH:mm:ss').
 * Returns null for invalid input.
 */
export function parseTimeInputForDb(time: string | undefined): string | null {
  if (!time) return null;
  const trimmed = time.trim();
  if (!/^\d{2}:\d{2}$/.test(trimmed) || !isValidTime(trimmed)) return null;
  return `${trimmed}:00`;
}

// example
/*
import { combineDateAndTime, formatDateTime, isFutureDate } from '@/lib/datetime';

// When reading from database
const gig = await db.select().from(gigs).where(eq(gigs.id, 1)).limit(1);

// Combining date and time into one DateTime
const startDateTime = combineDateAndTime(gig[0].date, gig[0].startTime);
// or formatting for display
const formattedStart = formatDateTime(gig[0].date, gig[0].startTime);

// Saving to database
import { dateToDB, timeToDB } from '@/lib/datetime';
import { DateTime } from 'luxon';

const dt = DateTime.now().plus({ days: 7 });
await db.insert(gigs).values({
  date: dateToDB(dt),
  startTime: timeToDB(dt.set({ hour: 18, minute: 30 })),
  // ...
});
*/
