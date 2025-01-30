import redis from "@/db/redis";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above

export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "1m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const statsRecorderRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(1, "1h", 5),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
