import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { errorResponse, successResponse } from "../utils/responses";
import { AppError } from "../utils/errors";
import { getClientInfo } from "../utils/getClientInfo";
import { registerLogger } from "../lib/logger/logger";
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
    const data = await req.body;
    const { ip, userAgent } = getClientInfo(req);
    try {
      const user = await AuthService.loginUser(data);

      res.cookie("refreshToken", user.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(res, "Login successfully.", 200, {
        username: user.username,
        email: user.email,
        accessToken: user.accessToken,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      return errorResponse(res, "Internal server error", 500);
    }
  }

  static async getSelf(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401);
      }
      const user = req.user;
      return successResponse(res, "Success get user from access token", 200, {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      return errorResponse(res, "Internal server error", 500);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken || refreshToken === null) {
        throw new AppError("Already logged out", 200);
      }

      const user = await UserRepository.findUserByRefreshToken(refreshToken);
      if (user) {
        await UserRepository.updateRefreshTokenByUserId(user.id, null);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return successResponse(res, "Logout successfull", 200);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      return errorResponse(res, "Internal server error", 500);
    }
  }
}
