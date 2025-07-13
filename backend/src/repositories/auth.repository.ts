import { prisma } from "../lib/prisma";
import { createUserParams } from "../types/auth.type";

export default class AuthRepository {
  static async createUser(data: createUserParams) {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        roleId: data.roleId,
      },
    });
  }
}
