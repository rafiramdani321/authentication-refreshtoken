import UserRepository from "../repositories/user.repository";

export default class UserService {
  static async getUserByEmail(email: string) {
    if (!email.includes("@")) {
      throw new Error("Invalid email format");
    }

    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
