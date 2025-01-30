import redis from "@/db/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "1m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const statsRecorderRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(1, "12h", 4),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
