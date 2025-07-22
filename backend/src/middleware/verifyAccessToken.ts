import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifySignAccessToken } from "../lib/jwt";
import { errorResponse } from "../utils/responses";
import UserRepository from "../repositories/user.repository";

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token === null || !token) {
      throw new AppError("Access token not found.", 401);
    }

    const decoded = verifySignAccessToken(token);
    const user = await UserRepository.findUserById(decoded.id);
    if (!user || !user.refreshToken) {
      throw new AppError("Session expired. Please login again.", 401);
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AppError(
        "Access token is no longer valid. Please login again.",
        401
      );
    }
    req.user = {
      ...decoded,
      roleName: user.Role.name,
    };
    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      return errorResponse(res, error.message, error.statusCode, error.details);
    }
    errorResponse(res, "Invalid or expired access token", 401);
  }
};
