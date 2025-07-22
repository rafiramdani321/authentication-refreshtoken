import AuthService from "../../auth.service";
import UserRepository from "../../../repositories/user.repository";
import { loginParams } from "../../../types/auth.type";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";

jest.mock("../../../repositories/user.repository.ts");
jest.mock("bcrypt");
jest.mock("../../../lib/jwt.ts");

describe("AuthService.loginUser", () => {
  const dummyData: loginParams = {
    email: "test@example.com",
    password: "123@Password456",
  };

  const dummyUser = {
    id: "user-id",
    email: "test@example.com",
    username: "testuser",
    password: "hashed-password",
    isVerified: true,
    roleId: "role-id",
    tokenVersion: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login user successfully", async () => {
    (UserRepository.findUserByEmail as jest.Mock).mockResolvedValue(dummyUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (signAccessToken as jest.Mock).mockReturnValue("access-token");
    (signRefreshToken as jest.Mock).mockReturnValue("refresh-token");
    (UserRepository.updateRefreshTokenByUserId as jest.Mock).mockResolvedValue(
      true
    );

    const result = await AuthService.loginUser(dummyData);

    expect(result).toEqual({
      id: dummyUser.id,
      email: dummyUser.email,
      username: dummyUser.username,
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    expect(UserRepository.updateRefreshTokenByUserId).toHaveBeenCalledWith(
      dummyUser.id,
      "refresh-token"
    );
  });
});
