import AuthService from "../../auth.service";
import { createUserParams } from "../../../types/auth.type";

// module
import UserRepository from "../../../repositories/user.repository";
import RoleRepository from "../../../repositories/role.repository";
import AuthRepository from "../../../repositories/auth.repository";
import TokenRepository from "../../../repositories/token.repository";
import { signTokenEmailVerification } from "../../../lib/jwt";
import { sendMail } from "../../../lib/nodemailer";
import bcrypt from "bcrypt";

// Mock dependency external
jest.mock("../../../repositories/user.repository.ts");
jest.mock("../../../repositories/role.repository.ts");
jest.mock("../../../repositories/auth.repository.ts");
jest.mock("../../../repositories/token.repository.ts");
jest.mock("../../../lib/jwt.ts");
jest.mock("../../../lib/nodemailer.ts");
jest.mock("bcrypt", () => ({
  hash: jest.fn(() => Promise.resolve("hashed-password")),
}));

describe("AuthService.registerUser", () => {
  const dummyData: createUserParams = {
    username: "testuser",
    email: "test@example.com",
    password: "123@Password456",
    confirmPassword: "123@Password456",
    roleId: "role-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register user successfully", async () => {
    // setup mock return values
    (UserRepository.findUserByUsername as jest.Mock).mockResolvedValue(null);
    (UserRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (RoleRepository.findRoleByName as jest.Mock).mockResolvedValue({
      id: "role-id",
      name: "user",
    });
    (AuthRepository.createUser as jest.Mock).mockResolvedValue({
      id: "user-id",
      ...dummyData,
      password: "hashed-password",
      roleId: "role-id",
    });
    (signTokenEmailVerification as jest.Mock).mockReturnValue("test-token");
    (TokenRepository.createToken as jest.Mock).mockResolvedValue({});
    (sendMail as jest.Mock).mockResolvedValue(true);

    const result = await AuthService.registerUser(dummyData);

    expect(result).toHaveProperty("id", "user-id");
    expect(TokenRepository.createToken).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith(
      dummyData.email,
      expect.any(String),
      expect.stringContaining("verify-account/test-token")
    );
  });

  it("should throw AppError if validation (zod) fails", async () => {
    const invalidData = {
      username: "",
      email: "not-email",
      password: "weak",
      confirmPassword: "different",
    };
    await expect(
      AuthService.registerUser(invalidData as any)
    ).rejects.toMatchObject({
      message: "Validation failed.",
      statusCode: 400,
      details: expect.arrayContaining([
        { field: "username", message: "Username is required." },
        {
          field: "username",
          message: "Username must be at least 2 characters.",
        },
        { field: "email", message: "Invalid email format." },
        {
          field: "password",
          message: "Password must be at least 8 characters.",
        },
        {
          field: "password",
          message: "Password must include at least one uppercase letter.",
        },
        {
          field: "password",
          message: "Password must include at least one number.",
        },
        {
          field: "password",
          message: "Password must include at least one special character.",
        },
        {
          field: "confirmPassword",
          message: "Confirm password do not match.",
        },
      ]),
    });
  });

  it("should throw AppError if username already exists", async () => {
    (UserRepository.findUserByUsername as jest.Mock).mockResolvedValue({
      id: "existing-id",
      username: "testuser",
    });
    (UserRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
    await expect(AuthService.registerUser(dummyData)).rejects.toMatchObject({
      message: "Validation failed.",
      statusCode: 400,
      details: [
        {
          field: "username",
          message: "Username already taken.",
        },
      ],
    });
  });

  it("should throw AppError if email already exists", async () => {
    (UserRepository.findUserByUsername as jest.Mock).mockResolvedValue(null);
    (UserRepository.findUserByEmail as jest.Mock).mockResolvedValue({
      email: "test@example.com",
    });
    await expect(AuthService.registerUser(dummyData)).rejects.toMatchObject({
      message: "Validation failed.",
      statusCode: 400,
      details: [
        {
          field: "email",
          message: "Email already taken.",
        },
      ],
    });
  });

  it("should throw AppError if default role not found", async () => {
    (UserRepository.findUserByUsername as jest.Mock).mockResolvedValue(null);
    (UserRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (RoleRepository.findRoleByName as jest.Mock).mockResolvedValue(null);
    await expect(AuthService.registerUser(dummyData)).rejects.toMatchObject({
      message: "Something went wrong",
      statusCode: 500,
    });
  });
});
