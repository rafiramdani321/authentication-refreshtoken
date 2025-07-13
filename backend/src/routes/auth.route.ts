import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import TokenController from "../controllers/token.controller";

const routerAuth = Router();

routerAuth.post("/register", AuthController.register);
routerAuth.post("/login", AuthController.login);
routerAuth.get("/verify-email/:token", TokenController.verifyTokenEmail);
routerAuth.post(
  "/resend-email-verification",
  TokenController.sendTokenEmailVerification
);
export default routerAuth;
