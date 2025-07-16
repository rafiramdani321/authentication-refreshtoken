import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { errorResponse, successResponse } from "../utils/responses";
import { AppError } from "../utils/errors";
import { getClientInfo } from "../utils/getClientInfo";
import {
  getSelfLogger,
  loginLogger,
  logoutLogger,
  refreshTokenLogger,
  registerLogger,
  sendTokenVerifyLogger,
  verifyTokenEmailLogger,
} from "../lib/logger/logger";
import {
  signAccessToken,
  signTokenEmailVerification,
  verifyTokenEmailVerification,
} from "../lib/jwt";
import UserRepository from "../repositories/user.repository";
import {
  successLoginLimiter,
  successLogoutLimiter,
  successRegisterLimiter,
  successResendVerifyEmailTokenLimiter,
  successVerifyEmailTokenLimiter,
} from "../lib/rate-limiter";
import TokenRepository from "../repositories/token.repository";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { sendMail } from "../lib/nodemailer";

export default class AuthController {
  static async register(req: Request, res: Response) {
    const data = await req.body;
    const { ip, userAgent } = getClientInfo(req);

    const isSuccessLimited = await successRegisterLimiter.check(ip);
    if (isSuccessLimited) {
      return errorResponse(
        res,
        "Too many successful registrations from this IP. Try again later in an hour.",
        429
      );
    }

    try {
      const response = await AuthService.registerUser(data);

      registerLogger.info({
        event: "registration_success",
        email: data?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      await successRegisterLimiter.increment(ip);

      return successResponse(
        res,
        "Registration successfully. Plese check your email for activation.",
        201,
        { username: response.username, email: response.email }
      );
    } catch (error: any) {
      if (error instanceof AppError) {
        registerLogger.error({
          event: "registration_failed",
          email: data?.email,
          message: error.message,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      registerLogger.error({
        event: "registration_failed",
        email: data?.email,
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(res, "Internal Server Error", 500);
    }
  }

  static async login(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const data = await req.body;

    const isSuccessLimited = await successLoginLimiter.check(ip);
    if (isSuccessLimited) {
      return errorResponse(
        res,
        "Too many successful logins from this IP. Try again later in an hour.",
        429
      );
    }

    try {
      const user = await AuthService.loginUser(data);

      res.cookie("refreshToken", user.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      loginLogger.info({
        event: "login_success",
        email: user.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      await successLoginLimiter.increment(ip);

      return successResponse(res, "Login successfully.", 200, {
        username: user.username,
        email: user.email,
        accessToken: user.accessToken,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        loginLogger.error({
          event: "login_failed",
          email: data?.email || "",
          message: error.message,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      loginLogger.error({
        event: "login_failed",
        email: data?.email || "",
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(res, "Internal server error", 500);
    }
  }

  static async getSelf(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }
      const user = req.user;

      getSelfLogger.info({
        event: "getself_success",
        email: user.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Success get user from access token", 200, {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        getSelfLogger.error({
          event: "getself_failed",
          email: req.user?.email || "",
          message: error.message,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      getSelfLogger.error({
        event: "getself_failed",
        email: req.user?.email || "",
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(res, "Internal server error", 500);
    }
  }

  static async logout(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);

    const isSuccessLimited = await successLogoutLimiter.check(ip);
    if (isSuccessLimited) {
      return errorResponse(
        res,
        "Too many successful logouts from this IP. Try again later in an hour.",
        429
      );
    }

    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken || refreshToken === null) {
        throw new AppError("Already logged out", 200);
      }

      const user = await UserRepository.findUserByRefreshToken(refreshToken);
      if (!user) {
        throw new AppError("User not found.", 400);
      }

      await UserRepository.updateRefreshTokenByUserId(user.id, null);
      await UserRepository.incrementTokenVersion(user.id);

      res.clearCookie("refreshToken");

      logoutLogger.info({
        event: "logout_success",
        email: user.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      await successLogoutLimiter.increment(ip);

      return successResponse(res, "Logout successfull", 200);
    } catch (error: any) {
      if (error instanceof AppError) {
        logoutLogger.error({
          event: "logout_failed",
          message: error.message,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      logoutLogger.error({
        event: "logout_failed",
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(res, "Internal server error", 500);
    }
  }

  static async verifyTokenEmail(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const { token } = req.params;

    const isSuccessLimited = await successVerifyEmailTokenLimiter.check(ip);
    if (isSuccessLimited) {
      return errorResponse(
        res,
        "Too many successful verify email token from this IP. Try again later in an hour.",
        429
      );
    }

    let payload;
    try {
      if (!token) {
        throw new AppError("Invalid token url", 400);
      }

      const existingToken = await TokenRepository.findToken(token);
      if (!existingToken) {
        throw new AppError("Invalid Link. Please check your URL.", 400);
      }
      if (existingToken.status === "USED") {
        throw new AppError("Invalid Link. Token already used", 400);
      }

      const now = new Date();
      if (existingToken.expiresAt < now) {
        await TokenRepository.markTokenExpired(token);
        throw new AppError("Invalid Link, Token has expired", 400, [
          { field: "token", message: "has_expired" },
        ]);
      }

      try {
        payload = verifyTokenEmailVerification(token);
      } catch (innerError: any) {
        if (innerError instanceof TokenExpiredError) {
          await TokenRepository.markTokenExpired(token);
          return errorResponse(res, "Token has Expired (JWT Expired)", 400, [
            { field: "token", message: "has_expired" },
          ]);
        } else if (innerError instanceof JsonWebTokenError) {
          return errorResponse(res, "Invalid Token (JWT Broken)", 400);
        } else {
          return errorResponse(res, "an error occurred with the token", 500);
        }
      }

      const user = await UserRepository.updateIsVerifiedByEmail(payload.email);
      await TokenRepository.markTokenUsed(token);

      verifyTokenEmailLogger.info({
        event: "verify_account_success",
        email: payload.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      await successVerifyEmailTokenLimiter.increment(ip);

      return successResponse(res, "Email verifief successfully", 200, token);
    } catch (error: any) {
      if (error instanceof AppError) {
        verifyTokenEmailLogger.error({
          event: "verify_account_failed",
          email: payload?.email || "",
          message: error.message,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      verifyTokenEmailLogger.error({
        event: "verify_account_failed",
        email: payload?.email || "",
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(res, "Internal Server Error", 500);
    }
  }

  static async sendTokenEmailVerification(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const email = req.body.email;

    const isSuccessLimited = await successResendVerifyEmailTokenLimiter.check(
      ip
    );
    if (isSuccessLimited) {
      return errorResponse(
        res,
        "Too many successful resend verify email token from this IP. Try again later in an hour.",
        429
      );
    }

    try {
      const user = await UserRepository.findUserByEmail(email);
      if (!user) {
        throw new AppError("User not found.", 400);
      }

      const validSendToken = await UserRepository.findUserNotVerifiedByEmail(
        email
      );
      if (!validSendToken) {
        throw new AppError("Account has been verified", 400);
      }

      const token = signTokenEmailVerification(email);
      const one_hour = 60 * 60 * 1000;
      const newTokenData = {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + one_hour),
      };
      await TokenRepository.createToken(newTokenData);
      const url = `${process.env
        .FRONTEND_PUBLIC_BASE_URL!}/auth/verify-account/${token}`;
      const message = `<p>Click the link below to verify your email</p><a href="${url}">${url}</a>`;
      await sendMail(email, `Verification account : `, message);

      sendTokenVerifyLogger.info({
        event: "send_email_verification_success",
        email: user.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      await successResendVerifyEmailTokenLimiter.increment(ip);

      return successResponse(
        res,
        "Resend email verification successfully. Please check your email.",
        200
      );
    } catch (error: any) {
      if (error instanceof AppError) {
        sendTokenVerifyLogger.error({
          event: "send_email_verification_failed",
          email: email || "",
          message: error.message,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      sendTokenVerifyLogger.error({
        event: "send_email_verification_failed",
        email: email || "",
        message: error.message || error,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(res, "Internal Server Error", 500);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    const { ip, userAgent } = getClientInfo(req);
    const userId = req.user?.id;
    const refreshToken = req.refreshToken;
    try {
      const user = await UserRepository.findUserById(userId!);
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError("Refresh token missmatch.", 401);
      }

      const updateUser = await UserRepository.incrementTokenVersion(user.id);

      const newAccessToken = signAccessToken(
        {
          id: updateUser.id,
          username: updateUser.username,
          email: updateUser.email,
          roleId: updateUser.roleId,
          tokenVersion: updateUser.tokenVersion,
        },
        "15m"
      );

      refreshTokenLogger.info({
        event: "refresh_token_success",
        email: user.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      return successResponse(res, "Access token refreshed successfully", 200, {
        accessToken: newAccessToken,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        refreshTokenLogger.error({
          event: "refresh_token_failed",
          email: req.user?.email,
          message: error.message,
          ip,
          userAgent,
          timestamp: new Date().toISOString(),
        });
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      refreshTokenLogger.error({
        event: "refresh_token_failed",
        email: req.user?.email,
        message: error.message || "",
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(res, "Failed to refresh token", 500);
    }
  }
}
