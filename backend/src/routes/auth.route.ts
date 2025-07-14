import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import TokenController from "../controllers/token.controller";
import { verifyAccessToken } from "../middleware/verifyAccessToken";

const routerAuth = Router();

routerAuth.post("/register", AuthController.register);
routerAuth.post("/login", AuthController.login);
routerAuth.get("/verify-email/:token", TokenController.verifyTokenEmail);
routerAuth.post(
  "/resend-email-verification",
  TokenController.sendTokenEmailVerification
);
routerAuth.get("/me", verifyAccessToken, AuthController.getSelf);
routerAuth.post("/logout", AuthController.logout);
export default routerAuth;
