import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma"; // sesuaikan path
import { AppError } from "../utils/errors";

export const checkRole =
  (allowedRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        Role: true,
      },
    });

    if (!user || !user.Role) {
      throw new AppError("Role not found", 403);
    }

    if (!allowedRoles.includes(user.Role.name)) {
      throw new AppError("Forbidden: insufficient role", 403);
    }

    next();
  };
