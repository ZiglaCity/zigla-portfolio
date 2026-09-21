import { getDatabase } from "@@/lib/neon/db";

const memoryBuckets = new Map<string, { count: number; expiresAt: number }>();

const WINDOWS = {
  comments: { limit: 3, milliseconds: 60 * 60 * 1000 },
  reactions: { limit: 30, milliseconds: 60 * 60 * 1000 },
  views: { limit: 120, milliseconds: 60 * 1000 },
} as const;

export type RateLimitAction = keyof typeof WINDOWS;

function consumeMemoryRateLimit(key: string, action: RateLimitAction) {
  const now = Date.now();
  const bucketKey = `${action}:${key}`;
  const window = WINDOWS[action];
  const current = memoryBuckets.get(bucketKey);
  const bucket =
    current && current.expiresAt > now
      ? current
      : { count: 0, expiresAt: now + window.milliseconds };

  bucket.count += 1;
  memoryBuckets.set(bucketKey, bucket);

  return {
    allowed: bucket.count <= window.limit,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000)),
  };
}

export async function consumeRateLimit(key: string, action: RateLimitAction) {
  const memoryResult = consumeMemoryRateLimit(key, action);
  if (!memoryResult.allowed) {
    return {
      ...memoryResult,
      remaining: 0,
    };
  }

  const database = getDatabase();
  const window = WINDOWS[action];
  const now = new Date();
  const windowStart = new Date(
    Math.floor(now.getTime() / window.milliseconds) * window.milliseconds,
  );
  const expiresAt = new Date(windowStart.getTime() + window.milliseconds);

  const rows = await database`
    insert into interaction_rate_limit_buckets
      (bucket_key, action, window_start, request_count, expires_at)
    values
      (${key}, ${action}, ${windowStart}, 1, ${expiresAt})
    on conflict (bucket_key, action, window_start)
    do update set request_count = interaction_rate_limit_buckets.request_count + 1
    returning request_count
  `;

  const resultRows = rows as unknown as Record<string, unknown>[];
  const requestCount = Number(resultRows[0]?.request_count ?? 1);
  return {
    allowed: requestCount <= window.limit,
    remaining: Math.max(0, window.limit - requestCount),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((expiresAt.getTime() - now.getTime()) / 1000),
    ),
  };
}
