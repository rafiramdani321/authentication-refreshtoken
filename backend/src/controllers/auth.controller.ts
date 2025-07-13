import { Request, Response } from "express";
import AuthService from "../services/auth.service";
import { errorResponse, successResponse } from "../utils/responses";
import { AppError } from "../utils/errors";
import { getClientInfo } from "../utils/getClientInfo";
import { registerLogger } from "../lib/logger/logger";

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

  static async login(req: Request, res: Response) {}
}
