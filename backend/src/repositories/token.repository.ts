import { prisma } from "../lib/prisma";
import { createTokenParams } from "../types/token.type";

export default class TokenRepository {
  static async createToken(data: createTokenParams) {
    return prisma.tokenVerification.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  static async findToken(token: string) {
    return prisma.tokenVerification.findUnique({
      where: {
        token,
      },
    });
  }

  static async markTokenUsed(token: string) {
    return prisma.tokenVerification.update({
      where: { token },
      data: { status: "USED" },
    });
  }

  static async markTokenExpired(token: string) {
    return prisma.tokenVerification.update({
      where: { token },
      data: { status: "EXPIRED" },
    });
  }
}
