import { MemoryRateLimiter } from "./MemoryRateLimiter";

export const successRegisterLimiter = new MemoryRateLimiter(60 * 60 * 1000, 3);
export const successLoginLimiter = new MemoryRateLimiter(60 * 60 * 1000, 5);
export const successLogoutLimiter = new MemoryRateLimiter(60 * 60 * 1000, 5);
export const successVerifyEmailTokenLimiter = new MemoryRateLimiter(
  60 * 60 * 1000,
  5
);
export const successResendVerifyEmailTokenLimiter = new MemoryRateLimiter(
  60 * 60 * 1000,
  3
);
export const successGetSelfLimiter = new MemoryRateLimiter(60 * 60 * 1000, 150);
export const successRefreshTokenLimiter = new MemoryRateLimiter(
  60 * 60 * 1000,
  100
);
