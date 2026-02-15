import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getUniqueFileName(
  baseName: string,
  extension: string,
  existingNames: string[]
): string {
  const fullName = `${baseName}.${extension}`;
  if (!existingNames.includes(fullName)) return baseName;

  let counter = 1;
  while (existingNames.includes(`${baseName} (${counter}).${extension}`)) {
    counter++;
  }
  return `${baseName} (${counter})`;
}
