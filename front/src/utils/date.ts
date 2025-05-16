export function formatTimeUntilFull(
  endDate: Date | string | number,
  isShort: boolean = false,
): string {
  const now = Date.now();
  const end = new Date(endDate).getTime();

  let diffInMinutes = Math.max(0, Math.floor((end - now) / 60000));

  const days = Math.floor(diffInMinutes / 1440); // 1440 = 60 * 24
  diffInMinutes -= days * 1440;

  const hours = Math.floor(diffInMinutes / 60);
  diffInMinutes -= hours * 60;

  const minutes = diffInMinutes;

  const parts: string[] = [];

  if (isShort) {
    if (days > 0) parts.push(`${days}<span class="opacity-40 ml-0.5">D</span>`);
    if (hours > 0) parts.push(`${hours}<span class="opacity-40 ml-0.5">H</span>`);
    if (minutes > 0 || parts.length === 0)
      parts.push(`${minutes}<span class="opacity-40 ml-0.5">M</span>`);
  } else {
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes} min`);
  }

  return parts.join(' ');
}

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(',', ''); // забираємо кому між датою і часом
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatToLocalDatetime = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
