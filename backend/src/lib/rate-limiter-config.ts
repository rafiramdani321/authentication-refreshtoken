import ratelimiter from "express-rate-limit";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message?: string;
};

export function createRateLimiter(options: RateLimitOptions) {
  return ratelimiter({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: options.message || "Too many requests. Please try again later.",
  });
}
