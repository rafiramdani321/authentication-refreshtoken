import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifySignRefreshToken } from "../lib/jwt";
import { errorResponse } from "../utils/responses";
import UserRepository from "../repositories/user.repository";

export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token || token === null) {
      throw new AppError("Refresh token not found", 401);
    }
    const decoded = verifySignRefreshToken(token);

    const user = await UserRepository.findUserById(decoded.id);

    if (!user) {
      throw new AppError("User not found.", 401);
    }

    req.user = {
      ...decoded,
      roleName: user.Role.name,
    };
    req.refreshToken = token;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.message, error.statusCode, error.details);
    }
    return errorResponse(
      res,
      "Invalid or expired refresh token. Please login again",
      401
    );
  }
};
