import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { verifyRefreshToken } from "../middleware/verifyRefreshToken";
import AuthRateLimiter from "../utils/rate-limiter/auth.rate-limiter";
import { blockIfAuthenticated } from "../middleware/blockIfAuthenticated";

const routerAuth = Router();

routerAuth.post(
  "/register",
  blockIfAuthenticated,
  AuthRateLimiter.registerLimiter,
  AuthController.register
);
routerAuth.post(
  "/login",
  blockIfAuthenticated,
  AuthRateLimiter.loginLimiter,
  AuthController.login
);
routerAuth.post(
  "/logout",
  AuthRateLimiter.logoutLimiter,
  AuthController.logout
);
routerAuth.get(
  "/verify-email/:token",
  AuthRateLimiter.verifyEmailTokenLimiter,
  AuthController.verifyTokenEmail
);
routerAuth.post(
  "/resend-email-verification",
  AuthRateLimiter.resendEmailVerifyTokenLimiter,
  AuthController.sendTokenEmailVerification
);

routerAuth.get(
  "/me",
  verifyAccessToken,
  AuthRateLimiter.getSelfLimiter,
  AuthController.getSelf
);
routerAuth.post(
  "/refresh-token",
  verifyRefreshToken,
  AuthRateLimiter.refreshTokenLimiter,
  AuthController.refreshToken
);
export default routerAuth;
