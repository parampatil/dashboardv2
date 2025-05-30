// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid, startOfDay, endOfDay } from "date-fns";
import { ProtoTimestamp } from "@/types/grpc";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a Date object or a date string into a specified string format.
 * Defaults to 'PPP' (e.g., Jan 1st, 2023).
 * @param date - The date to format (Date object or string).
 * @param formatString - The desired date-fns format string.
 * @returns Formatted date string or 'N/A' if invalid.
 */
export function formatDate(date: string | Date | number | undefined | null, formatString: string = "PPP"): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!isValid(d)) return 'N/A';
  try {
    return format(d, formatString);
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", date);
    return 'Invalid Date';
  }
}

/**
 * Formats a ProtoTimestamp object into a specified string format.
 * Defaults to 'PPP p' (e.g., Jan 1st, 2023, 12:00:00 PM).
 * @param timestamp - The ProtoTimestamp object.
 * @param formatString - The desired date-fns format string.
 * @returns Formatted date string or 'N/A' if invalid.
 */
export function formatProtoTimestamp(timestamp?: ProtoTimestamp, formatString: string = "PPP p"): string {
  if (!timestamp || timestamp.seconds == null) return 'N/A'; // Check for null or undefined seconds
  try {
    // Ensure seconds is treated as a number
    const seconds = Number(timestamp.seconds);
    if (isNaN(seconds)) {
        console.error("Invalid seconds in ProtoTimestamp:", timestamp.seconds);
        return 'Invalid Date';
    }
    const nanos = Number(timestamp.nanos) || 0; // Default nanos to 0 if undefined or null
    const date = new Date(seconds * 1000 + nanos / 1000000);
    if (!isValid(date)) {
        console.error("Constructed invalid date from ProtoTimestamp:", date);
        return 'Invalid Date';
    }
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting ProtoTimestamp:', error, "Input:", timestamp);
    return 'Invalid Date';
  }
}


/**
 * Converts a Date object to a ProtoTimestamp object.
 * @param date - The Date object.
 * @returns ProtoTimestamp object or undefined if date is invalid.
 */
export function dateToProtoTimestamp(date?: Date): ProtoTimestamp | undefined {
  if (!date || !isValid(date)) return undefined;
  return {
    seconds: Math.floor(date.getTime() / 1000).toString(), // Ensure seconds is a string
    nanos: (date.getTime() % 1000) * 1000000,
  };
}

/**
 * Converts a ProtoTimestamp object to a Date object.
 * @param timestamp - The ProtoTimestamp object.
 * @returns Date object or null if timestamp is invalid.
 */
export function protoTimestampToDate(timestamp?: ProtoTimestamp): Date | null {
  if (!timestamp || timestamp.seconds == null) return null;
   try {
    const seconds = Number(timestamp.seconds);
    if (isNaN(seconds)) return null;
    const nanos = Number(timestamp.nanos) || 0;
    const date = new Date(seconds * 1000 + nanos / 1000000);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}


/**
 * Formats a duration in seconds into a human-readable string (e.g., Xh Ym Zs).
 * @param totalSeconds - The duration in seconds.
 * @returns Formatted duration string.
 */
export function formatDuration(totalSeconds?: number | string | null): string {
  if (totalSeconds == null || totalSeconds === "") return "0s";

  const numSeconds = Number(totalSeconds);
  if (isNaN(numSeconds) || numSeconds < 0) return "0s";

  const h = Math.floor(numSeconds / 3600);
  const m = Math.floor((numSeconds % 3600) / 60);
  const s = Math.floor(numSeconds % 60);

  let result = "";
  if (h > 0) result += `${h}h `;
  if (m > 0) result += `${m}m `;
  // Always show seconds if it's the only unit or if it's non-zero, or if total is 0
  if (s > 0 || result === "" || numSeconds === 0) result += `${s}s`;
  
  return result.trim();
}


/**
 * Converts an ISO date string to a readable date string (e.g., "Jan 1, 2023 at 12:00 PM").
 * @param isoDate - ISO date string.
 * @returns Formatted date string or 'Invalid Date'.
 */
export function isoToReadableDateString(isoDate?: string): string {
  if (!isoDate) return 'N/A';
  const date = parseISO(isoDate);
  if (!isValid(date)) return 'Invalid Date';
  return format(date, "MMM d, yyyy 'at' h:mm aa");
}


/**
 * Converts seconds since epoch to a readable date string.
 * @param epochSeconds - Number of seconds since epoch.
 * @returns Formatted date string or 'Invalid Date'.
 */
export function epochSecondsToReadableDateString(epochSeconds?: number): string {
  if (epochSeconds == null) return 'N/A';
  const date = new Date(epochSeconds * 1000);
  if (!isValid(date)) return 'Invalid Date';
  return format(date, "MMM d, yyyy 'at' h:mm aa");
}


// The following functions were present in the original utils.ts and are kept for compatibility
// or if they serve a distinct purpose not covered by the consolidated functions above.

export function convertInt64BinaryToBigInt(binaryData: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }) {
    try {
      const buffer = Buffer.from(binaryData, 'binary');
      let bigIntValue = BigInt(0);
      for (let i = 7; i >= 0; i--) {
          bigIntValue = (bigIntValue << BigInt(8)) + BigInt(buffer[i]);
      }
        return bigIntValue.toString();
    } catch (error) {
        console.error('Error converting int64 binary:', error);
        return null;
    }
}

// This function seems identical to formatDuration, consider removing if truly redundant.
// For now, keeping it to avoid breaking existing code.
export function formatSecondsToHMS(seconds: number): string {
  return formatDuration(seconds);
}

// This function seems identical to formatProtoTimestamp, consider removing.
// Kept for now for safety.
export function formatTimestampToDate(timestamp?: ProtoTimestamp): string {
  if (!timestamp || timestamp.seconds == null) return 'N/A';
  try {
    const seconds = Number(timestamp.seconds);
    if (isNaN(seconds)) return 'Invalid Date';
    const date = new Date(seconds * 1000);
    return date.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });
  } catch {
    return 'Invalid Date';
  }
}

export const formatJailTime = (isoString?: string): string => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  if (!isValid(date)) return 'Invalid Date';
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
};

// Export date-fns functions for direct use if needed elsewhere
export { startOfDay, endOfDay, isValid as isValidDate, format as formatDateFns, parseISO as parseIsoDateFns };
