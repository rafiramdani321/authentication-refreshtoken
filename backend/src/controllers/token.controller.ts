import { Request, Response } from "express";
import { AppError } from "../utils/errors";
import { errorResponse, successResponse } from "../utils/responses";
import TokenRepository from "../repositories/token.repository";
import {
  signTokenEmailVerification,
  verifyTokenEmailVerification,
} from "../lib/jwt";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import UserRepository from "../repositories/user.repository";
import { sendMail } from "../lib/nodemailer";

export default class TokenController {
  static async verifyTokenEmail(req: Request, res: Response) {
    const { token } = req.params;
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

      let payload;
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

      await UserRepository.updateIsVerifiedByEmail(payload.email);
      await TokenRepository.markTokenUsed(token);

      return successResponse(res, "Email verifief successfully", 200, token);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      return errorResponse(res, "Internal Server Error", 500);
    }
  }

  static async sendTokenEmailVerification(req: Request, res: Response) {
    const email = req.body.email;
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

      return successResponse(
        res,
        "Resend email verification successfully. Please check your email.",
        200
      );
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(
          res,
          error.message,
          error.statusCode,
          error.details
        );
      }
      return errorResponse(res, "Internal Server Error", 500);
    }
  }
}
