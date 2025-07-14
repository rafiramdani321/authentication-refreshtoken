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

export const signAccessToken = (payload: object, expiresIn: string = "15m") => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN! as jwt.Secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const signRefreshToken = (payload: object, expiresIn: string = "7d") => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN! as jwt.Secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifySignAccessToken = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN!) as JwtPayload as {
    id: string;
    email: string;
    username: string;
    roleId: string;
  };
};
