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
} from "../lib/logger/logger";
import { signAccessToken } from "../lib/jwt";
import UserRepository from "../repositories/user.repository";

export default class AuthController {
  static async register(req: Request, res: Response) {
    const data = await req.body;
    const { ip, userAgent } = getClientInfo(req);
    try {
      const response = await AuthService.registerUser(data);

      registerLogger.info({
        event: "registration_success",
        email: data?.email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });

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
