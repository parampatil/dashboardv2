// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProtoTimestamp } from "@/types/grpc";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts seconds to a readable date string
 * @param seconds - Number of seconds since epoch
 * @returns Formatted date string
 */
export function secondsToDateString(seconds: number): string {
  const date = new Date(seconds * 1000);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Converts ISO date string to a readable date string
 * @param isoDate - ISO date string
 * @returns Formatted date string
 */
export function isoToReadableDateString(isoDate: string): string {
  const date = new Date(isoDate);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Converts ISO date string to ProtoTimestamp
 * @param isoDate - ISO date string
 * @returns ProtoTimestamp object
 */
export function isoToProtoTimestamp(isoDate: string): ProtoTimestamp {
  const date = new Date(isoDate);
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  
  return {
    seconds: Math.floor(date.getTime() / 1000).toString(),
    nanos: (date.getTime() % 1000) * 1000000
  };
}

/**
 * Converts seconds to ProtoTimestamp
 * @param seconds - Number of seconds since epoch
 * @returns ProtoTimestamp object
 */
export function secondsToProtoTimestamp(seconds: number): ProtoTimestamp {
  return {
    seconds: seconds.toString(),
    nanos: 0
  };
}

/**
 * Converts ProtoTimestamp to readable date string
 * @param timestamp - ProtoTimestamp object
 * @returns Formatted date string
 */
export function protoTimestampToReadableString(timestamp: ProtoTimestamp): string {
  if (!timestamp || !timestamp.seconds) return 'N/A';
  
  const date = new Date(Number(timestamp.seconds) * 1000 + timestamp.nanos / 1000000);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${formattedHours}:${minutes} ${ampm}`;
}
