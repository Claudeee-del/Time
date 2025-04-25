/**
 * Formats seconds into hours and minutes
 * @param seconds Total seconds to format
 * @returns Formatted string in the format "Xh Ym"
 */
export function formatSecondsToHM(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  return `${hours}h ${minutes}m`;
}

/**
 * Formats seconds into hours, minutes, and seconds
 * @param seconds Total seconds to format
 * @returns Formatted string in the format "HH:MM:SS"
 */
export function formatSecondsToHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Parse HH:MM:SS format into seconds
 * @param timeString Time string in HH:MM:SS format
 * @returns Total seconds
 */
export function parseTimeToSeconds(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parse hours and minutes inputs into seconds
 * @param hours Number of hours
 * @param minutes Number of minutes
 * @returns Total seconds
 */
export function hoursMinutesToSeconds(hours: number, minutes: number): number {
  return hours * 3600 + minutes * 60;
}

/**
 * Calculate the duration between two dates in seconds
 * @param startTime Start date
 * @param endTime End date
 * @returns Duration in seconds
 */
export function calculateDuration(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * Format a date for display
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get day names for the past week
 * @returns Array of day names (e.g., ["Mon", "Tue", ...])
 */
export function getPastWeekDays(): string[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const index = (today - i + 7) % 7;
    result.push(days[index]);
  }
  
  return result;
}

/**
 * Get month names
 * @returns Array of month names
 */
export function getMonthNames(): string[] {
  return [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
}
