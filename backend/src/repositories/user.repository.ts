import { prisma } from "../lib/prisma";

export default class UserRepository {
  static async findUserByUsername(username: string) {
    return prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  static async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        Role: {
          include: {
            rolePermissions: {
              include: {
                Permission: true,
              },
            },
          },
        },
      },
    });
  }

  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  static async findUserNotVerifiedByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email, isVerified: false },
    });
  }

  static async updateIsVerifiedByEmail(email: string) {
    return prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
  }

  static async updateRefreshTokenByUserId(
    userId: string,
    refreshToken: string | null
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken,
      },
    });
  }

  static async findUserByRefreshToken(refreshToken: string) {
    return prisma.user.findFirst({
      where: { refreshToken },
    });
  }

  static async incrementTokenVersion(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });
  }
}
