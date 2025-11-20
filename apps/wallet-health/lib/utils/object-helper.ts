/**
 * Object Helper
 */

export function merge<T extends object>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((curr, key) => {
    if (!(key in curr)) curr[key] = {};
    return curr[key];
  }, obj);
  target[lastKey] = value;
}

