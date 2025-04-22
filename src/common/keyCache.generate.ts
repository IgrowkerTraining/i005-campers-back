import * as crypto from 'crypto';

export function generateCacheKey(query: Record<string, any>): string {
  const sorted = Object.entries(query)
    .filter(([_, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  const serialized = JSON.stringify(sorted);
  return 'campings:' + crypto.createHash('sha256').update(serialized).digest('hex');
}
