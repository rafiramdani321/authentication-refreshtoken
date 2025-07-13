import jwt, { JwtPayload } from "jsonwebtoken";

export const signTokenEmailVerification = (email: string, expiresIn = "1h") => {
  return jwt.sign(
    { email },
    process.env.TOKEN_EMAIL_VERIFICATION! as jwt.Secret,
    { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] }
  );
};

export const verifyTokenEmailVerification = (token: string) => {
  return jwt.verify(
    token,
    process.env.TOKEN_EMAIL_VERIFICATION!
  ) as JwtPayload as { email: string };
};
