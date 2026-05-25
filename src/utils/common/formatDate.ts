const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getFormattedDate(
  date: Date,
  prefomattedDate: string | undefined = undefined,
  hideYear: boolean = false,
) {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  let minutes = String(date.getMinutes());

  if (+minutes < 10) {
    // Adding leading zero to minutes
    minutes = `0${minutes}`;
  }

  if (prefomattedDate) {
    // Today at 10:20
    // Yesterday at 10:20
    return `${prefomattedDate} at ${hours}:${minutes}`;
  }

  if (hideYear) {
    // 10. January at 10:20
    return `${day} ${month} at ${hours}:${minutes}`;
  }

  // 10. January 2017. at 10:20
  return `${day} ${month} ${year}. at ${hours}:${minutes}`;
}

// --- Main function
export function formatDate(dateParam: Date | number, now: Date) {
  if (!dateParam) {
    return null;
  }

  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  const today = now;
  const yesterday = new Date(+today - DAY_IN_MS);
  const seconds = Math.round((+today - +date) / 1000);
  const minutes = Math.round(seconds / 60);
  const isToday = today.toDateString() === date.toDateString();
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const isThisYear = today.getFullYear() === date.getFullYear();

  if (seconds < 5) {
    return 'now';
  }
  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }
  if (seconds < 90) {
    return 'about a minute ago';
  }
  if (minutes < 60) {
    return `${minutes} minutes ago`;
  }
  if (isToday) {
    return getFormattedDate(date, 'Today'); // Today at 10:20
  }
  if (isYesterday) {
    return getFormattedDate(date, 'Yesterday'); // Yesterday at 10:20
  }
  if (isThisYear) {
    return getFormattedDate(date, undefined, true); // 10. January at 10:20
  }

  return getFormattedDate(date); // 10. January 2017. at 10:20
}

export const formatDateDDMM = (ts: string | number) => {
  const date = new Date(Number(ts) * 1000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month} ${hours}:${minutes}`;
};

export function formatFutureTime(ms: number) {
  if (ms <= 0) return "0m";

  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

  const parts = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return parts.join(" ");
}

export const toLocalTimestamp = (utcSeconds: number) => {
  const date = new Date(utcSeconds * 1000);

  return Math.floor(
      (date.getTime() - date.getTimezoneOffset() * 60 * 1000) / 1000
  );
};