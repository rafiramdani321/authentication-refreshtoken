import { createRateLimiter } from "../../lib/rate-limiter-config";

export default class AuthRateLimiter {
  static registerLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 15,
    message: "Too many registrations from this IP. Try again in an hour.",
  });

  static loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Please try again in 15 minutes.",
  });

  static logoutLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many logout attempts. Please try again in 15 minutes.",
  });

  static verifyEmailTokenLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message:
      "Too many verify email token attempts. Please try again in 15 minutes.",
  });

  static resendEmailVerifyTokenLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 4,
    message:
      "Too many resend email verification attempts. Please try again in 15 minutes.",
  });

  static getSelfLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 150,
    message: "Too many get self attempts. Please try again in an hour.",
  });

  static refreshTokenLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: "Too many refresh token attempts. Please try again in an hour.",
  });
}
