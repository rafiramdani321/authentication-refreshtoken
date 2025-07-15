import { createRotatingLogger } from "./create-rotating-logger";

export const cleanTokenLogger = createRotatingLogger("clean-tokens");
export const registerLogger = createRotatingLogger("register");
export const verifyTokenEmailLogger =
  createRotatingLogger("verify-email-token");
export const sendTokenVerifyLogger = createRotatingLogger(
  "send-email-verify-token"
);
export const loginLogger = createRotatingLogger("login");
export const getSelfLogger = createRotatingLogger("get-self");
export const logoutLogger = createRotatingLogger("logout");
export const refreshTokenLogger = createRotatingLogger("refresh-token");
