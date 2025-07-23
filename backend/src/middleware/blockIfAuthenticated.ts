import { NextFunction, Request, Response } from "express";
import { verifySignAccessToken } from "../lib/jwt";
import { errorResponse } from "../utils/responses";

export const blockIfAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token === null || !token) {
      return next();
    }

    const payload = verifySignAccessToken(token);
    if (payload) {
      return errorResponse(res, "already logged in.", 403);
    }
  } catch (error) {
    return next();
  }
};
