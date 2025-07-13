import { prisma } from "../lib/prisma";

export default class RoleRepository {
  static async findRoleByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
    });
  }
}
