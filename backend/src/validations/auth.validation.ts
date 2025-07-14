import z from "zod";

export const registerValidation = z
  .object({
    username: z
      .string()
      .nonempty("Username is required.")
      .min(3, "Username must be at least 2 characters."),
    email: z
      .string()
      .nonempty("Email is required.")
      .email("Invalid email format."),
    password: z
      .string()
      .nonempty("Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-z]/, "Password must include at least one lowercase letter.")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
      .regex(/\d/, "Password must include at least one number.")
      .regex(/[\W_]/, "Password must include at least one special character."),
    confirmPassword: z.string().nonempty("Confirm password is required."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password do not match.",
    path: ["confirmPassword"],
  });

export const loginValidation = z.object({
  email: z.string().nonempty("Email is required."),
  password: z.string().nonempty("Password is required."),
});

export const validationResponses = (errors: any) => {
  const errorValidation = errors.error.issues.map(
    (issue: { path: string; message: string }) => ({
      field: String(issue.path[0]),
      message: issue.message,
    })
  );
  return errorValidation;
};
