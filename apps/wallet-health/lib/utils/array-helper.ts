/**
 * Array Helper
 */

export function deduplicate<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];

  array.forEach((item) => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });

  return [truthy, falsy];
}

export function takeWhile<T>(array: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];

  for (const item of array) {
    if (!predicate(item)) break;
    result.push(item);
  }

  return result;
}

