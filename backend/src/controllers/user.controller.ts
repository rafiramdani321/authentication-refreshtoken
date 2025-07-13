import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export default class UserController {
  static async getUser(req: Request, res: Response) {
    const data = await prisma.user.findMany();
    res.status(200).json({ message: "success", data });
  }
}
