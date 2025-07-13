// import UserService from "./backend/src/services/user.service";
// import UserRepository from "./backend/src/repositories/user.repository";

// jest.mock("../../repositories/user.repository.ts");

// describe("UserService.getUserByEmail", () => {
//   const dummyUser = { id: "123", email: "test@gmail.com" };

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return user if email is valid and user exists", async () => {
//     (UserRepository.findUserByEmail as jest.Mock).mockResolvedValue(dummyUser);
//     const result = await UserService.getUserByEmail("test@example.com");
//     expect(result).toEqual(dummyUser);
//     expect(UserRepository.findUserByEmail).toHaveBeenCalledWith(
//       "test@example.com"
//     );
//   });

//   it("should throw error if email is invalid", async () => {
//     await expect(UserService.getUserByEmail("invalid-email")).rejects.toThrow(
//       "Invalid email format"
//     );
//   });

//   it("should throw error if user is not found", async () => {
//     (UserRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);
//     await expect(
//       UserService.getUserByEmail("missing@example.com")
//     ).rejects.toThrow("User not found");
//   });
// });
