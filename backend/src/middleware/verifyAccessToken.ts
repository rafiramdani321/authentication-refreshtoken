import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifySignAccessToken } from "../lib/jwt";
import { errorResponse } from "../utils/responses";

export const verifyAccessToken = (
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
    req.user = decoded;
    next();
  } catch (error: any) {
    errorResponse(res, "Invalid or expried access token", 401);
  }
};
