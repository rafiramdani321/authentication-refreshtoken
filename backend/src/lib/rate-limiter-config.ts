import { Request, Response } from "express";
import ratelimiter from "express-rate-limit";
import { errorResponse } from "../utils/responses";

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
    message: (req: Request, res: Response) => {
      return errorResponse(
        res,
        options.message || "Too many requests. Please try again later.",
        429
      );
    },
  });
}
