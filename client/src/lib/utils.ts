import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else if (minutes > 0) {
    return `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
  } else {
    return `${remainingSeconds}s`;
  }
}

export function calculateLevel(achievements: number): number {
  // Simple level calculation based on number of achievements
  // Level 1: 0-2 achievements
  // Level 2: 3-5 achievements
  // Level 3: 6-8 achievements
  // Level 4: 9-11 achievements
  // Level 5: 12+ achievements
  if (achievements >= 12) return 5;
  if (achievements >= 9) return 4;
  if (achievements >= 6) return 3;
  if (achievements >= 3) return 2;
  return 1;
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => 0.5 - Math.random());
}

// This function should be moved to a React component file
// For now, we'll remove it since it's causing a build error
// export function getStarsDisplay(count: number, max = 3): JSX.Element {
//   return (
//     <div className="flex">
//       {Array.from({ length: max }).map((_, i) => (
//         <i key={i} className={`ri-star-${i < count ? 'fill' : 'line'} ${i < count ? 'text-secondary' : 'text-gray-300'}`}></i>
//       ))}
//     </div>
//   );
// }
