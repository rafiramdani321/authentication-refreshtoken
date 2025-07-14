import bcrypt from "bcrypt";

import { createUserParams, loginParams } from "../types/auth.type";
import { AppError } from "../utils/errors";
import { sendMail } from "../lib/nodemailer";
import {
  signTokenEmailVerification,
  signAccessToken,
  signRefreshToken,
} from "../lib/jwt";
import {
  loginValidation,
  registerValidation,
  validationResponses,
} from "../validations/auth.validation";
import UserRepository from "../repositories/user.repository";
import AuthRepository from "../repositories/auth.repository";
import RoleRepository from "../repositories/role.repository";
import TokenRepository from "../repositories/token.repository";

export default class AuthService {
  static async registerUser(data: createUserParams) {
    const errorsValidation = registerValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed.", 400, errors);
    }

    const dbErrors: { field: keyof createUserParams; message: string }[] = [];

    const existingUsername = await UserRepository.findUserByUsername(
      data.username
    );
    if (existingUsername) {
      dbErrors.push({ field: "username", message: "Username already taken." });
    }
    const existingEmail = await UserRepository.findUserByEmail(data.email);
    if (existingEmail) {
      dbErrors.push({ field: "email", message: "Email already taken." });
    }

    if (dbErrors.length > 0) {
      throw new AppError("Validation failed.", 400, dbErrors);
    }

    const hashPassword = await bcrypt.hash(data.password, 10);

    const role = await RoleRepository.findRoleByName("user");
    if (!role) {
      throw new AppError("Something went wrong", 500);
    }

    const newUserData = await AuthRepository.createUser({
      ...data,
      password: hashPassword,
      roleId: role.id,
    });

    const token = signTokenEmailVerification(newUserData.email);
    const one_hour = 60 * 60 * 1000;
    const newTokenData = {
      userId: newUserData.id,
      token,
      expiresAt: new Date(Date.now() + one_hour),
    };
    await TokenRepository.createToken(newTokenData);
    const url = `${process.env
      .FRONTEND_PUBLIC_BASE_URL!}/auth/verify-account/${token}`;
    const message = `<p>Click the link below to verify your email</p><a href="${url}">${url}</a>`;
    await sendMail(newUserData.email, `Verification account : `, message);

    return newUserData;
  }

  static async loginUser(data: loginParams) {
    const errorsValidation = loginValidation.safeParse(data);
    if (!errorsValidation.success) {
      const errors = validationResponses(errorsValidation);
      throw new AppError("Validation failed,", 400, errors);
    }

    const user = await UserRepository.findUserByEmail(data.email);
    const isValidPassword = user
      ? await bcrypt.compare(data.password, user.password)
      : false;
    if (!user || !isValidPassword) {
      throw new AppError("Email / Password incorrect", 400);
    }

    if (!user.isVerified) {
      throw new AppError(
        "Your email has not been activated. Please check your email or you can request a new activation link.",
        400,
        [
          {
            field: "request_new_verification",
            message: "request_new_verification",
          },
        ]
      );
    }

    const accessToken = signAccessToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        roleId: user.roleId,
      },
      "15m"
    );

    const refreshToken = signRefreshToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        roleId: user.roleId,
      },
      "7d"
    );

    await UserRepository.updateRefreshTokenByUserId(user.id, refreshToken);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      accessToken,
      refreshToken,
    };
  }
}
