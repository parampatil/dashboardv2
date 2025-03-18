import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatter for profile page
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  
  // Pad single digits with leading zero
  const pad = (num: number): string => num.toString().padStart(2, '0');
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} at ${formattedHours}:${minutes} ${ampm}`;
}

export function formatProtobufTimestamp(timestamp: { seconds: number | string; nanos: number }) {
  try {
    if (!timestamp || !timestamp.seconds) return 'N/A';
    
    const seconds = typeof timestamp.seconds === 'string' ? 
      parseInt(timestamp.seconds) : timestamp.seconds;
    
    const date = new Date(seconds * 1000 + (timestamp.nanos / 1000000));
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return format(date, 'PPP');
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid Date';
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}