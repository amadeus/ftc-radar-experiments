export const RED = '#bf1934';
export const BLUE = '#0029af';
export const YELLOW = '#fffc00';
export const WHITE = '#ffffff';
export const BLACK = '#000000';
export const BROWN = '#4a2916';

export const Colors = [RED, YELLOW, BLUE] as const;

export function getMinuteColor(minutes: number): (typeof Colors)[number] {
  return Colors[Math.floor((minutes % 60) / 5) % Colors.length];
}
